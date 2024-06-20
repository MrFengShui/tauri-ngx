import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, HostListener, NgZone, OnDestroy, OnInit, Renderer2, ViewChild } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { Observer, Subscription, map, timer } from "rxjs";
import { cloneDeep } from "lodash";

import { SortMatchService, SortUtilsService } from "./service/sort.service";

import { SortDataModel, SortOrder, SortRadix, SortRadixBaseModel, SortStateModel } from "./ngrx-store/sort.state";
import { SortCanvasUtils } from "./sort.utils";

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'app-algo-sort',
    templateUrl: './sort.component.html'
})
export class AlgorithmSortPageComponent implements OnInit, OnDestroy, AfterViewInit {

    @ViewChild('canvas', { read: ElementRef, static: true })
    private canvas!: ElementRef<HTMLCanvasElement>;

    @HostListener('window:load', ['$event'])
    private async hostListenWindowOnLoad(): Promise<void> {
        const size: { width: number, height: number } = await this.calcCanvasDimension();
        this._renderer.setAttribute(this.canvas.nativeElement, 'width', `${size.width}`);
        this._renderer.setAttribute(this.canvas.nativeElement, 'height', `${size.height}`);
        this.maxValue = this.matchMaxValue(size.width);
        this.resetCanvasParams(size.width, size.height);
    }

    @HostListener('window:resize', ['$event'])
    private async hostListenWindowResize(): Promise<void> {
        const size: { width: number, height: number } = await this.calcCanvasDimension();
        this._renderer.setAttribute(this.canvas.nativeElement, 'width', `${size.width}`);
        this._renderer.setAttribute(this.canvas.nativeElement, 'height', `${size.height}`);
        this.maxValue = this.matchMaxValue(size.width);
        this.resetCanvasParams(size.width, size.height);
    }

    source: SortDataModel[] = [];
    orderOptions: Array<{label: string, value: SortOrder}> = [
        { label: '升序', value: 'ascent' },
        { label: '降序', value: 'descent' }
    ];
    order: SortOrder = 'ascent';
    radixOptions: Array<SortRadixBaseModel> = [
        { label: '二进制', value: 2 },
        { label: '八进制', value: 8 },
        { label: '十进制', value: 10 },
        { label: '十六进制', value: 16 }
    ];
    radix: SortRadix = 10;
    timer: number = 0;
    times: number = 0;
    count: number = 0;
    maxValue: number = 1024;
    locked: boolean = false;
    name: string = '';

    private utils: SortCanvasUtils | null = null;
    private event$: Subscription | null = null;
    private shuffle$: Subscription | null = null;
    private create$: Subscription | null = null;
    private route$: Subscription | null = null;
    private match$: Subscription | null = null;
    private timer$: Subscription | null = null;

    constructor(
        private _route: ActivatedRoute,
        private _cdr: ChangeDetectorRef,
        private _element: ElementRef<HTMLElement>,
        private _renderer: Renderer2,
        private _ngZone: NgZone,
        private _utilsService: SortUtilsService,
        private _matchService: SortMatchService
    ) { }

    ngOnInit(): void {
        this.utils = new SortCanvasUtils(this.canvas.nativeElement);
    }

    ngOnDestroy(): void {
        this.event$?.unsubscribe();
        this.shuffle$?.unsubscribe();
        this.create$?.unsubscribe();
        this.route$?.unsubscribe();
        this.timer$?.unsubscribe();
        this.match$?.unsubscribe();
    }

    ngAfterViewInit(): void {
        this.initHostLayout();
        this.listenQueryParamsChange();
    }

    handleRunSortEvent(): void {
        this.locked = true;
        this.listenStopWatchChange();
        this.listenToSortProcess();
    }

    handleCountSelectChange(): void {
        if (this.name.length > 0) {
            this._ngZone.runOutsideAngular(() => {
                this.create$ = this._utilsService.createDataList(this.count, this.name).subscribe(value => 
                    this._ngZone.run(() => {
                        this.source = cloneDeep(value);
                        
                        if (this.utils) {
                            this.utils.loadData(this.source);
                            this.utils.draw(this.count);
                        }

                        this._cdr.detectChanges();
                        this.create$?.unsubscribe();
                    }));
            });
        }        
    }

    handleShuffleSourceEvent(): void {
        this._ngZone.runOutsideAngular(() => {
            this.locked = true;
            this.shuffle$ = this._utilsService.shuffleDataList(this.source)
                .subscribe(this.acceptDataAndShow());
        });
    }

    private initHostLayout(): void {
        this._renderer.addClass(this._element.nativeElement, 'flex');
        this._renderer.addClass(this._element.nativeElement, 'flex-column');
        this._renderer.addClass(this._element.nativeElement, 'gap-3');
        this._renderer.addClass(this._element.nativeElement, 'w-full');
        this._renderer.addClass(this._element.nativeElement, 'h-full');
    }

    private calcCanvasDimension(): Promise<{ width: number, height: number }> {
        return new Promise(resolve => {
            let task = setTimeout(() => {
                clearTimeout(task);
                const width: number = this.canvas.nativeElement.clientWidth;
                const height: number = this.canvas.nativeElement.clientHeight;
                resolve({ width, height });
            });
        });
    }

    private resetCanvasParams(width: number, height: number): void {
        this.count = 0;
        this.timer = 0;
        this.times = 0;
        this.locked = false;
        this.order = 'ascent';
        this.radix = 10;

        this.source.splice(0);

        if (this.utils) {
            this.utils.create(width, height);
            this.utils.clear();
        }
        
        this._cdr.detectChanges();
    }

    private matchMaxValue(size: number): number {
        let count: number = 0;

        while (size > 1) {
            size >>= 1;
            count += 1;
        }

        return Math.pow(2, count - 1);
    }

    private acceptDataAndShow(): Partial<Observer<SortStateModel | null>> {
        return {
            next: state => this._ngZone.run(() => {
                this.source = cloneDeep(state?.datalist as SortDataModel[]);
                this.times = state?.times as number;
                
                if (this.utils) {
                    this.utils.loadData(this.source);
                    this.utils.draw(this.count);
                }

                this._cdr.markForCheck();
            }),
            error: error => this._ngZone.run(() => {
                this.locked = false;
                this._cdr.detectChanges();
                this.shuffle$?.unsubscribe();
            }),
            complete: () => this._ngZone.run(() => {
                this.locked = false;
                this._cdr.markForCheck();
                this.shuffle$?.unsubscribe();
            })
        };
    }

    private listenStopWatchChange(): void {
        this._ngZone.runOutsideAngular(() => {
            this.timer$ = timer(0, 1000).subscribe(value => 
                this._ngZone.run(() => {
                    if (this.locked) {
                        this.timer = value;
                        this._cdr.markForCheck();
                    } else {
                        this.timer$?.unsubscribe();
                    }
                }));
        });
    }

    private listenToSortProcess(): void {
        this._ngZone.runOutsideAngular(() => {
            this.locked = true;
            this.match$ = this._matchService.match(this.name, this.source, this.order, this.radix)
                .subscribe(this.acceptDataAndShow());
        });
    }

    private listenQueryParamsChange(): void {
        this._ngZone.runOutsideAngular(() => {
            this.route$ = this._route.queryParams
                .pipe(map(params => params['name']))
                .subscribe(name => this._ngZone.run(async () => {
                    this.name = name;
                    
                    const size: { width: number, height: number } = await this.calcCanvasDimension();
                    this._renderer.setAttribute(this.canvas.nativeElement, 'width', `${size.width}`);
                    this._renderer.setAttribute(this.canvas.nativeElement, 'height', `${size.height}`);
                    this.maxValue = this.matchMaxValue(size.width);
                    this.resetCanvasParams(size.width, size.height);
        
                    this.timer$?.unsubscribe();
                    this.match$?.unsubscribe();
                }));
        });
    }

}
