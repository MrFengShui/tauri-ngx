import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, HostListener, Inject, LOCALE_ID, NgZone, OnDestroy, OnInit, Renderer2, ViewChild, ViewEncapsulation } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { Store } from "@ngrx/store";
import { Observer, Subscription, map, timer, filter } from "rxjs";
import { cloneDeep, now } from "lodash";
import { DES } from "crypto-js";

import { SORT_DATA_SECRET_KEY, SortMatchService, SortToolsService, SortUtilsService } from "./ngrx-store/sort.service";

import { SortDataModel, SortHeapNode, SortHeapNodeOptionModel, SortMergeWay, SortMergeWayOptionModel, SortMetadataModel, SortOrder, SortOrderOptionModel, SortRadix, SortRadixOptionModel, SortStateModel } from "./ngrx-store/sort.state";
import { SortDataVisualBuilder, SortDataVisualFactory } from "./sort.utils";
import { SORT_HEAP_NODE_OPTION_LOAD_ACTION, SORT_MERGE_WAY_OPTION_LOAD_ACTION, SORT_ORDER_OPTION_LOAD_ACTION, SORT_RADIX_OPTION_LOAD_ACTION } from "./ngrx-store/sort.action";
import { SORT_OPTION_LOAD_SELECTOR } from "./ngrx-store/sourt.selector";
import { MessageService } from "primeng/api";

@Component({
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'tauri-ngx-sort-page',
    templateUrl: 'sort.component.html',
    styleUrl: 'sort.component.scss'
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

    protected readonly TRANSLATION_MESSAGES: { [key: string | number] : string } = {
        1: $localize `:@@sort_component_ts_1:sort_component_ts_1`,
        2: $localize `:@@sort_component_ts_2:sort_component_ts_2`,
        31: $localize `:@@sort_component_ts_3_1:sort_component_ts_3_1`,
        32: $localize `:@@sort_component_ts_3_2:sort_component_ts_3_2`,
        33: $localize `:@@sort_component_ts_3_3:sort_component_ts_3_3`,
        5: $localize `:@@sort_component_ts_5:sort_component_ts_5`,
        6: $localize `:@@sort_component_ts_6:sort_component_ts_6`,
        7: $localize `:@@sort_component_ts_7:sort_component_ts_7`,
        8: $localize `:@@sort_component_ts_8:sort_component_ts_8`,
        9: $localize `:@@sort_component_ts_9:sort_component_ts_9`,
        10: $localize `:@@sort_component_ts_10:sort_component_ts_10`,
        11: $localize `:@@sort_component_ts_11:sort_component_ts_11`,
    }

    protected source: SortDataModel[] = [];

    protected orderOptions: SortOrderOptionModel[] = [];
    protected order: SortOrder = 'ascent';
    protected radixOptions: SortRadixOptionModel[] = [];
    protected radix: SortRadix = 10;
    protected mergeWayOptions: SortMergeWayOptionModel[] = [];
    protected mergeWay: SortMergeWay = 3;
    protected heapNodeOptions: SortHeapNodeOptionModel[] = [];
    protected heapNode: SortHeapNode = 3;

    protected timer: number = 0;
    protected times: number = 0;
    protected count: number = 0;
    protected step: number = 32;
    protected maxValue: number = 0;
    protected unique: boolean = true;
    protected locked: boolean = false;
    protected name: string = '';
    protected localeID: string = '';

    private builder: SortDataVisualBuilder | null = null;
    private factory: SortDataVisualFactory | null = null;

    private event$: Subscription | null = null;
    private shuffle$: Subscription | null = null;
    private create$: Subscription | null = null;
    private import$: Subscription | null = null;
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
        private _msgService: MessageService,

        @Inject(LOCALE_ID)
        private _localeID: string,

        private _toolsService: SortToolsService,
        private _utilsService: SortUtilsService,
        private _matchService: SortMatchService
    ) { }

    ngOnInit(): void {
        this.builder = new SortDataVisualBuilder();

        this._store.dispatch(SORT_ORDER_OPTION_LOAD_ACTION({ localeID: this._localeID }));
        this._store.dispatch(SORT_RADIX_OPTION_LOAD_ACTION({ localeID: this._localeID }));
        this._store.dispatch(SORT_MERGE_WAY_OPTION_LOAD_ACTION({ localeID: this._localeID }));
        this._store.dispatch(SORT_HEAP_NODE_OPTION_LOAD_ACTION({ localeID: this._localeID }));
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

    protected handleRunSortEvent(): void {
        if (this.name.includes('shear-sort') && this.count % 32 !== 0) {
            this.showAlert($localize `:@@sort_component_ts_12_1:sort_component_ts_12_1`);
        } else if ((this.name.includes('odd-even-merge-sort') || this.name.includes('bitonic-merge-sort')) && (this.count & (this.count - 1)) === 0) {
            this.showAlert($localize `:@@sort_component_ts_12_2:sort_component_ts_12_2`);
        } else {
            this.locked = true;
            this.listenStopWatchChange();
            this.listenToSortProcess();
        }
    }

    protected handleCountSelectChange(): void {
        if (this.name.length > 0) {
            this._ngZone.runOutsideAngular(() => {
                this.create$ = this._utilsService.createDataList(this.count, this.name, this.unique)
                    .subscribe(value => 
                        this._ngZone.run(() => {
                            this.loadAndDraw(value);
                            this.create$?.unsubscribe();
                        }));
            });
        }        
    }

    protected handleShuffleSourceEvent(): void {
        this._ngZone.runOutsideAngular(() => {
            this.locked = true;
            this.shuffle$ = this._utilsService.shuffleDataList(this.source)
                .subscribe(this.acceptDataAndShow());
        });
    }

    protected handleImportDataListEvent(element: HTMLInputElement): void {
        element.click();
        element.onchange = () => {
            const files = element.files;
            
            if (files && files.length > 0) {
                this._ngZone.runOutsideAngular(() => {
                    this.import$ = this._utilsService.importDataList(files.item(0), this.name).subscribe(value => 
                        this._ngZone.run(() => {
                            this.loadAndDraw(value, true);
                            this.import$?.unsubscribe();
                        })
                    );
                });
            }
        }
    }

    protected handleExportDataListEvent(element: HTMLAnchorElement): void {
        if (this.source.length > 0) {
            const metadata: SortMetadataModel = {
                unique: this.unique, length: this.source.length, 
                range: { min: -1, max: -1 }, timestamp: now(),
                data: DES.encrypt(JSON.stringify(this.source.map(item => item.value)), SORT_DATA_SECRET_KEY).toString()
            };
            [metadata.range.min, metadata.range.max] = this._toolsService.findMinMaxValue(this.source);

            element.href = window.URL.createObjectURL(new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
            element.download = `sort.data.${metadata.length}.json`;
            element.click();
        }
    }

    private initHostLayout(): void {
        this._renderer.addClass(this._element.nativeElement, 'flex');
        this._renderer.addClass(this._element.nativeElement, 'flex-column');
        this._renderer.addClass(this._element.nativeElement, 'gap-2');
        this._renderer.addClass(this._element.nativeElement, 'w-full');
        this._renderer.addClass(this._element.nativeElement, 'h-full');
    }
    
    private showAlert(message: string): void {
        this._msgService.add({
            closable: false, severity: 'error', 
            summary: $localize `:@@global_message_0_4:global_message_0_4`, detail: message
        });
    }

    private calcCanvasDimension(): Promise<{ width: number, height: number }> {
        return new Promise(resolve => {
            const task = setTimeout(() => {
                clearTimeout(task);
                const width: number = this.canvas.nativeElement.clientWidth;
                const height: number = this.canvas.nativeElement.clientHeight;
                resolve({ width, height });
            });
        });
    }

    private resetCanvasParams(): void {
        this.count = 0;
        this.timer = 0;
        this.times = 0;
        this.step = 32;
        this.unique = true;
        this.locked = false;
        this.order = 'ascent';
        this.radix = 10;
        this.mergeWay = 3;
        this.heapNode = 3;

        this.source.splice(0);
        this.factory?.erase();
        this._cdr.markForCheck();
    }

    private acceptDataAndShow(): Partial<Observer<SortStateModel | null>> {
        return {
            next: state => this._ngZone.run(() => {
                this.source = cloneDeep(state?.datalist as SortDataModel[]);
                this.times = state?.times as number;
                
                this.factory?.draw(this.source, this.source.length);

                this._cdr.markForCheck();
            }),
            error: error => this._ngZone.run(() => {console.error('sort error:', error);
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

    private loadAndDraw(value: SortDataModel[], flag: boolean = false): void {
        this.source = cloneDeep(value);
        
        if (flag) {
            this.count = this.source.length;
        }
        
        const width: number = this.builder?.getDimension().width as number;
        const height: number = this.builder?.getDimension().height as number;

        this.factory?.update(this.count, width, height);
        this.factory?.draw(this.source, this.count);

        this._cdr.markForCheck();
    }

    private async update(): Promise<void> {
        const size: { width: number, height: number } = await this.calcCanvasDimension();

        this.maxValue = Math.pow(2, Math.ceil(Math.log2(size.width)) - 1);

        this._renderer.setAttribute(this.canvas.nativeElement, 'width', `${size.width}`);
        this._renderer.setAttribute(this.canvas.nativeElement, 'height', `${size.height}`);
        
        this.resetCanvasParams();

        if (this.builder) {
            this.factory = this.builder
                .setContext(this.canvas.nativeElement)
                .setMaxValue(this.maxValue)
                .setDimension(size.width, size.height)
                .build();
        }
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
            this.match$ = this._matchService.match(this.name, this.source, this.order, this.radix, this.mergeWay, this.heapNode)
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
                        this.orderOptions = state.result as SortOrderOptionModel[];
                    }

                    if (state.action === SORT_RADIX_OPTION_LOAD_ACTION.type) {
                        this.radixOptions = state.result as SortRadixOptionModel[];
                    }

                    if (state.action === SORT_MERGE_WAY_OPTION_LOAD_ACTION.type) {
                        this.mergeWayOptions = state.result as SortMergeWayOptionModel[];
                    }

                    if (state.action === SORT_HEAP_NODE_OPTION_LOAD_ACTION.type) {
                        this.heapNodeOptions = state.result as SortHeapNodeOptionModel[];
                    }

                    this._cdr.markForCheck();
                }));
        });
    }

}
