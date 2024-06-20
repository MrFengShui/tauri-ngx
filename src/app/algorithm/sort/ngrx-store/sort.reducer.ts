import { createReducer, on } from "@ngrx/store";

import { SORT_CREATE_DATA_LIST_DONE_ACTION, SORT_SHUFFLE_DATA_LIST_DONE_ACTION } from "./sort.action";
import { SortReducerState } from "./sort.state";

export const SORT_REDUCER = createReducer<SortReducerState>(
    { action: '', value: null },
    on(SORT_CREATE_DATA_LIST_DONE_ACTION, (state, props) => ({ ...state, action: props.action, value: props.value })),
    on(SORT_SHUFFLE_DATA_LIST_DONE_ACTION, (state, props) => ({ ...state, action: props.action, value: props.value }))
);