import { Injectable } from "@angular/core";
import { floor } from "lodash";

import { ACCENT_ONE_COLOR, ACCENT_TWO_COLOR, delay, PLACE_FST_COLOR, PLACE_FTH_COLOR, PLACE_SND_COLOR, PLACE_TRD_COLOR } from "../../../public/global.utils";
import { CLEAR_COLOR, ACCENT_COLOR, PRIMARY_COLOR, SECONDARY_COLOR } from "../../../public/global.utils";

import { SortDataModel, SortStateModel, SortOrder, SortIndexRange } from "../ngrx-store/sort.state";

import { AbstractMergeSortService, AbstractSortService } from "./base-sort.service";
import { SortToolsService } from "../ngrx-store/sort.service";
import { InsertionSortService } from "./insertion-sort.service";

/**
 * 归并排序（递归）
 */
@Injectable()
export class RecursiveMergeSortService extends AbstractMergeSortService {

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

    protected override async sortByOrder(source: SortDataModel[], lhs: number, rhs: number, order: SortOrder, times: number, callback: (param: SortStateModel) => void): Promise<number> {
        if (lhs < rhs) {
            let mid: number;
            
            if (order === 'ascent') {
                mid = lhs + floor((rhs - lhs) * 0.5, 0);
                times = await this.sortByOrder(source, lhs, mid, order, times, callback);
                times = await this.sortByOrder(source, mid + 1, rhs, order, times, callback);
                times = await this.mergeByAscent(source, lhs, mid, rhs, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, times, callback);
            }
            
            if (order === 'descent') {
                mid = rhs - floor((rhs - lhs) * 0.5, 0);
                times = await this.sortByOrder(source, mid, rhs, order, times, callback);
                times = await this.sortByOrder(source, lhs, mid - 1, order, times, callback);
                times = await this.mergeByDescent(source, lhs, mid, rhs, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, times, callback);
            }
        }

        return times;
    }

    protected override async mergeByAscent(source: SortDataModel[], lhs: number, mid: number, rhs: number, primaryColor: string, secondaryColor: string, accentColor: string, times: number, callback: (param: SortStateModel) => void): Promise<number> {
        let i: number = lhs, j: number = mid + 1;
        
        while (i <= mid && j <= rhs) {
            times = await this.render(source, i, j, primaryColor, secondaryColor, times, callback);
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

    protected override async mergeByDescent(source: SortDataModel[], lhs: number, mid: number, rhs: number, primaryColor: string, secondaryColor: string, accentColor: string, times: number, callback: (param: SortStateModel) => void): Promise<number> {
        let i: number = rhs, j: number = mid - 1;
        
        while (i >= mid && j >= lhs) {
            times = await this.render(source, i, j, primaryColor, secondaryColor, times, callback);
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
@Injectable()
export class IterativeMergeSortService extends RecursiveMergeSortService {

    protected override async sortByAscent(source: SortDataModel[], lhs: number, rhs: number, option: string | number | undefined, callback: (param: SortStateModel) => void): Promise<void> {
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

    protected override async sortByDescent(source: SortDataModel[], lhs: number, rhs: number, option: string | number | undefined, callback: (param: SortStateModel) => void): Promise<void> {
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
@Injectable()
export class RecursiveInPlaceMergeSortService extends RecursiveMergeSortService {

    protected override async mergeByAscent(source: SortDataModel[], lhs: number, mid: number, rhs: number, primaryColor: string, secondaryColor: string, accentColor: string, times: number, callback: (param: SortStateModel) => void): Promise<number> {
        for (let i = lhs, j = mid + 1; i < j;) {
            if (source[i].value < source[j].value) {
                times = await this.render(source, i, j, primaryColor, secondaryColor, times, callback);

                i += 1;
            } else {
                for (let k = j; k > i; k--) {
                    source[i].color = primaryColor;
                    source[j].color = secondaryColor;
                    callback({ times, datalist: source });

                    times = await this.exchange(source, true, k, k - 1, primaryColor, secondaryColor, accentColor, times, callback);
                }

                times = await this.render(source, i, j, primaryColor, secondaryColor, times, callback);

                i += 1;
                j = Math.min(j + 1, rhs);
            }
        }

        return times;
    }

    protected override async mergeByDescent(source: SortDataModel[], lhs: number, mid: number, rhs: number, primaryColor: string, secondaryColor: string, accentColor: string, times: number, callback: (param: SortStateModel) => void): Promise<number> {
        for (let i = rhs, j = mid - 1; i > j;) {
            if (source[i].value < source[j].value) {
                times = await this.render(source, i, j, primaryColor, secondaryColor, times, callback);

                i -= 1;
            } else {
                for (let k = j; k < i; k++) {
                    source[i].color = primaryColor;
                    source[j].color = secondaryColor;
                    callback({ times, datalist: source });

                    times = await this.exchange(source, true, k, k + 1, primaryColor, secondaryColor, accentColor, times, callback);
                }

                times = await this.render(source, i, j, primaryColor, secondaryColor, times, callback);

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
@Injectable()
export class IterativeInPlaceMergeSortService extends RecursiveInPlaceMergeSortService {

    protected override async sortByAscent(source: SortDataModel[], lhs: number, rhs: number, option: string | number | undefined, callback: (param: SortStateModel) => void): Promise<void> {
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

    protected override async sortByDescent(source: SortDataModel[], lhs: number, rhs: number, option: string | number | undefined, callback: (param: SortStateModel) => void): Promise<void> {
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
@Injectable()
export class RecursiveWeaveMergeSortService extends RecursiveMergeSortService {

    constructor(
        protected override _service: SortToolsService,
        protected _insertSortService: InsertionSortService
    ) {
        super(_service);
    }

    public override async mergeByAscent(source: SortDataModel[], lhs: number, mid: number, rhs: number, primaryColor: string, secondaryColor: string, accentColor: string, times: number, callback: (param: SortStateModel) => void): Promise<number> {
        let i: number = lhs, j: number = mid + 1;

        while (i <= mid && j <= rhs) {
            times = await this.render(source, i, j, primaryColor, secondaryColor, times, callback);
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

        for (let k = lhs; this.array.length > 0; k++) {
            source[k].value = this.array.shift() as number;

            times = await this.sweep(source, k, accentColor, times, callback);
            times += 1;
        }

        return await this._insertSortService.sortByOrder(source, lhs, rhs, 1, 1, primaryColor, secondaryColor, accentColor, 'ascent', times, callback);
    }

    public override async mergeByDescent(source: SortDataModel[], lhs: number, mid: number, rhs: number, primaryColor: string, secondaryColor: string, accentColor: string, times: number, callback: (param: SortStateModel) => void): Promise<number> {
        let i: number = rhs, j: number = mid - 1;

        while (i >= mid && j >= lhs) {
            times = await this.render(source, i, j, primaryColor, secondaryColor, times, callback);
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

        for (let k = rhs; this.array.length > 0; k--) {
            source[k].value = this.array.shift() as number;

            times = await this.sweep(source, k, accentColor, times, callback);
            times += 1;
        }

        return await this._insertSortService.sortByOrder(source, lhs, rhs, 1, 1, primaryColor, secondaryColor, accentColor, 'descent', times, callback);
    }

}

/**
 * 穿插排序（迭代）
 */
@Injectable()
export class IterativeWeaveMergeSortService extends RecursiveWeaveMergeSortService {

    protected override async sortByAscent(source: SortDataModel[], lhs: number, rhs: number, option: string | number | undefined, callback: (param: SortStateModel) => void): Promise<void> {
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

    protected override async sortByDescent(source: SortDataModel[], lhs: number, rhs: number, option: string | number | undefined, callback: (param: SortStateModel) => void): Promise<void> {
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
@Injectable()
export class InPlaceRecursiveWeaveMergeSortService extends RecursiveWeaveMergeSortService {

    public override async mergeByAscent(source: SortDataModel[], lhs: number, mid: number, rhs: number, primaryColor: string, secondaryColor: string, accentColor: string, times: number, callback: (param: SortStateModel) => void): Promise<number> {
        let idx: number;

        for (let i = lhs, j = mid + 1; i < j; i += 2, j = Math.min(j + 1, rhs)) {
            idx = source[i].value < source[j].value ? Math.min(i + 1, rhs) : i;

            for (let k = j; k > idx; k--) {
                source[i].color = primaryColor;
                source[j].color = secondaryColor;
                callback({ times, datalist: source });

                times = await this.exchange(source, true, k, k - 1, primaryColor, secondaryColor, accentColor, times, callback);
            }

            times = await this.render(source, i, j, primaryColor, secondaryColor, times, callback);
        }

        return await this._insertSortService.sortByOrder(source, lhs, rhs, 1, 1, primaryColor, secondaryColor, accentColor, 'ascent', times, callback);
    }

    public override async mergeByDescent(source: SortDataModel[], lhs: number, mid: number, rhs: number, primaryColor: string, secondaryColor: string, accentColor: string, times: number, callback: (param: SortStateModel) => void): Promise<number> {
        let idx: number;

        for (let i = rhs, j = mid - 1; i > j; i -= 2, j = Math.max(j - 1, lhs)) {
            idx = source[i].value < source[j].value ? Math.max(i - 1, lhs) : i;

            for (let k = j; k < idx; k++) {
                source[i].color = primaryColor;
                source[j].color = secondaryColor;
                callback({ times, datalist: source });

                times = await this.exchange(source, true, k, k + 1, primaryColor, secondaryColor, accentColor, times, callback);
            }

            times = await this.render(source, i, j, primaryColor, secondaryColor, times, callback);
        }

        return await this._insertSortService.sortByOrder(source, lhs, rhs, 1, 1, primaryColor, secondaryColor, accentColor, 'descent', times, callback);
    }

}

/**
 * 原地穿插排序（迭代）
 */
@Injectable()
export class InPlaceIterativeWeaveMergeSortService extends InPlaceRecursiveWeaveMergeSortService {

    protected override async sortByAscent(source: SortDataModel[], lhs: number, rhs: number, option: string | number | undefined, callback: (param: SortStateModel) => void): Promise<void> {
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

    protected override async sortByDescent(source: SortDataModel[], lhs: number, rhs: number, option: string | number | undefined, callback: (param: SortStateModel) => void): Promise<void> {
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
@Injectable()
export class MultiWayMergeSortService extends RecursiveMergeSortService {

    constructor(
        protected override _service: SortToolsService,
        private _insertSortService: InsertionSortService
    ) {
        super(_service);
    }

    private points: number[] = Array.from([]);
    private values: number[] = Array.from([]);
    private count: number = 0;

    protected override async sortByAscent(source: SortDataModel[], lhs: number, rhs: number, option: string | number | undefined, callback: (param: SortStateModel) => void): Promise<void> {
        this.count = option as number;
        await super.sortByAscent(source, lhs, rhs, option, callback);
    }

    protected override async sortByDescent(source: SortDataModel[], lhs: number, rhs: number, option: string | number | undefined, callback: (param: SortStateModel) => void): Promise<void> {
        this.count = option as number;
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
        let range: SortIndexRange, index: number = Number.NaN, value: number, offset: number = ranges[0].start;
        
        for (let i = 0, length = ranges.length; i <= length - 1; i++) {
            range = ranges[i];

            if (range.final - range.start + 1 <= this.count) {
                times = await this._insertSortService.sortByOrder(source, range.start, range.final, 1, 1, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, 'ascent', times, callback);
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

            for (let i = 0, length = this.points.length; i <= length - 1; i++) {
                if (i % 4 === 1) {
                    source[this.points[i]].color = PLACE_FST_COLOR;
                } else if (i % 4 === 2) {
                    source[this.points[i]].color = PLACE_SND_COLOR;
                } else if (i % 4 === 3) {
                    source[this.points[i]].color = PLACE_TRD_COLOR;
                } else {
                    source[this.points[i]].color = PLACE_FTH_COLOR;
                }

                callback({ times, datalist: source });
            }
            
            await delay();

            for (let i = 0, length = this.points.length; i <= length - 1; i++) {
                source[this.points[i]].color = CLEAR_COLOR;
                callback({ times, datalist: source });
            }
            
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
        let range: SortIndexRange, index: number = Number.NaN, value: number, offset: number = ranges[ranges.length - 1].final;
        
        for (let length = ranges.length, i = length - 1; i >= 0; i--) {
            range = ranges[i];

            if (range.final - range.start + 1 <= this.count) {
                times = await this._insertSortService.sortByOrder(source, range.start, range.final, 1, 1, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, 'descent', times, callback);
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

            for (let length = this.points.length, i = length - 1 ; i >= 0; i--) {
                if (i % 4 === 1) {
                    source[this.points[i]].color = PLACE_FST_COLOR;
                } else if (i % 4 === 2) {
                    source[this.points[i]].color = PLACE_SND_COLOR;
                } else if (i % 4 === 3) {
                    source[this.points[i]].color = PLACE_TRD_COLOR;
                } else {
                    source[this.points[i]].color = PLACE_FTH_COLOR;
                }
                
                callback({ times, datalist: source });
            }
            
            await delay();

            for (let length = this.points.length, i = length - 1 ; i >= 0; i--) {
                source[this.points[i]].color = CLEAR_COLOR;
                callback({ times, datalist: source });
            }
            
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
@Injectable()
export class TimSortService extends IterativeMergeSortService {

    constructor(
        protected override _service: SortToolsService,
        private _insertSortService: InsertionSortService
    ) {
        super(_service);
    }

    protected override async sortByAscent(source: SortDataModel[], lhs: number, rhs: number, option: string | number | undefined, callback: (param: SortStateModel) => void): Promise<void> {
        let length = rhs - lhs + 1, runLength: number = this.calcRunLength(length), start: number, final: number, split: number, times: number = 0;

        for (let i = lhs; i <= rhs; i += runLength) {
            start = i;
            final = Math.min(rhs, i + runLength - 1);
            times = await this._insertSortService.sortByOrder(source, start, final, 1, 1, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, 'ascent', times, callback);
        }

        for (let gap = runLength; gap < length; gap = gap + gap) {
            for (let i = lhs; i <= rhs; i += gap + gap) {
                start = i;
                split = i + gap - 1;
                final = Math.min(split + gap, rhs);

                if (split < final) {
                    times = await this.mergeByAscent(source, start, split, final, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, times, callback);
                }
            }
        }

        await delay();
        await this.complete(source, times, callback);
    }

    protected override async sortByDescent(source: SortDataModel[], lhs: number, rhs: number, option: string | number | undefined, callback: (param: SortStateModel) => void): Promise<void> {
        let length = rhs - lhs + 1, runLength: number = this.calcRunLength(length), start: number, final: number, split: number, times: number = 0;

        for (let i = rhs; i >= lhs; i -= runLength) {
            final = i;
            start = Math.max(lhs, i - runLength + 1);
            times = await this._insertSortService.sortByOrder(source, start, final, 1, 1, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, 'descent', times, callback);
        }

        for (let gap = runLength; gap < length; gap = gap + gap) {
            for (let i = rhs; i >= lhs; i -= gap + gap) {
                final = i;
                split = i - gap + 1;
                start = Math.max(split - gap, lhs);

                if (split > start) {
                    times = await this.mergeByDescent(source, start, split, final, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, times, callback);
                }
            }
        }

        await delay();
        await this.complete(source, times, callback);
    }

    private calcRunLength(length: number): number {
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

/**
 * 股排序（递归）
 */
@Injectable()
export class RecursiveStrandSortService extends RecursiveMergeSortService {

    protected override async sortByAscent(source: SortDataModel[], lhs: number, rhs: number, option: string | number | undefined, callback: (param: SortStateModel) => void): Promise<void> {
        let unsorted: number[] | null = source.map(item => item.value), newSorted: number[] | null = Array.from([]), oldSorted: number[] | null = Array.from([]);
        let times: number = await this.newSortByOrder(source, unsorted, newSorted, oldSorted, 'ascent', 0, callback);

        unsorted.splice(0);
        newSorted.splice(0);
        oldSorted.splice(0);

        unsorted = null;
        newSorted = null;
        oldSorted = null;

        await delay();
        await this.complete(source, times, callback);
    }

    protected override async sortByDescent(source: SortDataModel[], lhs: number, rhs: number, option: string | number | undefined, callback: (param: SortStateModel) => void): Promise<void> {
        let unsorted: number[] | null = source.map(item => item.value), newSorted: number[] | null = Array.from([]), oldSorted: number[] | null = Array.from([]);
        let times: number = await this.newSortByOrder(source, unsorted, newSorted, oldSorted, 'descent', 0, callback);

        unsorted.splice(0);
        newSorted.splice(0);
        oldSorted.splice(0);

        unsorted = null;
        newSorted = null;
        oldSorted = null;

        await delay();
        await this.complete(source, times, callback);
    }

    private async newSortByOrder(source: SortDataModel[], unsorted: number[], newSorted: number[], oldSorted: number[], order: SortOrder, times: number, callback: (param: SortStateModel) => void): Promise<number> {
        if (unsorted.length > 0) {
            [times, unsorted, newSorted] = await this.save(source, unsorted, newSorted, order, times, callback);
            [times, unsorted, newSorted, oldSorted] = await this.load(source, unsorted, newSorted, oldSorted, order, times, callback);

            newSorted.splice(0);

            times = await this.newSortByOrder(source, unsorted, newSorted, oldSorted, order, times, callback);
        }

        return times;
    }

    protected async save(source: SortDataModel[], unsorted: number[], newSorted: number[], order: SortOrder, times: number, callback: (param: SortStateModel) => void): Promise<[number, number[], number[]]> {
        let index: number, value: number;

        if (order === 'ascent')
            for (let i = 0; unsorted.length > 0; i++) {
                value = unsorted.shift() as number;

                if (newSorted.length === 0) {
                    newSorted.push(value);
                } else {
                    index = newSorted.length - 1;

                    if (value >= newSorted[index]) {
                        newSorted.push(value);
                    } else {
                        this.array.push(value);
                    }
                }

                times = await this.render(source, i, i, ACCENT_ONE_COLOR, ACCENT_ONE_COLOR, times, callback);
                times += 1;
            }

        if (order === 'descent') {
            for (let i = source.length - 1; unsorted.length > 0; i--) {
                value = unsorted.pop() as number;

                if (newSorted.length === 0) {
                    newSorted.push(value);
                } else {
                    index = newSorted.length - 1;

                    if (value >= newSorted[index]) {
                        newSorted.push(value);
                    } else {
                        this.array.push(value);
                    }
                }

                times = await this.render(source, i, i, ACCENT_ONE_COLOR, ACCENT_ONE_COLOR, times, callback);
                times += 1;
            }
        }

        return [times, unsorted, newSorted];
    }

    protected async load(source: SortDataModel[], unsorted: number[], newSorted: number[], oldSorted: number[], order: SortOrder, times: number, callback: (param: SortStateModel) => void): Promise<[number, number[], number[], number[]]> {
        let value: number;

        if (order === 'ascent') {
            if (newSorted.length === source.length) {
                for (let i = 0; newSorted.length > 0; i++) {
                    value = newSorted.shift() as number;
                    source[i].value = value;

                    times = await this.render(source, i, i, ACCENT_TWO_COLOR, ACCENT_TWO_COLOR, times, callback);
                    times += 1;
                }
            } else {
                while (this.array.length > 0) {
                    unsorted.push(this.array.shift() as number);
                }

                [times, oldSorted] = await this.newMergeByAscent(source, unsorted, newSorted, oldSorted, times, callback);
            }
        }

        if (order === 'descent') {
            if (newSorted.length === source.length) {
                for (let i = source.length - 1; newSorted.length > 0; i--) {
                    value = newSorted.shift() as number;
                    source[i].value = value;

                    times = await this.render(source, i, i, ACCENT_TWO_COLOR, ACCENT_TWO_COLOR, times, callback);
                    times += 1;
                }
            } else {
                while (this.array.length > 0) {
                    unsorted.push(this.array.shift() as number);
                }

                [times, oldSorted] = await this.newMergeByDescent(source, unsorted, newSorted, oldSorted, times, callback);
            }
        }

        return [times, unsorted, newSorted, oldSorted];
    }

    private async newMergeByAscent(source: SortDataModel[], unsorted: number[], newSorted: number[], oldSorted: number[], times: number, callback: (param: SortStateModel) => void): Promise<[number, number[]]> {
        let idx: number, fst: number, snd: number, len: number, i: number, j: number;

        this.array = this.array.concat(...unsorted, ...newSorted);

        for (let k = 0; this.array.length > 0; k++) {
            source[k].value = this.array.shift() as number;

            times = await this.render(source, k, k, ACCENT_TWO_COLOR, ACCENT_TWO_COLOR, times, callback);
            times += 1;
        }

        len = source.length;
        fst = unsorted.length;
        snd = fst + newSorted.length;

        idx = this._service.indexOfFGTByAscent(source, source[snd - 1].value, snd, len - 1);
        idx = idx === -1 ? len - 1 : idx;

        i = fst, j = snd;

        while (i <= snd - 1 && j <= idx) {
            times = await this.render(source, i, j, PRIMARY_COLOR, SECONDARY_COLOR, times, callback);

            if (source[i].value < source[j].value) {
                this.array.push(source[i].value);
                i += 1;
            } else {
                this.array.push(source[j].value);
                j += 1;
            }

            times += 1;
        }

        while (i <= snd - 1) {
            times = await this.render(source, i, i, PRIMARY_COLOR, PRIMARY_COLOR, times, callback);

            this.array.push(source[i].value);

            i += 1;
            times += 1;
        }

        while (j <= idx) {
            times = await this.render(source, j, j, SECONDARY_COLOR, SECONDARY_COLOR, times, callback);

            this.array.push(source[j].value);

            j += 1;
            times += 1;
        }

        oldSorted.splice(0);

        for (let k = 0, length = this.array.length; k < length; k++) {
            oldSorted.push(this.array[k]);
        }

        for (let k = 0; this.array.length > 0; k++) {
            source[fst + k].value = this.array.shift() as number;

            times = await this.render(source, fst + k, fst + k, ACCENT_COLOR, ACCENT_COLOR, times, callback);
            times += 1;
        }

        return [times, oldSorted];
    }

    private async newMergeByDescent(source: SortDataModel[], unsorted: number[], newSorted: number[], oldSorted: number[], times: number, callback: (param: SortStateModel) => void): Promise<[number, number[]]> {
        let idx: number, fst: number, snd: number, len: number, i: number, j: number;

        this.array = this.array.concat(...unsorted, ...newSorted);

        for (let k = source.length - 1; this.array.length > 0; k--) {
            source[k].value = this.array.shift() as number;

            times = await this.render(source, k, k, ACCENT_TWO_COLOR, ACCENT_TWO_COLOR, times, callback);
            times += 1;
        }

        len = source.length;
        fst = len - unsorted.length - 1;
        snd = fst - newSorted.length;

        idx = this._service.indexOfFGTByDescent(source, source[snd + 1].value, 0, snd);
        idx = idx === -1 ? 0 : idx;

        i = fst, j = snd;

        while (i >= snd + 1 && j >= idx) {
            times = await this.render(source, i, j, PRIMARY_COLOR, SECONDARY_COLOR, times, callback);

            if (source[i].value < source[j].value) {
                this.array.push(source[i].value);
                i -= 1;
            } else {
                this.array.push(source[j].value);
                j -= 1;
            }

            times += 1;
        }

        while (i >= snd + 1) {
            times = await this.render(source, i, i, PRIMARY_COLOR, PRIMARY_COLOR, times, callback);

            this.array.push(source[i].value);

            i -= 1;
            times += 1;
        }

        while (j >= idx) {
            times = await this.render(source, j, j, SECONDARY_COLOR, SECONDARY_COLOR, times, callback);

            this.array.push(source[j].value);

            j -= 1;
            times += 1;
        }

        oldSorted.splice(0);

        for (let k = 0, length = this.array.length; k < length; k++) {
            oldSorted.push(this.array[k]);
        }

        for (let k = 0; this.array.length > 0; k++) {
            source[fst - k].value = this.array.shift() as number;

            times = await this.render(source, fst - k, fst - k, ACCENT_COLOR, ACCENT_COLOR, times, callback);
            times += 1;
        }

        return [times, oldSorted];
    }

}

/**
 * 股排序（迭代）
 */
@Injectable()
export class IterativeStrandSortService extends RecursiveStrandSortService {

    private unsorted: number[] = Array.from([]);
    private newSorted: number[] = Array.from([]);
    private oldSorted: number[] = Array.from([]);

    protected override async sortByAscent(source: SortDataModel[], lhs: number, rhs: number, option: string | number | undefined, callback: (param: SortStateModel) => void): Promise<void> {
        let times: number = 0;

        this.unsorted = source.map(item => item.value);

        while (this.unsorted.length > 0) {
            [times, this.unsorted, this.newSorted] = await this.save(source, this.unsorted, this.newSorted, 'ascent', times, callback);
            [times, this.unsorted, this.newSorted, this.oldSorted] = await this.load(source, this.unsorted, this.newSorted, this.oldSorted, 'ascent', times, callback);

            this.newSorted.splice(0);
        }

        await delay();
        await this.complete(source, times, callback);
    }

    protected override async sortByDescent(source: SortDataModel[], lhs: number, rhs: number, option: string | number | undefined, callback: (param: SortStateModel) => void): Promise<void> {
        let times: number = 0;

        this.unsorted = source.map(item => item.value);

        while (this.unsorted.length > 0) {
            [times, this.unsorted, this.newSorted] = await this.save(source, this.unsorted, this.newSorted, 'descent', times, callback);
            [times, this.unsorted, this.newSorted, this.oldSorted] = await this.load(source, this.unsorted, this.newSorted, this.oldSorted, 'descent', times, callback);

            this.newSorted.splice(0);
        }

        await delay();
        await this.complete(source, times, callback);
    }

}

/**
 * 原地股排序
 */
@Injectable()
export class InPlaceStrandSortService extends RecursiveInPlaceMergeSortService {

    protected override async sortByAscent(source: SortDataModel[], lhs: number, rhs: number, option: string | number | undefined, callback: (param: SortStateModel) => void): Promise<void> {
        let fst: number, snd: number, idx: number, times: number = 0;

        [times, fst, snd] = await this.sliceByOrder(source, lhs, rhs, 'ascent', times, callback);

        if (fst > lhs) {
            snd = fst - 1;
            fst = lhs;

            while (true) {
                [times, fst, idx] = await this.sliceByOrder(source, fst, snd, 'ascent', times, callback);
                
                if (idx < lhs) break;
    
                snd = this._service.indexOfFGTByAscent(source, source[idx].value, idx + 1, rhs);
                snd = snd === -1 ? rhs : snd;
                
                times = await this.mergeByAscent(source, fst, idx, snd, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, times, callback);
    
                snd = fst - 1;
                fst = lhs;
            }
        }
        
        await delay();
        await this.complete(source, times, callback);
    }

    protected override async sortByDescent(source: SortDataModel[], lhs: number, rhs: number, option: string | number | undefined, callback: (param: SortStateModel) => void): Promise<void> {
        let fst: number, snd: number, idx: number, times: number = 0;

        [times, fst, snd] = await this.sliceByOrder(source, lhs, rhs, 'descent', times, callback);

        if (snd < rhs) {
            fst = snd + 1;
            snd = rhs;

            while (true) {
                [times, idx, snd] = await this.sliceByOrder(source, fst, snd, 'descent', times, callback);
                
                if (idx > rhs) break;
    
                fst = this._service.indexOfFGTByDescent(source, source[idx].value, lhs, idx - 1);
                fst = fst === -1 ? lhs : fst;
                
                times = await this.mergeByDescent(source, fst, idx, snd, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, times, callback);
    
                fst = snd + 1;
                snd = rhs;
            }
        }

        await delay();
        await this.complete(source, times, callback);
    }

    private async sliceByOrder(source: SortDataModel[], lhs: number, rhs: number, order: SortOrder, times: number, callback: (param: SortStateModel) => void): Promise<[number, number, number]> {
        let idx: number = -1;

        if (order === 'ascent') {
            for (let i = rhs; i >= lhs; i--) {
                idx = Math.max(i - 1, lhs);
    
                times = await this.sweep(source, i, ACCENT_COLOR, times, callback);
    
                if (source[idx].value > source[i].value) {
                    idx = i;
                    break;
                }
            }

            lhs = idx;
        }
        
        if (order === 'descent') {
            for (let i = lhs; i <= rhs; i++) {
                idx = Math.min(i + 1, rhs);
    
                times = await this.sweep(source, i, ACCENT_COLOR, times, callback);
    
                if (source[idx].value > source[i].value) {
                    idx = i;
                    break;
                }
            }

            rhs = idx;
        }
        
        return [times, lhs, rhs];
    }

    // private async sliceByAscent(source: SortDataModel[], lhs: number, rhs: number, times: number, callback: (param: SortStateModel) => void): Promise<[number, number, number]> {
    //     let idx: number = -1;

    //     for (let i = rhs; i >= lhs; i--) {
    //         idx = Math.max(i - 1, lhs);

    //         times = await this.sweep(source, i, ACCENT_COLOR, times, callback);

    //         if (source[idx].value > source[i].value) {
    //             idx = i;
    //             break;
    //         }
    //     }
        
    //     return [times, idx, rhs];
    // }

    // private async sliceByDescent(source: SortDataModel[], lhs: number, rhs: number, times: number, callback: (param: SortStateModel) => void): Promise<[number, number, number]> {
    //     let idx: number = -1;

    //     for (let i = lhs; i <= rhs; i++) {
    //         idx = Math.min(i + 1, rhs);

    //         times = await this.sweep(source, i, ACCENT_COLOR, times, callback);

    //         if (source[idx].value > source[i].value) {
    //             idx = i;
    //             break;
    //         }
    //     }

    //     return [times, lhs, idx];
    // }

}

