import { createReducer, on } from "@ngrx/store";
import { TreeNode } from "primeng/api";

import { HomeReducerState, RouteUrlParam } from "./main.state";
import { HOME_LOCALE_OPTION_LOAD_DONE_ACTION, HOME_STYLE_COLOR_OPTION_LOAD_DONE_ACTION, HOME_STYLE_NAME_OPTION_LOAD_DONE_ACTION, Home_NAVLIST_LOAD_DONE_ACTION } from "./main.action";

export const HOME_OPTION_LOAD_REDUCER = createReducer<HomeReducerState>(
    { action: '', result: [], message: '' },
    on(HOME_STYLE_NAME_OPTION_LOAD_DONE_ACTION, (state, props) => 
        ({ ...state, action: props.action, result: props.result, message: props.message })),
    on(HOME_STYLE_COLOR_OPTION_LOAD_DONE_ACTION, (state, props) => 
        ({ ...state, action: props.action, result: props.result, message: props.message })),
    on(HOME_LOCALE_OPTION_LOAD_DONE_ACTION, (state, props) => 
        ({ ...state, action: props.action, result: props.result, message: props.message }))
);

export const HOME_NAVLIST_LOAD_REDUCER = createReducer<HomeReducerState<TreeNode<RouteUrlParam>>>(
    { action: '', result: [], message: '' },
    on(Home_NAVLIST_LOAD_DONE_ACTION, (state, props) => 
        ({ ...state, action: props.action, result: props.result, message: props.message }))
);
