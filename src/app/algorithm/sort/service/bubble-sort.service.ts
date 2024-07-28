import { Injectable } from "@angular/core";
import { Observable } from "rxjs";

import { SortDataModel, SortStateModel, SortOrder } from "../ngrx-store/sort.state";
import { SORT_DELAY_DURATION, complete, delay, swap } from "../sort.utils";
import { PRIMARY_COLOR, SECONDARY_COLOR, CLEAR_COLOR, PRIMARY_ONE_COLOR, SECONDARY_ONE_COLOR, PRIMARY_TWO_COLOR, SECONDARY_TWO_COLOR, ACCENT_COLOR, ACCENT_ONE_COLOR, ACCENT_TWO_COLOR } from "../../../public/values.utils";
import { SortToolsService } from "../ngrx-store/sort.service";

/**
 * 交換排序
 */
@Injectable()
export class ExchangeSortService {

    constructor(private _service: SortToolsService) {}

    public sort(array: SortDataModel[], order: SortOrder): Observable<SortStateModel> {
        return new Observable(subscriber => {
            const temp: SortDataModel = { value: 0, color: '' };

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
        let completed: boolean = false, flag: boolean, k: number;

        for (let i = 0, length = source.length; i <= length - 1 && !completed; i++) {
            completed = true;

            for (let j = 0; j <= length - 1; j++) {
                k = Math.min(j + 1, length - 1);
                flag = source[k].value < source[j].value;

                [completed, times] = await this._service.swapAndRenderer(source, completed, flag, j, k, temp, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, times, callback);
            }
        }

        await delay(SORT_DELAY_DURATION);
        await complete(source, times, callback);
    }

    private async sortByDescent(source: SortDataModel[], temp: SortDataModel, times: number, callback: (param: SortStateModel) => void): Promise<void> {
        let completed: boolean = false, flag: boolean, k: number;

        for (let length = source.length, i = length - 1; i >= 0 && !completed; i--) {
            completed = true;

            for (let j = length - 1; j >= 0; j--) {
                k = Math.max(j - 1, 0);
                flag = source[k].value < source[j].value;

                [completed, times] = await this._service.swapAndRenderer(source, completed, flag, j, k, temp, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, times, callback);
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

    constructor(private _service: SortToolsService) {}

    public sort(array: SortDataModel[], order: SortOrder): Observable<SortStateModel> {
        return new Observable(subscriber => {
            const temp: SortDataModel = { value: 0, color: '' };

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
        let completed: boolean = false, flag: boolean, k: number;

        for (let i = 0, length = source.length; i <= length - 1 && !completed; i++) {
            completed = true;

            for (let j = 0; j <= length - i - 1; j++) {
                k = Math.min(j + 1, length - 1);
                flag = source[k].value < source[j].value;

                [completed, times] = await this._service.swapAndRenderer(source, completed, flag, j, k, temp, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, times, callback);
            }
        }

        await delay(SORT_DELAY_DURATION);
        await complete(source, times, callback);
    }

    private async sortByDescent(source: SortDataModel[], temp: SortDataModel, times: number, callback: (param: SortStateModel) => void): Promise<void> {
        let completed: boolean = false, flag: boolean, k: number;

        for (let length = source.length, i = length - 1; i >= 0 && !completed; i--) {
            completed = true;

            for (let j = length - 1; j >= length - i - 1; j--) {
                k = Math.max(j - 1, 0);
                flag = source[k].value < source[j].value;

                [completed, times] = await this._service.swapAndRenderer(source, completed, flag, j, k, temp, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, times, callback);
            }
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
        let i: number, j: number, completed: boolean = false, flag: boolean, pivot: number = 0, k: number = 0;

        for (i = 0, length = source.length; i < length && !completed; i++) {
            completed = true;
            
            for (j = pivot; j <= length - i - 2; j++) {
                k = Math.min(j + 1, length - i - 2);
                flag = source[k].value < source[j].value;

                [completed, times] = await this._service.swapAndRenderer(source, completed, flag, j, k, temp, PRIMARY_ONE_COLOR, SECONDARY_ONE_COLOR, ACCENT_ONE_COLOR, times, callback);
            }

            pivot = j;

            for (j = pivot; j >= i; j--) {
                k = Math.max(j - 1, i);
                flag = source[k].value > source[j].value;

                [completed, times] = await this._service.swapAndRenderer(source, completed, flag, j, k, temp, PRIMARY_TWO_COLOR, SECONDARY_TWO_COLOR, ACCENT_TWO_COLOR, times, callback);
            }

            pivot = k;
        }

        await delay(SORT_DELAY_DURATION);
        await complete(source, times, callback);
    }

    private async sortByDescent(source: SortDataModel[], temp: SortDataModel, times: number, callback: (param: SortStateModel) => void): Promise<void> {
        let i: number, j: number, completed: boolean = false, flag: boolean, pivot: number = source.length - 1, k: number = 0;

        for (i = 0, length = source.length; i < length && !completed; i++) {
            completed = true;

            for (j = pivot; j >= i; j--) {
                k = Math.max(j - 1, i);
                flag = source[k].value < source[j].value;

                [completed, times] = await this._service.swapAndRenderer(source, completed, flag, j, k, temp, PRIMARY_ONE_COLOR, SECONDARY_ONE_COLOR, ACCENT_ONE_COLOR, times, callback);
            }

            pivot = k;

            for (j = pivot; j <= length - i - 2; j++) {
                k = Math.min(j + 1, length - i - 2);
                flag = source[k].value > source[j].value;
                
                [completed, times] = await this._service.swapAndRenderer(source, completed, flag, j, k, temp, PRIMARY_TWO_COLOR, SECONDARY_TWO_COLOR, ACCENT_TWO_COLOR, times, callback);
            }

            pivot = j;
        }

        await delay(SORT_DELAY_DURATION);
        await complete(source, times, callback);
    }

}

/**
 * 二路冒泡排序
 */
@Injectable()
export class TwoWayBubbleSortService {

    constructor(private _service: SortToolsService) {}

    public sort(array: SortDataModel[], order: SortOrder): Observable<SortStateModel> {
        return new Observable(subscriber => {
            const temp: SortDataModel = { value: 0, color: '' };

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
        let completed: boolean = false, fstFlag: boolean, sndFlag: boolean, p: number = 0, q: number = 0;
        
        for (let length = source.length, i = 0, j = length - 1; !completed; i++, j--) {
            completed = true;

            for (let m = j, n = i; m >= i && n <= j - 1; m--, n++) {
                p = Math.max(m - 1, j);
                q = Math.min(n + 1, i);

                if (Math.abs(p - q) === 1) {
                    [completed, times] = await this._service.swapAndRenderer(source, completed, source[p].value < source[q].value, p, q, temp, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, times, callback);
                } else {
                    fstFlag = source[p].value < source[m].value;
                    sndFlag = source[q].value > source[n].value;
    
                    [completed, times] = await this.swapAndRenderer(source, completed, fstFlag, sndFlag, m, n, p, q, temp, times, callback);
                }
            }
        }
        
        await delay(SORT_DELAY_DURATION);
        await complete(source, times, callback);
    }

    private async sortByDescent(source: SortDataModel[], temp: SortDataModel, times: number, callback: (param: SortStateModel) => void): Promise<void> {
        let completed: boolean = false, fstFlag: boolean, sndFlag: boolean, p: number = 0, q: number = 0;

        for (let length = source.length, i = 0, j = length - 1; !completed; i++, j--) {
            completed = true;

            for (let m = i, n = j; m <= j - 1 && n >= i; m++, n--) {
                p = Math.min(m + 1, i);
                q = Math.max(n - 1, j);

                if (Math.abs(p - q) === 1) {
                    [completed, times] = await this._service.swapAndRenderer(source, completed, source[p].value < source[q].value, p, q, temp, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, times, callback);
                } else {
                    fstFlag = source[p].value < source[m].value;
                    sndFlag = source[q].value > source[n].value;
    
                    [completed, times] = await this.swapAndRenderer(source, completed, fstFlag, sndFlag, m, n, p, q, temp, times, callback);
                }
            }
        }
        
        

        await delay(SORT_DELAY_DURATION);
        await complete(source, times, callback);
    }

    private async swapAndRenderer(source: SortDataModel[], completed: boolean, fstFlag: boolean, sndFlag: boolean, m: number, n: number, p: number, q: number,  temp: SortDataModel, times: number, callback: (param: SortStateModel) => void): Promise<[boolean, number]> {
        source[m].color = fstFlag ? PRIMARY_ONE_COLOR : ACCENT_ONE_COLOR;
        source[p].color = fstFlag ? SECONDARY_ONE_COLOR : CLEAR_COLOR;
        source[n].color = sndFlag ? PRIMARY_TWO_COLOR : ACCENT_TWO_COLOR;
        source[q].color = sndFlag ? SECONDARY_TWO_COLOR : CLEAR_COLOR;
        callback({ times, datalist: source});

        await delay(SORT_DELAY_DURATION);
        
        if (fstFlag) {
            completed = false;
            times += 1;

            await swap(source, p, m, temp);
        }

        if (sndFlag) {
            completed = false;
            times += 1;

            await swap(source, q, n, temp);
        }

        if (fstFlag || sndFlag) {
            source[m].color = fstFlag ? SECONDARY_ONE_COLOR : ACCENT_ONE_COLOR;
            source[p].color = fstFlag ? PRIMARY_ONE_COLOR : CLEAR_COLOR;
            source[n].color = sndFlag ? SECONDARY_TWO_COLOR : ACCENT_TWO_COLOR;
            source[q].color = sndFlag ? PRIMARY_TWO_COLOR : CLEAR_COLOR;
            callback({ times, datalist: source});

            await delay(SORT_DELAY_DURATION);
        }

        source[m].color = CLEAR_COLOR;
        source[p].color = CLEAR_COLOR;
        source[n].color = CLEAR_COLOR;
        source[q].color = CLEAR_COLOR;
        callback({ times, datalist: source});

        return [completed, times];
    }

}

/**
 * 梳排序
 */
@Injectable()
export class CombSortService {

    constructor(private _service: SortToolsService) {}

    public sort(array: SortDataModel[], order: SortOrder): Observable<SortStateModel> {
        return new Observable(subscriber => {
            const temp: SortDataModel = { value: 0, color: 'whitesmoke' };

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
        let completed: boolean = false, flag: boolean, k: number;

        for (let gap = source.length, length = source.length; gap > 1 || !completed; gap = Math.floor(gap * 0.8)) {
            completed = true;

            for (let j = 0; j <= length - 1 - gap; j++) {
                k = Math.min(j + gap, length - 1);
                flag = source[k].value < source[j].value;

                [completed, times] = await this._service.swapAndRenderer(source, completed, flag, j, k, temp, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, times, callback);
            }
        }

        await delay(SORT_DELAY_DURATION);
        await complete(source, times, callback);
    }

    private async sortByDescent(source: SortDataModel[], temp: SortDataModel, times: number, callback: (param: SortStateModel) => void): Promise<void> {
        let completed: boolean = false, flag: boolean, k: number;

        for (let gap = source.length, length = source.length; gap > 1 || !completed; gap = Math.floor(gap * 0.8)) {
            completed = true;

            for (let j = length - 1; j >= gap; j--) {
                k = Math.max(j - gap, 0);
                flag = source[k].value < source[j].value;

                [completed, times] = await this._service.swapAndRenderer(source, completed, flag, j, k, temp, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, times, callback);
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

    constructor(private _service: SortToolsService) {}

    public sort(array: SortDataModel[], order: SortOrder): Observable<SortStateModel> {
        return new Observable(subscriber => {
            const temp: SortDataModel = { value: 0, color: 'whitesmoke' };

            if (order === 'ascent') {
                this.sortByAscent(array, array.length, temp, 0, param => subscriber.next(param))
                    .then(() => subscriber.complete())
                    .catch(error => subscriber.error(error));
            }

            if (order === 'descent') {
                this.sortByDescent(array, array.length - 1, temp, 0, param => subscriber.next(param))
                    .then(() => subscriber.complete())
                    .catch(error => subscriber.error(error));
            }
        });
    }

    private async sortByAscent(source: SortDataModel[], length: number, temp: SortDataModel, times: number, callback: (param: SortStateModel) => void): Promise<void> {
        let completed: boolean = false, flag: boolean, k: number;

        for (let i = 0; !completed; i = (i + 1) % 2) {
            completed = true;

            for (let j = i % 2; j <= length - 1; j += 2) {
                k = Math.min(j + 1, length - 1);
                flag = source[k].value < source[j].value;
                
                [completed, times] = await this._service.swapAndRenderer(source, completed, flag, j, k, temp, PRIMARY_ONE_COLOR, SECONDARY_ONE_COLOR, ACCENT_ONE_COLOR, times, callback);
            }
        }
        
        await delay(SORT_DELAY_DURATION);
        await complete(source, times, callback);
    }

    private async sortByDescent(source: SortDataModel[], length: number, temp: SortDataModel, times: number, callback: (param: SortStateModel) => void): Promise<void> {
        let completed: boolean = false, flag: boolean, k: number;

        for (let i = 0; !completed; i = (i + 1) % 2) {
            completed = true;
            
            for (let j = length - i % 2; j >= 0; j -= 2) {
                k = Math.max(j - 1, 0);
                flag = source[k].value < source[j].value;
                
                [completed, times] = await this._service.swapAndRenderer(source, completed, flag, j, k, temp, PRIMARY_ONE_COLOR, SECONDARY_ONE_COLOR, ACCENT_ONE_COLOR, times, callback);
            }
        }

        await delay(SORT_DELAY_DURATION);
        await complete(source, times, callback);
    }

}

