import { Injectable } from "@angular/core";
import { ceil, floor } from "lodash";

import { SortDataModel, SortOrder, SortStateModel } from "../ngrx-store/sort.state";

import { delay } from "../../../public/global.utils";
import { CLEAR_COLOR, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, PRIMARY_ONE_COLOR, SECONDARY_ONE_COLOR, ACCENT_ONE_COLOR, PRIMARY_TWO_COLOR, SECONDARY_TWO_COLOR, ACCENT_TWO_COLOR } from "../../../public/global.utils";

import { AbstractDistributionSortService, AbstractSelectionSortService, AbstractSortService } from "./base-sort.service";


/**
 * 选择排序（单向）
 */
@Injectable()
export class SelectionSortService extends AbstractSelectionSortService {

    protected override async sortByAscent(source: SortDataModel[], lhs: number, rhs: number, option: string | number | undefined, callback: (param: SortStateModel) => void): Promise<void> {
        let k: number, times: number = 0, completed: boolean = false;
        
        for (let i = lhs; i <= rhs; i++) {
            [times, k] = await this.selectByAscent(source, i, rhs, true, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, times, callback);
            [completed, times] = await this._service.swapAndRender(source, completed, k !== i, i, k, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, times, callback);
        }

        await delay();
        await this.complete(source, times, callback);
    }

    protected override async sortByDescent(source: SortDataModel[], lhs: number, rhs: number, option: string | number | undefined, callback: (param: SortStateModel) => void): Promise<void> {
        let k: number, times: number = 0, completed: boolean = false;
        
        for (let i = rhs; i >= lhs; i--) {
            [times, k] = await this.selectByDescent(source, lhs, i, true, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, times, callback);
            [completed, times] = await this._service.swapAndRender(source, completed, k !== i, i, k, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, times, callback);
        }

        await delay();
        await this.complete(source, times, callback);
    }

    protected override async selectByAscent(source: SortDataModel[], lhs: number, rhs: number, flag: boolean, primaryColor: string, secondaryColor: string, accentColor: string, times: number, callback: (param: SortStateModel) => void): Promise<[number, number]> {
        let idx: number;

        if (flag) {
            idx = lhs;

            for (let i = lhs + 1; i <= rhs; i++) {
                source[lhs].color = primaryColor;
                source[i].color = secondaryColor;
                source[idx].color = accentColor;
                callback({ times, datalist: source });
    
                await delay();
    
                if (source[i].value < source[idx].value) {
                    source[idx].color = CLEAR_COLOR;
                    idx = i;
                }
    
                source[lhs].color = primaryColor;
                source[i].color = CLEAR_COLOR;
                source[idx].color = accentColor;
                callback({ times, datalist: source });
            }
        } else {
            idx = rhs;

            for (let i = rhs - 1; i >= lhs; i--) {
                source[rhs].color = primaryColor;
                source[i].color = secondaryColor;
                source[idx].color = accentColor;
                callback({ times, datalist: source });
    
                await delay();
    
                if (source[i].value > source[idx].value) {
                    source[idx].color = CLEAR_COLOR;
                    idx = i;
                }
    
                source[rhs].color = primaryColor;
                source[i].color = CLEAR_COLOR;
                source[idx].color = accentColor;
                callback({ times, datalist: source });
            }
        }

        return [times, idx];
    }

    protected override async selectByDescent(source: SortDataModel[], lhs: number, rhs: number, flag: boolean, primaryColor: string, secondaryColor: string, accentColor: string, times: number, callback: (param: SortStateModel) => void): Promise<[number, number]> {
        let idx: number;

        if (flag) {
            idx = rhs;

            for (let i = rhs - 1; i >= lhs; i--) {
                source[rhs].color = primaryColor;
                source[i].color = secondaryColor;
                source[idx].color = accentColor;
                callback({ times, datalist: source });
    
                await delay();
    
                if (source[i].value < source[idx].value) {
                    source[idx].color = CLEAR_COLOR;
                    idx = i;
                }
    
                source[rhs].color = primaryColor;
                source[i].color = CLEAR_COLOR;
                source[idx].color = accentColor;
                callback({ times, datalist: source });
            }
        } else {
            idx = lhs;

            for (let i = lhs + 1; i <= rhs; i++) {
                source[lhs].color = primaryColor;
                source[i].color = secondaryColor;
                source[idx].color = accentColor;
                callback({ times, datalist: source });
    
                await delay();
    
                if (source[i].value > source[idx].value) {
                    source[idx].color = CLEAR_COLOR;
                    idx = i;
                }
    
                source[lhs].color = primaryColor;
                source[i].color = CLEAR_COLOR;
                source[idx].color = accentColor;
                callback({ times, datalist: source });
            }
        }

        return [times, idx];
    }

}

/**
 * 选择排序（双向）
 */
@Injectable()
export class ShakerSelectionSortService extends SelectionSortService {

    protected override async sortByAscent(source: SortDataModel[], lhs: number, rhs: number, option: string | number | undefined, callback: (param: SortStateModel) => void): Promise<void> {
        let k: number, times: number = 0, completed: boolean = false;
        
        for (let i = lhs; i <= rhs && !completed; i++) {
            completed = true;
    
            [times, k] = await this.selectByAscent(source, i, rhs - i, true, PRIMARY_ONE_COLOR, SECONDARY_ONE_COLOR, ACCENT_ONE_COLOR, times, callback);
            [completed, times] = await this._service.swapAndRender(source, completed, k !== i, i, k, PRIMARY_ONE_COLOR, SECONDARY_ONE_COLOR, ACCENT_ONE_COLOR, times, callback);

            [times, k] = await this.selectByAscent(source, i, rhs - i, false, PRIMARY_TWO_COLOR, SECONDARY_TWO_COLOR, ACCENT_TWO_COLOR, times, callback);
            [completed, times] = await this._service.swapAndRender(source, completed, k !== rhs - i, rhs - i, k, PRIMARY_TWO_COLOR, SECONDARY_TWO_COLOR, ACCENT_TWO_COLOR, times, callback);
        }

        await delay();
        await this.complete(source, times, callback);
    }

    protected override async sortByDescent(source: SortDataModel[], lhs: number, rhs: number, option: string | number | undefined, callback: (param: SortStateModel) => void): Promise<void> {
        let k: number, times: number = 0, completed: boolean = false;
        
        for (let i = rhs; i >= lhs && !completed; i--) {
            completed = true;

            [times, k] = await this.selectByDescent(source, rhs - i, i, true, PRIMARY_ONE_COLOR, SECONDARY_ONE_COLOR, ACCENT_ONE_COLOR, times, callback);
            [completed, times] = await this._service.swapAndRender(source, completed, k !== i, i, k, PRIMARY_ONE_COLOR, SECONDARY_ONE_COLOR, ACCENT_ONE_COLOR, times, callback);

            [times, k] = await this.selectByDescent(source, rhs - i, i, false, PRIMARY_TWO_COLOR, SECONDARY_TWO_COLOR, ACCENT_TWO_COLOR, times, callback);
            [completed, times] = await this._service.swapAndRender(source, completed, k !== rhs - i, rhs - i, k, PRIMARY_TWO_COLOR, SECONDARY_TWO_COLOR, ACCENT_TWO_COLOR, times, callback);
        }

        await delay();
        await this.complete(source, times, callback);
    }

}

/**
 * 二路选择排序
 */
@Injectable()
export class TwoWaySelectionSortService extends ShakerSelectionSortService {

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
export class HeapSortService extends SelectionSortService {

    protected override async sortByAscent(source: SortDataModel[], lhs: number, rhs: number, option: string | number | undefined, callback: (param: SortStateModel) => void): Promise<void> {
        let times: number = await this.sortByOrder(source, lhs, rhs, 'ascent', 0, callback);

        await delay();
        await this.complete(source, times, callback);
    }

    protected override async sortByDescent(source: SortDataModel[], lhs: number, rhs: number, option: string | number | undefined, callback: (param: SortStateModel) => void): Promise<void> {
        let times: number = await this.sortByOrder(source, lhs, rhs, 'descent', 0, callback);

        await delay();
        await this.complete(source, times, callback);
    }

    protected async heapifyByOrder(source: SortDataModel[], parent: number, threshold: number, offset: number, length: number, order: SortOrder, times: number, callback: (param: SortStateModel) => void): Promise<number> {
        let pnode: number = parent, lnode: number, rnode: number, index: number = -1;

        while (true) {
            if (order === 'ascent') {
                lnode = pnode + pnode + 1 - offset;
                rnode = pnode + pnode + 2 - offset;
                index = pnode;
    
                if (lnode < threshold && source[lnode].value > source[index].value) {
                    index = lnode;
                }
    
                if (rnode < threshold && source[rnode].value > source[index].value) {
                    index = rnode;
                }
            }
            
            if (order === 'descent') {
                lnode = pnode + pnode - length - 1 - offset;
                rnode = pnode + pnode - length - offset;
                index = pnode;
                
                if (lnode > threshold && source[lnode].value > source[index].value) {
                    index = lnode;
                }
    
                if (rnode > threshold && source[rnode].value > source[index].value) {
                    index = rnode;
                }
            }

            if (index === pnode) break;

            await this._service.swapAndRender(source, false, true, pnode, index, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, times, callback);

            times += 1;
            pnode = index;
        }

        return times;
    }

    public async sortByOrder(source: SortDataModel[], lhs: number, rhs: number, order: SortOrder, times: number, callback: (param: SortStateModel) => void): Promise<number> {
        let completed: boolean = false, idx: number = floor((rhs - lhs) * 0.5 + lhs), length: number= rhs - lhs + 1;

        if (order === 'ascent') {
            for (let i = idx; i >= lhs; i--) {
                times = await this.heapifyByOrder(source, i, rhs, lhs, length, 'ascent', times, callback);
            }
    
            for (let i = rhs; i >= lhs; i--) {
                [completed, times] = await this._service.swapAndRender(source, completed, true, i, lhs, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, times, callback);
                times = await this.heapifyByOrder(source, lhs, i, lhs, length, 'ascent', times, callback);
            }
        }
        
        if (order === 'descent') {
            for (let i = idx; i <= rhs; i++) {
                times = await this.heapifyByOrder(source, i, lhs, lhs, length, 'descent', times, callback);
            }
    
            for (let i = lhs; i < rhs; i++) {
                [completed, times] = await this._service.swapAndRender(source, completed, true, i, rhs, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, times, callback);
                times = await this.heapifyByOrder(source, rhs, i, lhs, length, 'descent', times, callback);
            }
        }

        return times;
    }

}

/**
 * 堆排序（多节点）
 */

@Injectable()
export class TernaryHeapSortService extends HeapSortService {

    private option: number = -1;

    protected override async sortByAscent(source: SortDataModel[], lhs: number, rhs: number, option: string | number | undefined, callback: (param: SortStateModel) => void): Promise<void> {
        let times: number = 0, completed: boolean;

        if (typeof option === 'number') {
            this.option = option;

            for (let i = Math.floor((rhs - lhs + 1) / option); i >= lhs; i--) {
                times = await this.heapifyByAscent(source, rhs, i, times, callback);
            }
    
            for (let i = rhs; i > lhs; i--) {
                [completed, times] = await this._service.swapAndRender(source, false, true, i, lhs, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, times, callback);
                times = await this.heapifyByAscent(source, i, lhs, times, callback);
            }
        }        

        await delay();
        await this.complete(source, times, callback);
    }

    protected override async sortByDescent(source: SortDataModel[], lhs: number, rhs: number, option: string | number | undefined, callback: (param: SortStateModel) => void): Promise<void> {
        let completed: boolean, times: number= 0;

        if (typeof option === 'number') {
            this.option = option;

            for (let i = Math.floor((rhs - lhs + 1) / option), length = rhs - lhs + 1; i <= rhs; i++) {
                times = await this.heapifyByDescent(source, lhs, i, length, times, callback);
            }

            for (let i = lhs, length = rhs - lhs + 1; i < rhs; i++) {
                [completed, times] = await this._service.swapAndRender(source, false, true, i, rhs, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, times, callback);
                times = await this.heapifyByDescent(source, i, rhs, length, times, callback);
            }
        }

        await delay();
        await this.complete(source, times, callback);
    }

    protected async heapifyByAscent(source: SortDataModel[], threshold: number, root: number, times: number, callback: (param: SortStateModel) => void): Promise<number> {
        let pivot: number, index: number = 0, value: number;

        while (true) {
            for (let i = 0; i < this.option; i++) {
                this.array[i] = root * this.option + i + 1;
            }

            pivot = root;
            value = Number.MIN_SAFE_INTEGER;

            for (let i = 0; i < this.option; i++) {
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

    protected async heapifyByDescent(source: SortDataModel[], threshold: number, root: number, length: number, times: number, callback: (param: SortStateModel) => void): Promise<number> {
        let pivot: number, index: number = 0, value: number, k: number;
        
        while (true) {
            for (let i = 0; i < this.option; i++) {
                k = length - root - 1;
                this.array[i] = root - this.option * k + k - i - 1;
            }
            
            pivot = root;
            value = Number.MIN_SAFE_INTEGER;

            for (let i = 0; i < this.option; i++) {
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
export class SmoothSortService extends HeapSortService {

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

        return await this.siftup(source, i, this.array[index], times, callback);
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

        return await this.siftdown(source, i, this.array[index], times, callback);
    }

    private async siftup(source: SortDataModel[], root: number, level: number, times: number, callback: (param: SortStateModel) => void): Promise<number> {
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

    private async siftdown(source: SortDataModel[], root: number, level: number, times: number, callback: (param: SortStateModel) => void): Promise<number> {
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

type Node = { index: number, value: number, parent?: number };

/**
 * 锦标赛排序
 */
@Injectable()
export class TournamentSortService extends AbstractDistributionSortService<Node> {
    
    private depth: number = -1;

    protected override async sortByAscent(source: SortDataModel[], lhs: number, rhs: number, option: string | number | undefined, callback: (param: SortStateModel) => void): Promise<void> {
        let times: number = 0;

        this.depth = ceil(Math.log2(rhs - lhs + 1) + 1, 0);

        times = await this.save(source, lhs, rhs, 'ascent', times, callback);
        times = await this.load(source, lhs, rhs, 'ascent', times, callback);

        this.freeKeyValues(this.cacheOfKeyValues);

        await delay();
        await this.complete(source, times, callback);
    }

    protected override async sortByDescent(source: SortDataModel[], lhs: number, rhs: number, option: string | number | undefined, callback: (param: SortStateModel) => void): Promise<void> {
        let times: number = 0;

        this.depth = ceil(Math.log2(rhs - lhs + 1) + 1, 0);

        times = await this.save(source, lhs, rhs, 'descent', times, callback);
        times = await this.load(source, lhs, rhs, 'descent', times, callback);

        this.freeKeyValues(this.cacheOfKeyValues);

        await delay();
        await this.complete(source, times, callback);
    }

    protected override async save(source: SortDataModel[], lhs: number, rhs: number, order: SortOrder, times: number, callback: (param: SortStateModel) => void): Promise<number> {
        let node: Node, parent: number;

        for (let i = this.depth - 1; i >= 0; i--) {
            this.cacheOfKeyValues[i] = Array.from([]);

            if (i === this.depth - 1) {
                if (order === 'ascent') {
                    for (let j = lhs; j <= rhs; j++) {
                        this.cacheOfKeyValues[i].push({ index: j, value: source[j].value });
    
                        times = await this.render(source, j, j, ACCENT_ONE_COLOR, ACCENT_ONE_COLOR, times, callback);
                        times += 1;
                    }
                }

                if (order === 'descent') {
                    for (let j = rhs; j >= lhs; j--) {
                        this.cacheOfKeyValues[i].push({ index: rhs - lhs - j, value: source[j].value });
    
                        times = await this.render(source, j, j, ACCENT_ONE_COLOR, ACCENT_ONE_COLOR, times, callback);
                        times += 1;
                    }
                }
            } else {
                for (let j = 0, length = this.cacheOfKeyValues[i + 1].length; j < length; j += 2) {
                    node = { index: -1, value: Number.POSITIVE_INFINITY };
                    this.cacheOfKeyValues[i].push(node);

                    parent = this.cacheOfKeyValues[i].length - 1;

                    lhs = j;
                    rhs = Math.min(j + 1, length - 1);
                    
                    if (this.cacheOfKeyValues[i + 1][lhs]) {
                        this.cacheOfKeyValues[i + 1][lhs].parent = parent;
                    }
                    
                    if (this.cacheOfKeyValues[i + 1][rhs]) {
                        this.cacheOfKeyValues[i + 1][rhs].parent = parent;
                    }
                }
            }
        }

        return times;
    }

    protected override async load(source: SortDataModel[], lhs: number, rhs: number, order: SortOrder, times: number, callback: (param: SortStateModel) => void): Promise<number> {
        let index: number = -1, pivot: number = -1;

        for (let i = lhs, length = source.length; i <= rhs; i++) {
            index = this.float(index, i === 0);
            
            if (order === 'ascent') {
                pivot = i;
            }
            
            if (order === 'descent') {
                pivot = length - i - 1;
            }

            source[pivot].value = this.cacheOfKeyValues[0][0].value;

            times = await this.render(source, pivot, pivot, ACCENT_TWO_COLOR, ACCENT_TWO_COLOR, times, callback);
            times += 1;
        }

        return times;
    }

    private float(index: number, flag: boolean): number {
        let idx: number, lhs: number, rhs: number;

        for (let i = this.depth - 1; i > 0; i--) {
            this.array = this.cacheOfKeyValues[i];

            if (flag) {
                for (let j = 0, length = this.array.length; j < length; j += 2) {
                    lhs = j;
                    rhs = Math.min(j + 1, length - 1);
                    idx = this.array[lhs]?.parent as number;
                    this.cacheOfKeyValues[i - 1][idx].index = this.array[lhs].value < this.array[rhs].value ? this.array[lhs].index : this.array[rhs].index;
                    this.cacheOfKeyValues[i - 1][idx].value = this.array[lhs].value < this.array[rhs].value ? this.array[lhs].value : this.array[rhs].value;
                }
            } else {
                lhs = index % 2 === 0 ? index : index - 1;
                rhs = index % 2 === 0 ? Math.min(index + 1, this.array.length - 1) : index;
                idx = this.array[lhs]?.parent as number;
                this.cacheOfKeyValues[i - 1][idx].index = this.array[lhs].value < this.array[rhs].value ? this.array[lhs].index : this.array[rhs].index;
                this.cacheOfKeyValues[i - 1][idx].value = this.array[lhs].value < this.array[rhs].value ? this.array[lhs].value : this.array[rhs].value;
                index = idx;
            }
        }

        index = this.cacheOfKeyValues[0][0].index;
        this.cacheOfKeyValues[this.depth - 1][index].value = Number.POSITIVE_INFINITY;
        return index;
    }

}

/**
 * 煎饼排序
 */
@Injectable()
export class PancakeSortService extends AbstractSortService {

    protected override async sortByAscent(source: SortDataModel[], lhs: number, rhs: number, option: string | number | undefined, callback: (param: SortStateModel) => void): Promise<void> {
        let idx: number, times: number = 0;

        for (let i = rhs; i >= lhs; i--) {
            [times, idx] = await this.seek(source, lhs, i - 1, i, 'ascent', times, callback);
            times = await this.flip(source, lhs, idx, idx, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, times, callback);
            times = await this.flip(source, lhs, i, i, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, times, callback);
        }

        await delay();
        await this.complete(source, times, callback);
    }

    protected override async sortByDescent(source: SortDataModel[], lhs: number, rhs: number, option: string | number | undefined, callback: (param: SortStateModel) => void): Promise<void> {
        let idx: number, times: number = 0;

        for (let i = lhs; i <= rhs; i++) {
            [times, idx] = await this.seek(source, i + 1, rhs, i, 'descent', times, callback);
            times = await this.flip(source, idx, rhs, idx, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, times, callback);
            times = await this.flip(source, i, rhs, i, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, times, callback);
        }

        await delay();
        await this.complete(source, times, callback);
    }

    private async seek(source: SortDataModel[], start: number, final: number, index: number, order: SortOrder, times: number, callback: (param: SortStateModel) => void): Promise<[number, number]> {
        let idx: number = index;

        if (order === 'ascent') {
            for (let j = final; j >= start; j--) {
                source[index].color = PRIMARY_COLOR;
                source[j].color = SECONDARY_COLOR;
                source[idx].color = ACCENT_COLOR;
                callback({ times, datalist: source });

                await delay();

                if (source[j].value > source[idx].value) {
                    source[idx].color = CLEAR_COLOR;

                    idx = j;
                }

                source[index].color = PRIMARY_COLOR;
                source[j].color = CLEAR_COLOR;
                source[idx].color = ACCENT_COLOR;
                callback({ times, datalist: source });
            }
        }

        if (order === 'descent') {
            for (let j = start; j <= final; j++) {
                source[index].color = PRIMARY_COLOR;
                source[j].color = SECONDARY_COLOR;
                source[idx].color = ACCENT_COLOR;
                callback({ times, datalist: source });

                await delay();

                if (source[j].value > source[idx].value) {
                    source[idx].color = CLEAR_COLOR;

                    idx = j;
                }

                source[index].color = PRIMARY_COLOR;
                source[j].color = CLEAR_COLOR;
                source[idx].color = ACCENT_COLOR;
                callback({ times, datalist: source });
            }
        }

        return [times, idx];
    }

    protected async flip(source: SortDataModel[], lhs: number, rhs: number, idx: number, primaryColor: string, secondaryColor: string, accentColor: string, times: number, callback: (param: SortStateModel) => void): Promise<number> {
        for (let i = lhs, j = rhs; i <= j; i++, j--) {
            source[idx].color = accentColor;
            callback({ times, datalist: source });

            await this._service.swapAndRender(source, false, true, i, j, primaryColor, secondaryColor, accentColor, times, callback);

            times += 1;
        }

        source[idx].color = CLEAR_COLOR;
        callback({ times, datalist: source });

        return times;
    }

}

@Injectable()
export class ShakerPancakeSortService extends PancakeSortService {

    protected override async sortByAscent(source: SortDataModel[], lhs: number, rhs: number, option: string | number | undefined, callback: (param: SortStateModel) => void): Promise<void> {
        let idx: number, start: number, final: number, times: number = 0;

        for (let i = rhs; i >= lhs; i--) {
            idx = i;
            start = rhs - i;
            final = i - 1;

            for (let j = final; j >= start; j--) {
                source[i].color = PRIMARY_ONE_COLOR;
                source[j].color = SECONDARY_ONE_COLOR;
                source[idx].color = ACCENT_ONE_COLOR;
                callback({ times, datalist: source });

                await delay();

                if (source[j].value > source[idx].value) {
                    source[idx].color = CLEAR_COLOR;
                    idx = j;
                }

                source[i].color = PRIMARY_ONE_COLOR;
                source[j].color = CLEAR_COLOR;
                source[idx].color = ACCENT_ONE_COLOR;
                callback({ times, datalist: source });
            }

            times = await this.flip(source, start, idx, idx,PRIMARY_ONE_COLOR, SECONDARY_ONE_COLOR, ACCENT_ONE_COLOR, times, callback);
            times = await this.flip(source, start, final + 1, final + 1, PRIMARY_ONE_COLOR, SECONDARY_ONE_COLOR, ACCENT_ONE_COLOR, times, callback);

            idx = rhs - i;
            start = rhs - i + 1;
            final = i - 1;

            for (let j = start; j <= final; j++) {
                source[rhs - i].color = PRIMARY_TWO_COLOR;
                source[j].color = SECONDARY_TWO_COLOR;
                source[idx].color = ACCENT_TWO_COLOR;
                callback({ times, datalist: source });

                await delay();

                if (source[j].value < source[idx].value) {
                    source[idx].color = CLEAR_COLOR;
                    idx = j;
                }

                source[rhs - i].color = PRIMARY_TWO_COLOR;
                source[j].color = CLEAR_COLOR;
                source[idx].color = ACCENT_TWO_COLOR;
                callback({ times, datalist: source });
            }

            times = await this.flip(source, idx, final, idx, PRIMARY_TWO_COLOR, SECONDARY_TWO_COLOR, ACCENT_TWO_COLOR, times, callback);
            times = await this.flip(source, start - 1, final, start - 1, PRIMARY_TWO_COLOR, SECONDARY_TWO_COLOR, ACCENT_TWO_COLOR, times, callback);
        }

        await delay();
        await this.complete(source, times, callback);
    }

    protected override async sortByDescent(source: SortDataModel[], lhs: number, rhs: number, option: string | number | undefined, callback: (param: SortStateModel) => void): Promise<void> {
        let idx: number, start: number, final: number, times: number = 0;

        for (let i = lhs; i <= rhs; i++) {
            idx = i;
            start = i + 1;
            final = rhs - i;

            for (let j = start; j <= final; j++) {
                source[i].color = PRIMARY_ONE_COLOR;
                source[j].color = SECONDARY_ONE_COLOR;
                source[idx].color = ACCENT_ONE_COLOR;
                callback({ times, datalist: source });

                await delay();

                if (source[j].value > source[idx].value) {
                    source[idx].color = CLEAR_COLOR;
                    idx = j;
                }

                source[i].color = PRIMARY_ONE_COLOR;
                source[j].color = CLEAR_COLOR;
                source[idx].color = ACCENT_ONE_COLOR;
                callback({ times, datalist: source });
            }
            
            times = await this.flip(source, idx, final, idx, PRIMARY_ONE_COLOR, SECONDARY_ONE_COLOR, ACCENT_ONE_COLOR, times, callback);
            times = await this.flip(source, start - 1, final, start - 1, PRIMARY_ONE_COLOR, SECONDARY_ONE_COLOR, ACCENT_ONE_COLOR, times, callback);

            idx = rhs - i;
            start = i + 1;
            final = rhs - i - 1;
            
            for (let j = final; j >= start; j--) {
                source[rhs - i].color = PRIMARY_TWO_COLOR;
                source[j].color = SECONDARY_TWO_COLOR;
                source[idx].color = ACCENT_TWO_COLOR;
                callback({ times, datalist: source });

                await delay();

                if (source[j].value < source[idx].value) {
                    source[idx].color = CLEAR_COLOR;
                    idx = j;
                }

                source[rhs - i].color = PRIMARY_TWO_COLOR;
                source[j].color = CLEAR_COLOR;
                source[idx].color = ACCENT_TWO_COLOR;
                callback({ times, datalist: source });
            }
            
            times = await this.flip(source, start, idx, idx, PRIMARY_TWO_COLOR, SECONDARY_TWO_COLOR, ACCENT_TWO_COLOR, times, callback);
            times = await this.flip(source, start, final + 1, final + 1, PRIMARY_TWO_COLOR, SECONDARY_TWO_COLOR, ACCENT_TWO_COLOR, times, callback);
        }

        await delay();
        await this.complete(source, times, callback);
    }

}