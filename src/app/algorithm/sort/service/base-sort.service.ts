import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { random } from "lodash";

import { SortDataModel, SortOrder, SortStateModel } from "../ngrx-store/sort.state";
import { CLEAR_COLOR, FINAL_COLOR } from "../../../public/global.utils";
import { delay } from "../../../public/global.utils";

@Injectable()
export abstract class AbstractSortService<T = any> {

    protected readonly THRESHOLD: number = 24;
    protected readonly COIN_FLAG = (): boolean => {
        const coin: number = random(0, 1000, false);
        return coin > 450 && coin < 550;
    };

    protected array: T[] = Array.from([]);
    protected stack: T[] = Array.from([]);

    public sort(array: SortDataModel[], order: SortOrder, option?: string | number): Observable<SortStateModel> {
        return new Observable(subscriber => {
            if (order === 'ascent') {
                this.sortByAscent(array, 0, array.length - 1, option, param => subscriber.next(param))
                    .then(() => subscriber.complete())
                    .catch(error => subscriber.error(error));
            }
    
            if (order === 'descent') {
                this.sortByDescent(array, 0, array.length - 1, option, param => subscriber.next(param))
                    .then(() => subscriber.complete())
                    .catch(error => subscriber.error(error));
            }
        });
    }

    protected abstract sortByAscent(source: SortDataModel[], lhs: number, rhs: number, option: string | number | undefined, callback: (param: SortStateModel) => void): Promise<void>;

    protected abstract sortByDescent(source: SortDataModel[], lhs: number, rhs: number, option: string | number | undefined, callback: (param: SortStateModel) => void): Promise<void>;

    protected async render(source: SortDataModel[], i: number, j: number, primaryColor: string, secondaryColor: string, times: number, callback: (param: SortStateModel) => void): Promise<number> {
        source[i].color = primaryColor;
        source[j].color = secondaryColor;
        callback({ times, datalist: source });

        await delay();

        source[i].color = CLEAR_COLOR;
        source[j].color = CLEAR_COLOR;
        callback({ times, datalist: source });

        return times;
    }
    
    protected async complete(source: SortDataModel[], times: number, callback: (param: SortStateModel) => void): Promise<void> {
        for (let i = 0, length = source.length; i < length; i++) {
            source[i].color = FINAL_COLOR;
            callback({ times, datalist: source });
            
            await delay();
        }

        if (source.length > 0) {
            source.splice(0);
        }
    };

}

@Injectable()
export abstract class AbstractRecursiveSortService<T = number> extends AbstractSortService<T> {
    
    protected abstract sortByOrder(source: SortDataModel[], lhs: number, rhs: number, order: SortOrder, times: number, callback: (param: SortStateModel) => void): Promise<number>;

}

export type PartitionMetaInfo = { times: number, mid?: number, fst?: number, snd?: number };

@Injectable()
export abstract class AbstractQuickSortService<T = number> extends AbstractRecursiveSortService<T> {

    protected abstract partitionByAscent(source: SortDataModel[], lhs: number, rhs: number, times: number, callback: (param: SortStateModel) => void): Promise<PartitionMetaInfo>;

    protected abstract partitionByDescent(source: SortDataModel[], lhs: number, rhs: number, times: number, callback: (param: SortStateModel) => void): Promise<PartitionMetaInfo>;

}

@Injectable()
export abstract class AbstractDistributionSortService<T = any> extends AbstractSortService<T> {

    protected keys: string[] = Array.from([]);
    protected cacheOfKeyValue: { [key: string | number]: T } = {};
    protected cacheOfKeyValues: { [key: string | number]: T[] } = {};

    protected abstract save(source: SortDataModel[], order: SortOrder, times: number, callback: (param: SortStateModel) => void): Promise<number>;

    protected abstract load(source: SortDataModel[], order: SortOrder, times: number, callback: (param: SortStateModel) => void): Promise<number>;

    protected async clear(cache: { [key: string | number]: any } | null): Promise<void> {
        if (cache) {
            let key: string, keys: string[] = Object.keys(cache);

            for (let i = 0, length = keys.length; i < length; i++) {
                key = keys[i];
    
                if (Array.isArray(cache[key])) {
                    cache[key].splice(0);
                }
                
                delete cache[key];
            }
        }
        
        cache = null;
    }

}