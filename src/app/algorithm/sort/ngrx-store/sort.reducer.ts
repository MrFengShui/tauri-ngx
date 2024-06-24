import { createReducer, on } from "@ngrx/store";

import { SORT_MERGE_WAY_OPTION_LOAD_DONE_ACTION, SORT_ORDER_OPTION_LOAD_DONE_ACTION, SORT_RADIX_OPTION_LOAD_DONE_ACTION } from "./sort.action";
import { SortOptionLoadState } from "./sort.state";

export const SORT_OPTION_LOAD_REDUCER = createReducer<SortOptionLoadState>(
    { action: '', value: [] },
    on(SORT_ORDER_OPTION_LOAD_DONE_ACTION, (state, props) => ({ ...state, action: props.action, value: props.value })),
    on(SORT_RADIX_OPTION_LOAD_DONE_ACTION, (state, props) => ({ ...state, action: props.action, value: props.value })),
    on(SORT_MERGE_WAY_OPTION_LOAD_DONE_ACTION, (state, props) => ({ ...state, action: props.action, value: props.value }))
);