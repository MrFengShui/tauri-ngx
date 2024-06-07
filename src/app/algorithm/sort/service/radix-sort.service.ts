import { Injectable } from "@angular/core";
import { Observable } from "rxjs";

import { SortDataModel, SortStateModel, SortOrder, SortDataRadixModel, SortRadix } from "../ngrx-store/sort.state";
import { SORT_DELAY_DURATION, complete, delay } from "../sort.utils";

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

@Injectable()
export class RadixLSDSortService {

    private cache: {[key: string | number]: SortDataModel[]} = { 
        '0': [], '1': [], '2': [], '3': [], '4': [], '5': [], '6': [], '7': [], '8': [], '9': [], 
        'a': [], 'b': [], 'c': [], 'd': [], 'e': [], 'f': [] 
    };

    public sort(array: SortDataModel[], order: SortOrder, radix: SortRadix): Observable<SortStateModel> {
        return new Observable(subscriber => {
            if (order === 'ascent') {
                this.sortByAscent(array, radix, param => subscriber.next(param)).then(() => subscriber.complete());
            }
    
            if (order === 'descent') {
                this.sortByDescent(array, radix, param => subscriber.next(param)).then(() => subscriber.complete());
            }
        });
    }

    private async sortByAscent(source: SortDataModel[], radix: SortRadix, callback: (param: SortStateModel) => void): Promise<void> {
        let index: number, length: number = matchLengthByRadix(source[0].radix as SortDataRadixModel, radix);
        let key: string = '';
        
        for (let i = length - 1; i >= 0; i--) {
            for (let item of source) {
                key = matchKeyByRadix(item.radix as SortDataRadixModel, radix, i);
                item.color = 'lawngreen';
                await delay(SORT_DELAY_DURATION);
                callback({ completed: false, datalist: source});
                item.color = 'whitesmoke';
                this.cache[key].push(item);
            }
            
            index = 0;

            for (let key of Object.keys(this.cache)) {
                if (this.cache[key].length === 0) continue;

                for (let i = 0; i < this.cache[key].length; i++) {
                    source[index] = this.cache[key][i];
                    source[index].color = 'orangered';
                    await delay(SORT_DELAY_DURATION);
                    callback({ completed: false, datalist: source });
                    source[index].color = 'whitesmoke';
                    index += 1;
                }
            }

            this.clear();
        }

        await delay(SORT_DELAY_DURATION);
        await complete(source, 0, callback);
    }

    private async sortByDescent(source: SortDataModel[], radix: SortRadix, callback: (parram: SortStateModel) => void): Promise<void> {
        let index: number, length: number = matchLengthByRadix(source[0].radix as SortDataRadixModel, radix);
        let key: string = '';
        
        for (let i = length - 1; i >= 0; i--) {
            for (let item of source) {
                key = matchKeyByRadix(item.radix as SortDataRadixModel, radix, i);
                item.color = 'lawngreen';
                await delay(SORT_DELAY_DURATION);
                callback({ completed: false, datalist: source});
                item.color = 'whitesmoke';
                this.cache[key].push(item);
            }
            
            index = 0;

            for (let key of Object.keys(this.cache).reverse()) {
                if (this.cache[key].length === 0) continue;

                for (let i = 0; i < this.cache[key].length; i++) {
                    source[index] = this.cache[key][i];
                    source[index].color = 'orangered';
                    await delay(SORT_DELAY_DURATION);
                    callback({ completed: false, datalist: source });
                    source[index].color = 'whitesmoke';
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
                this.sortByAscent(array, radix, cache, param => subscriber.next(param)).then(() => subscriber.complete());
            }
    
            if (order === 'descent') {
                this.sortByDescent(array, radix, cache, param => subscriber.next(param)).then(() => subscriber.complete());
            }
        });
    }

    private async sortByAscent(source: SortDataModel[], radix: SortRadix, cache: { [key: string | number]: SortDataModel[] }, callback: (param: SortStateModel) => void): Promise<void> {
        let length: number = matchLengthByRadix(source[0].radix as SortDataRadixModel, radix);

        await this.ascent(source, 0, source.length - 1, radix, 0, length, cache, callback);
        await delay(SORT_DELAY_DURATION);
        await complete(source, 0, callback);
        await this.clear();
    }

    private async sortByDescent(source: SortDataModel[], radix: SortRadix, cache: { [key: string | number]: SortDataModel[] }, callback: (param: SortStateModel) => void): Promise<void> {
        let length: number = matchLengthByRadix(source[0].radix as SortDataRadixModel, radix);

        await this.descent(source, 0, source.length - 1, radix, 0, length, cache, callback);
        await delay(SORT_DELAY_DURATION);
        await complete(source, 0, callback);
        await this.clear()
    }

    private async ascent(source: SortDataModel[], lhs: number, rhs: number, radix: SortRadix, digit: number, length: number, 
        cache: { [key: string | number]: SortDataModel[] }, callback: (param: SortStateModel) => void): Promise<void> {
        if (digit === length) return;

        for (let i = lhs; i <= rhs; i++) {
            let key: string = matchKeyByRadix(source[i].radix as SortDataRadixModel, radix, digit);
            source[i].color = 'lawngreen';
            await delay(SORT_DELAY_DURATION);
            callback({ completed: false, datalist: source});
            source[i].color = 'whitesmoke';
            cache[key].push(source[i]);
        }
        
        let index: number = lhs;

        for (let key of Object.keys(cache)) {
            if (cache[key].length === 0) continue;

            for (let i = 0; i < cache[key].length; i++) {
                source[index] = cache[key][i];
                source[index].color = 'orangered';
                await delay(SORT_DELAY_DURATION);
                callback({ completed: false, datalist: source });
                source[index].color = 'whitesmoke';
                index += 1;
            }

            rhs = lhs + cache[key].length - 1;
            await this.ascent(source, lhs, rhs, radix, digit + 1, length, JSON.parse(JSON.stringify(this.cache)), callback);
            lhs = rhs + 1;
            this.caches.push(cache);
        }
    }

    private async descent(source: SortDataModel[], lhs: number, rhs: number, radix: SortRadix, digit: number, length: number, 
        cache: { [key: string | number]: SortDataModel[] }, callback: (param: SortStateModel) => void): Promise<void> {
        if (digit === length) return;
        
        for (let i = lhs; i <= rhs; i++) {
            let key: string = matchKeyByRadix(source[i].radix as SortDataRadixModel, radix, digit);
            source[i].color = 'lawngreen';
            await delay(SORT_DELAY_DURATION);
            callback({ completed: false, datalist: source});
            source[i].color = 'whitesmoke';
            cache[key].push(source[i]);
        }
        
        let index: number = lhs;

        for (let key of Object.keys(cache).reverse()) {
            if (cache[key].length === 0) continue;

            for (let i = 0; i < cache[key].length; i++) {
                source[index] = cache[key][i];
                source[index].color = 'orangered';
                await delay(SORT_DELAY_DURATION);
                callback({ completed: false, datalist: source });
                source[index].color = 'whitesmoke';
                index += 1;
            }

            rhs = lhs + cache[key].length - 1;
            await this.descent(source, lhs, rhs, radix, digit + 1, length, JSON.parse(JSON.stringify(this.cache)), callback);
            lhs = rhs + 1;
            this.caches.push(cache);
        }
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
