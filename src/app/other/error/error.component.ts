import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, NgZone, OnDestroy, OnInit, Renderer2 } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { Store } from "@ngrx/store";
import { Subscription, filter } from "rxjs";

import { APP_FEATURE_SELECTOR } from "../../ngrx-store/app.selector";
import { APP_STYLE_THEME_LOAD_ACTION } from "../../ngrx-store/app.action";
import { ThemeType } from "../../ngrx-store/app.state";

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'tauri-ngx-error-page',
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
        this._store.dispatch(APP_STYLE_THEME_LOAD_ACTION());
    }

    ngOnDestroy(): void {
        this.style$?.unsubscribe();
    }

    ngAfterViewInit(): void {
        this.initHostLayout();
        this.listenStyleChange();
    }

    private initHostLayout(): void {
        this._renderer.addClass(this._element.nativeElement, 'flex');
        this._renderer.addClass(this._element.nativeElement, 'justify-content-center');
        this._renderer.addClass(this._element.nativeElement, 'align-items-center');
        this._renderer.addClass(this._element.nativeElement, 'w-screen');
        this._renderer.addClass(this._element.nativeElement, 'h-screen');
    }

    private listenStyleChange(): void {
        this._ngZone.runOutsideAngular(() => {
            this.style$ = this._store.select(APP_FEATURE_SELECTOR)
            .pipe(filter(state => state.action === APP_STYLE_THEME_LOAD_ACTION.type))
            .subscribe(state => this._ngZone.run(() => {
                const theme: ThemeType = state.result as ThemeType;
                this._renderer.setStyle(this._element.nativeElement, 
                    'background-image', `url(assets/images/bg-image-${theme}.png)`);
                this._cdr.markForCheck();
            }));
        });
    }

}