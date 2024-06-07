import { Injectable } from "@angular/core";
import { Observable } from "rxjs";

import { SortDataModel, SortStateModel, SortOrder } from "../ngrx-store/sort.state";
import { SORT_DELAY_DURATION, complete, delay } from "../sort.utils";

/**
 * 计数排序
 */
@Injectable()
export class CountSortService {

    private cache: {[key: number]: number} = {};

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
            if (this.cache[item.value]) {
                this.cache[item.value] += 1;  
            } else {
                this.cache[item.value] = 1;  
            } 

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

            for (let j = 0; j < this.cache[index]; j++) {
                source[i].value = index;
                times += 1;

                source[i].color = 'lawngreen';
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
            if (this.cache[item.value]) {
                this.cache[item.value] += 1;  
            } else {
                this.cache[item.value] = 1;  
            } 

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

            for (let j = 0; j < this.cache[index]; j++) {
                source[i].value = index;
                times += 1;

                source[i].color = 'lawngreen';
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
            delete this.cache[index];
        }
    }

}
