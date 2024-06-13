import { ChangeDetectorRef, Component, ElementRef, HostListener, NgZone, OnDestroy, OnInit, Renderer2, ViewChild } from "@angular/core";
import { ActivatedRoute, NavigationEnd, Router } from "@angular/router";
import { Store } from "@ngrx/store";
import { Subscription, filter, map, timer } from "rxjs";

import { SortMatchService } from "./service/sort.service";

import { SortDataModel, SortOrder, SortRadix, SortRadixBaseModel } from "./ngrx-store/sort.state";
import { SortCanvasUtils } from "./sort.utils";
import { SORT_CREATE_DATA_LIST_ACTION, SORT_SHUFFLE_DATA_LIST_ACTION } from "./ngrx-store/sort.action";
import { SORT_FEATURE_SELECTIOR } from "./ngrx-store/sourt.selector";

@Component({
    selector: 'app-algo-sort',
    templateUrl: './sort.component.html'
})
export class AlgorithmSortPageComponent implements OnInit, OnDestroy {

    @ViewChild('container', { read: ElementRef, static: true })
    private container!: ElementRef<HTMLCanvasElement>;

    @ViewChild('canvas', { read: ElementRef, static: true })
    private canvas!: ElementRef<HTMLCanvasElement>;

    @HostListener('window:load', ['$event'])
    private hostListenWindowOnLoad(): void {
        this.initCanvasSize();
        this.create();
    }

    @HostListener('window:resize', ['$event'])
    private hostListenWindowResize(): void {
        this.initCanvasSize();
        this.reset();
        this.create();
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
    count: number | undefined = 0;
    locked: boolean = false;
    name: string = '';

    private utils: SortCanvasUtils | null = null;
    private event$: Subscription | null = null;
    private store$: Subscription | null = null;
    private route$: Subscription | null = null;
    private match$: Subscription | null = null;
    private timer$: Subscription | null = null;

    constructor(
        private _route: ActivatedRoute,
        private _cdr: ChangeDetectorRef,
        private _element: ElementRef<HTMLElement>,
        private _renderer: Renderer2,
        private _ngZone: NgZone,
        private _store: Store,
        private _service: SortMatchService
    ) { }

    ngOnInit(): void {
        this.initHostLayout();
        this.listenQueryParamsChange();
        this.listenDataListChange();
    }

    ngOnDestroy(): void {
        this.event$?.unsubscribe();
        this.store$?.unsubscribe();
        this.route$?.unsubscribe();
        this.timer$?.unsubscribe();
        this.match$?.unsubscribe();
    }

    invokeRunEvent(): void {
        this.locked = true;
        this.listenToStopWatch();
        this.listenToSortProcess();
    }

    invokeShuffleEvent(): void {
        this._store.dispatch(SORT_SHUFFLE_DATA_LIST_ACTION({ list: this.source }));
    }

    countSelectedOnChange(): void {
        if (this.name) {
            this._store.dispatch(SORT_CREATE_DATA_LIST_ACTION({ size: this.count as number, name: this.name }));
            return;
        }        
    }

    private initHostLayout(): void {
        this._renderer.addClass(this._element.nativeElement, 'flex');
        this._renderer.addClass(this._element.nativeElement, 'flex-column');
        this._renderer.addClass(this._element.nativeElement, 'gap-3');
        this._renderer.addClass(this._element.nativeElement, 'w-full');
        this._renderer.addClass(this._element.nativeElement, 'h-full');
    }

    private initCanvasSize(): void {
        this._renderer.setAttribute(this.canvas.nativeElement, 'width', `${this.container.nativeElement.clientWidth}`);
        this._renderer.setAttribute(this.canvas.nativeElement, 'height', `${this.container.nativeElement.clientHeight}`);
    }

    private create(flag: boolean = true): void {
        if (flag) {
            this.utils = new SortCanvasUtils(this.canvas.nativeElement);
        }
        
        this.utils?.clear();
    }

    private reset(): void {
        this.count = 0;
        this.timer = 0;
        this.times = 0;
        this.locked = false;
        this.order = 'ascent';
        this.radix = 10;

        this.source.splice(0);
    }

    private listenToStopWatch(): void {
        this._ngZone.runOutsideAngular(() => {
            this.timer$ = timer(0, 1000).subscribe(value => 
                this._ngZone.run(() => {
                    this.timer = value;
                    this._cdr.detectChanges();
                }));
        });
    }

    private listenToSortProcess(): void {
        this._ngZone.runOutsideAngular(() => {
            this.match$ = this._service.match(this.name, this.source, this.order, this.radix)
                .subscribe(value => this._ngZone.run(() => {
                    if (value) {
                        this.locked = !value.completed;
                        this.times = value.times as number;
                        this.source = value.datalist;
        
                        if (this.utils) {
                            this.utils.loadData(this.source);
                            this.utils.draw();
                        }
        
                        if (value.completed) {
                            this.timer$?.unsubscribe();
                            this.match$?.unsubscribe();
                        }

                        this._cdr.detectChanges();
                    }
                }));
        });
    }

    private listenQueryParamsChange(): void {
        this._ngZone.runOutsideAngular(() => {
            this.route$ = this._route.queryParams
                .pipe(map(params => params['name']))
                .subscribe(name => this._ngZone.run(() => {
                    this.name = name;
                    
                    this.initCanvasSize();
                    this.reset();
                    this.create(false);
        
                    this.timer$?.unsubscribe();
                    this.match$?.unsubscribe();
                }));
        });
    }

    private listenDataListChange(): void {
        this._ngZone.runOutsideAngular(() => {
            this.store$ = this._store.select(SORT_FEATURE_SELECTIOR)
            .subscribe(state => this._ngZone.run(() => {
                this.locked = !state.completed;
                this.source = JSON.parse(JSON.stringify(state.datalist));

                if (this.utils) {
                    this.utils.loadData(this.source);
                    this.utils.draw();
                }
            }));
        });
    }

}
