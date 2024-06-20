import { Injectable } from "@angular/core";
import { Observable } from "rxjs";

import { SortDataModel, SortStateModel, SortOrder } from "../ngrx-store/sort.state";
import { ACCENT_COLOR, CLEAR_COLOR, SORT_DELAY_DURATION, complete, delay } from "../sort.utils";
import { SortToolsService } from "./sort.service";

/**
 * 桶排序
 */
@Injectable()
export class BucketSortService {

    private cache: {[key: string | number]: number[]} = {};

    constructor(private _service: SortToolsService) {}

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
        let index: number;

        for (let item of source) {
            index = Math.floor((item.value - 1) / 25);

            if (!this.cache[index]) {
                this.cache[index] = Array.from([]);
            }

            this.cache[index].push(item.value);
            times += 1;
            
            item.color = ACCENT_COLOR;
            callback({ completed: false, times, datalist: source});

            await delay(SORT_DELAY_DURATION);
            
            item.color = CLEAR_COLOR;
            callback({ completed: false, times, datalist: source});
        }

        index = 0;
        await delay(SORT_DELAY_DURATION);
        
        for (let key of Object.keys(this.cache)) {
            times = this._service.stableSortByAscent(this.cache[key], times);
            
            for (let item of this.cache[key]) {
                times += 1;
                source[index].color = ACCENT_COLOR;
                source[index].value = item;
                callback({ completed: false, times, datalist: source});

                await delay(SORT_DELAY_DURATION);
                
                source[index].color = CLEAR_COLOR;
                callback({ completed: false, times, datalist: source});

                index += 1;
            }
        }

        await delay(SORT_DELAY_DURATION);
        await complete(source, times, callback);
        await this.clear();
    }

    private async sortByDescent(source: SortDataModel[], times: number, callback: (parram: SortStateModel) => void): Promise<void> {
        let index: number;
        
        for (let item of source) {
            index = Math.floor((item.value - 1) / 25);

            if (!this.cache[index]) {
                this.cache[index] = Array.from([]);
            }

            this.cache[index].push(item.value);
            times += 1;
            
            item.color = 'lawngreen';
            callback({ completed: false, times, datalist: source});

            await delay(SORT_DELAY_DURATION);
            
            item.color = 'whitesmoke';
            callback({ completed: false, times, datalist: source});
        }

        index = 0;
        await delay(SORT_DELAY_DURATION);
        
        for (let key of Object.keys(this.cache).reverse()) {
            times = this._service.stableSortByDescent(this.cache[key], times);
            
            for (let item of this.cache[key]) {
                times += 1;
                source[index].color = ACCENT_COLOR;
                source[index].value = item;
                callback({ completed: false, times, datalist: source});

                await delay(SORT_DELAY_DURATION);
                
                source[index].color = CLEAR_COLOR;
                callback({ completed: false, times, datalist: source});

                index += 1;
            }
        }
        
        await delay(SORT_DELAY_DURATION);
        await complete(source, times, callback);
        await this.clear();
    }

    private async clear(): Promise<void> {
        for (let key of Object.keys(this.cache)) {
            this.cache[key].splice(0);
            delete this.cache[key];
        }
    }

}
