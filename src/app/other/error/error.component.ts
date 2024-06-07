import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, NgZone, OnDestroy, OnInit, Renderer2 } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { Store } from "@ngrx/store";
import { Subscription, filter } from "rxjs";

import { APP_FEATURE_SELECTOR } from "../../ngrx-store/app.selector";
import { APP_STYLE_THEME_FETCH_ACTION } from "../../ngrx-store/app.action";
import { ThemeType } from "../../ngrx-store/app.state";

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'tauri-app-error-page',
    templateUrl: './error.component.html'
})
export class ErrorPageComponent implements OnInit, OnDestroy, AfterViewInit {

    code: string | null = null;

    private style$: Subscription | null = null;

    constructor(
        private _route: ActivatedRoute,
        private _cdr: ChangeDetectorRef,
        private _element: ElementRef,
        private _renderer: Renderer2,
        private _ngZone: NgZone,
        private _store: Store
    ) {}

    ngOnInit(): void {
        this.code = this._route.snapshot.params['code'];
        this._store.dispatch(APP_STYLE_THEME_FETCH_ACTION());
    }

    ngOnDestroy(): void {
        this.style$?.unsubscribe();
    }

    ngAfterViewInit(): void {
        this.initHostLayout();
        this.initHostBackground();
        this.listenStyleChange();
    }

    calculateXAxisPosition(element: HTMLElement): string {
        return `calc((100% - ${element.clientWidth}px) * 0.5)`;    
    }

    calculateYAxisPosition(element: HTMLElement): string {
        return `calc((100% - ${element.clientHeight}px) * 0.5)`;    
    }

    private initHostLayout(): void {
        this._renderer.addClass(this._element.nativeElement, 'flex');
        this._renderer.addClass(this._element.nativeElement, 'relative');
        this._renderer.addClass(this._element.nativeElement, 'h-full');
    }

    private initHostBackground(): void {
        this._renderer.setStyle(this._element.nativeElement, 'background-position', 'center');
        this._renderer.setStyle(this._element.nativeElement, 'background-repeat', 'repeat');
        this._renderer.setStyle(this._element.nativeElement, 'background-size', 'auto');
    }

    private listenStyleChange(): void {
        this._ngZone.runOutsideAngular(() => {
            this.style$ = this._store.select(APP_FEATURE_SELECTOR)
            .pipe(filter(state => state.styleFeatuer.action === APP_STYLE_THEME_FETCH_ACTION.type))
            .subscribe(state => this._ngZone.run(() => {
                const theme: ThemeType = state.styleFeatuer.value as ThemeType;
                this._renderer.setStyle(this._element.nativeElement, 'background-image', `url(../../../assets/images/bg-image-${theme}.webp)`);
                this._cdr.detectChanges();
            }));
        });
    }

}