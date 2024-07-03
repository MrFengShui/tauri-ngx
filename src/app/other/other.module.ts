import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { RouterModule } from "@angular/router";
import { StoreModule } from "@ngrx/store";
import { EffectsModule } from "@ngrx/effects";

import { AvatarModule } from 'primeng/avatar';
import { AvatarGroupModule } from 'primeng/avatargroup';
import { ButtonModule } from 'primeng/button';
import { ButtonGroupModule } from 'primeng/buttongroup';
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
import { InputSwitchModule } from 'primeng/inputswitch';
import { PasswordModule } from 'primeng/password';
import { PanelModule } from 'primeng/panel';
import { ProgressBarModule } from 'primeng/progressbar';
import { RippleModule } from 'primeng/ripple';
import { InputTextModule } from 'primeng/inputtext';
import { ScrollerModule } from 'primeng/scroller';
import { TabViewModule } from 'primeng/tabview';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { TreeModule } from "primeng/tree";
import { ConfirmationService, MessageService } from "primeng/api";

import { EmptyHolderComponent } from "./public/empty.component";
import { TreeListComponent, TreeNodeComponent } from "./public/tree.component";
import { AboutPageComponent } from "./about/about.component";
import { ErrorPageComponent } from "./error/error.component";
import { SplashScreenPageComponent } from "./splash-screen/splash-screen.component";
import { LoginPageComponent } from "./login/login.component";
import { RegisterPageComponent } from "./register/register.component";
import { RegisterCreateDatabseDialogComponent, RegisterCreateObjectStoreDialogComponent, RegisterDialogComponent } from "./register/register.dialog.component";

import { AuthRegisterService } from "./ngrx-store/auth.service";
import { AuthPermitionForRegisterPageService } from "./login/login.service";
import { IDBDatabaseService, IDBObjectStoreService, IDBPersistService } from "../public/indexeddb/indexeddb.service";

import { AUTH_FEATURE_KEY } from "./ngrx-store/auth.selector";
import { AUTH_REDUCER } from "./ngrx-store/auth.reducer";
import { AuthRegisterEffect } from "./ngrx-store/auth.effect";
import { IDB_FEATURE_KEY } from "../public/indexeddb/indexeddb.selector";
import { IDB_DATABASE_REDUCER, IDB_OBJECT_STORE_REDUCER } from "../public/indexeddb/indexeddb.reducer";
import { IDBDatabaseEffect, IDBObjectStoreEffect } from "../public/indexeddb/indexeddb.effect";

@NgModule({
    declarations: [
        EmptyHolderComponent,
        TreeListComponent,
        TreeNodeComponent,

        AboutPageComponent,
        ErrorPageComponent,
        LoginPageComponent,
        RegisterPageComponent,
        RegisterDialogComponent,
        RegisterCreateDatabseDialogComponent,
        RegisterCreateObjectStoreDialogComponent,
        SplashScreenPageComponent
    ],
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        RouterModule,

        EffectsModule.forFeature([AuthRegisterEffect, IDBDatabaseEffect, IDBObjectStoreEffect]),
        StoreModule.forFeature(AUTH_FEATURE_KEY, { 'feature': AUTH_REDUCER }),
        StoreModule.forFeature(IDB_FEATURE_KEY, { 
            'databaseFeature': IDB_DATABASE_REDUCER,
            'objectStoreFeature': IDB_OBJECT_STORE_REDUCER
        }),

        AvatarModule,
        AvatarGroupModule,
        ButtonModule,
        ButtonGroupModule,
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
        InputSwitchModule,
        PasswordModule,
        PanelModule,
        ProgressBarModule,
        RippleModule,
        ScrollerModule,
        TabViewModule,
        TagModule,
        ToastModule,
        TooltipModule,
        TreeModule
    ],
    exports: [
        EmptyHolderComponent,
        TreeListComponent,

        AboutPageComponent,
        ErrorPageComponent,
        LoginPageComponent,
        RegisterPageComponent,
        SplashScreenPageComponent
    ],
    providers: [
        ConfirmationService, DialogService, MessageService, 
        AuthRegisterService, AuthPermitionForRegisterPageService,
        IDBDatabaseService, IDBObjectStoreService, IDBPersistService
    ]
})
export class OtherModule { }