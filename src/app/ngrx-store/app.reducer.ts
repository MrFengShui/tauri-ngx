import { createReducer, on } from "@ngrx/store";

import { APP_STYLE_CHECK_DONE_ACTION, APP_STYLE_COLOR_LOAD_DONE_ACTION, APP_STYLE_LOAD_DONE_ACTION, APP_STYLE_MODE_LOAD_DONE_ACTION, APP_STYLE_NAME_LOAD_DONE_ACTION, APP_STYLE_SAVE_DONE_ACTION, APP_STYLE_THEME_LOAD_DONE_ACTION } from "./app.action";
import { AppReducerState } from "./app.state";

export const APP_STYLE_REDUCER = createReducer<AppReducerState>(
    { action: '', result: null, message: '' }, 
    on(APP_STYLE_CHECK_DONE_ACTION, (state, props) => 
        ({ ...state, action: props.action, result: props.result, message: props.message })),
    on(APP_STYLE_LOAD_DONE_ACTION, (state, props) => 
        ({ ...state, action: props.action, result: props.result, message: props.message })),
    on(APP_STYLE_MODE_LOAD_DONE_ACTION, (state, props) => 
        ({ ...state, action: props.action, result: props.result, message: props.message })),
    on(APP_STYLE_NAME_LOAD_DONE_ACTION, (state, props) => 
        ({ ...state, action: props.action, result: props.result, message: props.message })),
    on(APP_STYLE_THEME_LOAD_DONE_ACTION, (state, props) => 
        ({ ...state, action: props.action, result: props.result, message: props.message })),
    on(APP_STYLE_COLOR_LOAD_DONE_ACTION, (state, props) => 
        ({ ...state, action: props.action, result: props.result, message: props.message })),
    on(APP_STYLE_SAVE_DONE_ACTION, (state, props) => 
        ({ ...state, action: props.action, result: props.result, message: props.message }))
);

