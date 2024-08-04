import { Injectable } from "@angular/core";
import { Observable } from "rxjs";

import { SortDataModel, SortStateModel, SortOrder } from "../ngrx-store/sort.state";
import { SORT_DELAY_DURATION, complete, delay, swap } from "../sort.utils";
import { CLEAR_COLOR, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, PRIMARY_ONE_COLOR, SECONDARY_ONE_COLOR, ACCENT_ONE_COLOR, PRIMARY_TWO_COLOR, SECONDARY_TWO_COLOR, ACCENT_TWO_COLOR } from "../../../public/values.utils";

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
                await swap(source, i, pivot);
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

    private async sortByDescent(source: SortDataModel[], temp: SortDataModel, times: number, callback: (param: SortStateModel) => void): Promise<void> {
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
                await swap(source, i, pivot);
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
                await swap(source, i, pivot);
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
                await swap(source, k, pivot);
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

    private async sortByDescent(source: SortDataModel[], temp: SortDataModel, flag: boolean, times: number, callback: (param: SortStateModel) => void): Promise<void> {
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
                await swap(source, i, pivot);
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
                await swap(source, k, pivot);
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

/**
 * 二路选择排序
 */
@Injectable()
export class TwoWaySelectionSortService {

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
        let minIndex: number, maxIndex: number;
        
        for (let shaker = true, length = source.length, i = 0, j = length - 1; i < j; ) {
            minIndex = i;
            maxIndex = j;
            
            for (let m = minIndex + 1, n = maxIndex - 1; m <= j && n >= i; m++, n--) {
                source[i].color = PRIMARY_ONE_COLOR;
                source[minIndex].color = SECONDARY_ONE_COLOR;
                source[m].color = ACCENT_ONE_COLOR;
                source[j].color = PRIMARY_TWO_COLOR;
                source[maxIndex].color = SECONDARY_TWO_COLOR;
                source[n].color = ACCENT_TWO_COLOR;
                callback({ times, datalist: source });

                if (source[m].value < source[minIndex].value) {
                    source[minIndex].color = CLEAR_COLOR;
                    minIndex = m;
                }

                if (source[n].value > source[maxIndex].value) {
                    source[maxIndex].color = CLEAR_COLOR;
                    maxIndex = n;
                }

                await delay(SORT_DELAY_DURATION);

                source[i].color = CLEAR_COLOR;
                source[minIndex].color = SECONDARY_ONE_COLOR;
                source[m].color = CLEAR_COLOR;
                source[j].color = CLEAR_COLOR;
                source[maxIndex].color = SECONDARY_TWO_COLOR;
                source[n].color = CLEAR_COLOR;
                callback({ times, datalist: source });
            }

            source[minIndex].color = CLEAR_COLOR;
            source[maxIndex].color = CLEAR_COLOR;

            source[i].color = PRIMARY_ONE_COLOR;
            source[j].color = PRIMARY_ONE_COLOR;
            source[minIndex].color = SECONDARY_ONE_COLOR;
            source[maxIndex].color = SECONDARY_ONE_COLOR;
            callback({ times, datalist: source });

            await swap(source, i, minIndex);
            await swap(source, j, maxIndex);
            await delay(SORT_DELAY_DURATION);

            source[i].color = CLEAR_COLOR;
            source[j].color = CLEAR_COLOR;
            source[minIndex].color = CLEAR_COLOR;
            source[maxIndex].color = CLEAR_COLOR;
            callback({ times, datalist: source });

            shaker ? i++ : j--;
            shaker = !shaker;
        }

        await delay(SORT_DELAY_DURATION);
        await complete(source, times, callback);
    }

    private async sortByDescent(source: SortDataModel[], temp: SortDataModel, times: number, callback: (param: SortStateModel) => void): Promise<void> {
        let minIndex: number, maxIndex: number;
        
        for (let shaker = true, length = source.length, i = 0, j = length - 1; i < j; ) {
            minIndex = i;
            maxIndex = j;
            
            for (let m = minIndex + 1, n = maxIndex - 1; m <= j && n >= i; m++, n--) {
                source[i].color = PRIMARY_ONE_COLOR;
                source[minIndex].color = SECONDARY_ONE_COLOR;
                source[m].color = ACCENT_ONE_COLOR;
                source[j].color = PRIMARY_TWO_COLOR;
                source[maxIndex].color = SECONDARY_TWO_COLOR;
                source[n].color = ACCENT_TWO_COLOR;
                callback({ times, datalist: source });

                if (source[m].value > source[minIndex].value) {
                    source[minIndex].color = CLEAR_COLOR;
                    minIndex = m;
                }

                if (source[n].value < source[maxIndex].value) {
                    source[maxIndex].color = CLEAR_COLOR;
                    maxIndex = n;
                }

                await delay(SORT_DELAY_DURATION);

                source[i].color = CLEAR_COLOR;
                source[minIndex].color = SECONDARY_ONE_COLOR;
                source[m].color = CLEAR_COLOR;
                source[j].color = CLEAR_COLOR;
                source[maxIndex].color = SECONDARY_TWO_COLOR;
                source[n].color = CLEAR_COLOR;
                callback({ times, datalist: source });
            }

            source[minIndex].color = CLEAR_COLOR;
            source[maxIndex].color = CLEAR_COLOR;

            source[i].color = PRIMARY_ONE_COLOR;
            source[j].color = PRIMARY_ONE_COLOR;
            source[minIndex].color = SECONDARY_ONE_COLOR;
            source[maxIndex].color = SECONDARY_ONE_COLOR;
            callback({ times, datalist: source });

            await swap(source, i, minIndex);
            await swap(source, j, maxIndex);
            await delay(SORT_DELAY_DURATION);

            source[i].color = CLEAR_COLOR;
            source[j].color = CLEAR_COLOR;
            source[minIndex].color = CLEAR_COLOR;
            source[maxIndex].color = CLEAR_COLOR;
            callback({ times, datalist: source });

            shaker ? i++ : j--;
            shaker = !shaker;
        }
        await delay(SORT_DELAY_DURATION);
        await complete(source, times, callback);
    }

}
