import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { NgModule, isDevMode } from "@angular/core";
import { APP_BASE_HREF, CommonModule } from "@angular/common";
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

import { AppConfigService, AppNavlistService, AppStyleService } from "./ngrx-store/app.service";

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

        EffectsModule.forRoot(),
        StoreModule.forRoot(),
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
        AppConfigService, AppStyleService, AppNavlistService,
        // { 
        //     provide: APP_BASE_HREF, 
        //     useValue: () => window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
        //         ? 'tauri-app/simplified-chinese' 
        //         : './'
        // }
    ],
    bootstrap: [AppComponent]
})
export class AppModule { }