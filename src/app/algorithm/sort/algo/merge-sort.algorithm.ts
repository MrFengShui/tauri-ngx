import { floor } from "lodash";

import { ACCENT_ONE_COLOR, ACCENT_TWO_COLOR, delay, PLACE_FST_COLOR, PLACE_FTH_COLOR, PLACE_SND_COLOR, PLACE_TRD_COLOR } from "../../../public/global.utils";
import { ACCENT_COLOR, PRIMARY_COLOR, SECONDARY_COLOR } from "../../../public/global.utils";

import { SortDataModel, SortStateModel, SortOrder, SortIndexRange, SortOption } from "../ngrx-store/sort.state";

import { AbstractMergeSortAlgorithm } from "../pattern/sort-temp.pattern";
import { SortToolsService } from "../ngrx-store/sort.service";
import { InsertionSortAlgorithm } from "./insertion-sort.algorithm";
import { CombSortAlgorithm, ShakerBubbleSortAlgorithm } from "./exchange-sort.algorithm";

/**
 * 归并排序（递归）
 */
export class RecursiveMergeSortAlgorithm extends AbstractMergeSortAlgorithm {

    protected insertSort: InsertionSortAlgorithm | null = null;

    constructor(protected override _service: SortToolsService) {
        super(_service);

        if (this.insertSort === null) this.insertSort = new InsertionSortAlgorithm(_service);
    }

    protected override async sortByAscent(source: SortDataModel[], lhs: number, rhs: number, option: SortOption, callback: (param: SortStateModel) => void): Promise<void> {
        let times: number = await this.sortByOrder(source, lhs, rhs, 'ascent', 0, callback);

        await delay();
        await this.complete(source, times, callback);
    }

    protected override async sortByDescent(source: SortDataModel[], lhs: number, rhs: number, option: SortOption, callback: (param: SortStateModel) => void): Promise<void> {
        let times: number = await this.sortByOrder(source, lhs, rhs, 'descent', 0, callback);

        await delay();
        await this.complete(source, times, callback);
    }

    protected override async sortByOrder(source: SortDataModel[], lhs: number, rhs: number, order: SortOrder, times: number, callback: (param: SortStateModel) => void): Promise<number> {
        if (lhs < rhs) {
            let mid: number = floor((rhs - lhs) * 0.5, 0);
            
            if (order === 'ascent') {
                mid = lhs + mid;
                times = await this.sortByOrder(source, lhs, mid, order, times, callback);
                times = await this.sortByOrder(source, mid + 1, rhs, order, times, callback);
                times = await this.mergeByAscent(source, lhs, mid, rhs, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, times, callback);
            }
            
            if (order === 'descent') {
                mid = rhs - mid;
                times = await this.sortByOrder(source, mid, rhs, order, times, callback);
                times = await this.sortByOrder(source, lhs, mid - 1, order, times, callback);
                times = await this.mergeByDescent(source, lhs, mid, rhs, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, times, callback);
            }
        }

        return times;
    }

    public override async mergeByAscent(source: SortDataModel[], lhs: number, mid: number, rhs: number, primaryColor: string, secondaryColor: string, accentColor: string, times: number, callback: (param: SortStateModel) => void): Promise<number> {
        let i: number = lhs, j: number = mid + 1;
        
        while (i <= mid && j <= rhs) {
            times = await this.dualSweep(source, i, j, primaryColor, secondaryColor, times, callback);
            times += 1;

            if (source[i].value < source[j].value) {
                this.array.push(source[i].value);
                i += 1;
            } else {
                this.array.push(source[j].value);
                j += 1;
            }
        }

        while (i <= mid) {
            times = await this.sweep(source, i, primaryColor, times, callback);
            times += 1;

            this.array.push(source[i].value);

            i += 1;
        }

        while (j <= rhs) {
            times = await this.sweep(source, j,  secondaryColor, times, callback);
            times += 1;

            this.array.push(source[j].value);

            j += 1;
        }

        for (let k = lhs; this.array.length > 0; k++) {
            source[k].value = this.array.shift() as number;

            times = await this.sweep(source, k, accentColor, times, callback);
            times += 1;
        }

        return times;
    }

    public override async mergeByDescent(source: SortDataModel[], lhs: number, mid: number, rhs: number, primaryColor: string, secondaryColor: string, accentColor: string, times: number, callback: (param: SortStateModel) => void): Promise<number> {
        let i: number = rhs, j: number = mid - 1;
        
        while (i >= mid && j >= lhs) {
            times = await this.dualSweep(source, i, j, primaryColor, secondaryColor, times, callback);
            times += 1;

            if (source[i].value < source[j].value) {
                this.array.push(source[i].value);
                i -= 1;
            } else {
                this.array.push(source[j].value);
                j -= 1;
            }
        }

        while (i >= mid) {
            times = await this.sweep(source, i, primaryColor, times, callback);
            times += 1;

            this.array.push(source[i].value);

            i -= 1;
        }

        while (j >= lhs) {
            times = await this.sweep(source, j, secondaryColor, times, callback);
            times += 1;

            this.array.push(source[j].value);

            j -= 1;
        }
        
        for (let k = rhs; this.array.length > 0; k--) {
            source[k].value = this.array.shift() as number;

            times = await this.sweep(source, k, accentColor, times, callback);
            times += 1;
        }

        return times;
    }

}

/**
 * 归并排序（迭代）
 */
export class IterativeMergeSortAlgorithm extends RecursiveMergeSortAlgorithm {

    protected override async sortByAscent(source: SortDataModel[], lhs: number, rhs: number, option: SortOption, callback: (param: SortStateModel) => void): Promise<void> {
        let start: number, final: number, split: number, times: number = 0;

        for (let gap = 1, length = rhs - lhs + 1; gap < length; gap = gap + gap) {
            for (let i = lhs; i <= rhs; i += gap + gap) {
                start = i;
                final = Math.min(i + gap + gap - 1, rhs);
                split = Math.max(i + gap - 1, start);

                if (split < final) {
                    times = await this.mergeByAscent(source, start, split, final, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, times, callback);
                }
            }
        }

        await delay();
        await this.complete(source, times, callback);
    }

    protected override async sortByDescent(source: SortDataModel[], lhs: number, rhs: number, option: SortOption, callback: (param: SortStateModel) => void): Promise<void> {
        let start: number, final: number, split: number, times: number = 0;

        for (let gap = 1, length = rhs - lhs + 1; gap < length; gap = gap + gap) {
            for (let i = rhs; i >= lhs; i -= gap + gap) {
                final = i;
                start = Math.max(i - gap - gap + 1, lhs);
                split = i - gap + 1;
                
                if (split > start) {
                    times = await this.mergeByDescent(source, start, split, final, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, times, callback);
                }
            }
        }

        await delay();
        await this.complete(source, times, callback);
    }

}

/**
 * 原地归并排序（递归）
 */
export class RecursiveInPlaceMergeSortAlgorithm extends RecursiveMergeSortAlgorithm {

    public override async mergeByAscent(source: SortDataModel[], lhs: number, mid: number, rhs: number, primaryColor: string, secondaryColor: string, accentColor: string, times: number, callback: (param: SortStateModel) => void): Promise<number> {
        if (this.insertSort === null) throw new Error(`错误：引用对象${this.insertSort}未被初始化。`);

        for (let i = lhs, j = mid + 1; i < j;) {
            if (source[i].value < source[j].value) {
                times = await this.dualSweep(source, i, j, primaryColor, secondaryColor, times, callback);

                i += 1;
            } else {
                times = await this.insertSort.moveByOrder(source, i, j, primaryColor, secondaryColor, 'ascent', times, callback);

                i += 1;
                j = Math.min(j + 1, rhs);
            }
        }

        return times;
    }

    public override async mergeByDescent(source: SortDataModel[], lhs: number, mid: number, rhs: number, primaryColor: string, secondaryColor: string, accentColor: string, times: number, callback: (param: SortStateModel) => void): Promise<number> {
        if (this.insertSort === null) throw new Error(`错误：引用对象${this.insertSort}未被初始化。`);

        for (let i = rhs, j = mid - 1; i > j;) {
            if (source[i].value < source[j].value) {
                times = await this.dualSweep(source, i, j, primaryColor, secondaryColor, times, callback);

                i -= 1;
            } else {
                times = await this.insertSort.moveByOrder(source, j, i, primaryColor, secondaryColor, 'descent', times, callback);

                i -= 1;
                j = Math.max(j - 1, lhs);
            }
        }

        return times;
    }

}

/**
 * 原地归并排序（迭代）
 */
export class IterativeInPlaceMergeSortAlgorithm extends RecursiveInPlaceMergeSortAlgorithm {

    protected override async sortByAscent(source: SortDataModel[], lhs: number, rhs: number, option: SortOption, callback: (param: SortStateModel) => void): Promise<void> {
        let start: number, final: number, split: number, times: number = 0;
        
        for (let gap = 1, length = rhs - lhs + 1; gap < length; gap = gap + gap) {
            for (let i = lhs; i <= rhs; i += gap + gap) {
                start = i;
                final = Math.min(i + gap + gap - 1, rhs);
                split = Math.max(i + gap - 1, start);

                if (split < final) {
                    times = await this.mergeByAscent(source, start, split, final, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, times, callback);
                }
            }
        }

        await delay();
        await this.complete(source, times, callback);
    }

    protected override async sortByDescent(source: SortDataModel[], lhs: number, rhs: number, option: SortOption, callback: (param: SortStateModel) => void): Promise<void> {
        let start: number, final: number, split: number, times: number = 0;
        
        for (let gap = 1, length = rhs - lhs + 1; gap < length; gap = gap + gap) {
            for (let i = rhs; i >= lhs; i -= gap + gap) {
                final = i;
                start = Math.max(i - gap - gap + 1, lhs);
                split = i - gap + 1;
                
                if (split > start) {
                    times = await this.mergeByDescent(source, start, split, final, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, times, callback);
                }
            }
        }

        await delay();
        await this.complete(source, times, callback);
    }

}

/**
 * 穿插排序
 */
export class RecursiveWeaveMergeSortAlgorithm extends RecursiveMergeSortAlgorithm {

    public override async mergeByAscent(source: SortDataModel[], lhs: number, mid: number, rhs: number, primaryColor: string, secondaryColor: string, accentColor: string, times: number, callback: (param: SortStateModel) => void): Promise<number> {
        if (this.insertSort === null) throw new Error(`错误：引用对象${this.insertSort}未被初始化。`);

        times = await this.weaveByAscent(source, lhs, mid, rhs, primaryColor, secondaryColor, times, callback);

        for (let i = lhs; this.array.length > 0; i++) {
            source[i].value = this.array.shift() as number;

            times = await this.sweep(source, i, accentColor, times, callback);
            times += 1;
        }

        [times] = await this.insertSort.sortByOrder(source, lhs, rhs, 1, 1, primaryColor, secondaryColor, accentColor, 'ascent', times, callback);
        return times;
    }

    public override async mergeByDescent(source: SortDataModel[], lhs: number, mid: number, rhs: number, primaryColor: string, secondaryColor: string, accentColor: string, times: number, callback: (param: SortStateModel) => void): Promise<number> {
        if (this.insertSort === null) throw new Error(`错误：引用对象${this.insertSort}未被初始化。`);

        times = await this.weaveByDescent(source, lhs, mid, rhs, primaryColor, secondaryColor, times, callback);

        for (let i = rhs; this.array.length > 0; i--) {
            source[i].value = this.array.shift() as number;

            times = await this.sweep(source, i, accentColor, times, callback);
            times += 1;
        }

        [times] =  await this.insertSort.sortByOrder(source, lhs, rhs, 1, 1, primaryColor, secondaryColor, accentColor, 'descent', times, callback);
        return times;
    }

    protected async weaveByAscent(source: SortDataModel[], lhs: number, mid: number, rhs: number, primaryColor: string, secondaryColor: string, times: number, callback: (param: SortStateModel) => void): Promise<number> {
        let i: number = lhs, j: number = mid + 1;

        while (i <= mid && j <= rhs) {
            times = await this.dualSweep(source, i, j, primaryColor, secondaryColor, times, callback);
            times += 1;

            if (source[i].value < source[j].value) {
                this.array.push(source[i].value, source[j].value);
                i += 1;
                j += 1;
            } else {
                this.array.push(source[j].value, source[i].value);
                j += 1;
                i += 1;
            }
        }

        while (i <= mid) {
            times = await this.sweep(source, i, primaryColor, times, callback);
            times += 1;

            this.array.push(source[i].value);
            i += 1;
        }

        while (j <= rhs) {
            times = await this.sweep(source, j, secondaryColor, times, callback);
            times += 1;

            this.array.push(source[j].value);
            j += 1;
        }

        return times;
    }

    protected async weaveByDescent(source: SortDataModel[], lhs: number, mid: number, rhs: number, primaryColor: string, secondaryColor: string, times: number, callback: (param: SortStateModel) => void): Promise<number> {
        let i: number = rhs, j: number = mid - 1;

        while (i >= mid && j >= lhs) {
            times = await this.dualSweep(source, i, j, primaryColor, secondaryColor, times, callback);
            times += 1;

            if (source[i].value < source[j].value) {
                this.array.push(source[i].value, source[j].value);
                i -= 1;
                j -= 1;
            } else {
                this.array.push(source[j].value, source[i].value);
                j -= 1;
                i -= 1;
            }
        }

        while (i >= mid) {
            times = await this.sweep(source, i, primaryColor, times, callback);
            times += 1;

            this.array.push(source[i].value);
            i -= 1;
        }

        while (j >= lhs) {
            times = await this.sweep(source, j, secondaryColor, times, callback);
            times += 1;

            this.array.push(source[j].value);
            j -= 1;
        }

        return times;
    }

}

/**
 * 穿插排序（迭代）
 */
export class IterativeWeaveMergeSortAlgorithm extends RecursiveWeaveMergeSortAlgorithm {

    protected override async sortByAscent(source: SortDataModel[], lhs: number, rhs: number, option: SortOption, callback: (param: SortStateModel) => void): Promise<void> {
        let start: number, final: number, split: number, times: number = 0;

        for (let gap = 1, length = rhs - lhs + 1; gap < length; gap = gap + gap) {
            for (let i = lhs; i <= rhs; i += gap + gap) {
                start = i;
                final = Math.min(i + gap + gap - 1, rhs);
                split = Math.max(i + gap - 1, start);

                if (split < final) {
                    times = await this.mergeByAscent(source, start, split, final, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, times, callback);
                }
            }
        }

        await delay();
        await this.complete(source, times, callback);
    }

    protected override async sortByDescent(source: SortDataModel[], lhs: number, rhs: number, option: SortOption, callback: (param: SortStateModel) => void): Promise<void> {
        let start: number, final: number, split: number, times: number = 0;

        for (let gap = 1, length = rhs - lhs + 1; gap < length; gap = gap + gap) {
            for (let i = rhs; i >= lhs; i -= gap + gap) {
                final = i;
                start = Math.max(i - gap - gap + 1, lhs);
                split = i - gap + 1;
                
                if (split > start) {
                    times = await this.mergeByDescent(source, start, split, final, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, times, callback);
                }
            }
        }

        await delay();
        await this.complete(source, times, callback);
    }

}

/**
 * 原地穿插排序（递归）
 */
export class RecursiveInPlaceWeaveMergeSortAlgorithm extends RecursiveWeaveMergeSortAlgorithm {

    public override async mergeByAscent(source: SortDataModel[], lhs: number, mid: number, rhs: number, primaryColor: string, secondaryColor: string, accentColor: string, times: number, callback: (param: SortStateModel) => void): Promise<number> {
        if (this.insertSort === null) throw new Error(`错误：引用对象${this.insertSort}未被初始化。`);

        let k: number;

        for (let i = lhs, j = mid + 1; i < j; i += 2, j = Math.min(j + 1, rhs)) {
            k = source[i].value < source[j].value ? Math.min(i + 1, rhs) : i;

            times = await this.insertSort.moveByOrder(source, k, j, primaryColor, secondaryColor, 'ascent', times, callback);
        }

        [times] = await this.insertSort.sortByOrder(source, lhs, rhs, 1, 1, primaryColor, secondaryColor, accentColor, 'ascent', times, callback);
        return times;
    }

    public override async mergeByDescent(source: SortDataModel[], lhs: number, mid: number, rhs: number, primaryColor: string, secondaryColor: string, accentColor: string, times: number, callback: (param: SortStateModel) => void): Promise<number> {
        if (this.insertSort === null) throw new Error(`错误：引用对象${this.insertSort}未被初始化。`);

        let k: number;

        for (let i = rhs, j = mid - 1; i > j; i -= 2, j = Math.max(j - 1, lhs)) {
            k = source[i].value < source[j].value ? Math.max(i - 1, lhs) : i;

            times = await this.insertSort.moveByOrder(source, j, k, primaryColor, secondaryColor, 'descent', times, callback);
        }

        [times] = await this.insertSort.sortByOrder(source, lhs, rhs, 1, 1, primaryColor, secondaryColor, accentColor, 'descent', times, callback);
        return times;
    }

}

/**
 * 原地穿插排序（迭代）
 */
export class IterativeInPlaceWeaveMergeSortAlgorithm extends RecursiveInPlaceWeaveMergeSortAlgorithm {

    protected override async sortByAscent(source: SortDataModel[], lhs: number, rhs: number, option: SortOption, callback: (param: SortStateModel) => void): Promise<void> {
        let start: number, final: number, split: number, times: number = 0;

        for (let gap = 1, length = rhs - lhs + 1; gap < length; gap = gap + gap) {
            for (let i = lhs; i <= rhs; i += gap + gap) {
                start = i;
                final = Math.min(i + gap + gap - 1, rhs);
                split = Math.max(i + gap - 1, start);

                if (split < final) {
                    times = await this.mergeByAscent(source, start, split, final, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, times, callback);
                }
            }
        }

        await delay();
        await this.complete(source, times, callback);
    }

    protected override async sortByDescent(source: SortDataModel[], lhs: number, rhs: number, option: SortOption, callback: (param: SortStateModel) => void): Promise<void> {
        let start: number, final: number, split: number, times: number = 0;

        for (let gap = 1, length = rhs - lhs + 1; gap < length; gap = gap + gap) {
            for (let i = rhs; i >= lhs; i -= gap + gap) {
                final = i;
                start = Math.max(i - gap - gap + 1, lhs);
                split = i - gap + 1;
                
                if (split > start) {
                    times = await this.mergeByDescent(source, start, split, final, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, times, callback);
                }
            }
        }

        await delay();
        await this.complete(source, times, callback);
    }

}

/**
 * 多路归并排序
 */
export class MultiWayMergeSortAlgorithm extends RecursiveMergeSortAlgorithm {

    private points: number[] = Array.from([]);
    private values: number[] = Array.from([]);
    private count: number = 0;

    protected override async sortByAscent(source: SortDataModel[], lhs: number, rhs: number, option: SortOption, callback: (param: SortStateModel) => void): Promise<void> {
        this.count = option.mergeWay;
        await super.sortByAscent(source, lhs, rhs, option, callback);
    }

    protected override async sortByDescent(source: SortDataModel[], lhs: number, rhs: number, option: SortOption, callback: (param: SortStateModel) => void): Promise<void> {
        this.count = option.mergeWay;
        await super.sortByDescent(source, lhs, rhs, option, callback);
    }

    protected override async sortByOrder(source: SortDataModel[], lhs: number, rhs: number, order: SortOrder, times: number, callback: (param: SortStateModel) => void): Promise<number> {
        if (rhs - lhs + 1 > this.count) {
            let ranges: SortIndexRange[] | null = this.createMergeRange(lhs, rhs);

            if (order === 'ascent') {
                for (let i = 0, length = ranges.length; i <= length - 1; i++) {
                    times = await this.sortByOrder(source, ranges[i].start, ranges[i].final, order, times, callback);
                }
    
                times = await this.mutltiMergeByAscent(source, ranges, times, callback);
            }

            if (order === 'descent') {
                for (let length = ranges.length, i = length - 1; i >= 0; i--) {
                    times = await this.sortByOrder(source, ranges[i].start, ranges[i].final, order, times, callback);
                }

                times = await this.multiMergeByDescent(source, ranges, times, callback);
            }

            ranges.splice(0);
            ranges = null;
        }
        
        return times;
    }

    private async mutltiMergeByAscent(source: SortDataModel[], ranges: SortIndexRange[], times: number, callback: (param: SortStateModel) => void): Promise<number> {
        if (this.insertSort === null) throw new Error(`错误：引用对象${this.insertSort}未被初始化。`);

        let range: SortIndexRange, index: number = Number.NaN, value: number, offset: number = ranges[0].start;
        
        for (let i = 0, length = ranges.length; i <= length - 1; i++) {
            range = ranges[i];

            if (range.final - range.start + 1 <= this.count) {
                [times] = await this.insertSort.sortByOrder(source, range.start, range.final, 1, 1, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, 'ascent', times, callback);
            }

            this.points[i] = range.start;
            this.values[i] = source[range.start].value;
        }
        
        while (!this.values.every(value => value === Number.MAX_SAFE_INTEGER)) {
            value = Number.MAX_SAFE_INTEGER;

            for (let i = 0, length = this.values.length; i < length; i++) {
                if (this.values[i] < value) {
                    index = i;
                    value = this.values[i];
                }
            }

            this.array.push(value);

            this.values[index] = this.points[index] + 1 > ranges[index].final ? Number.MAX_SAFE_INTEGER : source[this.points[index] + 1].value;

            times = await this.multiSweep(source, this.points, [PLACE_FST_COLOR, PLACE_SND_COLOR, PLACE_TRD_COLOR, PLACE_FTH_COLOR], times, callback);
            
            this.points[index] = Math.min(this.points[index] + 1, ranges[index].final);
        }
        
        for (let i = 0, length = this.array.length; i < length; i++) {
            source[offset + i].value = this.array[i];

            times = await this.sweep(source, offset + i, ACCENT_COLOR, times, callback);
            times += 1;
        }
        
        this.points.splice(0);
        this.values.splice(0);
        this.array.splice(0);        
        return times;
    }

    private async multiMergeByDescent(source: SortDataModel[], ranges: SortIndexRange[], times: number, callback: (param: SortStateModel) => void): Promise<number> {
        if (this.insertSort === null) throw new Error(`错误：引用对象${this.insertSort}未被初始化。`);

        let range: SortIndexRange, index: number = Number.NaN, value: number, offset: number = ranges[ranges.length - 1].final;
        
        for (let length = ranges.length, i = length - 1; i >= 0; i--) {
            range = ranges[i];

            if (range.final - range.start + 1 <= this.count) {
                [times] = await this.insertSort.sortByOrder(source, range.start, range.final, 1, 1, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, 'descent', times, callback);
            }

            this.points[i] = range.final;
            this.values[i] = source[range.final].value;
        }
        
        while (!this.values.every(value => value === Number.MAX_SAFE_INTEGER)) {
            value = Number.MAX_SAFE_INTEGER;

            for (let i = 0, length = this.values.length; i < length; i++) {
                if (this.values[i] < value) {
                    index = i;
                    value = this.values[i];
                }
            }

            this.array.push(value);

            this.values[index] = this.points[index] - 1 < ranges[index].start ? Number.MAX_SAFE_INTEGER : source[this.points[index] - 1].value;

            times = await this.multiSweep(source, this.points, [PLACE_FTH_COLOR, PLACE_TRD_COLOR, PLACE_SND_COLOR, PLACE_FST_COLOR], times, callback);
            
            this.points[index] = Math.max(this.points[index] - 1, ranges[index].start);
        }
        
        for (let i = 0, length = this.array.length; i < length; i++) {
            source[offset - i].value = this.array[i];

            times = await this.sweep(source, offset - i, ACCENT_COLOR, times, callback);
            times += 1;
        }
        
        this.points.splice(0);
        this.values.splice(0);
        this.array.splice(0);        
        return times;
    }

    private createMergeRange(lhs: number, rhs: number): SortIndexRange[] {
        const ranges: SortIndexRange[] = Array.from([]), step: number = floor((rhs - lhs + 1) / this.count, 0);
        let start: number = lhs, final: number = rhs;
            
        for (let i = 0; i < this.count; i++) {
            start = i === 0 ? lhs : final + 1;
            final = i === this.count - 1 ? rhs : start + step - 1;
            ranges.push({ start, final });            
        }

        return ranges;
    }

}

/**
 * 蒂姆排序
 */
export class TimSortAlgorithm extends IterativeMergeSortAlgorithm {

    protected override async sortByAscent(source: SortDataModel[], lhs: number, rhs: number, option: SortOption, callback: (param: SortStateModel) => void): Promise<void> {
        if (this.insertSort === null) throw new Error(`错误：引用对象${this.insertSort}未被初始化。`);

        const runLength: number = this.calcRunLength(rhs - lhs + 1);
        let start: number, final: number, times: number = 0;

        for (let i = lhs; i <= rhs; i += runLength) {
            start = i;
            final = Math.min(rhs, i + runLength - 1);
            [times] = await this.insertSort.sortByOrder(source, start, final, 1, 1, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, 'ascent', times, callback);
        }

        times = await this.mergeByOrder(source, lhs, rhs, runLength, 'ascent', times, callback);

        await delay();
        await this.complete(source, times, callback);
    }

    protected override async sortByDescent(source: SortDataModel[], lhs: number, rhs: number, option: SortOption, callback: (param: SortStateModel) => void): Promise<void> {
        if (this.insertSort === null) throw new Error(`错误：引用对象${this.insertSort}未被初始化。`);

        const runLength: number = this.calcRunLength(rhs - lhs + 1);
        let start: number, final: number, times: number = 0;

        for (let i = rhs; i >= lhs; i -= runLength) {
            final = i;
            start = Math.max(lhs, i - runLength + 1);
            [times] = await this.insertSort.sortByOrder(source, start, final, 1, 1, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, 'descent', times, callback);
        }

        times = await this.mergeByOrder(source, lhs, rhs, runLength, 'descent', times, callback);

        await delay();
        await this.complete(source, times, callback);
    }

    protected async mergeByOrder(source: SortDataModel[], lhs: number, rhs: number, runLength: number, order: SortOrder, times: number, callback: (param: SortStateModel) => void): Promise<number> {
        let start: number, split: number, final: number;

        for (let gap = runLength, length = rhs - lhs + 1; gap < length; gap = gap + gap) {
            if (order === 'ascent') {
                for (let i = lhs; i <= rhs; i += gap + gap) {
                    start = i;
                    split = i + gap - 1;
                    final = Math.min(split + gap, rhs);
    
                    if (split < final) {
                        times = await this.mergeByAscent(source, start, split, final, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, times, callback);
                    }
                }
            }
            
            if (order === 'descent') {
                for (let i = rhs; i >= lhs; i -= gap + gap) {
                    final = i;
                    split = i - gap + 1;
                    start = Math.max(split - gap, lhs);
    
                    if (split > start) {
                        times = await this.mergeByDescent(source, start, split, final, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, times, callback);
                    }
                }
            }
        }

        return times;
    }

    protected calcRunLength(length: number): number {
        let runLength: number = length, remainder: number = 0;

        while (runLength > this.THRESHOLD) {
            if (runLength % 2 === 1) {
                remainder = 1;
            }

            runLength = Math.floor(runLength * 0.5);
        }

        return runLength + remainder;
    }

}

export class InPlaceTimSortAlgorithm extends TimSortAlgorithm {

    private mergeSort: RecursiveInPlaceMergeSortAlgorithm | null = null;

    constructor(protected override _service: SortToolsService) {
        super(_service);

        if (this.mergeSort === null) this.mergeSort = new RecursiveInPlaceMergeSortAlgorithm(_service);
    }

    protected override async mergeByOrder(source: SortDataModel[], lhs: number, rhs: number, runLength: number, order: SortOrder, times: number, callback: (param: SortStateModel) => void): Promise<number> {
        if (this.mergeSort === null) throw new Error(`错误：引用对象${this.mergeSort}未被初始化。`);

        let start: number, split: number, final: number;

        for (let gap = runLength, length = rhs - lhs + 1; gap < length; gap = gap + gap) {
            if (order === 'ascent') {
                for (let i = lhs; i <= rhs; i += gap + gap) {
                    start = i;
                    split = i + gap - 1;
                    final = Math.min(split + gap, rhs);
    
                    if (split < final) {
                        times = await this.mergeSort.mergeByAscent(source, start, split, final, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, times, callback);
                    }
                }
            }
            
            if (order === 'descent') {
                for (let i = rhs; i >= lhs; i -= gap + gap) {
                    final = i;
                    split = i - gap + 1;
                    start = Math.max(split - gap, lhs);
    
                    if (split > start) {
                        times = await this.mergeSort.mergeByDescent(source, start, split, final, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, times, callback);
                    }
                }
            }
        }

        return times;
    }

}

/**
 * 蒂姆穿插排序
 */
export class TimWeaveSortAlgorithm extends TimSortAlgorithm {

    protected weaveSort: RecursiveWeaveMergeSortAlgorithm | null = null;

    constructor(protected override _service: SortToolsService) {
        super(_service);

        if (this.weaveSort === null) this.weaveSort = new RecursiveWeaveMergeSortAlgorithm(_service);
    }

    protected override async sortByAscent(source: SortDataModel[], lhs: number, rhs: number, option: SortOption, callback: (param: SortStateModel) => void): Promise<void> {
        if (this.insertSort === null) throw new Error(`错误：引用对象${this.insertSort}未被初始化。`);
        if (this.weaveSort === null) throw new Error(`错误：引用对象${this.weaveSort}未被初始化。`);

        let length = rhs - lhs + 1, runLength: number = this.calcRunLength(length), start: number, final: number, split: number, times: number = 0;

        for (let i = lhs; i <= rhs; i += runLength) {
            start = i;
            final = Math.min(rhs, i + runLength - 1);
            [times] = await this.insertSort.sortByOrder(source, start, final, 1, 1, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, 'ascent', times, callback);
        }

        for (let gap = runLength; gap < length; gap = gap + gap) {
            for (let i = lhs; i <= rhs; i += gap + gap) {
                start = i;
                split = i + gap - 1;
                final = Math.min(split + gap, rhs);

                if (split < final) {
                    times = await this.weaveSort.mergeByAscent(source, start, split, final, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, times, callback);
                }
            }
        }

        await delay();
        await this.complete(source, times, callback);
    }

    protected override async sortByDescent(source: SortDataModel[], lhs: number, rhs: number, option: SortOption, callback: (param: SortStateModel) => void): Promise<void> {
        if (this.insertSort === null) throw new Error(`错误：引用对象${this.insertSort}未被初始化。`);
        if (this.weaveSort === null) throw new Error(`错误：引用对象${this.weaveSort}未被初始化。`);

        let length = rhs - lhs + 1, runLength: number = this.calcRunLength(length), start: number, final: number, split: number, times: number = 0;

        for (let i = rhs; i >= lhs; i -= runLength) {
            final = i;
            start = Math.max(lhs, i - runLength + 1);
            [times] = await this.insertSort.sortByOrder(source, start, final, 1, 1, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, 'descent', times, callback);
        }

        for (let gap = runLength; gap < length; gap = gap + gap) {
            for (let i = rhs; i >= lhs; i -= gap + gap) {
                final = i;
                split = i - gap + 1;
                start = Math.max(split - gap, lhs);

                if (split > start) {
                    times = await this.weaveSort.mergeByDescent(source, start, split, final, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, times, callback);
                }
            }
        }

        await delay();
        await this.complete(source, times, callback);
    }

}

/**
 * 冒泡归并排序（递归）
 */
export class RecursiveBubbleMergeSortAlgorithm extends RecursiveWeaveMergeSortAlgorithm {

    protected shakerBubbleSort: ShakerBubbleSortAlgorithm | null = null;

    constructor(protected override _service: SortToolsService) {
        super(_service);

        if (this.shakerBubbleSort === null) this.shakerBubbleSort = new ShakerBubbleSortAlgorithm(_service);
    }

    public override async mergeByAscent(source: SortDataModel[], lhs: number, mid: number, rhs: number, primaryColor: string, secondaryColor: string, accentColor: string, times: number, callback: (param: SortStateModel) => void): Promise<number> {
        if (this.shakerBubbleSort === null) throw new Error(`错误：引用对象${this.shakerBubbleSort}未被初始化。`);

        times = await this.weaveByAscent(source, lhs, mid, rhs, primaryColor, secondaryColor, times, callback);

        for (let k = lhs; this.array.length > 0; k++) {
            source[k].value = this.array.shift() as number;

            times = await this.sweep(source, k, accentColor, times, callback);
            times += 1;
        }

        return await this.shakerBubbleSort.sortByOrder(source, lhs, rhs, primaryColor, secondaryColor, accentColor, 'ascent', times, callback);
    }

    public override async mergeByDescent(source: SortDataModel[], lhs: number, mid: number, rhs: number, primaryColor: string, secondaryColor: string, accentColor: string, times: number, callback: (param: SortStateModel) => void): Promise<number> {
        if (this.shakerBubbleSort === null) throw new Error(`错误：引用对象${this.shakerBubbleSort}未被初始化。`);

        times = await this.weaveByDescent(source, lhs, mid, rhs, primaryColor, secondaryColor, times, callback);

        for (let k = rhs; this.array.length > 0; k--) {
            source[k].value = this.array.shift() as number;

            times = await this.sweep(source, k, accentColor, times, callback);
            times += 1;
        }

        return await this.shakerBubbleSort.sortByOrder(source, lhs, rhs, primaryColor, secondaryColor, accentColor, 'descent', times, callback);
    }

}

/**
 * 冒泡归并排序（迭代）
 */
export class IterativeBubbleMergeSortAlgorithm extends RecursiveBubbleMergeSortAlgorithm {

    protected override async sortByAscent(source: SortDataModel[], lhs: number, rhs: number, option: SortOption, callback: (param: SortStateModel) => void): Promise<void> {
        let start: number, final: number, split: number, times: number = 0;

        for (let gap = 1, length = rhs - lhs + 1; gap < length; gap = gap + gap) {
            for (let i = lhs; i <= rhs; i += gap + gap) {
                start = i;
                final = Math.min(i + gap + gap - 1, rhs);
                split = Math.max(i + gap - 1, start);

                if (split < final) {
                    times = await this.mergeByAscent(source, start, split, final, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, times, callback);
                }
            }
        }

        await delay();
        await this.complete(source, times, callback);
    }

    protected override async sortByDescent(source: SortDataModel[], lhs: number, rhs: number, option: SortOption, callback: (param: SortStateModel) => void): Promise<void> {
        let start: number, final: number, split: number, times: number = 0;

        for (let gap = 1, length = rhs - lhs + 1; gap < length; gap = gap + gap) {
            for (let i = rhs; i >= lhs; i -= gap + gap) {
                final = i;
                start = Math.max(i - gap - gap + 1, lhs);
                split = i - gap + 1;
                
                if (split > start) {
                    times = await this.mergeByDescent(source, start, split, final, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, times, callback);
                }
            }
        }

        await delay();
        await this.complete(source, times, callback);
    }

}

/**
 * 梳归并排序（递归）
 */
export class RecursiveCombMergeSortAlgorithm extends RecursiveBubbleMergeSortAlgorithm {

    protected combSort: CombSortAlgorithm | null = null;

    constructor(protected override _service: SortToolsService) {
        super(_service);

        if (this.combSort === null) this.combSort = new CombSortAlgorithm(_service);
    }

    public override async mergeByAscent(source: SortDataModel[], lhs: number, mid: number, rhs: number, primaryColor: string, secondaryColor: string, accentColor: string, times: number, callback: (param: SortStateModel) => void): Promise<number> {
        if (this.combSort === null) throw new Error(`错误：引用对象${this.combSort}未被初始化。`);
        if (this.shakerBubbleSort === null) throw new Error(`错误：引用对象${this.shakerBubbleSort}未被初始化。`);

        for (let gap = rhs - lhs + 1; gap > 0; gap = floor(gap * this.combSort.SCALE, 0)) {
            times = await this.combSort.moveByOrder(source, lhs, rhs, gap, primaryColor, secondaryColor, accentColor, 'ascent', times, callback);
        }

        return await this.shakerBubbleSort.sortByOrder(source, lhs, rhs, primaryColor, secondaryColor, accentColor, 'ascent', times, callback);
    }

    public override async mergeByDescent(source: SortDataModel[], lhs: number, mid: number, rhs: number, primaryColor: string, secondaryColor: string, accentColor: string, times: number, callback: (param: SortStateModel) => void): Promise<number> {
        if (this.combSort === null) throw new Error(`错误：引用对象${this.combSort}未被初始化。`);
        if (this.shakerBubbleSort === null) throw new Error(`错误：引用对象${this.shakerBubbleSort}未被初始化。`);

        for (let gap = rhs - lhs + 1; gap > 0; gap = floor(gap * this.combSort.SCALE, 0)) {
            times = await this.combSort.moveByOrder(source, lhs, rhs, gap, primaryColor, secondaryColor, accentColor, 'descent', times, callback);
        }

        return await this.shakerBubbleSort.sortByOrder(source, lhs, rhs, primaryColor, secondaryColor, accentColor, 'descent', times, callback);
    }

}

/**
 * 梳归并排序（迭代）
 */
export class IterativeCombMergeSortAlgorithm extends RecursiveCombMergeSortAlgorithm {

    protected override async sortByAscent(source: SortDataModel[], lhs: number, rhs: number, option: SortOption, callback: (param: SortStateModel) => void): Promise<void> {
        let start: number, final: number, split: number, times: number = 0;

        for (let gap = 1, length = rhs - lhs + 1; gap < length; gap = gap + gap) {
            for (let i = lhs; i <= rhs; i += gap + gap) {
                start = i;
                final = Math.min(i + gap + gap - 1, rhs);
                split = Math.max(i + gap - 1, start);

                if (split < final) {
                    times = await this.mergeByAscent(source, start, split, final, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, times, callback);
                }
            }
        }

        await delay();
        await this.complete(source, times, callback);
    }

    protected override async sortByDescent(source: SortDataModel[], lhs: number, rhs: number, option: SortOption, callback: (param: SortStateModel) => void): Promise<void> {
        let start: number, final: number, split: number, times: number = 0;

        for (let gap = 1, length = rhs - lhs + 1; gap < length; gap = gap + gap) {
            for (let i = rhs; i >= lhs; i -= gap + gap) {
                final = i;
                start = Math.max(i - gap - gap + 1, lhs);
                split = i - gap + 1;
                
                if (split > start) {
                    times = await this.mergeByDescent(source, start, split, final, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, times, callback);
                }
            }
        }

        await delay();
        await this.complete(source, times, callback);
    }

}

/**
 * 股排序（递归）
 */
export class RecursiveStrandSortAlgorithm extends RecursiveMergeSortAlgorithm {

    protected override async sortByAscent(source: SortDataModel[], lhs: number, rhs: number, option: SortOption, callback: (param: SortStateModel) => void): Promise<void> {
        let times: number = await this.newSortByOrder(source, lhs, rhs, lhs, this.stack, 'ascent', 0, callback);
        
        this.array.splice(0);
        this.queue.splice(0);
        this.stack.splice(0);

        await delay();
        await this.complete(source, times, callback);
    }

    protected override async sortByDescent(source: SortDataModel[], lhs: number, rhs: number, option: SortOption, callback: (param: SortStateModel) => void): Promise<void> {
        let times: number = await this.newSortByOrder(source, lhs, rhs, rhs, this.stack, 'descent', 0, callback);
        
        this.array.splice(0);
        this.queue.splice(0);
        this.stack.splice(0);

        await delay();
        await this.complete(source, times, callback);
    }

    private async newSortByOrder(source: SortDataModel[], lhs: number, rhs: number, idx: number, sorted: number[], order: SortOrder, times: number, callback: (param: SortStateModel) => void): Promise<number> {
        if (sorted.length < rhs - lhs + 1) {
            if (order === 'ascent') {
                [times, sorted] = await this.saveByOrder(source, idx, rhs, sorted, order, times, callback);
            }

            if (order === 'descent') {
                [times, sorted] = await this.saveByOrder(source, lhs, idx, sorted, order, times, callback);
            }
            
            [times, sorted] = await this.loadByOrder(source, lhs, rhs, sorted, order, times, callback);

            if (order === 'ascent') {
                times = await this.newSortByOrder(source, lhs, rhs, lhs + sorted.length, sorted, order, times, callback);
            }
            
            if (order === 'descent') {
                times = await this.newSortByOrder(source, lhs, rhs, rhs - sorted.length, sorted, order, times, callback);
            }
        }

        return times;
    }

    protected async saveByOrder(source: SortDataModel[], lhs: number, rhs: number, sorted: number[], order: SortOrder, times: number, callback: (param: SortStateModel) => void): Promise<[number, number[]]> {
        if (order === 'ascent') {
            for (let i = lhs; i <= rhs; i++) {
                if (this.queue.length === 0) {
                    this.queue.push(source[i].value);
                } else {
                    if (source[i].value >= this.queue[this.queue.length - 1]) {
                        this.queue.push(source[i].value);
                    } else {
                        this.array.push(source[i].value);
                    }
                }
    
                times = await this.sweep(source, i, ACCENT_ONE_COLOR, times, callback);
                times += 1;
            }
        }
        
        if (order === 'descent') {
            for (let i = rhs; i >= lhs; i--) {
                if (this.queue.length === 0) {
                    this.queue.push(source[i].value);
                } else {
                    if (source[i].value >= this.queue[this.queue.length - 1]) {
                        this.queue.push(source[i].value);
                    } else {
                        this.array.push(source[i].value);
                    }
                }
    
                times = await this.sweep(source, i, ACCENT_ONE_COLOR, times, callback);
                times += 1;
            }
        }
        
        return [times, sorted];
    }

    protected async loadByOrder(source: SortDataModel[], lhs: number, rhs: number, sorted: number[], order: SortOrder, times: number, callback: (param: SortStateModel) => void): Promise<[number, number[]]> {
        let start: number, final: number, split: number, index: number;
        
        this.array = this.queue.concat(sorted, this.array);

        if (order === 'ascent') {
            start = lhs;
            split = start + this.queue.length - 1;
            final = split + sorted.length;
            this.queue.splice(0);

            for (let i = lhs; i <= rhs; i++) {
                source[i].value = this.array.shift() as number;

                times = await this.sweep(source, i, ACCENT_TWO_COLOR, times, callback);
                times += 1;
            }

            index = this._service.indexOfFGTByAscent(source, source[split].value, split + 1, final);
            index = index === -1 ? final : index;
            times = await this.mergeByAscent(source, start, split, index, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, times, callback);

            sorted.splice(0);

            for (let i = start; i <= final; i++) sorted.push(source[i].value);
        }

        if (order === 'descent') {
            final = rhs;
            split = final - this.queue.length + 1;
            start = split - sorted.length;
            this.queue.splice(0);

            for (let i = rhs; i >= lhs; i--) {
                source[i].value = this.array.shift() as number;

                times = await this.sweep(source, i, ACCENT_TWO_COLOR, times, callback);
                times += 1;
            }

            index = this._service.indexOfFGTByDescent(source, source[split].value, start, split - 1);
            index = index === -1 ? start : index;
            times = await this.mergeByDescent(source, index, split, final, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, times, callback);
            
            sorted.splice(0);

            for (let i = final; i >= start; i--) sorted.push(source[i].value);
        }
        
        return [times, sorted];
    }

}

/**
 * 股排序（迭代）
 */
export class IterativeStrandSortAlgorithm extends RecursiveStrandSortAlgorithm {

    protected override async sortByAscent(source: SortDataModel[], lhs: number, rhs: number, option: SortOption, callback: (param: SortStateModel) => void): Promise<void> {
        let idx: number = lhs, times: number = 0;

        while (this.stack.length < rhs - lhs + 1) {
            [times, this.stack] = await this.saveByOrder(source, idx, rhs, this.stack, 'ascent', times, callback);
            [times, this.stack] = await this.loadByOrder(source, lhs, rhs, this.stack, 'ascent', times, callback);

            idx = lhs + this.stack.length;
        }

        this.array.splice(0);
        this.queue.splice(0);
        this.stack.splice(0);

        await delay();
        await this.complete(source, times, callback);
    }

    protected override async sortByDescent(source: SortDataModel[], lhs: number, rhs: number, option: SortOption, callback: (param: SortStateModel) => void): Promise<void> {
        let idx: number = rhs, times: number = 0;

        while (this.stack.length < rhs - lhs + 1) {
            [times, this.stack] = await this.saveByOrder(source, lhs, idx, this.stack, 'descent', times, callback);
            [times, this.stack] = await this.loadByOrder(source, lhs, rhs, this.stack, 'descent', times, callback);

            idx = rhs - this.stack.length;
        }

        this.array.splice(0);
        this.queue.splice(0);
        this.stack.splice(0);

        await delay();
        await this.complete(source, times, callback);
    }

}

/**
 * 原地股排序
 */
export class InPlaceStrandSortAlgorithm extends RecursiveInPlaceMergeSortAlgorithm {

    protected override async sortByAscent(source: SortDataModel[], lhs: number, rhs: number, option: SortOption, callback: (param: SortStateModel) => void): Promise<void> {
        let fst: number = lhs, snd: number = rhs, mid: number, times: number = 0;

        [times, mid] = await this.seekByOrder(source, lhs, rhs, 'ascent', times, callback);

        while (true) {
            [times, snd] = await this.seekByOrder(source, mid + 1, rhs, 'ascent', times, callback);
            times = await this.mergeByAscent(source, fst, mid, snd, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, times, callback);

            if (snd === rhs) break;

            mid = snd;
        }

        await delay();
        await this.complete(source, times, callback);
    }

    protected override async sortByDescent(source: SortDataModel[], lhs: number, rhs: number, option: SortOption, callback: (param: SortStateModel) => void): Promise<void> {
        let fst: number = rhs, snd: number = lhs, mid: number, times: number = 0;

        [times, mid] = await this.seekByOrder(source, lhs, rhs, 'descent', times, callback);

        while (true) {
            [times, snd] = await this.seekByOrder(source, lhs, mid - 1, 'descent', times, callback);
            times = await this.mergeByDescent(source, snd, mid, fst, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, times, callback);

            if (snd === lhs) break;

            mid = snd;
        }

        await delay();
        await this.complete(source, times, callback);
    }

    private async seekByOrder(source: SortDataModel[], lhs: number, rhs: number, order: SortOrder, times: number, callback: (param: SortStateModel) => void): Promise<[number, number]> {
        if (this.insertSort === null) throw new Error(`错误：引用对象${this.insertSort}未被初始化。`);

        let j: number = -1, k: number;

        if (order === 'ascent') {
            k = rhs;

            for (let i = lhs; i <= rhs;) {
                j = Math.min(i + 1, rhs);
    
                times = await this.sweep(source, i, ACCENT_COLOR, times, callback);
    
                if (source[j].value < source[i].value) {
                    times = await this.insertSort.moveByOrder(source, j, rhs, PRIMARY_COLOR, SECONDARY_COLOR, 'descent', times, callback);
                    k -= 1;
                } else i += 1;
                
                if (k === j || k === i) {
                    j = i;
                    break;
                }
            }
        }
        
        if (order === 'descent') {
            k = lhs;

            for (let i = rhs; i >= lhs;) {
                j = Math.max(i - 1, lhs);
    
                times = await this.sweep(source, i, ACCENT_COLOR, times, callback);
    
                if (source[j].value < source[i].value) {
                    times = await this.insertSort.moveByOrder(source, lhs, j, PRIMARY_COLOR, SECONDARY_COLOR, 'ascent', times, callback);
                    k += 1;
                } else i -= 1;
                
                if (k === j || k === i) {
                    j = i;
                    break;
                }
            }
        }

        return [times, j];
    }

}

