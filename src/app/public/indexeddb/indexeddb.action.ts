import { createAction, props } from "@ngrx/store";
import { TreeNode } from "primeng/api";

import { AuthReducerState } from "../../other/ngrx-store/auth.state";
import { IDBObjectStoreResultModel, IDBMetaDataModel, IDBObjectStoreParamModel } from "./indexeddb.state";

export const GLOBAL_INDEXEDDB_FIND_ALL_ACTION = createAction('[Global IndexedDB Service] Find All Action');

export const GLOBAL_INDEXEDDB_FIND_ALL_DONE_ACTION = createAction(
    '[Global IndexedDB Service] Find All Done Action',
    props<AuthReducerState<TreeNode<IDBMetaDataModel>[]>>()
);

export const GLOBAL_INDEXEDDB_CREATE_DATABASE_ACTION = createAction(
    '[Global IndexedDB Service] Create Database Action',
    props<IDBMetaDataModel>()
);

export const GLOBAL_INDEXEDDB_CREATE_DATABASE_DONE_ACTION = createAction(
    '[Global IndexedDB Service] Create Database Done Action',
    props<AuthReducerState<boolean>>()
);

export const GLOBAL_INDEXEDDB_DELETE_DATABASE_ACTION = createAction(
    '[Global IndexedDB Service] Delete Database Action',
    props<IDBMetaDataModel>()
);

export const GLOBAL_INDEXEDDB_DELETE_DATABASE_DONE_ACTION = createAction(
    '[Global IndexedDB Service] Delete Database Done Action',
    props<AuthReducerState<boolean>>()
);

export const GLOBAL_INDEXEDDB_DELETE_ALL_DATABASES_ACTION = createAction(
    '[Global IndexedDB Service] Delete All Databases Action',
    props<IDBMetaDataModel>()
);

export const GLOBAL_INDEXEDDB_DELETE_ALL_DATABASES_DONE_ACTION = createAction(
    '[Global IndexedDB Service] Delete All Databases Done Action',
    props<AuthReducerState<boolean>>()
);

export const GLOBAL_INDEXEDDB_UPGRADE_DATABASE_ACTION = createAction(
    '[Global IndexedDB Service] Upgrade Database Action',
    props<IDBMetaDataModel>()
);

export const GLOBAL_INDEXEDDB_UPGRADE_DATABASE_DONE_ACTION = createAction(
    '[Global IndexedDB Service] Upgrade Database Done Action',
    props<AuthReducerState<boolean>>()
);

export const GLOBAL_INDEXEDDB_FIND_ALL_DATABASES_ACTION = createAction('[Global IndexedDB Service] Find All Databases Action');

export const GLOBAL_INDEXEDDB_FIND_ALL_DATABASES_DONE_ACTION = createAction(
    '[Global IndexedDB Service] Find All Databases Done Action',
    props<AuthReducerState<TreeNode<IDBMetaDataModel>[]>>()
);




export const GLOBAL_INDEXEDDB_CREATE_OBJECT_STORE_ACTION = createAction(
    '[Global IndexedDB Service] Create Object Store Action',
    props<IDBObjectStoreParamModel>()
);

export const GLOBAL_INDEXEDDB_CREATE_OBJECT_STORE_DONE_ACTION = createAction(
    '[Global IndexedDB Service] Create Object Store Done Action',
    props<AuthReducerState<string | null>>()
);

export const GLOBAL_INDEXEDDB_DELETE_OBJECT_STORE_ACTION = createAction(
    '[Global IndexedDB Service] Delete Object Store Action',
    props<IDBMetaDataModel>()
);

export const GLOBAL_INDEXEDDB_DELETE_OBJECT_STORE_DONE_ACTION = createAction(
    '[Global IndexedDB Service] Delete Object Store Done Action',
    props<AuthReducerState<string | null>>()
);

export const GLOBAL_INDEXEDDB_DELETE_ALL_OBJECT_STORES_ACTION = createAction(
    '[Global IndexedDB Service] Delete All Object Stores Action',
    props<IDBMetaDataModel>()
);

export const GLOBAL_INDEXEDDB_DELETE_ALL_OBJECT_STORES_DONE_ACTION = createAction(
    '[Global IndexedDB Service] Delete All Object Stores Done Action',
    props<AuthReducerState<string | null>>()
);

export const GLOBAL_INDEXEDDB_FIND_ALL_OBJECT_STORES_ACTION = createAction(
    '[Global IndexedDB Service] Find All Object Stores Action',
    props<IDBMetaDataModel>()
);

export const GLOBAL_INDEXEDDB_FIND_ALL_OBJECT_STORES_DONE_ACTION = createAction(
    '[Global IndexedDB Service] Find All Object Stores Done Action',
    props<AuthReducerState<IDBObjectStoreResultModel>>()
);
