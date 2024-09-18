import { Injectable } from "@angular/core";

import { SortDataModel, SortStateModel, SortOrder, SortIndexRange } from "../ngrx-store/sort.state";

import { ACCENT_COLOR, delay, PRIMARY_COLOR, SECONDARY_COLOR } from "../../../public/global.utils";
import { ACCENT_TWO_COLOR, ACCENT_ONE_COLOR, PRIMARY_ONE_COLOR, SECONDARY_ONE_COLOR, PRIMARY_TWO_COLOR, SECONDARY_TWO_COLOR } from "../../../public/global.utils";

import { AbstractComparisonSortService, AbstractDistributionSortService } from "./base-sort.service";
import { ceil, floor } from "lodash";
import { SortToolsService } from "../ngrx-store/sort.service";
import { InsertionSortService } from "./insertion-sort.service";

/**
 * 鸽巢排序
 */
@Injectable()
export class PigeonholeSortService extends AbstractDistributionSortService<number> {

    private threshold: number = -1;

    protected override async sortByAscent(source: SortDataModel[], lhs: number, rhs: number, option: string | number | undefined, callback: (param: SortStateModel) => void): Promise<void> {
        let times: number = 0;
        
        this.threshold = Math.min(...source.map(item => item.value));

        times = await this.saveByOrder(source, lhs, rhs, 'ascent', times, callback);
        times = await this.loadByOrder(source, lhs, rhs, 'ascent', times, callback);

        this.freeKeyValues(this.cacheOfKeyValues);

        await delay();
        await this.complete(source, times, callback);
    }

    protected override async sortByDescent(source: SortDataModel[], lhs: number, rhs: number, option: string | number| undefined, callback: (param: SortStateModel) => void): Promise<void> {
        let times: number = 0;

        this.threshold = Math.min(...source.map(item => item.value));

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
    
                for (let j = i; this.array.length > 0; j++, i++) {
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
    
                for (let j = i; this.array.length > 0; j--, i--) {
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
@Injectable()
export class InterpolationSortService extends PigeonholeSortService {

    private minValue: number = -1;
    private maxValue: number = -1;

    protected override async sortByAscent(source: SortDataModel[], lhs: number, rhs: number, option: string | number | undefined, callback: (param: SortStateModel) => void): Promise<void> {
        let times: number = 0;

        this.minValue = Math.min(...source.map(item => item.value));
        this.maxValue = Math.max(...source.map(item => item.value));
        
        times = await this.saveByOrder(source, lhs, rhs, 'ascent', times, callback);
        times = await this.loadByOrder(source, lhs, rhs, 'ascent', times, callback);
        
        this.freeKeyValues(this.cacheOfKeyValues);

        await delay();
        await this.complete(source, times, callback);
    }

    protected override async sortByDescent(source: SortDataModel[], lhs: number, rhs: number, option: string | number | undefined, callback: (param: SortStateModel) => void): Promise<void> {
        let times: number = 0;

        this.minValue = Math.min(...source.map(item => item.value));
        this.maxValue = Math.max(...source.map(item => item.value));

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

            key = Math.floor(rhs * (source[j].value - this.minValue) / (this.maxValue - this.minValue));
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
@Injectable()
export class BucketSortService extends PigeonholeSortService {

    protected ranges: SortIndexRange[] = Array.from([]);
    protected range: SortIndexRange | null = null;

    constructor(
        protected override _service: SortToolsService,
        protected _insertSortService: InsertionSortService
    ) {
        super(_service);
    }

    protected override async sortByAscent(source: SortDataModel[], lhs: number, rhs: number, option: string | number | undefined, callback: (param: SortStateModel) => void): Promise<void> {
        let times: number = 0;
        
        times = await this.saveByOrder(source, lhs, rhs, 'ascent', times, callback);
        times = await this.loadByOrder(source, lhs, rhs, 'ascent', times, callback);        

        this.freeKeyValues(this.cacheOfKeyValues);

        while (this.ranges.length > 0) {
            this.range = this.ranges.shift() as SortIndexRange;
            times = await this._insertSortService.sortByOrder(source, this.range.start, this.range.final, 1, 1, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, 'ascent', times, callback);
        }

        await delay();
        await this.complete(source, times, callback);
    }

    protected override async sortByDescent(source: SortDataModel[], lhs: number, rhs: number, option: string | number | undefined, callback: (param: SortStateModel) => void): Promise<void> {
        let times: number = 0;
        
        times = await this.saveByOrder(source, lhs, rhs, 'descent', times, callback);
        times = await this.loadByOrder(source, lhs, rhs, 'descent', times, callback);

        this.freeKeyValues(this.cacheOfKeyValues);

        while (this.ranges.length > 0) {
            this.range = this.ranges.shift() as SortIndexRange;
            times = await this._insertSortService.sortByOrder(source, this.range.start, this.range.final, 1, 1, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, 'descent', times, callback);
        }

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
                values = this.cacheOfKeyValues[key];
    
                this.ranges.push({ start: i, final: i + values.length - 1 });
    
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
                values = this.cacheOfKeyValues[key];
    
                this.ranges.push({ start: i - values.length + 1, final: i });
    
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
@Injectable()
export class InPlaceBucketSortService extends AbstractComparisonSortService {

    private ranges: SortIndexRange[] = Array.from([]);
    private range: SortIndexRange | null = null;

    constructor(
        protected override _service: SortToolsService,
        protected _insertSortService: InsertionSortService
    ) {
        super(_service);
    }

    protected override async sortByAscent(source: SortDataModel[], lhs: number, rhs: number, option: string | number | undefined, callback: (param: SortStateModel) => void): Promise<void> {
        const value: number = Math.max(...source.map(item => item.value));
        let start: number, final: number, idx: number = lhs, flag: boolean, times: number = 0;
        
        for (let threshold = this.THRESHOLD; threshold <= value; threshold += this.THRESHOLD) {
            final = threshold - 1;
            start = threshold - this.THRESHOLD;

            this.range = { start: idx, final: idx };

            for (let j = idx; j <= rhs; j++) {
                flag = source[j].value >= start && source[j].value <= final;                
                times = await this.exchange(source, flag, j, idx, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, times, callback);

                if (flag) idx += 1;
            }

            this.range.final = idx - 1;
            this.ranges.push(this.range);
        }

        this.ranges.push({ start: idx, final: rhs });
        
        while (this.ranges.length > 0) {
            this.range = this.ranges.shift() as SortIndexRange;

            if (this.range.start < this.range.final) {
                times = await this._insertSortService.sortByOrder(source, this.range.start, this.range.final, 1, 1, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, 'ascent', times, callback);
            }
        }

        await delay();
        await this.complete(source, times, callback);
    }

    protected override async sortByDescent(source: SortDataModel[], lhs: number, rhs: number, option: string | number | undefined, callback: (param: SortStateModel) => void): Promise<void> {
        const value: number = Math.max(...source.map(item => item.value));
        let start: number, final: number, idx: number = rhs, flag: boolean, times: number = 0;
        
        for (let threshold = this.THRESHOLD; threshold <= value; threshold += this.THRESHOLD) {
            final = threshold - 1;
            start = threshold - this.THRESHOLD;

            this.range = { start: idx, final: idx };

            for (let j = idx; j >= lhs; j--) {
                flag = source[j].value >= start && source[j].value <= final;
                times = await this.exchange(source, flag, j, idx, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, times, callback);

                if (flag) idx -= 1;
            }

            this.range.start = idx + 1;
            this.ranges.push(this.range);
        }

        this.ranges.push({ start: lhs, final: idx });
        
        while (this.ranges.length > 0) {
            this.range = this.ranges.shift() as SortIndexRange;

            if (this.range.start < this.range.final) {
                times = await this._insertSortService.sortByOrder(source, this.range.start, this.range.final, 1, 1, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, 'descent', times, callback);
            }
        }

        await delay();
        await this.complete(source, times, callback);
    }

}

type BucketSlots = { lhs: number[], mid: number[], rhs: number[] };

/**
 * 三槽桶排序（递归）
 */
@Injectable()
export class RecursiveThreeSlotBucketSortService extends BucketSortService {

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

    private async sortByOrder(source: SortDataModel[], lhs: number, rhs: number, order: SortOrder, times: number, callback: (param: SortStateModel) => void): Promise<number> {
        if (rhs - lhs + 1 <= this.THRESHOLD) {
            times = await this._insertSortService.sortByOrder(source, lhs, rhs, 1, 1, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, order, times, callback);
        } else {
            this.array = source.map(item => item.value).slice(lhs, rhs + 1);
            
            const minValue: number = Math.min(...this.array), maxValue: number = Math.max(...this.array);
            const fstValue: number = floor((maxValue - minValue) * 0.25 + minValue, 0);
            const sndValue: number = ceil((maxValue - minValue) * 0.75 + minValue, 0);
            let slots: BucketSlots | null = { lhs: [], mid: [], rhs: [] }, ranges: SortIndexRange[] | null, range: SortIndexRange;

            this.array.splice(0);
            
            [times, slots] = await this.newSaveByOrder(source, lhs, rhs, fstValue, sndValue, slots, order, times, callback);
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

    protected async newSaveByOrder(source: SortDataModel[], lhs: number, rhs: number, fstValue: number, sndValue: number, slots: BucketSlots, order: SortOrder, times: number, callback: (param: SortStateModel) => void): Promise<[number, BucketSlots]> {
        let index: number = -1, value: number;

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

}

/**
 * 三槽桶排序（迭代）
 */
@Injectable()
export class IterativeThreeSlotBucketSortService extends RecursiveThreeSlotBucketSortService {

    private slots: BucketSlots = { lhs: [], mid: [], rhs: [] };

    protected override async sortByAscent(source: SortDataModel[], lhs: number, rhs: number, option: string | number | undefined, callback: (param: SortStateModel) => void): Promise<void> {
        let minValue: number, maxValue: number, fstValue: number, sndValue: number, times: number = 0;

        this.stack.push(rhs);
        this.stack.push(lhs);

        while (this.stack.length > 0) {
            lhs = this.stack.pop() as number;
            rhs = this.stack.pop() as number;

            if (rhs - lhs + 1 <= this.THRESHOLD) {
                times = await this._insertSortService.sortByOrder(source, lhs, rhs, 1, 1, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, 'ascent', times, callback);
            } else {
                this.array = source.map(item => item.value).slice(lhs, rhs + 1);

                minValue = Math.min(...this.array);
                maxValue = Math.max(...this.array);
                fstValue = floor((maxValue - minValue) * 0.25 + minValue, 0);
                sndValue = ceil((maxValue - minValue) * 0.75 + minValue, 0);

                this.array.splice(0);
    
                [times, this.slots] = await this.newSaveByOrder(source, lhs, rhs, fstValue, sndValue, this.slots, 'ascent', times, callback);
                [times, this.ranges] = await this.newLoadByOrder(source, lhs, rhs, this.slots, 'ascent', times, callback);
                
                while (this.ranges.length > 0) {
                    this.range = this.ranges.pop() as SortIndexRange;
                    this.stack.push(this.range.final);
                    this.stack.push(this.range.start);
                }
            }
        }
        
        await delay();
        await this.complete(source, times, callback);
    }

    protected override async sortByDescent(source: SortDataModel[], lhs: number, rhs: number, option: string | number | undefined, callback: (param: SortStateModel) => void): Promise<void> {
        let minValue: number, maxValue: number, fstValue: number, sndValue: number, times: number = 0;

        this.stack.push(lhs);
        this.stack.push(rhs);

        while (this.stack.length > 0) {
            rhs = this.stack.pop() as number;
            lhs = this.stack.pop() as number;

            if (rhs - lhs + 1 <= this.THRESHOLD) {
                times = await this._insertSortService.sortByOrder(source, lhs, rhs, 1, 1, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, 'descent', times, callback);
            } else {
                this.array = source.map(item => item.value).slice(lhs, rhs + 1);

                minValue = Math.min(...this.array);
                maxValue = Math.max(...this.array);
                fstValue = floor((maxValue - minValue) * 0.25 + minValue, 0);
                sndValue = ceil((maxValue - minValue) * 0.25 + minValue, 0);
    
                this.array.splice(0);
    
                [times, this.slots] = await this.newSaveByOrder(source, lhs, rhs, fstValue, sndValue, this.slots, 'descent', times, callback);
                [times, this.ranges] = await this.newLoadByOrder(source, lhs, rhs, this.slots, 'descent', times, callback);
    
                while (this.ranges.length > 0) {
                    this.range = this.ranges.pop() as SortIndexRange;
                    this.stack.push(this.range.start);
                    this.stack.push(this.range.final);
                }
            }
        }

        await delay();
        await this.complete(source, times, callback);
    }

}
