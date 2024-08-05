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
                this.sortByAscent(array, 0, param => subscriber.next(param))
                    .then(() => subscriber.complete())
                    .catch(error => subscriber.error(error));
            }
    
            if (order === 'descent') {
                this.sortByDescent(array, 0, param => subscriber.next(param))
                    .then(() => subscriber.complete())
                    .catch(error => subscriber.error(error));
            }
        });
    }

    private async sortByAscent(source: SortDataModel[], times: number, callback: (param: SortStateModel) => void): Promise<void> {
        let completed: boolean = false, flag: boolean, k: number;

        for (let i = 0, length = source.length; i <= length - 1 && !completed; i++) {
            completed = true;

            for (let j = 0; j <= length - 1; j++) {
                k = Math.min(j + 1, length - 1);
                flag = source[k].value < source[j].value;

                [completed, times] = await this._service.swapAndRender(source, completed, flag, j, k, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, times, callback);
            }
        }

        await delay(SORT_DELAY_DURATION);
        await complete(source, times, callback);
    }

    private async sortByDescent(source: SortDataModel[], times: number, callback: (param: SortStateModel) => void): Promise<void> {
        let completed: boolean = false, flag: boolean, k: number;

        for (let length = source.length, i = length - 1; i >= 0 && !completed; i--) {
            completed = true;

            for (let j = length - 1; j >= 0; j--) {
                k = Math.max(j - 1, 0);
                flag = source[k].value < source[j].value;

                [completed, times] = await this._service.swapAndRender(source, completed, flag, j, k, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, times, callback);
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
            if (order === 'ascent') {
                this.sortByAscent(array, 0, param => subscriber.next(param))
                    .then(() => subscriber.complete())
                    .catch(error => subscriber.error(error));
            }
    
            if (order === 'descent') {
                this.sortByDescent(array, 0, param => subscriber.next(param))
                    .then(() => subscriber.complete())
                    .catch(error => subscriber.error(error));
            }
        });
    }

    private async sortByAscent(source: SortDataModel[], times: number, callback: (param: SortStateModel) => void): Promise<void> {
        let completed: boolean = false, flag: boolean, k: number;

        for (let i = 0, length = source.length; i <= length - 1 && !completed; i++) {
            completed = true;

            for (let j = 0; j <= length - i - 1; j++) {
                k = Math.min(j + 1, length - 1);
                flag = source[k].value < source[j].value;

                [completed, times] = await this._service.swapAndRender(source, completed, flag, j, k, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, times, callback);
            }
        }

        await delay(SORT_DELAY_DURATION);
        await complete(source, times, callback);
    }

    private async sortByDescent(source: SortDataModel[], times: number, callback: (param: SortStateModel) => void): Promise<void> {
        let completed: boolean = false, flag: boolean, k: number;

        for (let length = source.length, i = length - 1; i >= 0 && !completed; i--) {
            completed = true;

            for (let j = length - 1; j >= length - i - 1; j--) {
                k = Math.max(j - 1, 0);
                flag = source[k].value < source[j].value;

                [completed, times] = await this._service.swapAndRender(source, completed, flag, j, k, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, times, callback);
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
                this.sortByAscent(array, 0, param => subscriber.next(param))
                    .then(() => subscriber.complete())
                    .catch(error => subscriber.error(error));
            }
    
            if (order === 'descent') {
                this.sortByDescent(array, 0, param => subscriber.next(param))
                    .then(() => subscriber.complete())
                    .catch(error => subscriber.error(error));
            }
        });
    }

    private async sortByAscent(source: SortDataModel[], times: number, callback: (param: SortStateModel) => void): Promise<void> {
        let i: number, j: number, completed: boolean = false, flag: boolean, pivot: number = 0, k: number = 0;

        for (i = 0, length = source.length; i < length && !completed; i++) {
            completed = true;
            
            for (j = pivot; j <= length - i - 2; j++) {
                k = Math.min(j + 1, length - i - 2);
                flag = source[k].value < source[j].value;

                [completed, times] = await this._service.swapAndRender(source, completed, flag, j, k, PRIMARY_ONE_COLOR, SECONDARY_ONE_COLOR, ACCENT_ONE_COLOR, times, callback);
            }

            pivot = j;

            for (j = pivot; j >= i; j--) {
                k = Math.max(j - 1, i);
                flag = source[k].value > source[j].value;

                [completed, times] = await this._service.swapAndRender(source, completed, flag, j, k, PRIMARY_TWO_COLOR, SECONDARY_TWO_COLOR, ACCENT_TWO_COLOR, times, callback);
            }

            pivot = k;
        }

        await delay(SORT_DELAY_DURATION);
        await complete(source, times, callback);
    }

    private async sortByDescent(source: SortDataModel[], times: number, callback: (param: SortStateModel) => void): Promise<void> {
        let i: number, j: number, completed: boolean = false, flag: boolean, pivot: number = source.length - 1, k: number = 0;

        for (i = 0, length = source.length; i < length && !completed; i++) {
            completed = true;

            for (j = pivot; j >= i; j--) {
                k = Math.max(j - 1, i);
                flag = source[k].value < source[j].value;

                [completed, times] = await this._service.swapAndRender(source, completed, flag, j, k, PRIMARY_ONE_COLOR, SECONDARY_ONE_COLOR, ACCENT_ONE_COLOR, times, callback);
            }

            pivot = k;

            for (j = pivot; j <= length - i - 2; j++) {
                k = Math.min(j + 1, length - i - 2);
                flag = source[k].value > source[j].value;
                
                [completed, times] = await this._service.swapAndRender(source, completed, flag, j, k, PRIMARY_TWO_COLOR, SECONDARY_TWO_COLOR, ACCENT_TWO_COLOR, times, callback);
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
                this.sortByAscent(array, 0, param => subscriber.next(param))
                    .then(() => subscriber.complete())
                    .catch(error => subscriber.error(error));
            }
    
            if (order === 'descent') {
                this.sortByDescent(array, 0, param => subscriber.next(param))
                    .then(() => subscriber.complete())
                    .catch(error => subscriber.error(error));
            }
        });
    }

    private async sortByAscent(source: SortDataModel[], times: number, callback: (param: SortStateModel) => void): Promise<void> {
        const length: number = source.length;
        let m: number, n: number, fstFlag: boolean, sndFlag: boolean, completed: boolean = false;

        for (let lhs = 0, rhs = length - 1; lhs <= rhs && !completed; lhs++, rhs--) {
            completed = true;

            for (let i = lhs, j = rhs; i <= rhs && j >= lhs; i++, j--) {
                m = Math.min(i + 1, rhs);
                n = Math.max(j - 1, lhs);

                fstFlag = source[m].value < source[i].value;

                [completed, times] = await this._service.swapAndRender(source, completed, fstFlag, i, m, PRIMARY_ONE_COLOR, SECONDARY_ONE_COLOR, ACCENT_ONE_COLOR, times, callback);

                sndFlag = source[n].value > source[j].value;
                
                [completed, times] = await this._service.swapAndRender(source, completed, sndFlag, j, n, PRIMARY_TWO_COLOR, SECONDARY_TWO_COLOR, ACCENT_TWO_COLOR, times, callback);
            }
        }
        
        await delay(SORT_DELAY_DURATION);
        await complete(source, times, callback);
    }

    private async sortByDescent(source: SortDataModel[], times: number, callback: (param: SortStateModel) => void): Promise<void> {
        const length: number = source.length;
        let m: number, n: number, fstFlag: boolean, sndFlag: boolean, completed: boolean = false;

        for (let lhs = 0, rhs = length - 1; lhs <= rhs && !completed; lhs++, rhs--) {
            completed = true;

            for (let i = lhs, j = rhs; i <= rhs && j >= lhs; i++, j--) {
                m = Math.min(i + 1, rhs);
                n = Math.max(j - 1, lhs);

                fstFlag = source[m].value > source[i].value;

                [completed, times] = await this._service.swapAndRender(source, completed, fstFlag, i, m, PRIMARY_ONE_COLOR, SECONDARY_ONE_COLOR, ACCENT_ONE_COLOR, times, callback);

                sndFlag = source[n].value < source[j].value;
                
                [completed, times] = await this._service.swapAndRender(source, completed, sndFlag, j, n, PRIMARY_TWO_COLOR, SECONDARY_TWO_COLOR, ACCENT_TWO_COLOR, times, callback);
            }
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

    constructor(private _service: SortToolsService) {}

    public sort(array: SortDataModel[], order: SortOrder): Observable<SortStateModel> {
        return new Observable(subscriber => {
            const temp: SortDataModel = { value: 0, color: 'whitesmoke' };

            if (order === 'ascent') {
                this.sortByAscent(array, 0, param => subscriber.next(param))
                    .then(() => subscriber.complete())
                    .catch(error => subscriber.error(error));
            }

            if (order === 'descent') {
                this.sortByDescent(array, 0, param => subscriber.next(param))
                    .then(() => subscriber.complete())
                    .catch(error => subscriber.error(error));
            }
        });
    }

    private async sortByAscent(source: SortDataModel[], times: number, callback: (param: SortStateModel) => void): Promise<void> {
        let completed: boolean = false, flag: boolean, k: number;

        for (let gap = source.length, length = source.length; gap > 1 || !completed; gap = Math.floor(gap * 0.8)) {
            completed = true;

            for (let j = 0; j <= length - 1 - gap; j++) {
                k = Math.min(j + gap, length - 1);
                flag = source[k].value < source[j].value;

                [completed, times] = await this._service.swapAndRender(source, completed, flag, j, k, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, times, callback);
            }
        }

        await delay(SORT_DELAY_DURATION);
        await complete(source, times, callback);
    }

    private async sortByDescent(source: SortDataModel[], times: number, callback: (param: SortStateModel) => void): Promise<void> {
        let completed: boolean = false, flag: boolean, k: number;

        for (let gap = source.length, length = source.length; gap > 1 || !completed; gap = Math.floor(gap * 0.8)) {
            completed = true;

            for (let j = length - 1; j >= gap; j--) {
                k = Math.max(j - gap, 0);
                flag = source[k].value < source[j].value;

                [completed, times] = await this._service.swapAndRender(source, completed, flag, j, k, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, times, callback);
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
                this.sortByAscent(array, array.length, 0, param => subscriber.next(param))
                    .then(() => subscriber.complete())
                    .catch(error => subscriber.error(error));
            }

            if (order === 'descent') {
                this.sortByDescent(array, array.length - 1, 0, param => subscriber.next(param))
                    .then(() => subscriber.complete())
                    .catch(error => subscriber.error(error));
            }
        });
    }

    private async sortByAscent(source: SortDataModel[], length: number, times: number, callback: (param: SortStateModel) => void): Promise<void> {
        let completed: boolean = false, flag: boolean, k: number;

        for (let i = 0; !completed; i = (i + 1) % 2) {
            completed = true;

            for (let j = i % 2; j <= length - 1; j += 2) {
                k = Math.min(j + 1, length - 1);
                flag = source[k].value < source[j].value;
                
                [completed, times] = await this._service.swapAndRender(source, completed, flag, j, k, PRIMARY_ONE_COLOR, SECONDARY_ONE_COLOR, ACCENT_ONE_COLOR, times, callback);
            }
        }
        
        await delay(SORT_DELAY_DURATION);
        await complete(source, times, callback);
    }

    private async sortByDescent(source: SortDataModel[], length: number, times: number, callback: (param: SortStateModel) => void): Promise<void> {
        let completed: boolean = false, flag: boolean, k: number;

        for (let i = 0; !completed; i = (i + 1) % 2) {
            completed = true;
            
            for (let j = length - i % 2; j >= 0; j -= 2) {
                k = Math.max(j - 1, 0);
                flag = source[k].value < source[j].value;
                
                [completed, times] = await this._service.swapAndRender(source, completed, flag, j, k, PRIMARY_ONE_COLOR, SECONDARY_ONE_COLOR, ACCENT_ONE_COLOR, times, callback);
            }
        }

        await delay(SORT_DELAY_DURATION);
        await complete(source, times, callback);
    }

}

