import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { RouterModule } from "@angular/router";
import { StoreModule } from "@ngrx/store";
import { EffectsModule } from "@ngrx/effects";

import { DropdownModule } from "primeng/dropdown";
import { ButtonModule } from "primeng/button";
import { ToggleButtonModule } from "primeng/togglebutton";
import { ToolbarModule } from "primeng/toolbar";
import { TreeModule } from "primeng/tree";

import { HomePageComponent } from "./home/home.component";
import { DashboardPageComponent } from "./dashboard/dashboard.component";

import { AppConfigEffect, AppStyleEffect, AppNavlistEffect } from "../ngrx-store/app.effect";
import { APP_CONFIG_REDUCER, APP_STYLE_REDUCER, APP_NAVLIST_REDUCER } from "../ngrx-store/app.reducer";
import { APP_FEATURE_KEY } from "../ngrx-store/app.selector";

@NgModule({
    declarations: [
        DashboardPageComponent,
        HomePageComponent
    ],
    imports: [
        CommonModule,
        FormsModule,
        RouterModule,

        EffectsModule.forFeature(AppConfigEffect, AppStyleEffect, AppNavlistEffect),
        StoreModule.forFeature(APP_FEATURE_KEY, {
            'configFeature': APP_CONFIG_REDUCER,
            'styleFeature': APP_STYLE_REDUCER,
            'navlistFeature': APP_NAVLIST_REDUCER
        }),

        ButtonModule,
        DropdownModule,
        ToggleButtonModule,
        ToolbarModule,
        TreeModule
    ],
    exports: [
        DashboardPageComponent,
        HomePageComponent
    ]
})
export class MainModule {

}