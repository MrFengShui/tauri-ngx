import { createReducer, on, props } from "@ngrx/store";

import { AuthReducerState } from "./auth.state";
import { 
    AUTH_ADD_USER_DONE_ACTION, 
    AUTH_CREATE_DATABASE_AND_STORE_DONE_ACTION, 
    AUTH_FIND_ALL_USERS_DONE_ACTION, 
    AUTH_MODIFY_USER_DONE_ACTION, 
    AUTH_REMOVE_ALL_USERS_DONE_ACTION, 
    AUTH_REMOVE_USER_DONE_ACTION 
} from "./auth.action";

export const AUTH_REDUCER = createReducer<AuthReducerState>(
    { action: '', value: [] },
    on(AUTH_CREATE_DATABASE_AND_STORE_DONE_ACTION, (state, props) => 
        ({ ...state, action: props.action, value: props.value, response: props.response })),
    on(AUTH_ADD_USER_DONE_ACTION, (state, props) => 
        ({ ...state, action: props.action, value: props.value, response: props.response })),
    on(AUTH_REMOVE_ALL_USERS_DONE_ACTION, (state, props) => 
        ({ ...state, action: props.action, value: props.value, response: props.response })),
    on(AUTH_REMOVE_USER_DONE_ACTION, (state, props) => 
        ({ ...state, action: props.action, value: props.value, response: props.response })),
    on(AUTH_MODIFY_USER_DONE_ACTION, (state, props) => 
        ({ ...state, action: props.action, value: props.value, response: props.response })),
    on(AUTH_FIND_ALL_USERS_DONE_ACTION, (state, props) => 
        ({ ...state, action: props.action, value: props.value, response: props.response }))
);