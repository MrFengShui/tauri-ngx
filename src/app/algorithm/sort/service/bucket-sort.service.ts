import { Injectable } from "@angular/core";

import { SortDataModel, SortStateModel, SortOrder } from "../ngrx-store/sort.state";

import { delay } from "../../../public/global.utils";
import { ACCENT_TWO_COLOR, ACCENT_ONE_COLOR, PRIMARY_ONE_COLOR, SECONDARY_ONE_COLOR, PRIMARY_TWO_COLOR, SECONDARY_TWO_COLOR } from "../../../public/global.utils";

import { AbstractDistributionSortService } from "./base-sort.service";

/**
 * 鸽巢排序
 */
@Injectable()
export class PigeonholeSortService extends AbstractDistributionSortService {

    private threshold: number = -1;

    protected override async sortByAscent(source: SortDataModel[], lhs: number, rhs: number, option: string | number | undefined, callback: (param: SortStateModel) => void): Promise<void> {
        let times: number = 0, values: [number, number] = this._service.findMinMaxValue(source, lhs, rhs);
        
        this.threshold = values[0];

        times = await this.save(source, lhs, rhs, 'ascent', times, callback);
        times = await this.load(source, lhs, rhs, 'ascent', times, callback);

        this.freeKeyValues(this.cacheOfKeyValues);

        await delay();
        await this.complete(source, times, callback);
    }

    protected override async sortByDescent(source: SortDataModel[], lhs: number, rhs: number, option: string | number| undefined, callback: (param: SortStateModel) => void): Promise<void> {
        let times: number = 0, values: [number, number] = this._service.findMinMaxValue(source, lhs, rhs);

        this.threshold = values[0];

        times = await this.save(source, lhs, rhs, 'descent', times, callback);
        times = await this.load(source, lhs, rhs, 'descent', times, callback);
        
        this.freeKeyValues(this.cacheOfKeyValues);

        await delay();
        await this.complete(source, times, callback);
    }

    protected override async save(source: SortDataModel[], lhs: number, rhs: number, order: SortOrder, times: number, callback: (param: SortStateModel) => void): Promise<number> {
        let index: number, value: number;

        if (order === 'ascent') {
            for (let i = 0, length = source.length; i <= length - 1; i++) {
                value = source[i].value;
                index = Math.abs(value - this.threshold);
    
                if (!this.cacheOfKeyValues[index]) {
                    this.cacheOfKeyValues[index] = Array.from([]);
                }
    
                this.cacheOfKeyValues[index].push(value);
                
                await this._service.swapAndRender(source, false, false, i, i, PRIMARY_ONE_COLOR, SECONDARY_ONE_COLOR, ACCENT_ONE_COLOR, times, callback);

                times += 1;
            }
        }
        

        if (order === 'descent') {
            for (let length = source.length, i = length - 1; i >= 0; i--) {
                value = source[i].value;
                index = Math.abs(value - this.threshold);
    
                if (!this.cacheOfKeyValues[index]) {
                    this.cacheOfKeyValues[index] = Array.from([]);
                }
    
                this.cacheOfKeyValues[index].push(value);
                
                await this._service.swapAndRender(source, false, false, i, i, PRIMARY_ONE_COLOR, SECONDARY_ONE_COLOR, ACCENT_ONE_COLOR, times, callback);

                times += 1;
            }
        }
        
        return times;
    }

    protected override async load(source: SortDataModel[], lhs: number, rhs: number, order: SortOrder, times: number, callback: (param: SortStateModel) => void): Promise<number> {
        let index: number;
        
        this.keys = Object.keys(this.cacheOfKeyValues);

        if (order === 'ascent') {
            index = 0;

            for (let i = 0, outerLength = this.keys.length; i <= outerLength - 1; i++) {
                this.array = this.cacheOfKeyValues[this.keys[i]];
    
                for (let j = 0, innerLength = this.array.length; j <= innerLength - 1; j++) {
                    source[index].value = this.array[j];
    
                    await this._service.swapAndRender(source, false, false, index, i, PRIMARY_TWO_COLOR, SECONDARY_TWO_COLOR, ACCENT_TWO_COLOR, times, callback);
    
                    index += 1;
                    times += 1;
                }

                this.array.splice(0);
            }
        }
        
        if (order === 'descent') {
            index = source.length - 1;

            for (let i = 0, outerLength = this.keys.length; i <= outerLength - 1; i++) {
                this.array = this.cacheOfKeyValues[this.keys[i]];
    
                for (let j = 0, innerLength = this.array.length; j <= innerLength - 1; j++) {
                    source[index].value = this.array[j];
    
                    await this._service.swapAndRender(source, false, false, index, i, PRIMARY_TWO_COLOR, SECONDARY_TWO_COLOR, ACCENT_TWO_COLOR, times, callback);
    
                    index -= 1;
                    times += 1;
                }

                this.array.splice(0);
            }
        }

        return times;
    }

}

/**
 * 桶排序
 */
@Injectable()
export class BucketSortService extends AbstractDistributionSortService {

    protected override async sortByAscent(source: SortDataModel[], lhs: number, rhs: number, option: string | number | undefined, callback: (param: SortStateModel) => void): Promise<void> {
        let times: number = 0;
        
        times = await this.save(source, lhs, rhs, 'ascent', times, callback);
        times = await this.load(source, lhs, rhs, 'ascent', times, callback);        

        this.freeKeyValues(this.cacheOfKeyValues);

        await delay();
        await this.complete(source, times, callback);
    }

    protected override async sortByDescent(source: SortDataModel[], lhs: number, rhs: number, option: string | number | undefined, callback: (param: SortStateModel) => void): Promise<void> {
        let times: number = 0;
        
        times = await this.save(source, lhs, rhs, 'descent', times, callback);
        times = await this.load(source, lhs, rhs, 'descent', times, callback);

        this.freeKeyValues(this.cacheOfKeyValues);

        await delay();
        await this.complete(source, times, callback);
    }

    protected override async save(source: SortDataModel[], lhs: number, rhs: number, order: SortOrder, times: number, callback: (param: SortStateModel) => void): Promise<number> {
        let index: number, value: number;

        if (order === 'ascent') {
            for (let i = 0, length = source.length; i <= length - 1; i++) {
                value = source[i].value;
                index = Math.floor((value - 1) / this.THRESHOLD);
    
                if (!this.cacheOfKeyValues[index]) {
                    this.cacheOfKeyValues[index] = Array.from([]);
                }
    
                this.cacheOfKeyValues[index].push(value);
                
                await this._service.swapAndRender(source, false, false, i, i, PRIMARY_ONE_COLOR, SECONDARY_ONE_COLOR, ACCENT_ONE_COLOR, times, callback);
    
                times += 1;
            }
        }

        if (order === 'descent') {
            for (let length = source.length, i = length - 1; i >= 0; i--) {
                value = source[i].value;
                index = Math.floor((value - 1) / this.THRESHOLD);
    
                if (!this.cacheOfKeyValues[index]) {
                    this.cacheOfKeyValues[index] = Array.from([]);
                }
    
                this.cacheOfKeyValues[index].push(value);
                
                await this._service.swapAndRender(source, false, false, i, i, PRIMARY_ONE_COLOR, SECONDARY_ONE_COLOR, ACCENT_ONE_COLOR, times, callback);
    
                times += 1;
            }
        }

        return times;
    }

    protected override async load(source: SortDataModel[], lhs: number, rhs: number, order: SortOrder, times: number, callback: (parram: SortStateModel) => void): Promise<number> {
        let index: number;

        this.keys = Object.keys(this.cacheOfKeyValues);

        if (order === 'ascent') {
            index = 0;

            for (let i = 0, outerLength = this.keys.length; i <= outerLength - 1; i++) {
                lhs = index;
                this.array = this.cacheOfKeyValues[this.keys[i]];
    
                for (let j = 0, innerLength = this.array.length; j <= innerLength - 1; j++) {
                    source[index].value = this.array[j];
                    
                    await this._service.swapAndRender(source, false, false, index, index, PRIMARY_TWO_COLOR, SECONDARY_TWO_COLOR, ACCENT_TWO_COLOR, times, callback);
    
                    index += 1;
                    times += 1;
                }
    
                rhs = index - 1;
    
                times = await this._service.stableGapSortByAscent(source, lhs, rhs, 1, 1, times, callback);

                this.array.splice(0);
            }
        }
        
        if (order === 'descent') {
            index = source.length - 1;

            for (let i = 0, outerLength = this.keys.length; i <= outerLength - 1; i++) {
                rhs = index;
                this.array = this.cacheOfKeyValues[this.keys[i]];
    
                for (let innerLength = this.array.length, j = innerLength - 1; j >= 0; j--) {
                    source[index].value = this.array[j];
    
                    await this._service.swapAndRender(source, false, false, index, index, PRIMARY_TWO_COLOR, SECONDARY_TWO_COLOR, ACCENT_TWO_COLOR, times, callback);
    
                    index -= 1;
                    times += 1;
                }
    
                lhs = index + 1;
    
                times = await this._service.stableGapSortByDescent(source, lhs, rhs, 1, 1, times, callback);

                this.array.splice(0);
            }
        }
        
        return times;
    }

}

/**
 * 插值排序
 */
@Injectable()
export class InterpolationSortService extends AbstractDistributionSortService {

    private minValue: number = -1;
    private maxValue: number = -1;

    protected override async sortByAscent(source: SortDataModel[], lhs: number, rhs: number, option: string | number | undefined, callback: (param: SortStateModel) => void): Promise<void> {
        let times: number = 0;

        [this.minValue, this.maxValue] = this._service.findMinMaxValue(source, lhs, rhs);
        
        times = await this.save(source, lhs, rhs, 'ascent', times, callback);
        times = await this.load(source, lhs, rhs, 'ascent', times, callback);
        
        this.freeKeyValues(this.cacheOfKeyValues);

        await delay();
        await this.complete(source, times, callback);
    }

    protected override async sortByDescent(source: SortDataModel[], lhs: number, rhs: number, option: string | number | undefined, callback: (param: SortStateModel) => void): Promise<void> {
        let times: number = 0;

        [this.minValue, this.maxValue] = this._service.findMinMaxValue(source, lhs, rhs);

        times = await this.save(source, lhs, rhs, 'descent', times, callback);
        times = await this.load(source, lhs, rhs, 'descent', times, callback);
        
        this.freeKeyValues(this.cacheOfKeyValues);

        await delay();
        await this.complete(source, times, callback);
    }

    protected override async save(source: SortDataModel[], lhs: number, rhs: number, order: SortOrder, times: number, callback: (param: SortStateModel) => void): Promise<number> {
        let index;

        if (order === 'ascent') {
            for (let i = 0, length = source.length; i <= length - 1; i++) {
                index = Math.floor((length - 1) * (source[i].value - this.minValue) / (this.maxValue - this.minValue));
    
                if (!this.cacheOfKeyValues[index]) {
                    this.cacheOfKeyValues[index] = Array.from([]);
                }
    
                this.cacheOfKeyValues[index].push(source[i].value);
    
                await this._service.swapAndRender(source, false, false, i, i, PRIMARY_ONE_COLOR, SECONDARY_ONE_COLOR, ACCENT_ONE_COLOR, times, callback);
    
                times += 1;
            }
        }
        
        if (order === 'descent') {
            for (let length = source.length, i = length - 1; i >= 0; i--) {
                index = Math.floor((length - 1) * (source[i].value - this.minValue) / (this.maxValue - this.minValue));
    
                if (!this.cacheOfKeyValues[index]) {
                    this.cacheOfKeyValues[index] = Array.from([]);
                }
    
                this.cacheOfKeyValues[index].push(source[i].value);
    
                await this._service.swapAndRender(source, false, false, i, i, PRIMARY_ONE_COLOR, SECONDARY_ONE_COLOR, ACCENT_ONE_COLOR, times, callback);
    
                times += 1;
            }
        }
        
        return times;
    }

    protected override async load(source: SortDataModel[], lhs: number, rhs: number, order: SortOrder, times: number, callback: (param: SortStateModel) => void): Promise<number> {
        let index;
        
        this.keys = Object.keys(this.cacheOfKeyValues);

        if (order === 'ascent') {
            index = 0;

            for (let i = 0, outerLength = this.keys.length; i <= outerLength - 1; i++) {
                this.array = this.cacheOfKeyValues[this.keys[i]];

                for (let j = 0, innerLength = this.array.length; j <= innerLength - 1; j++) {
                    source[index].value = this.array[j];
                    
                    await this._service.swapAndRender(source, false, false, index, index, PRIMARY_TWO_COLOR, SECONDARY_TWO_COLOR, ACCENT_TWO_COLOR, times, callback);
    
                    index += 1;
                    times += 1;
                }

                this.array.splice(0);
            }
        }
        
        if (order === 'descent') {
            index = source.length - 1;

            for (let i = 0, outerLength = this.keys.length; i <= outerLength - 1; i++) {
                this.array = this.cacheOfKeyValues[this.keys[i]];

                for (let innerLength = this.array.length, j = innerLength - 1; j >= 0; j--) {
                    source[index].value = this.array[j];
                    
                    await this._service.swapAndRender(source, false, false, index, index, PRIMARY_TWO_COLOR, SECONDARY_TWO_COLOR, ACCENT_TWO_COLOR, times, callback);
    
                    index -= 1;
                    times += 1;
                }

                this.array.splice(0);
            }
        }
        
        return times;
    }

}
