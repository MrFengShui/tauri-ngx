import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { cloneDeep } from "lodash";

import { SortDataModel, SortStateModel, SortOrder, SortDataRadixModel, SortRadix } from "../ngrx-store/sort.state";
import { SORT_DELAY_DURATION, complete, delay } from "../sort.utils";
import { ACCENT_TWO_COLOR, CLEAR_COLOR, ACCENT_ONE_COLOR } from "../../../public/values.utils";

const matchKeyByRadix = (model: SortDataRadixModel, radix: SortRadix, digit: number): string => {
    if (radix === 2) {
        return model.bin.charAt(digit);
    }

    if (radix === 8) {
        return model.oct.charAt(digit);
    }
    
    if (radix === 10) {
        return model.dec.charAt(digit);
    }
    
    if (radix === 16) {
        return model.hex.charAt(digit);
    }

    return '';
}

const matchLengthByRadix = (model: SortDataRadixModel, radix: SortRadix): number => {
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

    return -1;
}

/**
 * 基数排序（低位）
 */
@Injectable()
export class RadixLSDSortService {

    private cache: {[key: string | number]: SortDataModel[]} = { 
        '0': [], '1': [], '2': [], '3': [], '4': [], '5': [], '6': [], '7': [], '8': [], '9': [], 
        'a': [], 'b': [], 'c': [], 'd': [], 'e': [], 'f': [] 
    };

    public sort(array: SortDataModel[], order: SortOrder, radix: SortRadix): Observable<SortStateModel> {
        return new Observable(subscriber => {
            if (order === 'ascent') {
                this.sortByAscent(array, radix, 0, param => subscriber.next(param)).then(() => subscriber.complete());
            }
    
            if (order === 'descent') {
                this.sortByDescent(array, radix, 0, param => subscriber.next(param)).then(() => subscriber.complete());
            }
        });
    }

    private async sortByAscent(source: SortDataModel[], radix: SortRadix, times: number, callback: (param: SortStateModel) => void): Promise<void> {
        const matchLength: number = matchLengthByRadix(source[0].radix as SortDataRadixModel, radix);
        let index: number, key: string = '', keys: string[];
        
        for (let digit = matchLength - 1; digit >= 0; digit--) {
            times = await this.save(source, digit, radix, times, callback);
            
            keys = Object.keys(this.cache);
            index = 0;

            for (let i = 0; i < keys.length; i++) {
                if (this.cache[keys[i]].length === 0) continue;

                for (let j = 0, length = this.cache[keys[i]].length; j < length; j++) {
                    times += 1;

                    source[index] = this.cache[keys[i]][j];
                    source[index].color = ACCENT_TWO_COLOR;
                    callback({ times, datalist: source });

                    await delay(SORT_DELAY_DURATION);

                    source[index].color = CLEAR_COLOR;
                    callback({ times, datalist: source });
                    
                    index += 1;
                }
            }

            this.clear();
        }

        await delay(SORT_DELAY_DURATION);
        await complete(source, times, callback);
    }

    private async sortByDescent(source: SortDataModel[], radix: SortRadix, times: number, callback: (parram: SortStateModel) => void): Promise<void> {
        const length: number = matchLengthByRadix(source[0].radix as SortDataRadixModel, radix);
        let index: number, keys: string[];
        
        for (let digit = length - 1; digit >= 0; digit--) {
            times = await this.save(source, digit, radix, times, callback);
            
            keys = Object.keys(this.cache);
            index = 0;

            for (let i = keys.length - 1; i >= 0; i--) {
                if (this.cache[keys[i]].length === 0) continue;

                for (let j = 0, length = this.cache[keys[i]].length; j < length; j++) {
                    times += 1;

                    source[index] = this.cache[keys[i]][j];
                    source[index].color = ACCENT_TWO_COLOR;
                    callback({ times, datalist: source });

                    await delay(SORT_DELAY_DURATION);

                    source[index].color = CLEAR_COLOR;
                    callback({ times, datalist: source });
                    
                    index += 1;
                }
            }

            this.clear();
        }
        
        await delay(SORT_DELAY_DURATION);
        await complete(source, 0, callback);
    }

    private async save(source: SortDataModel[], digit: number, radix: SortRadix, times: number, callback: (parram: SortStateModel) => void): Promise<number> {
        let key: string;

        for (let i = 0, length = source.length; i < length; i++) {
            key = matchKeyByRadix(source[i].radix as SortDataRadixModel, radix, digit);
            
            times += 1;

            source[i].color = ACCENT_ONE_COLOR;
            callback({ times, datalist: source});

            await delay(SORT_DELAY_DURATION);
            
            source[i].color = CLEAR_COLOR;
            callback({ times, datalist: source});

            this.cache[key].push(source[i]);
        }

        return times;
    }

    private async clear(): Promise<void> {
        for (const key of Object.keys(this.cache)) {
            this.cache[key].splice(0);
        }
    }

}

/**
 * 基数排序（高位）
 */
@Injectable()
export class RadixMSDSortService {

    private cache: { [key: string | number]: SortDataModel[] } = { 
        '0': [], '1': [], '2': [], '3': [], '4': [], '5': [], '6': [], '7': [], '8': [], '9': [], 
        'a': [], 'b': [], 'c': [], 'd': [], 'e': [], 'f': [] 
    };
    private caches: Array<{ [key: string | number]: SortDataModel[] }> = Array.from([]);

    public sort(array: SortDataModel[], order: SortOrder, radix: SortRadix): Observable<SortStateModel> {
        return new Observable(subscriber => {
            if (order === 'ascent') {
                this.sortByAscent(array, radix, 0, param => subscriber.next(param)).then(() => subscriber.complete());
            }
    
            if (order === 'descent') {
                this.sortByDescent(array, radix, 0, param => subscriber.next(param)).then(() => subscriber.complete());
            }
        });
    }

    private async sortByAscent(source: SortDataModel[], radix: SortRadix, times: number, callback: (param: SortStateModel) => void): Promise<void> {
        const cache: { [key: string | number]: SortDataModel[] } = JSON.parse(JSON.stringify(this.cache));
        const length: number = matchLengthByRadix(source[0].radix as SortDataRadixModel, radix);

        times = await this.ascent(source, 0, source.length - 1, radix, 0, length, cache, times, callback);
        await delay(SORT_DELAY_DURATION);
        await complete(source, times, callback);
        await this.clear();
    }

    private async sortByDescent(source: SortDataModel[], radix: SortRadix, times: number, callback: (param: SortStateModel) => void): Promise<void> {
        const cache: { [key: string | number]: SortDataModel[] } = JSON.parse(JSON.stringify(this.cache));
        const length: number = matchLengthByRadix(source[0].radix as SortDataRadixModel, radix);

        times = await this.descent(source, 0, source.length - 1, radix, 0, length, cache, times, callback);
        await delay(SORT_DELAY_DURATION);
        await complete(source, times, callback);
        await this.clear();
    }

    private async ascent(source: SortDataModel[], lhs: number, rhs: number, radix: SortRadix, digit: number, length: number, cache: { [key: string | number]: SortDataModel[] }, 
        times: number, callback: (param: SortStateModel) => void): Promise<number> {
        let index: number, key: string | number, keys: string[];

        if (digit === length) return times;

        for (let i = lhs; i <= rhs; i++) {
            key = matchKeyByRadix(source[i].radix as SortDataRadixModel, radix, digit);
            
            times += 1;

            source[i].color = ACCENT_ONE_COLOR;
            callback({ times, datalist: source});

            await delay(SORT_DELAY_DURATION);
            
            source[i].color = CLEAR_COLOR;
            callback({ times, datalist: source});

            cache[key].push(source[i]);
        }
        
        keys = Object.keys(cache);
        index = lhs;

        for (let i = 0; i < keys.length; i++) {
            if (cache[keys[i]].length === 0) continue;

            for (let j = 0; j < cache[keys[i]].length; j++) {
                times += 1;

                source[index] = cache[keys[i]][j];
                source[index].color = ACCENT_TWO_COLOR;
                callback({ times, datalist: source });

                await delay(SORT_DELAY_DURATION);
                
                source[index].color = CLEAR_COLOR;
                callback({ times, datalist: source });

                index += 1;
            }

            rhs = lhs + cache[keys[i]].length - 1;

            times = await this.ascent(source, lhs, rhs, radix, digit + 1, length, cloneDeep(this.cache), times, callback);

            lhs = rhs + 1;
            this.caches.push(cache);
        }

        return times;
    }

    private async descent(source: SortDataModel[], lhs: number, rhs: number, radix: SortRadix, digit: number, length: number, cache: { [key: string | number]: SortDataModel[] }, 
        times: number, callback: (param: SortStateModel) => void): Promise<number> {
        let index: number, key: string | number, keys: string[];

        if (digit === length) return times;
        
        for (let i = lhs; i <= rhs; i++) {
            key = matchKeyByRadix(source[i].radix as SortDataRadixModel, radix, digit);

            times += 1;

            source[i].color = ACCENT_ONE_COLOR;
            callback({ times, datalist: source});

            await delay(SORT_DELAY_DURATION);
            
            source[i].color = CLEAR_COLOR;
            callback({ times, datalist: source});

            cache[key].push(source[i]);
        }
        
        keys = Object.keys(cache);
        index = lhs;

        for (let i = keys.length - 1; i >= 0; i--) {
            if (cache[keys[i]].length === 0) continue;

            for (let j = 0; j < cache[keys[i]].length; j++) {
                times += 1;

                source[index] = cache[keys[i]][j];
                source[index].color = ACCENT_TWO_COLOR;
                callback({ times, datalist: source });

                await delay(SORT_DELAY_DURATION);
                
                source[index].color = CLEAR_COLOR;
                callback({ times, datalist: source });

                index += 1;
            }

            rhs = lhs + cache[keys[i]].length - 1;

            times = await this.descent(source, lhs, rhs, radix, digit + 1, length, cloneDeep(this.cache), times, callback);

            lhs = rhs + 1;
            this.caches.push(cache);
        }

        return times;
    }

    private async clear(): Promise<void> {
        let keys: string[];

        for (let i = 0; i < this.caches.length; i++) {
            keys = Object.keys(this.caches[i]);

            for (let j = 0; j < keys.length; j++) {
                this.caches[i][keys[j]].splice(0);
            }
        }
    }

}
