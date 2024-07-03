import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, NgZone, OnDestroy, OnInit, Renderer2, ViewEncapsulation } from "@angular/core";
import { FormBuilder, FormControl, FormGroup, Validators } from "@angular/forms";
import { ActivatedRoute, NavigationEnd, Router } from "@angular/router";
import { Store } from "@ngrx/store";
import { Subscription, filter, map } from "rxjs";
import { DES } from 'crypto-js';

import { APP_STYLE_THEME_LOAD_ACTION } from "../../ngrx-store/app.action";
import { APP_FEATURE_SELECTOR } from "../../ngrx-store/app.selector";
import { ThemeType } from "../../ngrx-store/app.state";
import { AUTH_SECRET_KEY } from "./login.service";
import { AuthAccountModel } from "../ngrx-store/auth.state";

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    selector: 'tauri-ngx-login-page',
    templateUrl: 'login.component.html',
    styleUrl: 'login.component.scss'
})
export class LoginPageComponent implements OnInit, OnDestroy, AfterViewInit {
    
    readonly TRANSLATION_MESSAGES: { [key: string | number] : string } = {
        1: $localize `:@@login_component_ts_1:login_component_ts_1`,
        2: $localize `:@@login_component_ts_2:login_component_ts_2`,
        31: $localize `:@@login_component_ts_3_1:login_component_ts_3_1`,
        32: $localize `:@@login_component_ts_3_2:login_component_ts_3_2`,
        33: $localize `:@@login_component_ts_3_3:login_component_ts_3_3`,
        34: $localize `:@@login_component_ts_3_4:login_component_ts_3_4`,
        4: $localize `:@@login_component_ts_4:login_component_ts_4`,
        5: $localize `:@@login_component_ts_5:login_component_ts_5`,
        51: $localize `:@@login_component_ts_5_1:login_component_ts_5_1`,
        52: $localize `:@@login_component_ts_5_2:login_component_ts_5_2`,
        53: $localize `:@@login_component_ts_5_3:login_component_ts_5_3`,
        54: $localize `:@@login_component_ts_5_4:login_component_ts_5_4`,
        6: $localize `:@@login_component_ts_6:login_component_ts_6`,
        7: $localize `:@@login_component_ts_7:login_component_ts_7`,
        81: $localize `:@@login_component_ts_8_1:login_component_ts_8_1`,
        82: $localize `:@@login_component_ts_8_2:login_component_ts_8_2`,
        83: $localize `:@@login_component_ts_8_3:login_component_ts_8_3`,
    }

    usersFormGroup: FormGroup = this._fb.group({
        usernameControl: new FormControl({ value: '', disabled: false }, []),
        passwordControl: new FormControl({ value: '', disabled: false }, [])
    });
    adminFormGroup: FormGroup = this._fb.group({
        usernameControl: new FormControl({ value: '', disabled: false }, [Validators.required]),
        passwordControl: new FormControl({ value: '', disabled: false }, [Validators.required])
    });
    index: number = 0;    

    private event$: Subscription | null = null;
    private style$: Subscription | null = null;

    constructor(
        private _route: ActivatedRoute,
        private _cdr: ChangeDetectorRef,
        private _fb: FormBuilder,
        private _element: ElementRef,
        private _renderer: Renderer2,
        private _router: Router,
        private _ngZone: NgZone,
        private _store: Store
    ) {
        this._ngZone.runOutsideAngular(() => {
            this.event$ = this._router.events
                .pipe(
                    filter(event => event instanceof NavigationEnd),
                    map(() => this._route.snapshot.queryParams['index'])
                )
                .subscribe(value => 
                    this._ngZone.run(() => {
                        this.index = Number.parseInt(value);
                        this._cdr.markForCheck();
                    }));
        });
    }

    ngOnInit(): void {
        this._store.dispatch(APP_STYLE_THEME_LOAD_ACTION());
    }

    ngOnDestroy(): void {
        this.event$?.unsubscribe();
        this.style$?.unsubscribe();
    }

    ngAfterViewInit(): void {
        this.initHostLayout();
        this.listenStyleChange();
    }

    handleTabPanelSwitchEvent(index: number): void {
        this._router.navigate([`/${this._route.snapshot.url[0].path}`, this._route.snapshot.url[1].path], 
            { queryParams: { index } }).then();
    }

    handleUsersSubmitEvent(): void {
        this._router.navigate(['/playground', 'dashboard']).then();
    }

    async handleAdminSubmitEvent(): Promise<void> {
        if (this.adminFormGroup.valid) {
            const model: AuthAccountModel = { 
                username: this.adminFormGroup.value['usernameControl'],
                password: this.adminFormGroup.value['passwordControl'],
            };
            const message: string = DES.encrypt(JSON.stringify(model), AUTH_SECRET_KEY).toString();
            await this._router.navigate(['/authorization', 'register'], { queryParams: { 'auth_info': message } });
        }
    }

    private initHostLayout(): void {
        this._renderer.addClass(this._element.nativeElement, 'tauri-ngx-login-page');
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