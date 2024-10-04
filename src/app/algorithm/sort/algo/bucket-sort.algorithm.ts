import { ceil, floor, max, min } from "lodash";

import { SortDataModel, SortStateModel, SortOrder, SortIndexRange, SortOption, SortMetaInfo } from "../ngrx-store/sort.state";

import { ACCENT_COLOR, delay, PRIMARY_COLOR, SECONDARY_COLOR } from "../../../public/global.utils";
import { ACCENT_TWO_COLOR, ACCENT_ONE_COLOR } from "../../../public/global.utils";

import { AbstractDistributionSortAlgorithm } from "../pattern/sort-temp.pattern";

import { SortToolsService } from "../ngrx-store/sort.service";
import { InsertionSortAlgorithm } from "./insertion-sort.algorithm";

/**
 * 鸽巢排序
 */
export class PigeonholeSortAlgorithm extends AbstractDistributionSortAlgorithm<SortIndexRange | number> {

    private threshold: number = -1;

    protected override async sortByAscent(source: SortDataModel[], lhs: number, rhs: number, option: SortOption, callback: (param: SortStateModel) => void): Promise<void> {
        let times: number = 0;
        
        this.threshold = min(source.map(item => item.value)) as number;

        times = await this.saveByOrder(source, lhs, rhs, 'ascent', times, callback);
        times = await this.loadByOrder(source, lhs, rhs, 'ascent', times, callback);

        this.freeKeyValues(this.cacheOfKeyValues);

        await delay();
        await this.complete(source, times, callback);
    }

    protected override async sortByDescent(source: SortDataModel[], lhs: number, rhs: number, option: SortOption, callback: (param: SortStateModel) => void): Promise<void> {
        let times: number = 0;

        this.threshold = min(source.map(item => item.value)) as number;

        times = await this.saveByOrder(source, lhs, rhs, 'descent', times, callback);
        times = await this.loadByOrder(source, lhs, rhs, 'descent', times, callback);
        
        this.freeKeyValues(this.cacheOfKeyValues);

        await delay();
        await this.complete(source, times, callback);
    }

    protected override async saveByOrder(source: SortDataModel[], lhs: number, rhs: number, order: SortOrder, times: number, callback: (param: SortStateModel) => void): Promise<number> {
        let j: number = -1, key: string | number, value: number;

        for (let i = lhs; i <= rhs; i++) {
            if (order === 'ascent') j = i;

            if (order === 'descent') j = rhs - i;

            value = source[j].value;
            key = Math.abs(value - this.threshold);

            if (this.keys.includes(key)) {
                this.cacheOfKeyValues[key].push(value);
            } else {
                this.cacheOfKeyValues[key] = Array.from([]);
                this.cacheOfKeyValues[key].push(value);
                this.keys.push(key);
            }

            times = await this.sweep(source, j, ACCENT_ONE_COLOR, times, callback);
            times += 1;
        }

        return times;
    }

    protected override async loadByOrder(source: SortDataModel[], lhs: number, rhs: number, order: SortOrder, times: number, callback: (param: SortStateModel) => void): Promise<number> {
        let key: string | number;
        
        this.keys.splice(0);
        this.keys = Object.keys(this.cacheOfKeyValues);

        if (order === 'ascent') {
            for (let i = lhs; this.keys.length > 0;) {
                key = this.keys.shift() as (string | number);
                this.array = this.cacheOfKeyValues[key];
    
                for (let j = i; this.array.length > 0; j++, i = j) {
                    source[j].value = this.array.shift() as number;
    
                    times = await this.sweep(source, j, ACCENT_TWO_COLOR, times, callback);
                    times += 1;
                }
            }
        }
        
        if (order === 'descent') {
            for (let i = rhs; this.keys.length > 0;) {
                key = this.keys.shift() as (string | number);
                this.array = this.cacheOfKeyValues[key];
    
                for (let j = i; this.array.length > 0; j--, i = j) {
                    source[j].value = this.array.shift() as number;
    
                    times = await this.sweep(source, j, ACCENT_TWO_COLOR, times, callback);
                    times += 1;
                }
            }
        }

        return times;
    }

}

/**
 * 插值排序
 */
export class InterpolationSortAlgorithm extends PigeonholeSortAlgorithm {

    protected minValue: number = -1;
    protected maxValue: number = -1;

    protected override async sortByAscent(source: SortDataModel[], lhs: number, rhs: number, option: SortOption, callback: (param: SortStateModel) => void): Promise<void> {
        let times: number = 0;

        this.minValue = min(source.map(item => item.value)) as number;
        this.maxValue = max(source.map(item => item.value)) as number;
        
        times = await this.saveByOrder(source, lhs, rhs, 'ascent', times, callback);
        times = await this.loadByOrder(source, lhs, rhs, 'ascent', times, callback);
        
        this.freeKeyValues(this.cacheOfKeyValues);

        await delay();
        await this.complete(source, times, callback);
    }

    protected override async sortByDescent(source: SortDataModel[], lhs: number, rhs: number, option: SortOption, callback: (param: SortStateModel) => void): Promise<void> {
        let times: number = 0;

        this.minValue = min(source.map(item => item.value)) as number;
        this.maxValue = max(source.map(item => item.value)) as number;

        times = await this.saveByOrder(source, lhs, rhs, 'descent', times, callback);
        times = await this.loadByOrder(source, lhs, rhs, 'descent', times, callback);
        
        this.freeKeyValues(this.cacheOfKeyValues);

        await delay();
        await this.complete(source, times, callback);
    }

    protected override async saveByOrder(source: SortDataModel[], lhs: number, rhs: number, order: SortOrder, times: number, callback: (param: SortStateModel) => void): Promise<number> {
        let j: number = -1, key: string | number, value: number;

        for (let i = lhs; i <= rhs; i++) {
            if (order === 'ascent') j = i;

            if (order === 'descent') j = rhs - i;

            key = floor((rhs - lhs) * (source[j].value - this.minValue) / (this.maxValue - this.minValue), 0);
            value = source[j].value;

            if (this.keys.includes(key)) {
                this.cacheOfKeyValues[key].push(value);
            } else {
                this.cacheOfKeyValues[key] = Array.from([]);
                this.cacheOfKeyValues[key].push(value);
                this.keys.push(key);
            }

            times = await this.sweep(source, j, ACCENT_ONE_COLOR, times, callback);
            times += 1;
        }
        
        return times;
    }

}

/**
 * 桶排序
 */
export class BucketSortAlgorithm extends PigeonholeSortAlgorithm {

    protected insertSort: InsertionSortAlgorithm | null = null;

    constructor(protected override _service: SortToolsService) {
        super(_service);

        if (this.insertSort === null) this.insertSort = new InsertionSortAlgorithm(_service);
    }

    protected override async sortByAscent(source: SortDataModel[], lhs: number, rhs: number, option: SortOption, callback: (param: SortStateModel) => void): Promise<void> {
        if (this.insertSort === null) throw new Error(`错误：引用对象${this.insertSort}未被初始化。`);

        let range: SortIndexRange | null, times: number = 0;
        
        times = await this.saveByOrder(source, lhs, rhs, 'ascent', times, callback);
        times = await this.loadByOrder(source, lhs, rhs, 'ascent', times, callback);        

        this.freeKeyValues(this.cacheOfKeyValues);

        while (this.array.length > 0) {
            range = this.array.shift() as SortIndexRange;
            [times] = await this.insertSort.sortByOrder(source, range.start, range.final, 1, 1, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, 'ascent', times, callback);
        }

        range = null;

        await delay();
        await this.complete(source, times, callback);
    }

    protected override async sortByDescent(source: SortDataModel[], lhs: number, rhs: number, option: SortOption, callback: (param: SortStateModel) => void): Promise<void> {
        if (this.insertSort === null) throw new Error(`错误：引用对象${this.insertSort}未被初始化。`);

        let range: SortIndexRange | null, times: number = 0;
        
        times = await this.saveByOrder(source, lhs, rhs, 'descent', times, callback);
        times = await this.loadByOrder(source, lhs, rhs, 'descent', times, callback);

        this.freeKeyValues(this.cacheOfKeyValues);

        while (this.array.length > 0) {
            range = this.array.shift() as SortIndexRange;
            [times] = await this.insertSort.sortByOrder(source, range.start, range.final, 1, 1, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, 'descent', times, callback);
        }

        range = null;

        await delay();
        await this.complete(source, times, callback);
    }

    protected override async saveByOrder(source: SortDataModel[], lhs: number, rhs: number, order: SortOrder, times: number, callback: (param: SortStateModel) => void): Promise<number> {
        let key: string | number, value: number, k: number = -1;

        for (let i = lhs; i <= rhs; i++) {
            if (order === 'ascent') {
                k = i;
            }

            if (order === 'descent') {
                k = rhs - i;
            }

            key = floor(source[k].value / this.THRESHOLD, 0);
            value = source[k].value;

            if (this.keys.includes(key)) {
                this.cacheOfKeyValues[key].push(value);
            } else {
                this.cacheOfKeyValues[key] = Array.from([]);
                this.cacheOfKeyValues[key].push(value);
                this.keys.push(key);
            }

            times = await this.sweep(source, k, ACCENT_ONE_COLOR, times, callback);
            times += 1;
        }

        return times;
    }

    protected override async loadByOrder(source: SortDataModel[], lhs: number, rhs: number, order: SortOrder, times: number, callback: (parram: SortStateModel) => void): Promise<number> {
        let key: string | number, values: number[];

        this.keys.splice(0);
        this.keys = Object.keys(this.cacheOfKeyValues);

        if (order === 'ascent') {
            for (let i = lhs; this.keys.length > 0;) {
                key = this.keys.shift() as (string | number);
                values = this.cacheOfKeyValues[key] as number[];
    
                this.array.push({ start: i, final: i + values.length - 1 });
    
                for (let j = i; values.length > 0; j++, i++) {
                    source[j].value = values.shift() as number;
    
                    times = await this.sweep(source, j, ACCENT_TWO_COLOR, times, callback);
                    times += 1;
                }
            }
        }

        if (order === 'descent') {
            for (let i = rhs; this.keys.length > 0;) {
                key = this.keys.shift() as (string | number);
                values = this.cacheOfKeyValues[key] as number[];
    
                this.array.push({ start: i - values.length + 1, final: i });
    
                for (let j = i; values.length > 0; j--, i--) {
                    source[j].value = values.shift() as number;
    
                    times = await this.sweep(source, j, ACCENT_TWO_COLOR, times, callback);
                    times += 1;
                }
            }
        }
        
        return times;
    }

}

/**
 * 原地桶排序
 */
export class InPlaceBucketSortAlgorithm extends BucketSortAlgorithm {

    protected override async sortByAscent(source: SortDataModel[], lhs: number, rhs: number, option: SortOption, callback: (param: SortStateModel) => void): Promise<void> {
        if (this.insertSort === null) throw new Error(`错误：引用对象${this.insertSort}未被初始化。`);

        const threshold: number = max(source.map(item => item.value)) as number;
        let range: SortIndexRange | null, idx: number = lhs, minValue: number, maxValue: number = this.THRESHOLD, times: number = 0;

        while (true) {
            minValue = maxValue - this.THRESHOLD + 1;

            range = { start: idx, final: idx };

            for (let i = idx; i <= rhs; i++) {
                if (source[i].value >= minValue && source[i].value <= maxValue) {
                    times = await this.insertSort.moveByOrder(source, idx, i, PRIMARY_COLOR, SECONDARY_COLOR, 'ascent', times, callback);

                    idx += 1;
                } else {
                    times = await this.dualSweep(source, idx, i, PRIMARY_COLOR, SECONDARY_COLOR, times, callback);
                }
            }

            range = { ...range, final: idx >= rhs ? rhs : idx - 1 };
            this.array.push(range);

            if (maxValue === threshold) break;

            maxValue = Math.min(maxValue + this.THRESHOLD, threshold);
        }

        while (this.array.length > 0) {
            range = this.array.shift() as SortIndexRange;
            [times] = await this.insertSort.sortByOrder(source, range.start, range.final, 1, 1, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, 'ascent', times, callback);
        }

        range = null;

        await delay();
        await this.complete(source, times, callback);
    }

    protected override async sortByDescent(source: SortDataModel[], lhs: number, rhs: number, option: SortOption, callback: (param: SortStateModel) => void): Promise<void> {
        if (this.insertSort === null) throw new Error(`错误：引用对象${this.insertSort}未被初始化。`);

        const threshold: number = max(source.map(item => item.value)) as number;
        let range: SortIndexRange | null, idx: number = rhs, minValue: number, maxValue: number = this.THRESHOLD, times: number = 0;

        while (true) {
            minValue = maxValue - this.THRESHOLD + 1;

            range = { start: idx, final: idx };

            for (let i = idx; i >= lhs; i--) {
                if (source[i].value >= minValue && source[i].value <= maxValue) {
                    times = await this.insertSort.moveByOrder(source, i, idx, PRIMARY_COLOR, SECONDARY_COLOR, 'descent', times, callback);

                    idx -= 1;
                } else {
                    times = await this.dualSweep(source, idx, i, PRIMARY_COLOR, SECONDARY_COLOR, times, callback);
                }
            }

            range = { ...range, start: idx <= lhs ? lhs : idx + 1 };
            this.array.push(range);

            if (maxValue === threshold) break;

            maxValue = Math.min(maxValue + this.THRESHOLD, threshold);
        }

        while (this.array.length > 0) {
            range = this.array.shift() as SortIndexRange;
            [times] = await this.insertSort.sortByOrder(source, range.start, range.final, 1, 1, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, 'descent', times, callback);
        }

        range = null;

        await delay();
        await this.complete(source, times, callback);
    }

}

type BucketSlots = { lhs: number[], mid: number[], rhs: number[] };

/**
 * 三槽桶排序（递归）
 */
export class RecursiveThreeSlotBucketSortAlgorithm extends BucketSortAlgorithm {

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

    private async sortByOrder(source: SortDataModel[], lhs: number, rhs: number, order: SortOrder, times: number, callback: (param: SortStateModel) => void): Promise<number> {
        if (this.insertSort === null) throw new Error(`错误：引用对象${this.insertSort}未被初始化。`);

        if (rhs - lhs + 1 <= this.THRESHOLD) {
            [times] = await this.insertSort.sortByOrder(source, lhs, rhs, 1, 1, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, order, times, callback);
        } else {
            let slots: BucketSlots | null, ranges: SortIndexRange[] | null, range: SortIndexRange, fstValue: number, sndValue: number;

            this.array = source.map(item => item.value).slice(lhs, rhs + 1);  
            
            [fstValue, sndValue] = this.partition(this.array as number[]);

            this.array.splice(0);
            
            [times, slots] = await this.newSaveByOrder(source, lhs, rhs, fstValue, sndValue, order, times, callback);
            [times, ranges] = await this.newLoadByOrder(source, lhs, rhs, slots, order, times, callback);

            this.freeKeyValues(slots);
            slots = null;

            while (ranges.length > 0) {
                range = ranges.shift() as SortIndexRange;
                times = await this.sortByOrder(source, range.start, range.final, order, times, callback);
            }

            ranges = null;
        }
        
        return times;
    }

    protected async newSaveByOrder(source: SortDataModel[], lhs: number, rhs: number, fstValue: number, sndValue: number, order: SortOrder, times: number, callback: (param: SortStateModel) => void): Promise<[number, BucketSlots]> {
        let slots: BucketSlots = { lhs: [], mid: [], rhs: [] }, index: number = -1, value: number;

        for (let i = lhs; i <= rhs; i++) {
            if (order === 'ascent') {
                index = i;
            }

            if (order === 'descent') {
                index = rhs - i + lhs;
            }

            value = source[index].value;

            if (value < fstValue) {
                slots.lhs.push(value);
            } else if (value > sndValue) {
                slots.rhs.push(value);
            } else {
                slots.mid.push(value);
            }

            times = await this.sweep(source, index, ACCENT_ONE_COLOR, times, callback);
            times += 1;
        }

        return [times, slots];
    }

    protected async newLoadByOrder(source: SortDataModel[], lhs: number, rhs: number, slots: BucketSlots, order: SortOrder, times: number, callback: (param: SortStateModel) => void): Promise<[number, SortIndexRange[]]> {
        let index: number = -1, ranges: SortIndexRange[] = Array.from([]);

        if (order === 'ascent') {
            index = lhs;
        }

        if (order === 'descent') {
            index = rhs;
        }

        for (let i = 0; i < 3; i++) {
            if (i === 0) {
                this.array = slots.lhs;
            } else if (i === 1) {
                this.array = slots.mid;
            } else {
                this.array = slots.rhs;
            }

            ranges[i] = { start: index, final: index };

            if (order === 'ascent') {
                for (let j = index; this.array.length > 0; j++) {
                    source[j].value = this.array.shift() as number;
        
                    times = await this.sweep(source, j, ACCENT_TWO_COLOR, times, callback);
                    times += 1;
                    index += 1;
                }

                ranges[i].final = index - 1;
            }

            if (order === 'descent') {
                for (let j = index; this.array.length > 0; j--) {
                    source[j].value = this.array.shift() as number;
        
                    times = await this.sweep(source, j, ACCENT_TWO_COLOR, times, callback);
                    times += 1;
                    index -= 1;
                }

                ranges[i].start = index + 1;
            }
        }
        
        return [times, ranges];
    }

    protected partition(array: number[]): [number, number] {
        const minValue: number = min(array) as number, maxValue: number = max(array) as number;
        const fstValue: number = floor((maxValue - minValue) * 0.25 + minValue, 0);
        const sndValue: number = ceil((maxValue - minValue) * 0.75 + minValue, 0);
        return [fstValue, sndValue];
    }

}

/**
 * 三槽桶排序（迭代）
 */
export class IterativeThreeSlotBucketSortAlgorithm extends RecursiveThreeSlotBucketSortAlgorithm {

    private slots: BucketSlots = { lhs: [], mid: [], rhs: [] };

    protected override async sortByAscent(source: SortDataModel[], lhs: number, rhs: number, option: SortOption, callback: (param: SortStateModel) => void): Promise<void> {
        if (this.insertSort === null) throw new Error(`错误：引用对象${this.insertSort}未被初始化。`);

        let range: SortIndexRange | null, minValue: number, maxValue: number, fstValue: number, sndValue: number, times: number = 0;

        this.stack.push(rhs);
        this.stack.push(lhs);

        while (this.stack.length > 0) {
            lhs = this.stack.pop() as number;
            rhs = this.stack.pop() as number;

            if (rhs - lhs + 1 <= this.THRESHOLD) {
                [times] = await this.insertSort.sortByOrder(source, lhs, rhs, 1, 1, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, 'ascent', times, callback);
            } else {
                this.array = source.map(item => item.value).slice(lhs, rhs + 1);

                [fstValue, sndValue] = this.partition(this.array as number[]);

                this.array.splice(0);
    
                [times, this.slots] = await this.newSaveByOrder(source, lhs, rhs, fstValue, sndValue, 'ascent', times, callback);
                [times, this.array] = await this.newLoadByOrder(source, lhs, rhs, this.slots, 'ascent', times, callback);
                
                while (this.array.length > 0) {
                    range = this.array.pop() as SortIndexRange;
                    this.stack.push(range.final);
                    this.stack.push(range.start);
                }
            }
        }
        
        await delay();
        await this.complete(source, times, callback);
    }

    protected override async sortByDescent(source: SortDataModel[], lhs: number, rhs: number, option: SortOption, callback: (param: SortStateModel) => void): Promise<void> {
        if (this.insertSort === null) throw new Error(`错误：引用对象${this.insertSort}未被初始化。`);

        let range: SortIndexRange | null, minValue: number, maxValue: number, fstValue: number, sndValue: number, times: number = 0;

        this.stack.push(lhs);
        this.stack.push(rhs);

        while (this.stack.length > 0) {
            rhs = this.stack.pop() as number;
            lhs = this.stack.pop() as number;

            if (rhs - lhs + 1 <= this.THRESHOLD) {
                [times] = await this.insertSort.sortByOrder(source, lhs, rhs, 1, 1, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, 'descent', times, callback);
            } else {
                this.array = source.map(item => item.value).slice(lhs, rhs + 1);

                [fstValue, sndValue] = this.partition(this.array as number[]);
    
                this.array.splice(0);
    
                [times, this.slots] = await this.newSaveByOrder(source, lhs, rhs, fstValue, sndValue, 'descent', times, callback);
                [times, this.array] = await this.newLoadByOrder(source, lhs, rhs, this.slots, 'descent', times, callback);
    
                while (this.array.length > 0) {
                    range = this.array.pop() as SortIndexRange;
                    this.stack.push(range.start);
                    this.stack.push(range.final);
                }
            }
        }

        await delay();
        await this.complete(source, times, callback);
    }

}

/**
 * 闪电排序
 */
export class FlashSortAlgorithm extends BucketSortAlgorithm {

    protected override async sortByAscent(source: SortDataModel[], lhs: number, rhs: number, option: SortOption, callback: (param: SortStateModel) => void): Promise<void> {
        let metainfo: SortMetaInfo | null, times: number = 0;

        [times, metainfo] = await this.newSaveByOrder(source, lhs, rhs, 'ascent', times, callback);
        
        this.freeKeyValue(this.cacheOfKeyValue);

        times = await this.newLoadByOrder(source, metainfo, 'ascent', times, callback);

        metainfo = null;

        await delay();
        await this.complete(source, times, callback);
    }

    protected override async sortByDescent(source: SortDataModel[], lhs: number, rhs: number, option: SortOption, callback: (param: SortStateModel) => void): Promise<void> {
        let metainfo: SortMetaInfo | null, times: number = 0;

        [times, metainfo] = await this.newSaveByOrder(source, lhs, rhs, 'descent', times, callback);
        
        this.freeKeyValue(this.cacheOfKeyValue);

        times = await this.newLoadByOrder(source, metainfo, 'descent', times, callback);

        metainfo = null;

        await delay();
        await this.complete(source, times, callback);
    }

    protected async newSaveByOrder(source: SortDataModel[], lhs: number, rhs: number, order: SortOrder, times: number, callback: (param: SortStateModel) => void): Promise<[number, SortMetaInfo]> {
        const percent: number = Math.log2(rhs - lhs + 1) * 0.01;
        const metainfo: SortMetaInfo = {
            count: Math.max(ceil(percent * (rhs - lhs + 1), 0), 1),
            minValue: min(source.map(item => item.value)) as number,
            maxValue: max(source.map(item => item.value)) as number
        };
        let range: SortIndexRange, key: string | number, value: number, index: number = -1;

        for (let i = lhs; i <= rhs; i++) {
            if (order === 'ascent') index = lhs + i;

            if (order === 'descent') index = rhs - i;

            key = this.findBucketID(source[index].value, metainfo);

            times = await this.sweep(source, index, ACCENT_COLOR, times, callback);
            times += 1;
            
            if (this.keys.includes(key)) {
                value = this.cacheOfKeyValue[key] as number;
                this.cacheOfKeyValue[key] = value + 1;
            } else {
                this.cacheOfKeyValue[key] = 1;
                this.keys.push(key);
            }
        }

        this.keys.splice(0);
        this.keys = Object.keys(this.cacheOfKeyValue);

        if (order === 'ascent') {
            for (let i = lhs; this.keys.length > 0; i = Math.min(range.final + 1, rhs)) {
                key = this.keys.shift() as (string | number);
                value = this.cacheOfKeyValue[key] as number;
                range = { start: i, final: i + value - 1 };
                this.array.push(range);
            }
        }
        
        if (order === 'descent') {
            for (let i = rhs; this.keys.length > 0; i = Math.max(range.start - 1, lhs)) {
                key = this.keys.shift() as (string | number);
                value = this.cacheOfKeyValue[key] as number;
                range = { start: i - value + 1, final: i };
                this.array.push(range);
            }
        }
        
        return [times, metainfo];
    }

    protected async newLoadByOrder(source: SortDataModel[], metainfo: SortMetaInfo, order: SortOrder, times: number, callback: (param: SortStateModel) => void): Promise<number> {
        if (this.insertSort === null) throw new Error(`错误：引用对象${this.insertSort}未被初始化。`);

        let range: SortIndexRange | null;
        
        for (let id = 0, length = this.array.length; id < length; id++) {
            range = this.array[id] as SortIndexRange;
            
            if (order === 'ascent') {
                for (let i = range.start; i <= range.final; i++) {
                    times = await this.cycleByOrder(source, i, id, metainfo, order, times, callback);
                }
            }
            
            if (order === 'descent') {
                for (let i = range.final; i >= range.start; i--) {
                    times = await this.cycleByOrder(source, i, id, metainfo, order, times, callback);
                }
            }
        }

        while (this.array.length > 0) {
            range = this.array.shift() as SortIndexRange;

            [times] = await this.insertSort.sortByOrder(source, range.start, range.final, 1, 1, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, order, times, callback);
        }

        return times;
    }

    protected async cycleByOrder(source: SortDataModel[], i: number, id: number, metainfo: SortMetaInfo, order: SortOrder, times: number, callback: (param: SortStateModel) => void): Promise<number> {
        if (this.insertSort === null) throw new Error(`错误：引用对象${this.insertSort}未被初始化。`);

        let range: SortIndexRange | null, key: number, k: number;

        while (true) {
            key = this.findBucketID(source[i].value, metainfo);
            range = this.array[key] as SortIndexRange;
            k = -1;

            if (this.queue.length === 0) {
                for (let j = range.start; j <= range.final; j++) this.queue.push(j);
            }

            if (order === 'ascent') {
                for (let j = range.start; j <= range.final; j++) {
                    key = this.findBucketID(source[j].value, metainfo);
    
                    times = await this.dualSweep(source, i, j, PRIMARY_COLOR, SECONDARY_COLOR, times, callback);
    
                    if (key === id) {
                        k = j;
                        break;
                    }
                }
            }

            if (order === 'descent') {
                for (let j = range.final; j >= range.start; j--) {
                    key = this.findBucketID(source[j].value, metainfo);
    
                    times = await this.dualSweep(source, i, j, PRIMARY_COLOR, SECONDARY_COLOR, times, callback);
    
                    if (key === id) {
                        k = j;
                        break;
                    }
                }
            }
            
            if (k === -1) {
                if (order === 'ascent') k = this.queue.shift() as number;

                if (order === 'descent') k = this.queue.pop() as number;

                times = await this.insertSort.exchange(source, true, i, k, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, times, callback);
            } else {
                times = await this.insertSort.exchange(source, true, i, k, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, times, callback);

                this.queue.splice(0);
                range = null;
                break;
            }
        }

        return times;
    }

    protected findBucketID(value: number, metainfo: SortMetaInfo): number {
        return floor(metainfo.count * (value - metainfo.minValue) / (metainfo.maxValue - metainfo.minValue + 1), 0);
    }

}
