import { createFeatureSelector, createSelector } from "@ngrx/store";

import { SortOptionLoadState } from "./sort.state";

export const SORT_OPTION_FEATURE_KEY: string = 'SORT_OPTION_FEATURE_SELECTOR';

export interface SortOptionFeatureState {

    feature: SortOptionLoadState;

}

export const SORT_OPTION_LOAD_SELECTOR = createSelector(
    createFeatureSelector(SORT_OPTION_FEATURE_KEY),
    (state: SortOptionFeatureState) => state.feature
);


