import { createFeatureSelector, createSelector } from "@ngrx/store";

import { AuthReducerState } from "./auth.state";

export const AUTH_FEATURE_KEY: string = 'AUTH_FEATURE_SELECTOR';

export interface AuthSelectorState {

    feature: AuthReducerState;

}

export const AUTH_REGISTER_SELECTOR = createSelector(
    createFeatureSelector(AUTH_FEATURE_KEY),
    (state: AuthSelectorState) => state.feature
);