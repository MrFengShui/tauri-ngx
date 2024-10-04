import { Injectable } from "@angular/core";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { catchError, exhaustMap, map } from "rxjs";

import { SortConfigService, SortDataService } from "../ngrx-store/sort.service";

import { 
    SORT_CREATE_DATA_ACTION,
    SORT_CREATE_DATA_DONE_ACTION,
    SORT_EXPORT_DATA_ACTION,
    SORT_EXPORT_DATA_DONE_ACTION,
    SORT_HEAP_NODE_OPTION_LOAD_ACTION, SORT_HEAP_NODE_OPTION_LOAD_DONE_ACTION,
    SORT_IMPORT_DATA_ACTION,
    SORT_IMPORT_DATA_DONE_ACTION,
    SORT_MERGE_WAY_OPTION_LOAD_ACTION, SORT_MERGE_WAY_OPTION_LOAD_DONE_ACTION, 
    SORT_ORDER_OPTION_LOAD_ACTION, SORT_ORDER_OPTION_LOAD_DONE_ACTION, 
    SORT_RADIX_OPTION_LOAD_ACTION, SORT_RADIX_OPTION_LOAD_DONE_ACTION 
} from "./sort.action";

@Injectable()
export class SortConfigEffect {

    loadOrderOptions$ = createEffect(() => this._actions
        .pipe(
            ofType(SORT_ORDER_OPTION_LOAD_ACTION),
            exhaustMap(action => this._service.loadSortOrderOptions(action.localeID)
                .pipe(
                    map(value => 
                        SORT_ORDER_OPTION_LOAD_DONE_ACTION({ action: action.type, result: value, message: '' })),
                    catchError(async () => 
                        SORT_ORDER_OPTION_LOAD_DONE_ACTION({ action: action.type, result: [], message: '' }))
                ))
        ));

    loadRadixOptions$ = createEffect(() => this._actions
        .pipe(
            ofType(SORT_RADIX_OPTION_LOAD_ACTION),
            exhaustMap(action => this._service.loadSortRadixOptions(action.localeID)
                .pipe(
                    map(value => 
                        SORT_RADIX_OPTION_LOAD_DONE_ACTION({ action: action.type, result: value, message: '' })),
                    catchError(async () => 
                        SORT_RADIX_OPTION_LOAD_DONE_ACTION({ action: action.type, result: [], message: '' }))
                ))
        ));

    loadMergeWayOptions$ = createEffect(() => this._actions
        .pipe(
            ofType(SORT_MERGE_WAY_OPTION_LOAD_ACTION),
            exhaustMap(action => this._service.loadSortMergeWayOptions(action.localeID)
                .pipe(
                    map(value => 
                        SORT_MERGE_WAY_OPTION_LOAD_DONE_ACTION({ action: action.type, result: value, message: '' })),
                    catchError(async () => 
                        SORT_MERGE_WAY_OPTION_LOAD_DONE_ACTION({ action: action.type, result: [], message: '' }))
                ))
        ));

    loadHeapNodeOptions$ = createEffect(() => this._actions
        .pipe(
            ofType(SORT_HEAP_NODE_OPTION_LOAD_ACTION),
            exhaustMap(action => this._service.loadSortHeapNodeOptions(action.localeID)
                .pipe(
                    map(value => 
                        SORT_HEAP_NODE_OPTION_LOAD_DONE_ACTION({ action: action.type, result: value, message: '' })),
                    catchError(async () => 
                        SORT_HEAP_NODE_OPTION_LOAD_DONE_ACTION({ action: action.type, result: [], message: '' }))
                ))
        ));

    constructor(
        private _actions: Actions,
        private _service: SortConfigService
    ) {}

}

@Injectable()
export class SortDataEffect {

    createData$ = createEffect(() => this._actions
        .pipe(
            ofType(SORT_CREATE_DATA_ACTION),
            exhaustMap(action => this._service.createDataList(action.length, action.unique)
                .pipe(
                    map(value => 
                        SORT_CREATE_DATA_DONE_ACTION({ action: action.type, result: value, message: '' })),
                    catchError(async () => 
                        SORT_CREATE_DATA_DONE_ACTION({ action: action.type, result: [], message: '' }))
                ))
        ));

    importData$ = createEffect(() => this._actions
        .pipe(
            ofType(SORT_IMPORT_DATA_ACTION),
            exhaustMap(action => this._service.importDataList(action.file)
                .pipe(
                    map(value => 
                        SORT_IMPORT_DATA_DONE_ACTION({ action: action.type, result: value, message: '' })),
                    catchError(async () => 
                        SORT_IMPORT_DATA_DONE_ACTION({ action: action.type, result: [], message: '' }))
                ))
        ));

    exportData$ = createEffect(() => this._actions
        .pipe(
            ofType(SORT_EXPORT_DATA_ACTION),
            exhaustMap(action => this._service.exportDataList(action.data)
                .pipe(
                    map(value => 
                        SORT_EXPORT_DATA_DONE_ACTION({ action: action.type, result: value, message: '' })),
                    catchError(async () => 
                        SORT_EXPORT_DATA_DONE_ACTION({ action: action.type, result: [], message: '' }))
                ))
        ));

    constructor(
        private _actions: Actions,
        private _service: SortDataService
    ) {}

}