import { createReducer, on } from "@ngrx/store";

import { SORT_CREATE_DATA_DONE_ACTION, SORT_EXPORT_DATA_DONE_ACTION, SORT_HEAP_NODE_OPTION_LOAD_DONE_ACTION, SORT_IMPORT_DATA_DONE_ACTION, SORT_MERGE_WAY_OPTION_LOAD_DONE_ACTION, SORT_ORDER_OPTION_LOAD_DONE_ACTION, SORT_RADIX_OPTION_LOAD_DONE_ACTION } from "./sort.action";
import { SortDataExportModel, SortDataImportModel, SortDataModel, SortOptionModel, SortResultState } from "./sort.state";

export const SORT_RESULT_REDUCER = createReducer<SortResultState<SortOptionModel | SortDataImportModel | SortDataExportModel | SortDataModel[]>>(
    { action: '', result: [], message: '' },
    on(SORT_ORDER_OPTION_LOAD_DONE_ACTION, (state, props) => 
        ({ ...state, action: props.action, result: props.result, message: props.message })),
    on(SORT_RADIX_OPTION_LOAD_DONE_ACTION, (state, props) => 
        ({ ...state, action: props.action, result: props.result, message: props.message })),
    on(SORT_MERGE_WAY_OPTION_LOAD_DONE_ACTION, (state, props) => 
        ({ ...state, action: props.action, result: props.result, message: props.message })),
    on(SORT_HEAP_NODE_OPTION_LOAD_DONE_ACTION, (state, props) => 
        ({ ...state, action: props.action, result: props.result, message: props.message })),
    on(SORT_CREATE_DATA_DONE_ACTION, (state, props) => 
        ({ ...state, action: props.action, result: props.result, message: props.message })),
    on(SORT_IMPORT_DATA_DONE_ACTION, (state, props) => 
        ({ ...state, action: props.action, result: props.result, message: props.message })),
    on(SORT_EXPORT_DATA_DONE_ACTION, (state, props) => 
        ({ ...state, action: props.action, result: props.result, message: props.message }))
);