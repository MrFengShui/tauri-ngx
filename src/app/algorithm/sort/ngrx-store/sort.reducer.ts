import { createReducer, on } from "@ngrx/store";

import { SORT_HEAP_NODE_OPTION_LOAD_DONE_ACTION, SORT_MERGE_WAY_OPTION_LOAD_DONE_ACTION, SORT_ORDER_OPTION_LOAD_DONE_ACTION, SORT_RADIX_OPTION_LOAD_DONE_ACTION } from "./sort.action";
import { SortOptionLoadState } from "./sort.state";

export const SORT_OPTION_LOAD_REDUCER = createReducer<SortOptionLoadState>(
    { action: '', result: [], message: '' },
    on(SORT_ORDER_OPTION_LOAD_DONE_ACTION, (state, props) => 
        ({ ...state, action: props.action, result: props.result, message: props.message })),
    on(SORT_RADIX_OPTION_LOAD_DONE_ACTION, (state, props) => 
        ({ ...state, action: props.action, result: props.result, message: props.message })),
    on(SORT_MERGE_WAY_OPTION_LOAD_DONE_ACTION, (state, props) => 
        ({ ...state, action: props.action, result: props.result, message: props.message })),
    on(SORT_HEAP_NODE_OPTION_LOAD_DONE_ACTION, (state, props) => 
        ({ ...state, action: props.action, result: props.result, message: props.message }))
);