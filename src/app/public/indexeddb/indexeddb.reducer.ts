import { createReducer, on } from "@ngrx/store";
import { TreeNode } from "primeng/api";

import { IDBMetaDataModel, IDBObjectStoreResultModel, IDBState } from "./indexeddb.state";
import { GLOBAL_INDEXEDDB_CREATE_DATABASE_DONE_ACTION, GLOBAL_INDEXEDDB_FIND_ALL_DATABASES_DONE_ACTION, GLOBAL_INDEXEDDB_CREATE_OBJECT_STORE_DONE_ACTION, GLOBAL_INDEXEDDB_FIND_ALL_OBJECT_STORES_DONE_ACTION, GLOBAL_INDEXEDDB_DELETE_DATABASE_DONE_ACTION, GLOBAL_INDEXEDDB_DELETE_ALL_DATABASES_DONE_ACTION, GLOBAL_INDEXEDDB_UPGRADE_DATABASE_DONE_ACTION, GLOBAL_INDEXEDDB_DELETE_OBJECT_STORE_DONE_ACTION, GLOBAL_INDEXEDDB_DELETE_ALL_OBJECT_STORES_DONE_ACTION, GLOBAL_INDEXEDDB_FIND_ALL_DONE_ACTION } from "./indexeddb.action";

export const IDB_DATABASE_REDUCER = createReducer<IDBState<TreeNode<IDBMetaDataModel>[] | boolean | null>>(
    { action: '', result: null, message: '' },
    on(GLOBAL_INDEXEDDB_FIND_ALL_DONE_ACTION, (state, props) => 
        ({ ...state, action: props.action, result: props.result, message: props.message })),
    on(GLOBAL_INDEXEDDB_CREATE_DATABASE_DONE_ACTION, (state, props) => 
        ({ ...state, action: props.action, result: props.result, message: props.message })),
    on(GLOBAL_INDEXEDDB_DELETE_DATABASE_DONE_ACTION, (state, props) => 
        ({ ...state, action: props.action, result: props.result, message: props.message })),
    on(GLOBAL_INDEXEDDB_DELETE_ALL_DATABASES_DONE_ACTION, (state, props) => 
        ({ ...state, action: props.action, result: props.result, message: props.message })),
    on(GLOBAL_INDEXEDDB_UPGRADE_DATABASE_DONE_ACTION, (state, props) => 
        ({ ...state, action: props.action, result: props.result, message: props.message })),
    on(GLOBAL_INDEXEDDB_FIND_ALL_DATABASES_DONE_ACTION, (state, props) => 
        ({ ...state, action: props.action, result: props.result, message: props.message }))
);

export const IDB_OBJECT_STORE_REDUCER = createReducer<IDBState<IDBObjectStoreResultModel | string | null>>(
    { action: '', result: null, message: '' },
    on(GLOBAL_INDEXEDDB_CREATE_OBJECT_STORE_DONE_ACTION, (state, props) => 
        ({ ...state, action: props.action, result: props.result, message: props.message })),
    on(GLOBAL_INDEXEDDB_DELETE_OBJECT_STORE_DONE_ACTION, (state, props) => 
        ({ ...state, action: props.action, result: props.result, message: props.message })),
    on(GLOBAL_INDEXEDDB_DELETE_ALL_OBJECT_STORES_DONE_ACTION, (state, props) => 
        ({ ...state, action: props.action, result: props.result, message: props.message })),
    on(GLOBAL_INDEXEDDB_FIND_ALL_OBJECT_STORES_DONE_ACTION, (state, props) => 
        ({ ...state, action: props.action, result: props.result, message: props.message }))
);