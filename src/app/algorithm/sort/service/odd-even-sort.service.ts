import { Injectable } from "@angular/core";
import { Observable } from "rxjs";

import { SortDataModel, SortStateModel, SortOrder } from "../ngrx-store/sort.state";
import { CLEAR_COLOR, PRIMARY_ONE_COLOR, SECONDARY_ONE_COLOR, SORT_DELAY_DURATION, complete, delay, swap } from "../sort.utils";

@Injectable()
export class OddEvenSortService {

    public sort(array: SortDataModel[], order: SortOrder): Observable<SortStateModel> {
        return new Observable(subscriber => {
            let temp: SortDataModel = { value: 0, color: 'whitesmoke' };

            if (order === 'ascent') {
                this.sortByAscent(array, temp, 0, param => subscriber.next(param)).then(() => subscriber.complete());
            }
    
            if (order === 'descent') {
                this.sortByDescent(array, temp, 0, param => subscriber.next(param)).then(() => subscriber.complete());
            }
        });
    }

    private async sortByAscent(source: SortDataModel[], temp: SortDataModel, times: number, callback: (param: SortStateModel) => void): Promise<void> {
        let flag: boolean = false;

        for (let i = 0; !flag; i = (i + 1) % 2) {
            flag = true;

            for (let j = i; j < source.length - 1; j += 2) {
                source[j].color = PRIMARY_ONE_COLOR;
                callback({ completed: false, times, datalist: source});
               
                if (source[j + 1].value < source[j].value) {
                    source[j + 1].color = SECONDARY_ONE_COLOR;
                    callback({ completed: false, times, datalist: source});

                    await swap(source, j, j + 1, temp);
                    times += 1;
                    flag = false;
                }

                await delay(SORT_DELAY_DURATION);
            
                source[j].color = CLEAR_COLOR;
                source[j + 1].color = CLEAR_COLOR;
                callback({ completed: false, times, datalist: source});
            }
        }

        await delay(SORT_DELAY_DURATION);
        await complete(source, times, callback);
    }

    private async sortByDescent(source: SortDataModel[], temp: SortDataModel, times: number, callback: (parram: SortStateModel) => void): Promise<void> {
        let flag: boolean = false;

        for (let i = 0; !flag; i = (i + 1) % 2) {
            flag = true;

            for (let j = i; j < source.length - 1; j += 2) {
                source[j].color = PRIMARY_ONE_COLOR;
                callback({ completed: false, times, datalist: source});

                if (source[j + 1].value > source[j].value) {
                    source[j + 1].color = SECONDARY_ONE_COLOR;
                    callback({ completed: false, times, datalist: source});

                    await swap(source, j, j + 1, temp);
                    times += 1;
                    flag = false;
                }

                await delay(SORT_DELAY_DURATION);
            
                source[j].color = CLEAR_COLOR;
                source[j + 1].color = CLEAR_COLOR;
                callback({ completed: false, times, datalist: source});
            }
        }

        await delay(SORT_DELAY_DURATION);
        await complete(source, times, callback);
    }

}
