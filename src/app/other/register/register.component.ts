import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, NgZone, OnDestroy, OnInit, Renderer2, ViewEncapsulation } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { Store } from "@ngrx/store";
import { ConfirmationService, MessageService } from "primeng/api";
import { DialogService, DynamicDialogConfig, DynamicDialogRef } from "primeng/dynamicdialog";
import { Subscription, filter } from "rxjs";
import { cloneDeep } from "lodash";

import { RegisterDialogComponent } from "./register.dialog.component";

import { APP_STYLE_THEME_FETCH_ACTION } from "../../ngrx-store/app.action";
import { APP_FEATURE_SELECTOR } from "../../ngrx-store/app.selector";
import { ThemeType } from "../../ngrx-store/app.state";
import { AUTH_SELECTOR } from "../ngrx-store/auth.selector";
import { AuthAccountProfileModel, AuthDialogDataPassModel } from "../ngrx-store/auth.state";
import { AUTH_ADD_USER_ACTION, AUTH_FIND_ALL_USERS_ACTION, AUTH_FIND_USER_ACTION, AUTH_MODIFY_USER_ACTION, AUTH_REMOVE_ALL_USERS_ACTION, AUTH_REMOVE_USER_ACTION } from "../ngrx-store/auth.action";

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    selector: 'tauri-app-register-page',
    templateUrl: './register.component.html',
    styleUrl: './register.component.scss'
})
export class RegisterPageComponent implements OnInit, OnDestroy, AfterViewInit {

    source: AuthAccountProfileModel[] = Array.from([]);

    private readonly DIALOG_CONFIG: DynamicDialogConfig<AuthAccountProfileModel> = {
        width: '80rem', modal: true, position: 'center', showHeader: false,
        contentStyle: { 'border-radius': '0.375rem', 'padding': '1.5rem', 'overflow': 'hidden' }
    };

    private style$: Subscription | null = null;
    private indexdb$: Subscription | null = null;

    constructor(
        private _route: ActivatedRoute,
        private _cdr: ChangeDetectorRef,
        private _element: ElementRef,
        private _renderer: Renderer2,
        private _ngZone: NgZone,
        private _store: Store,
        private _dialogService: DialogService,
        private _confirmService: ConfirmationService,
        private _messageService: MessageService
    ) { }

    ngOnInit(): void {
        this._store.dispatch(APP_STYLE_THEME_FETCH_ACTION());
        this._store.dispatch(AUTH_FIND_ALL_USERS_ACTION());
    }

    ngOnDestroy(): void {
        this.style$?.unsubscribe();
        this.indexdb$?.unsubscribe();
    }

    ngAfterViewInit(): void {
        this.initHostLayout();
        this.initHostBackground();
        this.listenStyleChange();
        this.listenIndexDBChange();
    }

    calculateXAxisPosition(element: HTMLElement): string {
        return `calc((100% - ${element.clientWidth}px) * 0.5)`;
    }

    calculateYAxisPosition(element: HTMLElement): string {
        return `calc((100% - ${element.clientHeight}px) * 0.5)`;
    }

    handleAddUserEvent(): void {
        const config: DynamicDialogConfig<AuthDialogDataPassModel> = { 
            ...this.DIALOG_CONFIG, 
            data: { 
                action: 'create',
                account: { username: '', password: '' },
                profile: { 
                    id: '', nickname: '', createTime: 0, updateTime: 0, 
                    avatar: { source: '', name: '', size: 0, timestamp: 0 }
                }
            } 
        };
        this.listenDialogClosingChange(this._dialogService.open(RegisterDialogComponent, config), 'add');
    }

    handleRemoveUserEvent(model: AuthAccountProfileModel): void {
        this._store.dispatch(AUTH_REMOVE_USER_ACTION({ accountKey: model.account.username, profileKey: model.profile.id }));
    }

    handleClearUserEvent(): void {
        this._confirmService.confirm({
            header: '全部删除', message: '警告：该操作将造成全部用户信息无法恢复，确定继续操作吗？',
            icon: 'pi pi-exclamation-triangle', 
            acceptLabel: '确定', acceptButtonStyleClass: 'p-button-rounded p-button-success', 
            rejectLabel: '取消', rejectButtonStyleClass: 'p-button-rounded p-button-danger', 
            closeOnEscape: false, 
            accept: () => this._store.dispatch(AUTH_REMOVE_ALL_USERS_ACTION()),
            reject: () => {}
        });
    }

    handleModifyUserEvent(model: AuthAccountProfileModel): void {
        const config: DynamicDialogConfig<AuthDialogDataPassModel> = { 
            ...this.DIALOG_CONFIG, 
            data: { action: 'update', account: model.account, profile: model.profile }
        };
        this.listenDialogClosingChange(this._dialogService.open(RegisterDialogComponent, config), 'edit');
    }

    private initHostLayout(): void {
        this._renderer.addClass(this._element.nativeElement, 'flex');
        this._renderer.addClass(this._element.nativeElement, 'justify-content-center');
        this._renderer.addClass(this._element.nativeElement, 'align-items-center');
        this._renderer.addClass(this._element.nativeElement, 'w-full');
        this._renderer.addClass(this._element.nativeElement, 'h-full');
    }

    private initHostBackground(): void {
        this._renderer.addClass(this._element.nativeElement, 'bg-center');
        this._renderer.addClass(this._element.nativeElement, 'bg-repeat');
        this._renderer.addClass(this._element.nativeElement, 'bg-auto');
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

    private listenIndexDBChange(): void {
        this._ngZone.runOutsideAngular(() => {
            this.indexdb$ = this._store.select(AUTH_SELECTOR)
                .pipe(filter(state => state.action.length > 0))
                .subscribe(state => this._ngZone.run(() => {
                    if (state.action === AUTH_ADD_USER_ACTION.type || state.action === AUTH_MODIFY_USER_ACTION.type 
                        || state.action === AUTH_REMOVE_USER_ACTION.type || state.action === AUTH_REMOVE_ALL_USERS_ACTION.type) {
                        this._store.dispatch(AUTH_FIND_ALL_USERS_ACTION());
                    }
                    
                    if (state.action === AUTH_FIND_ALL_USERS_ACTION.type) {
                        this.source = cloneDeep(state.value as AuthAccountProfileModel[]);
                        this._cdr.detectChanges();
                    }

                    if (state.action === AUTH_FIND_USER_ACTION.type) {
                        this.source = Array.from<AuthAccountProfileModel>([]).fill(state.value as AuthAccountProfileModel);
                        this._cdr.detectChanges();
                    }

                    this._messageService.add({ closable: false, summary: state.response?.subject, detail: state.response?.message, severity: state.response?.status });
                }));
        });
    }

    private listenDialogClosingChange(ddr: DynamicDialogRef<RegisterDialogComponent>, option: 'add' | 'edit'): void {
        this._ngZone.runOutsideAngular(() => {
            const ddr$ = ddr.onClose.subscribe(value => 
                this._ngZone.run(() => {
                    if (value) {
                        if (option === 'add') {
                            this._store.dispatch(AUTH_ADD_USER_ACTION(value));
                        }
                        
                        if (option === 'edit') {
                            this._store.dispatch(AUTH_MODIFY_USER_ACTION(value));
                        }
                    }

                    ddr$.unsubscribe();
                }));
        });
    }

}