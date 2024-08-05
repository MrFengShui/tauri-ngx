import { Injectable } from "@angular/core";
import { Observable } from "rxjs";

import { SortDataModel, SortStateModel, SortOrder } from "../ngrx-store/sort.state";
import { SORT_DELAY_DURATION, complete, delay, swap } from "../sort.utils";
import { CLEAR_COLOR, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, PRIMARY_ONE_COLOR, SECONDARY_ONE_COLOR, ACCENT_ONE_COLOR, PRIMARY_TWO_COLOR, SECONDARY_TWO_COLOR, ACCENT_TWO_COLOR } from "../../../public/values.utils";
import { BaseSortService } from "./base-sort.service";
import { SortToolsService } from "../ngrx-store/sort.service";

/**
 * 选择排序（单向）
 */
@Injectable()
export class SelectionSortService extends BaseSortService {

    constructor(private _service: SortToolsService) {
        super();
    }

    protected override async sortByAscent(source: SortDataModel[], lhs: number, rhs: number, option: string | number | undefined, callback: (param: SortStateModel) => void): Promise<void> {
        let k: number, times: number = 0, completed: boolean;
        
        for (let i = lhs; i <= rhs; i++) {
            k = i;
            
            for (let j = i + 1; j <= rhs; j++) {
                source[i].color = PRIMARY_COLOR;
                source[j].color = SECONDARY_COLOR;
                source[k].color = ACCENT_COLOR;
                callback({ times, datalist: source });

                await delay(SORT_DELAY_DURATION);

                if (source[j].value < source[k].value) {
                    source[k].color = CLEAR_COLOR;
                    k = j;
                }

                source[i].color = PRIMARY_COLOR;
                source[j].color = CLEAR_COLOR;
                source[k].color = ACCENT_COLOR;
                callback({ times, datalist: source });
            }

            [completed, times] = await this._service.swapAndRender(source, false, k !== i, i, k, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, times, callback);
        }

        await delay(SORT_DELAY_DURATION);
        await complete(source, times, callback);
    }

    protected override async sortByDescent(source: SortDataModel[], lhs: number, rhs: number, option: string | number | undefined, callback: (param: SortStateModel) => void): Promise<void> {
        let k: number, times: number = 0, completed: boolean;
        
        for (let i = rhs; i >= lhs; i--) {
            k = i;
            
            for (let j = i - 1; j >= lhs; j--) {
                source[i].color = PRIMARY_COLOR;
                source[j].color = SECONDARY_COLOR;
                source[k].color = ACCENT_COLOR;
                callback({ times, datalist: source });

                await delay(SORT_DELAY_DURATION);

                if (source[j].value < source[k].value) {
                    source[k].color = CLEAR_COLOR;
                    k = j;
                }

                source[i].color = PRIMARY_COLOR;
                source[j].color = CLEAR_COLOR;
                source[k].color = ACCENT_COLOR;
                callback({ times, datalist: source });
            }

            [completed, times] = await this._service.swapAndRender(source, false, k !== i, i, k, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, times, callback);
        }

        await delay(SORT_DELAY_DURATION);
        await complete(source, times, callback);
    }

}

/**
 * 选择排序（双向）
 */
@Injectable()
export class ShakerSelectionSortService extends BaseSortService {

    constructor(private _service: SortToolsService) {
        super();
    }

    protected override async sortByAscent(source: SortDataModel[], lhs: number, rhs: number, option: string | number | undefined, callback: (param: SortStateModel) => void): Promise<void> {
        let k: number, times: number = 0, completed: boolean = false;
        
        for (let i = lhs; i <= rhs && !completed; i++) {
            k = i;
            completed = true;
            
            for (let j = i + 1; j <= rhs - i; j++) {
                source[i].color = PRIMARY_ONE_COLOR;
                source[j].color = SECONDARY_ONE_COLOR;
                source[k].color = ACCENT_ONE_COLOR;
                callback({ times, datalist: source });

                await delay(SORT_DELAY_DURATION);

                if (source[j].value < source[k].value) {
                    source[k].color = CLEAR_COLOR;

                    k = j;
                    completed = false;
                }

                source[i].color = PRIMARY_ONE_COLOR;
                source[j].color = CLEAR_COLOR;
                source[k].color = ACCENT_ONE_COLOR;
                callback({ times, datalist: source });
            }

            [completed, times] = await this._service.swapAndRender(source, completed, k !== i, i, k, PRIMARY_ONE_COLOR, SECONDARY_ONE_COLOR, ACCENT_ONE_COLOR, times, callback);

            k = rhs - i;

            for (let j = rhs - i - 1; j >= lhs + i; j--) {
                source[rhs - i].color = PRIMARY_TWO_COLOR;
                source[j].color = SECONDARY_TWO_COLOR;
                source[k].color = ACCENT_TWO_COLOR;
                callback({ times, datalist: source });

                await delay(SORT_DELAY_DURATION);

                if (source[j].value > source[k].value) {
                    source[k].color = CLEAR_COLOR;

                    k = j;
                    completed = false;
                }

                source[rhs - i].color = PRIMARY_COLOR;
                source[j].color = CLEAR_COLOR;
                source[k].color = ACCENT_TWO_COLOR;
                callback({ times, datalist: source });
            }

            [completed, times] = await this._service.swapAndRender(source, completed, k !== rhs - i, rhs - i, k, PRIMARY_ONE_COLOR, SECONDARY_ONE_COLOR, ACCENT_ONE_COLOR, times, callback);
        }

        await delay(SORT_DELAY_DURATION);
        await complete(source, times, callback);
    }

    protected override async sortByDescent(source: SortDataModel[], lhs: number, rhs: number, option: string | number | undefined, callback: (param: SortStateModel) => void): Promise<void> {
        let k: number, times: number = 0, completed: boolean = false;
        
        for (let i = rhs; i >= lhs && !completed; i--) {
            k = i;
            completed = true;
            
            for (let j = i - 1; j >= rhs - i; j--) {
                source[i].color = PRIMARY_ONE_COLOR;
                source[j].color = SECONDARY_ONE_COLOR;
                source[k].color = ACCENT_ONE_COLOR;
                callback({ times, datalist: source });

                await delay(SORT_DELAY_DURATION);

                if (source[j].value < source[k].value) {
                    source[k].color = CLEAR_COLOR;

                    k = j;
                    completed = false;
                }

                source[i].color = PRIMARY_ONE_COLOR;
                source[j].color = CLEAR_COLOR;
                source[k].color = ACCENT_ONE_COLOR;
                callback({ times, datalist: source });
            }

            [completed, times] = await this._service.swapAndRender(source, completed, k !== i, i, k, PRIMARY_ONE_COLOR, SECONDARY_ONE_COLOR, ACCENT_ONE_COLOR, times, callback);

            k = rhs - i;

            for (let j = rhs - i + 1; j <= lhs + i; j++) {
                source[rhs - i].color = PRIMARY_TWO_COLOR;
                source[j].color = SECONDARY_TWO_COLOR;
                source[k].color = ACCENT_TWO_COLOR;
                callback({ times, datalist: source });

                await delay(SORT_DELAY_DURATION);

                if (source[j].value > source[k].value) {
                    source[k].color = CLEAR_COLOR;

                    k = j;
                    completed = false;
                }

                source[rhs - i].color = PRIMARY_COLOR;
                source[j].color = CLEAR_COLOR;
                source[k].color = ACCENT_TWO_COLOR;
                callback({ times, datalist: source });
            }

            [completed, times] = await this._service.swapAndRender(source, completed, k !== rhs - i, rhs - i, k, PRIMARY_ONE_COLOR, SECONDARY_ONE_COLOR, ACCENT_ONE_COLOR, times, callback);
        }

        await delay(SORT_DELAY_DURATION);
        await complete(source, times, callback);
    }

}

/**
 * 二路选择排序
 */
@Injectable()
export class TwoWaySelectionSortService extends BaseSortService {

    constructor(private _service: SortToolsService) {
        super();
    }

    protected override async sortByAscent(source: SortDataModel[], lhs: number, rhs: number, option: string | number | undefined, callback: (param: SortStateModel) => void): Promise<void> {
        let minIndex: number, maxIndex: number, completed: boolean, flag: boolean = true, times: number = 0;
        
        for (let i = lhs, j = rhs; i < j; ) {
            minIndex = i;
            maxIndex = j;
            
            for (let m = minIndex + 1, n = maxIndex - 1; m <= j && n >= i; m++, n--) {
                source[i].color = PRIMARY_ONE_COLOR;
                source[m].color = SECONDARY_ONE_COLOR;
                source[minIndex].color = ACCENT_ONE_COLOR;
                source[j].color = PRIMARY_TWO_COLOR;
                source[n].color = SECONDARY_TWO_COLOR;
                source[maxIndex].color = ACCENT_TWO_COLOR;
                callback({ times, datalist: source });

                await delay(SORT_DELAY_DURATION);

                if (source[m].value < source[minIndex].value) {
                    source[minIndex].color = CLEAR_COLOR;
                    minIndex = m;
                }

                if (source[n].value > source[maxIndex].value) {
                    source[maxIndex].color = CLEAR_COLOR;
                    maxIndex = n;
                }

                source[i].color = PRIMARY_ONE_COLOR;
                source[m].color = CLEAR_COLOR;
                source[minIndex].color = ACCENT_ONE_COLOR;
                source[j].color = PRIMARY_TWO_COLOR;
                source[n].color = CLEAR_COLOR;
                source[maxIndex].color = ACCENT_TWO_COLOR;
                callback({ times, datalist: source });
            }

            [completed, times] = await this._service.swapAndRender(source, false, minIndex !== i, i, minIndex, PRIMARY_ONE_COLOR, SECONDARY_ONE_COLOR, ACCENT_ONE_COLOR, times, callback);
            [completed, times] = await this._service.swapAndRender(source, false, maxIndex !== j, j, maxIndex, PRIMARY_TWO_COLOR, SECONDARY_TWO_COLOR, ACCENT_TWO_COLOR, times, callback);

            flag ? i++ : j--;
            flag = !flag;
        }

        await delay(SORT_DELAY_DURATION);
        await complete(source, times, callback);
    }

    protected override async sortByDescent(source: SortDataModel[], lhs: number, rhs: number, option: string | number | undefined, callback: (param: SortStateModel) => void): Promise<void> {
        let minIndex: number, maxIndex: number, completed: boolean, flag: boolean = true, times: number = 0;
        
        for (let i = lhs, j = rhs; i < j; ) {
            minIndex = i;
            maxIndex = j;
            
            for (let m = minIndex + 1, n = maxIndex - 1; m <= j && n >= i; m++, n--) {
                source[i].color = PRIMARY_ONE_COLOR;
                source[m].color = SECONDARY_ONE_COLOR;
                source[minIndex].color = ACCENT_ONE_COLOR;
                source[j].color = PRIMARY_TWO_COLOR;
                source[n].color = SECONDARY_TWO_COLOR;
                source[maxIndex].color = ACCENT_TWO_COLOR;
                callback({ times, datalist: source });

                await delay(SORT_DELAY_DURATION);

                if (source[m].value > source[minIndex].value) {
                    source[minIndex].color = CLEAR_COLOR;
                    minIndex = m;
                }

                if (source[n].value < source[maxIndex].value) {
                    source[maxIndex].color = CLEAR_COLOR;
                    maxIndex = n;
                }

                source[i].color = PRIMARY_ONE_COLOR;
                source[m].color = CLEAR_COLOR;
                source[minIndex].color = ACCENT_ONE_COLOR;
                source[j].color = PRIMARY_TWO_COLOR;
                source[n].color = CLEAR_COLOR;
                source[maxIndex].color = ACCENT_TWO_COLOR;
                callback({ times, datalist: source });
            }

            [completed, times] = await this._service.swapAndRender(source, false, minIndex !== i, i, minIndex, PRIMARY_ONE_COLOR, SECONDARY_ONE_COLOR, ACCENT_ONE_COLOR, times, callback);
            [completed, times] = await this._service.swapAndRender(source, false, maxIndex !== j, j, maxIndex, PRIMARY_TWO_COLOR, SECONDARY_TWO_COLOR, ACCENT_TWO_COLOR, times, callback);

            flag ? i++ : j--;
            flag = !flag;
        }

        await delay(SORT_DELAY_DURATION);
        await complete(source, times, callback);
    }

}

/**
 * 堆排序
 */

@Injectable()
export class HeapSortService extends BaseSortService {

    constructor(private _service: SortToolsService) {
        super();
    }

    protected override async sortByAscent(source: SortDataModel[], lhs: number, rhs: number, option: string | number | undefined, callback: (param: SortStateModel) => void): Promise<void> {
        let completed: boolean, times: number= 0;

        for (let i = (rhs - lhs + 1) >> 1; i >= lhs; i--) {
            times = await this.heapifyByAscent(source, rhs, i, times, callback);
        }

        for (let i = rhs; i > lhs; i--) {
            [completed, times] = await this._service.swapAndRender(source, false, true, i, lhs, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, times, callback);
            times = await this.heapifyByAscent(source, i, lhs, times, callback);
        }

        await delay(SORT_DELAY_DURATION);
        await complete(source, times, callback);
    }

    protected override async sortByDescent(source: SortDataModel[], lhs: number, rhs: number, option: string | number | undefined, callback: (param: SortStateModel) => void): Promise<void> {
        let completed: boolean, times: number= 0;

        for (let i = (rhs - lhs + 1) >> 1, length = rhs - lhs + 1; i <= rhs; i++) {
            times = await this.heapifyByDescent(source, lhs, i, length, times, callback);
        }

        for (let i = lhs, length = rhs - lhs + 1; i < rhs; i++) {
            [completed, times] = await this._service.swapAndRender(source, false, true, i, rhs, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, times, callback);
            times = await this.heapifyByDescent(source, i, rhs, length, times, callback);
        }

        await delay(SORT_DELAY_DURATION);
        await complete(source, times, callback);
    }

    private async heapifyByAscent(source: SortDataModel[], threshold: number, root: number, times: number, callback: (param: SortStateModel) => void): Promise<number> {
        let left: number, right: number, pivot: number;

        while (true) {
            left = root + root + 1;
            right = left + 1;
            pivot = root;

            if (left < threshold && source[left].value > source[pivot].value) {
                pivot = left;
            }

            if (right < threshold && source[right].value > source[pivot].value) {
                pivot = right;
            }

            if (pivot === root) break;

            await this._service.swapAndRender(source, false, true, root, pivot, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, times, callback);

            root = pivot;
            times += 1;
        }

        return times;
    }

    private async heapifyByDescent(source: SortDataModel[], threshold: number, root: number, length: number, times: number, callback: (param: SortStateModel) => void): Promise<number> {
        let left: number, right: number, pivot: number;

        while (true) {
            right = root + root - length;
            left = right - 1;
            pivot = root;

            if (left > threshold && source[left].value > source[pivot].value) {
                pivot = left;
            }

            if (right > threshold && source[right].value > source[pivot].value) {
                pivot = right;
            }

            if (pivot === root) break;

            await this._service.swapAndRender(source, false, true, root, pivot, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, times, callback);

            root = pivot;
            times += 1;
        }

        return times;
    }

}

/**
 * 堆排序（多节点）
 */

@Injectable()
export class TernaryHeapSortService extends BaseSortService {

    constructor(private _service: SortToolsService) {
        super();
    }

    protected override async sortByAscent(source: SortDataModel[], lhs: number, rhs: number, option: string | number | undefined, callback: (param: SortStateModel) => void): Promise<void> {
        let times: number = 0, completed: boolean;

        if (typeof option === 'number') {
            for (let i = Math.floor((rhs - lhs + 1) / option); i >= lhs; i--) {
                times = await this.heapifyByAscent(source, rhs, i, option, times, callback);
            }
    
            for (let i = rhs; i > lhs; i--) {
                [completed, times] = await this._service.swapAndRender(source, false, true, i, lhs, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, times, callback);
                times = await this.heapifyByAscent(source, i, lhs, option, times, callback);
            }
        }        

        await delay(SORT_DELAY_DURATION);
        await complete(source, times, callback);
    }

    protected override async sortByDescent(source: SortDataModel[], lhs: number, rhs: number, option: string | number | undefined, callback: (param: SortStateModel) => void): Promise<void> {
        let completed: boolean, times: number= 0;

        if (typeof option === 'number') {
            for (let i = Math.floor((rhs - lhs + 1) / option), length = rhs - lhs + 1; i <= rhs; i++) {
                times = await this.heapifyByDescent(source, lhs, i, option, length, times, callback);
            }

            for (let i = lhs, length = rhs - lhs + 1; i < rhs; i++) {
                [completed, times] = await this._service.swapAndRender(source, false, true, i, rhs, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, times, callback);
                times = await this.heapifyByDescent(source, i, rhs, option, length, times, callback);
            }
        }

        await delay(SORT_DELAY_DURATION);
        await complete(source, times, callback);
    }

    private async heapifyByAscent(source: SortDataModel[], threshold: number, root: number, option: number, times: number, callback: (param: SortStateModel) => void): Promise<number> {
        let pivot: number, index: number = 0, value: number;

        while (true) {
            for (let i = 0; i < option; i++) {
                this.array[i] = root * option + i + 1;
            }

            pivot = root;
            value = Number.MIN_SAFE_INTEGER;

            for (let i = 0; i < option; i++) {
                if (this.array[i] < threshold && source[this.array[i]].value > value) {
                    index = this.array[i];
                    value = source[index].value;
                }
            }

            if (index < threshold && source[index].value > source[pivot].value) {
                pivot = index;
            }

            this.array.splice(0);

            if (pivot === root) break;

            await this._service.swapAndRender(source, false, true, root, pivot, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, times, callback);

            root = pivot;
            times += 1;
        }

        return times;
    }

    private async heapifyByDescent(source: SortDataModel[], threshold: number, root: number, option: number, length: number, times: number, callback: (param: SortStateModel) => void): Promise<number> {
        let pivot: number, index: number = 0, value: number, k: number;
        
        while (true) {
            for (let i = 0; i < option; i++) {
                k = length - root - 1;
                this.array[i] = root - option * k + k - i - 1;
            }
            
            pivot = root;
            value = Number.MIN_SAFE_INTEGER;

            for (let i = 0; i < option; i++) {
                if (this.array[i] > threshold && source[this.array[i]].value > value) {
                    index = this.array[i];
                    value = source[index].value;
                }
            }

            if (index > threshold && source[index].value > source[pivot].value) {
                pivot = index;
            }

            this.array.splice(0);

            if (pivot === root) break;

            await this._service.swapAndRender(source, false, true, root, pivot, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, times, callback);

            root = pivot;
            times += 1;
        }

        return times;
    }

}

