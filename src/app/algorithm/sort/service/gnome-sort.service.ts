import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { SortDataModel, SortOrder, SortStateModel } from "../ngrx-store/sort.state";
import { CLEAR_COLOR, PRIMARY_COLOR, SECONDARY_COLOR, swap, delay, SORT_DELAY_DURATION, complete } from "../sort.utils";


/**
 * 侏儒排序
 */
@Injectable()
export class GnomeSortService {

    public sort(array: SortDataModel[], order: SortOrder): Observable<SortStateModel> {
        return new Observable(subscriber => {
            const temp: SortDataModel = { value: 0, color: CLEAR_COLOR };

            if (order === 'ascent') {
                this.sortByAscent(array, temp, 0, param => subscriber.next(param)).then(() => subscriber.complete());
            }

            if (order === 'descent') {
                this.sortByDescent(array, temp, 0, param => subscriber.next(param)).then(() => subscriber.complete());
            }
        });
    }

    private async sortByAscent(source: SortDataModel[], temp: SortDataModel, times: number, callback: (param: SortStateModel) => void): Promise<void> {
        let pivot: number = 1, index: number;

        while (pivot < source.length) {
            index = pivot;
            source[pivot].color = PRIMARY_COLOR;

            if (source[pivot - 1].value > source[pivot].value) {
                times += 1;
                source[pivot - 1].color = SECONDARY_COLOR;
                await swap(source, pivot - 1, pivot, temp);
                pivot = pivot === 1 ? pivot : pivot - 1;
            } else {
                pivot += 1;
            }

            callback({ times, datalist: source });

            await delay(SORT_DELAY_DURATION);

            source[index].color = CLEAR_COLOR;
            source[index - 1].color = CLEAR_COLOR;
            callback({ times, datalist: source });
        }

        await delay(SORT_DELAY_DURATION);
        await complete(source, times, callback);
    }

    private async sortByDescent(source: SortDataModel[], temp: SortDataModel, times: number, callback: (parram: SortStateModel) => void): Promise<void> {
        let pivot: number = 1, index: number;

        while (pivot < source.length) {
            index = pivot;
            source[pivot].color = PRIMARY_COLOR;

            if (source[pivot - 1].value < source[pivot].value) {
                times += 1;
                source[pivot - 1].color = SECONDARY_COLOR;
                await swap(source, pivot - 1, pivot, temp);
                pivot = pivot === 1 ? pivot : pivot - 1;
            } else {
                pivot += 1;
            }

            callback({ times, datalist: source });

            await delay(SORT_DELAY_DURATION);

            source[index].color = CLEAR_COLOR;
            source[index - 1].color = CLEAR_COLOR;
            callback({ times, datalist: source });
        }

        await delay(SORT_DELAY_DURATION);
        await complete(source, times, callback);
    }

}

