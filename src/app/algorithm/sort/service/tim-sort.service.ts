import { Injectable } from "@angular/core";
import { Observable } from "rxjs";

import { SortDataModel, SortStateModel, SortOrder } from "../ngrx-store/sort.state";
import { SORT_DELAY_DURATION, complete, delay } from "../sort.utils";
import { SortToolsService } from "../ngrx-store/sort.service";

/**
 * 蒂姆排序
 */
@Injectable()
export class TimSortService {

    private readonly THRESHOLD: number = 24;

    constructor(private _service: SortToolsService) {}

    public sort(array: SortDataModel[], order: SortOrder): Observable<SortStateModel> {
        return new Observable(subscriber => {
            const temp: SortDataModel = { color: '', value: -1 };

            if (order === 'ascent') {
                this.sortByAscent(array, temp, 0, param => subscriber.next(param)).then(() => subscriber.complete());
            }
    
            if (order === 'descent') {
                this.sortByDescent(array, temp, 0, param => subscriber.next(param)).then(() => subscriber.complete());
            }
        });
    }

    private async sortByAscent(source: SortDataModel[], temp: SortDataModel, times: number, callback: (param: SortStateModel) => void): Promise<void> {
        const length = source.length, runLength: number = this.calcRunLength(length);
        let lhs: number, mid: number, rhs: number;

        for (lhs = 0; lhs < length; lhs += runLength) {
            rhs = Math.min(length - 1, lhs + runLength - 1);
            times = await this._service.stableGapSortByAscent(source, lhs, rhs, 1, 1, times, callback);
        }

        for (let mergeSize = runLength; mergeSize < source.length; mergeSize =  mergeSize * 2) {
            for (lhs = 0; lhs < length; lhs += mergeSize * 2) {
                mid = lhs + mergeSize - 1;
                rhs = Math.min(length - 1, lhs + mergeSize * 2 - 1);

                if (mid < rhs) {
                    times = await this._service.mergeByAscent(source, lhs, mid, rhs, times, callback);
                }
            }
        }

        await delay(SORT_DELAY_DURATION);
        await complete(source, times, callback);
    }

    private async sortByDescent(source: SortDataModel[], temp: SortDataModel, times: number, callback: (parram: SortStateModel) => void): Promise<void> {
        const length = source.length, runLength: number = this.calcRunLength(length);
        let lhs: number, mid: number, rhs: number;

        for (lhs = 0; lhs < length; lhs += runLength) {
            rhs = Math.min(length - 1, lhs + runLength - 1);
            times = await this._service.stableGapSortByDescent(source, lhs, rhs, 1, 1, times, callback);
        }

        for (let mergeSize = runLength; mergeSize < source.length; mergeSize =  mergeSize * 2) {
            for (lhs = 0; lhs < length; lhs += mergeSize * 2) {
                mid = lhs + mergeSize - 1;
                rhs = Math.min(length - 1, lhs + mergeSize * 2 - 1);

                if (mid < rhs) {
                    times = await this._service.mergeByDescent(source, lhs, mid, rhs, times, callback);
                }
            }
        }

        await delay(SORT_DELAY_DURATION);
        await complete(source, times, callback);
    }

    private calcRunLength(length: number): number {
        let runLength: number = length, remainder: number = 0;

        while (runLength > this.THRESHOLD) {
            if (runLength % 2 === 1) {
                remainder = 1;
            }

            runLength = Math.floor(runLength * 0.5);
        }

        return runLength + remainder;
    }

}
