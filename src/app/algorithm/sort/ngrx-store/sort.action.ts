import { createAction, props } from "@ngrx/store";

import { SortResultState, SortStateModel, SortDataExportModel, SortDataImportModel, SortOptionModel, SortDataModel } from "./sort.state";
import { LocaleIDType } from "../../../main/ngrx-store/main.state";

export const SORT_ORDER_OPTION_LOAD_ACTION = createAction(
    '[Sort Page Component] Sort Order Option Load Action',
    props<{ localeID: LocaleIDType | string }>()
);

export const SORT_ORDER_OPTION_LOAD_DONE_ACTION = createAction(
    '[Sort Page Component] Sort Order Option Load Done Action',
    props<SortResultState<SortOptionModel>>()
);

export const SORT_RADIX_OPTION_LOAD_ACTION = createAction(
    '[Sort Page Component] Sort Radix Option Load Action',
    props<{ localeID: LocaleIDType | string }>()
);

export const SORT_RADIX_OPTION_LOAD_DONE_ACTION = createAction(
    '[Sort Page Component] Sort Radix Option Load Done Action',
    props<SortResultState<SortOptionModel>>()
);

export const SORT_MERGE_WAY_OPTION_LOAD_ACTION = createAction(
    '[Sort Page Component] Sort Merge Way Option Load Action',
    props<{ localeID: LocaleIDType | string }>()
);

export const SORT_MERGE_WAY_OPTION_LOAD_DONE_ACTION = createAction(
    '[Sort Page Component] Sort Merge Way Option Load Done Action',
    props<SortResultState<SortOptionModel>>()
);

export const SORT_HEAP_NODE_OPTION_LOAD_ACTION = createAction(
    '[Sort Page Component] Sort Heap Node Option Load Action',
    props<{ localeID: LocaleIDType | string }>()
);

export const SORT_HEAP_NODE_OPTION_LOAD_DONE_ACTION = createAction(
    '[Sort Page Component] Sort Heap Node Option Load Done Action',
    props<SortResultState<SortOptionModel>>()
);

export const SORT_CREATE_DATA_ACTION = createAction(
    '[Sort Page Component] Sort Create Data Action',
    props<{ length: number, unique: boolean }>()
);

export const SORT_CREATE_DATA_DONE_ACTION = createAction(
    '[Sort Page Component] Sort Create Data Done Action',
    props<SortResultState<SortDataModel[]>>()
);

export const SORT_IMPORT_DATA_ACTION = createAction(
    '[Sort Page Component] Sort Import Data Action',
    props<{ file: File }>()
);

export const SORT_IMPORT_DATA_DONE_ACTION = createAction(
    '[Sort Page Component] Sort Import Data Done Action',
    props<SortResultState<SortDataImportModel>>()
);

export const SORT_EXPORT_DATA_ACTION = createAction(
    '[Sort Page Component] Sort Export Data Action',
    props<{ data: number[] }>()
);

export const SORT_EXPORT_DATA_DONE_ACTION = createAction(
    '[Sort Page Component] Sort Export Data Done Action',
    props<SortResultState<SortDataExportModel>>()
);