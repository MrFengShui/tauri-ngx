import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { RouterModule } from "@angular/router";
import { StoreModule } from "@ngrx/store";
import { EffectsModule } from "@ngrx/effects";

import { AvatarModule } from 'primeng/avatar';
import { AvatarGroupModule } from 'primeng/avatargroup';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DataViewModule } from 'primeng/dataview';
import { DividerModule } from 'primeng/divider';
import { DialogModule } from 'primeng/dialog';
import { DialogService, DynamicDialogModule } from 'primeng/dynamicdialog';
import { FileUploadModule } from 'primeng/fileupload';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { ImageModule } from 'primeng/image';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { InputNumberModule } from 'primeng/inputnumber';
import { PasswordModule } from 'primeng/password';
import { PanelModule } from 'primeng/panel';
import { ProgressBarModule } from 'primeng/progressbar';
import { RippleModule } from 'primeng/ripple';
import { InputTextModule } from 'primeng/inputtext';
import { ScrollerModule } from 'primeng/scroller';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { ConfirmationService, MessageService } from "primeng/api";

import { EmptyHolderComponent } from "./public/empty.component";
import { ErrorPageComponent } from "./error/error.component";
import { SplashScreenPageComponent } from "./splash-screen/splash-screen.component";
import { LoginPageComponent } from "./login/login.component";
import { RegisterPageComponent } from "./register/register.component";
import { RegisterDialogComponent } from "./register/register.dialog.component";

import { AuthIndexedDBService, AuthPermitionForRegisterPageService } from "./ngrx-store/auth.service";

import { AUTH_FEATURE_KEY } from "./ngrx-store/auth.selector";
import { AUTH_REDUCER } from "./ngrx-store/auth.reducer";
import { AuthEffect } from "./ngrx-store/auth.effect";

@NgModule({
    declarations: [
        EmptyHolderComponent,
        ErrorPageComponent,
        LoginPageComponent,
        RegisterPageComponent,
        RegisterDialogComponent,
        SplashScreenPageComponent
    ],
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        RouterModule,

        EffectsModule.forFeature([AuthEffect]),
        StoreModule.forFeature(AUTH_FEATURE_KEY, { 'feature': AUTH_REDUCER }),

        AvatarModule,
        AvatarGroupModule,
        ButtonModule,
        CardModule,
        ConfirmDialogModule,
        DataViewModule,
        DividerModule,
        DialogModule,
        DynamicDialogModule,
        FileUploadModule,
        IconFieldModule,
        InputIconModule,
        InputNumberModule,
        ImageModule,
        InputTextModule,
        InputGroupModule,
        InputGroupAddonModule,
        PasswordModule,
        PanelModule,
        ProgressBarModule,
        RippleModule,
        ScrollerModule,
        TagModule,
        ToastModule,
        TooltipModule
    ],
    exports: [
        EmptyHolderComponent,
        ErrorPageComponent,
        LoginPageComponent,
        RegisterPageComponent,
        RegisterDialogComponent,
        SplashScreenPageComponent
    ],
    providers: [ConfirmationService, DialogService, MessageService, AuthIndexedDBService, AuthPermitionForRegisterPageService]
})
export class OtherModule { }