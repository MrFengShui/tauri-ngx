import { Injectable } from "@angular/core";
import { Observable } from "rxjs";

import { SortDataModel, SortStateModel, SortOrder } from "../ngrx-store/sort.state";
import { SORT_DELAY_DURATION, complete, delay, swap } from "../sort.utils";

/**
 * 单向冒泡排序
 */
@Injectable()
export class BubbleSortService {

    public sort(array: SortDataModel[], order: SortOrder): Observable<SortStateModel> {
        return new Observable(subscriber => {
            let temp: SortDataModel = { value: 0, color: 'whitesmoke' };

            if (order === 'ascent') {
                this.sortByAscent(array, temp, false, 0, param => subscriber.next(param)).then(() => subscriber.complete());
            }
    
            if (order === 'descent') {
                this.sortByDescent(array, temp, false, 0, param => subscriber.next(param)).then(() => subscriber.complete());
            }
        });
    }

    private async sortByAscent(source: SortDataModel[], temp: SortDataModel, flag: boolean, times: number, callback: (param: SortStateModel) => void): Promise<void> {
        for (let i = 0; i < source.length; i++) {
            flag = false;

            for (let j = 0; j < source.length - i - 1; j++) {
                source[j].color = 'lawngreen';

                if (source[j + 1].value < source[j].value) {
                    source[j + 1].color = 'orangered';
                    await swap(source, j + 1, j, temp);
                    flag = true;
                    times += 1;
                }

                callback({ completed: false, times, datalist: source});

                await delay(SORT_DELAY_DURATION);
                
                source[j].color = 'whitesmoke';
                source[j + 1].color = 'whitesmoke';
                callback({ completed: false, times, datalist: source});
            }

            if (!flag) break;
        }

        await delay(SORT_DELAY_DURATION);
        await complete(source, times, callback);
    }

    private async sortByDescent(source: SortDataModel[], temp: SortDataModel, flag: boolean, times: number, callback: (parram: SortStateModel) => void): Promise<void> {
        for (let i = 0; i < source.length; i++) {
            flag = false;
            
            for (let j = 0; j < source.length - i - 1; j++) {
                source[j].color = 'lawngreen';

                if (source[j + 1].value > source[j].value) {
                    source[j + 1].color = 'orangered';
                    await swap(source, j + 1, j, temp);
                    flag = true;
                    times += 1;
                }

                callback({ completed: false, times, datalist: source});

                await delay(SORT_DELAY_DURATION);
                
                source[j].color = 'whitesmoke';
                source[j + 1].color = 'whitesmoke';
                callback({ completed: false, times, datalist: source});
            }

            if (!flag) break;
        }

        await delay(SORT_DELAY_DURATION);
        await complete(source, times, callback);
    }

}

/**
 * 双向冒泡排序
 */
@Injectable()
export class BiBubbleSortService {

    public sort(array: SortDataModel[], order: SortOrder): Observable<SortStateModel> {
        return new Observable(subscriber => {
            let temp: SortDataModel = { value: 0, color: 'whitesmoke' };

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

        for (i = 0; i < source.length; i++) {
            flag = false;

            for (j = pivot; j < source.length - i - 1; j++) {
                source[j].color = 'lawngreen';

                if (source[j + 1].value < source[j].value) {
                    source[j + 1].color = 'orangered';
                    await swap(source, j + 1, j, temp);
                    flag = true;
                    times += 1;
                }

                callback({ completed: false, times, datalist: source});

                await delay(SORT_DELAY_DURATION);
                
                source[j].color = 'whitesmoke';
                source[j + 1].color = 'whitesmoke';
                callback({ completed: false, times, datalist: source});
            }

            pivot = j;

            for (j = pivot; j > i; j--) {
                source[j].color = 'lawngreen';

                if (source[j - 1].value > source[j].value) {
                    source[j - 1].color = 'orangered';
                    await swap(source, j - 1, j, temp);
                    flag = true;
                    times += 1;
                }

                callback({ completed: false, times, datalist: source});

                await delay(SORT_DELAY_DURATION);
                
                source[j].color = 'whitesmoke';
                source[j - 1].color = 'whitesmoke';
                callback({ completed: false, times, datalist: source});
            }

            pivot = j;

            if (!flag) break;
        }

        await delay(SORT_DELAY_DURATION);
        await complete(source, times, callback);
    }

    private async sortByDescent(source: SortDataModel[], temp: SortDataModel, flag: boolean, times: number, callback: (parram: SortStateModel) => void): Promise<void> {
        let i: number, j: number, pivot: number = 0;

        for (i = 0; i < source.length; i++) {
            flag = false;

            for (j = pivot; j < source.length - i - 1; j++) {
                source[j].color = 'lawngreen';

                if (source[j + 1].value > source[j].value) {
                    source[j + 1].color = 'orangered';
                    await swap(source, j + 1, j, temp);
                    flag = true;
                    times += 1;
                }

                callback({ completed: false, times, datalist: source});

                await delay(SORT_DELAY_DURATION);
                
                source[j].color = 'whitesmoke';
                source[j + 1].color = 'whitesmoke';
                callback({ completed: false, times, datalist: source});
            }

            pivot = j;

            for (j = pivot; j > i; j--) {
                source[j].color = 'lawngreen';

                if (source[j - 1].value < source[j].value) {
                    source[j - 1].color = 'orangered';
                    await swap(source, j - 1, j, temp);
                    flag = true;
                    times += 1;
                }

                callback({ completed: false, times, datalist: source});

                await delay(SORT_DELAY_DURATION);
                
                source[j].color = 'whitesmoke';
                source[j - 1].color = 'whitesmoke';
                callback({ completed: false, times, datalist: source});
            }

            pivot = j;

            if (!flag) break;
        }

        await delay(SORT_DELAY_DURATION);
        await complete(source, times, callback);
    }

}
