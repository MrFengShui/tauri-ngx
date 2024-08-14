import { Injectable } from "@angular/core";
import { floor } from "lodash";

import { delay, PLACE_FST_COLOR, PLACE_FTH_COLOR, PLACE_SND_COLOR, PLACE_TRD_COLOR } from "../../../public/global.utils";
import { CLEAR_COLOR, ACCENT_COLOR, PRIMARY_COLOR, SECONDARY_COLOR } from "../../../public/global.utils";

import { SortDataModel, SortStateModel, SortOrder } from "../ngrx-store/sort.state";

import { SortToolsService } from "../ngrx-store/sort.service";
import { AbstractRecursiveSortService } from "./base-sort.service";

/**
 * 归并排序（自顶向下）
 */
@Injectable()
export class TopDownMergeSortService extends AbstractRecursiveSortService {

    constructor(protected _service: SortToolsService) {
        super();
    }

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
            const mid: number = floor((rhs - lhs) * 0.5 + lhs, 0);
            
            if (order === 'ascent') {
                times = await this.sortByOrder(source, lhs, mid, order, times, callback);
                times = await this.sortByOrder(source, mid + 1, rhs, order, times, callback);
                times = await this._service.mergeByAscent(source, lhs, mid, rhs, times, callback);
            }
            
            if (order === 'descent') {
                times = await this.sortByOrder(source, mid + 1, rhs, order, times, callback);
                times = await this.sortByOrder(source, lhs, mid, order, times, callback);
                times = await this._service.mergeByDescent(source, lhs, mid, rhs, times, callback);
            }
        }

        return times;
    }

}

/**
 * 归并排序（自底向上）
 */
@Injectable()
export class BottomUpMergeSortService extends TopDownMergeSortService {

    protected override async sortByAscent(source: SortDataModel[], lhs: number, rhs: number, option: string | number | undefined, callback: (param: SortStateModel) => void): Promise<void> {
        let start: number, final: number, split: number, times: number = 0;

        for (let gap = 1, length = rhs - lhs + 1; gap < length; gap = gap + gap) {
            for (let i = lhs; i < length - gap; i += gap + gap) {
                start = i;
                split = start + gap - 1;
                final = Math.min(split + gap, rhs);
                times = await this._service.mergeByAscent(source, start, split, final, times, callback);
            }
        }

        await delay();
        await this.complete(source, times, callback);
    }

    protected override async sortByDescent(source: SortDataModel[], lhs: number, rhs: number, option: string | number | undefined, callback: (param: SortStateModel) => void): Promise<void> {
        let start: number, final: number, split: number, times: number = 0;

        for (let gap = 1, length = rhs - lhs + 1; gap < length; gap = gap + gap) {
            for (let i = rhs; i > gap; i -= gap + gap) {
                final = i;
                split = final - gap;
                start = Math.max(split - gap + 1, lhs);
                times = await this._service.mergeByDescent(source, start, split, final, times, callback);
            }
        }

        await delay();
        await this.complete(source, times, callback);
    }

}

/**
 * 原地归并排序（自顶向下）
 */
@Injectable()
export class RecursiveInPlaceMergeSortService extends TopDownMergeSortService {

    protected async mergeByAscent(source: SortDataModel[], lhs: number, mid: number, rhs: number, times: number, callback: (param: SortStateModel) => void): Promise<number> {
        let i: number = lhs, j: number = mid + 1, flag: boolean;

        while (i <= mid && j <= rhs) {
            flag = source[i].value < source[j].value;

            if (flag) {
                times = await this.render(source, i, j, PRIMARY_COLOR, SECONDARY_COLOR, times, callback);
            } else {
                for (let k = i; k < j; k++) {
                    source[i].color = ACCENT_COLOR;
                    callback({ times, datalist: source });

                    await this._service.swapAndRender(source, false, true, k, j, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, times, callback);

                    times += 1;
                }

                source[i].color = CLEAR_COLOR;
                callback({ times, datalist: source });
            }

            i += 1;
            j = flag ? j : j + 1;
            mid = flag ? mid : mid + 1;
        }

        return times;
    }

    protected async mergeByDescent(source: SortDataModel[], lhs: number, mid: number, rhs: number, times: number, callback: (param: SortStateModel) => void): Promise<number> {
        let i: number = rhs, j: number = mid, flag: boolean;
        
        while (i >= mid - 1 && j >= lhs) {
            flag = source[i].value < source[j].value;

            if (flag) {
                times = await this.render(source, i, j, PRIMARY_COLOR, SECONDARY_COLOR, times, callback);
            } else {
                for (let k = i; k > j; k--) {
                    source[i].color = ACCENT_COLOR;
                    callback({ times, datalist: source });

                    await this._service.swapAndRender(source, false, true, k, j, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, times, callback);

                    times += 1;
                }

                source[i].color = CLEAR_COLOR;
                callback({ times, datalist: source });
            }

            i -= 1;
            j = flag ? j : j - 1;
            mid = flag ? mid : mid - 1;
        }

        return times;
    }

}

@Injectable()
export class IterativeInPlaceMergeSortService extends RecursiveInPlaceMergeSortService {

    protected override async sortByAscent(source: SortDataModel[], lhs: number, rhs: number, option: string | number | undefined, callback: (param: SortStateModel) => void): Promise<void> {
        let start: number, final: number, split: number, times: number = 0;
        
        for (let gap = 1, length = rhs - lhs + 1; gap < length; gap = gap + gap) {
            for (let i = lhs; i < length - gap; i += gap + gap) {
                start = i;
                split = start + gap - 1;
                final = Math.min(split + gap, rhs);
                times = await this.mergeByAscent(source, start, split, final, times, callback);
            }
        }

        await delay();
        await this.complete(source, times, callback);
    }

    protected override async sortByDescent(source: SortDataModel[], lhs: number, rhs: number, option: string | number | undefined, callback: (param: SortStateModel) => void): Promise<void> {
        let start: number, final: number, split: number, times: number = 0;
        
        for (let gap = 1, length = rhs - lhs + 1; gap < length; gap = gap + gap) {
            for (let i = rhs; i > gap; i -= gap + gap) {
                final = i;
                split = final - gap;
                start = Math.max(split - gap + 1, lhs);
                times = await this.mergeByDescent(source, start, split, final, times, callback);
            }
        }

        await delay();
        await this.complete(source, times, callback);
    }

}

type MergeRange = { start: number, final: number };

/**
 * 多路归并排序
 */
@Injectable()
export class MultiWayMergeSortService extends TopDownMergeSortService {

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
            let ranges: MergeRange[] | null = this.createMergeRange(lhs, rhs);

            if (order === 'ascent') {
                for (let i = 0, length = ranges.length; i <= length - 1; i++) {
                    times = await this.sortByOrder(source, ranges[i].start, ranges[i].final, order, times, callback);
                }
    
                times = await this.mergeByAscent(source, ranges, times, callback);
            }

            if (order === 'descent') {
                for (let length = ranges.length, i = length - 1; i >= 0; i--) {
                    times = await this.sortByOrder(source, ranges[i].start, ranges[i].final, order, times, callback);
                }

                times = await this.mergeByDescent(source, ranges, times, callback);
            }

            ranges.splice(0);
            ranges = null;
        }
        
        return times;
    }

    private async mergeByAscent(source: SortDataModel[], ranges: MergeRange[], times: number, callback: (param: SortStateModel) => void): Promise<number> {
        let range: MergeRange, index: number = Number.NaN, value: number, offset: number = ranges[0].start;
        
        for (let i = 0, length = ranges.length; i <= length - 1; i++) {
            range = ranges[i];

            if (range.final - range.start + 1 <= this.count) {
                times = await this._service.stableGapSortByAscent(source, range.start, range.final, 1, 1, times, callback);
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

            await this._service.swapAndRender(source, false, false, offset + i, offset + i, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, times, callback);

            times += 1;
        }
        
        this.points.splice(0);
        this.values.splice(0);
        this.array.splice(0);        
        return times;
    }

    private async mergeByDescent(source: SortDataModel[], ranges: MergeRange[], times: number, callback: (param: SortStateModel) => void): Promise<number> {
        let range: MergeRange, index: number = Number.NaN, value: number, offset: number = ranges[ranges.length - 1].final;
        
        for (let length = ranges.length, i = length - 1; i >= 0; i--) {
            range = ranges[i];

            if (range.final - range.start + 1 <= this.count) {
                times = await this._service.stableGapSortByDescent(source, range.start, range.final, 1, 1, times, callback);
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

            await this._service.swapAndRender(source, false, false, offset - i, offset - i, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, times, callback);

            times += 1;
        }
        
        this.points.splice(0);
        this.values.splice(0);
        this.array.splice(0);        
        return times;
    }

    private createMergeRange(lhs: number, rhs: number): MergeRange[] {
        const ranges: MergeRange[] = Array.from([]), step: number = floor((rhs - lhs + 1) / this.count, 0);
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
export class TimSortService extends BottomUpMergeSortService {

    protected override async sortByAscent(source: SortDataModel[], lhs: number, rhs: number, option: string | number | undefined, callback: (param: SortStateModel) => void): Promise<void> {
        const length = rhs - lhs + 1, runLength: number = this.calcRunLength(length);
        let start: number, final: number, split: number, times: number = 0;

        for (let i = lhs; i <= rhs; i += runLength) {
            start = i;
            final = Math.min(rhs, i + runLength - 1);
            times = await this._service.stableGapSortByAscent(source, start, final, 1, 1, times, callback);
        }

        for (let gap = runLength; gap < length; gap = gap + gap) {
            for (let i = lhs; i <= rhs; i += gap + gap) {
                start = i;
                split = i + gap - 1;
                final = Math.min(rhs, split + gap);

                if (split < final) {
                    times = await this._service.mergeByAscent(source, start, split, final, times, callback);
                }
            }
        }

        await delay();
        await this.complete(source, times, callback);
    }

    protected override async sortByDescent(source: SortDataModel[], lhs: number, rhs: number, option: string | number | undefined, callback: (param: SortStateModel) => void): Promise<void> {
        const length = rhs - lhs + 1, runLength: number = this.calcRunLength(length);
        let start: number, final: number, split: number, times: number = 0;

        for (let i = rhs; i >= lhs; i -= runLength) {
            final = i;
            start = Math.max(lhs, i - runLength + 1);
            times = await this._service.stableGapSortByDescent(source, start, final, 1, 1, times, callback);
        }

        for (let gap = runLength; gap < length; gap = gap + gap) {
            for (let i = rhs; i >= lhs; i -= gap + gap) {
                final = i;
                split = i - gap;
                start = Math.max(lhs, split - gap + 1);

                if (split > start) {
                    times = await this._service.mergeByDescent(source, start, split, final, times, callback);
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
