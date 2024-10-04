
import { SortDataModel, SortStateModel, SortOrder, SortRadix, SortOption, SortIndexRange } from "../ngrx-store/sort.state";

import { ACCENT_COLOR, CLEAR_COLOR, delay, PRIMARY_COLOR, SECONDARY_COLOR } from "../../../public/global.utils";
import { ACCENT_TWO_COLOR, ACCENT_ONE_COLOR } from "../../../public/global.utils";

import { AbstractRadixSortAlgorithm } from "../pattern/sort-temp.pattern";
import { SortToolsService } from "../ngrx-store/sort.service";
import { InsertionSortAlgorithm } from "./insertion-sort.algorithm";

/**
 * 低位基数排序
 */
export class LSDRadixSortAlgorithm extends AbstractRadixSortAlgorithm<SortDataModel | number> {

    protected override cacheOfKeyValues: { [key: string | number]: Array<SortDataModel | number> } = {
        '0': [], '1': [], '2': [], '3': [], '4': [], '5': [], '6': [], '7': [], '8': [], '9': [],
        'a': [], 'b': [], 'c': [], 'd': [], 'e': [], 'f': []
    };

    protected override async sortByAscent(source: SortDataModel[], lhs: number, rhs: number, option: SortOption, callback: (param: SortStateModel) => void): Promise<void> {
        let digits: number, times: number = 0;

        [times, digits] = await this.generationByOrder(source, lhs, rhs, option.radix, 'ascent', 0, callback);

        for (let digit = digits - 1; digit >= 0; digit--) {
            times = await this.saveByDigit(source, lhs, rhs, digit, 'ascent', times, callback);
            [times] = await this.loadByDigit(source, lhs, rhs, digit, 'ascent', times, callback);
        }
        
        await delay();
        await this.complete(source, times, callback);
    }

    protected override async sortByDescent(source: SortDataModel[], lhs: number, rhs: number, option: SortOption, callback: (param: SortStateModel) => void): Promise<void> {
        let digits: number, times: number = 0;

        [times, digits] = await this.generationByOrder(source, lhs, rhs, option.radix, 'descent', 0, callback);
        
        for (let digit = digits - 1; digit >= 0; digit--) {
            times = await this.saveByDigit(source, lhs, rhs, digit, 'descent', times, callback);
            [times] = await this.loadByDigit(source, lhs, rhs, digit, 'descent', times, callback);
        }

        await delay();
        await this.complete(source, 0, callback);
    }

    protected override async saveByOrder(source: SortDataModel[], lhs: number, rhs: number, order: SortOrder, times: number, callback: (param: SortStateModel) => void): Promise<number> {
        throw new Error();
    }

    protected override async loadByOrder(source: SortDataModel[], lhs: number, rhs: number, order: SortOrder, times: number, callback: (param: SortStateModel) => void): Promise<number> {
        throw new Error();
    }

    protected override async saveByDigit(source: SortDataModel[], lhs: number, rhs: number, digit: number, order: SortOrder, times: number, callback: (param: SortStateModel) => void): Promise<number> {
        let model: SortDataModel, key: string | number, index: number = -1;
        
        for (let i = lhs; i <= rhs; i++) {
            if (order === 'ascent') index = i;

            if (order === 'descent') index = rhs - i + lhs;

            model = source[index];
            key = (model?.radix as string)[digit];
            this.cacheOfKeyValues[key].push(model);

            times = await this.sweep(source, index, ACCENT_ONE_COLOR, times, callback);
            times += 1;
        }

        return times;
    }
    
    protected override async loadByDigit(source: SortDataModel[], lhs: number, rhs: number, digit: number, order: SortOrder, times: number, callback: (param: SortStateModel) => void): Promise<[number, SortIndexRange[]]> {
        let key: string | number, values: Array<SortDataModel | number> | null;
        
        this.keys.splice(0);
        this.keys = Object.keys(this.cacheOfKeyValues);        
        
        if (order === 'ascent') {
            for (let i = lhs; this.keys.length > 0;) {
                key = this.keys.shift() as string;
                values = this.cacheOfKeyValues[key];
                
                for (let j = i; values.length > 0; j++, i = j) {
                    source[j] = values.shift() as SortDataModel;

                    times = await this.sweep(source, j, ACCENT_TWO_COLOR, times, callback);
                    times += 1;
                }
            }
        }

        if (order === 'descent') {
            for (let i = rhs; this.keys.length > 0;) {
                key = this.keys.shift() as string;
                values = this.cacheOfKeyValues[key];

                for (let j = i; values.length > 0; j--, i = j) {
                    source[j] = values.shift() as SortDataModel;

                    times = await this.sweep(source, j, ACCENT_TWO_COLOR, times, callback);
                    times += 1;
                }
            }
        }

        values = null;
        return [times, this.parititionByOrder(source, lhs, rhs, digit, order)];
    }

}

/**
 * 高位基数排序（递归）
 */
export class RecursiveMSDRadixSortAlgorithm extends LSDRadixSortAlgorithm {

    protected override async sortByAscent(source: SortDataModel[], lhs: number, rhs: number, option: SortOption, callback: (param: SortStateModel) => void): Promise<void> {
        let digits: number, times: number = 0;

        [times, digits] = await this.generationByOrder(source, lhs, rhs, option.radix, 'ascent', 0, callback);
        times = await this.sortByOrder(source, lhs, rhs, 0, digits, 'ascent', times, callback);

        await delay();
        await this.complete(source, times, callback);
    }

    protected override async sortByDescent(source: SortDataModel[], lhs: number, rhs: number, option: SortOption, callback: (param: SortStateModel) => void): Promise<void> {
        let digits: number, times: number = 0;

        [times, digits] = await this.generationByOrder(source, lhs, rhs, option.radix, 'descent', 0, callback);
        times = await this.sortByOrder(source, lhs, rhs, 0, digits, 'descent', times, callback);

        await delay();
        await this.complete(source, times, callback);
    }

    private async sortByOrder(source: SortDataModel[], lhs: number, rhs: number, digit: number, digits: number, order: SortOrder, times: number, callback: (param: SortStateModel) => void): Promise<number> {
        if (digit < digits) {
            let ranges: SortIndexRange[] | null, range: SortIndexRange | null;

            times = await this.saveByDigit(source, lhs, rhs, digit, order, times, callback);
            [times, ranges] = await this.loadByDigit(source, lhs, rhs, digit, order, times, callback);
            
            while (ranges.length > 0) {
                range = ranges.shift() as SortIndexRange;
                times = await this.sortByOrder(source, range.start, range.final, digit + 1, digits, order, times, callback);
            }

            ranges = null;
            range = null;
        }

        return times;
    }

}

/**
 * 高位基数排序（迭代）
 */
export class IterativeMSDRadixSortAlgorithm extends RecursiveMSDRadixSortAlgorithm {

    protected override async sortByAscent(source: SortDataModel[], lhs: number, rhs: number, option: SortOption, callback: (param: SortStateModel) => void): Promise<void> {
        let ranges: SortIndexRange[] | null, range: SortIndexRange | null, digits: number, digit: number, times: number = 0;

        [times, digits] = await this.generationByOrder(source, lhs, rhs, option.radix, 'ascent', 0, callback);

        this.stack.push(0);
        this.stack.push(rhs);
        this.stack.push(lhs);

        while (this.stack.length > 0) {
            lhs = this.stack.pop() as number;
            rhs = this.stack.pop() as number;
            digit = this.stack.pop() as number;
            
            if (digit < digits) {
                times = await this.saveByDigit(source, lhs, rhs, digit, 'ascent', times, callback);
                [times, ranges] = await this.loadByDigit(source, lhs, rhs, digit, 'ascent', times, callback);

                while (ranges.length > 0) {
                    range = ranges.pop() as SortIndexRange;
                    this.stack.push(digit + 1);
                    this.stack.push(range.final);
                    this.stack.push(range.start);
                }
            }
        }

        ranges = null;
        range = null;
        
        await delay();
        await this.complete(source, times, callback);
    }

    protected override async sortByDescent(source: SortDataModel[], lhs: number, rhs: number, option: SortOption, callback: (param: SortStateModel) => void): Promise<void> {
        let ranges: SortIndexRange[] | null, range: SortIndexRange | null, digits: number, digit: number, times: number = 0;

        [times, digits] = await this.generationByOrder(source, lhs, rhs, option.radix, 'descent', 0, callback);

        this.stack.push(0);
        this.stack.push(lhs);
        this.stack.push(rhs);

        while (this.stack.length > 0) {
            rhs = this.stack.pop() as number;
            lhs = this.stack.pop() as number;
            digit = this.stack.pop() as number;
            
            if (digit < digits) {
                times = await this.saveByDigit(source, lhs, rhs, digit, 'descent', times, callback);
                [times, ranges] = await this.loadByDigit(source, lhs, rhs, digit, 'descent', times, callback);

                while (ranges.length > 0) {
                    range = ranges.pop() as SortIndexRange;
                    this.stack.push(digit + 1);
                    this.stack.push(range.start);
                    this.stack.push(range.final);
                }
            }
        }

        ranges = null;
        range = null;
        
        await delay();
        await this.complete(source, times, callback);
    }

}

/**
 * 原地基数排序（低位）
 */
export class InPlaceLSDRadixSortAlgorithm extends LSDRadixSortAlgorithm {

    protected readonly RADIX_KEYS: string[] = [
        '0', '1', '2', '3', '4', '5', '6', '7', '8', '9',
        'a', 'b', 'c', 'd', 'e', 'f'
    ];

    protected insertSort: InsertionSortAlgorithm | null = null;

    constructor(protected override _service: SortToolsService) {
        super(_service);

        if (this.insertSort === null) this.insertSort = new InsertionSortAlgorithm(_service);
    }

    protected override async sortByAscent(source: SortDataModel[], lhs: number, rhs: number, option: SortOption, callback: (param: SortStateModel) => void): Promise<void> {
        let digits: number, key: string, times: number = 0;

        [times, digits] = await this.generationByOrder(source, lhs, rhs, option.radix, 'ascent', 0, callback);
        
        for (let digit = digits - 1; digit >= 0; digit--) {
            times = await this.sortByOrder(source, lhs, rhs, digit, option, 'ascent', times, callback);
        }        

        await delay();
        await this.complete(source, times, callback);
    }

    protected override async sortByDescent(source: SortDataModel[], lhs: number, rhs: number, option: SortOption, callback: (param: SortStateModel) => void): Promise<void> {
        let digits: number, times: number = 0;
        
        [times, digits] = await this.generationByOrder(source, lhs, rhs, option.radix, 'descent', 0, callback);
        
        for (let digit = digits - 1; digit >= 0; digit--) {
            times = await this.sortByOrder(source, lhs, rhs, digit, option, 'descent', times, callback);
        }
        
        await delay();
        await this.complete(source, 0, callback);
    }

    protected async sortByOrder(source: SortDataModel[], lhs: number, rhs: number, digit: number, option: SortOption, order: SortOrder, times: number, callback: (param: SortStateModel) => void): Promise<number> {
        if (this.insertSort === null) throw new Error(`错误：引用对象${this.insertSort}未被初始化。`);

        let radix: string, key: string;

        for (let i = 0; i < option.radix; i++) {
            key = this.RADIX_KEYS[i];

            if (order === 'ascent') {
                for (let j = lhs; j <= rhs; j++) {
                    times = await this.sweep(source, j, ACCENT_COLOR, times, callback);
    
                    radix = source[lhs]?.radix as string;
    
                    if (radix[digit] === key) {
                        lhs += 1;
                        continue;
                    }
    
                    radix = source[j]?.radix as string;
    
                    if (radix[digit] === key) {
                        times = await this.insertSort.moveByOrder(source, lhs, j, PRIMARY_COLOR, SECONDARY_COLOR, order, times, callback);
    
                        lhs += 1;
                    }
                }
            }

            if (order === 'descent') {
                for (let j = rhs; j >= lhs; j--) {
                    times = await this.sweep(source, j, ACCENT_COLOR, times, callback);
    
                    radix = source[rhs]?.radix as string;
    
                    if (radix[digit] === key) {
                        rhs -= 1;
                        continue;
                    }
    
                    radix = source[j]?.radix as string;
    
                    if (radix[digit] === key) {
                        times = await this.insertSort.moveByOrder(source, j, rhs, PRIMARY_COLOR, SECONDARY_COLOR, order, times, callback);
    
                        rhs -= 1;
                    }
                }
            }
        }

        return times;
    }

}

/**
 * 原地基数排序（高位）
 */
export class InPlaceMSDRadixSortAlgorithm extends InPlaceLSDRadixSortAlgorithm {

    protected override async sortByAscent(source: SortDataModel[], lhs: number, rhs: number, option: SortOption, callback: (param: SortStateModel) => void): Promise<void> {
        let ranges: SortIndexRange[] | null, range: SortIndexRange | null, digits: number, digit: number, times: number = 0;

        [times, digits] = await this.generationByOrder(source, lhs, rhs, option.radix, 'ascent', 0, callback);
        
        this.stack.push(0);
        this.stack.push(rhs);
        this.stack.push(lhs);

        while (this.stack.length > 0) {
            lhs = this.stack.pop() as number;
            rhs = this.stack.pop() as number;
            digit = this.stack.pop() as number;

            times = await this.sortByOrder(source, lhs, rhs, digit, option, 'ascent', times, callback);

            if (digit < digits) {
                ranges = this.parititionByOrder(source, lhs, rhs, digit, 'ascent');
                
                while (ranges.length > 0) {
                    range = ranges.pop() as SortIndexRange;
                    this.stack.push(digit + 1);
                    this.stack.push(range.final);
                    this.stack.push(range.start);
                }
            }
        }

        ranges = null;
        range = null;
        
        await delay();
        await this.complete(source, times, callback);
    }

    protected override async sortByDescent(source: SortDataModel[], lhs: number, rhs: number, option: SortOption, callback: (param: SortStateModel) => void): Promise<void> {
        let ranges: SortIndexRange[] | null, range: SortIndexRange | null, digits: number, digit: number, times: number = 0;
        
        [times, digits] = await this.generationByOrder(source, lhs, rhs, option.radix, 'descent', 0, callback);
        
        this.stack.push(0);
        this.stack.push(lhs);
        this.stack.push(rhs);

        while (this.stack.length > 0) {
            rhs = this.stack.pop() as number;
            lhs = this.stack.pop() as number;
            digit = this.stack.pop() as number;

            times = await this.sortByOrder(source, lhs, rhs, digit, option, 'descent', times, callback);

            if (digit < digits) {
                ranges = this.parititionByOrder(source, lhs, rhs, digit, 'descent');
                
                while (ranges.length > 0) {
                    range = ranges.pop() as SortIndexRange;
                    this.stack.push(digit + 1);
                    this.stack.push(range.start);
                    this.stack.push(range.final);
                }
            }
        }
        
        ranges = null;
        range = null;
        
        await delay();
        await this.complete(source, 0, callback);
    }

}