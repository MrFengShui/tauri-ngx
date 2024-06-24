import { Injectable } from "@angular/core";
import { Observable } from "rxjs";

import { SortDataModel, SortStateModel, SortOrder, SortDataRadixModel, SortRadix } from "../ngrx-store/sort.state";
import { ACCENT_ONE_COLOR, ACCENT_TWO_COLOR, CLEAR_COLOR, SORT_DELAY_DURATION, complete, delay } from "../sort.utils";

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
        let index: number, length: number = matchLengthByRadix(source[0].radix as SortDataRadixModel, radix);
        let key: string = '';
        
        for (let i = length - 1; i >= 0; i--) {
            for (let item of source) {
                times += 1;

                key = matchKeyByRadix(item.radix as SortDataRadixModel, radix, i);

                item.color = ACCENT_ONE_COLOR;
                callback({ times, datalist: source});

                await delay(SORT_DELAY_DURATION);
                
                item.color = CLEAR_COLOR;
                callback({ times, datalist: source});

                this.cache[key].push(item);
            }
            
            index = 0;

            for (let key of Object.keys(this.cache)) {
                if (this.cache[key].length === 0) continue;

                for (let i = 0; i < this.cache[key].length; i++) {
                    source[index] = this.cache[key][i];
                    source[index].color = ACCENT_TWO_COLOR;
                    await delay(SORT_DELAY_DURATION);
                    callback({ times, datalist: source });
                    source[index].color = CLEAR_COLOR;
                    index += 1;
                }
            }

            this.clear();
        }

        await delay(SORT_DELAY_DURATION);
        await complete(source, times, callback);
    }

    private async sortByDescent(source: SortDataModel[], radix: SortRadix, times: number, callback: (parram: SortStateModel) => void): Promise<void> {
        let index: number, length: number = matchLengthByRadix(source[0].radix as SortDataRadixModel, radix);
        let key: string = '';
        
        for (let i = length - 1; i >= 0; i--) {
            for (let item of source) {
                key = matchKeyByRadix(item.radix as SortDataRadixModel, radix, i);
                item.color = ACCENT_ONE_COLOR;
                await delay(SORT_DELAY_DURATION);
                callback({ times, datalist: source});
                item.color = CLEAR_COLOR;
                this.cache[key].push(item);
            }
            
            index = 0;

            for (let key of Object.keys(this.cache).reverse()) {
                if (this.cache[key].length === 0) continue;

                for (let i = 0; i < this.cache[key].length; i++) {
                    source[index] = this.cache[key][i];
                    source[index].color = ACCENT_TWO_COLOR;
                    await delay(SORT_DELAY_DURATION);
                    callback({ times, datalist: source });
                    source[index].color = CLEAR_COLOR;
                    index += 1;
                }
            }

            this.clear();
        }
        
        await delay(SORT_DELAY_DURATION);
        await complete(source, 0, callback);
    }

    private async clear(): Promise<void> {
        for (let key of Object.keys(this.cache)) {
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
            let cache: { [key: string | number]: SortDataModel[] } = JSON.parse(JSON.stringify(this.cache));

            if (order === 'ascent') {
                this.sortByAscent(array, radix, cache, 0, param => subscriber.next(param)).then(() => subscriber.complete());
            }
    
            if (order === 'descent') {
                this.sortByDescent(array, radix, cache, 0, param => subscriber.next(param)).then(() => subscriber.complete());
            }
        });
    }

    private async sortByAscent(source: SortDataModel[], radix: SortRadix, cache: { [key: string | number]: SortDataModel[] }, times: number, callback: (param: SortStateModel) => void): Promise<void> {
        let length: number = matchLengthByRadix(source[0].radix as SortDataRadixModel, radix);

        times = await this.ascent(source, 0, source.length - 1, radix, 0, length, cache, times, callback);
        await delay(SORT_DELAY_DURATION);
        await complete(source, times, callback);
        await this.clear();
    }

    private async sortByDescent(source: SortDataModel[], radix: SortRadix, cache: { [key: string | number]: SortDataModel[] }, times: number, callback: (param: SortStateModel) => void): Promise<void> {
        let length: number = matchLengthByRadix(source[0].radix as SortDataRadixModel, radix);

        times = await this.descent(source, 0, source.length - 1, radix, 0, length, cache, times, callback);
        await delay(SORT_DELAY_DURATION);
        await complete(source, times, callback);
        await this.clear()
    }

    private async ascent(source: SortDataModel[], lhs: number, rhs: number, radix: SortRadix, digit: number, length: number, cache: { [key: string | number]: SortDataModel[] }, 
        times: number, callback: (param: SortStateModel) => void): Promise<number> {
        let key: string | number;

        if (digit === length) return times;

        for (let i = lhs; i <= rhs; i++) {
            times += 1;

            key = matchKeyByRadix(source[i].radix as SortDataRadixModel, radix, digit);
            
            source[i].color = ACCENT_ONE_COLOR;
            callback({ times, datalist: source});

            await delay(SORT_DELAY_DURATION);
            
            source[i].color = CLEAR_COLOR;
            callback({ times, datalist: source});

            cache[key].push(source[i]);
        }
        
        let index: number = lhs;

        for (let key of Object.keys(cache)) {
            if (cache[key].length === 0) continue;

            for (let i = 0; i < cache[key].length; i++) {
                times += 1;

                source[index] = cache[key][i];
                source[index].color = ACCENT_TWO_COLOR;
                callback({ times, datalist: source });

                await delay(SORT_DELAY_DURATION);
                
                source[index].color = CLEAR_COLOR;
                callback({ times, datalist: source });

                index += 1;
            }

            rhs = lhs + cache[key].length - 1;

            times = await this.ascent(source, lhs, rhs, radix, digit + 1, length, JSON.parse(JSON.stringify(this.cache)), times, callback);

            lhs = rhs + 1;
            this.caches.push(cache);
        }

        return times;
    }

    private async descent(source: SortDataModel[], lhs: number, rhs: number, radix: SortRadix, digit: number, length: number, cache: { [key: string | number]: SortDataModel[] }, 
        times: number, callback: (param: SortStateModel) => void): Promise<number> {
        let key: string | number;

        if (digit === length) return times;
        
        for (let i = lhs; i <= rhs; i++) {
            times += 1;

            key = matchKeyByRadix(source[i].radix as SortDataRadixModel, radix, digit);

            source[i].color = ACCENT_ONE_COLOR;
            callback({ times, datalist: source});

            await delay(SORT_DELAY_DURATION);
            
            source[i].color = CLEAR_COLOR;
            callback({ times, datalist: source});

            cache[key].push(source[i]);
        }
        
        let index: number = lhs;

        for (let key of Object.keys(cache).reverse()) {
            if (cache[key].length === 0) continue;

            for (let i = 0; i < cache[key].length; i++) {
                times += 1;

                source[index] = cache[key][i];
                source[index].color = ACCENT_TWO_COLOR;
                callback({ times, datalist: source });

                await delay(SORT_DELAY_DURATION);
                
                source[index].color = CLEAR_COLOR;
                callback({ times, datalist: source });

                index += 1;
            }

            rhs = lhs + cache[key].length - 1;

            times = await this.descent(source, lhs, rhs, radix, digit + 1, length, JSON.parse(JSON.stringify(this.cache)), times, callback);

            lhs = rhs + 1;
            this.caches.push(cache);
        }

        return times;
    }

    private async clear(): Promise<void> {
        while (this.caches.length > 0) {
            let cache: { [key: string | number]: SortDataModel[] } | undefined = this.caches.pop();

            if (cache) {
                for (let key of Object.keys(cache)) {
                    cache[key].splice(0);
                }
            }
        }
    }

}
