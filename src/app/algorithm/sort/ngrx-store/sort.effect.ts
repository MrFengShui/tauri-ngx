import { Injectable } from "@angular/core";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { exhaustMap, map } from "rxjs";

import { SortUtilsService } from "../service/sort.service";
import { BubbleSortService } from "../service/bubble-sort.service";

import { SORT_CREATE_DATA_LIST_ACTION, SORT_CREATE_DATA_LIST_DONE_ACTION, SORT_SHUFFLE_DATA_LIST_ACTION, SORT_SHUFFLE_DATA_LIST_DONE_ACTION } from "./sort.action";

@Injectable()
export class SortEffect {

    createDataList$ = createEffect(() => this._actions
        .pipe(
            ofType(SORT_CREATE_DATA_LIST_ACTION),
            exhaustMap(action => this._service.createDataList(action.size, action.name)
                .pipe(map(value => SORT_CREATE_DATA_LIST_DONE_ACTION({ action: action.type, value }))))
        ));

    shuffleDataList$ = createEffect(() => this._actions
        .pipe(
            ofType(SORT_SHUFFLE_DATA_LIST_ACTION),
            exhaustMap(action => this._service.shuffleDataList(JSON.parse(JSON.stringify(action.list)))
                .pipe(map(value => SORT_SHUFFLE_DATA_LIST_DONE_ACTION({ action: action.type, value }))))
        ));

    constructor(
        private _actions: Actions,
        private _service: SortUtilsService
    ) {}

}