import { Injectable } from "@angular/core";
import { Observable } from "rxjs";

import { SortDataModel, SortStateModel, SortOrder } from "../ngrx-store/sort.state";
import { CLEAR_COLOR, PRIMARY_COLOR, SECONDARY_COLOR, SORT_DELAY_DURATION, complete, delay, swap } from "../sort.utils";

/**
 * 双调归并排序（自顶向下）
 */
@Injectable()
export class TopDownBitonicMergeSortService {

    public sort(array: SortDataModel[], order: SortOrder): Observable<SortStateModel> {
        return new Observable(subscriber => {
            const temp: SortDataModel = { value: 0, color: 'whitesmoke' };

            if (order === 'ascent') {
                this.sortByAscent(array, 0, array.length - 1, temp, 0, param => subscriber.next(param)).then(() => subscriber.complete());
            }
    
            if (order === 'descent') {
                this.sortByDescent(array, 0, array.length - 1, temp, 0, param => subscriber.next(param)).then(() => subscriber.complete());
            }
        });
    }

    private async sortByAscent(source: SortDataModel[], lhs: number, rhs: number, temp: SortDataModel, times: number, callback: (param: SortStateModel) => void): Promise<void> {
        times = await this.sortByOrder(source, lhs, rhs, 'up', temp, 'ascent', times, callback);
        await delay(SORT_DELAY_DURATION);
        await complete(source, times, callback);
    }

    private async sortByDescent(source: SortDataModel[], lhs: number, rhs: number, temp: SortDataModel, times: number, callback: (parram: SortStateModel) => void): Promise<void> {
        times = await this.sortByOrder(source, lhs, rhs, 'up', temp, 'descent', times, callback);
        await delay(SORT_DELAY_DURATION);
        await complete(source, times, callback);
    }

    private async sortByOrder(source: SortDataModel[], lhs: number, rhs: number, flag: 'up' | 'down', temp: SortDataModel, order: SortOrder, times: number, callback: (parram: SortStateModel) => void): Promise<number> {
        if (rhs - lhs >= 1) {
            const mid: number = Math.floor((rhs - lhs) * 0.5 + lhs);
            times = await this.sortByOrder(source, lhs, mid, 'up', temp, order, times, callback);
            times = await this.sortByOrder(source, mid + 1, rhs, 'down', temp, order, times, callback);

            if (order === 'ascent') {
                times = await this.mergeByAscent(source, lhs, rhs, flag, temp, times, callback);
            }
            
            if (order === 'descent') {
                times = await this.mergeByDescent(source, lhs, rhs, flag, temp, times, callback);
            }
        }

        return times;
    }

    private async mergeByAscent(source: SortDataModel[], lhs: number, rhs: number, flag: 'up' | 'down', temp: SortDataModel, times: number, callback: (parram: SortStateModel) => void): Promise<number> {
        if (rhs - lhs >= 1) {
            const mid: number = Math.floor((rhs - lhs) * 0.5 + lhs);

            for (let i = lhs, j = mid + 1; i <= mid && j <= rhs; i++, j++) {
                source[i].color = PRIMARY_COLOR;
                source[j].color = SECONDARY_COLOR;
                callback({ times, datalist: source});  

                await delay(SORT_DELAY_DURATION);

                if ((source[i].value > source[j].value && flag === 'up') || (source[i].value < source[j].value && flag === 'down')) {
                    await swap(source, i, j, temp);
                    times += 1;
                }

                source[i].color = CLEAR_COLOR;
                source[j].color = CLEAR_COLOR;
                callback({ times, datalist: source});                
            }

            times = await this.mergeByAscent(source, lhs, mid, flag, temp, times, callback);
            times = await this.mergeByAscent(source, mid + 1, rhs, flag, temp, times, callback);
        }

        return times;
    }

    private async mergeByDescent(source: SortDataModel[], lhs: number, rhs: number, flag: 'up' | 'down', temp: SortDataModel, times: number, callback: (parram: SortStateModel) => void): Promise<number> {
        if (rhs - lhs >= 1) {
            const mid: number = Math.floor((rhs - lhs) * 0.5 + lhs);

            for (let i = lhs, j = mid + 1; i <= mid && j <= rhs; i++, j++) {
                source[i].color = PRIMARY_COLOR;
                source[j].color = SECONDARY_COLOR;
                callback({ times, datalist: source});  

                await delay(SORT_DELAY_DURATION);

                if ((source[i].value > source[j].value && flag === 'down') || (source[i].value < source[j].value && flag === 'up')) {
                    await swap(source, i, j, temp);
                    times += 1;
                }

                source[i].color = CLEAR_COLOR;
                source[j].color = CLEAR_COLOR;
                callback({ times, datalist: source});                
            }

            times = await this.mergeByDescent(source, lhs, mid, flag, temp, times, callback);
            times = await this.mergeByDescent(source, mid + 1, rhs, flag, temp, times, callback);
        }

        return times;
    }

}

/**
 * 双调归并排序（自底向上）
 */
@Injectable()
export class BottomUpBitonicMergeSortService {

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
        for (let i = 2, length = source.length; i <= length; i *= 2) {
            for (let j = i >> 1; j > 0; j >>= 1) {
                times = await this.mergeByAscent(source, i, j, temp, times, callback);
            }
        }

        await delay(SORT_DELAY_DURATION);
        await complete(source, times, callback);
    }

    private async sortByDescent(source: SortDataModel[], temp: SortDataModel, times: number, callback: (parram: SortStateModel) => void): Promise<void> {
        for (let i = 2, length = source.length; i <= length; i *= 2) {
            for (let j = i >> 1; j > 0; j >>= 1) {
                times = await this.mergeByDescent(source, i, j, temp, times, callback);
            }
        }

        await delay(SORT_DELAY_DURATION);
        await complete(source, times, callback);
    }

    private async mergeByAscent(source: SortDataModel[], scale: number, gap: number, temp: SortDataModel, times: number, callback: (parram: SortStateModel) => void): Promise<number> {
        let and: number, xor: number;

        for (let i = 0, length = source.length; i < length; i++) {
            xor = gap ^ i;

            if (xor > i) {
                and = scale & i;

                source[i].color = PRIMARY_COLOR;
                source[xor].color = SECONDARY_COLOR;
                callback({ times, datalist: source});  

                await delay(SORT_DELAY_DURATION);
                
                if ((source[i].value > source[xor].value && and === 0) || (source[i].value < source[xor].value && and !== 0)) {
                    await swap(source, i, xor, temp);
                    times += 1;
                }

                source[i].color = CLEAR_COLOR;
                source[xor].color = CLEAR_COLOR;
                callback({ times, datalist: source});  
            }
        }

        return times;
    }

    private async mergeByDescent(source: SortDataModel[], scale: number, gap: number, temp: SortDataModel, times: number, callback: (parram: SortStateModel) => void): Promise<number> {
        let and: number, xor: number;

        for (let i = 0, length = source.length; i < length; i++) {
            xor = gap ^ i;

            if (xor > i) {
                and = scale & i;

                source[i].color = PRIMARY_COLOR;
                source[xor].color = SECONDARY_COLOR;
                callback({ times, datalist: source});  

                await delay(SORT_DELAY_DURATION);
                
                if ((source[i].value > source[xor].value && and !== 0) || (source[i].value < source[xor].value && and === 0)) {
                    await swap(source, i, xor, temp);
                    times += 1;
                }

                source[i].color = CLEAR_COLOR;
                source[xor].color = CLEAR_COLOR;
                callback({ times, datalist: source});  
            }
        }

        return times;
    }

}
