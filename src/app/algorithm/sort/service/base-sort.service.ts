import { Observable } from "rxjs";

import { SortDataModel, SortOrder, SortStateModel } from "../ngrx-store/sort.state";

export abstract class BaseSortService {

    protected readonly THRESHOLD: number = 24;

    protected array: number[] = Array.from([]);
    protected keys: string[] = Array.from([]);
    protected stack: number[] = Array.from([]);
    protected cacheOfKeyValue: { [key: string | number]: number } = {};
    protected cacheOfKeyValues: { [key: string | number]: number[] } = {};

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

    protected async save(source: SortDataModel[], order: SortOrder, times: number, callback: (parram: SortStateModel) => void): Promise<number> {
        return times;
    }

    protected async load(source: SortDataModel[], order: SortOrder, times: number, callback: (parram: SortStateModel) => void): Promise<number> {
        return times;
    }

    protected async clear(cache: { [key: string | number]: any }): Promise<void> {
        let key: string, keys: string[] = Object.keys(cache);

        for (let i = 0, length = keys.length; i < length; i++) {
            key = keys[i];

            if (Array.isArray(cache[key])) {
                cache[key].splice(0);
            }
            
            delete cache[key];
        }
    }

}