import { Injectable } from "@angular/core";

import { SortDataModel, SortStateModel, SortOrder, SortDataRadixModel, SortRadix, SortIndexRange } from "../ngrx-store/sort.state";

import { ACCENT_COLOR, delay, PRIMARY_COLOR, SECONDARY_COLOR } from "../../../public/global.utils";
import { ACCENT_TWO_COLOR, ACCENT_ONE_COLOR, PRIMARY_TWO_COLOR, SECONDARY_TWO_COLOR, PRIMARY_ONE_COLOR, SECONDARY_ONE_COLOR } from "../../../public/global.utils";

import { AbstractComparisonSortService, AbstractDistributionSortService } from "./base-sort.service";

type MSDRadixMeta = { start: number, final: number, digit: number };

/**
 * 基数排序（低位）
 */
@Injectable()
export class RadixLSDSortService extends AbstractDistributionSortService<SortDataModel | number> {

    protected digit: number = -1;

    protected override cacheOfKeyValues: { [key: string | number]: SortDataModel[] } = { 
        '0': [], '1': [], '2': [], '3': [], '4': [], '5': [], '6': [], '7': [], '8': [], '9': [], 
        'a': [], 'b': [], 'c': [], 'd': [], 'e': [], 'f': [] 
    };

    protected override async sortByAscent(source: SortDataModel[], lhs: number, rhs: number, option: string | number | undefined, callback: (param: SortStateModel) => void): Promise<void> {
        let maxValue: number = Math.max(...source.map(item => item.value)), radix: SortRadix = option as number;
        let digits: number = maxValue.toString(radix).length, times: number = 0;

        for (let i = lhs; i <= rhs; i++) {
            source[i].radix = source[i].value.toString(radix).padStart(digits, '0');
            times = await this.sweep(source, i, ACCENT_COLOR, times, callback);
        }
        
        for (let digit = digits - 1; digit >= 0; digit--) {
            this.digit = digit;

            times = await this.saveByOrder(source, lhs, rhs, 'ascent', times, callback);
            times = await this.loadByOrder(source, lhs, rhs, 'ascent', times, callback);
        }

        await delay();
        await this.complete(source, times, callback);
    }

    protected override async sortByDescent(source: SortDataModel[], lhs: number, rhs: number, option: string | number | undefined, callback: (param: SortStateModel) => void): Promise<void> {
        let maxValue: number = Math.max(...source.map(item => item.value)), radix: SortRadix = option as number;
        let digits: number = maxValue.toString(radix).length, times: number = 0;
        
        for (let i = rhs; i >= lhs; i--) {
            source[i].radix = source[i].value.toString(radix).padStart(digits, '0');
            times = await this.sweep(source, i, ACCENT_COLOR, times, callback);
        }
        
        for (let digit = digits - 1; digit >= 0; digit--) {
            this.digit = digit;
            
            times = await this.saveByOrder(source, lhs, rhs, 'descent', times, callback);
            times = await this.loadByOrder(source, lhs, rhs, 'descent', times, callback);
        }
        
        await delay();
        await this.complete(source, 0, callback);
    }

    protected override async saveByOrder(source: SortDataModel[], lhs: number, rhs: number, order: SortOrder, times: number, callback: (param: SortStateModel) => void): Promise<number> {
        return this.saveByDigit(source, lhs, rhs, this.digit, order, times, callback);
    }

    protected async saveByDigit(source: SortDataModel[], lhs: number, rhs: number, digit: number, order: SortOrder, times: number, callback: (param: SortStateModel) => void): Promise<number> {
        let data: SortDataModel, key: string | number;
        
        if (order === 'ascent') {
            for (let i = lhs; i <= rhs; i++) {
                data = source[i];
                key = (data?.radix as string)[digit];
                
                this.cacheOfKeyValues[key].push(data);

                await this._service.swapAndRender(source, false, false, i, i, PRIMARY_ONE_COLOR, SECONDARY_ONE_COLOR, ACCENT_ONE_COLOR, times, callback);

                times += 1;
            }
        }
        
        if (order === 'descent') {
            for (let i = rhs; i >= lhs; i--) {
                data = source[i];
                key = (data?.radix as string)[digit];
                
                this.cacheOfKeyValues[key].push(data);
                
                await this._service.swapAndRender(source, false, false, i, i, PRIMARY_ONE_COLOR, SECONDARY_ONE_COLOR, ACCENT_ONE_COLOR, times, callback);

                times += 1;
            }
        }
        
        return times;
    }

    protected override async loadByOrder(source: SortDataModel[], lhs: number, rhs: number, order: SortOrder, times: number, callback: (param: SortStateModel) => void): Promise<number> {
        let index: number = -1, key: string | number;
        
        this.keys = Object.keys(this.cacheOfKeyValues);        

        if (order === 'ascent') {
            index = lhs;
        }

        if (order === 'descent') {
            index = rhs;
        }
        
        while (this.keys.length > 0) {
            key = this.keys.shift() as string;
            this.array = this.cacheOfKeyValues[key];

            while (this.array.length > 0) {
                source[index] = this.array.shift() as SortDataModel;

                times = await this.sweep(source, index, ACCENT_TWO_COLOR, times, callback);

                if (order === 'ascent') {
                    index += 1;
                }

                if (order === 'descent') {
                    index -= 1;
                }
            }
        }
        
        return times;
    }

}

/**
 * 基数排序（高位/递归）
 */
@Injectable()
export class RecursiveRadixMSDSortService extends RadixLSDSortService {

    protected override async sortByAscent(source: SortDataModel[], lhs: number, rhs: number, option: string | number | undefined, callback: (param: SortStateModel) => void): Promise<void> {
        let maxValue: number = Math.max(...source.map(item => item.value)), radix: SortRadix = option as number;
        let digits: number = maxValue.toString(radix).length, times: number = 0;

        for (let i = lhs; i <= rhs; i++) {
            source[i].radix = source[i].value.toString(radix).padStart(digits, '0');
            times = await this.sweep(source, i, ACCENT_COLOR, times, callback);
        }

        times = await this.sortByOrder(source, lhs, rhs, 0, digits, 'ascent', times, callback);

        await delay();
        await this.complete(source, times, callback);
    }

    protected override async sortByDescent(source: SortDataModel[], lhs: number, rhs: number, option: string | number | undefined, callback: (param: SortStateModel) => void): Promise<void> {
        let maxValue: number = Math.max(...source.map(item => item.value)), radix: SortRadix = option as number;
        let digits: number = maxValue.toString(radix).length, times: number = 0;

        for (let i = rhs; i >= lhs; i--) {
            source[i].radix = source[i].value.toString(radix).padStart(digits, '0');
            times = await this.sweep(source, i, ACCENT_COLOR, times, callback);
        }

        times = await this.sortByOrder(source, lhs, rhs, 0, digits, 'descent', times, callback);

        await delay();
        await this.complete(source, times, callback);
    }

    private async sortByOrder(source: SortDataModel[], lhs: number, rhs: number, digit: number, digits: number, order: SortOrder, times: number, callback: (param: SortStateModel) => void): Promise<number> {
        if (digit < digits) {
            times = await this.saveByDigit(source, lhs, rhs, digit, order, times, callback);
            times = await this.loadByOrder(source, lhs, rhs, order, times, callback);

            let ranges: MSDRadixMeta[] | null = this.splitByOrder(source, lhs, rhs, digit, order), range: MSDRadixMeta;
            
            while (ranges.length > 0) {
                range = ranges.shift() as MSDRadixMeta;
                times = await this.sortByOrder(source, range.start, range.final, range.digit, digits, order, times, callback);
            }

            ranges = null;
        }

        return times;
    }

    protected splitByOrder(source: SortDataModel[], lhs: number, rhs: number, digit: number, order: SortOrder): MSDRadixMeta[] {
        let j: number, index: number, fstRadix: string, sndRadix: string, ranges: MSDRadixMeta[] = Array.from([]);

        if (order === 'ascent') {
            index = lhs;

            for (let i = lhs; i <= rhs; i++) {
                j = Math.min(i + 1, rhs);
                fstRadix = source[i]?.radix as string;
                sndRadix = source[j]?.radix as string;
    
                if (fstRadix[digit] !== sndRadix[digit] || i === j) {
                    ranges.push({ start: index, final: i, digit: digit + 1 });
    
                    index = j;
                }
            }            
        }
        
        if (order === 'descent') {
            index = rhs;

            for (let i = rhs; i >= lhs; i--) {
                j = Math.max(i - 1, lhs);
                fstRadix = source[i]?.radix as string;
                sndRadix = source[j]?.radix as string;
    
                if (fstRadix[digit] !== sndRadix[digit] || i === j) {
                    ranges.push({ start: i, final: index, digit: digit + 1 });
    
                    index = j;
                }
            }
        }
        
        return ranges;
    }

}

/**
 * 基数排序（高位/迭代）
 */
@Injectable()
export class IterativeRadixMSDSortService extends RecursiveRadixMSDSortService {

    private ranges: MSDRadixMeta[] = Array.from([]);
    private range: MSDRadixMeta | null = null;

    protected override async sortByAscent(source: SortDataModel[], lhs: number, rhs: number, option: string | number | undefined, callback: (param: SortStateModel) => void): Promise<void> {
        let maxValue: number = Math.max(...source.map(item => item.value)), radix: SortRadix = option as number;
        let digits: number = maxValue.toString(radix).length, digit: number = 0, times: number = 0;

        for (let i = lhs; i <= rhs; i++) {
            source[i].radix = source[i].value.toString(radix).padStart(digits, '0');
            times = await this.sweep(source, i, ACCENT_COLOR, times, callback);
        }

        this.stack.push(digit);
        this.stack.push(rhs);
        this.stack.push(lhs);

        while (this.stack.length > 0) {
            lhs = this.stack.pop() as number;
            rhs = this.stack.pop() as number;
            digit = this.stack.pop() as number;
            
            if (digit < digits) {
                times = await this.saveByDigit(source, lhs, rhs, digit, 'ascent', times, callback);
                times = await this.loadByOrder(source, lhs, rhs, 'ascent', times, callback);

                this.ranges = this.splitByOrder(source, lhs, rhs, digit, 'ascent');
    
                while (this.ranges.length > 0) {
                    this.range = this.ranges.pop() as MSDRadixMeta;
                    this.stack.push(this.range.digit);
                    this.stack.push(this.range.final);
                    this.stack.push(this.range.start);
                }
            }
        }
        
        await delay();
        await this.complete(source, times, callback);
    }

    protected override async sortByDescent(source: SortDataModel[], lhs: number, rhs: number, option: string | number | undefined, callback: (param: SortStateModel) => void): Promise<void> {
        let maxValue: number = Math.max(...source.map(item => item.value)), radix: SortRadix = option as number;
        let digits: number = maxValue.toString(radix).length, digit: number = 0, times: number = 0;

        for (let i = rhs; i >= lhs; i--) {
            source[i].radix = source[i].value.toString(radix).padStart(digits, '0');
            times = await this.sweep(source, i, ACCENT_COLOR, times, callback);
        }

        this.stack.push(digit);
        this.stack.push(lhs);
        this.stack.push(rhs);

        while (this.stack.length > 0) {
            rhs = this.stack.pop() as number;
            lhs = this.stack.pop() as number;
            digit = this.stack.pop() as number;
            
            if (digit < digits) {
                times = await this.saveByDigit(source, lhs, rhs, digit, 'descent', times, callback);
                times = await this.loadByOrder(source, lhs, rhs, 'descent', times, callback);

                this.ranges = this.splitByOrder(source, lhs, rhs, digit, 'descent');
    
                while (this.ranges.length > 0) {
                    this.range = this.ranges.pop() as MSDRadixMeta;
                    this.stack.push(this.range.digit);
                    this.stack.push(this.range.start);
                    this.stack.push(this.range.final);
                }
            }
        }

        await delay();
        await this.complete(source, times, callback);
    }

}

/**
 * 原地基数排序（低位）
 */
@Injectable()
export class InPlaceRadixLSDSortService extends AbstractComparisonSortService {

    protected override async sortByAscent(source: SortDataModel[], lhs: number, rhs: number, option: string | number | undefined, callback: (param: SortStateModel) => void): Promise<void> {
        let maxValue: number = Math.max(...source.map(item => item.value)), radix: SortRadix = option as number;
        let digits: number = maxValue.toString(radix).length, key: string, times: number = 0;

        for (let i = lhs; i <= rhs; i++) {
            source[i].radix = source[i].value.toString(radix).padStart(digits, '0');
            times = await this.sweep(source, i, ACCENT_COLOR, times, callback);
        }
        
        for (let digit = digits - 1; digit >= 0; digit--) {
            times = await this.stableSortByOrder(source, lhs, rhs, digit, 'ascent', times, callback);
        }

        await delay();
        await this.complete(source, times, callback);
    }

    protected override async sortByDescent(source: SortDataModel[], lhs: number, rhs: number, option: string | number | undefined, callback: (param: SortStateModel) => void): Promise<void> {
        let maxValue: number = Math.max(...source.map(item => item.value)), radix: SortRadix = option as number;
        let digits: number = maxValue.toString(radix).length, times: number = 0;
        
        for (let i = rhs; i >= lhs; i--) {
            source[i].radix = source[i].value.toString(radix).padStart(digits, '0');
            times = await this.sweep(source, i, ACCENT_COLOR, times, callback);
        }
        
        for (let digit = digits - 1; digit >= 0; digit--) {
            times = await this.stableSortByOrder(source, lhs, rhs, digit, 'descent', times, callback);
        }
        
        await delay();
        await this.complete(source, 0, callback);
    }

    protected async stableSortByOrder(source: SortDataModel[], lhs: number, rhs: number, digit: number, order: SortOrder, times: number, callback: (param: SortStateModel) => void): Promise<number> {
        let fstRadix: string, sndRadix: string, flag: boolean;

        if (order === 'ascent') {
            for (let i = lhs + 1; i <= rhs; i++) {
                for (let j = i; j > lhs; j--) {
                    fstRadix = source[j]?.radix as string;
                    sndRadix = source[j - 1]?.radix as string;
                    flag = sndRadix[digit] > fstRadix[digit];
    
                    source[i].color = ACCENT_COLOR;
                    callback({ times, datalist: source });
    
                    times = await this.exchange(source, flag, j, j - 1, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, times, callback);
    
                    if (!flag) break;
                }
    
                times = await this.sweep(source, i, ACCENT_COLOR, times, callback);
            }
        }
        
        if (order === 'descent') {
            for (let i = rhs - 1; i >= lhs; i--) {
                for (let j = i; j < rhs; j++) {
                    fstRadix = source[j]?.radix as string;
                    sndRadix = source[j + 1]?.radix as string;
                    flag = sndRadix[digit] > fstRadix[digit];

                    source[i].color = ACCENT_COLOR;
                    callback({ times, datalist: source });

                    times = await this.exchange(source, flag, j, j + 1, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, times, callback);

                    if (!flag) break;
                }

                times = await this.sweep(source, i, ACCENT_COLOR, times, callback);
            }   
        }

        return times;
    }

}

/**
 * 原地基数排序（高位）
 */
@Injectable()
export class InPlaceRadixMSDSortService extends InPlaceRadixLSDSortService {

    private ranges: MSDRadixMeta[] = Array.from([]);
    private range: MSDRadixMeta | undefined = undefined;

    protected override async sortByAscent(source: SortDataModel[], lhs: number, rhs: number, option: string | number | undefined, callback: (param: SortStateModel) => void): Promise<void> {
        let maxValue: number = Math.max(...source.map(item => item.value)), radix: SortRadix = option as number;
        let digits: number = maxValue.toString(radix).length, digit: number;
        let start: number, final: number, times: number = 0;

        for (let i = lhs; i <= rhs; i++) {
            source[i].radix = source[i].value.toString(radix).padStart(digits, '0');
            times = await this.sweep(source, i, ACCENT_COLOR, times, callback);
        }
        
        this.stack.push(0);
        this.stack.push(rhs);
        this.stack.push(lhs);

        while (this.stack.length > 0) {
            start = this.stack.pop() as number;
            final = this.stack.pop() as number;
            digit = this.stack.pop() as number;

            times = await this.stableSortByOrder(source, start, final, digit, 'ascent', times, callback);

            if (digit < digits) {
                times = await this.splitByOrder(source, start, final, digit, 'ascent', times, callback);
                
                while (this.ranges.length > 0) {
                    this.range = this.ranges.pop();
                    this.stack.push(this.range?.digit as number);
                    this.stack.push(this.range?.final as number);
                    this.stack.push(this.range?.start as number);
                }
            }
        }
        
        await delay();
        await this.complete(source, times, callback);
    }

    protected override async sortByDescent(source: SortDataModel[], lhs: number, rhs: number, option: string | number | undefined, callback: (param: SortStateModel) => void): Promise<void> {
        let maxValue: number = Math.max(...source.map(item => item.value)), radix: SortRadix = option as number;
        let digits: number = maxValue.toString(radix).length, digit: number;
        let start: number, final: number, times: number = 0;
        
        for (let i = rhs; i >= lhs; i--) {
            source[i].radix = source[i].value.toString(radix).padStart(digits, '0');
            times = await this.sweep(source, i, ACCENT_COLOR, times, callback);
        }
        
        this.stack.push(0);
        this.stack.push(lhs);
        this.stack.push(rhs);

        while (this.stack.length > 0) {
            final = this.stack.pop() as number;
            start = this.stack.pop() as number;
            digit = this.stack.pop() as number;

            times = await this.stableSortByOrder(source, start, final, digit, 'descent', times, callback);

            if (digit < digits) {
                times = await this.splitByOrder(source, start, final, digit, 'descent', times, callback);
                
                while (this.ranges.length > 0) {
                    this.range = this.ranges.pop();
                    this.stack.push(this.range?.digit as number);
                    this.stack.push(this.range?.start as number);
                    this.stack.push(this.range?.final as number);
                }
            }
        }
        
        await delay();
        await this.complete(source, 0, callback);
    }

    private async splitByOrder(source: SortDataModel[], lhs: number, rhs: number, digit: number, order: SortOrder, times: number, callback: (param: SortStateModel) => void): Promise<number> {
        let j: number, start: number = lhs, final: number = rhs, fstRadix: string, sndRadix: string;

        if (order === 'ascent') {
            for (let i = lhs; i <= rhs; i++) {
                j = Math.min(i + 1, rhs);
                fstRadix = source[i]?.radix as string;
                sndRadix = source[j]?.radix as string;
    
                if (fstRadix[digit] !== sndRadix[digit] || i === j) {
                    final = i;
                    this.ranges.push({ start, final, digit: digit + 1 });
    
                    start = i + 1;
                }
    
                times = await this.sweep(source, i, ACCENT_COLOR, times, callback);
            }
        }
        
        if (order === 'descent') {
            for (let i = rhs; i >= lhs; i--) {
                j = Math.max(i - 1, lhs);
                fstRadix = source[i]?.radix as string;
                sndRadix = source[j]?.radix as string;
    
                if (fstRadix[digit] !== sndRadix[digit] || i === j) {
                    start = i;
                    this.ranges.push({ start, final, digit: digit + 1 });
    
                    final = i - 1;
                }
    
                times = await this.sweep(source, i, ACCENT_COLOR, times, callback);
            }
        }
        
        return times;
    }

}