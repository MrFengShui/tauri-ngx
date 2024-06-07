import { Injectable } from "@angular/core";
import { Observable } from "rxjs";

import { SortDataModel, SortStateModel, SortOrder } from "../ngrx-store/sort.state";
import { SORT_DELAY_DURATION, complete, delay, swap } from "../sort.utils";

@Injectable()
export class SlowSortService {

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
        await this.sortByOrdert(source, 0, source.length - 1, temp, 'ascent', callback);
        await delay(SORT_DELAY_DURATION);
        await complete(source, 0, callback);
    }

    private async sortByDescent(source: SortDataModel[], temp: SortDataModel, callback: (parram: SortStateModel) => void): Promise<void> {
        await this.sortByOrdert(source, 0, source.length - 1, temp, 'descent', callback);
        await delay(SORT_DELAY_DURATION);
        await complete(source, 0, callback);
    }

    private async sortByOrdert(source: SortDataModel[], lhs: number, rhs: number, temp: SortDataModel, order: SortOrder, callback: (parram: SortStateModel) => void): Promise<void> {
        if (rhs > lhs) {
            let mid: number = Math.floor((rhs - lhs) * 0.5 + lhs);
            await this.sortByOrdert(source, lhs, mid, temp, order, callback);
            await this.sortByOrdert(source, mid + 1, rhs, temp, order, callback);

            source[lhs].color = 'lawngreen';
            source[rhs].color = 'orangered';

            if (order === 'ascent' && source[mid].value > source[rhs].value) {
                source[mid].color = 'dodgerblue';
                await swap(source, mid, rhs, temp);
            }

            if (order === 'descent' && source[mid].value < source[rhs].value) {
                source[mid].color = 'dodgerblue';
                await swap(source, mid, rhs, temp);
            }

            callback({ completed: false, datalist: source });
            await delay(SORT_DELAY_DURATION);
            source[lhs].color = 'whitesmoke';
            source[mid].color = 'whitesmoke';
            source[rhs].color = 'whitesmoke';
            callback({ completed: false, datalist: source });

            await this.sortByOrdert(source, lhs, rhs - 1, temp, order, callback);
        }
    }

}
