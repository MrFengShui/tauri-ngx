import { Injectable } from "@angular/core";
import { Observable } from "rxjs";

import { SortDataModel, SortStateModel } from "../ngrx-store/sort.state";
import { delay } from "../../../public/global.utils";
import { CLEAR_COLOR, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, PRIMARY_ONE_COLOR, SECONDARY_ONE_COLOR, ACCENT_ONE_COLOR, PRIMARY_TWO_COLOR, SECONDARY_TWO_COLOR, ACCENT_TWO_COLOR } from "../../../public/global.utils";
import { AbstractSortService } from "./base-sort.service";
import { SortToolsService } from "../ngrx-store/sort.service";

/**
 * 选择排序（单向）
 */
@Injectable()
export class SelectionSortService extends AbstractSortService {

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

                await delay();

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

        await delay();
        await this.complete(source, times, callback);
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

                await delay();

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

        await delay();
        await this.complete(source, times, callback);
    }

}

/**
 * 选择排序（双向）
 */
@Injectable()
export class ShakerSelectionSortService extends AbstractSortService {

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

                await delay();

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

                await delay();

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

        await delay();
        await this.complete(source, times, callback);
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

                await delay();

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

                await delay();

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

        await delay();
        await this.complete(source, times, callback);
    }

}

/**
 * 二路选择排序
 */
@Injectable()
export class TwoWaySelectionSortService extends AbstractSortService {

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

                await delay();

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

        await delay();
        await this.complete(source, times, callback);
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

                await delay();

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

        await delay();
        await this.complete(source, times, callback);
    }

}

/**
 * 堆排序
 */

@Injectable()
export class HeapSortService extends AbstractSortService {

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

        await delay();
        await this.complete(source, times, callback);
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

        await delay();
        await this.complete(source, times, callback);
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
export class TernaryHeapSortService extends AbstractSortService {

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

        await delay();
        await this.complete(source, times, callback);
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

        await delay();
        await this.complete(source, times, callback);
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

/**
 * 平滑排序
 */
@Injectable()
export class SmoothSortService extends AbstractSortService {

    constructor(private _service: SortToolsService) {
        super();
    }

    protected override async sortByAscent(source: SortDataModel[], lhs: number, rhs: number, option: string | number | undefined, callback: (param: SortStateModel) => void): Promise<void> {
        let index: number = 0, times: number = 0;

        for (let i = lhs + 1; i <= rhs; i++) {
            if (index > 0 && this.array[index - 1] - this.array[index] === 1) {
                index -= 1;
                this.array[index] += 1;

                times = await this.buildMaxHeap(source, i, index, times, callback);
                continue;
            }

            if (!this.array[index]) {
                this.array[index] = 1;
            }

            if (this.array[index] !== 1) {
                index += 1;
                this.array[index] = 1;
            } else {
                index += 1;
                this.array[index] = 0;
            }

            times = await this.buildMaxHeap(source, i, index, times, callback);
        }

        for (let i = rhs - 1; i > lhs; i--) {
            if (this.array[index] <= 1) {
                index -= 1;
            } else {
                this.array[index] -= 1;
                this.array[index + 1] = this.array[index] - 1;
                index += 1;

                times = await this.buildMaxHeap(source, i - this.leonardo(this.array[index]), index - 1, times, callback);
                times = await this.buildMaxHeap(source, i, index, times, callback);
            }
        }

        await delay();
        await this.complete(source, times, callback);
        this.array.splice(0);
    }

    protected override async sortByDescent(source: SortDataModel[], lhs: number, rhs: number, option: string | number | undefined, callback: (param: SortStateModel) => void): Promise<void> {
        let index: number = 0, times: number = 0;

        for (let i = lhs + 1; i <= rhs; i++) {
            if (index > 0 && this.array[index - 1] - this.array[index] === 1) {
                index -= 1;
                this.array[index] += 1;

                times = await this.buildMinHeap(source, i, index, times, callback);
                continue;
            }

            if (!this.array[index]) {
                this.array[index] = 1;
            }

            if (this.array[index] !== 1) {
                index += 1;
                this.array[index] = 1;
            } else {
                index += 1;
                this.array[index] = 0;
            }

            times = await this.buildMinHeap(source, i, index, times, callback);
        }

        for (let i = rhs - 1; i > lhs; i--) {
            if (this.array[index] <= 1) {
                index -= 1;
            } else {
                this.array[index] -= 1;
                this.array[index + 1] = this.array[index] - 1;
                index += 1;

                times = await this.buildMinHeap(source, i - this.leonardo(this.array[index]), index - 1, times, callback);
                times = await this.buildMinHeap(source, i, index, times, callback);
            }
        }

        await delay();
        await this.complete(source, times, callback);
        this.array.splice(0);
    }

    private async buildMaxHeap(source: SortDataModel[], i: number, index: number, times: number, callback: (param: SortStateModel) => void): Promise<number> {
        let root: number, left: number, right: number, level: number;

        while (index > 0) {
            level = this.array[index];
            root = i - this.leonardo(level);

            if (source[i].value > source[root].value) break;

            if (level > 1) {
                left = i - 1 - this.leonardo(level - 2);
                right = i - 1;

                if (source[root].value < source[left].value) break;

                if (source[root].value < source[right].value) break;
            }

            await this._service.swapAndRender(source, false, true, i, root, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, times, callback);

            i = root;
            index -= 1;
            times += 1;
        }

        return await this.maxHeapify(source, i, this.array[index], times, callback);
    }

    private async buildMinHeap(source: SortDataModel[], i: number, index: number, times: number, callback: (param: SortStateModel) => void): Promise<number> {
        let root: number, left: number, right: number, level: number;

        while (index > 0) {
            level = this.array[index];
            root = i - this.leonardo(level);

            if (source[i].value < source[root].value) break;

            if (level > 1) {
                left = i - 1 - this.leonardo(level - 2);
                right = i - 1;

                if (source[root].value > source[left].value) break;

                if (source[root].value > source[right].value) break;
            }

            await this._service.swapAndRender(source, false, true, i, root, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, times, callback);

            i = root;
            index -= 1;
            times += 1;
        }

        return await this.minHeapify(source, i, this.array[index], times, callback);
    }

    private async maxHeapify(source: SortDataModel[], root: number, level: number, times: number, callback: (param: SortStateModel) => void): Promise<number> {
        let left: number, right: number, pivot: number;

        while (level > 1) {
            left = root - 1 - this.leonardo(level - 2);
            right = root - 1;
            pivot = root;

            if (source[pivot].value < source[left].value) {
                pivot = left;
            }

            if (source[pivot].value < source[right].value) {
                pivot = right;
            }

            if (pivot === root) break;

            await this._service.swapAndRender(source, false, true, root, pivot, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, times, callback);

            root = pivot;
            level = pivot === left ? level - 1 : level - 2;
            times += 1;
        }

        return times;
    }

    private async minHeapify(source: SortDataModel[], root: number, level: number, times: number, callback: (param: SortStateModel) => void): Promise<number> {
        let left: number, right: number, pivot: number;

        while (level > 1) {
            left = root - 1 - this.leonardo(level - 2);
            right = root - 1;
            pivot = root;

            if (source[pivot].value > source[left].value) {
                pivot = left;
            }

            if (source[pivot].value > source[right].value) {
                pivot = right;
            }

            if (pivot === root) break;

            await this._service.swapAndRender(source, false, true, root, pivot, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, times, callback);

            root = pivot;
            level = pivot === left ? level - 1 : level - 2;
            times += 1;
        }

        return times;
    }

    /**
     * k = ceil(log(n) + 1)
     * root: L(k) - 1
     * left: L(k - 1) - 1
     * right: L(k) - 2
     * @param index
     * @param fst
     * @param snd
     * @returns
     */
    private leonardo(index: number, fst: number = 1, snd: number = 1): number {
        if (index === 0) {
            return fst;
        } else if (index === 1) {
            return snd;
        } else {
            let sum: number = 0;

            for (let i = 2; i <= index; i++) {
                sum = fst + snd + 1;
                fst = snd;
                snd = sum;
            }

            return sum;
        }
    }

}

