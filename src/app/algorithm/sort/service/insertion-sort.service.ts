import { Injectable } from "@angular/core";
import { Observable } from "rxjs";

import { SortDataModel, SortStateModel, SortOrder } from "../ngrx-store/sort.state";
import { ACCENT_COLOR, CLEAR_COLOR, PRIMARY_COLOR, SECONDARY_COLOR, SORT_DELAY_DURATION, complete, delay, swap } from "../sort.utils";

/**
 * 插入排序
 */
@Injectable()
export class InsertionSortService {

    public sort(array: SortDataModel[], order: SortOrder): Observable<SortStateModel> {
        return new Observable(subscriber => {
            const temp: SortDataModel = { value: 0, color: CLEAR_COLOR };

            if (order === 'ascent') {
                this.sortByAscent(array, 0, temp, param => subscriber.next(param)).then(() => subscriber.complete());
            }
    
            if (order === 'descent') {
                this.sortByDescent(array, 0, temp, param => subscriber.next(param)).then(() => subscriber.complete());
            }
        });
    }

    private async sortByAscent(source: SortDataModel[], times: number, temp: SortDataModel, callback: (param: SortStateModel) => void): Promise<void> {
        for (let i = 1; i < source.length; i++) {
            for (let j = i; j > 0; j--) {
                source[j].color = PRIMARY_COLOR;

                if (source[j - 1].value > source[j].value) {
                    source[j - 1].color = SECONDARY_COLOR;
                    await swap(source, j - 1, j, temp);
                    times += 1;
                }

                callback({ times, datalist: source});

                await delay(SORT_DELAY_DURATION);

                source[j].color = CLEAR_COLOR;
                source[j - 1].color = CLEAR_COLOR;
                callback({ times, datalist: source});
            }
        }

        await delay(SORT_DELAY_DURATION);
        await complete(source, times, callback);
    }

    private async sortByDescent(source: SortDataModel[], times: number, temp: SortDataModel, callback: (parram: SortStateModel) => void): Promise<void> {
        for (let i = 1; i < source.length; i++) {
            for (let j = i; j > 0; j--) {
                source[j].color = PRIMARY_COLOR;

                if (source[j - 1].value < source[j].value) {
                    source[j - 1].color = SECONDARY_COLOR;
                    await swap(source, j - 1, j, temp);
                    times += 1;
                }

                callback({ times, datalist: source});

                await delay(SORT_DELAY_DURATION);
                
                source[j].color = CLEAR_COLOR;
                source[j - 1].color = CLEAR_COLOR;
                callback({ times, datalist: source});
            }
        }

        await delay(SORT_DELAY_DURATION);
        await complete(source, times, callback);
    }

}

/**
 * 二分插入排序
 */
@Injectable()
export class BinarySearchInserionSortService {

    public sort(array: SortDataModel[], order: SortOrder): Observable<SortStateModel> {
        return new Observable(subscriber => {
            const temp: SortDataModel = { value: 0, color: CLEAR_COLOR };

            if (order === 'ascent') {
                this.sortByAscent(array, 0, temp, param => subscriber.next(param)).then(() => subscriber.complete());
            }
    
            if (order === 'descent') {
                this.sortByDescent(array, 0, temp, param => subscriber.next(param)).then(() => subscriber.complete());
            }
        });
    }

    private async sortByAscent(source: SortDataModel[], times: number, temp: SortDataModel, callback: (param: SortStateModel) => void): Promise<void> {
        let lhs: number, rhs: number, mid: number;

        for (let i = 1; i < source.length; i++) {
            lhs = 0; 
            rhs = i - 1;

            while (lhs <= rhs) {
                mid = Math.floor((rhs - lhs) * 0.5 + lhs);
    
                source[mid].color = ACCENT_COLOR;
                callback({ times, datalist: source });
    
                await delay(SORT_DELAY_DURATION);
    
                source[mid].color = CLEAR_COLOR;
                callback({ times, datalist: source });
    
                if (source[mid].value > source[i].value) {
                    rhs = mid - 1;
                } else {
                    lhs = mid + 1;
                }
            }
            
            for (let j = lhs; j < i; j++) {
                times += 1;

                source[i].color = SECONDARY_COLOR;
                source[j].color = PRIMARY_COLOR;
                callback({ times, datalist: source });

                await swap(source, j, i, temp);
                await delay(SORT_DELAY_DURATION);

                source[i].color = CLEAR_COLOR;
                source[j].color = CLEAR_COLOR;
                callback({ times, datalist: source });
            }
        }

        await delay(SORT_DELAY_DURATION);
        await complete(source, times, callback);
    }

    private async sortByDescent(source: SortDataModel[], times: number, temp: SortDataModel, callback: (parram: SortStateModel) => void): Promise<void> {
        let lhs: number, rhs: number, mid: number;

        for (let i = 1; i < source.length; i++) {
            lhs = 0; 
            rhs = i - 1;

            while (lhs <= rhs) {
                mid = Math.floor((rhs - lhs) * 0.5 + lhs);
    
                source[mid].color = ACCENT_COLOR;
                callback({ times, datalist: source });
    
                await delay(SORT_DELAY_DURATION);
    
                source[mid].color = CLEAR_COLOR;
                callback({ times, datalist: source });
    
                if (source[mid].value < source[i].value) {
                    rhs = mid - 1;
                } else {
                    lhs = mid + 1;
                }
            }
            
            for (let j = lhs; j < i; j++) {
                times += 1;

                source[i].color = SECONDARY_COLOR;
                source[j].color = PRIMARY_COLOR;
                callback({ times, datalist: source });

                await swap(source, j, i, temp);
                await delay(SORT_DELAY_DURATION);

                source[i].color = CLEAR_COLOR;
                source[j].color = CLEAR_COLOR;
                callback({ times, datalist: source });
            }
        }

        await delay(SORT_DELAY_DURATION);
        await complete(source, times, callback);
    }

}

/**
 * 希尔排序
 */
@Injectable()
export class ShellSortService {

    public sort(array: SortDataModel[], order: SortOrder): Observable<SortStateModel> {
        return new Observable(subscriber => {
            const temp: SortDataModel = { value: 0, color: CLEAR_COLOR };

            if (order === 'ascent') {
                this.sortByAscent(array, 0, temp, param => subscriber.next(param)).then(() => subscriber.complete());
            }
    
            if (order === 'descent') {
                this.sortByDescent(array, 0, temp, param => subscriber.next(param)).then(() => subscriber.complete());
            }
        });
    }

    private async sortByAscent(source: SortDataModel[], times: number, temp: SortDataModel, callback: (param: SortStateModel) => void): Promise<void> {
        for (let gap = Math.floor(source.length * 0.5); gap > 0; gap = Math.floor(gap * 0.5)) {
            for (let i = gap; i < source.length; i++) {
                for (let j = i - gap; j >= 0; j -= gap) {
                    source[j].color = PRIMARY_COLOR;
    
                    if (source[j].value > source[j + gap].value) {
                        source[j + gap].color = SECONDARY_COLOR;
                        await swap(source, j, j + gap, temp);
                        times += 1;
                    }
    
                    callback({ times, datalist: source});

                    await delay(SORT_DELAY_DURATION);

                    source[j].color = CLEAR_COLOR;
                    source[j + gap].color = CLEAR_COLOR;
                    callback({ times, datalist: source});
                }
            }
        }
        
        await delay(SORT_DELAY_DURATION);
        await complete(source, times, callback);
    }

    private async sortByDescent(source: SortDataModel[], times: number, temp: SortDataModel, callback: (parram: SortStateModel) => void): Promise<void> {
        for (let gap = Math.floor(source.length * 0.5); gap > 0; gap = Math.floor(gap * 0.5)) {
            for (let i = gap; i < source.length; i++) {
                for (let j = i - gap; j >= 0; j -= gap) {
                    source[j].color = PRIMARY_COLOR;
    
                    if (source[j].value < source[j + gap].value) {
                        source[j + gap].color = SECONDARY_COLOR;
                        await swap(source, j, j + gap, temp);
                        times += 1;
                    }
    
                    callback({ times, datalist: source});

                    await delay(SORT_DELAY_DURATION);

                    source[j].color = CLEAR_COLOR;
                    source[j + gap].color = CLEAR_COLOR;
                    callback({ times, datalist: source});
                }
            }
        }

        await delay(SORT_DELAY_DURATION);
        await complete(source, times, callback);
    }

}


