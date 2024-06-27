import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, HostListener, NgZone, OnDestroy, OnInit, Renderer2, ViewChild } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { Store } from "@ngrx/store";
import { Observer, Subscription, map, timer, filter } from "rxjs";
import { ceil, cloneDeep } from "lodash";

import { SortMatchService, SortUtilsService } from "./ngrx-store/sort.service";

import { SortDataModel, SortMergeWay, SortMergeWayOptionModel, SortOrder, SortOrderOptionModel, SortRadix, SortRadixOptionModel, SortStateModel } from "./ngrx-store/sort.state";
import { SortCanvasUtils } from "./sort.utils";
import { SORT_MERGE_WAY_OPTION_LOAD_ACTION, SORT_ORDER_OPTION_LOAD_ACTION, SORT_RADIX_OPTION_LOAD_ACTION } from "./ngrx-store/sort.action";
import { SORT_OPTION_LOAD_SELECTOR } from "./ngrx-store/sourt.selector";

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
        await this.update();
    }

    @HostListener('window:resize', ['$event'])
    private async hostListenWindowResize(): Promise<void> {
        await this.update();
    }

    source: SortDataModel[] = [];
    orderOptions: SortOrderOptionModel[] = [];
    order: SortOrder = 'ascent';
    radixOptions: SortRadixOptionModel[] = [];
    radix: SortRadix = 10;
    mergeWayOptions: SortMergeWayOptionModel[] = [];
    mergeWay: SortMergeWay = 3;
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
    private store$: Subscription | null = null;

    constructor(
        private _route: ActivatedRoute,
        private _cdr: ChangeDetectorRef,
        private _element: ElementRef<HTMLElement>,
        private _renderer: Renderer2,
        private _ngZone: NgZone,
        private _store: Store,
        private _utilsService: SortUtilsService,
        private _matchService: SortMatchService
    ) { }

    ngOnInit(): void {
        this.utils = new SortCanvasUtils(this.canvas.nativeElement);
        this._store.dispatch(SORT_ORDER_OPTION_LOAD_ACTION());
        this._store.dispatch(SORT_RADIX_OPTION_LOAD_ACTION());
        this._store.dispatch(SORT_MERGE_WAY_OPTION_LOAD_ACTION());
    }

    ngOnDestroy(): void {
        this.event$?.unsubscribe();
        this.shuffle$?.unsubscribe();
        this.create$?.unsubscribe();
        this.route$?.unsubscribe();
        this.timer$?.unsubscribe();
        this.match$?.unsubscribe();
        this.store$?.unsubscribe();
    }

    ngAfterViewInit(): void {
        this.initHostLayout();
        this.listenQueryParamsChange();
        this.listenLoadConfigChange();
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

    private async update(): Promise<void> {
        const size: { width: number, height: number } = await this.calcCanvasDimension();
        this._renderer.setAttribute(this.canvas.nativeElement, 'width', `${size.width}`);
        this._renderer.setAttribute(this.canvas.nativeElement, 'height', `${size.height}`);
        this.maxValue = Math.pow(2, Math.ceil(Math.log2(size.width)) - 1);
        this.resetCanvasParams(size.width, size.height);
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
            this.match$ = this._matchService.match(this.name, this.source, this.order, this.radix, this.mergeWay)
                .subscribe(this.acceptDataAndShow());
        });
    }

    private listenQueryParamsChange(): void {
        this._ngZone.runOutsideAngular(() => {
            this.route$ = this._route.queryParams
                .pipe(map(params => params['name']))
                .subscribe(name => this._ngZone.run(async () => {
                    this.name = name;

                    await this.update();

                    this.timer$?.unsubscribe();
                    this.match$?.unsubscribe();
                }));
        });
    }

    private listenLoadConfigChange(): void {
        this._ngZone.runOutsideAngular(() => {
            this.store$ = this._store.select(SORT_OPTION_LOAD_SELECTOR)
                .pipe(filter(state => state.action.length > 0))
                .subscribe(state => this._ngZone.run(() => {
                    if (state.action === SORT_ORDER_OPTION_LOAD_ACTION.type) {
                        this.orderOptions = state.value as SortOrderOptionModel[];
                    }

                    if (state.action === SORT_RADIX_OPTION_LOAD_ACTION.type) {
                        this.radixOptions = state.value as SortRadixOptionModel[];
                    }

                    if (state.action === SORT_MERGE_WAY_OPTION_LOAD_ACTION.type) {
                        this.mergeWayOptions = state.value as SortMergeWayOptionModel[];
                    }

                    this._cdr.markForCheck();
                }));
        });
    }

}
