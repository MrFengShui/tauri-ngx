import { Injectable } from "@angular/core";
import { Observable } from "rxjs";

import { SortDataModel, SortStateModel, SortOrder } from "../ngrx-store/sort.state";
import { swap } from "../sort.utils";
import { delay } from "../../../public/global.utils";
import { SortToolsService } from "../ngrx-store/sort.service";
import { ACCENT_COLOR, ACCENT_ONE_COLOR, ACCENT_TWO_COLOR, CLEAR_COLOR, FINAL_COLOR, PRIMARY_COLOR, SECONDARY_COLOR, START_COLOR } from "../../../public/global.utils";

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
                this.sortByAscent(array, 0, temp, param => subscriber.next(param))
                    .then(() => subscriber.complete())
                    .catch(error => subscriber.error(error));
            }
    
            if (order === 'descent') {
                this.sortByDescent(array, 0, temp, param => subscriber.next(param))
                    .then(() => subscriber.complete())
                    .catch(error => subscriber.error(error));
            }
        });
    }

    private async sortByAscent(source: SortDataModel[], times: number, temp: SortDataModel, callback: (param: SortStateModel) => void): Promise<void> {
        times = await this._service.stableGapSortByAscent(source, 0, source.length - 1, 1, 1, times, callback);
        await delay();
        // await complete(source, times, callback);
    }

    private async sortByDescent(source: SortDataModel[], times: number, temp: SortDataModel, callback: (parram: SortStateModel) => void): Promise<void> {
        times = await this._service.stableGapSortByDescent(source, 0, source.length - 1, 1, 1, times, callback);
        await delay();
        // await complete(source, times, callback);
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
                this.sortByAscent(array, 0, temp, param => subscriber.next(param))
                    .then(() => subscriber.complete())
                    .catch(error => subscriber.error(error));
            }
    
            if (order === 'descent') {
                this.sortByDescent(array, 0, temp, param => subscriber.next(param))
                    .then(() => subscriber.complete())
                    .catch(error => subscriber.error(error));
            }
        });
    }

    private async sortByAscent(source: SortDataModel[], times: number, temp: SortDataModel, callback: (param: SortStateModel) => void): Promise<void> {
        let threshold: number, k: number, completed: boolean;

        for (let i = 1, length = source.length; i <= length - 1; i++) {
            threshold = this._service.indexOfFGTByAscent(source, source[i], 0, i - 1);
            
            if (threshold === -1) continue;

            for (let j = i; j >= threshold; j--) {
                k = Math.max(j - 1, threshold);

                source[i].color = START_COLOR;
                source[threshold].color = FINAL_COLOR;
                callback({ times, datalist: source });

                [completed, times] = await this._service.swapAndRender(source, false, true, k, j, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, times, callback);

                source[i].color = START_COLOR;
                source[threshold].color = FINAL_COLOR;
                callback({ times, datalist: source });
            }

            source[i].color = CLEAR_COLOR;
            source[threshold].color = CLEAR_COLOR;
            callback({ times, datalist: source });
        }

        await delay();
        // await complete(source, times, callback);
    }

    private async sortByDescent(source: SortDataModel[], times: number, temp: SortDataModel, callback: (parram: SortStateModel) => void): Promise<void> {
        let threshold: number, k: number, completed: boolean;

        for (let length = source.length, i = length - 2; i >= 0; i--) {
            threshold = this._service.indexOfFGTByDescent(source, source[i], i + 1, length - 1);
            
            if (threshold === -1) continue;
            
            for (let j = i; j <= threshold; j++) {
                k = Math.min(j + 1, threshold);

                source[i].color = START_COLOR;
                source[threshold].color = FINAL_COLOR;
                callback({ times, datalist: source });

                [completed, times] = await this._service.swapAndRender(source, false, true, k, j, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, times, callback);

                source[i].color = START_COLOR;
                source[threshold].color = FINAL_COLOR;
                callback({ times, datalist: source });
            }

            source[i].color = CLEAR_COLOR;
            source[threshold].color = CLEAR_COLOR;
            callback({ times, datalist: source });
        }

        await delay();
        // await complete(source, times, callback);
    }

}

/**
 * 希尔排序
 */
@Injectable()
export class ShellSortService {

    constructor(private _service: SortToolsService) {}

    public sort(array: SortDataModel[], order: SortOrder): Observable<SortStateModel> {
        return new Observable(subscriber => {
            const temp: SortDataModel = { value: 0, color: CLEAR_COLOR };

            if (order === 'ascent') {
                this.sortByAscent(array, 0, temp, param => subscriber.next(param))
                    .then(() => subscriber.complete())
                    .catch(error => subscriber.error(error));
            }
    
            if (order === 'descent') {
                this.sortByDescent(array, 0, temp, param => subscriber.next(param))
                    .then(() => subscriber.complete())
                    .catch(error => subscriber.error(error));
            }
        });
    }

    private async sortByAscent(source: SortDataModel[], times: number, temp: SortDataModel, callback: (param: SortStateModel) => void): Promise<void> {
        let k: number;

        for (let length = source.length, gap = length >> 1; gap > 0; gap >>= 1) {
            times = await this._service.stableGapSortByAscent(source, 0, length - 1, gap, 1, times, callback);
        }
        
        await delay();
        // await complete(source, times, callback);
    }

    private async sortByDescent(source: SortDataModel[], times: number, temp: SortDataModel, callback: (parram: SortStateModel) => void): Promise<void> {
        for (let length = source.length, gap = Math.floor(length * 0.5); gap > 0; gap = Math.floor(gap * 0.5)) {
            times = await this._service.stableGapSortByDescent(source, 0, length - 1, gap, 1, times, callback);
        }

        await delay();
        // await complete(source, times, callback);
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

                await delay();

                this.cache[cacheIndex].color = CLEAR_COLOR;
                callback({ times, datalist: this.cache });

                rhs = (gap + 1) * point + gap;
                lhs = rhs - gap;
                [flag, times] = await this.insert(flag, lhs, rhs, cacheIndex, temp, times, callback);

                if (flag) {
                    times = await this._service.stableGapSortByAscent(this.cache, lhs, rhs, 1, 1, times, callback);
                } else {
                    sourceIndex = i;
                    break;
                }
            }

            times = await this.load(source, times, callback);

            await delay();
            callback({ times, datalist: source });

            this.cache.splice(0);

            if (index === cacheThreshold) {
                break;
            } else {
                index = cacheThreshold;
            }
        }

        await delay();
        // await complete(source, times, callback);
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

                await delay();

                this.cache[cacheIndex].color = CLEAR_COLOR;
                callback({ times, datalist: this.cache });

                rhs = (gap + 1) * point + gap;
                lhs = rhs - gap;
                [flag, times] = await this.insert(flag, lhs, rhs, cacheIndex, temp, times, callback);

                if (flag) {
                    times = await this._service.stableGapSortByDescent(this.cache, lhs, rhs, 1, 1, times, callback);
                } else {
                    sourceIndex = i;
                    break;
                }
            }

            times = await this.load(source, times, callback);

            await delay();
            callback({ times, datalist: source });

            this.cache.splice(0);

            if (index === cacheThreshold) {
                break;
            } else {
                index = cacheThreshold;
            }
        }

        await delay();
        // await complete(source, times, callback);
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

                await swap(this.cache, cacheIndex, i);
                break;
            }

            await delay();

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

            await delay();

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

                await delay();

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

/**
 * 侏儒排序
 */


@Injectable()
export class GnomeSortService {

    constructor(private _service: SortToolsService) {}

    public sort(array: SortDataModel[], order: SortOrder): Observable<SortStateModel> {
        return new Observable(subscriber => {
            const temp: SortDataModel = { value: 0, color: CLEAR_COLOR };

            if (order === 'ascent') {
                this.sortByAscent(array, temp, 0, param => subscriber.next(param))
                    .then(() => subscriber.complete())
                    .catch(error => subscriber.error(error));
            }

            if (order === 'descent') {
                this.sortByDescent(array, temp, 0, param => subscriber.next(param))
                    .then(() => subscriber.complete())
                    .catch(error => subscriber.error(error));
            }
        });
    }

    private async sortByAscent(source: SortDataModel[], temp: SortDataModel, times: number, callback: (param: SortStateModel) => void): Promise<void> {
        let i: number, j: number, completed: boolean, flag: boolean;
 
        for (let k = 1, length = source.length; k <= length - 1; k++) {
            i = k;

            while (true) {
                j = Math.max(i - 1, 0);
                flag = source[j].value > source[i].value;
                
                source[k].color = ACCENT_COLOR;
                callback({ times, datalist: source });

                [completed, times] = await this._service.swapAndRender(source, false, flag, i, j, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, times, callback);

                source[k].color = ACCENT_COLOR;
                callback({ times, datalist: source });
    
                i = flag ? i - 1 : i + 1;
                
                if (i >= k) break;
            }
            
            source[k].color = CLEAR_COLOR;
            callback({ times, datalist: source });
        }

        await delay();
        // await complete(source, times, callback);
    }

    private async sortByDescent(source: SortDataModel[], temp: SortDataModel, times: number, callback: (parram: SortStateModel) => void): Promise<void> {
        let i: number, j: number, completed: boolean, flag: boolean;
 
        for (let length = source.length, k = length - 2; k >= 0; k--) {
            i = k;

            while (true) {
                j = Math.min(i + 1, length - 1);
                flag = source[j].value > source[i].value;
                
                source[k].color = ACCENT_COLOR;
                callback({ times, datalist: source });

                [completed, times] = await this._service.swapAndRender(source, false, flag, i, j, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, times, callback);

                source[k].color = ACCENT_COLOR;
                callback({ times, datalist: source });
    
                i = flag ? i + 1 : i - 1;
                
                if (i <= k) break;
            }
            
            source[k].color = CLEAR_COLOR;
            callback({ times, datalist: source });
        }

        await delay();
        // await complete(source, times, callback);
    }

}


