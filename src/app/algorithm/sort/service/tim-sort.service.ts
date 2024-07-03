import { Injectable } from "@angular/core";
import { Observable } from "rxjs";

import { SortDataModel, SortStateModel, SortOrder } from "../ngrx-store/sort.state";
import { ACCENT_COLOR, CLEAR_COLOR, PRIMARY_COLOR, SECONDARY_COLOR, SORT_DELAY_DURATION, complete, delay, swap } from "../sort.utils";

/**
 * 蒂姆排序
 */
@Injectable()
export class TimSortService {

    private readonly THRESHOLD: number = 32;
    private array: number[] = Array.from([]);

    public sort(array: SortDataModel[], order: SortOrder): Observable<SortStateModel> {
        return new Observable(subscriber => {
            const temp: SortDataModel = { color: '', value: -1 };

            if (order === 'ascent') {
                this.sortByAscent(array, temp, 0, param => subscriber.next(param)).then(() => subscriber.complete());
            }
    
            if (order === 'descent') {
                this.sortByDescent(array, temp, 0, param => subscriber.next(param)).then(() => subscriber.complete());
            }
        });
    }

    private async sortByAscent(source: SortDataModel[], temp: SortDataModel, times: number, callback: (param: SortStateModel) => void): Promise<void> {
        const runLength: number = this.calcRunLength(source.length);
        let lhs: number, mid: number, rhs: number;

        for (lhs = 0; lhs < source.length; lhs += runLength) {
            rhs = Math.min(source.length - 1, lhs + runLength - 1);
            times = await this.insertionSortByAscent(source, lhs, rhs, temp, times, callback);
        }

        for (let mergeSize = runLength; mergeSize < source.length; mergeSize =  mergeSize * 2) {
            for (lhs = 0; lhs < source.length; lhs += mergeSize * 2) {
                mid = lhs + mergeSize - 1;
                rhs = Math.min(source.length - 1, lhs + mergeSize * 2 - 1);

                if (mid < rhs) {
                    times = await this.mergeByAscent(source, lhs, mid, rhs, times, callback);
                }
            }
        }

        await delay(SORT_DELAY_DURATION);
        await complete(source, times, callback);
    }

    private async sortByDescent(source: SortDataModel[], temp: SortDataModel, times: number, callback: (parram: SortStateModel) => void): Promise<void> {
        const runLength: number = this.calcRunLength(source.length);
        let lhs: number, mid: number, rhs: number;

        for (lhs = 0; lhs < source.length; lhs += runLength) {
            rhs = Math.min(source.length - 1, lhs + runLength - 1);
            times = await this.insertionSortByDescent(source, lhs, rhs, temp, times, callback);
        }

        for (let mergeSize = runLength; mergeSize < source.length; mergeSize =  mergeSize * 2) {
            for (lhs = 0; lhs < source.length; lhs += mergeSize * 2) {
                mid = lhs + mergeSize - 1;
                rhs = Math.min(source.length - 1, lhs + mergeSize * 2 - 1);

                if (mid < rhs) {
                    times = await this.mergeByDescent(source, lhs, mid, rhs, times, callback);
                }
            }
        }

        await delay(SORT_DELAY_DURATION);
        await complete(source, times, callback);
    }

    private calcRunLength(length: number): number {
        let runLength: number = length, remainder: number = 0;

        while (runLength > this.THRESHOLD) {
            if (runLength % 2 === 1) {
                remainder = 1;
            }

            runLength = Math.floor(runLength * 0.5);
        }

        return runLength + remainder;
    }

    private async insertionSortByAscent(source: SortDataModel[], lhs: number, rhs: number, temp: SortDataModel, times: number, callback: (parram: SortStateModel) => void): Promise<number> {
        for (let i = lhs + 1; i <= rhs; i++) {
            for (let j = i; j > lhs; j--) {
                source[j].color = PRIMARY_COLOR;

                if (source[j - 1].value > source[j].value) {
                    times += 1;

                    source[j - 1].color = SECONDARY_COLOR;
                    await swap(source, j - 1, j, temp);
                }

                callback({ times, datalist: source });

                await delay(SORT_DELAY_DURATION);

                source[j].color = CLEAR_COLOR;
                source[j - 1].color = CLEAR_COLOR;
                callback({ times, datalist: source });
            }
        }

        return times;
    }

    private async insertionSortByDescent(source: SortDataModel[], lhs: number, rhs: number, temp: SortDataModel, times: number, callback: (parram: SortStateModel) => void): Promise<number> {
        for (let i = lhs + 1; i <= rhs; i++) {
            for (let j = i; j > lhs; j--) {
                source[j].color = PRIMARY_COLOR;

                if (source[j - 1].value < source[j].value) {
                    times += 1;

                    source[j - 1].color = SECONDARY_COLOR;
                    await swap(source, j - 1, j, temp);
                }

                callback({ times, datalist: source });

                await delay(SORT_DELAY_DURATION);

                source[j].color = CLEAR_COLOR;
                source[j - 1].color = CLEAR_COLOR;
                callback({ times, datalist: source });
            }
        }

        return times;
    }

    private async mergeByAscent(source: SortDataModel[], lhs: number, mid: number, rhs: number, times: number, callback: (parram: SortStateModel) => void): Promise<number> {
        let i: number = lhs, j: number = mid + 1;
        
        while (i <= mid && j <= rhs) {
            times += 1;

            source[i].color = PRIMARY_COLOR;
            source[j].color = SECONDARY_COLOR;
            callback({ times, datalist: source });

            await delay(SORT_DELAY_DURATION);

            source[i].color = CLEAR_COLOR;
            source[j].color = CLEAR_COLOR;
            callback({ times, datalist: source });

            if (source[i].value < source[j].value) {
                this.array.push(source[i].value);
                i += 1;
            } else {
                this.array.push(source[j].value);
                j += 1;
            }
        }

        while (i <= mid) {
            times += 1;

            source[i].color = PRIMARY_COLOR;
            callback({ times, datalist: source });

            await delay(SORT_DELAY_DURATION);

            source[i].color = CLEAR_COLOR;
            callback({ times, datalist: source });

            this.array.push(source[i].value);
            i += 1;
        }

        while (j <= rhs) {
            times += 1;

            source[j].color = PRIMARY_COLOR;
            callback({ times, datalist: source });

            await delay(SORT_DELAY_DURATION);

            source[j].color = CLEAR_COLOR;
            callback({ times, datalist: source });

            this.array.push(source[j].value);
            j += 1;
        }

        for (let k = 0; k < this.array.length; k++) {
            times += 1;
            
            source[k + lhs].value = this.array[k];
            source[k + lhs].color = ACCENT_COLOR;
            callback({ times, datalist: source });

            await delay(SORT_DELAY_DURATION);

            source[k + lhs].color = CLEAR_COLOR;
            callback({ times, datalist: source });
        }

        this.array.splice(0);
        return times;
    }

    private async mergeByDescent(source: SortDataModel[], lhs: number, mid: number, rhs: number, times: number, callback: (parram: SortStateModel) => void): Promise<number> {
        let i: number = lhs, j: number = mid + 1;
        
        while (i <= mid && j <= rhs) {
            times += 1;

            source[i].color = PRIMARY_COLOR;
            source[j].color = SECONDARY_COLOR;
            callback({ times, datalist: source });

            await delay(SORT_DELAY_DURATION);

            source[i].color = CLEAR_COLOR;
            source[j].color = CLEAR_COLOR;
            callback({ times, datalist: source });

            if (source[i].value > source[j].value) {
                this.array.push(source[i].value);
                i += 1;
            } else {
                this.array.push(source[j].value);
                j += 1;
            }
        }

        while (i <= mid) {
            times += 1;

            source[i].color = PRIMARY_COLOR;
            callback({ times, datalist: source });

            await delay(SORT_DELAY_DURATION);

            source[i].color = CLEAR_COLOR;
            callback({ times, datalist: source });

            this.array.push(source[i].value);
            i += 1;
        }

        while (j <= rhs) {
            times += 1;

            source[j].color = PRIMARY_COLOR;
            callback({ times, datalist: source });

            await delay(SORT_DELAY_DURATION);

            source[j].color = CLEAR_COLOR;
            callback({ times, datalist: source });

            this.array.push(source[j].value);
            j += 1;
        }

        for (let k = 0; k < this.array.length; k++) {
            times += 1;
            
            source[k + lhs].value = this.array[k];
            source[k + lhs].color = ACCENT_COLOR;
            callback({ times, datalist: source });

            await delay(SORT_DELAY_DURATION);

            source[k + lhs].color = CLEAR_COLOR;
            callback({ times, datalist: source });
        }

        this.array.splice(0);
        return times;
    }

}
