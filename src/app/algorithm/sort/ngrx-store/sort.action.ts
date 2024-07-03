import { createAction, props } from "@ngrx/store";

import { SortMergeWayOptionModel, SortOptionLoadState, SortOrderOptionModel, SortRadixOptionModel } from "./sort.state";
import { LocaleIDType } from "../../../main/ngrx-store/main.state";

export const SORT_ORDER_OPTION_LOAD_ACTION = createAction(
    '[Sort Page Component] Sort Order Option Load Action',
    props<{ localeID: LocaleIDType | string }>()
);

export const SORT_ORDER_OPTION_LOAD_DONE_ACTION = createAction(
    '[Sort Page Component] Sort Order Option Load Done Action',
    props<SortOptionLoadState<SortOrderOptionModel>>()
);

export const SORT_RADIX_OPTION_LOAD_ACTION = createAction(
    '[Sort Page Component] Sort Radix Option Load Action',
    props<{ localeID: LocaleIDType | string }>()
);

export const SORT_RADIX_OPTION_LOAD_DONE_ACTION = createAction(
    '[Sort Page Component] Sort Radix Option Load Done Action',
    props<SortOptionLoadState<SortRadixOptionModel>>()
);

export const SORT_MERGE_WAY_OPTION_LOAD_ACTION = createAction(
    '[Sort Page Component] Sort Merge Way Option Load Action',
    props<{ localeID: LocaleIDType | string }>()
);

export const SORT_MERGE_WAY_OPTION_LOAD_DONE_ACTION = createAction(
    '[Sort Page Component] Sort Merge Way Option Load Done Action',
    props<SortOptionLoadState<SortMergeWayOptionModel>>()
);

