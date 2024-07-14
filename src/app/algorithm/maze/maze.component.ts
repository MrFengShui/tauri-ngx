import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, HostListener, Inject, LOCALE_ID, NgZone, OnDestroy, OnInit, Renderer2, ViewChild } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { Store } from "@ngrx/store";
import { map, Observer, Subscription, timer } from "rxjs";
import { cloneDeep } from "lodash";

import { MazeCellModel, MazeWallModel } from "./ngrx-store/maze.state";
import { MazeMatchService, MazeUtilsService } from "./ngrx-store/maze.service";
import { MazeCanvasUtils, MazeGenerationName } from "./maze.utils";

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
        await this.update();
    }

    protected rows: number = 0;
    protected maxRows: number = 0;
    protected cols: number = 0;
    protected maxCols: number = 0;
    protected timer: number = 0;
    protected locked: boolean = false;
    
    private utils: MazeCanvasUtils | null = null;
    private source: MazeCellModel[][] = Array.from([]);
    private name: MazeGenerationName = undefined;
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
        this.listenQueryParamsChange();
        // this.listenLoadConfigChange();
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
        this._renderer.addClass(this._element.nativeElement, 'gap-3');
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

        this.maxRows = Math.floor(size.width * 0.1);
        this.maxCols = Math.floor(size.height * 0.1);

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
            this.match$ = this._matchService.match(this.name, this.source, this.rows, this.cols)
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

    private listenQueryParamsChange(): void {
        this._ngZone.runOutsideAngular(() => {
            this.route$ = this._route.queryParams
                .pipe(map(params => params['name']))
                .subscribe(name => 
                    this._ngZone.run(async () => {
                        this.name = name;

                        await this.update();

                        this.timer$?.unsubscribe();
                        this.match$?.unsubscribe();
                    }));
        });
    }

}