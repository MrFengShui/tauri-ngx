import { createFeatureSelector, createSelector } from "@ngrx/store";

import { IDBMetaDataModel, IDBObjectStoreResultModel, IDBState } from "./indexeddb.state";
import { TreeNode } from "primeng/api";

export const IDB_FEATURE_KEY = 'IDB_FEATURE_SELECTOR';

export interface IDBFeatureState {

    databaseFeature: IDBState<TreeNode<IDBMetaDataModel>[] | boolean | null>;
    objectStoreFeature: IDBState<IDBObjectStoreResultModel | string | null>;

}

export const IDB_DATABASE_SELECTOR = createSelector(
    createFeatureSelector(IDB_FEATURE_KEY),
    (state: IDBFeatureState) => state.databaseFeature
);

export const IDB_OBJECT_STORE_SELECTOR = createSelector(
    createFeatureSelector(IDB_FEATURE_KEY),
    (state: IDBFeatureState) => state.objectStoreFeature
);