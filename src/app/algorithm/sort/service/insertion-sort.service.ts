import { Injectable } from "@angular/core";
import { Observable } from "rxjs";

import { SortDataModel, SortStateModel, SortOrder } from "../ngrx-store/sort.state";
import { ACCENT_COLOR, ACCENT_ONE_COLOR, ACCENT_TWO_COLOR, CLEAR_COLOR, PRIMARY_COLOR, PRIMARY_ONE_COLOR, PRIMARY_TWO_COLOR, SECONDARY_COLOR, SECONDARY_ONE_COLOR, SECONDARY_TWO_COLOR, SORT_DELAY_DURATION, complete, delay, swap } from "../sort.utils";
import { SortToolsService } from "../ngrx-store/sort.service";

/**
 * 插入排序
 */
@Injectable()
export class InsertionSortService {

    constructor(private _service: SortToolsService) {}

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
        times = await this._service.stableSortByAscent(source, 0, source.length - 1, temp, times, callback);
        await delay(SORT_DELAY_DURATION);
        await complete(source, times, callback);
    }

    private async sortByDescent(source: SortDataModel[], times: number, temp: SortDataModel, callback: (parram: SortStateModel) => void): Promise<void> {
        times = await this._service.stableSortByDescent(source, 0, source.length - 1, temp, times, callback);
        await delay(SORT_DELAY_DURATION);
        await complete(source, times, callback);
    }

}

/**
 * 二分插入排序
 */
@Injectable()
export class BinarySearchInserionSortService {

    constructor(private _service: SortToolsService) {}

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
        let point: number;

        for (let i = 1, length = source.length; i < length; i++) {
            point = this._service.indexOfFirstGreaterThan(source, source[i], 0, i - 1);
            
            if (point === length) break;

            for (let j = point; j < i; j++) {
                times += 1;

                source[point].color = ACCENT_COLOR;
                source[i].color = SECONDARY_COLOR;
                source[j].color = PRIMARY_COLOR;
                callback({ times, datalist: source });

                await swap(source, j, i, temp);
                await delay(SORT_DELAY_DURATION);

                source[point].color = ACCENT_COLOR;
                source[i].color = CLEAR_COLOR;
                source[j].color = CLEAR_COLOR;
                callback({ times, datalist: source });
            }

            source[point].color = CLEAR_COLOR;
            callback({ times, datalist: source });
        }

        await delay(SORT_DELAY_DURATION);
        await complete(source, times, callback);
    }

    private async sortByDescent(source: SortDataModel[], times: number, temp: SortDataModel, callback: (parram: SortStateModel) => void): Promise<void> {
        let point: number;

        for (let i = 1, length = source.length; i < length; i++) {
            point = this._service.indexOfFirstLessThan(source, source[i], 0, i - 1);
            
            if (point === length) break;

            for (let j = point; j < i; j++) {
                times += 1;

                source[point].color = ACCENT_COLOR;
                source[i].color = SECONDARY_COLOR;
                source[j].color = PRIMARY_COLOR;
                callback({ times, datalist: source });

                await swap(source, j, i, temp);
                await delay(SORT_DELAY_DURATION);

                source[point].color = ACCENT_COLOR;
                source[i].color = CLEAR_COLOR;
                source[j].color = CLEAR_COLOR;
                callback({ times, datalist: source });
            }

            source[point].color = CLEAR_COLOR;
            callback({ times, datalist: source });
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
        for (let length = source.length, gap = Math.floor(length * 0.5); gap > 0; gap = Math.floor(gap * 0.5)) {
            for (let i = gap; i < length; i++) {
                for (let j = i - gap; j >= 0 && source[j].value > source[j + gap].value; j -= gap) {
                    times += 1;

                    source[j].color = PRIMARY_COLOR;
                    source[j + gap].color = SECONDARY_COLOR;
                    callback({ times, datalist: source});

                    await swap(source, j, j + gap, temp);
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
        for (let length = source.length, gap = Math.floor(length * 0.5); gap > 0; gap = Math.floor(gap * 0.5)) {
            for (let i = gap; i < length; i++) {
                for (let j = i - gap; j >= 0 && source[j].value < source[j + gap].value; j -= gap) {
                    times += 1;

                    source[j].color = PRIMARY_COLOR;
                    source[j + gap].color = SECONDARY_COLOR;
                    callback({ times, datalist: source});
                    
                    await swap(source, j, j + gap, temp);
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

/**
 * 图书馆排序
 * 公式1：f(x) = (gap + 1) * x + gap
 * 公式2：g(x) = (x - gap) / (gap + 1)
 */
@Injectable()
export class LibrarySortService {

    private cache: SortDataModel[] = Array.from([]);

    constructor(private _service: SortToolsService) { }

    public sort(array: SortDataModel[], order: SortOrder, gap: number = 4): Observable<SortStateModel> {
        return new Observable(subscriber => {
            const temp: SortDataModel = { value: 0, color: CLEAR_COLOR };

            if (order === 'ascent') {
                this.sortByAscent(array, gap, temp, 0, param => subscriber.next(param)).then(() => subscriber.complete());
            }

            if (order === 'descent') {
                this.sortByDescent(array, gap, temp, 0, param => subscriber.next(param)).then(() => subscriber.complete());
            }
        });
    }

    private async sortByAscent(source: SortDataModel[], gap: number, temp: SortDataModel, times: number, callback: (param: SortStateModel) => void): Promise<void> {
        let sourceIndex: number = 1, cacheIndex: number, sourceThreshold: number, cacheThreshold: number, point: number = 0, index: number = -1, lhs: number, rhs: number, flag: boolean = false;

        while (sourceIndex < source.length) {
            times = await this.save(source, sourceIndex, gap, times, callback);

            sourceThreshold = sourceIndex - 1;
            cacheThreshold = (gap + 1) * sourceThreshold + gap;

            for (let i = sourceIndex; i < source.length; i++) {
                cacheIndex = i - sourceThreshold + cacheThreshold;
                point = this.searchByAscent(source, source[i].value, sourceThreshold);

                if (point === -1) {
                    sourceIndex = i + 1;
                    break;
                }

                this.cache[cacheIndex].color = ACCENT_COLOR;
                callback({ times, datalist: this.cache });

                await delay(SORT_DELAY_DURATION);

                this.cache[cacheIndex].color = CLEAR_COLOR;
                callback({ times, datalist: this.cache });

                rhs = (gap + 1) * point + gap;
                lhs = rhs - gap;
                [flag, times] = await this.insert(flag, lhs, rhs, cacheIndex, temp, times, callback);

                if (flag) {
                    times = await this._service.stableSortByAscent(this.cache, lhs, rhs, temp, times, callback);
                } else {
                    sourceIndex = i;
                    break;
                }
            }

            times = await this.load(source, times, callback);

            await delay(SORT_DELAY_DURATION);
            callback({ times, datalist: source });

            this.cache.splice(0);

            if (index === cacheThreshold) {
                break;
            } else {
                index = cacheThreshold;
            }
        }

        await delay(SORT_DELAY_DURATION);
        await complete(source, times, callback);
    }

    private async sortByDescent(source: SortDataModel[], gap: number, temp: SortDataModel, times: number, callback: (param: SortStateModel) => void): Promise<void> {
        let sourceIndex: number = 1, cacheIndex: number, sourceThreshold: number, cacheThreshold: number, point: number = 0, index: number = -1, lhs: number, rhs: number, flag: boolean = false;

        while (sourceIndex < source.length) {
            times = await this.save(source, sourceIndex, gap, times, callback);

            sourceThreshold = sourceIndex - 1;
            cacheThreshold = (gap + 1) * sourceThreshold + gap;

            for (let i = sourceIndex; i < source.length; i++) {
                cacheIndex = i - sourceThreshold + cacheThreshold;
                point = this.searchByDescent(source, source[i].value, sourceThreshold);

                if (point === -1) {
                    sourceIndex = i + 1;
                    break;
                }

                this.cache[cacheIndex].color = PRIMARY_COLOR;
                callback({ times, datalist: this.cache });

                await delay(SORT_DELAY_DURATION);

                this.cache[cacheIndex].color = CLEAR_COLOR;
                callback({ times, datalist: this.cache });

                rhs = (gap + 1) * point + gap;
                lhs = rhs - gap;
                [flag, times] = await this.insert(flag, lhs, rhs, cacheIndex, temp, times, callback);

                if (flag) {
                    times = await this._service.stableSortByDescent(this.cache, lhs, rhs, temp, times, callback);
                } else {
                    sourceIndex = i;
                    break;
                }
            }

            times = await this.load(source, times, callback);

            await delay(SORT_DELAY_DURATION);
            callback({ times, datalist: source });

            this.cache.splice(0);

            if (index === cacheThreshold) {
                break;
            } else {
                index = cacheThreshold;
            }
        }

        await delay(SORT_DELAY_DURATION);
        await complete(source, times, callback);
    }

    private async insert(flag: boolean, lhs: number, rhs: number, cacheIndex: number, temp: SortDataModel, times: number, callback: (param: SortStateModel) => void): Promise<[boolean, number]> {
        for (let i = lhs; i < rhs; i++) {
            flag = this.cache[i].value === 0;

            this.cache[cacheIndex].color = PRIMARY_COLOR;
            callback({ times, datalist: this.cache });

            if (this.cache[i].value === 0) {
                times += 1;

                this.cache[i].color = SECONDARY_COLOR;
                callback({ times, datalist: this.cache });

                await swap(this.cache, cacheIndex, i, temp);
                break;
            }

            await delay(SORT_DELAY_DURATION);

            this.cache[cacheIndex].color = CLEAR_COLOR;
            this.cache[i].color = CLEAR_COLOR;
            callback({ times, datalist: this.cache });
        }

        return [flag, times];
    }

    private async save(source: SortDataModel[], index: number, gap: number, times: number, callback: (param: SortStateModel) => void): Promise<number> {
        for (let i = 0; i < source.length; i++) {
            times += 1;

            source[i].color = ACCENT_ONE_COLOR;
            callback({ times, datalist: source });

            await delay(SORT_DELAY_DURATION);

            source[i].color = CLEAR_COLOR;
            callback({ times, datalist: source });

            if (i < index) {
                for (let j = 0; j < gap; j++) {
                    this.cache.push({ color: CLEAR_COLOR, value: 0 });
                }
            }

            this.cache.push(source[i]);
        }

        return times;
    }

    private async load(source: SortDataModel[], times: number, callback: (param: SortStateModel) => void): Promise<number> {
        let pivot: number = 0;

        for (let i = 0, length = this.cache.length; i < length; i++) {
            if (this.cache[i].value !== 0) {
                times += 1;

                source[pivot] = this.cache[i];
                source[pivot].color = ACCENT_TWO_COLOR;
                callback({ times, datalist: source });

                await delay(SORT_DELAY_DURATION);

                source[pivot].color = CLEAR_COLOR;
                callback({ times, datalist: source });

                pivot += 1;
            }
        }

        return times;
    }

    private searchByAscent(source: SortDataModel[], target: number, threshold: number): number {
        let lhs: number = 0, rhs: number = threshold, mid: number;

        while (lhs <= rhs) {
            mid = Math.floor((rhs - lhs) * 0.5 + lhs);

            if (source[mid].value > target) {
                rhs = mid - 1;
            } else {
                lhs = mid + 1;
            }
        }

        return lhs > threshold ? -1 : lhs;
    }

    private searchByDescent(source: SortDataModel[], target: number, threshold: number): number {
        let lhs: number = 0, rhs: number = threshold, mid: number;

        while (lhs <= rhs) {
            mid = Math.floor((rhs - lhs) * 0.5 + lhs);

            if (source[mid].value < target) {
                rhs = mid - 1;
            } else {
                lhs = mid + 1;
            }
        }

        return lhs > threshold ? -1 : lhs;
    }

}


