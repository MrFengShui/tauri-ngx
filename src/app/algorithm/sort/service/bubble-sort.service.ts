import { Injectable } from "@angular/core";
import { Observable } from "rxjs";

import { SortDataModel, SortStateModel, SortOrder } from "../ngrx-store/sort.state";
import { CLEAR_COLOR, PRIMARY_COLOR, PRIMARY_ONE_COLOR, PRIMARY_TWO_COLOR, SECONDARY_COLOR, SECONDARY_ONE_COLOR, SECONDARY_TWO_COLOR, SORT_DELAY_DURATION, complete, delay, swap } from "../sort.utils";

/**
 * 交換排序
 */
@Injectable()
export class ExchangeSortService {

    public sort(array: SortDataModel[], order: SortOrder): Observable<SortStateModel> {
        return new Observable(subscriber => {
            const temp: SortDataModel = { value: 0, color: '' };

            if (order === 'ascent') {
                this.sortByAscent(array, temp, 0, param => subscriber.next(param)).then(() => subscriber.complete());
            }
    
            if (order === 'descent') {
                this.sortByDescent(array, temp, 0, param => subscriber.next(param)).then(() => subscriber.complete());
            }
        });
    }

    private async sortByAscent(source: SortDataModel[], temp: SortDataModel, times: number, callback: (param: SortStateModel) => void): Promise<void> {
        for (let i = 0, length = source.length; i < length; i++) {
            for (let j = 0; j < length - 1; j++) {
                source[j].color = PRIMARY_COLOR;

                if (source[j + 1].value < source[j].value) {
                    source[j + 1].color = SECONDARY_COLOR;
                    await swap(source, j + 1, j, temp);
                    times += 1;
                }

                callback({ times, datalist: source});

                await delay(SORT_DELAY_DURATION);
                
                source[j].color = CLEAR_COLOR;
                source[j + 1].color = CLEAR_COLOR;
                callback({ times, datalist: source});
            }
        }

        await delay(SORT_DELAY_DURATION);
        await complete(source, times, callback);
    }

    private async sortByDescent(source: SortDataModel[], temp: SortDataModel, times: number, callback: (param: SortStateModel) => void): Promise<void> {
        for (let i = 0, length = source.length; i < length; i++) {
            for (let j = 0; j < length - 1; j++) {
                source[j].color = PRIMARY_COLOR;

                if (source[j + 1].value > source[j].value) {
                    source[j + 1].color = SECONDARY_COLOR;
                    await swap(source, j + 1, j, temp);
                    times += 1;
                }

                callback({ times, datalist: source});

                await delay(SORT_DELAY_DURATION);
                
                source[j].color = CLEAR_COLOR;
                source[j + 1].color = CLEAR_COLOR;
                callback({ times, datalist: source});
            }
        }

        await delay(SORT_DELAY_DURATION);
        await complete(source, times, callback);
    }

}

/**
 * 冒泡排序（单向）
 */
@Injectable()
export class BubbleSortService {

    public sort(array: SortDataModel[], order: SortOrder): Observable<SortStateModel> {
        return new Observable(subscriber => {
            const temp: SortDataModel = { value: 0, color: '' };

            if (order === 'ascent') {
                this.sortByAscent(array, temp, false, 0, param => subscriber.next(param)).then(() => subscriber.complete());
            }
    
            if (order === 'descent') {
                this.sortByDescent(array, temp, false, 0, param => subscriber.next(param)).then(() => subscriber.complete());
            }
        });
    }

    private async sortByAscent(source: SortDataModel[], temp: SortDataModel, flag: boolean, times: number, callback: (param: SortStateModel) => void): Promise<void> {
        for (let i = 0, length = source.length; i < length; i++) {
            flag = false;

            for (let j = 0; j < length - i - 1; j++) {
                source[j].color = PRIMARY_COLOR;

                if (source[j + 1].value < source[j].value) {
                    source[j + 1].color = SECONDARY_COLOR;
                    await swap(source, j + 1, j, temp);
                    flag = true;
                    times += 1;
                }

                callback({ times, datalist: source});

                await delay(SORT_DELAY_DURATION);
                
                source[j].color = CLEAR_COLOR;
                source[j + 1].color = CLEAR_COLOR;
                callback({ times, datalist: source});
            }

            if (!flag) break;
        }

        await delay(SORT_DELAY_DURATION);
        await complete(source, times, callback);
    }

    private async sortByDescent(source: SortDataModel[], temp: SortDataModel, flag: boolean, times: number, callback: (param: SortStateModel) => void): Promise<void> {
        for (let i = 0, length = source.length; i < length; i++) {
            flag = false;
            
            for (let j = 0; j < length - i - 1; j++) {
                source[j].color = PRIMARY_COLOR;

                if (source[j + 1].value > source[j].value) {
                    source[j + 1].color = SECONDARY_COLOR;
                    await swap(source, j + 1, j, temp);
                    flag = true;
                    times += 1;
                }

                callback({ times, datalist: source});

                await delay(SORT_DELAY_DURATION);
                
                source[j].color = CLEAR_COLOR;
                source[j + 1].color = CLEAR_COLOR;
                callback({ times, datalist: source});
            }

            if (!flag) break;
        }

        await delay(SORT_DELAY_DURATION);
        await complete(source, times, callback);
    }

}

/**
 * 冒泡排序（双向）
 */
@Injectable()
export class CooktailSortService {

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
        let i: number, j: number, pivot: number = 0;

        for (i = 0, length = source.length; i < length; i++) {
            flag = false;

            for (j = pivot; j < length - i - 1; j++) {
                source[j].color = PRIMARY_ONE_COLOR;

                if (source[j + 1].value < source[j].value) {
                    source[j + 1].color = SECONDARY_ONE_COLOR;
                    await swap(source, j + 1, j, temp);
                    flag = true;
                    times += 1;
                }

                callback({ times, datalist: source});

                await delay(SORT_DELAY_DURATION);
                
                source[j].color = CLEAR_COLOR;
                source[j + 1].color = CLEAR_COLOR;
                callback({ times, datalist: source});
            }

            pivot = j;

            for (j = pivot; j > i; j--) {
                source[j].color = PRIMARY_TWO_COLOR;

                if (source[j - 1].value > source[j].value) {
                    source[j - 1].color = SECONDARY_TWO_COLOR;
                    await swap(source, j - 1, j, temp);
                    flag = true;
                    times += 1;
                }

                callback({ times, datalist: source});

                await delay(SORT_DELAY_DURATION);
                
                source[j].color = CLEAR_COLOR;
                source[j - 1].color = CLEAR_COLOR;
                callback({ times, datalist: source});
            }

            pivot = j;

            if (!flag) break;
        }

        await delay(SORT_DELAY_DURATION);
        await complete(source, times, callback);
    }

    private async sortByDescent(source: SortDataModel[], temp: SortDataModel, flag: boolean, times: number, callback: (param: SortStateModel) => void): Promise<void> {
        let i: number, j: number, pivot: number = 0;

        for (i = 0, length = source.length; i < length; i++) {
            flag = false;

            for (j = pivot; j < length - i - 1; j++) {
                source[j].color = PRIMARY_ONE_COLOR;

                if (source[j + 1].value > source[j].value) {
                    source[j + 1].color = SECONDARY_ONE_COLOR;
                    await swap(source, j + 1, j, temp);
                    flag = true;
                    times += 1;
                }

                callback({ times, datalist: source});

                await delay(SORT_DELAY_DURATION);
                
                source[j].color = CLEAR_COLOR;
                source[j + 1].color = CLEAR_COLOR;
                callback({ times, datalist: source});
            }

            pivot = j;

            for (j = pivot; j > i; j--) {
                source[j].color = PRIMARY_TWO_COLOR;

                if (source[j - 1].value < source[j].value) {
                    source[j - 1].color = SECONDARY_TWO_COLOR;
                    await swap(source, j - 1, j, temp);
                    flag = true;
                    times += 1;
                }

                callback({ times, datalist: source});

                await delay(SORT_DELAY_DURATION);
                
                source[j].color = CLEAR_COLOR;
                source[j - 1].color = CLEAR_COLOR;
                callback({ times, datalist: source});
            }

            pivot = j;

            if (!flag) break;
        }

        await delay(SORT_DELAY_DURATION);
        await complete(source, times, callback);
    }

}

/**
 * 梳排序
 */
@Injectable()
export class CombSortService {

    public sort(array: SortDataModel[], order: SortOrder): Observable<SortStateModel> {
        return new Observable(subscriber => {
            const temp: SortDataModel = { value: 0, color: 'whitesmoke' };

            if (order === 'ascent') {
                this.sortByAscent(array, temp, 0, param => subscriber.next(param)).then(() => subscriber.complete());
            }

            if (order === 'descent') {
                this.sortByDescent(array, temp, 0, param => subscriber.next(param)).then(() => subscriber.complete());
            }
        });
    }

    private async sortByAscent(source: SortDataModel[], temp: SortDataModel, times: number, callback: (param: SortStateModel) => void): Promise<void> {
        let flag: boolean = false;

        for (let gap = source.length, length = source.length; gap > 1 || !flag; gap = Math.floor(gap * 0.8)) {
            flag = true;

            for (let j = 0; j < length - gap; j++) {
                source[j].color = PRIMARY_COLOR;
                
                if (source[j + gap].value < source[j].value) {
                    source[j + gap].color = SECONDARY_COLOR;
                    await swap(source, j, j + gap, temp);
                    times += 1;
                    flag = false;
                }

                callback({ times, datalist: source });

                await delay(SORT_DELAY_DURATION);

                source[j].color = CLEAR_COLOR;
                source[j + gap].color = CLEAR_COLOR;
                callback({ times, datalist: source });
            }
        }

        await delay(SORT_DELAY_DURATION);
        await complete(source, times, callback);
    }

    private async sortByDescent(source: SortDataModel[], temp: SortDataModel, times: number, callback: (param: SortStateModel) => void): Promise<void> {
        let flag: boolean = false;

        for (let gap = source.length, length = source.length; gap > 1 || !flag; gap = Math.floor(gap * 0.8)) {
            flag = true;

            for (let j = 0; j < length - gap; j++) {
                source[j].color = PRIMARY_COLOR;

                if (source[j + gap].value > source[j].value) {
                    source[j + gap].color = SECONDARY_COLOR;
                    await swap(source, j, j + gap, temp);
                    times += 1;
                    flag = false;
                }

                callback({ times, datalist: source });

                await delay(SORT_DELAY_DURATION);

                source[j].color = CLEAR_COLOR;
                source[j + gap].color = CLEAR_COLOR;
                callback({ times, datalist: source });
            }
        }

        await delay(SORT_DELAY_DURATION);
        await complete(source, times, callback);
    }

}

/**
 * 奇偶排序
 */
@Injectable()
export class OddEvenSortService {

    public sort(array: SortDataModel[], order: SortOrder): Observable<SortStateModel> {
        return new Observable(subscriber => {
            const temp: SortDataModel = { value: 0, color: 'whitesmoke' };

            if (order === 'ascent') {
                this.sortByAscent(array, temp, 0, param => subscriber.next(param)).then(() => subscriber.complete());
            }

            if (order === 'descent') {
                this.sortByDescent(array, temp, 0, param => subscriber.next(param)).then(() => subscriber.complete());
            }
        });
    }

    private async sortByAscent(source: SortDataModel[], temp: SortDataModel, times: number, callback: (param: SortStateModel) => void): Promise<void> {
        let flag: boolean = false;

        for (let i = 0, length = source.length; !flag; i = (i + 1) % 2) {
            flag = true;

            for (let j = i; j < length - 1; j += 2) {
                source[j].color = PRIMARY_ONE_COLOR;
                callback({ times, datalist: source });

                if (source[j + 1].value < source[j].value) {
                    source[j + 1].color = SECONDARY_ONE_COLOR;
                    callback({ times, datalist: source });

                    await swap(source, j, j + 1, temp);
                    times += 1;
                    flag = false;
                }

                await delay(SORT_DELAY_DURATION);

                source[j].color = CLEAR_COLOR;
                source[j + 1].color = CLEAR_COLOR;
                callback({ times, datalist: source });
            }
        }

        await delay(SORT_DELAY_DURATION);
        await complete(source, times, callback);
    }

    private async sortByDescent(source: SortDataModel[], temp: SortDataModel, times: number, callback: (param: SortStateModel) => void): Promise<void> {
        let flag: boolean = false;

        for (let i = 0, length = source.length; !flag; i = (i + 1) % 2) {
            flag = true;

            for (let j = i; j < length - 1; j += 2) {
                source[j].color = PRIMARY_ONE_COLOR;
                callback({ times, datalist: source });

                if (source[j + 1].value > source[j].value) {
                    source[j + 1].color = SECONDARY_ONE_COLOR;
                    callback({ times, datalist: source });

                    await swap(source, j, j + 1, temp);
                    times += 1;
                    flag = false;
                }

                await delay(SORT_DELAY_DURATION);

                source[j].color = CLEAR_COLOR;
                source[j + 1].color = CLEAR_COLOR;
                callback({ times, datalist: source });
            }
        }

        await delay(SORT_DELAY_DURATION);
        await complete(source, times, callback);
    }

}

