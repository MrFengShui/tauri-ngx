import { Injectable } from "@angular/core";
import { Observable } from "rxjs";

import { SortDataModel, SortStateModel, SortOrder } from "../ngrx-store/sort.state";
import { CLEAR_COLOR, PRIMARY_COLOR, SECONDARY_COLOR, SORT_DELAY_DURATION, complete, delay, swap } from "../sort.utils";

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

        for (let i = 0; i < source.length - 1; i++) {
            pivot = i;
            point = i;
            source[i].color = PRIMARY_COLOR;

            for (let j = i + 1; j < source.length; j++) {
                source[j].color = SECONDARY_COLOR;
                callback({ times, datalist: source });

                if (source[j].value < source[i].value) {
                    point += 1;
                }

                await delay(SORT_DELAY_DURATION);

                source[j].color = CLEAR_COLOR;
                callback({ times, datalist: source });
            }
            
            if (point === i) {
                source[i].color = CLEAR_COLOR;
                continue;
            }
            
            while (source[point].value === source[i].value) {
                pivot += 1;
                await delay(SORT_DELAY_DURATION);
            }

            source[point].color = PRIMARY_COLOR;
            source[pivot].color = SECONDARY_COLOR;
            callback({ times, datalist: source });

            times += 1;
            await swap(source, point, pivot, temp);
            await delay(SORT_DELAY_DURATION);

            source[point].color = CLEAR_COLOR;
            source[pivot].color = CLEAR_COLOR;
            source[i].color = CLEAR_COLOR;
            callback({ times, datalist: source });

            times = await this.searchByAscent(source, i, temp, times, callback);
        }  

        await delay(SORT_DELAY_DURATION);
        await complete(source, times, callback);
    }

    private async sortByDescent(source: SortDataModel[], temp: SortDataModel, times: number, callback: (param: SortStateModel) => void): Promise<void> {
        let pivot: number, point: number;

        for (let i = 0; i < source.length - 1; i++) {
            pivot = i;
            point = i;
            source[i].color = PRIMARY_COLOR;

            for (let j = i + 1; j < source.length; j++) {
                source[j].color = SECONDARY_COLOR;
                callback({ times, datalist: source });

                if (source[j].value > source[i].value) {
                    point += 1;
                }

                await delay(SORT_DELAY_DURATION);

                source[j].color = CLEAR_COLOR;
                callback({ times, datalist: source });
            }
            
            if (point === i) {
                source[i].color = CLEAR_COLOR;
                continue;
            }
            
            while (source[point].value === source[i].value) {
                pivot += 1;
                await delay(SORT_DELAY_DURATION);
            }

            source[point].color = PRIMARY_COLOR;
            source[pivot].color = SECONDARY_COLOR;
            callback({ times, datalist: source });

            times += 1;
            await swap(source, point, pivot, temp);
            await delay(SORT_DELAY_DURATION);

            source[point].color = CLEAR_COLOR;
            source[pivot].color = CLEAR_COLOR;
            source[i].color = CLEAR_COLOR;
            callback({ times, datalist: source });

            times = await this.searchByDescent(source, i, temp, times, callback);
        }  

        await delay(SORT_DELAY_DURATION);
        await complete(source, times, callback);
    }

    private async searchByAscent(source: SortDataModel[], i: number, temp: SortDataModel, times: number, callback: (param: SortStateModel) => void): Promise<number> {
        let pivot: number, point: number = -1;

        while (point !== i) {
            pivot = i;
            point = i;
            source[i].color = PRIMARY_COLOR;
            
            for (let j = i + 1; j < source.length; j++) {
                source[j].color = SECONDARY_COLOR;
                callback({ times, datalist: source });

                if (source[j].value < source[i].value) {
                    point += 1;
                }

                await delay(SORT_DELAY_DURATION);

                source[j].color = CLEAR_COLOR;
                callback({ times, datalist: source });
            }

            if (point === i) {
                source[i].color = CLEAR_COLOR;
                break;
            }
            
            while (source[point].value === source[i].value) {
                pivot += 1;
                await delay(SORT_DELAY_DURATION);
            }

            source[pivot].color = SECONDARY_COLOR;
            callback({ times, datalist: source });

            times += 1;
            await swap(source, point, pivot, temp);
            await delay(SORT_DELAY_DURATION);

            source[point].color = CLEAR_COLOR;
            source[pivot].color = CLEAR_COLOR;
            source[i].color = CLEAR_COLOR;
            callback({ times, datalist: source });
        }

        return times;
    }

    private async searchByDescent(source: SortDataModel[], i: number, temp: SortDataModel, times: number, callback: (param: SortStateModel) => void): Promise<number> {
        let pivot: number, point: number = -1;

        while (point !== i) {
            pivot = i;
            point = i;
            source[i].color = PRIMARY_COLOR;
            
            for (let j = i + 1; j < source.length; j++) {
                source[j].color = SECONDARY_COLOR;
                callback({ times, datalist: source });

                if (source[j].value > source[i].value) {
                    point += 1;
                }

                await delay(SORT_DELAY_DURATION);

                source[j].color = CLEAR_COLOR;
                callback({ times, datalist: source });
            }

            if (point === i) {
                source[i].color = CLEAR_COLOR;
                break;
            }
            
            while (source[point].value === source[i].value) {
                pivot += 1;
                await delay(SORT_DELAY_DURATION);
            }

            source[pivot].color = SECONDARY_COLOR;
            callback({ times, datalist: source });

            times += 1;
            await swap(source, point, pivot, temp);
            await delay(SORT_DELAY_DURATION);

            source[point].color = CLEAR_COLOR;
            source[pivot].color = CLEAR_COLOR;
            source[i].color = CLEAR_COLOR;
            callback({ times, datalist: source });
        }

        return times;
    }

}
