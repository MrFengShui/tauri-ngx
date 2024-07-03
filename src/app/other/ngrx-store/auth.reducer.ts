import { createReducer, on } from "@ngrx/store";

import { AuthReducerState } from "./auth.state";
import { 
    AUTH_ADD_USER_DONE_ACTION, 
    AUTH_FIND_ALL_USERS_DONE_ACTION, 
    AUTH_MODIFY_USER_DONE_ACTION, 
    AUTH_REMOVE_ALL_USERS_DONE_ACTION, 
    AUTH_REMOVE_USER_DONE_ACTION} from "./auth.action";

export const AUTH_REDUCER = createReducer<AuthReducerState>(
    { action: '', result: [], message: '' },
    on(AUTH_ADD_USER_DONE_ACTION, (state, props) => 
        ({ ...state, action: props.action, result: props.result, message: props.message })),
    on(AUTH_REMOVE_ALL_USERS_DONE_ACTION, (state, props) => 
        ({ ...state, action: props.action, result: props.result, message: props.message })),
    on(AUTH_REMOVE_USER_DONE_ACTION, (state, props) => 
        ({ ...state, action: props.action, result: props.result, message: props.message })),
    on(AUTH_MODIFY_USER_DONE_ACTION, (state, props) => 
        ({ ...state, action: props.action, result: props.result, message: props.message })),
    on(AUTH_FIND_ALL_USERS_DONE_ACTION, (state, props) => 
        ({ ...state, action: props.action, result: props.result, message: props.message }))
);