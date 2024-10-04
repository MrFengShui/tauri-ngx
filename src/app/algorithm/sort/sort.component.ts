import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, HostListener, Inject, LOCALE_ID, NgZone, OnDestroy, OnInit, Renderer2, ViewChild, ViewEncapsulation } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { Store } from "@ngrx/store";
import { CheckboxChangeEvent } from "primeng/checkbox";
import { MessageService, TooltipOptions } from "primeng/api";
import { Observer, Subscription, map, timer, filter } from "rxjs";
import { HmacSHA256 } from "crypto-js";
import { ceil, cloneDeep, max } from "lodash";

import { SortMatchService, SortDataService } from "./ngrx-store/sort.service";

import { SortDataExportModel, SortDataImportModel, SortDataModel, SortHeapNode, SortMergeWay, SortName, SortOptionModel, SortOrder, SortRadix, SortStateModel, SortType } from "./ngrx-store/sort.state";
import { SORT_CREATE_DATA_ACTION, SORT_EXPORT_DATA_ACTION, SORT_HEAP_NODE_OPTION_LOAD_ACTION, SORT_IMPORT_DATA_ACTION, SORT_MERGE_WAY_OPTION_LOAD_ACTION, SORT_ORDER_OPTION_LOAD_ACTION, SORT_RADIX_OPTION_LOAD_ACTION } from "./ngrx-store/sort.action";
import { SORT_OPTION_LOAD_SELECTOR } from "./ngrx-store/sourt.selector";

import { AbstractSortDataPublisher, ConcreteSortDataPublisher, ConcreteSortDataSubscriber, SortCanvasReferenceInfo } from "./pattern/sort-draw.pattern";
import { calcGridRowCol, CanvasDimension } from "../../public/global.utils";

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

    @ViewChild('anchor', { read: ElementRef, static: true })
    private anchor!: ElementRef<HTMLAnchorElement>;

    @ViewChild('input', { read: ElementRef, static: true })
    private input!: ElementRef<HTMLInputElement>;

    @HostListener('window:load', ['$event'])
    private async hostListenWindowOnLoad(): Promise<void> {
        await this.initialize();
    }

    @HostListener('window:resize', ['$event'])
    private async hostListenWindowResize(): Promise<void> {
        await this.initialize();
    }

    @HostListener('document:keydown', ['$event'])
    private hostListenKeyDownEvent(event: KeyboardEvent): void {
        if (!this.locked) { console.debug('keydown:', event);
            this.keyinfo = { 
                ...this.keyinfo, 
                ctrlKey: event.ctrlKey, shiftKey: event.shiftKey, altKey: event.altKey, 
                code: event.code 
            };
        }
    }

    @HostListener('document:keyup', [])
    private hostListenKeyUpEvent(): void { console.debug('keyup:', this.keyinfo);
        if (this.keyinfo.ctrlKey && this.keyinfo.altKey && this.keyinfo.shiftKey && this.keyinfo.code === 'KeyI') {
            this.handleImportDataListEvent();
        }

        if (this.keyinfo.ctrlKey && this.keyinfo.altKey && this.keyinfo.shiftKey && this.keyinfo.code === 'KeyE') {
            this.handleExportDataListEvent();
        }
        
        if (this.keyinfo.ctrlKey && this.keyinfo.altKey && (this.keyinfo.code === 'ArrowUp' || this.keyinfo.code === 'ArrowRight')) {
            this.changeTotalValue(true);
        }
        
        if (this.keyinfo.ctrlKey && this.keyinfo.altKey && (this.keyinfo.code === 'ArrowDown' || this.keyinfo.code === 'ArrowLeft')) {
            this.changeTotalValue(false);
        }
        
        if (this.keyinfo.ctrlKey && this.keyinfo.altKey && this.keyinfo.code === 'KeyU') { 
            this.changeUniquValue();
        }

        if (this.keyinfo.ctrlKey && this.keyinfo.altKey && this.keyinfo.code === 'KeyS') { 
            this.handleShuffleEvent();
        }
        
        if (this.keyinfo.ctrlKey && this.keyinfo.altKey && this.keyinfo.code === 'Enter') {
            this.handleRunSortEvent();
        }

        delete this.keyinfo['ctrlKey'];
        delete this.keyinfo['shiftKey'];
        delete this.keyinfo['altKey'];
        delete this.keyinfo['code'];
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
    protected readonly TOOLTIP_OTPIONS_UNIQUE: TooltipOptions = {
        tooltipLabel: 'Ctrl + Shift + U', tooltipPosition: 'top', tooltipStyleClass: 'absolute',
        showDelay: 1000, hideDelay: 1000, positionTop: -4
    };
    protected readonly TOOLTIP_OTPIONS_SHUFFLE: TooltipOptions = {
        tooltipLabel: 'Ctrl + Shift + S', tooltipPosition: 'top', tooltipStyleClass: 'absolute',
        showDelay: 1000, hideDelay: 1000, positionTop: -4
    };
    protected readonly TOOLTIP_OTPIONS_RUN: TooltipOptions = {
        tooltipLabel: 'Ctrl + Shift + Enter', tooltipPosition: 'top', tooltipStyleClass: 'absolute',
        showDelay: 1000, hideDelay: 1000, positionTop: -4
    };
    protected readonly TOOLTIP_OTPIONS_IMPORT: TooltipOptions = {
        tooltipLabel: 'Ctrl + Shift + Alt + I', tooltipPosition: 'top', tooltipStyleClass: 'absolute',
        showDelay: 1000, hideDelay: 1000, positionTop: -4
    };
    protected readonly TOOLTIP_OTPIONS_EXPORT: TooltipOptions = {
        tooltipLabel: 'Ctrl + Shift + Alt + E', tooltipPosition: 'top', tooltipStyleClass: 'absolute',
        showDelay: 1000, hideDelay: 1000, positionTop: -4
    };

    protected source: SortDataModel[] = [];

    protected orderOptions: SortOptionModel[] = [];
    protected order: SortOrder = 'ascent';
    protected radixOptions: SortOptionModel[] = [];
    protected radix: SortRadix = 10;
    protected mergeWayOptions: SortOptionModel[] = [];
    protected mergeWay: SortMergeWay = 3;
    protected heapNodeOptions: SortOptionModel[] = [];
    protected heapNode: SortHeapNode = 3;

    protected timer: number = 0;
    protected times: number = 0;
    protected total: number = 0;
    protected step: number = 32;
    protected threshold: number = 0;
    protected unique: boolean = true;
    protected locked: boolean = false;
    protected name: SortName = undefined;
    protected localeID: string = '';

    private canvasPublisher: AbstractSortDataPublisher | null = null;

    private keyinfo: { ctrlKey?: boolean, shiftKey?: boolean, altKey?: boolean, code?: string } = {};
    private info: SortCanvasReferenceInfo = { total: -1, pivot: -1 };
    private size: CanvasDimension = { width: -1, height: -1 };
    private type: SortType = undefined;

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
        private _msgService: MessageService,

        @Inject(LOCALE_ID)
        private _localeID: string,

        private _utilsService: SortDataService,
        private _matchService: SortMatchService
    ) { }

    ngOnInit(): void {
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

        this._matchService.clear();
    }

    ngAfterViewInit(): void {
        this.initHostLayout();
        this.initPatterns();
        this.listenQueryParamsChange();
        this.listenLoadConfigChange();
    }

    protected listenCountSelectChange(): void {
        if (this.name && this.name.length > 0) {
            this._ngZone.runOutsideAngular(() => {
                if (this.total > 0 && this.total < 32) {
                    this.showAlert($localize `:@@sort_component_ts_12_2:sort_component_ts_12_2`);
                } else {
                    this.create$ = this._utilsService.createDataList(this.total, this.unique)
                    .subscribe(value => 
                        this._ngZone.run(() => {
                            this.loadAndDraw(value);
                            this.create$?.unsubscribe();
                        }));
                }
            });
        }        
    }

    protected listenCountInputChange(event: KeyboardEvent): void {
        if (event.key === 'Enter') (event.target as HTMLInputElement).blur();
    }

    protected listenCountBlurChange(): void {
        this.total = Math.max(this.total, 0);
        this.total = Math.min(this.total, this.threshold);
        this.listenCountSelectChange();
    }

    protected handleRunSortEvent(): void {
        if (!this.name) throw new Error();

        if (this.name.includes('shear-sort') && calcGridRowCol(this.total).every(item => item === -1)) {
            this.showAlert($localize `:@@sort_component_ts_12_3:sort_component_ts_12_3`);
        } else if (this.binaryForbidden(this.name) && (this.total & (this.total - 1)) !== 0) {
            this.showAlert($localize `:@@sort_component_ts_12_2:sort_component_ts_12_2`);
        } else {
            this.locked = true;
            this.listenStopWatchChange();
            this.listenToSortProcess();
        }
    }

    protected handleShuffleEvent(): void {
        this._ngZone.runOutsideAngular(() => {
            this.locked = true;
            this.shuffle$ = this._matchService.shuffle(this.source)
                .subscribe(this.acceptDataAndDraw());
        });
    }

    protected handleImportDataListEvent(): void {
        const element: HTMLInputElement = this.input.nativeElement;
        element.click();
        element.onchange = () => {
            const files: FileList | null = element.files;
            
            if (files && files.length > 0) {
                this._store.dispatch(SORT_IMPORT_DATA_ACTION({ file: files.item(0) as File }));
            }
        }
    }

    protected handleExportDataListEvent(): void {
        if (this.source.length > 0 && this.total > 0 && this.source.length === this.total) {
            this._store.dispatch(SORT_EXPORT_DATA_ACTION({ data: this.source.map(item => item.value) }));
        }
    }

    protected isRadixSort(name: SortName): boolean {
        return name ? name.includes('radix-sort') : false;
    }

    protected binaryForbidden(name: SortName): boolean {
        return name ? (name.includes('batcher-merge-sort') || name.includes('bitonic-merge-sort') || name.includes('pairwise-merge-sort')) : false;
    }

    protected squareForbidden(name: SortName): boolean {
        return name === 'insert-shear-sort' || name === 'select-shear-sort';
    }

    protected uniqueForbidden(name: SortName): boolean {
        return name ? (name.includes('sleep-sort') || name.includes('cycle-sort') || name.includes('guess-sort')) : false;
    }

    private initHostLayout(): void {
        this._renderer.addClass(this._element.nativeElement, 'flex');
        this._renderer.addClass(this._element.nativeElement, 'flex-column');
        this._renderer.addClass(this._element.nativeElement, 'gap-2');
        this._renderer.addClass(this._element.nativeElement, 'w-full');
        this._renderer.addClass(this._element.nativeElement, 'h-full');
    }

    private initPatterns(): void {
        this.canvasPublisher = new ConcreteSortDataPublisher();
        this.canvasPublisher.subscribe(new ConcreteSortDataSubscriber(this.canvas.nativeElement.getContext('2d')));
    }

    private changeTotalValue(flag: boolean): void {
        if (!this.locked) {
            this.total = flag ? Math.min(this.total + this.step, this.threshold) : Math.max(this.total - this.step, 0);
            this.listenCountSelectChange();
        } 
    }

    private changeUniquValue(): void {
        if (!this.locked) {
            this.unique = !this.unique;
            this.listenCountSelectChange();
        }
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

    private async initialize(): Promise<void> {
        this.size = await this.calcCanvasDimension();

        this.threshold = Math.pow(2, ceil(Math.log2(this.size.width), 0) - 1);

        this._renderer.setAttribute(this.canvas.nativeElement, 'width', `${this.size.width}`);
        this._renderer.setAttribute(this.canvas.nativeElement, 'height', `${this.size.height}`);
        
        this.resetParams();
        
        this.info = { 
            ...this.info, 
            total: this.total, 
            pivot: this.total === 0 ? 0 : Math.max(...this.source.map(item => item.value)) 
        };

        this.canvasPublisher?.notify(this.source, this.info, this.size);
        this._cdr.markForCheck();
    }

    private resetParams(): void {
        this.total = 0;
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
    }

    private acceptDataAndDraw(): Partial<Observer<SortStateModel | null>> {
        return {
            next: state => this._ngZone.run(() => {
                this.source = cloneDeep(state?.datalist as SortDataModel[]);
                this.times = state?.times as number;
                
                this.info = { ...this.info, total: Math.max(this.total, this.source.length) };

                this.canvasPublisher?.notify(this.source, this.info, this.size);
                this._cdr.markForCheck();
            }),
            error: error => this._ngZone.run(() => {console.error('sort error:', error);
                this.locked = false;
                this._cdr.markForCheck();
                this.shuffle$?.unsubscribe();
            }),
            complete: () => this._ngZone.run(() => {
                this.locked = false;
                this._cdr.markForCheck();
                this.shuffle$?.unsubscribe();
            })
        };
    }

    private loadAndDraw(value: SortDataModel[]): void {
        this.source = cloneDeep(value);
        this.total = this.source.length;
        
        this.info = { ...this.info, total: this.total, pivot: max(this.source.map(item => item.value)) as number };

        this.canvasPublisher?.notify(this.source, this.info, this.size);
        this._cdr.markForCheck();
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
            this.match$ = this._matchService.match(this.name, this.type, this.source, this.order, { radix: this.radix, mergeWay: this.mergeWay, heapNode: this.heapNode })
                .subscribe(this.acceptDataAndDraw());
        });
    }

    private listenQueryParamsChange(): void {
        this._ngZone.runOutsideAngular(() => {
            this.route$ = this._route.queryParams
                .pipe(map(params => ({ name: params['name'], type: params['type'] })))
                .subscribe(param => this._ngZone.run(async () => {
                    this.name = window.atob(param.name) as SortName;
                    this.type = Number.parseInt(window.atob(param.type)) as SortType;

                    await this.initialize();

                    this.timer$?.unsubscribe();
                    this.match$?.unsubscribe();
                }));
        });
    }

    private listenLoadConfigChange(): void {
        this._ngZone.runOutsideAngular(() => {
            this.store$ = this._store.select(SORT_OPTION_LOAD_SELECTOR)
                .pipe(filter(state => state.action.length > 0))
                .subscribe(state => 
                    this._ngZone.run(() => {
                        if (state.action === SORT_ORDER_OPTION_LOAD_ACTION.type) {
                            this.orderOptions = state.result as SortOptionModel[];
                        }

                        if (state.action === SORT_RADIX_OPTION_LOAD_ACTION.type) {
                            this.radixOptions = state.result as SortOptionModel[];
                        }

                        if (state.action === SORT_MERGE_WAY_OPTION_LOAD_ACTION.type) {
                            this.mergeWayOptions = state.result as SortOptionModel[];
                        }

                        if (state.action === SORT_HEAP_NODE_OPTION_LOAD_ACTION.type) {
                            this.heapNodeOptions = state.result as SortOptionModel[];
                        }

                        if (state.action === SORT_CREATE_DATA_ACTION.type) {
                            this.source = state.result as SortDataModel[];
                        }

                        if (state.action === SORT_IMPORT_DATA_ACTION.type) {
                            const model: SortDataImportModel = state.result as SortDataImportModel;
                            this.unique = model.unique;
                            this.loadAndDraw(model.source);
                        }

                        if (state.action === SORT_EXPORT_DATA_ACTION.type) {
                            const model: SortDataExportModel = state.result as SortDataExportModel;
                            const element: HTMLAnchorElement = this.anchor.nativeElement;
                            const name: string = `sort.data.${model.timestamp}`;
                            element.href = window.URL.createObjectURL(new Blob([JSON.stringify(model)], { type: 'application/json' }));
                            element.download = `${HmacSHA256(name, window.btoa(name))}.json`;
                            element.click();
                        } 

                        this._cdr.markForCheck();
                    }));
        });
    }

}
