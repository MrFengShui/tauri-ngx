import { Injectable } from "@angular/core";

import { SortDataModel, SortStateModel, SortOrder, SortDataRadixModel, SortRadix } from "../ngrx-store/sort.state";

import { delay } from "../../../public/global.utils";
import { ACCENT_TWO_COLOR, ACCENT_ONE_COLOR, PRIMARY_TWO_COLOR, SECONDARY_TWO_COLOR, PRIMARY_ONE_COLOR, SECONDARY_ONE_COLOR } from "../../../public/global.utils";

import { AbstractDistributionSortService } from "./base-sort.service";

const matchKeyByRadix = (model: SortDataRadixModel | undefined, radix: SortRadix, digit: number): string => {
    if (model) {
        if (radix === 2) {
            return model.bin[digit];
        }
    
        if (radix === 8) {
            return model.oct[digit];
        }
        
        if (radix === 10) {
            return model.dec[digit];
        }
        
        if (radix === 16) {
            return model.hex[digit];
        }
    }
    
    return '';
}

const matchDigitsByRadix = (model: SortDataRadixModel | undefined, radix: SortRadix): number => {
    if (model) {
        if (radix === 2) {
            return model.bin.length;
        }
    
        if (radix === 8) {
            return model.oct.length;
        }
    
        if (radix === 10) {
            return model.dec.length;
        }
    
        if (radix === 16) {
            return model.hex.length;
        }
    }
    
    return -1;
}

const RADIX_KEYS: string[] = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f'];
const map: { [key: string | number]: SortDataModel[] } = {};
const matchCacheByRadix = (radix: SortRadix): { [key: string | number]: SortDataModel[] } => {
    const keys: string[] = Object.keys(map);

    if (keys.length > 0) {
        keys.forEach(key => {
            map[key].splice(0);
            delete map[key];
        });
    }

    for (let i = 0; i < radix; i++) {
        map[RADIX_KEYS[i]] = Array.from([]);
    }

    return map;
}

type MSDRadixMeta = { start: number, final: number, digit: number };

/**
 * 基数排序（低位）
 */
@Injectable()
export class RadixLSDSortService extends AbstractDistributionSortService<SortDataModel> {

    protected override cacheOfKeyValues: { [key: string]: SortDataModel[] } = { 
        '0': [], '1': [], '2': [], '3': [], '4': [], '5': [], '6': [], '7': [], '8': [], '9': [], 
        'a': [], 'b': [], 'c': [], 'd': [], 'e': [], 'f': [] 
    };

    protected override async sortByAscent(source: SortDataModel[], lhs: number, rhs: number, option: string | number | undefined, callback: (param: SortStateModel) => void): Promise<void> {
        let radix: SortRadix = option as number, digits: number = matchDigitsByRadix(source[0].radix, radix), times: number = 0;
        
        for (let digit = digits - 1; digit >= 0; digit--) {
            times = await this.saveByDigit(source, lhs, rhs, radix, digit, 'ascent', times, callback);
            times = await this.loadByDigit(source, lhs, rhs, 'ascent', times, callback);
        }

        await delay();
        await this.complete(source, times, callback);
    }

    protected override async sortByDescent(source: SortDataModel[], lhs: number, rhs: number, option: string | number | undefined, callback: (param: SortStateModel) => void): Promise<void> {
        let radix: SortRadix = option as number, digits: number = matchDigitsByRadix(source[0].radix, radix), times: number = 0;
        
        for (let digit = digits - 1; digit >= 0; digit--) {
            times = await this.saveByDigit(source, lhs, rhs, radix, digit, 'descent', times, callback);
            times = await this.loadByDigit(source, lhs, rhs, 'descent', times, callback);
        }
        
        await delay();
        await this.complete(source, 0, callback);
    }

    protected override save(source: SortDataModel[], order: SortOrder, times: number, callback: (param: SortStateModel) => void): Promise<number> {
        throw new Error("Method not implemented.");
    }

    protected override load(source: SortDataModel[], order: SortOrder, times: number, callback: (param: SortStateModel) => void): Promise<number> {
        throw new Error("Method not implemented.");
    }

    private async saveByDigit(source: SortDataModel[], lhs: number, rhs: number, radix: SortRadix, digit: number, order: SortOrder, times: number, callback: (param: SortStateModel) => void): Promise<number> {
        let data: SortDataModel, key: string | number;
        
        if (order === 'ascent') {
            for (let i = lhs; i <= rhs; i++) {
                data = source[i];
                key = matchKeyByRadix(data.radix, radix, digit);
                
                this.cacheOfKeyValues[key].push(data);

                await this._service.swapAndRender(source, false, false, i, i, PRIMARY_ONE_COLOR, SECONDARY_ONE_COLOR, ACCENT_ONE_COLOR, times, callback);

                times += 1;
            }
        }
        
        if (order === 'descent') {
            for (let i = rhs; i >= lhs; i--) {
                data = source[i];
                key = matchKeyByRadix(data.radix, radix, digit);
                
                this.cacheOfKeyValues[key].push(data);
                
                await this._service.swapAndRender(source, false, false, i, i, PRIMARY_ONE_COLOR, SECONDARY_ONE_COLOR, ACCENT_ONE_COLOR, times, callback);

                times += 1;
            }
        }
        
        return times;
    }

    private async loadByDigit(source: SortDataModel[], lhs: number, rhs: number, order: SortOrder, times: number, callback: (param: SortStateModel) => void): Promise<number> {
        let index: number = -1, key: string | number, temp: SortDataModel;
        
        this.keys = Object.keys(this.cacheOfKeyValues);        

        if (order === 'ascent') {
            index = lhs;
        }

        if (order === 'descent') {
            index = rhs;
        }
        
        for (let i = 0; i < this.keys.length; i++) {
            key = this.keys[i];
            this.array = this.cacheOfKeyValues[key];

            if (this.array.length === 0) continue;
            
            for (let j = 0, length = this.array.length; j < length; j++) {
                source[index] = this.array[j];
                
                await this._service.swapAndRender(source, false, false, index, index, PRIMARY_TWO_COLOR, SECONDARY_TWO_COLOR, ACCENT_TWO_COLOR, times, callback);
                
                if (order === 'ascent') {
                    index += 1;
                }
                
                if (order === 'descent') {
                    index -= 1;
                }
                
                times += 1;
            }

            this.array.splice(0);
            this.cacheOfKeyValues[key].splice(0);
        }
        
        return times;
    }

}

/**
 * 基数排序（高位/递归）
 */
@Injectable()
export class RecursiveRadixMSDSortService extends AbstractDistributionSortService<SortDataModel> {

    protected override async sortByAscent(source: SortDataModel[], lhs: number, rhs: number, option: string | number | undefined, callback: (param: SortStateModel) => void): Promise<void> {
        const radix: SortRadix = option as number, digits: number = matchDigitsByRadix(source[0].radix, radix);
        let times: number = await this.ascent(source, lhs, rhs, radix, 0, digits, 0, callback);

        await delay();
        await this.complete(source, times, callback);
    }

    protected override async sortByDescent(source: SortDataModel[], lhs: number, rhs: number, option: string | number | undefined, callback: (param: SortStateModel) => void): Promise<void> {
        const radix: SortRadix = option as number, digits: number = matchDigitsByRadix(source[0].radix, radix);
        let times: number = await this.descent(source, lhs, rhs, radix, 0, digits, 0, callback);

        await delay();
        await this.complete(source, times, callback);
    }

    private async ascent(source: SortDataModel[], lhs: number, rhs: number, radix: SortRadix, digit: number, digits: number, times: number, callback: (param: SortStateModel) => void): Promise<number> {
        if (digit < digits) {
            let cache: { [key: string]: SortDataModel[] } | null, metaList: MSDRadixMeta[] | null, metaItem: MSDRadixMeta, key: string, gap: number;
            
            [cache, times] = await this.saveByDigit(source, lhs, rhs, radix, digit, 'ascent', times, callback);
            [cache, times] = await this.loadByDigit(source, lhs, rhs, cache, 'ascent', times, callback);
            
            this.keys = Object.keys(cache).filter(key => cache && cache[key].length > 0);
            
            if (this.keys.length > 0) {
                metaList = Array.from([]);

                for (let i = 0, length = this.keys.length; i < length; i++) {
                    key = this.keys[i];
                    gap = cache[key].length;

                    lhs = i === 0 ? lhs : rhs + 1;
                    rhs = lhs + gap - 1;
                    metaList.push({ start: lhs, final: rhs, digit: digit + 1 });
                }
                
                for (let i = 0, length = metaList.length; i < length; i++) {
                    metaItem = metaList[i];
                    lhs = metaItem.start;
                    rhs = metaItem.final;
                    digit = metaItem.digit;
                    times = await this.ascent(source, lhs, rhs, radix, digit, digits, times, callback);
                }

                metaList.splice(0);
                metaList = null;
            }
        }

        return times;
    }

    private async descent(source: SortDataModel[], lhs: number, rhs: number, radix: SortRadix, digit: number, digits: number, times: number, callback: (param: SortStateModel) => void): Promise<number> {
        if (digit < digits) {
            let cache: { [key: string]: SortDataModel[] } | null, metaList: MSDRadixMeta[] | null, metaItem: MSDRadixMeta, key: string, gap: number;

            [cache, times] = await this.saveByDigit(source, lhs, rhs, radix, digit, 'descent', times, callback);
            [cache, times] = await this.loadByDigit(source, lhs, rhs, cache, 'descent', times, callback);
            
            this.keys = Object.keys(cache).filter(key => cache && cache[key].length > 0);
            
            if (!this.keys.every(key => cache && cache[key].length === 0)) {
                metaList = Array.from([]);

                for (let i = 0, length = this.keys.length; i < length; i++) {
                    key = this.keys[i];
                    gap = cache[key].length;

                    rhs = i === 0 ? rhs : lhs - 1;
                    lhs = rhs - gap + 1;
                    metaList.push({ start: lhs, final: rhs, digit: digit + 1 });
                }
                
                for (let i = 0, length = metaList.length; i < length; i++) {
                    metaItem = metaList[i];
                    lhs = metaItem.start;
                    rhs = metaItem.final;
                    digit = metaItem.digit;
                    times = await this.descent(source, lhs, rhs, radix, digit, digits, times, callback);
                }

                metaList.splice(0);
                metaList = null;
            }
        }

        return times;
    }

    protected override save(source: SortDataModel[], order: SortOrder, times: number, callback: (param: SortStateModel) => void): Promise<number> {
        throw new Error("Method not implemented.");
    }
    
    protected override load(source: SortDataModel[], order: SortOrder, times: number, callback: (param: SortStateModel) => void): Promise<number> {
        throw new Error("Method not implemented.");
    }

    protected async saveByDigit(source: SortDataModel[], lhs: number, rhs: number, radix: SortRadix, digit: number, order: SortOrder, times: number, callback: (param: SortStateModel) => void): Promise<[{ [key: string]: SortDataModel[] }, number]> {
        let cache: { [key: string | number]: SortDataModel[] } = matchCacheByRadix(radix), element: SortDataModel;
        
        if (order === 'ascent') {
            for (let i = lhs; i <= rhs; i++) {
                element = source[i];             
                cache[matchKeyByRadix(element.radix, radix, digit)].push(element);

                await this._service.swapAndRender(source, false, false, i, i, PRIMARY_ONE_COLOR, SECONDARY_ONE_COLOR, ACCENT_ONE_COLOR, times, callback);

                times += 1;
            }
        }
        
        if (order === 'descent') {
            for (let i = rhs; i >= lhs; i--) {
                element = source[i];               
                cache[matchKeyByRadix(element.radix, radix, digit)].push(element);
                
                await this._service.swapAndRender(source, false, false, i, i, PRIMARY_ONE_COLOR, SECONDARY_ONE_COLOR, ACCENT_ONE_COLOR, times, callback);

                times += 1;
            }
        }
        
        return [cache, times];
    }

    protected async loadByDigit(source: SortDataModel[], lhs: number, rhs: number, cache: { [key: string]: SortDataModel[] }, order: SortOrder, times: number, callback: (param: SortStateModel) => void): Promise<[{ [key: string]: SortDataModel[] }, number]> {
        let keys: string[] | null, index: number = -1;
        
        keys = Object.keys(cache);
        keys = keys.filter(key => cache[key].length > 0);
        
        if (order === 'ascent') {
            index = lhs;
        }
        
        if (order === 'descent') {
            index = rhs;
        }

        for (let i = 0; i < keys.length; i++) {
            this.array = cache[keys[i]];

            for (let j = 0, length = this.array.length; j < length; j++) {
                source[index] = this.array[j];
                
                await this._service.swapAndRender(source, false, false, index, index, PRIMARY_TWO_COLOR, SECONDARY_TWO_COLOR, ACCENT_TWO_COLOR, times, callback);

                if (order === 'ascent') {
                    index += 1;
                }
                

                if (order === 'descent') {
                    index -= 1;
                }
                
                times += 1;
            }
        }
                
        keys.splice(0);
        keys = null;
        
        return [cache, times];
    }

}

/**
 * 基数排序（高位/迭代）
 */
@Injectable()
export class IterativeRadixMSDSortService extends RecursiveRadixMSDSortService {

    private rangeStack: MSDRadixMeta[] = Array.from([]);

    protected override async sortByAscent(source: SortDataModel[], lhs: number, rhs: number, option: string | number | undefined, callback: (param: SortStateModel) => void): Promise<void> {
        let meta: MSDRadixMeta, radix: SortRadix = option as number, digits: number = matchDigitsByRadix(source[0].radix, radix);
        let start: number = lhs, final: number = rhs, key: string, gap: number, times: number = 0;

        this.rangeStack.push({ start, final, digit: 0 });
        
        while (this.rangeStack.length > 0) {
            meta = this.rangeStack.pop() as MSDRadixMeta;
            
            if (meta.digit < digits) {
                [this.cacheOfKeyValues, times] = await this.saveByDigit(source, meta.start, meta.final, radix, meta.digit, 'ascent', times, callback);
                [this.cacheOfKeyValues, times] = await this.loadByDigit(source, meta.start, meta.final, this.cacheOfKeyValues, 'ascent', times, callback);
                
                this.keys = Object.keys(this.cacheOfKeyValues);

                for (let length = this.keys.length, i = length - 1; i >= 0; i--) {
                    key = this.keys[i];
                    gap = this.cacheOfKeyValues[key].length;

                    final = i === length - 1 ? meta.final : start - 1;
                    start = final - gap + 1;
                    
                    this.rangeStack.push({ start, final, digit: meta.digit + 1 });
                }

                Object.keys(this.cacheOfKeyValues).forEach(key => {
                    this.cacheOfKeyValues[key].splice(0);
                    delete this.cacheOfKeyValues[key];
                });
            }
        }
        
        await delay();
        await this.complete(source, times, callback);
    }

    protected override async sortByDescent(source: SortDataModel[], lhs: number, rhs: number, option: string | number | undefined, callback: (param: SortStateModel) => void): Promise<void> {
        let meta: MSDRadixMeta, radix: SortRadix = option as number, digits: number = matchDigitsByRadix(source[0].radix, radix);
        let start: number = lhs, final: number = rhs, key: string, gap: number, times: number = 0;

        this.rangeStack.push({ start, final, digit: 0 });

        while (this.rangeStack.length > 0) {
            meta = this.rangeStack.pop() as MSDRadixMeta;
            
            if (meta.digit < digits) {
                [this.cacheOfKeyValues, times] = await this.saveByDigit(source, meta.start, meta.final, radix, meta.digit, 'descent', times, callback);
                [this.cacheOfKeyValues, times] = await this.loadByDigit(source, meta.start, meta.final, this.cacheOfKeyValues, 'descent', times, callback);
                
                this.keys = Object.keys(this.cacheOfKeyValues);

                for (let length = this.keys.length, i = length - 1; i >= 0; i--) {
                    key = this.keys[i];
                    gap = this.cacheOfKeyValues[key].length;

                    start = i === length - 1 ? meta.start : final + 1;
                    final = start + gap - 1;
                    
                    this.rangeStack.push({ start, final, digit: meta.digit + 1 });
                }
                
                Object.keys(this.cacheOfKeyValues).forEach(key => {
                    this.cacheOfKeyValues[key].splice(0);
                    delete this.cacheOfKeyValues[key];
                });
            }
        }
        
        await delay();
        await this.complete(source, times, callback);
    }

}