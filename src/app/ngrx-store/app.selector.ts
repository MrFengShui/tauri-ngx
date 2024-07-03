import { createFeatureSelector, createSelector } from "@ngrx/store";

import { AppReducerState } from "./app.state";

export const APP_FEATURE_KEY: string = 'APP_FEATURE_SELECTOR';

export interface AppFeatureState {

    feature: AppReducerState;

}

export const APP_FEATURE_SELECTOR = createSelector(
    createFeatureSelector(APP_FEATURE_KEY),
    (state: AppFeatureState) => state.feature,
);
