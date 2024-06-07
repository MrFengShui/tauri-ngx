import { Injectable } from "@angular/core";
import { Observable } from "rxjs";

import { SortDataModel, SortStateModel, SortOrder } from "../ngrx-store/sort.state";
import { SORT_DELAY_DURATION, complete, delay, swap } from "../sort.utils";

/**
 * 单路快速排序
 */
@Injectable()
export class QuickSortService {

    public sort(array: SortDataModel[], order: SortOrder): Observable<SortStateModel> {
        return new Observable(subscriber => {
            let temp: SortDataModel = { value: 0, color: 'whitesmoke' };

            if (order === 'ascent') {
                this.sortByAscent(array, 0, array.length - 1, temp, 0, param => subscriber.next(param)).then(() => subscriber.complete());
            }
    
            if (order === 'descent') {
                this.sortByDescent(array, 0, array.length - 1, temp, 0, param => subscriber.next(param)).then(() => subscriber.complete());
            }
        });
    }

    private async sortByAscent(source: SortDataModel[], lhs: number, rhs: number, temp: SortDataModel, times: number, callback: (param: SortStateModel) => void): Promise<void> {
        times = await this.sortByOrder(source, lhs, rhs, temp, 'ascent', times, callback);
        await delay(SORT_DELAY_DURATION);
        await complete(source, times, callback);
    }

    private async sortByDescent(source: SortDataModel[], lhs: number, rhs: number, temp: SortDataModel, times: number, callback: (param: SortStateModel) => void): Promise<void> {
        times = await this.sortByOrder(source, lhs, rhs, temp, 'descent', times, callback);
        await delay(SORT_DELAY_DURATION);
        await complete(source, times, callback);
    }

    private async sortByOrder(source: SortDataModel[], lhs: number, rhs: number, temp: SortDataModel, order: SortOrder, times: number, callback: (param: SortStateModel) => void): Promise<number> {
        let mid: number = -1;

        if (lhs < rhs) {
            if (order === 'ascent') {
                [times, mid] = await this.partitionByAscent(source, lhs, rhs, temp, times, callback);
            }

            if (order === 'descent') {
                [times, mid] = await this.partitionByDescent(source, lhs, rhs, temp, times, callback);
            }
            
            times = await this.sortByOrder(source, lhs, mid - 1, temp, order, times, callback);
            times = await this.sortByOrder(source, mid + 1, rhs, temp, order, times, callback);
        }

        return times;
    }

    private async partitionByAscent(source: SortDataModel[], lhs: number, rhs: number, temp: SortDataModel, times: number, callback: (parram: SortStateModel) => void): Promise<[number, number]> {
        let pivot: number = rhs, i: number = lhs - 1;
        source[pivot].color = 'dodgerblue';

        for (let j = lhs; j < rhs; j++) {
            source[j].color = 'lawngreen';
            callback({ completed: false, times, datalist: source});

            if (source[j].value < source[pivot].value) {
                i += 1;
                source[i].color = 'orangered';
                callback({ completed: false, times, datalist: source});
                
                times += 1;
                await swap(source, i, j, temp);
            }

            await delay(SORT_DELAY_DURATION);
            
            if (i > -1) {
                source[i].color = 'whitesmoke';
            }

            source[j].color = 'whitesmoke';
            callback({ completed: false, times, datalist: source});
        }

        await delay(SORT_DELAY_DURATION);
        await swap(source, i + 1, pivot, temp);

        source[i + 1].color = 'whitesmoke';
        callback({ completed: false, times, datalist: source});
        return [times, i + 1];
    }

    private async partitionByDescent(source: SortDataModel[], lhs: number, rhs: number, temp: SortDataModel, times: number, callback: (parram: SortStateModel) => void): Promise<[number, number]> {
        let pivot: number = rhs, i: number = lhs - 1;
        source[pivot].color = 'dodgerblue';

        for (let j = lhs; j < rhs; j++) {
            source[j].color = 'lawngreen';
            callback({ completed: false, times, datalist: source});

            if (source[j].value > source[pivot].value) {
                i += 1;
                source[i].color = 'orangered';
                callback({ completed: false, times, datalist: source});

                times += 1;
                await swap(source, i, j, temp);
            }

            await delay(SORT_DELAY_DURATION);
            
            if (i > -1) {
                source[i].color = 'whitesmoke';
            }

            source[j].color = 'whitesmoke';
            callback({ completed: false, times, datalist: source});
        }

        await delay(SORT_DELAY_DURATION);
        await swap(source, i + 1, pivot, temp);

        source[i + 1].color = 'whitesmoke';
        callback({ completed: false, datalist: source});
        return [times, i + 1];
    }

}

/**
 * 二路快速排序
 */
@Injectable()
export class TwoWayQuickSortService {

    public sort(array: SortDataModel[], order: SortOrder): Observable<SortStateModel> {
        return new Observable(subscriber => {
            let temp: SortDataModel = { value: 0, color: 'whitesmoke' };

            if (order === 'ascent') {
                this.sortByAscent(array, 0, array.length - 1, temp, 0, param => subscriber.next(param)).then(() => subscriber.complete());
            }
    
            if (order === 'descent') {
                this.sortByDescent(array, 0, array.length - 1, temp, 0, param => subscriber.next(param)).then(() => subscriber.complete());
            }
        });
    }

    private async sortByAscent(source: SortDataModel[], lhs: number, rhs: number, temp: SortDataModel, times: number, callback: (param: SortStateModel) => void): Promise<void> {
        times = await this.sortByOrder(source, lhs, rhs, temp, 'ascent', times, callback);
        await delay(SORT_DELAY_DURATION);
        await complete(source, times, callback);
    }

    private async sortByDescent(source: SortDataModel[], lhs: number, rhs: number, temp: SortDataModel, times: number, callback: (param: SortStateModel) => void): Promise<void> {
        times = await this.sortByOrder(source, lhs, rhs, temp, 'descent', times, callback);
        await delay(SORT_DELAY_DURATION);
        await complete(source, times, callback);
    }

    private async sortByOrder(source: SortDataModel[], lhs: number, rhs: number, temp: SortDataModel, order: SortOrder, times: number, callback: (param: SortStateModel) => void): Promise<number> {
        let mid: number = -1;

        if (lhs < rhs) {
            if (order === 'ascent') {
                [times, mid] = await this.partitionByAscent(source, lhs, rhs, temp, times, callback);
            }

            if (order === 'descent') {
                [times, mid] = await this.partitionByDescent(source, lhs, rhs, temp, times, callback);
            }
            
            times = await this.sortByOrder(source, lhs, mid - 1, temp, order, times, callback);
            times = await this.sortByOrder(source, mid + 1, rhs, temp, order, times, callback);
        }

        return times;
    }

    private async partitionByAscent(source: SortDataModel[], lhs: number, rhs: number, temp: SortDataModel, times: number, callback: (parram: SortStateModel) => void): Promise<[number, number]> {
        let pivot: number = rhs, i: number = lhs, j: number = rhs;
        
        while (i < j) {
            source[pivot].color = 'dodgerblue';

            while (i < j && source[i].value <= source[pivot].value) {
                source[i].color = 'lawngreen';
                callback({ completed: false, times, datalist: source});

                await delay(SORT_DELAY_DURATION);

                source[i].color = 'whitesmoke';
                callback({ completed: false, times, datalist: source});

                i += 1;
            }

            while (i < j && source[j].value >= source[pivot].value) {
                source[j].color = 'orangered';
                callback({ completed: false, times, datalist: source});

                await delay(SORT_DELAY_DURATION);

                source[j].color = 'whitesmoke';
                callback({ completed: false, times, datalist: source});
                
                j -= 1;
            }

            await delay(SORT_DELAY_DURATION);
            await swap(source, i, j, temp);
            times += 1;

            source[pivot].color = 'whitesmoke';
            source[i].color = 'whitesmoke';
            source[j].color = 'whitesmoke';
            callback({ completed: false, times, datalist: source});
        }

        await delay(SORT_DELAY_DURATION);
        await swap(source, i, pivot, temp);
        
        source[i].color = 'whitesmoke';
        callback({ completed: false, datalist: source});
        return [times, i];
    }

    private async partitionByDescent(source: SortDataModel[], lhs: number, rhs: number, temp: SortDataModel, times: number, callback: (parram: SortStateModel) => void): Promise<[number, number]> {
        let pivot: number = rhs, i: number = lhs, j: number = rhs;
        
        while (i < j) {
            source[pivot].color = 'dodgerblue';

            while (i < j && source[i].value >= source[pivot].value) {
                source[i].color = 'lawngreen';
                callback({ completed: false, times, datalist: source});

                await delay(SORT_DELAY_DURATION);

                source[i].color = 'whitesmoke';
                callback({ completed: false, times, datalist: source});

                i += 1;
            }

            while (i < j && source[j].value <= source[pivot].value) {
                source[j].color = 'orangered';
                callback({ completed: false, times, datalist: source});

                await delay(SORT_DELAY_DURATION);

                source[j].color = 'whitesmoke';
                callback({ completed: false, times, datalist: source});
                
                j -= 1;
            }

            await delay(SORT_DELAY_DURATION);
            await swap(source, i, j, temp);
            times += 1;
            
            source[pivot].color = 'whitesmoke';
            source[i].color = 'whitesmoke';
            source[j].color = 'whitesmoke';
            callback({ completed: false, times, datalist: source});
        }

        await delay(SORT_DELAY_DURATION);
        await swap(source, i, pivot, temp);

        source[i].color = 'whitesmoke';     
        callback({ completed: false, times, datalist: source});
        return [times, i];
    }

}
