import { Injectable } from "@angular/core";
import { Observable } from "rxjs";

import { SortDataModel, SortStateModel, SortOrder } from "../ngrx-store/sort.state";
import { ACCENT_COLOR, ACCENT_ONE_COLOR, ACCENT_TWO_COLOR, CLEAR_COLOR, PRIMARY_COLOR, PRIMARY_ONE_COLOR, PRIMARY_TWO_COLOR, SECONDARY_COLOR, SECONDARY_ONE_COLOR, SECONDARY_TWO_COLOR, SORT_DELAY_DURATION, complete, delay, swap } from "../sort.utils";

/**
 * 选择排序（单向）
 */
@Injectable()
export class SelectionSortService {

    public sort(array: SortDataModel[], order: SortOrder): Observable<SortStateModel> {
        return new Observable(subscriber => {
            const temp: SortDataModel = { value: 0, color: CLEAR_COLOR };

            if (order === 'ascent') {
                this.sortByAscent(array, temp, 0, param => subscriber.next(param)).then(() => subscriber.complete());
            }
    
            if (order === 'descent') {
                this.sortByDescent(array, temp, 0, param => subscriber.next(param)).then(() => subscriber.complete());
            }
        });
    }

    private async sortByAscent(source: SortDataModel[], temp: SortDataModel, times: number, callback: (param: SortStateModel) => void): Promise<void> {
        let pivot: number;
        
        for (let i = 0, length = source.length; i < length; i++) {
            pivot = i;
            
            for (let j = pivot + 1; j < source.length; j++) {
                source[i].color = PRIMARY_COLOR;
                source[j].color = SECONDARY_COLOR;
                source[pivot].color = ACCENT_COLOR;
                callback({ times, datalist: source });

                if (source[j].value < source[pivot].value) {
                    source[pivot].color = CLEAR_COLOR;
                    pivot = j;
                }

                await delay(SORT_DELAY_DURATION);
                source[i].color = CLEAR_COLOR;
                source[j].color = CLEAR_COLOR;
                source[pivot].color = ACCENT_COLOR;
                callback({ times, datalist: source });
            }

            source[i].color = PRIMARY_COLOR;
            source[pivot].color = ACCENT_COLOR;
            callback({ times, datalist: source});

            if (source[pivot].value < source[i].value) {
                await swap(source, i, pivot, temp);
                times += 1;
            }
            
            await delay(SORT_DELAY_DURATION);

            source[i].color = CLEAR_COLOR;
            source[pivot].color = CLEAR_COLOR;
            callback({ times, datalist: source});
        }

        await delay(SORT_DELAY_DURATION);
        await complete(source, times, callback);
    }

    private async sortByDescent(source: SortDataModel[], temp: SortDataModel, times: number, callback: (parram: SortStateModel) => void): Promise<void> {
        let pivot: number;
        
        for (let i = 0, length = source.length; i < length; i++) {
            pivot = i;
            
            for (let j = pivot + 1; j < source.length; j++) {
                source[i].color = PRIMARY_COLOR;
                source[j].color = SECONDARY_COLOR;
                source[pivot].color = ACCENT_COLOR;
                callback({ times, datalist: source });

                if (source[j].value > source[pivot].value) {
                    source[pivot].color = CLEAR_COLOR;
                    pivot = j;
                }

                await delay(SORT_DELAY_DURATION);
                source[i].color = CLEAR_COLOR;
                source[j].color = CLEAR_COLOR;
                source[pivot].color = ACCENT_COLOR;
                callback({ times, datalist: source });
            }

            source[i].color = PRIMARY_COLOR;
            source[pivot].color = ACCENT_COLOR;
            callback({ times, datalist: source});

            if (source[pivot].value > source[i].value) {
                await swap(source, i, pivot, temp);
                times += 1;
            }
            
            await delay(SORT_DELAY_DURATION);

            source[i].color = CLEAR_COLOR;
            source[pivot].color = CLEAR_COLOR;
            callback({ times, datalist: source});
        }

        await delay(SORT_DELAY_DURATION);
        await complete(source, times, callback);
    }

}

/**
 * 选择排序（双向）
 */
@Injectable()
export class ShakerSelectionSortService {

    public sort(array: SortDataModel[], order: SortOrder): Observable<SortStateModel> {
        return new Observable(subscriber => {
            const temp: SortDataModel = { value: 0, color: CLEAR_COLOR };

            if (order === 'ascent') {
                this.sortByAscent(array, temp, false, 0, param => subscriber.next(param)).then(() => subscriber.complete());
            }
    
            if (order === 'descent') {
                this.sortByDescent(array, temp, false, 0, param => subscriber.next(param)).then(() => subscriber.complete());
            }
        });
    }

    private async sortByAscent(source: SortDataModel[], temp: SortDataModel, flag: boolean, times: number, callback: (param: SortStateModel) => void): Promise<void> {
        let i: number, j: number, k: number, pivot: number;
        
        for (i = 0, length = source.length; i < length; i++) {
            pivot = i;
            flag = false;
            
            for (j = pivot + 1; j < length - i; j++) {
                source[i].color = PRIMARY_ONE_COLOR;
                source[j].color = SECONDARY_ONE_COLOR;
                source[pivot].color = ACCENT_ONE_COLOR;
                callback({ times, datalist: source });

                if (source[j].value < source[pivot].value) {
                    source[pivot].color = CLEAR_COLOR;
                    pivot = j;
                    flag = true;
                }

                await delay(SORT_DELAY_DURATION);

                source[i].color = CLEAR_COLOR;
                source[j].color = CLEAR_COLOR;
                source[pivot].color = ACCENT_ONE_COLOR;
                callback({ times, datalist: source });
            }

            await delay(SORT_DELAY_DURATION);

            source[i].color = PRIMARY_ONE_COLOR;
            source[pivot].color = SECONDARY_ONE_COLOR;
            callback({ times, datalist: source });

            if (source[pivot].value < source[i].value) {
                await swap(source, i, pivot, temp);
                times += 1;
            }
            
            await delay(SORT_DELAY_DURATION);

            source[i].color = CLEAR_COLOR;
            source[pivot].color = CLEAR_COLOR;
            callback({ times, datalist: source});

            k = length - i - 1;
            pivot = k;

            for (j = pivot - 1; j > i; j--) {
                source[k].color = PRIMARY_TWO_COLOR;
                source[j].color = SECONDARY_TWO_COLOR;
                source[pivot].color = ACCENT_TWO_COLOR;
                callback({ times, datalist: source });

                if (source[j].value > source[pivot].value) {
                    source[pivot].color = CLEAR_COLOR;
                    pivot = j;
                    flag = true;
                }

                await delay(SORT_DELAY_DURATION);
                source[k].color = CLEAR_COLOR;
                source[j].color = CLEAR_COLOR;
                source[pivot].color = ACCENT_TWO_COLOR;
                callback({ times, datalist: source });
            }

            await delay(SORT_DELAY_DURATION);

            source[k].color = PRIMARY_TWO_COLOR;
            source[pivot].color = SECONDARY_TWO_COLOR;
            callback({ times, datalist: source });

            if (source[pivot].value > source[k].value) {
                await swap(source, k, pivot, temp);
                times += 1;
            }
            
            await delay(SORT_DELAY_DURATION);

            source[k].color = CLEAR_COLOR;
            source[pivot].color = CLEAR_COLOR;
            callback({ times, datalist: source});

            if (!flag) break;
        }

        await delay(SORT_DELAY_DURATION);
        await complete(source, times, callback);
    }

    private async sortByDescent(source: SortDataModel[], temp: SortDataModel, flag: boolean, times: number, callback: (parram: SortStateModel) => void): Promise<void> {
        let i: number, j: number, k: number, pivot: number;
        
        for (i = 0, length = source.length; i < length; i++) {
            pivot = i;
            flag = false;
            
            for (j = pivot + 1; j < length - i; j++) {
                source[i].color = PRIMARY_ONE_COLOR;
                source[j].color = SECONDARY_ONE_COLOR;
                source[pivot].color = ACCENT_ONE_COLOR;
                callback({ times, datalist: source });

                if (source[j].value > source[pivot].value) {
                    source[pivot].color = CLEAR_COLOR;
                    pivot = j;
                    flag = true;
                }

                await delay(SORT_DELAY_DURATION);
                source[i].color = CLEAR_COLOR;
                source[j].color = CLEAR_COLOR;
                source[pivot].color = ACCENT_ONE_COLOR;
                callback({ times, datalist: source });
            }

            await delay(SORT_DELAY_DURATION);

            source[i].color = PRIMARY_ONE_COLOR;
            source[pivot].color = SECONDARY_ONE_COLOR;
            callback({ times, datalist: source });

            if (source[pivot].value > source[i].value) {
                await swap(source, i, pivot, temp);
                times += 1;
            }
            
            await delay(SORT_DELAY_DURATION);

            source[i].color = CLEAR_COLOR;
            source[pivot].color = CLEAR_COLOR;
            callback({ times, datalist: source});

            k = length - i - 1;
            pivot = k;

            for (j = pivot - 1; j > i; j--) {
                source[k].color = PRIMARY_TWO_COLOR;
                source[j].color = SECONDARY_TWO_COLOR;
                source[pivot].color = ACCENT_TWO_COLOR;
                callback({ times, datalist: source });

                if (source[j].value < source[pivot].value) {
                    source[pivot].color = CLEAR_COLOR;
                    pivot = j;
                    flag = true;
                }

                await delay(SORT_DELAY_DURATION);
                source[k].color = CLEAR_COLOR;
                source[j].color = CLEAR_COLOR;
                source[pivot].color = ACCENT_TWO_COLOR;
                callback({ times, datalist: source });
            }

            await delay(SORT_DELAY_DURATION);

            source[k].color = PRIMARY_TWO_COLOR;
            source[pivot].color = SECONDARY_TWO_COLOR;
            callback({ times, datalist: source });

            if (source[pivot].value < source[k].value) {
                await swap(source, k, pivot, temp);
                times += 1;
            }
            
            await delay(SORT_DELAY_DURATION);
            source[k].color = CLEAR_COLOR;
            source[pivot].color = CLEAR_COLOR;
            callback({ times, datalist: source});

            if (!flag) break;
        }

        await delay(SORT_DELAY_DURATION);
        await complete(source, times, callback);
    }

}
