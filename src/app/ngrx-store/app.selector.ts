import { createFeatureSelector, createSelector } from "@ngrx/store";

import { AppConfigReducerState, AppStyleReducerState } from "./app.state";

export const APP_FEATURE_KEY: string = 'APP_FEATURE_SELECTOR';

export interface AppFeatureState {

    configFeature: AppConfigReducerState;
    styleFeatuer: AppStyleReducerState;

}

export const APP_FEATURE_SELECTOR = createSelector(
    createFeatureSelector(APP_FEATURE_KEY),
    (state: AppFeatureState) => state,
);
