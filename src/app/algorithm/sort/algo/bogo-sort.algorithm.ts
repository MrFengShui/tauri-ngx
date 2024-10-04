import { ceil, floor, random } from "lodash";

import { delay } from "../../../public/global.utils";
import { PRIMARY_COLOR, SECONDARY_COLOR, CLEAR_COLOR, ACCENT_COLOR, PRIMARY_ONE_COLOR, SECONDARY_ONE_COLOR, ACCENT_ONE_COLOR, PRIMARY_TWO_COLOR, SECONDARY_TWO_COLOR, ACCENT_TWO_COLOR } from "../../../public/global.utils";

import { SortDataModel, SortIndexRange, SortMetaInfo, SortOption, SortOrder, SortStateModel } from "../ngrx-store/sort.state";

import { AbstractComparisonSortAlgorithm, AbstractDistributionSortAlgorithm } from "../pattern/sort-temp.pattern";
import { SortToolsService } from "../ngrx-store/sort.service";
import { InsertionSortAlgorithm } from "./insertion-sort.algorithm";
import { SelectionSortAlgorithm } from "./selection-sort.algorithm";

/**
 * 猴子排序
 */
export class BogoSortAlgorithm extends AbstractComparisonSortAlgorithm {

    protected override async sortByAscent(source: SortDataModel[], lhs: number, rhs: number, option: SortOption, callback: (param: SortStateModel) => void): Promise<void> {
        let times: number = await this.selectByOrder(source, lhs, rhs, 'ascent', 0, callback);

        await delay();
        await this.complete(source, times, callback);
    }

    protected override async sortByDescent(source: SortDataModel[], lhs: number, rhs: number, option: SortOption, callback: (param: SortStateModel) => void): Promise<void> {
        let times: number = await this.selectByOrder(source, lhs, rhs, 'descent', 0, callback);

        await delay();
        await this.complete(source, times, callback);
    }

    public async selectByOrder(source: SortDataModel[], lhs: number, rhs: number, order: SortOrder, times: number, callback: (param: SortStateModel) => void): Promise<number> {
        let i: number, j: number, start: number = lhs, final: number = rhs, flag: boolean = false, stop: boolean = false;

        while (!stop) {
            i = random(start, final, false);
            j = random(start, final, false);

            if (order === 'ascent') {
                flag = (i < j && source[i].value > source[j].value) || (i > j && source[i].value < source[j].value);
            }
            
            if (order === 'descent') {
                flag = (i < j && source[i].value < source[j].value) || (i > j && source[i].value > source[j].value);
            }

            times = await this.exchange(source, flag, i, j, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, times, callback);
            [times, stop, start, final] = await this.check(source, lhs, rhs, order, times, callback);
        }

        return times;
    }

}

/**
 * 猴子排序（并行）
 */
export class BlockBogoSortAlgorithm extends AbstractDistributionSortAlgorithm<SortIndexRange> {

    protected override THRESHOLD: number = 8;

    private bogoSort: BogoSortAlgorithm | null = null;
    private range: SortIndexRange | null = null;

    private counts: { [key: string | number]: number } = {};

    constructor(protected override _service: SortToolsService) {
        super(_service);

        if (this.bogoSort === null) this.bogoSort = new BogoSortAlgorithm(_service);
    }

    protected override async sortByAscent(source: SortDataModel[], lhs: number, rhs: number, option: SortOption, callback: (param: SortStateModel) => void): Promise<void> {
        let metainfo: SortMetaInfo = this.generate(source, lhs, rhs), times: number = 0;

        times = await this.partitionByOrder(source, lhs, rhs, metainfo, 'ascent', times, callback);
        times = await this.classifyByOrder(source, lhs, rhs, metainfo, 'ascent', times, callback);
        times = await this.finalizeByOrder(source, 'ascent', times, callback);

        await delay();
        await this.complete(source, times, callback);
    }

    protected override async sortByDescent(source: SortDataModel[], lhs: number, rhs: number, option: SortOption, callback: (param: SortStateModel) => void): Promise<void> {
        let metainfo: SortMetaInfo = this.generate(source, lhs, rhs), times: number = 0;

        times = await this.partitionByOrder(source, lhs, rhs, metainfo, 'descent', times, callback);
        times = await this.classifyByOrder(source, lhs, rhs, metainfo, 'descent', times, callback);
        times = await this.finalizeByOrder(source, 'descent', times, callback);

        await delay();
        await this.complete(source, times, callback);
    }
    
    protected override saveByOrder(source: SortDataModel[], lhs: number, rhs: number, order: SortOrder, times: number, callback: (param: SortStateModel) => void): Promise<number> {
        throw new Error("Method not implemented.");
    }

    protected override loadByOrder(source: SortDataModel[], lhs: number, rhs: number, order: SortOrder, times: number, callback: (param: SortStateModel) => void): Promise<number> {
        throw new Error("Method not implemented.");
    }

    private async classifyByOrder(source: SortDataModel[], lhs: number, rhs: number, metainfo: SortMetaInfo, order: SortOrder, times: number, callback: (param: SortStateModel) => void): Promise<number> {
        if (this.bogoSort === null) throw new Error(`错误：引用对象${this.bogoSort}未被初始化。`);

        let i: number, j: number, stop: boolean = false;

        this.keys.splice(0);
        this.keys = Object.keys(this.cacheOfKeyValue);
        
        while (!stop) {
            i = random(lhs, rhs, false);
            j = this.calcBlockID(source[i].value, metainfo);

            this.range = this.cacheOfKeyValue[j];

            if (i >= this.range.start && i <= this.range.final) {
                times = await this.sweep(source, i, ACCENT_COLOR, times, callback);
            } else {
                j = random(this.range.start, this.range.final, false);

                times = await this.bogoSort.exchange(source, source[i].value !== source[j].value, i, j, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, times, callback);
            }
            
            if (order === 'ascent') [stop, lhs] = this.checkStatus(source, metainfo, this.keys, order);

            if (order === 'descent') [stop, rhs] = this.checkStatus(source, metainfo, this.keys, order);
        }

        return times;
    }

    private async finalizeByOrder(source: SortDataModel[], order: SortOrder, times: number, callback: (param: SortStateModel) => void): Promise<number> {
        if (this.bogoSort === null) throw new Error(`错误：引用对象${this.bogoSort}未被初始化。`);

        let key: string | number;

        this.keys.splice(0);
        this.keys = Object.keys(this.cacheOfKeyValue);

        while (this.keys.length > 0) {
            key = this.keys.shift() as (string | number);
            this.range = this.cacheOfKeyValue[key];

            times = await this.bogoSort.selectByOrder(source, this.range.start, this.range.final, order, times, callback);
        }

        this.freeKeyValue(this.cacheOfKeyValue);
        return times;
    }

    private async partitionByOrder(source: SortDataModel[], lhs: number, rhs: number, metainfo: SortMetaInfo, order: SortOrder, times: number, callback: (param: SortStateModel) => void): Promise<number> {
        let key: string | number, j: number, k: number = -1;

        for (let i = lhs; i <= rhs; i++) {
            if (order === 'ascent') k = lhs + i;

            if (order === 'descent') k = rhs - i;

            j = this.calcBlockID(source[k].value, metainfo);

            if (this.keys.includes(j)) {
                this.counts[j] += 1;
            } else {
                this.counts[j] = 1;
                this.keys.push(j);
            }

            times = await this.sweep(source, k, ACCENT_COLOR, times, callback);
        }

        this.keys.splice(0);
        this.keys = Object.keys(this.counts);
        
        if (order === 'ascent') k = lhs;

        if (order === 'descent') k = rhs;
        
        while (this.keys.length > 0) {
            key = this.keys.shift() as (string | number);

            if (order === 'ascent') {
                j = k + this.counts[key] - 1;                
                this.cacheOfKeyValue[key] = { start: k, final: j };
    
                k = j + 1;
            }
            
            if (order === 'descent') {
                j = k - this.counts[key] + 1;
                this.cacheOfKeyValue[key] = { start: j, final: k };

                k = j - 1;
            }
        }
        
        this.freeKeyValue(this.counts);
        return times;
    }

    protected calcBlockID(value: number, metainfo: SortMetaInfo): number {
        return floor(metainfo.count * (value - metainfo.minValue) / (metainfo.maxValue - metainfo.minValue + 1), 0);
    }

    protected generate(source: SortDataModel[], lhs: number, rhs: number): SortMetaInfo {
        const percent: number = Math.log2(rhs - lhs + 1) * random(2.25, 4.75, true) * 0.01;
        const values: [number, number] = this._service.minimax(source);
        return { count: Math.max(ceil(percent * (rhs - lhs + 1), 0), 1), minValue: values[0], maxValue: values[1] };
    }

    protected checkStatus(source: SortDataModel[], metainfo: SortMetaInfo, keys: Array<string | number>, order: SortOrder): [boolean, number] {
        let key: number | number, index: number = -1, stop: boolean = true;

        for (let i = 0; i < metainfo.count; i++) {
            key = Number.parseInt(keys[i] as string);
            this.range = this.cacheOfKeyValue[key];

            if (!this.range) continue;
            
            if (order === 'ascent') {
                for (let j = this.range.start; j <= this.range.final; j++) {
                    if (this.calcBlockID(source[j].value, metainfo) !== key) {
                        index = this.range.start;
                        stop = false;
                        break;
                    }
                }
            }

            if (order === 'descent') {
                for (let j = this.range.final; j >= this.range.start; j--) {
                    if (this.calcBlockID(source[j].value, metainfo) !== key) {
                        index = this.range.final;
                        stop = false;
                        break;
                    }
                }
            }

            if (!stop) break;
        }

        return [stop, index];
    }

}

/**
 * 随机断点排序（单向）
 */
export class BreakPointBogoSortAlgorithm extends BogoSortAlgorithm {

    protected override async sortByAscent(source: SortDataModel[], lhs: number, rhs: number, option: SortOption, callback: (param: SortStateModel) => void): Promise<void> {
        let stop: boolean = false, times: number = 0;

        while (!stop) [times, stop] = await this.swapByAscent(source, lhs, rhs, true, times, callback);
        
        await delay();
        await this.complete(source, times, callback);
    }

    protected override async sortByDescent(source: SortDataModel[], lhs: number, rhs: number, option: SortOption, callback: (param: SortStateModel) => void): Promise<void> {
        let stop: boolean = false, times: number = 0;

        while (!stop) [times, stop] = await this.swapByDescent(source, lhs, rhs, true, times, callback);

        await delay();
        await this.complete(source, times, callback);
    }

    protected async swapByAscent(source: SortDataModel[], lhs: number, rhs: number, flag: boolean, times: number, callback: (param: SortStateModel) => void): Promise<[number, boolean]> {
        let idx: number, stop: boolean = true;
        
        if (flag) {
            while (lhs <= rhs) {
                idx = Math.min(lhs + 1, rhs);
                flag = lhs !== idx && source[idx].value < source[lhs].value;
                stop &&= !flag;
    
                times = await this.exchange(source, flag && this.COIN_FLAG(), lhs, idx, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, times, callback);

                lhs += 1;
            }
        } else {
            while (lhs <= rhs) {
                idx = Math.max(rhs - 1, lhs);
                flag = rhs !== idx && source[idx].value > source[rhs].value;
                stop &&= !flag;
    
                times = await this.exchange(source, flag && this.COIN_FLAG(), rhs, idx, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, times, callback);

                rhs -= 1;
            }
        }

        return [times, stop];
    }

    protected async swapByDescent(source: SortDataModel[], lhs: number, rhs: number, flag: boolean, times: number, callback: (param: SortStateModel) => void): Promise<[number, boolean]> {
        let idx: number, stop: boolean = true;
        
        if (flag) {
            while (lhs <= rhs) {
                idx = Math.max(rhs - 1, lhs);
                flag = rhs !== idx && source[idx].value < source[rhs].value;
                stop &&= !flag;
    
                times = await this.exchange(source, flag && this.COIN_FLAG(), rhs, idx, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, times, callback);

                rhs -= 1;
            }
        } else {
            while (lhs <= rhs) {
                idx = Math.min(lhs + 1, rhs);
                flag = lhs !== idx && source[idx].value > source[lhs].value;
                stop &&= !flag;
    
                times = await this.exchange(source, flag && this.COIN_FLAG(), lhs, idx, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, times, callback);

                lhs += 1;
            }
        }

        return [times, stop];
    }

}

/**
 * 随机断点排序（双向）
 */
export class ShakerBreakPointBogoSortAlgorithm extends BreakPointBogoSortAlgorithm {

    protected override async sortByAscent(source: SortDataModel[], lhs: number, rhs: number, option: SortOption, callback: (param: SortStateModel) => void): Promise<void> {
        let stop: boolean, times: number = 0;

        while (true) {
            [times, stop] = await this.swapByAscent(source, lhs, rhs, true, times, callback);

            if (stop) break;

            [times, stop] = await this.swapByAscent(source, lhs, rhs, false, times, callback);

            if (stop) break;
        }
        
        await delay();
        await this.complete(source, times, callback);
    }

    protected override async sortByDescent(source: SortDataModel[], lhs: number, rhs: number, option: SortOption, callback: (param: SortStateModel) => void): Promise<void> {
        let stop: boolean, times: number = 0;

        while (true) {
            [times, stop] = await this.swapByDescent(source, lhs, rhs, true, times, callback);

            if (stop) break;

            [times, stop] = await this.swapByDescent(source, lhs, rhs, false, times, callback);

            if (stop) break;
        }

        await delay();
        await this.complete(source, times, callback);
    }

}

/**
 * 猴子冒泡排序（单向）
 */
export class BubbleBogoSortAlgorithm extends BogoSortAlgorithm {

    protected override async sortByAscent(source: SortDataModel[], lhs: number, rhs: number, option: SortOption, callback: (param: SortStateModel) => void): Promise<void> {
        let start: number = lhs, final: number = rhs, stop: boolean = false, times: number = 0;

        while (!stop) {
            times = await this.swapByAscent(source, start, final, true, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, times, callback);
            [times, stop, start, final] = await this.check(source, lhs, rhs, 'ascent', times, callback);
        }

        await delay();
        await this.complete(source, times, callback);
    }

    protected override async sortByDescent(source: SortDataModel[], lhs: number, rhs: number, option: SortOption, callback: (param: SortStateModel) => void): Promise<void> {
        let start: number = lhs, final: number = rhs, stop: boolean = false, times: number = 0;

        while (!stop) {
            times = await this.swapByDescent(source, start, final, true, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, times, callback);
            [times, stop, start, final] = await this.check(source, lhs, rhs, 'descent', times, callback);
        }

        await delay();
        await this.complete(source, times, callback);
    }

    protected async swapByAscent(source: SortDataModel[], lhs: number, rhs: number, flags: boolean, primaryColor: string, secondaryColor: string, accentColor: string, times: number, callback: (param: SortStateModel) => void): Promise<number> {
        let j: number, k: number, flag: boolean;

        if (flags) {
            for (let i = lhs; i <= rhs; i++) {
                j = random(i, rhs, false);
                k = Math.min(j + 1, rhs);
                flag = source[k].value < source[j].value;

                source[i].color = accentColor;
                callback({ times, datalist: source });

                times = await this.exchange(source, flag, j, k, primaryColor, secondaryColor, accentColor, times, callback);

                source[i].color = CLEAR_COLOR;
                callback({ times, datalist: source });
            }
        } else {
            for (let i = rhs; i >= lhs; i--) {
                j = random(lhs, i, false);
                k = Math.max(j - 1, lhs);
                flag = source[k].value > source[j].value;

                source[i].color = accentColor;
                callback({ times, datalist: source });

                times = await this.exchange(source, flag, j, k, primaryColor, secondaryColor, accentColor, times, callback);

                source[i].color = CLEAR_COLOR;
                callback({ times, datalist: source });
            }
        }

        return times;
    }

    protected async swapByDescent(source: SortDataModel[], lhs: number, rhs: number, flags: boolean, primaryColor: string, secondaryColor: string, accentColor: string, times: number, callback: (param: SortStateModel) => void): Promise<number> {
        let j: number, k: number, flag: boolean;

        if (flags) {
            for (let i = rhs; i >= lhs; i--) {
                j = random(lhs, i, false);
                k = Math.max(j - 1, lhs);
                flag = source[k].value < source[j].value;

                source[i].color = accentColor;
                callback({ times, datalist: source });

                times = await this.exchange(source, flag, j, k, primaryColor, secondaryColor, accentColor, times, callback);

                source[i].color = CLEAR_COLOR;
                callback({ times, datalist: source });
            }
        } else {
            for (let i = lhs; i <= rhs; i++) {
                j = random(i, rhs, false);
                k = Math.min(j + 1, rhs);
                flag = source[k].value > source[j].value;

                source[i].color = accentColor;
                callback({ times, datalist: source });

                times = await this.exchange(source, flag, j, k, primaryColor, secondaryColor, accentColor, times, callback);

                source[i].color = CLEAR_COLOR;
                callback({ times, datalist: source });
            }
        }

        return times;
    }

}

/**
 * 猴子冒泡排序（双向）
 */
export class ShakerBubbleBogoSortAlgorithm extends BubbleBogoSortAlgorithm {

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

    public async sortByOrder(source: SortDataModel[], lhs: number, rhs: number, order: SortOrder, times: number, callback: (param: SortStateModel) => void): Promise<number> {
        let start: number = lhs, final: number = rhs, stop: boolean = false;

        while (!stop) {
            if (order === 'ascent') {
                times = await this.swapByAscent(source, start, final, true, PRIMARY_ONE_COLOR, SECONDARY_ONE_COLOR, ACCENT_ONE_COLOR, times, callback);
                times = await this.swapByAscent(source, start, final, false, PRIMARY_TWO_COLOR, SECONDARY_TWO_COLOR, ACCENT_TWO_COLOR, times, callback);
            }

            if (order === 'descent') {
                times = await this.swapByDescent(source, start, final, true, PRIMARY_ONE_COLOR, SECONDARY_ONE_COLOR, ACCENT_ONE_COLOR, times, callback);
                times = await this.swapByDescent(source, start, final, false, PRIMARY_TWO_COLOR, SECONDARY_TWO_COLOR, ACCENT_TWO_COLOR, times, callback);
            }
            
            [times, stop, start, final] = await this.check(source, lhs, rhs, order, times, callback);
        }

        return times;
    }

}

/**
 * 猴子插入排序
 */
export class InsertionBogoSortAlgorithm extends BogoSortAlgorithm {

    private insertSort: InsertionSortAlgorithm | null = null;

    constructor(protected override _service: SortToolsService) {
        super(_service);

        if (this.insertSort === null) this.insertSort = new InsertionSortAlgorithm(_service);
    }

    protected override async sortByAscent(source: SortDataModel[], lhs: number, rhs: number, option: SortOption, callback: (param: SortStateModel) => void): Promise<void> {
        if (this.insertSort === null) throw new Error(`错误：引用对象${this.insertSort}未被初始化。`);

        let j: number, start: number = lhs, final: number = rhs, stop: boolean = false, flag: boolean, times: number = 0;
        
        while (!stop) {
            for (let i = start; i <= final; i++) {
                j = Math.max(i - 1, lhs);
                flag = i !== j && source[j].value > source[i].value;

                if (flag && this.COIN_FLAG()) {
                    [times] = await this.insertSort.insertByAscent(source, lhs, i, 1, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, times, callback);
                } else {
                    times = await this.sweep(source, i, ACCENT_COLOR, times, callback);
                }
            }

            [times, stop, start, final] = await this.check(source, lhs, rhs, 'ascent', times, callback);
        }

        await delay();
        await this.complete(source, times, callback);
    }

    protected override async sortByDescent(source: SortDataModel[], lhs: number, rhs: number, option: SortOption, callback: (param: SortStateModel) => void): Promise<void> {
        if (this.insertSort === null) throw new Error(`错误：引用对象${this.insertSort}未被初始化。`);

        let j: number, start: number = lhs, final: number = rhs, stop: boolean = false, flag: boolean, times: number = 0;
        
        while (!stop) {
            for (let i = final; i >= start; i--) {
                j = Math.min(i + 1, rhs);
                flag = i !== j && source[j].value > source[i].value;
                
                if (flag && this.COIN_FLAG()) {
                    [times] = await this.insertSort.insertByDescent(source, i, rhs, 1, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, times, callback);
                } else {
                    times = await this.sweep(source, i, ACCENT_COLOR, times, callback);
                }
            }

            [times, stop, start, final] = await this.check(source, lhs, rhs, 'descent', times, callback);
        }

        await delay();
        await this.complete(source, times, callback);
    }

}

/**
 * 猴子选择排序
 */
export class SelectionBogoSortAlgorithm extends BogoSortAlgorithm {

    private selectSort: SelectionSortAlgorithm | null = null;

    constructor(protected override _service: SortToolsService) {
        super(_service);

        if (this.selectSort === null) this.selectSort = new SelectionSortAlgorithm(_service);
    }

    protected override async sortByAscent(source: SortDataModel[], lhs: number, rhs: number, option: SortOption, callback: (param: SortStateModel) => void): Promise<void> {
        if (this.selectSort === null) throw new Error(`错误：引用对象${this.selectSort}未被初始化。`);

        let i: number, j: number, start: number = lhs, final: number = rhs, stop: boolean = false, times: number = 0;
        
        while (!stop) {
            i = random(start, final, false);

            [times, j] = await this.selectSort.selectByAscent(source, i, rhs, 1, true, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, times, callback);
            times = await this.exchange(source, j !== i, i, j, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, times ,callback);

            [times, j] = await this.selectSort.selectByAscent(source, lhs, i, 1, false, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, times, callback);
            times = await this.exchange(source, j !== i, i, j, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, times ,callback);

            [times, stop, start, final] = await this.check(source, lhs, rhs, 'ascent', times, callback);
        }

        await delay();
        await this.complete(source, times, callback);
    }

    protected override async sortByDescent(source: SortDataModel[], lhs: number, rhs: number, option: SortOption, callback: (param: SortStateModel) => void): Promise<void> {
        if (this.selectSort === null) throw new Error(`错误：引用对象${this.selectSort}未被初始化。`);

        let i: number, j: number, start: number = lhs, final: number = rhs, stop: boolean = false, times: number = 0;
        
        while (!stop) {
            i = random(start, final, false);

            [times, j] = await this.selectSort.selectByDescent(source, lhs, i, 1, true, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, times, callback);
            times = await this.exchange(source, j !== i, i, j, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, times ,callback);

            [times, j] = await this.selectSort.selectByDescent(source, i, rhs, 1, false, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, times, callback);
            times = await this.exchange(source, j !== i, i, j, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, times ,callback);

            [times, stop, start, final] = await this.check(source, lhs, rhs, 'descent', times, callback);
        }

        await delay();
        await this.complete(source, times, callback);
    }

}

/**
 * 随机归并排序
 */
export class MergeBogoSortAlgorithm extends BogoSortAlgorithm {

    protected override async sortByAscent(source: SortDataModel[], lhs: number, rhs: number, option: SortOption, callback: (param: SortStateModel) => void): Promise<void> {
        let start: number = lhs, final: number = rhs, stop: boolean = false, times: number = 0;

        while (!stop) {
            times = await this.sortByOrder(source, start, final, 'ascent', times, callback);
            [times, stop, start, final] = await this.check(source, lhs, rhs, 'ascent', times, callback);
        }

        await delay();
        await this.complete(source, times, callback);
    }

    protected override async sortByDescent(source: SortDataModel[], lhs: number, rhs: number, option: SortOption, callback: (param: SortStateModel) => void): Promise<void> {
        let start: number = lhs, final: number = rhs, stop: boolean = false, times: number = 0;

        while (!stop) {
            times = await this.sortByOrder(source, start, final, 'descent', times, callback);
            [times, stop, start, final] = await this.check(source, lhs, rhs, 'descent', times, callback);
        }

        await delay();
        await this.complete(source, times, callback);
    }

    protected async sortByOrder(source: SortDataModel[], lhs: number, rhs: number, order: SortOrder, times: number, callback: (param: SortStateModel) => void): Promise<number> {
        if (lhs < rhs) {
            let mid: number = floor((rhs - lhs) * 0.5, 0);

            if (order === 'ascent') {
                mid = lhs + mid;
                times = await this.sortByOrder(source, lhs, mid, order, times, callback);
                times = await this.sortByOrder(source, mid + 1, rhs, order, times, callback);
                times = await this.mergeByOrder(source, lhs, mid, rhs, order, times, callback);
            }

            if (order === 'descent') {
                mid = rhs - mid;
                times = await this.sortByOrder(source, mid, rhs, order, times, callback);
                times = await this.sortByOrder(source, lhs, mid - 1, order, times, callback);
                times = await this.mergeByOrder(source, lhs, mid, rhs, order, times, callback);
            }
        }
        
        return times;
    }

    private async mergeByOrder(source: SortDataModel[], lhs: number, mid: number, rhs: number, order: SortOrder, times: number, callback: (param: SortStateModel) => void): Promise<number> {
        let j: number;

        if (order === 'ascent') {
            for (let i = lhs; i <= mid; i++) {
                j = random(mid + 1, rhs, false);
    
                times = source[j].value < source[i].value 
                    ? await this.exchange(source, true, i, j, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, times, callback)
                    : await this.dualSweep(source, i, j, PRIMARY_COLOR, SECONDARY_COLOR, times, callback);
            }
        }
        
        if (order === 'descent') {
            for (let i = rhs; i >= mid; i--) {
                j = random(lhs, mid - 1, false);
    
                times = source[j].value < source[i].value 
                    ? await this.exchange(source, true, i, j, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, times, callback)
                    : await this.dualSweep(source, i, j, PRIMARY_COLOR, SECONDARY_COLOR, times, callback);
            }
        }

        return times;
    }
    
}