import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { floor, random } from "lodash";

import { SortDataModel, SortStateModel, SortOrder } from "../ngrx-store/sort.state";
import { SORT_DELAY_DURATION, complete, delay } from "../sort.utils";
import { SortToolsService } from "../ngrx-store/sort.service";
import { PRIMARY_COLOR, SECONDARY_COLOR, CLEAR_COLOR, ACCENT_COLOR, PRIMARY_ONE_COLOR, SECONDARY_ONE_COLOR, ACCENT_ONE_COLOR, PRIMARY_TWO_COLOR, SECONDARY_TWO_COLOR, ACCENT_TWO_COLOR } from "../../../public/values.utils";

/**
 * 猴子排序
 */
@Injectable()
export class BogoSortService {

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
        let i: number, j: number, completed: boolean, flag: boolean;
        
        while (true) {
            completed = true;

            for (let k = length - 1; k >= 0 && completed; k--) {
                i = k;
                j = Math.max(k - 1, 0);
                completed = source[j].value <= source[i].value;

                [completed, times] = await this._service.swapAndRender(source, completed, false, i, j, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, times, callback);
            }
            
            if (completed) break;

            i = random(0, length - 1, false);
            j = random(0, length - 1, false);
            flag = (i < j && source[i].value > source[j].value) || (i > j && source[i].value < source[j].value);

            if (!flag) continue;

            [completed, times] = await this._service.swapAndRender(source, completed, flag, i, j, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, times, callback);
            await delay(SORT_DELAY_DURATION);
        }

        await delay(SORT_DELAY_DURATION);
        await complete(source, times, callback);
    }

    private async sortByDescent(source: SortDataModel[], times: number, callback: (parram: SortStateModel) => void): Promise<void> {
        const length: number = source.length;
        let i: number, j: number, completed: boolean, flag: boolean;
        
        while (true) {
            completed = true;

            for (let k = 0; k <= length - 1 && completed; k++) {
                i = k;
                j = Math.min(k + 1, length - 1);
                completed = source[j].value <= source[i].value;
                flag = random(0, 1, true) < 0.005 && !completed;

                [completed, times] = await this._service.swapAndRender(source, completed, flag, i, j, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, times, callback);

                if (flag) break;
            }

            if (completed) break;

            i = random(0, length - 1, false);
            j = random(0, length - 1, false);
            flag = (i < j && source[i].value < source[j].value) || (i > j && source[i].value > source[j].value);
            
            if (!flag) continue;

            [completed, times] = await this._service.swapAndRender(source, completed, flag, i, j, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, times, callback);
            await delay(SORT_DELAY_DURATION);
        }

        await delay(SORT_DELAY_DURATION);
        await complete(source, times, callback);
    }

}

/**
 * 猴子冒泡排序（单向）
 */
@Injectable()
export class BogoBubbleSortService {

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
        let completed: boolean, flag: boolean, threshold: number = length - 1, k: number;

        while (true) {
            completed = true;

            for (let i = length - 1; i >= 0; i--) {
                k = Math.max(i - 1, 0);

                [completed, times] = await this._service.swapAndRender(source, completed, false, i, k, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, times, callback);

                completed = source[k].value <= source[i].value;

                if (!completed) {
                    threshold = i;
                    break;
                }
            }

            if (completed) break;

            for (let i = 0; i <= threshold; i++) {
                k = random(Math.min(i + 1, threshold), threshold, false);
                flag = source[k].value < source[i].value;

                [completed, times] = await this._service.swapAndRender(source, completed, flag, i, k, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, times, callback);
            }
        }

        await delay(SORT_DELAY_DURATION);
        await complete(source, times, callback);
    }

    private async sortByDescent(source: SortDataModel[], times: number, callback: (param: SortStateModel) => void): Promise<void> {
        const length: number = source.length;
        let completed: boolean, flag: boolean, threshold: number = 0, k: number;

        while (true) {
            completed = true;

            for (let i = 0; i <= length - 1; i++) {
                k = Math.min(i + 1, length - 1);

                [completed, times] = await this._service.swapAndRender(source, completed, false, i, k, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, times, callback);

                completed = source[k].value <= source[i].value;

                if (!completed) {
                    threshold = i;
                    break;
                }
            }

            if (completed) break;

            for (let i = length - 1; i >= threshold; i--) {
                k = random(Math.max(i - 1, threshold), threshold, false);
                flag = source[k].value < source[i].value;

                [completed, times] = await this._service.swapAndRender(source, completed, flag, i, k, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, times, callback);
            }
        }

        await delay(SORT_DELAY_DURATION);
        await complete(source, times, callback);
    }

}

/**
 * 猴子冒泡排序（双向）
 */
@Injectable()
export class BogoCocktailSortService {

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
        const length: number = source.length;
        let k: number, lhs: number = 0, rhs: number = length - 1, completed: boolean, flag: boolean;
        
        while (true) {
            completed = true;

            for (let i = 0; i <= length - 1; i++) {
                k = Math.min(i + 1, length - 1);

                [completed, times] = await this._service.swapAndRender(source, completed, false, i, k, PRIMARY_ONE_COLOR, SECONDARY_ONE_COLOR, ACCENT_ONE_COLOR, times, callback);

                completed = source[k].value >= source[i].value;

                if (!completed) {
                    lhs = i;
                    break;
                }
            }
            
            if (completed) break;

            for (let i = lhs; i <= rhs; i++) {
                k = random(Math.min(i + 1, rhs), rhs, false);
                flag = source[k].value < source[i].value;

                [completed, times] = await this._service.swapAndRender(source, completed, flag, i, k, PRIMARY_ONE_COLOR, SECONDARY_ONE_COLOR, ACCENT_ONE_COLOR, times, callback);
            }

            completed = true;

            for (let i = length - 1; i >= 0; i--) {
                k = Math.max(i - 1, 0);
                
                [completed, times] = await this._service.swapAndRender(source, completed, false, i, k, PRIMARY_TWO_COLOR, SECONDARY_TWO_COLOR, ACCENT_TWO_COLOR, times, callback);

                completed = source[k].value <= source[i].value;

                if (!completed) {
                    rhs = i;
                    break;
                }
            }

            if (completed) break;

            for (let i = rhs; i >= lhs; i--) {
                k = random(lhs, Math.max(i - 1, lhs), false);
                flag = source[k].value > source[i].value;

                [completed, times] = await this._service.swapAndRender(source, completed, flag, i, k, PRIMARY_TWO_COLOR, SECONDARY_TWO_COLOR, ACCENT_TWO_COLOR, times, callback);
            }
        }

        await delay(SORT_DELAY_DURATION);
        await complete(source, times, callback);
    }

    private async sortByDescent(source: SortDataModel[], times: number, callback: (parram: SortStateModel) => void): Promise<void> {
        const length: number = source.length;
        let k: number, lhs: number = 0, rhs: number = length - 1, completed: boolean, flag: boolean;
        
        while (true) {
            completed = true;

            for (let i = length - 1; i >= 0; i--) {
                k = Math.max(i - 1, 0);
                
                [completed, times] = await this._service.swapAndRender(source, completed, false, i, k, PRIMARY_ONE_COLOR, SECONDARY_ONE_COLOR, ACCENT_ONE_COLOR, times, callback);

                completed = source[k].value >= source[i].value;

                if (!completed) {
                    rhs = i;
                    break;
                }
            }

            if (completed) break;

            for (let i = rhs; i >= lhs; i--) {
                k = random(lhs, Math.max(i - 1, lhs), false);
                flag = source[k].value < source[i].value;

                [completed, times] = await this._service.swapAndRender(source, completed, flag, i, k, PRIMARY_ONE_COLOR, SECONDARY_ONE_COLOR, ACCENT_ONE_COLOR, times, callback);
            }

            completed = true;

            for (let i = 0; i <= length - 1; i++) {
                k = Math.min(i + 1, length - 1);

                [completed, times] = await this._service.swapAndRender(source, completed, false, i, k, PRIMARY_TWO_COLOR, SECONDARY_TWO_COLOR, ACCENT_TWO_COLOR, times, callback);

                completed = source[k].value <= source[i].value;

                if (!completed) {
                    lhs = i;
                    break;
                }
            }
            
            if (completed) break;

            for (let i = lhs; i <= rhs; i++) {
                k = random(Math.min(i + 1, rhs), rhs, false);
                flag = source[k].value > source[i].value;

                [completed, times] = await this._service.swapAndRender(source, completed, flag, i, k, PRIMARY_TWO_COLOR, SECONDARY_TWO_COLOR, ACCENT_TWO_COLOR, times, callback);
            }
        }

        await delay(SORT_DELAY_DURATION);
        await complete(source, times, callback);
    }

}

/**
 * 猴子插入排序
 */
@Injectable()
export class BogoInsertionSortService {

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
        let i: number, k: number, threshold: number = 0, completed: boolean = false, flag: boolean;
        
        while (true) {
            completed = true;

            for (let j = 0; j <= length - 1 && completed; j++) {
                k = Math.min(j + 1, length - 1);
                completed = source[k].value >= source[j].value;

                if (!completed) {
                    threshold = j;
                }

                [completed, times] = await this._service.swapAndRender(source, completed, false, k, j, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, times, callback);
            }
            
            if (completed) break;

            i = random(Math.max(threshold, 1), length - 1, false);
            flag = true;
            
            for (let j = i; j >= 0 && flag; j--) {
                k = Math.max(j - 1, 0);
                flag = source[k].value > source[j].value;

                [completed, times] = await this._service.swapAndRender(source, completed, flag, k, j, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, times, callback);
            }
        }

        await delay(SORT_DELAY_DURATION);
        await complete(source, times, callback);
    }

    private async sortByDescent(source: SortDataModel[], times: number, callback: (parram: SortStateModel) => void): Promise<void> {
        const length: number = source.length;
        let i: number, k: number, threshold: number = length - 2, completed: boolean = false, flag: boolean;
        
        while (true) {
            completed = true;

            for (let j = length - 1; j >= 0 && completed; j--) {
                k = Math.max(j - 1, 0);
                completed = source[k].value >= source[j].value;

                if (!completed) {
                    threshold = j;
                }

                [completed, times] = await this._service.swapAndRender(source, completed, false, k, j, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, times, callback);
            }
            
            if (completed) break;

            i = random(0, Math.min(threshold, length - 2), false);
            flag = true;
            
            for (let j = i; j <= length - 1 && flag; j++) {
                k = Math.min(j + 1, length - 1);
                flag = source[k].value > source[j].value;

                [completed, times] = await this._service.swapAndRender(source, completed, flag, k, j, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, times, callback);
            }
        }

        await delay(SORT_DELAY_DURATION);
        await complete(source, times, callback);
    }

}

/**
 * 猴子选择排序
 */
@Injectable()
export class BogoSelectionSortService {

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
        let i: number, j: number, completed: boolean = false, flag: boolean;
        
        while (true) {
            completed = true;

            for (let k = length - 1; k >= 0 && completed; k--) {
                i = k;
                j = Math.max(k - 1, 0);
                completed = source[j].value <= source[i].value;

                [completed, times] = await this._service.swapAndRender(source, completed, false, i, j, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, times, callback);
            }
            
            if (completed) break;

            i = random(0, length - 1, false);
            j = i;
            
            for (let k = Math.min(i + 1, length - 1); k <= length - 1; k++) {
                flag = source[k].value < source[j].value;
                
                source[i].color = PRIMARY_COLOR;
                source[j].color = i === j ? PRIMARY_COLOR : SECONDARY_COLOR;
                source[k].color = ACCENT_COLOR;
                callback({ times, datalist: source });

                if (flag) {
                    source[j].color = CLEAR_COLOR;
                    j = k;
                }

                await delay(SORT_DELAY_DURATION);

                source[i].color = PRIMARY_COLOR;
                source[j].color = i === j ? PRIMARY_COLOR : SECONDARY_COLOR;
                source[k].color = CLEAR_COLOR;
                callback({ times, datalist: source });
            }

            flag = i < j && source[i].value > source[j].value;

            [completed, times] = await this._service.swapAndRender(source, completed, flag, i, j, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, times, callback);
        }

        await delay(SORT_DELAY_DURATION);
        await complete(source, times, callback);
    }

    private async sortByDescent(source: SortDataModel[], times: number, callback: (parram: SortStateModel) => void): Promise<void> {
        const length: number = source.length;
        let i: number, j: number, completed: boolean = false, flag: boolean;
        
        while (true) {
            completed = true;

            for (let k = 0; k <= length - 1 && completed; k++) {
                i = k;
                j = Math.min(k + 1, length - 1);
                completed = source[j].value <= source[i].value;
                flag = random(0, 1, true) < 0.005 && !completed;

                [completed, times] = await this._service.swapAndRender(source, completed, flag, i, j, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, times, callback);

                if (flag) break;
            }

            if (completed) break;

            i = random(0, length - 1, false);
            j = i;
            
            for (let k = Math.max(i - 1, 0); k >= 0; k--) {
                flag = source[k].value < source[j].value;
                
                source[i].color = PRIMARY_COLOR;
                source[j].color = i === j ? PRIMARY_COLOR : SECONDARY_COLOR;
                source[k].color = ACCENT_COLOR;
                callback({ times, datalist: source });

                if (flag) {
                    source[j].color = CLEAR_COLOR;
                    j = k;
                }

                await delay(SORT_DELAY_DURATION);

                source[i].color = PRIMARY_COLOR;
                source[j].color = i === j ? PRIMARY_COLOR : SECONDARY_COLOR;
                source[k].color = CLEAR_COLOR;
                callback({ times, datalist: source });
            }

            flag = i > j && source[i].value > source[j].value;

            [completed, times] = await this._service.swapAndRender(source, completed, flag, i, j, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, times, callback);
        }

        await delay(SORT_DELAY_DURATION);
        await complete(source, times, callback);
    }

}
