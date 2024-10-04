import { ceil, floor } from "lodash";

import { SortDataModel, SortOption, SortOrder, SortStateModel } from "../ngrx-store/sort.state";

import { delay } from "../../../public/global.utils";
import { CLEAR_COLOR, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, PRIMARY_ONE_COLOR, SECONDARY_ONE_COLOR, ACCENT_ONE_COLOR, PRIMARY_TWO_COLOR, SECONDARY_TWO_COLOR, ACCENT_TWO_COLOR } from "../../../public/global.utils";

import { AbstractDistributionSortAlgorithm, AbstractSelectionSortAlgorithm } from "../pattern/sort-temp.pattern";

/**
 * 选择排序（单向）
 */
export class SelectionSortAlgorithm extends AbstractSelectionSortAlgorithm {

    protected override async sortByAscent(source: SortDataModel[], lhs: number, rhs: number, option: SortOption, callback: (param: SortStateModel) => void): Promise<void> {
        let values: [number, number] = await this.sortByOrder(source, lhs, rhs, 1, 1, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, 'ascent', 0, callback);

        await delay();
        await this.complete(source, values[0], callback);
    }

    protected override async sortByDescent(source: SortDataModel[], lhs: number, rhs: number, option: SortOption, callback: (param: SortStateModel) => void): Promise<void> {
        let values: [number, number] = await this.sortByOrder(source, lhs, rhs, 1, 1, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, 'descent', 0, callback);
        
        await delay();
        await this.complete(source, values[0], callback);
    }

    public async sortByOrder(source: SortDataModel[], lhs: number, rhs: number, innerGap: number, outerGap: number, primaryColor: string, secondaryColor: string, accentColor: string, order: SortOrder, times: number, callback: (param: SortStateModel) => void): Promise<[number, number]> {
        let j: number, count: number = 0;

        if (order === 'ascent') {
            for (let i = lhs; i <= rhs; i += outerGap) {
                [times, j] = await this.selectByAscent(source, i, rhs, innerGap, true, primaryColor, secondaryColor, accentColor, times, callback);
                times = await this.exchange(source, j !== i, i, j, primaryColor, secondaryColor, accentColor, times, callback);

                count = i === j ? count : count + 1;
            }
        }

        if (order === 'descent') {
            for (let i = rhs; i >= lhs; i -= outerGap) {
                [times, j] = await this.selectByDescent(source, lhs, i, innerGap, true, primaryColor, secondaryColor, accentColor, times, callback);
                times = await this.exchange(source, j !== i, i, j, primaryColor, secondaryColor, accentColor, times, callback);

                count = i === j ? count : count + 1;
            }
        }

        return [times, count];
    }

    public override async selectByAscent(source: SortDataModel[], lhs: number, rhs: number, gap: number, flag: boolean, primaryColor: string, secondaryColor: string, accentColor: string, times: number, callback: (param: SortStateModel) => void): Promise<[number, number]> {
        let index: number = flag ? lhs : rhs;

        for (let i = flag ? lhs + gap : rhs - gap; (flag && i <= rhs) || (!flag && i >= lhs); i = flag ? i + gap : i - gap) {
            source[flag ? lhs : rhs].color = primaryColor;
            source[i].color = secondaryColor;
            source[index].color = accentColor;
            callback({ times, datalist: source });

            await delay();

            if ((flag && source[i].value < source[index].value) || (!flag && source[i].value > source[index].value)) {
                source[index].color = CLEAR_COLOR;
                index = i;
            }

            source[flag ? lhs : rhs].color = primaryColor;
            source[i].color = CLEAR_COLOR;
            source[index].color = accentColor;
            callback({ times, datalist: source });
        }

        return [times, index];
    }

    public override async selectByDescent(source: SortDataModel[], lhs: number, rhs: number, gap: number, flag: boolean, primaryColor: string, secondaryColor: string, accentColor: string, times: number, callback: (param: SortStateModel) => void): Promise<[number, number]> {
        let index: number = flag ? rhs : lhs;

        for (let i = flag ? rhs - gap : lhs + gap; (flag && i >= lhs) || (!flag && i <= rhs); i = flag ? i - gap : i + gap) {
            source[flag ? rhs : lhs].color = primaryColor;
            source[i].color = secondaryColor;
            source[index].color = accentColor;
            callback({ times, datalist: source });

            await delay();

            if ((flag && source[i].value < source[index].value) || (!flag && source[i].value > source[index].value)) {
                source[index].color = CLEAR_COLOR;
                index = i;
            }

            source[flag ? rhs : lhs].color = primaryColor;
            source[i].color = CLEAR_COLOR;
            source[index].color = accentColor;
            callback({ times, datalist: source });
        }

        return [times, index];
    }

}

/**
 * 选择排序（双向）
 */

export class ShakerSelectionSortAlgorithm extends SelectionSortAlgorithm {

    protected override async sortByAscent(source: SortDataModel[], lhs: number, rhs: number, option: SortOption, callback: (param: SortStateModel) => void): Promise<void> {
        let idx: number, times: number = 0;

        while (lhs < rhs) {
            [times, idx] = await this.selectByAscent(source, lhs, rhs, 1, true, PRIMARY_ONE_COLOR, SECONDARY_ONE_COLOR, ACCENT_ONE_COLOR, times, callback);
            times = await this.exchange(source, idx !== lhs, lhs, idx, PRIMARY_ONE_COLOR, SECONDARY_ONE_COLOR, ACCENT_ONE_COLOR, times, callback);

            lhs += 1;

            [times, idx] = await this.selectByAscent(source, lhs, rhs, 1, false, PRIMARY_TWO_COLOR, SECONDARY_TWO_COLOR, ACCENT_TWO_COLOR, times, callback);
            times = await this.exchange(source, idx !== rhs, rhs, idx, PRIMARY_TWO_COLOR, SECONDARY_TWO_COLOR, ACCENT_TWO_COLOR, times, callback);

            rhs -= 1;
        }

        await delay();
        await this.complete(source, times, callback);
    }

    protected override async sortByDescent(source: SortDataModel[], lhs: number, rhs: number, option: SortOption, callback: (param: SortStateModel) => void): Promise<void> {
        let idx: number, times: number = 0;
        
        while (lhs < rhs) {
            [times, idx] = await this.selectByDescent(source, lhs, rhs, 1, true, PRIMARY_ONE_COLOR, SECONDARY_ONE_COLOR, ACCENT_ONE_COLOR, times, callback);
            times = await this.exchange(source, idx !== rhs, rhs, idx, PRIMARY_ONE_COLOR, SECONDARY_ONE_COLOR, ACCENT_ONE_COLOR, times, callback);

            rhs -= 1;

            [times, idx] = await this.selectByDescent(source, lhs, rhs, 1, false, PRIMARY_TWO_COLOR, SECONDARY_TWO_COLOR, ACCENT_TWO_COLOR, times, callback);
            times = await this.exchange(source, idx !== lhs, lhs, idx, PRIMARY_TWO_COLOR, SECONDARY_TWO_COLOR, ACCENT_TWO_COLOR, times, callback);

            lhs += 1;
        }

        await delay();
        await this.complete(source, times, callback);
    }

}

/**
 * 二路选择排序
 */
export class DualSelectionSortAlgorithm extends ShakerSelectionSortAlgorithm {

    protected override async sortByAscent(source: SortDataModel[], lhs: number, rhs: number, option: SortOption, callback: (param: SortStateModel) => void): Promise<void> {
        let min: number, max: number, flag: boolean = true, times: number = 0;
        
        while (lhs < rhs) {
            min = lhs;
            max = rhs;
            
            for (let i = min + 1, j = max - 1; i <= rhs && j >= lhs; i++, j--) {
                source[lhs].color = PRIMARY_ONE_COLOR;
                source[i].color = SECONDARY_ONE_COLOR;
                source[min].color = ACCENT_ONE_COLOR;
                source[rhs].color = PRIMARY_TWO_COLOR;
                source[j].color = SECONDARY_TWO_COLOR;
                source[max].color = ACCENT_TWO_COLOR;
                callback({ times, datalist: source });

                await delay();

                if (source[i].value < source[min].value) {
                    source[min].color = CLEAR_COLOR;
                    min = i;
                }

                if (source[j].value > source[max].value) {
                    source[max].color = CLEAR_COLOR;
                    max = j;
                }

                source[lhs].color = PRIMARY_ONE_COLOR;
                source[i].color = CLEAR_COLOR;
                source[min].color = ACCENT_ONE_COLOR;
                source[rhs].color = PRIMARY_TWO_COLOR;
                source[j].color = CLEAR_COLOR;
                source[max].color = ACCENT_TWO_COLOR;
                callback({ times, datalist: source });
            }

            times = await this.exchange(source, min !== lhs, lhs, min, PRIMARY_ONE_COLOR, SECONDARY_ONE_COLOR, ACCENT_ONE_COLOR, times, callback);
            times = await this.exchange(source, max !== rhs, rhs, max, PRIMARY_TWO_COLOR, SECONDARY_TWO_COLOR, ACCENT_TWO_COLOR, times, callback);

            flag ? lhs++ : rhs--;
            flag = !flag;
        }

        await delay();
        await this.complete(source, times, callback);
    }

    protected override async sortByDescent(source: SortDataModel[], lhs: number, rhs: number, option: SortOption, callback: (param: SortStateModel) => void): Promise<void> {
        let min: number, max: number, flag: boolean = true, times: number = 0;
        
        while (lhs < rhs) {
            min = rhs;
            max = lhs;
            
            for (let i = min - 1, j = max + 1; i >= lhs && j <= rhs; i--, j++) {
                source[rhs].color = PRIMARY_ONE_COLOR;
                source[i].color = SECONDARY_ONE_COLOR;
                source[min].color = ACCENT_ONE_COLOR;
                source[lhs].color = PRIMARY_TWO_COLOR;
                source[j].color = SECONDARY_TWO_COLOR;
                source[max].color = ACCENT_TWO_COLOR;
                callback({ times, datalist: source });

                await delay();

                if (source[i].value < source[min].value) {
                    source[min].color = CLEAR_COLOR;
                    min = i;
                }

                if (source[j].value > source[max].value) {
                    source[max].color = CLEAR_COLOR;
                    max = j;
                }

                source[rhs].color = PRIMARY_ONE_COLOR;
                source[i].color = CLEAR_COLOR;
                source[min].color = ACCENT_ONE_COLOR;
                source[lhs].color = PRIMARY_TWO_COLOR;
                source[j].color = CLEAR_COLOR;
                source[max].color = ACCENT_TWO_COLOR;
                callback({ times, datalist: source });
            }

            times = await this.exchange(source, min !== rhs, rhs, min, PRIMARY_ONE_COLOR, SECONDARY_ONE_COLOR, ACCENT_ONE_COLOR, times, callback);
            times = await this.exchange(source, max !== lhs, lhs, max, PRIMARY_TWO_COLOR, SECONDARY_TWO_COLOR, ACCENT_TWO_COLOR, times, callback);

            flag ? rhs-- : lhs++;
            flag = !flag;
        }

        await delay();
        await this.complete(source, times, callback);
    }

}

/**
 * 堆排序
 */
export class HeapSortAlgorithm extends SelectionSortAlgorithm {

    protected override async sortByAscent(source: SortDataModel[], lhs: number, rhs: number, option: SortOption, callback: (param: SortStateModel) => void): Promise<void> {
        let values: [number, number] = await this.sortByOrder(source, lhs, rhs, -1, -1, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, 'ascent', 0, callback);

        await delay();
        await this.complete(source, values[0], callback);
    }

    protected override async sortByDescent(source: SortDataModel[], lhs: number, rhs: number, option: SortOption, callback: (param: SortStateModel) => void): Promise<void> {
        let values: [number, number] = await this.sortByOrder(source, lhs, rhs, -1, -1, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, 'descent', 0, callback);

        await delay();
        await this.complete(source, values[0], callback);
    }

    public override async sortByOrder(source: SortDataModel[], lhs: number, rhs: number, innerGap: number, outerGap: number, primaryColor: string, secondaryColor: string, accentColor: string, order: SortOrder, times: number, callback: (param: SortStateModel) => void): Promise<[number, number]> {
        let idx: number = floor((rhs - lhs) * 0.5 + lhs), length: number= rhs - lhs + 1;

        if (order === 'ascent') {
            for (let i = idx; i >= lhs; i--) {
                times = await this.heapifyByOrder(source, i, rhs, lhs, length, 'ascent', times, callback);
            }
    
            for (let i = rhs; i >= lhs; i--) {
                times = await this.exchange(source, true, i, lhs, primaryColor, secondaryColor, accentColor, times, callback);
                times = await this.heapifyByOrder(source, lhs, i, lhs, length, 'ascent', times, callback);
            }
        }
        
        if (order === 'descent') {
            for (let i = idx; i <= rhs; i++) {
                times = await this.heapifyByOrder(source, i, lhs, lhs, length, 'descent', times, callback);
            }
    
            for (let i = lhs; i <= rhs; i++) {
                times = await this.exchange(source, true, i, rhs, primaryColor, secondaryColor, accentColor, times, callback);
                times = await this.heapifyByOrder(source, rhs, i, lhs, length, 'descent', times, callback);
            }
        }

        return [times, -1];
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

            times = await this.exchange(source, true, pnode, index, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, times, callback);

            pnode = index;
        }

        return times;
    }

}

/**
 * 堆排序（多节点）
 */
export class TernaryHeapSortAlgorithm extends HeapSortAlgorithm {

    protected override async sortByAscent(source: SortDataModel[], lhs: number, rhs: number, option: SortOption, callback: (param: SortStateModel) => void): Promise<void> {
        let times: number = 0;

        for (let i = floor((rhs - lhs + 1) / option.heapNode, 0); i >= lhs; i--) {
            times = await this.heapifyByAscent(source, rhs, i, option.heapNode, times, callback);
        }

        for (let i = rhs; i >= lhs; i--) {
            times = await this.exchange(source, true, i, lhs, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, times, callback);
            times = await this.heapifyByAscent(source, i, lhs, option.heapNode, times, callback);
        }     

        await delay();
        await this.complete(source, times, callback);
    }

    protected override async sortByDescent(source: SortDataModel[], lhs: number, rhs: number, option: SortOption, callback: (param: SortStateModel) => void): Promise<void> {
        let times: number= 0;

        for (let i = floor((rhs - lhs + 1) / option.heapNode, 0); i <= rhs; i++) {
            times = await this.heapifyByDescent(source, lhs, i, option.heapNode, times, callback);
        }

        for (let i = lhs; i <= rhs; i++) {
            times = await this.exchange(source, true, i, rhs, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, times, callback);
            times = await this.heapifyByDescent(source, i, rhs, option.heapNode, times, callback);
        }

        await delay();
        await this.complete(source, times, callback);
    }

    protected async heapifyByAscent(source: SortDataModel[], threshold: number, root: number, nodes: number, times: number, callback: (param: SortStateModel) => void): Promise<number> {
        let pivot: number, index: number = 0, value: number;

        while (true) {
            for (let i = 0; i < nodes; i++) {
                this.array[i] = root * nodes + i + 1;
            }

            pivot = root;
            value = Number.MIN_SAFE_INTEGER;

            for (let i = 0; i < nodes; i++) {
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

            times = await this.exchange(source, true, root, pivot, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, times, callback);

            root = pivot;
        }

        return times;
    }

    protected async heapifyByDescent(source: SortDataModel[], threshold: number, root: number, nodes: number, times: number, callback: (param: SortStateModel) => void): Promise<number> {
        const size: number = source.length;
        let pivot: number, index: number = 0, value: number, k: number;
        
        while (true) {
            for (let i = 0; i < nodes; i++) {
                k = size - root - 1;
                this.array[i] = root - nodes * k + k - i - 1;
            }
            
            pivot = root;
            value = Number.MIN_SAFE_INTEGER;

            for (let i = 0; i < nodes; i++) {
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

            times = await this.exchange(source, true, root, pivot, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, times, callback);

            root = pivot;
        }

        return times;
    }

}

/**
 * 平滑排序
 */
export class SmoothSortAlgorithm extends HeapSortAlgorithm {

    protected override array: number[] = new Array(64).fill(1);

    private readonly LEONADO_NUMBERS: number[] = [
        1, 1, 3, 5, 9, 15, 25, 41, 67, 109,
        177, 287, 465, 753, 1219, 1973, 3193, 5167, 8361, 13529
    ];

    protected override async sortByAscent(source: SortDataModel[], lhs: number, rhs: number, option: SortOption, callback: (param: SortStateModel) => void): Promise<void> {
        let index: number = 0, times: number = 0;

        for (let i = lhs + 1; i <= rhs; i++) {
            if (index > 0 && this.array[index - 1] - this.array[index] === 1) {
                index -= 1;
                this.array[index] += 1;
            } else {
                if (this.array[index] !== 1) {
                    index += 1;
                    this.array[index] = 1;
                } else {
                    index += 1;
                    this.array[index] = 0;
                }
            }

            times = await this.buildByAscent(source, i, index, times, callback);
        }

        for (let i = rhs - 1; i > lhs; i--) {
            if (this.array[index] <= 1) {
                index -= 1;
            } else {
                this.array[index] -= 1;
                this.array[index + 1] = this.array[index] - 1;
                index += 1;

                times = await this.buildByAscent(source, i - this.leonardo(this.array[index]), index - 1, times, callback);
                times = await this.buildByAscent(source, i, index, times, callback);
            }
        }

        this.array.fill(1);

        await delay();
        await this.complete(source, times, callback);
    }

    protected override async sortByDescent(source: SortDataModel[], lhs: number, rhs: number, option: SortOption, callback: (param: SortStateModel) => void): Promise<void> {
        let index: number = 0, times: number = 0;

        for (let i = rhs - 1; i >= lhs; i--) {
            if (index > 0 && this.array[index - 1] - this.array[index] === 1) {
                index -= 1;
                this.array[index] += 1;
            } else {
                if (this.array[index] !== 1) {
                    index += 1;
                    this.array[index] = 1;
                } else {
                    index += 1;
                    this.array[index] = 0;
                }
            }
            

            times = await this.buildByDescent(source, i, index, times, callback);
        }

        for (let i = lhs + 1; i < rhs; i++) {
            if (this.array[index] <= 1) {
                index -= 1;
            } else {
                this.array[index] -= 1;
                this.array[index + 1] = this.array[index] - 1;
                index += 1;

                times = await this.buildByDescent(source, i + this.leonardo(this.array[index]), index - 1, times, callback);
                times = await this.buildByDescent(source, i, index, times, callback);
            }
        }

        this.array.fill(1);

        await delay();
        await this.complete(source, times, callback);
        this.array.splice(0);
    }

    private async buildByAscent(source: SortDataModel[], i: number, index: number, times: number, callback: (param: SortStateModel) => void): Promise<number> {
        let root: number, left: number, right: number, level: number;

        while (index > 0) {
            level = this.array[index];
            root = i - this.LEONADO_NUMBERS[level];

            if (source[i].value > source[root].value) break;

            if (level > 1) {
                left = i - 1 - this.LEONADO_NUMBERS[level - 2];
                right = i - 1;

                if (source[root].value < source[left].value || source[root].value < source[right].value) break;
            }

            times = await this.exchange(source, true, i, root, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, times, callback);

            i = root;

            index -= 1;
        }

        return await this.siftByAscent(source, i, this.array[index], times, callback);
    }

    private async buildByDescent(source: SortDataModel[], i: number, index: number, times: number, callback: (param: SortStateModel) => void): Promise<number> {
        let root: number, left: number, right: number, level: number;

        while (index > 0) {
            level = this.array[index];
            root = i + this.LEONADO_NUMBERS[level];

            if (source[i].value > source[root].value) break;

            if (level > 1) {
                left = i + 1;
                right = i + 1 + this.LEONADO_NUMBERS[level - 2];

                if (source[root].value < source[left].value || source[root].value < source[right].value) break;
            }

            times = await this.exchange(source, true, i, root, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, times, callback);

            i = root;

            index -= 1;
        }

        return await this.siftByDescent(source, i, this.array[index], times, callback);
    }

    private async siftByAscent(source: SortDataModel[], root: number, level: number, times: number, callback: (param: SortStateModel) => void): Promise<number> {
        let left: number, right: number, pivot: number;

        while (level > 1) {
            left = root - 1 - this.LEONADO_NUMBERS[level - 2];
            right = root - 1;
            pivot = root;

            if (source[pivot].value < source[left].value) pivot = left;

            if (source[pivot].value < source[right].value) pivot = right;

            if (pivot === root) break;

            times = await this.exchange(source, true, root, pivot, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, times, callback);

            root = pivot;
            level = pivot === left ? level - 1 : level - 2;
        }

        return times;
    }

    private async siftByDescent(source: SortDataModel[], root: number, level: number, times: number, callback: (param: SortStateModel) => void): Promise<number> {
        let left: number, right: number, pivot: number;

        while (level > 1) {
            left = root + 1;
            right = root + 1 + this.LEONADO_NUMBERS[level - 2];
            pivot = root;

            if (source[pivot].value < source[left].value) pivot = left;

            if (source[pivot].value < source[right].value) pivot = right;

            if (pivot === root) break;

            times = await this.exchange(source, true, root, pivot, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, times, callback);

            root = pivot;
            level = pivot === right ? level - 1 : level - 2;
        }

        return times;
    }

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
export class TournamentSortAlgorithm extends AbstractDistributionSortAlgorithm<Node> {
    
    private depth: number = -1;

    protected override async sortByAscent(source: SortDataModel[], lhs: number, rhs: number, option: SortOption, callback: (param: SortStateModel) => void): Promise<void> {
        let times: number = 0;

        this.depth = ceil(Math.log2(rhs - lhs + 1) + 1, 0);

        times = await this.saveByOrder(source, lhs, rhs, 'ascent', times, callback);
        times = await this.loadByOrder(source, lhs, rhs, 'ascent', times, callback);

        this.freeKeyValues(this.cacheOfKeyValues);

        await delay();
        await this.complete(source, times, callback);
    }

    protected override async sortByDescent(source: SortDataModel[], lhs: number, rhs: number, option: SortOption, callback: (param: SortStateModel) => void): Promise<void> {
        let times: number = 0;

        this.depth = ceil(Math.log2(rhs - lhs + 1) + 1, 0);

        times = await this.saveByOrder(source, lhs, rhs, 'descent', times, callback);
        times = await this.loadByOrder(source, lhs, rhs, 'descent', times, callback);

        this.freeKeyValues(this.cacheOfKeyValues);

        await delay();
        await this.complete(source, times, callback);
    }

    protected override async saveByOrder(source: SortDataModel[], lhs: number, rhs: number, order: SortOrder, times: number, callback: (param: SortStateModel) => void): Promise<number> {
        let node: Node, parent: number, k: number = -1;

        for (let i = this.depth - 1; i >= 0; i--) {
            this.cacheOfKeyValues[i] = Array.from([]);

            if (i === this.depth - 1) {
                for (let j = lhs; j <= rhs; j++) {
                    if (order === 'ascent') k = lhs + j;

                    if (order === 'descent') k = rhs - j;

                    this.cacheOfKeyValues[i].push({ index: j, value: source[k].value });

                    times = await this.sweep(source, k, ACCENT_ONE_COLOR, times, callback);
                    times += 1;
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

    protected override async loadByOrder(source: SortDataModel[], lhs: number, rhs: number, order: SortOrder, times: number, callback: (param: SortStateModel) => void): Promise<number> {
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

            times = await this.sweep(source, pivot, ACCENT_TWO_COLOR, times, callback);
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
 * 煎饼排序（单向）
 */
export class PancakeSortAlgorithm extends SelectionSortAlgorithm {

    protected override async sortByAscent(source: SortDataModel[], lhs: number, rhs: number, option: SortOption, callback: (param: SortStateModel) => void): Promise<void> {
        let idx: number, times: number = 0;

        for (let i = rhs; i >= lhs; i--) {
            [times, idx] = await this.selectByAscent(source, lhs, i, 1, false, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, times, callback);
            times = await this.flip(source, lhs, idx, idx, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, times, callback);
            times = await this.flip(source, lhs, i, i, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, times, callback);
        }

        await delay();
        await this.complete(source, times, callback);
    }

    protected override async sortByDescent(source: SortDataModel[], lhs: number, rhs: number, option: SortOption, callback: (param: SortStateModel) => void): Promise<void> {
        let idx: number, times: number = 0;

        for (let i = lhs; i <= rhs; i++) {
            [times, idx] = await this.selectByDescent(source, i, rhs, 1, false, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, times, callback);
            times = await this.flip(source, idx, rhs, idx, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, times, callback);
            times = await this.flip(source, i, rhs, i, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, times, callback);
        }

        await delay();
        await this.complete(source, times, callback);
    }

    protected async flip(source: SortDataModel[], lhs: number, rhs: number, idx: number, primaryColor: string, secondaryColor: string, accentColor: string, times: number, callback: (param: SortStateModel) => void): Promise<number> {
        for (let i = lhs, j = rhs; i <= j; i++, j--) {
            source[idx].color = accentColor;
            callback({ times, datalist: source });

            times = await this.exchange(source, true, i, j, primaryColor, secondaryColor, accentColor, times, callback);
        }

        return await this.sweep(source, idx, accentColor, times, callback);
    }

}

/**
 * 煎饼排序（双向）
 */
export class ShakerPancakeSortAlgorithm extends PancakeSortAlgorithm {

    protected override async sortByAscent(source: SortDataModel[], lhs: number, rhs: number, option: SortOption, callback: (param: SortStateModel) => void): Promise<void> {
        let idx: number, times: number = 0;

        while (lhs < rhs) {
            [times, idx] = await this.selectByAscent(source, lhs, rhs, 1, false, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, times, callback);
            times = await this.flip(source, lhs, idx, idx, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, times, callback);
            times = await this.flip(source, lhs, rhs, rhs, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, times, callback);

            rhs -= 1;

            [times, idx] = await this.selectByAscent(source, lhs, rhs, 1, true, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, times, callback);
            times = await this.flip(source, idx, rhs, idx, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, times, callback);
            times = await this.flip(source, lhs, rhs, lhs, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, times, callback);

            lhs += 1;
        }

        await delay();
        await this.complete(source, times, callback);
    }

    protected override async sortByDescent(source: SortDataModel[], lhs: number, rhs: number, option: SortOption, callback: (param: SortStateModel) => void): Promise<void> {
        let idx: number, times: number = 0;

        while (lhs < rhs) {
            [times, idx] = await this.selectByDescent(source, lhs, rhs, 1, false, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, times, callback);
            times = await this.flip(source, idx, rhs, idx, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, times, callback);
            times = await this.flip(source, lhs, rhs, lhs, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, times, callback);

            lhs += 1;

            [times, idx] = await this.selectByDescent(source, lhs, rhs, 1, true, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, times, callback);
            times = await this.flip(source, lhs, idx, idx, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, times, callback);
            times = await this.flip(source, lhs, rhs, rhs, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, times, callback);

            rhs -= 1;
        }

        await delay();
        await this.complete(source, times, callback);
    }

}