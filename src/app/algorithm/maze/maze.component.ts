import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, HostListener, Inject, LOCALE_ID, NgZone, OnDestroy, OnInit, Renderer2, ViewChild } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { Store } from "@ngrx/store";
import { combineLatest, map, Observable, Observer, Subscription, timer } from "rxjs";
import { cloneDeep } from "lodash";

import { MazeCellModel } from "./ngrx-store/maze.state";
import { MazeMatchService, MazeUtilsService } from "./ngrx-store/maze.service";
import { MazeCanvasUtils } from "./maze.utils";
import { MazeActionType, MazeActionmName } from "./ngrx-store/maze.state";
import { ConfirmationService } from "primeng/api";

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'tauri-ngx-maze-page',
    templateUrl: 'maze.component.html'
})
export class AlgorithmMazePageComponent implements OnInit, OnDestroy, AfterViewInit {

    @ViewChild('canvas', { read: ElementRef, static: true })
    private canvas!: ElementRef<HTMLCanvasElement>;

    @HostListener('window:load', ['$event'])
    private async hostListenWindowOnLoad(): Promise<void> {
        await this.update();
    }

    @HostListener('window:resize', ['$event'])
    private async hostListenWindowResize(): Promise<void> {
        this.ngOnDestroy();
        await this.update();
    }

    locked: boolean = false;

    protected readonly TRANSLATION_MESSAGES: { [key: string | number] : string } = {
        111: $localize `:@@global_message_0_2:global_message_0_2`,
        112: $localize `:@@global_message_1_1:global_message_1_1`,
        113: $localize `:@@global_message_0_8:global_message_0_8`,
        114: $localize `:@@global_message_0_9:global_message_0_9`,
    }

    protected rows: number = 0;
    protected maxRows: number = 0;
    protected cols: number = 0;
    protected maxCols: number = 0;
    protected timer: number = 0;

    private utils: MazeCanvasUtils | null = null;
    private source: MazeCellModel[][] = Array.from([]);
    private type: MazeActionType = undefined;
    private name: MazeActionmName = undefined;
    private lineWidth: number = 1;

    private create$: Subscription | null = null;
    private match$: Subscription | null = null;
    private route$: Subscription | null = null;
    private timer$: Subscription | null = null;

    constructor(
        private _route: ActivatedRoute,
        private _cdr: ChangeDetectorRef,
        private _element: ElementRef<HTMLElement>,
        private _renderer: Renderer2,
        private _ngZone: NgZone,
        private _store: Store,
        private _service: ConfirmationService,

        @Inject(LOCALE_ID)
        private _localeID: string,

        private _utilsService: MazeUtilsService,
        private _matchService: MazeMatchService
    ) { }

    ngOnInit(): void {
        this.utils = new MazeCanvasUtils(this.canvas.nativeElement);
    }

    ngOnDestroy(): void {
        this.create$?.unsubscribe();
        this.match$?.unsubscribe();
        this.route$?.unsubscribe();
        this.timer$?.unsubscribe();
    }

    ngAfterViewInit(): void {
        this.initHostLayout();
        this.listenParamsAndQueryParamsChange();
        // this.listenLoadConfigChange();
    }

    showConfirmDialog(): Observable<boolean> {
        return new Observable(subscriber => {
            this._service.confirm({
                icon: 'pi pi-exclamation-triangle', 
                header: this.TRANSLATION_MESSAGES[111], message: this.TRANSLATION_MESSAGES[112],
                acceptIcon: 'none', rejectIcon: 'none',
                acceptButtonStyleClass: 'p-button-success p-button-raised', rejectButtonStyleClass: 'p-button-danger p-button-raised',
                acceptLabel: this.TRANSLATION_MESSAGES[113], rejectLabel: this.TRANSLATION_MESSAGES[114],
                accept: () => {
                    subscriber.next(true);
                    subscriber.complete();
                },
                reject: () => {
                    subscriber.next(false);
                    subscriber.complete();
                }
            });
        });
    }

    protected handleGridRowColumnSelectChange(): void {
        if (this.name) {
            this._ngZone.runOutsideAngular(() => {
                this.lineWidth = this.matchLineWidth(this.rows, this.cols);
                this.create$ = this._utilsService.createDataGrid(this.rows, this.cols)
                    .subscribe(this.acceptDataAndShow());
            });
        }   
    }

    protected handleExportDataEvent(): void {
        const element: HTMLAnchorElement = this._renderer.createElement('a');
        element.download = 'maze.data.json';

        const blob = new Blob([JSON.stringify(this.source)], { type: 'application/json' });
        element.href = window.URL.createObjectURL(blob);

        element.click();
    }

    protected handleResetEvent(): void {
        this._ngZone.runOutsideAngular(() => 
            this._utilsService.resetDataGrid(this.source, this.rows, this.cols)
                .subscribe(this.acceptDataAndShow()));
    }

    protected handleRunTaskEvent(): void {
        this.listenStopWatchChange();
        this.listenToMazeProcess();
    }

    private initHostLayout(): void {
        this._renderer.addClass(this._element.nativeElement, 'flex');
        this._renderer.addClass(this._element.nativeElement, 'flex-column');
        this._renderer.addClass(this._element.nativeElement, 'gap-2');
        this._renderer.addClass(this._element.nativeElement, 'w-full');
        this._renderer.addClass(this._element.nativeElement, 'h-full');
    }

    private matchLineWidth(rows: number, cols: number): number {
        const select: number = rows * cols, threshold: number = this.maxRows * this.maxCols;

        if (0 < select && select <= Math.floor(threshold * 0.0625)) {
            return 8;
        } else if (Math.floor(threshold * 0.0625) < select && select <= Math.floor(threshold * 0.25)) {
            return 4;
        } else if (Math.floor(threshold * 0.25) < select && select <= Math.floor(threshold * 0.5625)) {
            return 2;
        } else {
            return 1;
        }
    }

    private resetCanvasParams(width: number, height: number): void {
        this.rows = 0;
        this.cols = 0;
        this.timer = 0;
        this.locked = false;

        if (this.utils) {
            this.utils.create(width, height);
            this.utils.clear();
        }
        
        this._cdr.markForCheck();
    }

    private async update(): Promise<void> {
        const size: { width: number, height: number } = await this.fetchCanvasDimension();

        this.maxCols = Math.floor(size.width * 0.1);
        this.maxRows = Math.floor(size.height * 0.1);

        this._renderer.setAttribute(this.canvas.nativeElement, 'width', `${size.width}`);
        this._renderer.setAttribute(this.canvas.nativeElement, 'height', `${size.height}`);
        this.resetCanvasParams(size.width, size.height);
    }

    private fetchCanvasDimension(): Promise<{ width: number, height: number }> {
        return new Promise(resolve => {
            let task = setTimeout(() => {
                clearTimeout(task);
                const width: number = this.canvas.nativeElement.clientWidth;
                const height: number = this.canvas.nativeElement.clientHeight;
                resolve({ width, height });
            });
        });
    }

    private acceptDataAndShow(): Partial<Observer<MazeCellModel[][] | null>> {
        return {
            next: state => this._ngZone.run(() => {
                this.source = cloneDeep(state as MazeCellModel[][]);

                if (this.utils) {
                    this.utils.loadData(this.source);
                    this.utils.draw(this.rows, this.cols, this.lineWidth);
                }

                this._cdr.markForCheck();
            }),
            error: () => this._ngZone.run(() => {
                this.locked = false;
                this._cdr.detectChanges();
            }),
            complete: () => this._ngZone.run(() => {
                this.locked = false;
                this._cdr.markForCheck();
            })
        };
    }

    private listenToMazeProcess(): void {
        this._ngZone.runOutsideAngular(() => {
            this.locked = true;
            this.match$ = this._matchService.match(this.type, this.name, this.source, this.rows, this.cols)
                .subscribe(this.acceptDataAndShow());
        });
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

    private listenParamsAndQueryParamsChange(): void {
        this._ngZone.runOutsideAngular(() => {
            let count: number = 0;
            this.route$ = combineLatest([this._route.params, this._route.queryParams])
                    .pipe(map(param => ({ type: param[0]['type'], name: param[1]['name'] })))
                    .subscribe(value => this._ngZone.run(async () => {
                        count += 1;

                        this.type = value.type;
                        this.name = value.name;
                        
                        if (count === 1) {
                            await this.update();
                            
                            this.timer$?.unsubscribe();
                            this.match$?.unsubscribe();

                            count = 0;
                        }
                    }));
        });
    }

}