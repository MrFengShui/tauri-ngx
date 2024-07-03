import { Injectable } from "@angular/core";
import { Observable } from "rxjs";

import { SortDataModel, SortStateModel, SortOrder } from "../ngrx-store/sort.state";
import { CLEAR_COLOR, PRIMARY_COLOR, SECONDARY_COLOR, SORT_DELAY_DURATION, complete, delay } from "../sort.utils";

@Injectable()
export class SleepSortService {

    private cache: SortDataModel[] = Array.from([]);

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
        let model: SortDataModel, index: number;

        for (const item of source) {
            times += 1;

            item.color = PRIMARY_COLOR;
            callback({ times, datalist: source});

            await delay(SORT_DELAY_DURATION);
            
            item.color = CLEAR_COLOR;
            callback({ times, datalist: source});

            this.cache.push(item);
        }

        while (this.cache.length > 0) {
            model = this.cache.pop() as SortDataModel;
            index = model.value - 1;
            times += 1;

            source[index] = model;
            source[index].color = SECONDARY_COLOR;
            callback({ times, datalist: source});

            await delay(model.value * SORT_DELAY_DURATION);

            source[index].color = CLEAR_COLOR;
            await delay(SORT_DELAY_DURATION);
        }

        await delay(SORT_DELAY_DURATION);
        await complete(source, times, callback);
        this.cache.splice(0);
    }

    private async sortByDescent(source: SortDataModel[], times: number, callback: (parram: SortStateModel) => void): Promise<void> {
        let model: SortDataModel, index: number;

        for (const item of source) {
            times += 1;

            item.color = PRIMARY_COLOR;
            callback({ times, datalist: source});

            await delay(SORT_DELAY_DURATION);
            
            item.color = CLEAR_COLOR;
            this.cache.push(item);
        }

        while (this.cache.length > 0) {
            model = this.cache.pop() as SortDataModel;
            index = source.length - model.value;
            times += 1;

            source[index] = model;
            source[index].color = SECONDARY_COLOR;
            callback({ times, datalist: source});

            await delay(model.value * SORT_DELAY_DURATION);

            source[index].color = CLEAR_COLOR;
            callback({ times, datalist: source});
        }

        await delay(SORT_DELAY_DURATION);
        await complete(source, times, callback);
        this.cache.splice(0);
    }

}
