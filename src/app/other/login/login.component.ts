import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, NgZone, OnDestroy, OnInit, Renderer2, ViewEncapsulation } from "@angular/core";
import { FormBuilder, FormControl, FormGroup, Validators } from "@angular/forms";
import { Router } from "@angular/router";
import { Store } from "@ngrx/store";
import { Subscription, filter } from "rxjs";

import { ThemeType } from "../../ngrx-store/app.state";
import { APP_FEATURE_SELECTOR } from "../../ngrx-store/app.selector";
import { APP_STYLE_THEME_FETCH_ACTION } from "../../ngrx-store/app.action";

@Component({
    selector: 'tauri-app-login-page',
    templateUrl: './login.component.html'
})
export class LoginPageComponent implements OnInit, OnDestroy, AfterViewInit {
    
    loginFormGroup: FormGroup = this._fb.group({
        usernameControl: new FormControl({ value: '', disabled: false }, []),
        passwordControl: new FormControl({ value: '', disabled: false }, [])
    });

    private style$: Subscription | null = null;

    constructor(
        private _cdr: ChangeDetectorRef,
        private _fb: FormBuilder,
        private _element: ElementRef,
        private _renderer: Renderer2,
        private _router: Router,
        private _ngZone: NgZone,
        private _store: Store
    ) {}

    ngOnInit(): void {
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

    invokeSubmitEvent(): void {
        this._router.navigate(['/playground']).then().finally();
    }

    calculateXAxisPosition(element: HTMLElement): string {
        return `calc((100% - ${element.clientWidth}px) * 0.5)`;
    }

    calculateYAxisPosition(element: HTMLElement): string {
        return `calc((100% - ${element.clientHeight}px) * 0.5)`;
    }

    private initHostLayout(): void {
        this._renderer.addClass(this._element.nativeElement, 'relative');
        this._renderer.addClass(this._element.nativeElement, 'flex');
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
                this._renderer.setStyle(this._element.nativeElement, 'background-image', `url(assets/images/bg-image-${theme}.png)`);
                this._cdr.detectChanges();
            }));
        });
    }

}