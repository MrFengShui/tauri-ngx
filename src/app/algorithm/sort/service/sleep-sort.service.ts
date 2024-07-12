import { Injectable } from "@angular/core";
import { Observable } from "rxjs";

import { SortDataModel, SortStateModel, SortOrder } from "../ngrx-store/sort.state";
import { ACCENT_ONE_COLOR, ACCENT_TWO_COLOR, CLEAR_COLOR, SORT_DELAY_DURATION, complete, delay } from "../sort.utils";

/**
 * 睡眠排序
 */
@Injectable()
export class SleepSortService {

    private cache: number[] = Array.from([]);

    public sort(array: SortDataModel[], order: SortOrder): Observable<SortStateModel> {
        return new Observable(subscriber => {
            if (order === 'ascent') {
                this.sortByAscent(array, 0, param => subscriber.next(param)).then(() => subscriber.complete());
            }
    
            if (order === 'descent') {
                this.sortByDescent(array, 0, param => subscriber.next(param)).then(() => subscriber.complete());
            }
        });
    }

    private async sortByAscent(source: SortDataModel[], times: number, callback: (param: SortStateModel) => void): Promise<void> {
        let value: number, index: number;

        for (let i = 0, length = source.length; i < length; i++) {
            times += 1;

            source[i].color = ACCENT_ONE_COLOR;
            callback({ times, datalist: source});

            await delay(SORT_DELAY_DURATION);
            
            source[i].color = CLEAR_COLOR;
            callback({ times, datalist: source});

            this.cache.push(source[i].value);
        }

        while (this.cache.length > 0) {
            value = this.cache.pop() as number;
            index = value - 1;
            times += 1;

            source[index].value = value;
            source[index].color = ACCENT_TWO_COLOR;
            callback({ times, datalist: source});

            await delay(value * SORT_DELAY_DURATION);

            source[index].color = CLEAR_COLOR;
            callback({ times, datalist: source});
        }

        await delay(SORT_DELAY_DURATION);
        await complete(source, times, callback);
        this.cache.splice(0);
    }

    private async sortByDescent(source: SortDataModel[], times: number, callback: (parram: SortStateModel) => void): Promise<void> {
        let value: number, index: number, length = source.length;

        for (let i = 0; i < length; i++) {
            times += 1;

            source[i].color = ACCENT_ONE_COLOR;
            callback({ times, datalist: source});

            await delay(SORT_DELAY_DURATION);
            
            source[i].color = CLEAR_COLOR;
            this.cache.push(source[i].value);
        }

        while (this.cache.length > 0) {
            value = this.cache.pop() as number;
            index = length - value;
            times += 1;

            source[index].value = value;
            source[index].color = ACCENT_TWO_COLOR;
            callback({ times, datalist: source});

            await delay(value * SORT_DELAY_DURATION);

            source[index].color = CLEAR_COLOR;
            callback({ times, datalist: source});
        }

        await delay(SORT_DELAY_DURATION);
        await complete(source, times, callback);
        this.cache.splice(0);
    }

}
