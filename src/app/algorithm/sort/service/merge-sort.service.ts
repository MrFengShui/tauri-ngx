import { Injectable } from "@angular/core";
import { Observable } from "rxjs";

import { SortDataModel, SortStateModel, SortOrder } from "../ngrx-store/sort.state";
import { SORT_DELAY_DURATION, complete, delay, swap } from "../sort.utils";

@Injectable()
export class MergeSortService {

    public sort(array: SortDataModel[], order: SortOrder): Observable<SortStateModel> {
        return new Observable(subscriber => {
            let temp: SortDataModel = { value: 0, color: 'whitesmoke' };

            if (order === 'ascent') {
                this.sortByAscent(array, param => subscriber.next(param)).then(() => subscriber.complete());
            }
    
            if (order === 'descent') {
                this.sortByDescent(array, param => subscriber.next(param)).then(() => subscriber.complete());
            }
        });
    }

    private async sortByAscent(source: SortDataModel[], callback: (param: SortStateModel) => void): Promise<void> {
        await this.sortByOrder(source, 0, source.length - 1, 'ascent', callback);
        await delay(SORT_DELAY_DURATION);
        await complete(source, 0, callback);
    }

    private async sortByDescent(source: SortDataModel[], callback: (parram: SortStateModel) => void): Promise<void> {
        await this.sortByOrder(source, 0, source.length - 1, 'descent', callback);
        await delay(SORT_DELAY_DURATION);
        await complete(source, 0, callback);
    }

    private async sortByOrder(source: SortDataModel[], lhs: number, rhs: number, order: SortOrder, callback: (parram: SortStateModel) => void): Promise<void> {
        if (lhs < rhs) {
            let mid: number = Math.floor((rhs - lhs) * 0.5 + lhs);
            await this.sortByOrder(source, lhs, mid, order, callback);
            await this.sortByOrder(source, mid + 1, rhs, order, callback);

            if (order === 'ascent') {
                await this.mergeByAscent(source, lhs, mid, rhs, callback);
            }
            
            if (order === 'descent') {
                await this.mergeByDescent(source, lhs, mid, rhs, callback);
            }
        }
    }

    private async mergeByAscent(source: SortDataModel[], lhs: number, mid: number, rhs: number, callback: (parram: SortStateModel) => void): Promise<void> {
        let i: number = lhs, j: number = mid + 1, k: number = 0;
        let array: SortDataModel[] = new Array(rhs - lhs + 1);

        while (i <= mid && j <= rhs) {
            source[i].color = 'lawngreen';
            source[j].color = 'orangered';
            callback({ completed: false, datalist: source });

            await delay(SORT_DELAY_DURATION);
            
            source[i].color = 'whitesmoke';
            source[j].color = 'whitesmoke';
            callback({ completed: false, datalist: source });

            if (source[i].value < source[j].value) {
                array[k] = source[i];
                i += 1;
            } else {
                array[k] = source[j];
                j += 1;
            }

            k += 1;
        }

        while (i <= mid) {
            source[i].color = 'lawngreen';
            callback({ completed: false, datalist: source });
            
            await delay(SORT_DELAY_DURATION);
            
            source[i].color = 'whitesmoke';
            callback({ completed: false, datalist: source });

            array[k] = source[i];
            k += 1;
            i += 1;
        }

        while (j <= rhs) {
            source[j].color = 'orangered';
            callback({ completed: false, datalist: source });
            
            await delay(SORT_DELAY_DURATION);
            
            source[j].color = 'whitesmoke';
            callback({ completed: false, datalist: source });

            array[k] = source[j];
            k += 1;
            j += 1;
        }

        for (k = 0; k < array.length; k++) {
            source[lhs + k].color = 'dodgerblue';
            await delay(SORT_DELAY_DURATION);
            callback({ completed: false, datalist: source });
            source[lhs + k].color = 'whitesmoke';
            source[lhs + k] = array[k];
        }
    }

    private async mergeByDescent(source: SortDataModel[], lhs: number, mid: number, rhs: number, callback: (parram: SortStateModel) => void): Promise<void> {
        let i: number = lhs, j: number = mid + 1, k: number = 0;
        let array: SortDataModel[] = new Array(rhs - lhs + 1);

        while (i <= mid && j <= rhs) {
            source[i].color = 'lawngreen';
            source[j].color = 'orangered';
            callback({ completed: false, datalist: source });

            await delay(SORT_DELAY_DURATION);
            
            source[i].color = 'whitesmoke';
            source[j].color = 'whitesmoke';
            callback({ completed: false, datalist: source });

            if (source[i].value > source[j].value) {
                array[k] = source[i];
                i += 1;
            } else {
                array[k] = source[j];
                j += 1;
            }

            k += 1;
        }

        while (i <= mid) {
            source[i].color = 'lawngreen';
            callback({ completed: false, datalist: source });
            
            await delay(SORT_DELAY_DURATION);
            
            source[i].color = 'whitesmoke';
            callback({ completed: false, datalist: source });

            array[k] = source[i];
            k += 1;
            i += 1;
        }

        while (j <= rhs) {
            source[j].color = 'orangered';
            callback({ completed: false, datalist: source });
            
            await delay(SORT_DELAY_DURATION);
            
            source[j].color = 'whitesmoke';
            callback({ completed: false, datalist: source });

            array[k] = source[j];
            k += 1;
            j += 1;
        }

        for (k = 0; k < array.length; k++) {
            source[lhs + k].color = 'dodgerblue';
            await delay(SORT_DELAY_DURATION);
            callback({ completed: false, datalist: source });
            source[lhs + k].color = 'whitesmoke';
            source[lhs + k] = array[k];
        }
    }

}
