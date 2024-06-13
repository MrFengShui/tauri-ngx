import { createAction, props } from "@ngrx/store";

import { AuthAccountProfileModel, AuthReducerState } from "./auth.state";

export const AUTH_CREATE_DATABASE_AND_STORE_ACTION = createAction(
    '[Auth IndexedDB Service] Create Database And Store Action',
    props<{ version: number }>()
);

export const AUTH_CREATE_DATABASE_AND_STORE_DONE_ACTION = createAction(
    '[Auth IndexedDB Service] Create Database And Store Done Action',
    props<AuthReducerState>()
);

export const AUTH_ADD_USER_ACTION = createAction(
    '[Auth IndexedDB Service] Add User Action',
    props<AuthAccountProfileModel>()
);

export const AUTH_ADD_USER_DONE_ACTION = createAction(
    '[Auth IndexedDB Service] Add User Done Action',
    props<AuthReducerState>()
);

export const AUTH_REMOVE_USER_ACTION = createAction(
    '[Auth IndexedDB Service] Remove User Action',
    props<{ accountKey: IDBValidKey | IDBKeyRange, profileKey: IDBValidKey | IDBKeyRange }>()
);

export const AUTH_REMOVE_USER_DONE_ACTION = createAction(
    '[Auth IndexedDB Service] Remove User Done Action',
    props<AuthReducerState>()
);

export const AUTH_REMOVE_ALL_USERS_ACTION = createAction('[Auth IndexedDB Service] Remove All Users Action');

export const AUTH_REMOVE_ALL_USERS_DONE_ACTION = createAction(
    '[Auth IndexedDB Service] Remove All Users Done Action',
    props<AuthReducerState>()
);

export const AUTH_MODIFY_USER_ACTION = createAction(
    '[Auth IndexedDB Service] Modify User Action',
    props<AuthAccountProfileModel>()
);

export const AUTH_MODIFY_USER_DONE_ACTION = createAction(
    '[Auth IndexedDB Service] Modify User Done Action',
    props<AuthReducerState>()
);

export const AUTH_FIND_USER_ACTION = createAction(
    '[Auth IndexedDB Service] Find User Action',
    props<{ accountKey: IDBValidKey | IDBKeyRange, profileKey: IDBValidKey | IDBKeyRange }>()
);

export const AUTH_FIND_USER_DONE_ACTION = createAction(
    '[Auth IndexedDB Service] Find User Done Action',
    props<AuthReducerState>()
);

export const AUTH_FIND_ALL_USERS_ACTION = createAction('[Auth IndexedDB Service] Find All Users Action');

export const AUTH_FIND_ALL_USERS_DONE_ACTION = createAction(
    '[Auth IndexedDB Service] Find All Users Done Action',
    props<AuthReducerState>()
);