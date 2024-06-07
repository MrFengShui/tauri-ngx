import { Injectable } from "@angular/core";
import { Observable } from "rxjs";

import { SortDataModel, SortStateModel, SortOrder } from "../ngrx-store/sort.state";
import { SORT_DELAY_DURATION, complete, delay, swap } from "../sort.utils";

@Injectable()
export class StoogeSortService {

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
        await this.sortByOrder(source, 0, source.length - 1, temp, 'ascent', callback);
        await delay(SORT_DELAY_DURATION);
        await complete(source, 0, callback);
    }

    private async sortByDescent(source: SortDataModel[], temp: SortDataModel, callback: (parram: SortStateModel) => void): Promise<void> {
        await this.sortByOrder(source, 0, source.length - 1, temp, 'descent', callback);
        await delay(SORT_DELAY_DURATION);
        await complete(source, 0, callback);
    }

    private async sortByOrder(source: SortDataModel[], lhs: number, rhs: number, temp: SortDataModel, order: SortOrder, callback: (parram: SortStateModel) => void): Promise<void> {
        if (order === 'ascent' && source[lhs].value > source[rhs].value) {
            source[lhs].color = 'lawngreen';
            source[rhs].color = 'orangered';
            callback({ completed: false, datalist: source });

            await swap(source, lhs, rhs, temp);
            await delay(SORT_DELAY_DURATION);

            source[lhs].color = 'whitesmoke';
            source[rhs].color = 'whitesmoke';
            callback({ completed: false, datalist: source });
        }

        if (order === 'descent' && source[lhs].value < source[rhs].value) {
            source[lhs].color = 'lawngreen';
            source[rhs].color = 'orangered';
            callback({ completed: false, datalist: source });

            await swap(source, lhs, rhs, temp);
            await delay(SORT_DELAY_DURATION);

            source[lhs].color = 'whitesmoke';
            source[rhs].color = 'whitesmoke';
            callback({ completed: false, datalist: source });
        }

        if (rhs - lhs + 1 >= 3) {
            let mid: number = Math.floor((rhs - lhs + 1)  / 3);
            await this.sortByOrder(source, lhs, rhs - mid, temp, order, callback);
            await this.sortByOrder(source, lhs + mid, rhs, temp, order, callback);
            await this.sortByOrder(source, lhs, rhs - mid, temp, order, callback);
        }
    }

}
