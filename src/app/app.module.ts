import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { NgModule, isDevMode } from "@angular/core";
import { CommonModule } from "@angular/common";
import { HttpClientModule } from "@angular/common/http";
import { FormsModule } from "@angular/forms";
import { BrowserModule } from "@angular/platform-browser";
import { RouterModule } from "@angular/router";
import { EffectsModule } from "@ngrx/effects";
import { StoreModule } from "@ngrx/store";
import { StoreDevtoolsModule } from '@ngrx/store-devtools';

import { AccordionModule } from 'primeng/accordion';
import { AvatarModule } from 'primeng/avatar';
import { BadgeModule } from 'primeng/badge';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { ScrollPanelModule } from 'primeng/scrollpanel';
import { SplitterModule } from 'primeng/splitter';
import { ToggleButtonModule } from 'primeng/togglebutton';
import { ToolbarModule } from 'primeng/toolbar';
import { TreeModule } from 'primeng/tree';

import { AppComponent } from "./app.component";

import { AppRouteModule } from "./app-route.module";
import { AlgorithmModule } from "./algorithm/algo.module";
import { MainModule } from "./main/main.module";
import { OtherModule } from "./other/other.module";

import { AppStyleService } from "./ngrx-store/app.service";
import { IDBDatabaseService, IDBObjectStoreService } from "./public/indexeddb/indexeddb.service";
import { AppStyleEffect } from "./ngrx-store/app.effect";
import { APP_FEATURE_KEY } from "./ngrx-store/app.selector";
import { APP_STYLE_REDUCER } from "./ngrx-store/app.reducer";
import { IDBDatabaseEffect, IDBObjectStoreEffect } from "./public/indexeddb/indexeddb.effect";
import { IDB_OBJECT_STORE_REDUCER } from "./public/indexeddb/indexeddb.reducer";
import { IDB_FEATURE_KEY } from "./public/indexeddb/indexeddb.selector";

@NgModule({
    declarations: [
        AppComponent
    ],
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        CommonModule,
        FormsModule,
        HttpClientModule,
        RouterModule,
        AppRouteModule,

        EffectsModule.forRoot(AppStyleEffect, IDBDatabaseEffect, IDBObjectStoreEffect),
        StoreModule.forRoot([], {
            runtimeChecks: {
                strictActionImmutability: true,
                strictActionSerializability: true,
                strictActionTypeUniqueness: true,
                strictStateImmutability: true,
                strictStateSerializability: true,
                strictActionWithinNgZone: true
            }
        }),
        StoreModule.forFeature(APP_FEATURE_KEY, { 'feature': APP_STYLE_REDUCER }),
        StoreDevtoolsModule.instrument({
            autoPause: true,
            connectInZone: true,
            logOnly: !isDevMode(),
            trace: false,
            traceLimit: 128,
        }),

        AccordionModule,
        AvatarModule,
        BadgeModule,
        ButtonModule,
        DropdownModule,
        ScrollPanelModule,
        SplitterModule,
        ToggleButtonModule,
        ToolbarModule,
        TreeModule,

        AlgorithmModule,
        MainModule,
        OtherModule
    ],
    providers: [
        AppStyleService, IDBDatabaseService, IDBObjectStoreService
    ],
    bootstrap: [AppComponent]
})
export class AppModule { }