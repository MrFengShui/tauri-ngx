import { createFeatureSelector, createSelector } from "@ngrx/store";

import { SortReducerState } from "./sort.state";

export const SORT_FEATURE_KEY: string = 'SORT_FEATURE_SELECTOR';

export interface SortFeatureState {

    feature: SortReducerState;

}

export const SORT_FEATURE_SELECTIOR = createSelector(
    createFeatureSelector(SORT_FEATURE_KEY),
    (state: SortFeatureState) => state.feature
);
