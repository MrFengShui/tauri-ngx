import { Injectable } from "@angular/core";
import { Observable } from "rxjs";

import { SortDataModel, SortStateModel, SortOrder } from "../ngrx-store/sort.state";
import { ACCENT_ONE_COLOR, ACCENT_TWO_COLOR, CLEAR_COLOR, PRIMARY_COLOR, SECONDARY_COLOR, SORT_DELAY_DURATION, complete, delay, swap } from "../sort.utils";
import { SortToolsService } from "./sort.service";

const clear = (cache: {[key: string | number]: number[]}): Promise<void> => 
    new Promise(resolve => {
        for (let key of Object.keys(cache)) {
            cache[key].splice(0);
            delete cache[key];
        }

        resolve();
    });

/**
 * 桶排序
 */
@Injectable()
export class BucketSortService {

    private readonly THRESHOLD: number = 16;
    private cache: {[key: string | number]: number[]} = {};

    constructor(private _service: SortToolsService) {}

    public sort(array: SortDataModel[], order: SortOrder): Observable<SortStateModel> {
        let temp: SortDataModel = { color: '', value: -1 };

        return new Observable(subscriber => {
            if (order === 'ascent') {
                this.sortByAscent(array, temp, 0, param => subscriber.next(param)).then(() => subscriber.complete());
            }
    
            if (order === 'descent') {
                this.sortByDescent(array, temp, 0, param => subscriber.next(param)).then(() => subscriber.complete());
            }
        });
    }

    private async sortByAscent(source: SortDataModel[], temp: SortDataModel, times: number, callback: (param: SortStateModel) => void): Promise<void> {
        let index: number = 0, lhs: number, rhs: number;

        times = await this.classify(source, 0, times, callback);

        await delay(SORT_DELAY_DURATION);
        
        for (let key of Object.keys(this.cache)) {
            lhs = index;

            for (let item of this.cache[key]) {
                times += 1;
                source[index].color = ACCENT_TWO_COLOR;
                source[index].value = item;
                callback({ times, datalist: source});

                await delay(SORT_DELAY_DURATION);
                
                source[index].color = CLEAR_COLOR;
                callback({ times, datalist: source});

                index += 1;
            }

            rhs = index - 1;

            times = await this.stableSortByAscent(source, lhs, rhs, temp, times, callback);
        }

        await delay(SORT_DELAY_DURATION);
        await complete(source, times, callback);
        await clear(this.cache);
    }

    private async sortByDescent(source: SortDataModel[], temp: SortDataModel, times: number, callback: (param: SortStateModel) => void): Promise<void> {
        let index: number = 0, lhs: number, rhs: number;
        
        times = await this.classify(source, 0, times, callback);

        await delay(SORT_DELAY_DURATION);
        
        for (let key of Object.keys(this.cache).reverse()) {
            lhs = index;

            for (let item of this.cache[key]) {
                times += 1;
                source[index].color = ACCENT_TWO_COLOR;
                source[index].value = item;
                callback({ times, datalist: source});

                await delay(SORT_DELAY_DURATION);
                
                source[index].color = CLEAR_COLOR;
                callback({ times, datalist: source});

                index += 1;
            }

            rhs = index - 1;

            times = await this.stableSortByDescent(source, lhs, rhs, temp, times, callback);
        }
        
        await delay(SORT_DELAY_DURATION);
        await complete(source, times, callback);
        await clear(this.cache);
    }

    private async classify(source: SortDataModel[], index: number, times: number, callback: (param: SortStateModel) => void): Promise<number> {
        for (let item of source) {
            index = Math.floor((item.value - 1) / this.THRESHOLD);

            if (!this.cache[index]) {
                this.cache[index] = Array.from([]);
            }

            this.cache[index].push(item.value);
            times += 1;
            
            item.color = ACCENT_ONE_COLOR;
            callback({ times, datalist: source});

            await delay(SORT_DELAY_DURATION);
            
            item.color = CLEAR_COLOR;
            callback({ times, datalist: source});
        }

        return times;
    }

    private async stableSortByAscent(source: SortDataModel[], lhs: number, rhs: number, temp: SortDataModel, times: number, callback: (param: SortStateModel) => void): Promise<number> {
        for (let i = lhs + 1; i <= rhs; i++) {
            for (let j = i; j > lhs; j--) {
                source[j].color = PRIMARY_COLOR;
    
                if (source[j - 1].value > source[j].value) {
                    times += 1;
    
                    source[j - 1].color = SECONDARY_COLOR;
                    await swap(source, j - 1, j, temp);
                }
    
                callback({ times, datalist: source });
    
                await delay(SORT_DELAY_DURATION);
    
                source[j].color = CLEAR_COLOR;
                source[j - 1].color = CLEAR_COLOR;
                callback({ times, datalist: source });
            }
        }
    
        return times;
    }
    
    private async stableSortByDescent(source: SortDataModel[], lhs: number, rhs: number, temp: SortDataModel, times: number, callback: (param: SortStateModel) => void): Promise<number> {
        for (let i = lhs + 1; i <= rhs; i++) {
            for (let j = i; j > lhs; j--) {
                source[j].color = PRIMARY_COLOR;
    
                if (source[j - 1].value < source[j].value) {
                    times += 1;
    
                    source[j - 1].color = SECONDARY_COLOR;
                    await swap(source, j - 1, j, temp);
                }
    
                callback({ times, datalist: source });
    
                await delay(SORT_DELAY_DURATION);
    
                source[j].color = CLEAR_COLOR;
                source[j - 1].color = CLEAR_COLOR;
                callback({ times, datalist: source });
            }
        }
    
        return times;
    }
    
}

/**
 * 插值排序
 */
@Injectable()
export class InterpolationSortService {

    private readonly THRESHOLD: number = 16;
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
        let values: [number, number] = this._service.findMinMaxValue(source);
        
        times = await this.save(source, 0, values[0], values[1], times, callback);
        times = await this.load(source, 0, times, callback);
        
        await delay(SORT_DELAY_DURATION);
        await complete(source, times, callback);
        await clear(this.cache);
    }

    private async sortByDescent(source: SortDataModel[], times: number, callback: (param: SortStateModel) => void): Promise<void> {
        let values: [number, number] = this._service.findMinMaxValue(source);

        times = await this.save(source, 0, values[1], values[0], times, callback);
        times = await this.load(source, 0, times, callback);
        
        await delay(SORT_DELAY_DURATION);
        await complete(source, times, callback);
        await clear(this.cache);
    }

    private async save(source: SortDataModel[], index: number, min: number, max: number, times: number, callback: (param: SortStateModel) => void): Promise<number> {
        for (let item of source) {
            index = Math.floor((source.length - 1) * (item.value - min) / (max - min));

            if (!this.cache[index]) {
                this.cache[index] = Array.from([]);
            }

            this.cache[index].push(item.value);
            times += 1;
            
            item.color = ACCENT_ONE_COLOR;
            callback({ times, datalist: source});

            await delay(SORT_DELAY_DURATION);
            
            item.color = CLEAR_COLOR;
            callback({ times, datalist: source});
        }

        return times;
    }

    private async load(source: SortDataModel[], index: number, times: number, callback: (param: SortStateModel) => void): Promise<number> {
        for (let key of Object.keys(this.cache)) {
            for (let item of this.cache[key]) {
                times += 1;
                source[index].color = ACCENT_TWO_COLOR;
                source[index].value = item;
                callback({ times, datalist: source});

                await delay(SORT_DELAY_DURATION);
                
                source[index].color = CLEAR_COLOR;
                callback({ times, datalist: source});

                index += 1;
            }
        }

        return times;
    }

}

/**
 * 鸽巢排序
 */
@Injectable()
export class PigeonholeSortService {

    private readonly THRESHOLD: number = 16;
    private cache: {[key: string | number]: number[]} = {};

    constructor(private _service: SortToolsService) {}

    public sort(array: SortDataModel[], order: SortOrder): Observable<SortStateModel> {
        return new Observable(subscriber => {
            let temp: SortDataModel = { color: '', value: -1 };

            if (order === 'ascent') {
                this.sortByAscent(array, temp, 0, param => subscriber.next(param)).then(() => subscriber.complete());
            }
    
            if (order === 'descent') {
                this.sortByDescent(array, temp, 0, param => subscriber.next(param)).then(() => subscriber.complete());
            }
        });
    }

    private async sortByAscent(source: SortDataModel[], temp: SortDataModel, times: number, callback: (param: SortStateModel) => void): Promise<void> {
        let values: [number, number] = this._service.findMinMaxValue(source), n: number = values[1] - values[0] + 1;
        
        times = await this.save(source, values[0], times, callback);
        times = await this.load(source, 0, times, callback);

        await delay(SORT_DELAY_DURATION);
        await complete(source, times, callback);
        await clear(this.cache);
    }

    private async sortByDescent(source: SortDataModel[], temp: SortDataModel, times: number, callback: (param: SortStateModel) => void): Promise<void> {
        let values: [number, number] = this._service.findMinMaxValue(source);

        times = await this.save(source, values[1], times, callback);
        times = await this.load(source, 0, times, callback);
        
        await delay(SORT_DELAY_DURATION);
        await complete(source, times, callback);
        await clear(this.cache);
    }

    private async save(source: SortDataModel[], threshold: number, times: number, callback: (param: SortStateModel) => void): Promise<number> {
        let index: number;

        for (let i = 0; i < source.length; i++) {
            index = Math.abs(source[i].value - threshold);

            if (!this.cache[index]) {
                this.cache[index] = Array.from([]);
            }

            this.cache[index].push(source[i].value);
            times += 1;
            
            source[i].color = ACCENT_ONE_COLOR;
            callback({ times, datalist: source});

            await delay(SORT_DELAY_DURATION);
            
            source[i].color = CLEAR_COLOR;
            callback({ times, datalist: source});
        }

        return times;
    }

    private async load(source: SortDataModel[], index: number, times: number, callback: (param: SortStateModel) => void): Promise<number> {
        for (let key of Object.keys(this.cache)) {
            for (let item of this.cache[key]) {
                times += 1;
                source[index].color = ACCENT_TWO_COLOR;
                source[index].value = item;
                callback({ times, datalist: source});

                await delay(SORT_DELAY_DURATION);
                
                source[index].color = CLEAR_COLOR;
                callback({ times, datalist: source});

                index += 1;
            }
        }

        return times;
    }

}
