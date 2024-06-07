import { Injectable } from "@angular/core";
import { Observable } from "rxjs";

import { SortDataModel, SortStateModel, SortOrder } from "../ngrx-store/sort.state";
import { SORT_DELAY_DURATION, complete, delay, stableSortByAscent, stableSortByDescent } from "../sort.utils";

/**
 * 桶排序
 */
@Injectable()
export class BucketSortService {

    private cache: {[key: number]: SortDataModel[]} = {};

    public sort(array: SortDataModel[], order: SortOrder): Observable<SortStateModel> {
        return new Observable(subscriber => {
            if (order === 'ascent') {
                this.sortByAscent(array, 0, param => subscriber.next(param)).then(() => subscriber.complete());
            }
    
            if (order === 'descent') {
                this.sortByDescent(array, 0, param => subscriber.next(param)).then(() => subscriber.complete());
            }
        });
    }

    private async sortByAscent(source: SortDataModel[], times: number, callback: (param: SortStateModel) => void): Promise<void> {
        let i: number = 0, index: number;

        for (let item of source) {
            index = Math.floor((item.value - 1) / 25);

            if (!this.cache[index]) {
                this.cache[index] = Array.from([]);
            }

            this.cache[index].push(item);
            times += 1;
            
            item.color = 'lawngreen';
            callback({ completed: false, times, datalist: source});

            await delay(SORT_DELAY_DURATION);
            
            item.color = 'whitesmoke';
            callback({ completed: false, times, datalist: source});
        }

        await delay(SORT_DELAY_DURATION);
        
        for (let key of Object.keys(this.cache)) {
            index = Number.parseInt(key);
            times = await stableSortByAscent(this.cache[index], times);
            
            for (let item of this.cache[index]) {
                times += 1;
                source[i] = { ...source[i], value: item.value, color: 'lawngreen', radix: item.radix };
                callback({ completed: false, times, datalist: source});

                await delay(SORT_DELAY_DURATION);
                
                source[i].color = 'whitesmoke';
                callback({ completed: false, times, datalist: source});

                i += 1;
            }
        }

        await delay(SORT_DELAY_DURATION);
        await complete(source, times, callback);
        await this.clear();
    }

    private async sortByDescent(source: SortDataModel[], times: number, callback: (parram: SortStateModel) => void): Promise<void> {
        let i: number = 0, index: number;
        
        for (let item of source) {
            index = Math.floor((item.value - 1) / 25);

            if (!this.cache[index]) {
                this.cache[index] = Array.from([]);
            }

            this.cache[index].push(item);
            times += 1;
            
            item.color = 'lawngreen';
            callback({ completed: false, times, datalist: source});

            await delay(SORT_DELAY_DURATION);
            
            item.color = 'whitesmoke';
            callback({ completed: false, times, datalist: source});
        }

        await delay(SORT_DELAY_DURATION);
        
        for (let key of Object.keys(this.cache).reverse()) {
            index = Number.parseInt(key);
            times = await stableSortByDescent(this.cache[index], times);
            
            for (let item of this.cache[index]) {
                times += 1;
                source[i] = { ...source[i], value: item.value, color: 'lawngreen', radix: item.radix };
                callback({ completed: false, times, datalist: source});

                await delay(SORT_DELAY_DURATION);
                
                source[i].color = 'whitesmoke';
                callback({ completed: false, times, datalist: source});

                i += 1;
            }
        }
        
        await delay(SORT_DELAY_DURATION);
        await complete(source, times, callback);
        await this.clear();
    }

    private async clear(index: number = 0): Promise<void> {
        for (let key of Object.keys(this.cache)) {
            index = Number.parseInt(key);
            this.cache[index].splice(0);
            delete this.cache[index];
        }
    }

}
