import { createFeatureSelector, createSelector } from "@ngrx/store";

import { AppConfigReducerState, AppNavlistReducerState, AppStyleReducerState } from "./app.state";

export const APP_FEATURE_KEY: string = 'APP_FEATURE_SELECTOR';

export interface AppFeatureState {

    configFeature: AppConfigReducerState;
    styleFeature: AppStyleReducerState;
    navlistFeature: AppNavlistReducerState;

}

export const APP_FEATURE_SELECTOR = createSelector(
    createFeatureSelector(APP_FEATURE_KEY),
    (state: AppFeatureState) => state,
);
