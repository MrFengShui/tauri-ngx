import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, HostListener, OnDestroy, OnInit, Renderer2, ViewChild } from "@angular/core";
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
    private container!: ElementRef<HTMLDivElement>;

    @ViewChild('canvas', { read: ElementRef, static: true })
    private canvas!: ElementRef<HTMLCanvasElement>;

    @HostListener('window:load', ['$event'])
    private hostListenWindowOnLoad(): void {
        const width: number = this.container.nativeElement.clientWidth;
        const height: number = this.container.nativeElement.clientHeight;
        this._renderer.setAttribute(this.canvas.nativeElement, 'width', `${width}`);
        this._renderer.setAttribute(this.canvas.nativeElement, 'height', `${height}`);
        this.create();
    }

    @HostListener('window:resize', ['$event'])
    private hostListenWindowResize(): void {
        const width: number = this.container.nativeElement.clientWidth;
        const height: number = this.container.nativeElement.clientHeight;
        this._renderer.setAttribute(this.canvas.nativeElement, 'width', `${width}`);
        this._renderer.setAttribute(this.canvas.nativeElement, 'height', `${height}`);
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
    private store$: Subscription | null = null;
    private route$: Subscription | null = null;
    private match$: Subscription | null = null;
    private timer$: Subscription | null = null;

    constructor(
        private _route: ActivatedRoute,
        private _router: Router,
        private _cdr: ChangeDetectorRef,
        private _element: ElementRef<HTMLElement>,
        private _renderer: Renderer2,
        private _store: Store,
        private _service: SortMatchService
    ) { }

    ngOnInit(): void {
        this.listenQueryParamsChange();
        this.listenDataListChange();
    }

    ngOnDestroy(): void {
        this.store$?.unsubscribe();
        this.route$?.unsubscribe();
        this.timer$?.unsubscribe();
        this.match$?.unsubscribe();
    }

    invokeRunEvent(): void {
        this.locked = true;
        this.timer$ = timer(0, 1000).subscribe(value => this.timer = value);
        this.match$ = this._service.match(this.name, this.source, this.order, this.radix).subscribe(value => {
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
            }
        });
    }

    invokeShuffleEvent(): void {
        this._store.dispatch(SORT_SHUFFLE_DATA_LIST_ACTION({ list: this.source }));
    }

    countSelectedOnChange(): void {
        this._store.dispatch(SORT_CREATE_DATA_LIST_ACTION({ size: this.count as number, name: this.name }));
    }

    private initHostLayout(): void {
        this._renderer.addClass(this._element.nativeElement, 'flex');
        this._renderer.addClass(this._element.nativeElement, 'flex-column');
        this._renderer.addClass(this._element.nativeElement, 'gap-3');
        this._renderer.addClass(this._element.nativeElement, 'w-full');
        this._renderer.addClass(this._element.nativeElement, 'h-full');
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

    private listenQueryParamsChange(): void {
        this.route$ = this._route.queryParams
        .pipe(map(params => params['name']))
        .subscribe(name => {
            this.name = name;
            
            this.initHostLayout();
            this.reset();
            this.create(false);

            this.timer$?.unsubscribe();
            this.match$?.unsubscribe();
        });
    }

    private listenDataListChange(): void {
        this.store$ = this._store.select(SORT_FEATURE_SELECTIOR)
            .subscribe(state => {
                this.locked = !state.completed;
                this.source = JSON.parse(JSON.stringify(state.datalist));
                this._cdr.detectChanges();

                if (this.utils) {
                    this.utils.loadData(this.source);
                    this.utils.draw();
                }
            });
    }

}
