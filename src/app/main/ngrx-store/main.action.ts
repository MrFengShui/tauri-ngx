import { createAction, props } from "@ngrx/store";
import { TreeNode } from "primeng/api";

import { HomeReducerState, LocaleIDType, LocaleOptionModel, RouteUrlParam, StyleColorOptionModel, StyleNameOptionModel } from "./main.state";

export const HOME_STYLE_NAME_OPTION_LOAD_ACTION = createAction(
    '[Home Page Component] Style Name Option Load Action',
    props<{ localeID: LocaleIDType | string }>()
);

export const HOME_STYLE_NAME_OPTION_LOAD_DONE_ACTION = createAction(
    '[Home Page Component] Style Name Option Load Done Action',
    props<HomeReducerState<StyleNameOptionModel>>()
);

export const HOME_STYLE_COLOR_OPTION_LOAD_ACTION = createAction(
    '[Home Page Component] Style Color Option Load Action',
    props<{ localeID: LocaleIDType | string }>()
);

export const HOME_STYLE_COLOR_OPTION_LOAD_DONE_ACTION = createAction(
    '[Home Page Component] Style Color Option Load Done Action',
    props<HomeReducerState<StyleColorOptionModel>>()
);

export const HOME_LOCALE_OPTION_LOAD_ACTION = createAction(
    '[Home Page Component] Locale Option Load Action',
    props<{ localeID: LocaleIDType | string }>()
);

export const HOME_LOCALE_OPTION_LOAD_DONE_ACTION = createAction(
    '[Home Page Component] Locale Option Load Done Action',
    props<HomeReducerState<LocaleOptionModel>>()
);

export const HONE_NAVLIST_LOAD_ACTION = createAction(
    '[Home Page Component] Navlist Load Action',
    props<{ localeID: LocaleIDType | string }>()
);

export const Home_NAVLIST_LOAD_DONE_ACTION = createAction(
    '[Home Page Component] Navlist Load Done Action',
    props<HomeReducerState<TreeNode<RouteUrlParam>>>()
);

