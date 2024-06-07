import { Injectable } from "@angular/core";
import { Observable } from "rxjs";

import { SortDataModel, SortStateModel, SortOrder } from "../ngrx-store/sort.state";
import { SORT_DELAY_DURATION, complete, delay } from "../sort.utils";

@Injectable()
export class SleepSortService {

    private cache: SortDataModel[] = Array.from([]);

    public sort(array: SortDataModel[], order: SortOrder): Observable<SortStateModel> {
        return new Observable(subscriber => {
            let temp: SortDataModel = { value: 0, color: 'whitesmoke' };

            if (order === 'ascent') {
                this.sortByAscent(array, temp, param => subscriber.next(param)).then(() => subscriber.complete());
            }
    
            if (order === 'descent') {
                this.sortByDescent(array, temp, param => subscriber.next(param)).then(() => subscriber.complete());
            }
        });
    }

    private async sortByAscent(source: SortDataModel[], temp: SortDataModel, callback: (param: SortStateModel) => void): Promise<void> {
        let model: SortDataModel, index: number;

        for (let item of source) {
            item.color = 'lawngreen';
            await delay(SORT_DELAY_DURATION);
            callback({ completed: false, datalist: source});
            item.color = 'whitesmoke';
            this.cache.push(item);
        }

        while (this.cache.length > 0) {
            model = this.cache.pop() as SortDataModel;
            index = model.value - 1;
            await delay(model.value * SORT_DELAY_DURATION);
            source[index] = model;
            source[index].color = 'orangered';
            callback({ completed: false, datalist: source});
            await delay(SORT_DELAY_DURATION);
            source[index].color = 'whitesmoke';
        }

        await delay(SORT_DELAY_DURATION);
        await complete(source, 0, callback);
        this.cache.splice(0);
    }

    private async sortByDescent(source: SortDataModel[], temp: SortDataModel, callback: (parram: SortStateModel) => void): Promise<void> {
        let model: SortDataModel, index: number;

        for (let item of source) {
            item.color = 'lawngreen';
            await delay(SORT_DELAY_DURATION);
            callback({ completed: false, datalist: source});
            item.color = 'whitesmoke';
            this.cache.push(item);
        }

        while (this.cache.length > 0) {
            model = this.cache.pop() as SortDataModel;
            index = source.length - model.value;
            await delay(model.value * SORT_DELAY_DURATION);
            source[index] = model;
            source[index].color = 'orangered';
            callback({ completed: false, datalist: source});
            await delay(SORT_DELAY_DURATION);
            source[index].color = 'whitesmoke';
        }

        await delay(SORT_DELAY_DURATION);
        await complete(source, 0, callback);
        this.cache.splice(0);
    }

}
