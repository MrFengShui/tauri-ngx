import { createAction, props } from '@ngrx/store';

import { AppConfigReducerState, AppNavlistReducerState, AppStyleReducerState, AppStyleStructModel } from './app.state';
/**
 *  
 */
export const APP_STYLE_CHECK_ACTION = createAction('[App Component] Style Check Action');

export const APP_STYLE_CHECK_DONE_ACTION = createAction(
    '[App Component] Style Check Done Action', 
    props<AppStyleReducerState>()
);

export const APP_STYLE_FETCH_ACTION = createAction('[App Component] Style Fetch Action');

export const APP_STYLE_FETCH_DONE_ACTION = createAction(
    '[App Component] Style Fetch Done Action', 
    props<AppStyleReducerState>()
);

export const APP_STYLE_THEME_FETCH_ACTION = createAction('[App Component] Style Theme Fetch Action');

export const APP_STYLE_THEME_FETCH_DONE_ACTION = createAction(
    '[App Component] Style Theme Fetch Done Action', 
    props<AppStyleReducerState>()
);

export const APP_STYLE_CHANGE_ACTION = createAction(
    '[App Component] Style Change Action', 
    props<AppStyleStructModel>()
);

export const APP_STYLE_CHANGE_DONE_ACTION = createAction(
    '[App Component] Style Change Done Action', 
    props<AppStyleReducerState>()
);

export const APP_CONFIG_STYLE_NAME_LOAD_ACTION = createAction('[App Component] Config Style Name Load Action');

export const APP_CONFIG_STYLE_NAME_LOAD_DONE_ACTION = createAction(
    '[App Component] Config Style Name Load Done Action', 
    props<AppConfigReducerState>()
);

export const APP_CONFIG_STYLE_COLOR_LOAD_ACTION = createAction('[App Component] Config Style Color Load Action');

export const APP_CONFIG_STYLE_COLOR_LOAD_DONE_ACTION = createAction(
    '[App Component] Config Style Color Load Done Action', 
    props<AppConfigReducerState>()
);

export const APP_NAVLIST_LOAD_ACTION = createAction('[App Component] Navlist Load Action');

export const APP_NAVLIST_LOAD_DONE_ACTION = createAction(
    '[App Component] Navlist Load Done Action', 
    props<AppNavlistReducerState>()
);

