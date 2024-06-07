import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { NgModule, isDevMode } from "@angular/core";
import { APP_BASE_HREF, CommonModule } from "@angular/common";
import { HttpClientModule } from "@angular/common/http";
import { FormsModule } from "@angular/forms";
import { BrowserModule } from "@angular/platform-browser";
import { RouterModule } from "@angular/router";
import { StoreRouterConnectingModule, routerReducer } from '@ngrx/router-store';
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
import { HomePageComponent } from "./home/home.component";

import { AppRouteModule } from "./app-route.module";
import { AlgorithmModule } from "./algorithm/algo.module";
import { OtherModule } from "./other/other.module";

import { AppConfigService, AppStyleService } from "./app.service";

import { APP_FEATURE_KEY } from "./ngrx-store/app.selector";
import { APP_CONFIG_REDUCER, APP_STYLE_REDUCER } from "./ngrx-store/app.reducer";
import { AppConfigEffect, AppStyleEffect } from "./ngrx-store/app.effect";

@NgModule({
    declarations: [
        AppComponent,
        HomePageComponent
    ],
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        CommonModule,
        FormsModule,
        HttpClientModule,
        RouterModule,
        AppRouteModule,

        EffectsModule.forRoot([AppConfigEffect, AppStyleEffect]),
        StoreModule.forRoot({ reducer: routerReducer }),
        StoreModule.forFeature(APP_FEATURE_KEY, {
            'configFeature': APP_CONFIG_REDUCER,
            'styleFeatuer': APP_STYLE_REDUCER
        }),
        StoreRouterConnectingModule.forRoot(),
        StoreDevtoolsModule.instrument({
            autoPause: true,
            connectInZone: false,
            logOnly: !isDevMode(),
            maxAge: 32,
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
        OtherModule
    ],
    providers: [
        { provide: APP_BASE_HREF, useValue: '/tauri-app' },
        AppConfigService, AppStyleService
    ],
    bootstrap: [AppComponent]
})
export class AppModule { }