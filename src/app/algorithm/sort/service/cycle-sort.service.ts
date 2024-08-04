import { Injectable } from "@angular/core";
import { Observable } from "rxjs";

import { SortDataModel, SortStateModel, SortOrder } from "../ngrx-store/sort.state";
import { SORT_DELAY_DURATION, complete, delay, swap } from "../sort.utils";
import { CLEAR_COLOR, PRIMARY_ONE_COLOR, SECONDARY_ONE_COLOR, PRIMARY_COLOR, SECONDARY_COLOR, PRIMARY_TWO_COLOR, SECONDARY_TWO_COLOR } from "../../../public/values.utils";

/**
 * 循环排序
 */
@Injectable()
export class CycleSortService {

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
        let pivot: number, point: number;

        for (let i = 0, length = source.length; i < length - 1; i++) {
            pivot = i;
            point = i;
            
            for (let j = i + 1; j < length; j++) {
                source[i].color = PRIMARY_ONE_COLOR;
                source[j].color = SECONDARY_ONE_COLOR;
                callback({ times, datalist: source });

                await delay(SORT_DELAY_DURATION);

                source[i].color = PRIMARY_ONE_COLOR;
                source[j].color = CLEAR_COLOR;
                callback({ times, datalist: source });

                if (source[j].value < source[i].value) {
                    point += 1;
                }
            }
            
            if (point === i) {
                source[i].color = CLEAR_COLOR;
                continue;
            }
            
            while (source[point].value === source[i].value) {
                pivot += 1;
            }

            times += 1;

            source[point].color = PRIMARY_COLOR;
            source[pivot].color = SECONDARY_COLOR;
            callback({ times, datalist: source });

            await swap(source, point, pivot);
            await delay(SORT_DELAY_DURATION);

            source[point].color = CLEAR_COLOR;
            source[pivot].color = CLEAR_COLOR;
            callback({ times, datalist: source });

            times = await this.searchByAscent(source, i, temp, times, callback);
        }  

        await delay(SORT_DELAY_DURATION);
        await complete(source, times, callback);
    }

    private async sortByDescent(source: SortDataModel[], temp: SortDataModel, times: number, callback: (param: SortStateModel) => void): Promise<void> {
        let pivot: number, point: number;

        for (let i = 0, length = source.length; i < length - 1; i++) {
            pivot = i;
            point = i;
            
            for (let j = i + 1; j < length; j++) {
                source[i].color = PRIMARY_ONE_COLOR;
                source[j].color = SECONDARY_ONE_COLOR;
                callback({ times, datalist: source });

                await delay(SORT_DELAY_DURATION);

                source[i].color = PRIMARY_ONE_COLOR;
                source[j].color = CLEAR_COLOR;
                callback({ times, datalist: source });

                if (source[j].value > source[i].value) {
                    point += 1;
                }
            }
            
            if (point === i) {
                source[i].color = CLEAR_COLOR;
                continue;
            }
            
            while (source[point].value === source[i].value) {
                pivot += 1;
            }

            times += 1;
            
            source[point].color = PRIMARY_COLOR;
            source[pivot].color = SECONDARY_COLOR;
            callback({ times, datalist: source });

            await swap(source, point, pivot);
            await delay(SORT_DELAY_DURATION);

            source[point].color = CLEAR_COLOR;
            source[pivot].color = CLEAR_COLOR;
            callback({ times, datalist: source });

            times = await this.searchByDescent(source, i, temp, times, callback);
        }  

        await delay(SORT_DELAY_DURATION);
        await complete(source, times, callback);
    }

    private async searchByAscent(source: SortDataModel[], threshold: number, temp: SortDataModel, times: number, callback: (param: SortStateModel) => void): Promise<number> {
        let pivot: number, point: number = -1;

        while (point !== threshold) {
            pivot = threshold;
            point = threshold;
            
            for (let i = threshold + 1, length = source.length; i < length; i++) {
                source[threshold].color = PRIMARY_TWO_COLOR;
                source[i].color = SECONDARY_TWO_COLOR;
                callback({ times, datalist: source });

                await delay(SORT_DELAY_DURATION);

                source[threshold].color = PRIMARY_TWO_COLOR;
                source[i].color = CLEAR_COLOR;
                callback({ times, datalist: source });

                if (source[i].value < source[threshold].value) {
                    point += 1;
                }
            }

            if (point === threshold) {
                source[threshold].color = CLEAR_COLOR;
                break;
            }
            
            while (source[point].value === source[threshold].value) {
                pivot += 1;
            }

            times += 1;

            source[point].color = PRIMARY_COLOR;
            source[pivot].color = SECONDARY_COLOR;
            callback({ times, datalist: source });

            await swap(source, point, pivot);
            await delay(SORT_DELAY_DURATION);

            source[point].color = CLEAR_COLOR;
            source[pivot].color = CLEAR_COLOR;
            callback({ times, datalist: source });
        }

        return times;
    }

    private async searchByDescent(source: SortDataModel[], threshold: number, temp: SortDataModel, times: number, callback: (param: SortStateModel) => void): Promise<number> {
        let pivot: number, point: number = -1;

        while (point !== threshold) {
            pivot = threshold;
            point = threshold;
            
            
            for (let i = threshold + 1, length = source.length; i < length; i++) {
                source[threshold].color = PRIMARY_TWO_COLOR;
                source[i].color = SECONDARY_TWO_COLOR;
                callback({ times, datalist: source });

                await delay(SORT_DELAY_DURATION);

                source[threshold].color = PRIMARY_TWO_COLOR;
                source[i].color = CLEAR_COLOR;
                callback({ times, datalist: source });

                if (source[i].value > source[threshold].value) {
                    point += 1;
                }
            }

            if (point === threshold) {
                source[threshold].color = CLEAR_COLOR;
                break;
            }
            
            while (source[point].value === source[threshold].value) {
                pivot += 1;
            }

            times += 1;

            source[point].color = PRIMARY_COLOR;
            source[pivot].color = SECONDARY_COLOR;
            callback({ times, datalist: source });

            await swap(source, point, pivot);
            await delay(SORT_DELAY_DURATION);

            source[point].color = CLEAR_COLOR;
            source[pivot].color = CLEAR_COLOR;
            callback({ times, datalist: source });
        }

        return times;
    }

}
