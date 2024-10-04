import { createFeatureSelector, createSelector } from "@ngrx/store";

import { SortDataExportModel, SortDataImportModel, SortDataModel, SortOptionModel, SortResultState } from "./sort.state";

export const SORT_RESULT_FEATURE_KEY: string = 'SORT_RESULT_FEATURE_SELECTOR';

export interface SortResultFeatureState {

    feature: SortResultState<SortOptionModel | SortDataImportModel | SortDataExportModel | SortDataModel[]>;

}

export const SORT_OPTION_LOAD_SELECTOR = createSelector(
    createFeatureSelector(SORT_RESULT_FEATURE_KEY),
    (state: SortResultFeatureState) => state.feature
);


