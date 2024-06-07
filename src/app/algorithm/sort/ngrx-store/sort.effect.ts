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
            exhaustMap(action => this._utilsService.createDataList(action.size, action.name)
                .pipe(map(value => SORT_CREATE_DATA_LIST_DONE_ACTION({ flag: true, list: value }))))
        ));

    shuffleDataList$ = createEffect(() => this._actions
        .pipe(
            ofType(SORT_SHUFFLE_DATA_LIST_ACTION),
            exhaustMap(action => this._utilsService.shuffleDataList(JSON.parse(JSON.stringify(action.list)))
                .pipe(map(value => SORT_SHUFFLE_DATA_LIST_DONE_ACTION({ flag: true, list: value }))))
        ));

    // bubbleSort$ = createEffect(() => this._actions
    //     .pipe(
    //         ofType(SORT_RUN_DATA_LIST_ACTION),
    //         exhaustMap(action => this._bubbleService.sort(action.array, action.order)
    //             .pipe(map(value => SORT_RUN_DATA_LIST_DONE_ACTION({ flag: value.completed, list: value.datalist }))))
    //     ));

    constructor(
        private _actions: Actions,
        private _utilsService: SortUtilsService,
        private _bubbleService: BubbleSortService
    ) {}

}