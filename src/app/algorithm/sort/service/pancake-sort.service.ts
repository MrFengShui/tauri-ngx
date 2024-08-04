import { Injectable } from "@angular/core";
import { Observable } from "rxjs";

import { SortDataModel, SortStateModel, SortOrder } from "../ngrx-store/sort.state";
import { SORT_DELAY_DURATION, complete, delay, swap } from "../sort.utils";
import { CLEAR_COLOR, ACCENT_COLOR, PRIMARY_ONE_COLOR, SECONDARY_ONE_COLOR, PRIMARY_TWO_COLOR, SECONDARY_TWO_COLOR } from "../../../public/values.utils";

@Injectable()
export class PancakeSortService {

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
        let index: number;

        for (let i = source.length - 1; i > 0; i--) {
            index = await this.indexOfMaxData(source, 0, i - 1);

            for (let j = index, k = 0; j > k; j--, k++) {
                times+= 1;

                source[index].color = ACCENT_COLOR;
                source[j].color = PRIMARY_ONE_COLOR;
                source[k].color = SECONDARY_ONE_COLOR;
                callback({ times, datalist: source});

                await swap(source, j, k);
                await delay(SORT_DELAY_DURATION);

                source[index].color = ACCENT_COLOR;
                source[j].color = CLEAR_COLOR;
                source[k].color = CLEAR_COLOR;
                callback({ times, datalist: source});
            }

            if (source[i].value < source[0].value) {
                times += 1;

                source[index].color = ACCENT_COLOR;
                source[i].color = PRIMARY_TWO_COLOR;
                source[0].color = SECONDARY_TWO_COLOR;
                callback({ times, datalist: source});

                await swap(source, i, 0);
                await delay(SORT_DELAY_DURATION);

                source[index].color = ACCENT_COLOR;
                source[i].color = CLEAR_COLOR;
                source[0].color = CLEAR_COLOR;
                callback({ times, datalist: source});

                await delay(SORT_DELAY_DURATION);
            }

            for (let j = i - 1, k = 1; j > k; j--, k++) {
                times += 1;

                source[index].color = ACCENT_COLOR;
                source[j].color = PRIMARY_TWO_COLOR;
                source[k].color = SECONDARY_TWO_COLOR;
                callback({ times, datalist: source});

                await swap(source, j, k);
                await delay(SORT_DELAY_DURATION);

                source[index].color = ACCENT_COLOR;
                source[j].color = CLEAR_COLOR;
                source[k].color = CLEAR_COLOR;
                callback({ times, datalist: source});
            }

            source[index].color = CLEAR_COLOR;
        }

        await delay(SORT_DELAY_DURATION);
        await complete(source, times, callback);
    }

    private async sortByDescent(source: SortDataModel[], temp: SortDataModel, times: number, callback: (parram: SortStateModel) => void): Promise<void> {
        let index: number;

        for (let i = source.length - 1; i > 0; i--) {
            index = await this.indexOfMinData(source, 0, i - 1);

            for (let j = index, k = 0; j > k; j--, k++) {
                times += 1;

                source[index].color = ACCENT_COLOR;
                source[j].color = PRIMARY_ONE_COLOR;
                source[k].color = SECONDARY_ONE_COLOR;
                callback({ times, datalist: source});

                await swap(source, j, k);
                await delay(SORT_DELAY_DURATION);

                source[index].color = ACCENT_COLOR;
                source[j].color = CLEAR_COLOR;
                source[k].color = CLEAR_COLOR;
                callback({ times, datalist: source});
            }

            if (source[i].value > source[0].value) {
                times += 1;

                source[index].color = ACCENT_COLOR;
                source[i].color = PRIMARY_TWO_COLOR;
                source[0].color = SECONDARY_TWO_COLOR;
                callback({ times, datalist: source});

                await swap(source, i, 0);
                await delay(SORT_DELAY_DURATION);

                source[index].color = ACCENT_COLOR;
                source[i].color = CLEAR_COLOR;
                source[0].color = CLEAR_COLOR;
                callback({ times, datalist: source});

                await delay(SORT_DELAY_DURATION);
            }

            for (let j = i - 1, k = 1; j > k; j--, k++) {
                times += 1;
                
                source[index].color = ACCENT_COLOR;
                source[j].color = PRIMARY_TWO_COLOR;
                source[k].color = SECONDARY_TWO_COLOR;
                callback({ times, datalist: source});

                await swap(source, j, k);
                await delay(SORT_DELAY_DURATION);

                source[index].color = ACCENT_COLOR;
                source[j].color = CLEAR_COLOR;
                source[k].color = CLEAR_COLOR;
                callback({ times, datalist: source});
            }
            
            source[index].color = CLEAR_COLOR;
        }

        await delay(SORT_DELAY_DURATION);
        await complete(source, times, callback);
    }

    private async indexOfMinData(source: SortDataModel[], lhs: number, rhs: number): Promise<number> {
        let index: number = -1, value: number = Number.MAX_SAFE_INTEGER;

        for (let i = lhs; i <= rhs; i++) {
            if (source[i].value < value) {
                index = i;
                value = source[i].value;
            }
        }

        return index;
    }

    private async indexOfMaxData(source: SortDataModel[], lhs: number, rhs: number): Promise<number> {
        let index: number = -1, value: number = Number.MIN_SAFE_INTEGER;

        for (let i = lhs; i <= rhs; i++) {
            if (source[i].value > value) {
                index = i;
                value = source[i].value;
            }
        }

        return index;
    }

}
