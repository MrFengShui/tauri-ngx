import { createFeatureSelector, createSelector } from "@ngrx/store";
import { TreeNode } from "primeng/api";

import { HomeReducerState, RouteUrlParam } from "./main.state";

export const HOME_FEATURE_KEY = 'HOME_FEATURE_KEY';

export interface HomeSelectorFeatureState {

    optionsLoadFeature: HomeReducerState;
    navlistLoadFeature: HomeReducerState<TreeNode<RouteUrlParam>>;

}

export const HOME_OPTION_LOAD_FEATURE_SELECTOR = createSelector(
    createFeatureSelector(HOME_FEATURE_KEY),
    (state: HomeSelectorFeatureState) => state.optionsLoadFeature
);

export const HOME_NAVLIST_LOAD_FEATURE_SELECTOR = createSelector(
    createFeatureSelector(HOME_FEATURE_KEY),
    (state: HomeSelectorFeatureState) => state.navlistLoadFeature
);