import { Injectable } from "@angular/core";
import { Observable } from "rxjs";

import { SortDataModel, SortStateModel, SortOrder } from "../ngrx-store/sort.state";
import { SORT_DELAY_DURATION, complete, delay, swap } from "../sort.utils";

@Injectable()
export class GnomeSortService {

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
        let pivot: number = 1, index: number;

        while (pivot < source.length) {
            index = pivot;
            source[pivot].color = 'lawngreen';
            
            if (source[pivot - 1].value > source[pivot].value) {
                source[pivot - 1].color = 'orangered';
                await swap(source, pivot - 1, pivot, temp);
                pivot = pivot === 1 ? pivot : pivot - 1;
            } else {
                pivot += 1;
            }

            callback({ completed: false, datalist: source });
            await delay(SORT_DELAY_DURATION);
            source[index].color = 'whitesmoke';
            source[index - 1].color = 'whitesmoke';
        }

        await delay(SORT_DELAY_DURATION);
        await complete(source, 0, callback);
    }

    private async sortByDescent(source: SortDataModel[], temp: SortDataModel, callback: (parram: SortStateModel) => void): Promise<void> {
        let pivot: number = 1, index: number;

        while (pivot < source.length) {
            index = pivot;
            source[pivot].color = 'lawngreen';
            
            if (source[pivot - 1].value < source[pivot].value) {
                source[pivot - 1].color = 'orangered';
                await swap(source, pivot - 1, pivot, temp);
                pivot = pivot === 1 ? pivot : pivot - 1;
            } else {
                pivot += 1;
            }

            callback({ completed: false, datalist: source });
            await delay(SORT_DELAY_DURATION);
            source[index].color = 'whitesmoke';
            source[index - 1].color = 'whitesmoke';
        }

        await delay(SORT_DELAY_DURATION);
        await complete(source, 0, callback);
    }

}
