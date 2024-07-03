import { createAction, props } from '@ngrx/store';

import { AppStyleModel, AppReducerState, ThemeType, ColorType } from './app.state';

export const APP_STYLE_LOAD_ACTION = createAction('[App Component] Style Load Action');

export const APP_STYLE_LOAD_DONE_ACTION = createAction(
    '[App Component] Style Load Done Action', 
    props<AppReducerState<AppStyleModel>>()
);

export const APP_STYLE_MODE_LOAD_ACTION = createAction('[App Component] Style Mode Load Action');

export const APP_STYLE_MODE_LOAD_DONE_ACTION = createAction(
    '[App Component] Style Mode Load Done Action', 
    props<AppReducerState<boolean>>()
);

export const APP_STYLE_NAME_LOAD_ACTION = createAction('[App Component] Style Name Load Action');

export const APP_STYLE_NAME_LOAD_DONE_ACTION = createAction(
    '[App Component] Style Name Load Done Action', 
    props<AppReducerState<string>>()
);

export const APP_STYLE_THEME_LOAD_ACTION = createAction('[App Component] Style Theme Load Action');

export const APP_STYLE_THEME_LOAD_DONE_ACTION = createAction(
    '[App Component] Style Theme Load Done Action', 
    props<AppReducerState<ThemeType>>()
);

export const APP_STYLE_COLOR_LOAD_ACTION = createAction('[App Component] Style Color Load Action');

export const APP_STYLE_COLOR_LOAD_DONE_ACTION = createAction(
    '[App Component] Style Color Load Done Action', 
    props<AppReducerState<ColorType>>()
);

export const APP_STYLE_CHECK_ACTION = createAction('[App Component] Style Check Action');

export const APP_STYLE_CHECK_DONE_ACTION = createAction(
    '[App Component] Style Check Done Action', 
    props<AppReducerState<boolean>>()
);

export const APP_STYLE_SAVE_ACTION = createAction(
    '[App Component] Style Save Action', 
    props<AppStyleModel>()
);

export const APP_STYLE_SAVE_DONE_ACTION = createAction(
    '[App Component] Style Save Done Action', 
    props<AppReducerState<AppStyleModel>>()
);


