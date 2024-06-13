import { Component, ChangeDetectionStrategy, ChangeDetectorRef, ElementRef, NgZone, Renderer2, OnInit, AfterViewInit, OnDestroy } from "@angular/core";
import { AbstractControl, FormBuilder, FormControl, FormGroup, ValidationErrors, ValidatorFn, Validators } from "@angular/forms";
import { DialogService, DynamicDialogRef } from "primeng/dynamicdialog";
import { FileSelectEvent, FileUpload } from "primeng/fileupload";
import { Observable, Subscription, interval, map } from "rxjs";
import { cloneDeep } from 'lodash';
import { enc, HmacSHA256, DES } from 'crypto-js';

import { AuthDialogDataPassModel, CRYPTO_SECRET_KEY } from "../ngrx-store/auth.state";

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
    selector: 'tauri-app-register-dialog',
    templateUrl: './register-dialog.component.html',
    styleUrl: './register.component.scss'
})
export class RegisterDialogComponent implements OnInit, OnDestroy, AfterViewInit {
    
    accountFormGroup: FormGroup = this._fb.group({
        usernameControl: new FormControl({ value: '', disabled: false }, [Validators.required, Validators.minLength(6), Validators.maxLength(24)]),
        passwordControl: new FormControl({ value: '', disabled: false }, [Validators.required, Validators.minLength(6), Validators.maxLength(24)]),
        repasswordControl: new FormControl({ value: '', disabled: false }, [Validators.required, Validators.minLength(6), Validators.maxLength(24), passwordConfirmValidator('passwordControl')])
    });
    profileFormGroup: FormGroup = this._fb.group({
        idControl: new FormControl({ value: '', disabled: true }, []),
        nicknameControl: new FormControl({ value: '', disabled: false }, [Validators.required, Validators.minLength(2), Validators.maxLength(16)]),
        createtimeControl: new FormControl({ value: 0, disabled: true }, []),
        updatetimeControl: new FormControl({ value: 0, disabled: true }, []),
    });
    model: AuthDialogDataPassModel | null = null;

    private timestamp: Observable<number> = interval(10).pipe(map(() => Date.now()));
    private timestamp$: Subscription | null = null;
    private usernameControl$: Subscription | null = null;
    private passwordControl$: Subscription | null = null;
    private idControl$: Subscription | null = null;
    private nicknameControl$: Subscription | null = null;
    private createtimeControl$: Subscription | null = null;
    private updatetimeControl$: Subscription | null = null;

    constructor(
        private _cdr: ChangeDetectorRef,
        private _fb: FormBuilder,
        private _element: ElementRef,
        private _renderer: Renderer2,
        private _ngZone: NgZone,
        private _ddr: DynamicDialogRef<RegisterDialogComponent>,
        private _service: DialogService
    ) { }

    ngOnInit(): void {
        this.copyByAction(this._service.getInstance(this._ddr).data);
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
            this.model.account.password = DES.encrypt(this.model.account.password, CRYPTO_SECRET_KEY).toString();
            this._ddr.close(cloneDeep(this.model));
        }
    }

    handleCancelEvent(): void {
        this._ddr.close();
    }

    handleFileClearEvent(upload: FileUpload): void {
        upload.clear();

        if (this.model) {
            this.model.profile.avatar = { source: '', name: '', size: 0, timestamp: 0 }
        }
    }

    handleFileSelectEvent(event: FileSelectEvent, upload: FileUpload): void {
        const file: File = event.currentFiles[0];        
        const reader: FileReader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = event => {
            if (this.model) {
                this.model.profile.avatar = {
                    ...this.model.profile.avatar, 
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
        this._renderer.addClass(this._element.nativeElement, 'h-full');
        this._renderer.addClass(this._element.nativeElement, 'gap-3');
    }

    private copyByAction(model: AuthDialogDataPassModel): void {
        this.model = cloneDeep(model);
        this._ngZone.runOutsideAngular(() => {
            if (this.model) {
                this.accountFormGroup.controls['usernameControl'].setValue(this.model.account.username);

                this.model.account.password = DES.decrypt(this.model.account.password, CRYPTO_SECRET_KEY).toString(enc.Utf8);
                this.accountFormGroup.controls['passwordControl'].setValue(this.model.account.password);
                this.accountFormGroup.controls['repasswordControl'].setValue(this.model.account.password);

                this.profileFormGroup.controls['idControl'].setValue(this.model.profile.id);
                this.profileFormGroup.controls['nicknameControl'].setValue(this.model.profile.nickname);
                this.profileFormGroup.controls['createtimeControl'].setValue(this.model.profile.createTime);
                this.profileFormGroup.controls['updatetimeControl'].setValue(this.model.profile.updateTime);

                this.timestamp$ = this.timestamp.subscribe(value => 
                    this._ngZone.run(() => {
                        if (this.model?.action === 'create') {
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
                    this.profileFormGroup.controls['idControl'].setValue(HmacSHA256(value, CRYPTO_SECRET_KEY).toString());

                    if (this.model) {
                        this.model.account.username = value;
                    }
                });
            this.passwordControl$ = this.accountFormGroup.controls['passwordControl'].valueChanges
                .subscribe(value => {
                    if (this.model) {
                        this.model.account.password = value;
                    }
                });
            this.idControl$ = this.profileFormGroup.controls['idControl'].valueChanges
                .subscribe(value => {
                    if (this.model) {
                        this.model.profile.id = value;
                    }
                });
            this.nicknameControl$ = this.profileFormGroup.controls['nicknameControl'].valueChanges
                .subscribe(value => {
                    if (this.model) {
                        this.model.profile.nickname = value;
                    }
                });
            this.createtimeControl$ = this.profileFormGroup.controls['createtimeControl'].valueChanges
                .subscribe(value => {
                    if (this.model) {
                        this.model.profile.createTime = value;
                    }
                });
            this.updatetimeControl$ = this.profileFormGroup.controls['updatetimeControl'].valueChanges
                .subscribe(value => {
                    if (this.model) {
                        this.model.profile.updateTime = value;
                    }
                });
        });
    }

}
