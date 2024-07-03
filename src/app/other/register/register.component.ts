import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, NgZone, OnDestroy, OnInit, Renderer2, ViewEncapsulation } from "@angular/core";
import { Store } from "@ngrx/store";
import { ConfirmationService, MessageService, TreeNode } from "primeng/api";
import { DialogService, DynamicDialogConfig, DynamicDialogRef } from "primeng/dynamicdialog";
import { Subscription, concatMap, filter, fromEvent, interval, map, take } from "rxjs";
import { cloneDeep } from "lodash";

import { RegisterCreateDatabseDialogComponent, RegisterCreateObjectStoreDialogComponent, RegisterDialogComponent } from "./register.dialog.component";

import { AUTH_REGISTER_SELECTOR } from "../ngrx-store/auth.selector";
import { AuthAccountProfileModel, AuthAccountProfileFormModel } from "../ngrx-store/auth.state";
import { AUTH_ADD_USER_ACTION, AUTH_FIND_ALL_USERS_ACTION, AUTH_FIND_USER_ACTION, AUTH_MODIFY_USER_ACTION, AUTH_REMOVE_ALL_USERS_ACTION, AUTH_REMOVE_USER_ACTION } from "../ngrx-store/auth.action";
import { GLOBAL_INDEXEDDB_CREATE_DATABASE_ACTION, GLOBAL_INDEXEDDB_CREATE_OBJECT_STORE_ACTION, GLOBAL_INDEXEDDB_DELETE_ALL_OBJECT_STORES_ACTION, GLOBAL_INDEXEDDB_DELETE_DATABASE_ACTION, GLOBAL_INDEXEDDB_DELETE_OBJECT_STORE_ACTION, GLOBAL_INDEXEDDB_FIND_ALL_ACTION, GLOBAL_INDEXEDDB_FIND_ALL_DATABASES_ACTION, GLOBAL_INDEXEDDB_FIND_ALL_OBJECT_STORES_ACTION } from "../../public/indexeddb/indexeddb.action";
import { IDBObjectStoreResultModel, IDBMetaDataModel } from "../../public/indexeddb/indexeddb.state";
import { IDB_DATABASE_SELECTOR, IDB_OBJECT_STORE_SELECTOR } from "../../public/indexeddb/indexeddb.selector";

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    selector: 'tauri-ngx-register-page',
    templateUrl: './register.component.html',
    styleUrl: './register.component.scss'
})
export class RegisterPageComponent implements OnInit, OnDestroy, AfterViewInit {

    protected dblist: TreeNode<IDBMetaDataModel>[] = Array.from([]);
    protected source: AuthAccountProfileModel[] = Array.from([]);
    protected dbName: string = '';
    protected dbVersion: number = 0;
    protected osName: string = '';

    private readonly DIALOG_CONFIG: DynamicDialogConfig = {
        width: '80rem', modal: true, position: 'center', showHeader: false,
        contentStyle: { 'border-radius': '0.375rem', 'padding': '1.5rem', 'overflow': 'hidden' }
    };

    private style$: Subscription | null = null;
    private indexdb$: Subscription | null = null;

    constructor(
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
        this._store.dispatch(GLOBAL_INDEXEDDB_FIND_ALL_ACTION());
    }

    ngOnDestroy(): void {
        this.style$?.unsubscribe();
        this.indexdb$?.unsubscribe();
    }

    ngAfterViewInit(): void {
        this.initHostLayout();
        this.listenIDBDatabaseChange();
        this.listenIDBObjectStoreChange();
        this.listenAuthRegisterChange();
    }

    protected handleCreateDatabaseEvent(): void {
        this._ngZone.runOutsideAngular(() => {
            const ddr$ = this._dialogService
                .open(RegisterCreateDatabseDialogComponent, { ...this.DIALOG_CONFIG, width: '30rem' }).onClose
                .subscribe(value => 
                    this._ngZone.run(() => {
                        if (value) {
                            this._store.dispatch(GLOBAL_INDEXEDDB_CREATE_DATABASE_ACTION({ dbName: value }));
                        }

                        ddr$.unsubscribe();
                    }));
        });
    }

    protected handleUpdateIndexedDBListEvent(): void {
        this._store.dispatch(GLOBAL_INDEXEDDB_FIND_ALL_ACTION());
    }

    protected handleSelectedChangeEvent(node: TreeNode<IDBMetaDataModel>): void {
        if (node.type === 'leaf') {
            this.dbName = node.data?.dbName as string;
            this.dbVersion = node.data?.dbVersion as number;
            this.osName = node.data?.osName as string;
            this._store.dispatch(AUTH_FIND_ALL_USERS_ACTION({ dbName: this.dbName, dbVersion: this.dbVersion, osName: this.osName }));
        } else {
            this.dbName = '';
            this.dbVersion = 0;
            this.osName = ''
        }
    }

    protected handlePlusActionEvent(node: TreeNode<IDBMetaDataModel>): void {
        if (node.type === 'node') {
            this._ngZone.runOutsideAngular(() => {
                const ddr$ = this._dialogService
                    .open(RegisterCreateObjectStoreDialogComponent, { ...this.DIALOG_CONFIG, width: '30rem', data: node.data })
                    .onClose
                    .subscribe(value => 
                        this._ngZone.run(() => {
                            if (value) {
                                this._store.dispatch(GLOBAL_INDEXEDDB_CREATE_OBJECT_STORE_ACTION(value));
                            }
    
                            ddr$.unsubscribe();
                        }));
            });
        }
    }

    protected handleMinusActionEvent(node: TreeNode<IDBMetaDataModel>): void {
        if (node.type === 'node') {
            this._confirmService.confirm({
                header: `删除数据库（${node.data?.osName}）`, message: '警告：该操作将导致所选数据库永久性删除，确定继续操作吗？',
                icon: 'pi pi-exclamation-triangle', 
                acceptLabel: '确定', acceptButtonStyleClass: 'p-button-rounded p-button-success', 
                rejectLabel: '取消', rejectButtonStyleClass: 'p-button-rounded p-button-danger', 
                closeOnEscape: false, 
                accept: () => this._store.dispatch(GLOBAL_INDEXEDDB_DELETE_DATABASE_ACTION(node.data as IDBMetaDataModel)),
                reject: () => {}
            });
        } else {
            this._confirmService.confirm({
                header: `删除仓库（${node.data?.osName}）`, message: '警告：该操作将导致所选仓库永久性删除，确定继续操作吗？',
                icon: 'pi pi-exclamation-triangle', 
                acceptLabel: '确定', acceptButtonStyleClass: 'p-button-rounded p-button-success', 
                rejectLabel: '取消', rejectButtonStyleClass: 'p-button-rounded p-button-danger', 
                closeOnEscape: false, 
                accept: () => this._store.dispatch(GLOBAL_INDEXEDDB_DELETE_OBJECT_STORE_ACTION(node.data as IDBMetaDataModel)),
                reject: () => {}
            });
        }
    }

    protected handleAddUserEvent(): void {
        this.listenDialogClosingChange(
            this._dialogService.open(RegisterDialogComponent, 
            { 
                ...this.DIALOG_CONFIG, 
                data: { 
                    state: 'create',
                    value: {
                        id: '', account: { username: '', password: '' },
                        profile: { 
                            nickname: '', createTime: 0, updateTime: 0, 
                            avatar: { source: '', name: '', size: 0, timestamp: 0 }
                        }
                    }
                } 
            }
        ));
    }

    protected handleRemoveUserEvent(model: AuthAccountProfileModel): void {
        if (this.dbName.length > 0 && this.dbVersion > 0 && this.osName.length > 0) {
            this._store.dispatch(AUTH_REMOVE_USER_ACTION({ dbName: this.dbName, dbVersion: this.dbVersion, osName: this.osName, key: model.account.username }));
        }
    }

    protected handleClearUserEvent(): void {
        this._confirmService.confirm({
            header: '全部删除', message: '警告：该操作将造成全部用户信息无法恢复，确定继续操作吗？',
            icon: 'pi pi-exclamation-triangle', 
            acceptLabel: '确定', acceptButtonStyleClass: 'p-button-rounded p-button-success', 
            rejectLabel: '取消', rejectButtonStyleClass: 'p-button-rounded p-button-danger', 
            closeOnEscape: false, 
            accept: () => this._store.dispatch(AUTH_REMOVE_ALL_USERS_ACTION({ dbName: this.dbName, dbVersion: this.dbVersion, osName: this.osName })),
            reject: () => {}
        });
    }

    protected handleModifyUserEvent(model: AuthAccountProfileModel): void {
        this.listenDialogClosingChange(this._dialogService.open(RegisterDialogComponent, 
            { ...this.DIALOG_CONFIG, data: { state: 'update', value: model } }));
    }

    protected handleFindAllUsersEvent(): void {
        this._store.dispatch(AUTH_FIND_ALL_USERS_ACTION({ dbName: this.dbName, dbVersion: this.dbVersion, osName: this.osName }));
    }

    private initHostLayout(): void {
        this._renderer.addClass(this._element.nativeElement, 'tauri-ngx-register-page');
        this._renderer.addClass(this._element.nativeElement, 'flex');
        this._renderer.addClass(this._element.nativeElement, 'w-screen');
        this._renderer.addClass(this._element.nativeElement, 'h-screen');
    }

    private listenIDBDatabaseChange(): void {
        this._ngZone.runOutsideAngular(() => {
            this.indexdb$ = this._store.select(IDB_DATABASE_SELECTOR)
                .pipe(filter(state => state.action.length > 0))
                .subscribe(state => this._ngZone.run(() => {
                    if (state.action === GLOBAL_INDEXEDDB_CREATE_DATABASE_ACTION.type || state.action === GLOBAL_INDEXEDDB_DELETE_DATABASE_ACTION.type) {
                        this._store.dispatch(GLOBAL_INDEXEDDB_FIND_ALL_ACTION());
                    }

                    if (state.action === GLOBAL_INDEXEDDB_FIND_ALL_DATABASES_ACTION.type || state.action === GLOBAL_INDEXEDDB_FIND_ALL_ACTION.type) {
                        this.dblist = cloneDeep(state.result as TreeNode<IDBMetaDataModel>[]);
                        this._cdr.markForCheck();
                    }
                }));
        });
    }

    private listenIDBObjectStoreChange(): void {
        this._ngZone.runOutsideAngular(() => {
            this.indexdb$ = this._store.select(IDB_OBJECT_STORE_SELECTOR)
                .pipe(filter(state => state.action.length > 0))
                .subscribe(state => this._ngZone.run(() => {
                    if (state.action === GLOBAL_INDEXEDDB_CREATE_OBJECT_STORE_ACTION.type || state.action === GLOBAL_INDEXEDDB_DELETE_OBJECT_STORE_ACTION.type) {
                        this._store.dispatch(GLOBAL_INDEXEDDB_FIND_ALL_OBJECT_STORES_ACTION({ dbName: state.result as string }));
                    }

                    if (state.action === GLOBAL_INDEXEDDB_FIND_ALL_OBJECT_STORES_ACTION.type) {
                        const model = state.result as IDBObjectStoreResultModel;

                        for (const dbitem of this.dblist) {
                            if (dbitem.data?.dbName === model.name) {
                                dbitem.children = model.list;
                                break;
                            }
                        }

                        this._cdr.markForCheck();
                    }
                }));
        });
    }

    private listenAuthRegisterChange(): void {
        this._ngZone.runOutsideAngular(() => {
            this.indexdb$ = this._store.select(AUTH_REGISTER_SELECTOR)
                .pipe(filter(state => state.action.length > 0))
                .subscribe(state => this._ngZone.run(() => {
                    if (
                        state.action === AUTH_ADD_USER_ACTION.type || 
                        state.action === AUTH_MODIFY_USER_ACTION.type || 
                        state.action === AUTH_REMOVE_USER_ACTION.type || 
                        state.action === AUTH_REMOVE_ALL_USERS_ACTION.type || 
                        state.action === AUTH_FIND_ALL_USERS_ACTION.type
                    ) {
                        this.source = cloneDeep(state.result as AuthAccountProfileModel[]);
                    }
                    
                    if (state.action === AUTH_FIND_USER_ACTION.type) {
                        this.source.splice(0);
                        this.source.push(cloneDeep(state.result as AuthAccountProfileModel));
                    }

                    this._cdr.markForCheck();
                    // this._messageService.add({ closable: false, summary: '', detail: state.message, severity: 'success' });
                }));
        });
    }

    private listenDialogClosingChange(ddr: DynamicDialogRef<RegisterDialogComponent>): void {
        this._ngZone.runOutsideAngular(() => {
            const ddr$ = ddr.onClose.subscribe((model: AuthAccountProfileFormModel) => 
                this._ngZone.run(() => {
                    if (model) {
                        if (model.state === 'create') {
                            this._store.dispatch(AUTH_ADD_USER_ACTION({ dbName: this.dbName, dbVersion: this.dbVersion, osName: this.osName, data: model.value }));
                        }
                        
                        if (model.state === 'update') {
                            this._store.dispatch(AUTH_MODIFY_USER_ACTION({ dbName: this.dbName, dbVersion: this.dbVersion, osName: this.osName, data: model.value }));
                        }
                    }

                    ddr$.unsubscribe();
                }));
        });
    }

}