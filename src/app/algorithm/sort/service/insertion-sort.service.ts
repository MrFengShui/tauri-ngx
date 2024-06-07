import { Injectable } from "@angular/core";
import { Observable } from "rxjs";

import { SortDataModel, SortStateModel, SortOrder } from "../ngrx-store/sort.state";
import { SORT_DELAY_DURATION, binarySearchByAscent, binarySearchByDscent, complete, delay, swap } from "../sort.utils";

@Injectable()
export class InsertionSortService {

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
        for (let i = 1; i < source.length; i++) {
            for (let j = i; j > 0; j--) {
                source[j].color = 'lawngreen';

                if (source[j - 1].value > source[j].value) {
                    source[j - 1].color = 'orangered';
                    await swap(source, j - 1, j, temp);
                }

                await delay(SORT_DELAY_DURATION);
                callback({ completed: false, datalist: source});
                source[j].color = 'whitesmoke';
                source[j - 1].color = 'whitesmoke';
            }
        }

        await delay(SORT_DELAY_DURATION);
        await complete(source, 0, callback);
    }

    private async sortByDescent(source: SortDataModel[], temp: SortDataModel, callback: (parram: SortStateModel) => void): Promise<void> {
        for (let i = 1; i < source.length; i++) {
            for (let j = i; j > 0; j--) {
                source[j].color = 'lawngreen';

                if (source[j - 1].value < source[j].value) {
                    source[j - 1].color = 'orangered';
                    await swap(source, j - 1, j, temp);
                }

                await delay(SORT_DELAY_DURATION);
                callback({ completed: false, datalist: source});
                source[j].color = 'whitesmoke';
                source[j - 1].color = 'whitesmoke';
            }
        }

        await delay(SORT_DELAY_DURATION);
        await complete(source, 0, callback);
    }

}

@Injectable()
export class ShellSortService {

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
        for (let gap = Math.floor(source.length * 0.5); gap > 0; gap = Math.floor(gap * 0.5)) {
            for (let i = gap; i < source.length; i++) {
                for (let j = i - gap; j >= 0; j -= gap) {
                    source[j].color = 'lawngreen';
    
                    if (source[j].value > source[j + gap].value) {
                        source[j + gap].color = 'orangered';
                        await swap(source, j, j + gap, temp);
                    }
    
                    callback({ completed: false, datalist: source});
                    await delay(SORT_DELAY_DURATION);
                    source[j].color = 'whitesmoke';
                    source[j + gap].color = 'whitesmoke';
                    callback({ completed: false, datalist: source});
                }
            }
        }
        
        await delay(SORT_DELAY_DURATION);
        await complete(source, 0, callback);
    }

    private async sortByDescent(source: SortDataModel[], temp: SortDataModel, callback: (parram: SortStateModel) => void): Promise<void> {
        for (let gap = Math.floor(source.length * 0.5); gap > 0; gap = Math.floor(gap * 0.5)) {
            for (let i = gap; i < source.length; i++) {
                for (let j = i - gap; j >= 0; j -= gap) {
                    source[j].color = 'lawngreen';
    
                    if (source[j].value < source[j + gap].value) {
                        source[j + gap].color = 'orangered';
                        await swap(source, j, j + gap, temp);
                    }
    
                    callback({ completed: false, datalist: source});
                    await delay(SORT_DELAY_DURATION);
                    source[j].color = 'whitesmoke';
                    source[j + gap].color = 'whitesmoke';
                    callback({ completed: false, datalist: source});
                }
            }
        }

        await delay(SORT_DELAY_DURATION);
        await complete(source, 0, callback);
    }

}

@Injectable()
export class BSInsertionSortService {

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
        let pivot: number = -1;

        for (let i = 1; i < source.length; i++) {
            pivot = await binarySearchByAscent(source, source[i], i);
            source[pivot].color = 'dodgerblue';
            await delay(SORT_DELAY_DURATION);
            callback({ completed: false, datalist: source});

            for (let j = i; j > pivot; j--) {
                source[j].color = 'lawngreen';
                source[j - 1].color = 'orangered';
                await swap(source, j, j - 1, temp);
                await delay(SORT_DELAY_DURATION);
                callback({ completed: false, datalist: source});
                source[j].color = 'whitesmoke';
                source[j - 1].color = 'whitesmoke';
            }
            
            source[i].color = 'whitesmoke';
        }

        await delay(SORT_DELAY_DURATION);
        await complete(source, 0, callback);
    }

    private async sortByDescent(source: SortDataModel[], temp: SortDataModel, callback: (parram: SortStateModel) => void): Promise<void> {
        let pivot: number = -1;

        for (let i = 1; i < source.length; i++) {
            pivot = await binarySearchByDscent(source, source[i], i);
            source[pivot].color = 'dodgerblue';
            await delay(SORT_DELAY_DURATION);
            callback({ completed: false, datalist: source});

            for (let j = i; j > pivot; j--) {
                source[j].color = 'lawngreen';
                source[j - 1].color = 'orangered';
                await swap(source, j, j - 1, temp);
                await delay(SORT_DELAY_DURATION);
                callback({ completed: false, datalist: source});
                source[j].color = 'whitesmoke';
                source[j - 1].color = 'whitesmoke';
            }
            
            source[i].color = 'whitesmoke';
        }

        await delay(SORT_DELAY_DURATION);
        await complete(source, 0, callback);
    }

}
