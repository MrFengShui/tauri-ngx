import { Injectable, inject } from "@angular/core";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { exhaustMap, map } from "rxjs";

import { SortLoadConfigService } from "../ngrx-store/sort.service";

import { SORT_MERGE_WAY_OPTION_LOAD_ACTION, SORT_ORDER_OPTION_LOAD_ACTION, SORT_ORDER_OPTION_LOAD_DONE_ACTION, SORT_RADIX_OPTION_LOAD_ACTION, SORT_RADIX_OPTION_LOAD_DONE_ACTION } from "./sort.action";

@Injectable()
export class SortOrderOptionLoadEffect {

    loadOrderOptions$ = createEffect(() => this._actions
        .pipe(
            ofType(SORT_ORDER_OPTION_LOAD_ACTION),
            exhaustMap(action => this._service.loadSortOrderOptions()
                .pipe(map(value => SORT_ORDER_OPTION_LOAD_DONE_ACTION({ action: action.type, value }))))
        ));

    loadRadixOptions$ = createEffect(() => this._actions
        .pipe(
            ofType(SORT_RADIX_OPTION_LOAD_ACTION),
            exhaustMap(action => this._service.loadSortRadixOptions()
                .pipe(map(value => SORT_RADIX_OPTION_LOAD_DONE_ACTION({ action: action.type, value }))))
        ));

    loadMergeWayOptions$ = createEffect(() => this._actions
        .pipe(
            ofType(SORT_MERGE_WAY_OPTION_LOAD_ACTION),
            exhaustMap(action => this._service.loadSortMergeWayOptions()
                .pipe(map(value => SORT_RADIX_OPTION_LOAD_DONE_ACTION({ action: action.type, value }))))
        ));

    constructor(
        private _actions: Actions,
        private _service: SortLoadConfigService
    ) {}

}
