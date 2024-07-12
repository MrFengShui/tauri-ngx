import { Injectable } from "@angular/core";
import { Observable } from "rxjs";

import { SortDataModel, SortStateModel, SortOrder } from "../ngrx-store/sort.state";
import { ACCENT_COLOR, ACCENT_ONE_COLOR, ACCENT_TWO_COLOR, CLEAR_COLOR, PRIMARY_COLOR, PRIMARY_ONE_COLOR, PRIMARY_TWO_COLOR, SECONDARY_COLOR, SECONDARY_ONE_COLOR, SECONDARY_TWO_COLOR, SORT_DELAY_DURATION, complete, delay, swap } from "../sort.utils";
import { SortToolsService } from "../ngrx-store/sort.service";

/**
 * 归并排序（自顶向下）
 */
@Injectable()
export class TopDownMergeSortService {

    constructor(private _service: SortToolsService) {}

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
        times = await this.sortByOrder(source, 0, source.length - 1, 'ascent', times, callback);
        await delay(SORT_DELAY_DURATION);
        await complete(source, times, callback);
    }

    private async sortByDescent(source: SortDataModel[], times: number, callback: (parram: SortStateModel) => void): Promise<void> {
        times = await this.sortByOrder(source, 0, source.length - 1, 'descent', times, callback);
        await delay(SORT_DELAY_DURATION);
        await complete(source, times, callback);
    }

    private async sortByOrder(source: SortDataModel[], lhs: number, rhs: number, order: SortOrder, times: number, callback: (parram: SortStateModel) => void): Promise<number> {
        if (lhs < rhs) {
            const mid: number = Math.floor((rhs - lhs) * 0.5 + lhs);
            times = await this.sortByOrder(source, lhs, mid, order, times, callback);
            times = await this.sortByOrder(source, mid + 1, rhs, order, times, callback);

            if (order === 'ascent') {
                times = await this._service.mergeByAscent(source, lhs, mid, rhs, times, callback);
            }
            
            if (order === 'descent') {
                times = await this._service.mergeByDescent(source, lhs, mid, rhs, times, callback);
            }
        }

        return times;
    }

}

/**
 * 归并排序（自底向上）
 */
@Injectable()
export class BottomUpMergeSortService {

    constructor(private _service: SortToolsService) {}

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
        let lhs: number, rhs: number, mid: number;

        for (let i = 1, length = source.length; i < length; i = i + i) {
            for (let j = 0; j < length - i; j += i + i) {
                lhs = j;
                rhs = Math.min(j + i + i - 1, length - 1);
                mid = Math.floor((rhs - lhs) * 0.5 + lhs);
                times = await this._service.mergeByAscent(source, lhs, mid, rhs, times, callback );
            }
        }

        await delay(SORT_DELAY_DURATION);
        await complete(source, times, callback);
    }

    private async sortByDescent(source: SortDataModel[], times: number, callback: (parram: SortStateModel) => void): Promise<void> {
        let lhs: number, rhs: number, mid: number;

        for (let i = 1, length = source.length; i < length; i = i + i) {
            for (let j = 0; j < length - i; j += i + i) {
                lhs = j;
                rhs = Math.min(j + i + i - 1, length - 1);
                mid = Math.floor((rhs - lhs) * 0.5 + lhs);
                times = await this._service.mergeByDescent(source, lhs, mid, rhs, times, callback );
            }
        }

        await delay(SORT_DELAY_DURATION);
        await complete(source, times, callback);
    }

}

/**
 * 原地归并排序
 */
@Injectable()
export class InPlaceMergeSortService {

    public sort(array: SortDataModel[], order: SortOrder): Observable<SortStateModel> {
        return new Observable(subscriber => {
            const temp: SortDataModel = { value: 0, color: CLEAR_COLOR };

            if (order === 'ascent') {
                this.sortByAscent(array, 0, array.length - 1, temp, 0, param => subscriber.next(param)).then(() => subscriber.complete());
            }
    
            if (order === 'descent') {
                this.sortByDescent(array, 0, array.length - 1, temp, 0, param => subscriber.next(param)).then(() => subscriber.complete());
            }
        });
    }

    private async sortByAscent(source: SortDataModel[], lhs: number, rhs: number, temp: SortDataModel, times: number, callback: (param: SortStateModel) => void): Promise<void> {
        times = await this.sortByOrder(source, lhs, rhs, 'ascent', temp, times, callback);
        await delay(SORT_DELAY_DURATION);
        await complete(source, times, callback);
    }

    private async sortByDescent(source: SortDataModel[], lhs: number, rhs: number, temp: SortDataModel, times: number, callback: (parram: SortStateModel) => void): Promise<void> {
        times = await this.sortByOrder(source, lhs, rhs, 'descent', temp, times, callback);
        await delay(SORT_DELAY_DURATION);
        await complete(source, times, callback);
    }

    private async sortByOrder(source: SortDataModel[], lhs: number, rhs: number, order: SortOrder, temp: SortDataModel, times: number, callback: (parram: SortStateModel) => void): Promise<number> {
        if (lhs < rhs) {
            const mid: number = Math.floor((rhs - lhs) * 0.5 + lhs);
            times = await this.sortByOrder(source, lhs, mid, order, temp, times, callback);
            times = await this.sortByOrder(source, mid + 1, rhs, order, temp, times, callback);

            if (order === 'ascent') {
                times = await this.mergeByAscent(source, lhs, mid, rhs, temp, times, callback);
            }
            
            if (order === 'descent') {
                times = await this.mergeByDescent(source, lhs, mid, rhs, temp, times, callback);
            }
        }

        return times;
    }

    private async mergeByAscent(source: SortDataModel[], lhs: number, mid: number, rhs: number, temp: SortDataModel, times: number, callback: (parram: SortStateModel) => void): Promise<number> {
        let i: number = lhs, j: number = mid + 1;

        while (i <= mid && j <= rhs) {
            times += 1;

            source[i].color = ACCENT_ONE_COLOR;
            source[j].color = ACCENT_TWO_COLOR;
            callback({ times, datalist: source });

            await delay(SORT_DELAY_DURATION);
            
            if (source[i].value < source[j].value) {
                source[i].color = CLEAR_COLOR;
                source[j].color = CLEAR_COLOR;
                callback({ times, datalist: source });

                i += 1;
            } else {
                for (let k = j; k > i; k--) {
                    source[j].color = ACCENT_TWO_COLOR;
                    source[k].color = ACCENT_COLOR;
                    callback({ times, datalist: source });

                    await swap(source, k, k - 1, temp);
                    await delay(SORT_DELAY_DURATION);

                    source[j].color = ACCENT_TWO_COLOR;
                    source[k].color = CLEAR_COLOR;
                    callback({ times, datalist: source });
                }

                source[i].color = CLEAR_COLOR;
                source[j].color = CLEAR_COLOR;
                callback({ times, datalist: source });

                i += 1;
                j += 1;
                mid += 1;
            }
        }

        return times;
    }

    private async mergeByDescent(source: SortDataModel[], lhs: number, mid: number, rhs: number, temp: SortDataModel, times: number, callback: (parram: SortStateModel) => void): Promise<number> {
        let i: number = lhs, j: number = mid + 1;

        while (i <= mid && j <= rhs) {
            times += 1;

            source[i].color = ACCENT_ONE_COLOR;
            callback({ times, datalist: source });

            await delay(SORT_DELAY_DURATION);
            
            if (source[i].value > source[j].value) {
                source[i].color = CLEAR_COLOR;
                source[j].color = CLEAR_COLOR;
                callback({ times, datalist: source });

                i += 1;
            } else {
                for (let k = j; k > i; k--) {
                    source[j].color = ACCENT_TWO_COLOR;
                    source[k].color = ACCENT_COLOR;
                    callback({ times, datalist: source });

                    await swap(source, k, k - 1, temp);
                    await delay(SORT_DELAY_DURATION);

                    source[j].color = ACCENT_COLOR;
                    source[k].color = CLEAR_COLOR;
                    callback({ times, datalist: source });
                }

                source[i].color = CLEAR_COLOR;
                source[j].color = CLEAR_COLOR;
                callback({ times, datalist: source });

                i += 1;
                j += 1;
                mid += 1;
            }
        }

        return times;
    }

}

/**
 * 多路归并排序
 */
@Injectable()
export class MultiWayMergeSortService {

    private points: number[][] = Array.from([]);
    private final: Array<{ index: number, value: number }> = Array.from([]);
    private group: { [key: string | number]: number[] } = {};
    
    public sort(array: SortDataModel[], order: SortOrder, way: number = 3): Observable<SortStateModel> {
        return new Observable(subscriber => {
            if (order === 'ascent') {
                this.sortByAscent(array, 0, array.length - 1, way, 0, param => subscriber.next(param)).then(() => subscriber.complete());
            }
    
            if (order === 'descent') {
                this.sortByDescent(array, 0, array.length - 1, way, 0, param => subscriber.next(param)).then(() => subscriber.complete());
            }
        });
    }

    private async sortByAscent(source: SortDataModel[], lhs: number, rhs: number, way: number, times: number, callback: (param: SortStateModel) => void): Promise<void> {
        for (let i = 0; i < way; i++) {
            this.group[i] = Array.from([]);
        }

        times = await this.sortByOrder(source, lhs, rhs, way, 'ascent', times, callback);
        await delay(SORT_DELAY_DURATION);
        await complete(source, times, callback);
        await this.clear();
    }

    private async sortByDescent(source: SortDataModel[], lhs: number, rhs: number, way: number, times: number, callback: (param: SortStateModel) => void): Promise<void> {
        for (let i = 0; i < way; i++) {
            this.group[i] = Array.from([]);
        }

        times = await this.sortByOrder(source, lhs, rhs, way, 'descent', times, callback);
        await delay(SORT_DELAY_DURATION);
        await complete(source, times, callback);
        await this.clear();
    }

    private async sortByOrder(source: SortDataModel[], lhs: number, rhs: number, way: number, order: SortOrder, times: number, callback: (param: SortStateModel) => void): Promise<number> {
        const points: number[] = Array.from([]), pairs: Array<[number, number]> = Array.from([]);

        if (rhs - lhs >= way - 1) {
            for (let i = 0; i < way + 1; i++) {
                if (i === 0) {
                    points.push(lhs);
                } else if (i === way) {
                    points.push(rhs);
                } else {
                    points.push(Math.floor(i * (rhs - lhs) / way + lhs));
                }
            }

            this.points.push(points);

            for (let i = 0; i < points.length - 1; i++) {
                if (i === 0) {
                    pairs.push([points[i], points[i + 1]]);
                    times = await this.sortByOrder(source, points[i], points[i + 1], way, order, times, callback);
                } else {
                    pairs.push([points[i] + 1, points[i + 1]]);
                    times = await this.sortByOrder(source, points[i] + 1, points[i + 1], way, order, times, callback);
                }
            }

            if (order === 'ascent') {
                times = await this.mergeByAscent(source, pairs, times, callback);
            }
            
            if (order === 'descent') {
                times = await this.mergeByDescent(source, pairs, times, callback);
            }

            await this.empty(false);
        }
        
        return times;
    }

    private async mergeByAscent(source: SortDataModel[], pairs: Array<[number, number]>, times: number, callback: (parram: SortStateModel) => void): Promise<number> {
        let index: number, color: string;
        const array: number[] = Array.from([]), lhs: number = pairs[0][0], rhs: number = pairs[pairs.length - 1][1];
        
        for (let i = 0; i < pairs.length; i++) {
            if (i % 4 === 1) {
                color = SECONDARY_ONE_COLOR;
            } else if (i % 4 === 2) {
                color = PRIMARY_TWO_COLOR;
            } else if (i % 4 === 3) {
                color = SECONDARY_TWO_COLOR;
            } else {
                color = PRIMARY_ONE_COLOR;
            }

            for (let j = pairs[i][0]; j <= pairs[i][1]; j++) {
                times += 1;
    
                source[j].color = color;
                callback({ times, datalist: source });
    
                await delay(SORT_DELAY_DURATION);
                
                source[j].color = CLEAR_COLOR;
                callback({ times, datalist: source });
                
                this.group[i].push(source[j].value);
            }
        }
        
        while (array.length < rhs - lhs + 1) {
            for (const key of Object.keys(this.group)) {
                index = await this.findMinInGroup(this.group[key]);
                this.final[Number.parseInt(key)] = { index, value: index === -1 ? Number.MAX_SAFE_INTEGER : this.group[Number.parseInt(key)][index] } ;
            }
            
            index = this.findMinInFinal(this.final);
            array.push(this.final[index].value);
            this.group[index].splice(this.final[index].index, 1);
        }

        for (let i = 0, length = array.length; i < length; i++) {
            times += 1;

            source[lhs + i].value = array[i];
            source[lhs + i].color = ACCENT_COLOR;
            callback({ times, datalist: source });

            await delay(SORT_DELAY_DURATION);
            
            source[lhs + i].color = CLEAR_COLOR;            
            callback({ times, datalist: source });
        }

        return times;
    }

    private async mergeByDescent(source: SortDataModel[], pairs: Array<[number, number]>, times: number, callback: (parram: SortStateModel) => void): Promise<number> {
        let index: number, color: string;
        const array: number[] = Array.from([]), lhs: number = pairs[0][0], rhs: number = pairs[pairs.length - 1][1]
        
        for (let i = 0; i < pairs.length; i++) {
            if (i % 4 === 1) {
                color = SECONDARY_ONE_COLOR;
            } else if (i % 4 === 2) {
                color = PRIMARY_TWO_COLOR;
            } else if (i % 4 === 3) {
                color = SECONDARY_TWO_COLOR;
            } else {
                color = PRIMARY_ONE_COLOR;
            }

            for (let j = pairs[i][0]; j <= pairs[i][1]; j++) {
                times += 1;
    
                source[j].color = color;
                callback({ times, datalist: source });
    
                await delay(SORT_DELAY_DURATION);
                
                source[j].color = CLEAR_COLOR;
                callback({ times, datalist: source });
                
                this.group[i].push(source[j].value);
            }
        }
        
        while (array.length < rhs - lhs + 1) {
            for (const key of Object.keys(this.group)) {
                index = await this.findMaxInGroup(this.group[key]);
                this.final[Number.parseInt(key)] = { index, value: index === -1 ? Number.MIN_SAFE_INTEGER : this.group[Number.parseInt(key)][index] } ;
            }
            
            index = this.findMaxInFinal(this.final);
            array.push(this.final[index].value);
            this.group[index].splice(this.final[index].index, 1);
        }

        for (let i = 0, length = array.length; i < length; i++) {
            times += 1;

            source[lhs + i].value = array[i];
            source[lhs + i].color = ACCENT_COLOR;
            callback({ times, datalist: source });

            await delay(SORT_DELAY_DURATION);
            
            source[lhs + i].color = CLEAR_COLOR;            
            callback({ times, datalist: source });
        }

        return times;
    }

    private async findMaxInGroup(list: number[]): Promise<number> {
        let index: number = -1, value: number = Number.MIN_SAFE_INTEGER;

        for (let i = 0, length = list.length; i < length; i++) {
            if (list[i] > value) {
                index = i;
                value = list[i];
            }
        }

        return index;
    }

    private async findMinInGroup(list: number[]): Promise<number> {
        let index: number = -1, value: number = Number.MAX_SAFE_INTEGER;

        for (let i = 0, length = list.length; i < length; i++) {
            if (list[i] < value) {
                index = i;
                value = list[i];
            }
        }

        return index;
    }

    private findMaxInFinal(list: Array<{ index: number, value: number }>): number{
        let index: number = -1, value: number = Number.MIN_SAFE_INTEGER;

        for (let i = 0; i < list.length; i++) {
            if (list[i].value > value) {
                index = i;
                value = list[i].value;
            }
        }

        return index;
    }

    private findMinInFinal(list: Array<{ index: number, value: number }>): number{
        let index: number = -1, value: number = Number.MAX_SAFE_INTEGER;

        for (let i = 0; i < list.length; i++) {
            if (list[i].value < value) {
                index = i;
                value = list[i].value;
            }
        }

        return index;
    }

    private empty(flag: boolean = true): Promise<void> {
        return new Promise(resolve => {
            for (const key of Object.keys(this.group)) {
                this.group[key].splice(0);

                if (flag) {
                    delete this.group[key];
                }
            }
    
            this.final.splice(0);
            resolve();
        });
    }

    private async clear(): Promise<void> {
        for (const points of this.points) {
            points.splice(0);
        }

        await this.empty();
    }

}