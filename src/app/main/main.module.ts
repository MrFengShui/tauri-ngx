import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FormsModule } from "@angular/forms";
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

import { HomeNavListLoadService, HomeOptionLoadService } from "./ngrx-store/main.service";

import { HomeLoadNavListEffect } from "./ngrx-store/main.effect";
import { HomeLoadStyleOptionEffect } from "./ngrx-store/main.effect";
import { HOME_FEATURE_KEY } from "./ngrx-store/main.selector";
import { HOME_NAVLIST_LOAD_REDUCER, HOME_OPTION_LOAD_REDUCER } from "./ngrx-store/main.reducer";

@NgModule({
    declarations: [
        DashboardPageComponent,
        HomePageComponent
    ],
    imports: [
        CommonModule,
        FormsModule,
        RouterModule,

        EffectsModule.forFeature(HomeLoadStyleOptionEffect, HomeLoadNavListEffect),
        StoreModule.forFeature(HOME_FEATURE_KEY, {
            'optionsLoadFeature': HOME_OPTION_LOAD_REDUCER,
            'navlistLoadFeature': HOME_NAVLIST_LOAD_REDUCER
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
    ],
    providers: [ HomeOptionLoadService, HomeNavListLoadService ]
})
export class MainModule {

}