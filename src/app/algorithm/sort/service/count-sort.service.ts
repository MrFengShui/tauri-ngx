import { Injectable } from "@angular/core";
import { Observable } from "rxjs";

import { SortDataModel, SortStateModel, SortOrder } from "../ngrx-store/sort.state";
import { ACCENT_ONE_COLOR, ACCENT_TWO_COLOR, CLEAR_COLOR, SORT_DELAY_DURATION, complete, delay } from "../sort.utils";

/**
 * 计数排序
 */
@Injectable()
export class CountSortService {

    private cache: {[key: string | number]: number} = {};

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
        let index: number, keys: string[];

        times = await this.save(source, times, callback);

        keys = Object.keys(this.cache);
        index = 0;

        for (let i = 0, length = keys.length; i < length; i++) {
            for (let j = 0; j < this.cache[keys[i]]; j++) {
                times += 1;

                source[index].value = Number.parseInt(keys[i]);
                source[index].color = ACCENT_TWO_COLOR;
                callback({ times, datalist: source});

                await delay(SORT_DELAY_DURATION);
                
                source[index].color = CLEAR_COLOR;
                callback({ times, datalist: source});

                index += 1;
            }
        }
        
        await delay(SORT_DELAY_DURATION);
        await complete(source, times, callback);
        await this.clear();
    }

    private async sortByDescent(source: SortDataModel[], times: number, callback: (parram: SortStateModel) => void): Promise<void> {
        let index: number, keys: string[];

        times = await this.save(source, times, callback);

        keys = Object.keys(this.cache);
        index = 0;

        for (let i = keys.length - 1; i >= 0; i--) {
            for (let j = 0; j < this.cache[keys[i]]; j++) {
                times += 1;

                source[index].value = Number.parseInt(keys[i]);
                source[index].color = ACCENT_TWO_COLOR;
                callback({ times, datalist: source});

                await delay(SORT_DELAY_DURATION);
                
                source[index].color = CLEAR_COLOR;
                callback({ times, datalist: source});

                index += 1;
            }
        }
        
        await delay(SORT_DELAY_DURATION);
        await complete(source, times, callback);
        await this.clear();
    }

    private async save(source: SortDataModel[], times: number, callback: (parram: SortStateModel) => void): Promise<number> {
        for (let i = 0, length = source.length; i < length; i++) {
            if (this.cache[source[i].value]) {
                this.cache[source[i].value] += 1;  
            } else {
                this.cache[source[i].value] = 1;  
            } 

            times += 1;

            source[i].color = ACCENT_ONE_COLOR;
            callback({ times, datalist: source});
            
            await delay(SORT_DELAY_DURATION);
            
            source[i].color = CLEAR_COLOR;
            callback({ times, datalist: source});
        }

        return times;
    }

    private async clear(): Promise<void> {
        for (const key of Object.keys(this.cache)) {
            delete this.cache[key];
        }
    }

}
