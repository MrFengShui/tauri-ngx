import { createAction, props } from "@ngrx/store";
import { SortDataModel, SortOrder } from "./sort.state";

export const SORT_CREATE_DATA_LIST_ACTION = createAction(
    '[Algorithm Sort Page Component] Create Data List Action',
    props<{ size: number, name: string }>()
);

export const SORT_CREATE_DATA_LIST_DONE_ACTION = createAction(
    '[Algorithm Sort Page Component] Create Data List Done Action',
    props<{ flag: boolean, list: SortDataModel[] }>()
);

export const SORT_SHUFFLE_DATA_LIST_ACTION = createAction(
    '[Algorithm Sort Page Component] Shuffle Data List Action',
    props<{ list: SortDataModel[] }>()
);

export const SORT_SHUFFLE_DATA_LIST_DONE_ACTION = createAction(
    '[Algorithm Sort Page Component] Shuffle Data List Done Action',
    props<{ flag: boolean, list: SortDataModel[] }>()
);

// export const SORT_RUN_DATA_LIST_ACTION = createAction(
//     '[Algorithm Sort Page Component] Run Data List Action',
//     props<{ order: SortOrder, array: SortDataModel[] }>()
// );

// export const SORT_RUN_DATA_LIST_DONE_ACTION = createAction(
//     '[Algorithm Sort Page Component] Run Data List Done Action',
//     props<{ flag: boolean, list: SortDataModel[] }>()
// );