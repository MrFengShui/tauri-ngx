import { createAction, props } from "@ngrx/store";

import { SortOptionLoadState } from "./sort.state";

export const SORT_ORDER_OPTION_LOAD_ACTION = createAction('[Sort Page Component] Sort Order Option Load Action');

export const SORT_ORDER_OPTION_LOAD_DONE_ACTION = createAction(
    '[Sort Page Component] Sort Order Option Load Done Action',
    props<SortOptionLoadState>()
);

export const SORT_RADIX_OPTION_LOAD_ACTION = createAction('[Sort Page Component] Sort Radix Option Load Action');

export const SORT_RADIX_OPTION_LOAD_DONE_ACTION = createAction(
    '[Sort Page Component] Sort Radix Option Load Done Action',
    props<SortOptionLoadState>()
);

export const SORT_MERGE_WAY_OPTION_LOAD_ACTION = createAction('[Sort Page Component] Sort Merge Way Option Load Action');

export const SORT_MERGE_WAY_OPTION_LOAD_DONE_ACTION = createAction(
    '[Sort Page Component] Sort Merge Way Option Load Done Action',
    props<SortOptionLoadState>()
);

