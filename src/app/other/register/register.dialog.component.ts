import { Component, ChangeDetectionStrategy, ElementRef, NgZone, Renderer2, OnInit, AfterViewInit, OnDestroy } from "@angular/core";
import { AbstractControl, FormBuilder, FormControl, FormGroup, ValidationErrors, ValidatorFn, Validators } from "@angular/forms";
import { DialogService, DynamicDialogRef } from "primeng/dynamicdialog";
import { FileSelectEvent, FileUpload } from "primeng/fileupload";
import { Observable, Subscription, interval, map } from "rxjs";
import { cloneDeep } from 'lodash';
import { enc, HmacSHA256, DES } from 'crypto-js';

import { AuthAccountProfileFormModel, CRYPTO_SECRET_KEY } from "../ngrx-store/auth.state";
import { IDBMetaDataModel, IDBObjectStoreParamModel } from "../../public/indexeddb/indexeddb.state";

const passwordConfirmValidator = (name: string): ValidatorFn => 
    (control: AbstractControl): ValidationErrors | null => {
        if (control.parent instanceof FormGroup) {
            const group: FormGroup = control.parent;
            const source: string = group.controls[name].value;
            const target: string = control.value;
            return { 'dismatch': source !== target };
        }

        return null;
    }

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'tauri-ngx-register-dialog',
    templateUrl: './register-dialog.component.html',
    styleUrl: './register.component.scss'
})
export class RegisterDialogComponent implements OnInit, OnDestroy, AfterViewInit {
    
    protected accountFormGroup: FormGroup = this._fb.group({
        usernameControl: new FormControl({ value: '', disabled: false }, [Validators.required, Validators.minLength(6), Validators.maxLength(24)]),
        passwordControl: new FormControl({ value: '', disabled: false }, [Validators.required, Validators.minLength(6), Validators.maxLength(24)]),
        repasswordControl: new FormControl({ value: '', disabled: false }, [Validators.required, Validators.minLength(6), Validators.maxLength(24), passwordConfirmValidator('passwordControl')])
    });
    protected profileFormGroup: FormGroup = this._fb.group({
        nicknameControl: new FormControl({ value: '', disabled: false }, [Validators.required, Validators.minLength(2), Validators.maxLength(16)]),
        createtimeControl: new FormControl({ value: 0, disabled: true }, []),
        updatetimeControl: new FormControl({ value: 0, disabled: true }, []),
    });
    protected model: AuthAccountProfileFormModel | null = null;

    private timestamp$: Subscription | null = null;
    private usernameControl$: Subscription | null = null;
    private passwordControl$: Subscription | null = null;
    private idControl$: Subscription | null = null;
    private nicknameControl$: Subscription | null = null;
    private createtimeControl$: Subscription | null = null;
    private updatetimeControl$: Subscription | null = null;

    constructor(
        private _fb: FormBuilder,
        private _element: ElementRef,
        private _renderer: Renderer2,
        private _ngZone: NgZone,
        private _ddr: DynamicDialogRef<RegisterDialogComponent>,
        private _service: DialogService
    ) { }

    ngOnInit(): void {
        this.model = cloneDeep(this._service.getInstance(this._ddr).data);
        this.copyByAction();
    }

    ngOnDestroy(): void {
        this.timestamp$?.unsubscribe();
        this.usernameControl$?.unsubscribe();
        this.passwordControl$?.unsubscribe();
        this.idControl$?.unsubscribe();
        this.nicknameControl$?.unsubscribe();
        this.createtimeControl$?.unsubscribe();
        this.updatetimeControl$?.unsubscribe();
    }

    ngAfterViewInit(): void {
        this.initHostLayout();
        this.listenFormGroupValueChange();
    }

    formatTimestamp(value: string | null): string {
        return `（${value}）`;
    }

    handleSubmitEvent(): void {
        if (this.model) {
            this.model.value.account.password = DES.encrypt(this.model.value.account.password, CRYPTO_SECRET_KEY).toString();
            this._ddr.close(cloneDeep(this.model));
        }
    }

    handleCancelEvent(): void {
        this._ddr.close();
    }

    handleFileClearEvent(upload: FileUpload): void {
        upload.clear();

        if (this.model) {
            this.model.value.profile.avatar = { source: '', name: '', size: 0, timestamp: 0 }
        }
    }

    handleFileSelectEvent(event: FileSelectEvent, upload: FileUpload): void {
        const file: File = event.currentFiles[0];        
        const reader: FileReader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = event => {
            if (this.model) {
                this.model.value.profile.avatar = {
                    ...this.model.value.profile.avatar, 
                    source: event.target?.result as string,
                    name: file.name, size: file.size, timestamp: file.lastModified
                }
            }
        };
        reader.onloadend = () => upload.clear();
    }

    private initHostLayout(): void {
        this._renderer.addClass(this._element.nativeElement, 'flex');
        this._renderer.addClass(this._element.nativeElement, 'flex-column');
        this._renderer.addClass(this._element.nativeElement, 'gap-3');
    }

    private copyByAction(): void {
        this._ngZone.runOutsideAngular(() => {
            if (this.model) {
                if (this.model.state === 'update') {
                    this.accountFormGroup.controls['usernameControl'].disable();
                }
                
                this.accountFormGroup.controls['usernameControl'].setValue(this.model.value.account.username);
                this.model.value.account.password = DES.decrypt(this.model.value.account.password, CRYPTO_SECRET_KEY).toString(enc.Utf8);
                this.accountFormGroup.controls['passwordControl'].setValue(this.model.value.account.password);
                this.accountFormGroup.controls['repasswordControl'].setValue(this.model.value.account.password);

                this.profileFormGroup.controls['nicknameControl'].setValue(this.model.value.profile.nickname);
                this.profileFormGroup.controls['createtimeControl'].setValue(this.model.value.profile.createTime);
                this.profileFormGroup.controls['updatetimeControl'].setValue(this.model.value.profile.updateTime);

                this.timestamp$ = interval(10).pipe(map(() => Date.now())).subscribe(value => 
                    this._ngZone.run(() => {
                        if (this.model?.state === 'create') {
                            this.profileFormGroup.controls['createtimeControl'].setValue(value);
                        }
                        
                        this.profileFormGroup.controls['updatetimeControl'].setValue(value);
                    }));
            }
        });
    }

    private listenFormGroupValueChange(): void {
        this._ngZone.runOutsideAngular(() => {
            this.usernameControl$ = this.accountFormGroup.controls['usernameControl'].valueChanges
                .subscribe(value => {
                    if (this.model) {
                        this.model.value.account.username = value;
                        this.model.value.id = HmacSHA256(value, CRYPTO_SECRET_KEY).toString();
                    }
                });
            this.passwordControl$ = this.accountFormGroup.controls['passwordControl'].valueChanges
                .subscribe(value => {
                    if (this.model) {
                        this.model.value.account.password = value;
                    }
                });
            
            this.nicknameControl$ = this.profileFormGroup.controls['nicknameControl'].valueChanges
                .subscribe(value => {
                    if (this.model) {
                        this.model.value.profile.nickname = value;
                    }
                });
            this.createtimeControl$ = this.profileFormGroup.controls['createtimeControl'].valueChanges
                .subscribe(value => {
                    if (this.model) {
                        this.model.value.profile.createTime = value;
                    }
                });
            this.updatetimeControl$ = this.profileFormGroup.controls['updatetimeControl'].valueChanges
                .subscribe(value => {
                    if (this.model) {
                        this.model.value.profile.updateTime = value;
                    }
                });
        });
    }

}

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'tauri-ngx-register-create-database-dialog',
    template: `
        <div class="flex align-items-center gap-4">
            <i class="pi pi-users font-bold text-2xl"></i>
            <span class="font-bold text-2xl">创建数据库</span>
        </div>
        <form [formGroup]="group" class="flex align-items-center border-y-1 surface-border p-4 -mx-4 gap-4">
            <label for="name">数据库名</label>
            <input type="text" id="name" pInputText formControlName="nameControl" class="flex-auto"/>
        </form>
        <div class="flex justify-content-between">
            <p-button icon="pi pi-times" label="取消" severity="danger" [raised]="true" (click)="handleCancelEvent()"/>
            <p-button icon="pi pi-check" label="创建" severity="success" [raised]="true" (click)="handleSubmitEvent()"/>
        </div>
    `
})
export class RegisterCreateDatabseDialogComponent implements OnInit {

    protected group: FormGroup = this._fb.group({
        nameControl: new FormControl({ value: '', disabled: false }, [Validators.required])
    });

    constructor(
        private _fb: FormBuilder,
        private _element: ElementRef,
        private _renderer: Renderer2,
        private _ddr: DynamicDialogRef<RegisterCreateDatabseDialogComponent>
    ) { }

    ngOnInit(): void {
        this.initHostLayout();
    }

    protected handleSubmitEvent(): void {
        if (this.group.valid) {
            this._ddr.close(this.group.value['nameControl']);
        }
    }

    protected handleCancelEvent(): void {
        this._ddr.close();
    }

    private initHostLayout(): void {
        this._renderer.addClass(this._element.nativeElement, 'tauri-ngx-register-create-database-dialog');
        this._renderer.addClass(this._element.nativeElement, 'flex');
        this._renderer.addClass(this._element.nativeElement, 'flex-column');
        this._renderer.addClass(this._element.nativeElement, 'gap-4');
    }

}

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'tauri-ngx-register-create-object-store-dialog',
    template: `
        <div class="flex align-items-center gap-4">
            <i class="pi pi-users font-bold text-5xl"></i>
            <div class="flex flex-column flex-auto">
                <span class="font-bold text-2xl">创建存储表</span>
                <span class="font-bold text-xs">{{metadata.dbName}}（版本：{{metadata.dbVersion}}）</span>
            </div>
        </div>
        <form [formGroup]="group" class="flex flex-column border-y-1 surface-border p-4 -mx-4 gap-4">
            <div class="flex align-items-center gap-4">
                <label for="osName" class="text-right w-3">存储表名</label>
                <input type="text" id="osName" pInputText formControlName="osNameControl" class="flex-auto"/>
            </div>
            <div class="flex align-items-center gap-4">
                <label for="keyPath" class="text-right w-3">主键值</label>
                <input type="text" id="keyPath" pInputText formControlName="keyPathControl" class="flex-auto"/>
            </div>
            <div class="flex align-items-center gap-4">
                <label for="autoIncrement" class="text-right w-3">主键是否自增</label>
                <p-inputSwitch id="autoIncrement" formControlName="autoIncrementControl"/>
            </div>
            <div class="flex align-items-center gap-4">
                <label for="unique" class="text-right w-3">主键是否唯一</label>
                <p-inputSwitch id="unique" formControlName="uniqueControl"/>
            </div>
            <div class="flex align-items-center gap-4">
                <label for="multiEntry" class="text-right w-3">是否多个入口</label>
                <p-inputSwitch id="multiEntry" formControlName="multiEntryControl"/>
            </div>
        </form>
        <div class="flex justify-content-between">
            <p-button icon="pi pi-times" label="取消" severity="danger" [raised]="true" (click)="handleCancelEvent()"/>
            <p-button icon="pi pi-check" label="创建" severity="success" [raised]="true" (click)="handleSubmitEvent()"/>
        </div>
    `
})
export class RegisterCreateObjectStoreDialogComponent implements OnInit, AfterViewInit {

    protected group: FormGroup = this._fb.group({
        osNameControl: new FormControl({ value: '', disabled: false }, [Validators.required]),
        keyPathControl: new FormControl({ value: '', disabled: false }, [Validators.required]),
        autoIncrementControl: new FormControl({ value: true, disabled: false }, []),
        uniqueControl: new FormControl({ value: true, disabled: false }, []),
        multiEntryControl: new FormControl({ value: false, disabled: false }, [])
    });
    protected metadata: IDBMetaDataModel = {};

    constructor(
        private _fb: FormBuilder,
        private _element: ElementRef,
        private _renderer: Renderer2,
        private _ddr: DynamicDialogRef<RegisterCreateObjectStoreDialogComponent>,
        private _service: DialogService
    ) { }

    ngOnInit(): void {
        this.metadata = this._service.getInstance(this._ddr).data;
    }

    ngAfterViewInit(): void {
        this.initHostLayout();
    }

    protected handleSubmitEvent(): void {
        if (this.group.valid) {
            const model: IDBObjectStoreParamModel = {
                metadata: { ...this.metadata, osName: this.group.value['osNameControl'] },
                options: {
                    keyPath: this.group.value['keyPathControl'],
                    autoIncrement: this.group.value['autoIncrementControl'], 
                    unique: this.group.value['uniqueControl'],
                    multiEntry: this.group.value['multiEntryControl']
                }
            };
            this._ddr.close(model);
        }
    }

    protected handleCancelEvent(): void {
        this._ddr.close();
    }

    private initHostLayout(): void {
        this._renderer.addClass(this._element.nativeElement, 'tauri-ngx-register-create-object-store-dialog');
        this._renderer.addClass(this._element.nativeElement, 'flex');
        this._renderer.addClass(this._element.nativeElement, 'flex-column');
        this._renderer.addClass(this._element.nativeElement, 'gap-4');
    }

}