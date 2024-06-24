import { createReducer, on } from "@ngrx/store";

import { APP_STYLE_CHECK_DONE_ACTION, APP_STYLE_FETCH_DONE_ACTION, APP_STYLE_CHANGE_DONE_ACTION, APP_CONFIG_STYLE_NAME_LOAD_DONE_ACTION, APP_CONFIG_STYLE_COLOR_LOAD_DONE_ACTION, APP_NAVLIST_LOAD_DONE_ACTION, APP_STYLE_THEME_FETCH_DONE_ACTION } from "./app.action";
import { AppConfigReducerState, AppNavlistReducerState, AppStyleReducerState } from "./app.state";

export const APP_STYLE_REDUCER = createReducer<AppStyleReducerState>(
    { action: '', value: null }, 
    on(APP_STYLE_CHECK_DONE_ACTION, (state, props) => 
        ({ ...state, action: props.action, value: props.value })),
    on(APP_STYLE_FETCH_DONE_ACTION, (state, props) => 
        ({ ...state, action: props.action, value: props.value })),
    on(APP_STYLE_THEME_FETCH_DONE_ACTION, (state, props) => 
        ({ ...state, action: props.action, value: props.value })),
    on(APP_STYLE_CHANGE_DONE_ACTION, (state, props) => 
        ({ ...state, action: props.action, value: props.value }))
);

export const APP_CONFIG_REDUCER = createReducer<AppConfigReducerState>(
    { action: '', value: [] },
    on(APP_CONFIG_STYLE_NAME_LOAD_DONE_ACTION, (state, props) => 
        ({ ...state, action: props.action, value: props.value })),
    on(APP_CONFIG_STYLE_COLOR_LOAD_DONE_ACTION, (state, props) => 
        ({ ...state, action: props.action, value: props.value }))
);

export const APP_NAVLIST_REDUCER = createReducer<AppNavlistReducerState>(
    { action: '', value: [] },
    on(APP_NAVLIST_LOAD_DONE_ACTION, (state, props) => 
        ({ ...state, action: props.action, value: props.value })),
);
