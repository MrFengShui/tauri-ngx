import { Injectable } from "@angular/core";
import { Observable } from "rxjs";

import { SortDataModel, SortStateModel, SortOrder } from "../ngrx-store/sort.state";
import { SORT_DELAY_DURATION, complete, delay } from "../sort.utils";
import { SortToolsService } from "../ngrx-store/sort.service";
import { ACCENT_TWO_COLOR, CLEAR_COLOR, ACCENT_ONE_COLOR } from "../../../public/values.utils";

/**
 * 桶排序
 */
@Injectable()
export class BucketSortService {

    private readonly THRESHOLD: number = 16;
    private cache: {[key: string | number]: number[]} = {};

    constructor(private _service: SortToolsService) {}

    public sort(array: SortDataModel[], order: SortOrder): Observable<SortStateModel> {
        const temp: SortDataModel = { color: '', value: -1 };

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
        let index: number = 0, lhs: number, rhs: number, keys: string[];

        times = await this.classify(source, 0, times, callback);
        keys = Object.keys(this.cache);

        await delay(SORT_DELAY_DURATION);
        
        for (let i = 0; i < keys.length; i++) {
            lhs = index;

            for (let j = 0, length = this.cache[keys[i]].length; j < length; j++) {
                times += 1;

                source[index].color = ACCENT_TWO_COLOR;
                source[index].value = this.cache[keys[i]][j];
                callback({ times, datalist: source});

                await delay(SORT_DELAY_DURATION);
                
                source[index].color = ACCENT_TWO_COLOR;
                source[index].color = CLEAR_COLOR;
                callback({ times, datalist: source});

                index += 1;
            }

            rhs = index - 1;

            times = await this._service.stableSortByAscent(source, lhs, rhs, temp, times, callback);
        }

        await delay(SORT_DELAY_DURATION);
        await complete(source, times, callback);
        await this._service.clear(this.cache);
    }

    private async sortByDescent(source: SortDataModel[], temp: SortDataModel, times: number, callback: (param: SortStateModel) => void): Promise<void> {
        let index: number = 0, lhs: number, rhs: number, keys: string[];
        
        times = await this.classify(source, 0, times, callback);
        keys = Object.keys(this.cache);

        await delay(SORT_DELAY_DURATION);
        
        for (let i = keys.length - 1; i >= 0; i--) {
            lhs = index;

            for (let j = 0, length = this.cache[keys[i]].length; j < length; j++) {
                times += 1;

                source[index].color = ACCENT_TWO_COLOR;
                source[index].value = this.cache[keys[i]][j];
                callback({ times, datalist: source});

                await delay(SORT_DELAY_DURATION);
                
                source[index].color = ACCENT_TWO_COLOR;
                source[index].color = CLEAR_COLOR;
                callback({ times, datalist: source});

                index += 1;
            }

            rhs = index - 1;

            times = await this._service.stableSortByDescent(source, lhs, rhs, temp, times, callback);
        }
        
        await delay(SORT_DELAY_DURATION);
        await complete(source, times, callback);
        await this._service.clear(this.cache);
    }

    private async classify(source: SortDataModel[], index: number, times: number, callback: (param: SortStateModel) => void): Promise<number> {
        for (const item of source) {
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

}

/**
 * 插值排序
 */
@Injectable()
export class InterpolationSortService {

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
        const values: [number, number] = this._service.findMinMaxValue(source);
        
        times = await this.save(source, 0, values[0], values[1], times, callback);
        times = await this.load(source, 0, times, callback);
        
        await delay(SORT_DELAY_DURATION);
        await complete(source, times, callback);
        await this._service.clear(this.cache);
    }

    private async sortByDescent(source: SortDataModel[], times: number, callback: (param: SortStateModel) => void): Promise<void> {
        const values: [number, number] = this._service.findMinMaxValue(source);

        times = await this.save(source, 0, values[1], values[0], times, callback);
        times = await this.load(source, 0, times, callback);
        
        await delay(SORT_DELAY_DURATION);
        await complete(source, times, callback);
        await this._service.clear(this.cache);
    }

    private async save(source: SortDataModel[], index: number, min: number, max: number, times: number, callback: (param: SortStateModel) => void): Promise<number> {
        for (let i = 0, length = source.length; i < length; i++) {
            index = Math.floor((length - 1) * (source[i].value - min) / (max - min));

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
        const keys: string[] = Object.keys(this.cache);

        for (let i = 0; i < keys.length; i++) {
            for (let j = 0, length =  this.cache[keys[i]].length; j < length; j++) {
                times += 1;
                source[index].color = ACCENT_TWO_COLOR;
                source[index].value = this.cache[keys[i]][j];
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
        const values: [number, number] = this._service.findMinMaxValue(source);
        
        times = await this.save(source, values[0], times, callback);
        times = await this.load(source, 0, times, callback);

        await delay(SORT_DELAY_DURATION);
        await complete(source, times, callback);
        await this._service.clear(this.cache);
    }

    private async sortByDescent(source: SortDataModel[], times: number, callback: (param: SortStateModel) => void): Promise<void> {
        const values: [number, number] = this._service.findMinMaxValue(source);

        times = await this.save(source, values[1], times, callback);
        times = await this.load(source, 0, times, callback);
        
        await delay(SORT_DELAY_DURATION);
        await complete(source, times, callback);
        await this._service.clear(this.cache);
    }

    private async save(source: SortDataModel[], threshold: number, times: number, callback: (param: SortStateModel) => void): Promise<number> {
        let index: number;

        for (let i = 0, length = source.length; i < length; i++) {
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
        const keys: string[] = Object.keys(this.cache);

        for (let i = 0; i < keys.length; i++) {
            for (let j = 0, length = this.cache[keys[i]].length; j < length; j++) {
                times += 1;
                source[index].color = ACCENT_TWO_COLOR;
                source[index].value = this.cache[keys[i]][j];
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
