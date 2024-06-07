import { Injectable } from "@angular/core";
import { Observable } from "rxjs";

import { SortDataModel, SortStateModel, SortOrder } from "../ngrx-store/sort.state";
import { SORT_DELAY_DURATION, complete, delay, swap } from "../sort.utils";

const isSortedByAscent = (source: SortDataModel[]): boolean => {
    for (let i = 0; i < source.length - 1; i++) {
        if (source[i + 1].value < source[i].value) {
            return false;
        }
    }

    return true;
}

const isSortedByDescent = (source: SortDataModel[]): boolean => {
    for (let i = 0; i < source.length - 1; i++) {
        if (source[i + 1].value > source[i].value) {
            return false;
        }
    }

    return true;
}

@Injectable()
export class BogoSortService {

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
        let i: number, j: number;
        let isValid: boolean = isSortedByAscent(source);
        
        while (!isValid) {
            i = Math.floor(Math.random() * source.length);
            j = Math.floor(Math.random() * source.length);
            
            if (i === j) continue;

            source[i].color = 'lawngreen';
            source[j].color = 'orangered';

            if (i < j && source[i].value > source[j].value) {
                await swap(source, i, j, temp);
                times += 1;
            }

            callback({ completed: false, times, datalist: source});
            await delay(SORT_DELAY_DURATION);
            
            source[i].color = 'whitesmoke';
            source[j].color = 'whitesmoke';
            callback({ completed: false, times, datalist: source});

            isValid = isSortedByAscent(source);
        }

        await delay(SORT_DELAY_DURATION);
        await complete(source, times, callback);
    }

    private async sortByDescent(source: SortDataModel[], temp: SortDataModel, times: number, callback: (parram: SortStateModel) => void): Promise<void> {
        let i: number, j: number;
        let isValid: boolean = isSortedByDescent(source);
        
        while (!isValid) {
            i = Math.floor(Math.random() * source.length);
            j = Math.floor(Math.random() * source.length);
            
            if (i === j) continue;

            source[i].color = 'lawngreen';
            source[j].color = 'orangered';

            if (i < j && source[i].value < source[j].value) {
                await swap(source, i, j, temp);
                times += 1;
            }

            callback({ completed: false, times, datalist: source});

            await delay(SORT_DELAY_DURATION);
            
            source[i].color = 'whitesmoke';
            source[j].color = 'whitesmoke';
            callback({ completed: false, times, datalist: source});

            isValid = isSortedByDescent(source);
        }

        await delay(SORT_DELAY_DURATION);
        await complete(source, times, callback);
    }

}

@Injectable()
export class BogoBubbleSortService {

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
        let i: number = 0, j: number, pivot: number = 0;
        let isValid: boolean = isSortedByAscent(source);
        
        while (!isValid) {
            j = Math.floor(Math.random() * (source.length - i) + i);

            source[pivot].color = 'dodgerblue';
            source[i].color = 'lawngreen';
            source[j].color = 'orangered';
            callback({ completed: false, times, datalist: source});

            if (i < j && source[i].value > source[j].value) {
                await swap(source, i, j, temp);
                times += 1;
            }

            await delay(SORT_DELAY_DURATION);
            
            source[pivot].color = 'dodgerblue';
            source[i].color = 'whitesmoke';
            source[j].color = 'whitesmoke';
            callback({ completed: false, times, datalist: source});

            i = i + 1 === source.length ? pivot : i + 1;
            
            if (source[pivot].value - 1 === pivot) {
                source[pivot].color = 'whitesmoke';
                pivot += 1;
                i = pivot;
                callback({ completed: false, times, datalist: source});
            }
            
            isValid = isSortedByAscent(source);
        }

        await delay(SORT_DELAY_DURATION);
        await complete(source, times, callback);
    }

    private async sortByDescent(source: SortDataModel[], temp: SortDataModel, times: number, callback: (parram: SortStateModel) => void): Promise<void> {
        let i: number = 0, j: number, pivot: number = 0;
        let isValid: boolean = isSortedByDescent(source);
        
        while (!isValid) {
            j = Math.floor(Math.random() * (source.length - i) + i);

            source[pivot].color = 'dodgerblue';
            source[i].color = 'lawngreen';
            source[j].color = 'orangered';
            callback({ completed: false, times, datalist: source});

            if (i < j && source[i].value < source[j].value) {
                await swap(source, i, j, temp);
                times += 1;
            }

            await delay(SORT_DELAY_DURATION);
            
            source[pivot].color = 'dodgerblue';
            source[i].color = 'whitesmoke';
            source[j].color = 'whitesmoke';
            callback({ completed: false, times, datalist: source});
            
            i = i === source.length - 1 ? pivot : i + 1;
            
            if (source.length - source[pivot].value === pivot) {
                source[pivot].color = 'whitesmoke';
                pivot += 1;
                i = pivot;
                callback({ completed: false, times, datalist: source});
            }

            isValid = isSortedByDescent(source);
        }

        await delay(SORT_DELAY_DURATION);
        await complete(source, times, callback);
    }

}
