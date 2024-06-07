import { Injectable } from "@angular/core";
import { Observable } from "rxjs";

import { SortDataModel, SortStateModel, SortOrder } from "../ngrx-store/sort.state";
import { SORT_DELAY_DURATION, complete, delay, swap } from "../sort.utils";

@Injectable()
export class SelectionSortService {

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
        let pivot: number;
        
        for (let i = 0; i < source.length; i++) {
            pivot = i;
            
            for (let j = pivot + 1; j < source.length; j++) {
                source[i].color = 'lawngreen';
                source[j].color = 'dodgerblue';
                source[pivot].color = 'orangered';
                callback({ completed: false, times, datalist: source });

                if (source[j].value < source[pivot].value) {
                    source[pivot].color = 'whitesmoke';
                    pivot = j;
                }

                await delay(SORT_DELAY_DURATION);
                source[i].color = 'whitesmoke';
                source[j].color = 'whitesmoke';
                source[pivot].color = 'orangered';
                callback({ completed: false, times, datalist: source });
            }

            source[i].color = 'lawngreen';
            source[pivot].color = 'orangered';
            callback({ completed: false, times, datalist: source});

            if (source[pivot].value < source[i].value) {
                await swap(source, i, pivot, temp);
                times += 1;
            }
            
            await delay(SORT_DELAY_DURATION);

            source[i].color = 'whitesmoke';
            source[pivot].color = 'whitesmoke';
            callback({ completed: false, times, datalist: source});
        }

        await delay(SORT_DELAY_DURATION);
        await complete(source, times, callback);
    }

    private async sortByDescent(source: SortDataModel[], temp: SortDataModel, times: number, callback: (parram: SortStateModel) => void): Promise<void> {
        let pivot: number;
        
        for (let i = 0; i < source.length; i++) {
            pivot = i;
            
            for (let j = pivot + 1; j < source.length; j++) {
                source[i].color = 'lawngreen';
                source[j].color = 'dodgerblue';
                source[pivot].color = 'orangered';
                callback({ completed: false, times, datalist: source });

                if (source[j].value > source[pivot].value) {
                    source[pivot].color = 'whitesmoke';
                    pivot = j;
                }

                await delay(SORT_DELAY_DURATION);
                source[i].color = 'whitesmoke';
                source[j].color = 'whitesmoke';
                source[pivot].color = 'orangered';
                callback({ completed: false, times, datalist: source });
            }

            source[i].color = 'lawngreen';
            source[pivot].color = 'orangered';
            callback({ completed: false, times, datalist: source});

            if (source[pivot].value > source[i].value) {
                await swap(source, i, pivot, temp);
                times += 1;
            }
            
            await delay(SORT_DELAY_DURATION);

            source[i].color = 'whitesmoke';
            source[pivot].color = 'whitesmoke';
            callback({ completed: false, times, datalist: source});
        }

        await delay(SORT_DELAY_DURATION);
        await complete(source, times, callback);
    }

}

@Injectable()
export class BoSelectionSortService {

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
        let pivot: number;
        
        for (let i = 0; i < source.length; i++) {
            pivot = await this.indexOfMinData(source, i, source.length - 1, i, times, callback);
            source[pivot].color = 'orangered';
            callback({ completed: false, times, datalist: source});

            if (source[pivot].value < source[i].value) {
                await swap(source, i, pivot, temp);
                times += 1;
            }
            
            await delay(SORT_DELAY_DURATION);

            source[i].color = 'whitesmoke';
            source[pivot].color = 'whitesmoke';
            callback({ completed: false, times, datalist: source});
        }

        await delay(SORT_DELAY_DURATION);
        await complete(source, times, callback);
    }

    private async sortByDescent(source: SortDataModel[], temp: SortDataModel, times: number, callback: (parram: SortStateModel) => void): Promise<void> {
        let pivot: number;
        
        for (let i = 0; i < source.length; i++) {
            pivot = await this.indexOfMaxData(source, i, source.length - 1, i, times, callback);
            
            if (source[pivot].value > source[i].value) {
                source[pivot].color = 'orangered';
                await swap(source, i, pivot, temp);
                times += 1;
            }
            
            callback({ completed: false, times, datalist: source});

            await delay(SORT_DELAY_DURATION);

            source[i].color = 'whitesmoke';
            source[pivot].color = 'whitesmoke';
            callback({ completed: false, times, datalist: source});
        }

        await delay(SORT_DELAY_DURATION);
        await complete(source, times, callback);
    }

    private async indexOfMinData(source: SortDataModel[], lhs: number, rhs: number, pivot: number, times: number, callback: (parram: SortStateModel) => void): Promise<number> {
        source[pivot].color = 'lawngreen';

        if (lhs < rhs) {
            let mid: number = Math.floor((rhs - lhs) * 0.5 + lhs);
            source[mid].color = 'dodgerblue';
            callback({ completed: false, times, datalist: source});

            lhs = await this.indexOfMinData(source, lhs, mid, pivot, times, callback);
            rhs = await this.indexOfMinData(source, mid + 1, rhs, pivot, times, callback);
            await delay(SORT_DELAY_DURATION);

            source[mid].color = 'whitesmoke';
            callback({ completed: false, times, datalist: source});
            return source[lhs].value < source[rhs].value ? lhs : rhs;
        }
        
        return lhs;
    }

    private async indexOfMaxData(source: SortDataModel[], lhs: number, rhs: number, pivot: number, times: number, callback: (parram: SortStateModel) => void): Promise<number> {
        source[pivot].color = 'lawngreen';

        if (lhs < rhs) {
            let mid: number = Math.floor((rhs - lhs) * 0.5 + lhs);
            source[mid].color = 'orangered';
            callback({ completed: false, times, datalist: source});

            lhs = await this.indexOfMaxData(source, lhs, mid, pivot, times, callback);
            rhs = await this.indexOfMaxData(source, mid + 1, rhs, pivot, times, callback);
            await delay(SORT_DELAY_DURATION);

            source[mid].color = 'whitesmoke';
            callback({ completed: false, times, datalist: source});
            return source[lhs].value > source[rhs].value ? lhs : rhs;
        }
        
        return lhs;
    }

}

@Injectable()
export class BiSelectionSortService {

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
        let i: number, j: number, k: number, pivot: number;
        
        for (i = 0; i < source.length; i++) {
            pivot = i;
            
            for (j = pivot + 1; j < source.length - i; j++) {
                source[i].color = 'lawngreen';
                source[j].color = 'dodgerblue';
                source[pivot].color = 'orangered';
                callback({ completed: false, times, datalist: source });

                if (source[j].value < source[pivot].value) {
                    source[pivot].color = 'whitesmoke';
                    pivot = j;
                }

                await delay(SORT_DELAY_DURATION);
                source[i].color = 'whitesmoke';
                source[j].color = 'whitesmoke';
                source[pivot].color = 'orangered';
                callback({ completed: false, times, datalist: source });
            }

            source[i].color = 'lawngreen';
            source[pivot].color = 'orangered';
            callback({ completed: false, times, datalist: source});

            if (source[pivot].value < source[i].value) {
                await swap(source, i, pivot, temp);
                times += 1;
            }
            
            await delay(SORT_DELAY_DURATION);

            source[i].color = 'whitesmoke';
            source[pivot].color = 'whitesmoke';
            callback({ completed: false, times, datalist: source});

            k = source.length - i - 1;
            pivot = k;

            for (j = pivot - 1; j > i; j--) {
                source[k].color = 'lawngreen';
                source[j].color = 'dodgerblue';
                source[pivot].color = 'orangered';
                callback({ completed: false, times, datalist: source });

                if (source[j].value > source[pivot].value) {
                    source[pivot].color = 'whitesmoke';
                    pivot = j;
                }

                await delay(SORT_DELAY_DURATION);
                source[k].color = 'whitesmoke';
                source[j].color = 'whitesmoke';
                source[pivot].color = 'orangered';
                callback({ completed: false, times, datalist: source });
            }

            source[k].color = 'lawngreen';
            source[pivot].color = 'orangered';
            callback({ completed: false, times, datalist: source});

            
            if (source[pivot].value > source[k].value) {
                await swap(source, k, pivot, temp);
                times += 1;
            }
            
            await delay(SORT_DELAY_DURATION);

            source[k].color = 'whitesmoke';
            source[pivot].color = 'whitesmoke';
            callback({ completed: false, times, datalist: source});
        }

        await delay(SORT_DELAY_DURATION);
        await complete(source, times, callback);
    }

    private async sortByDescent(source: SortDataModel[], temp: SortDataModel, times: number, callback: (parram: SortStateModel) => void): Promise<void> {
        let i: number, j: number, k: number, pivot: number;
        
        for (i = 0; i < source.length; i++) {
            pivot = i;
            
            for (j = pivot + 1; j < source.length - i; j++) {
                source[i].color = 'lawngreen';
                source[j].color = 'dodgerblue';
                source[pivot].color = 'orangered';
                callback({ completed: false, times, datalist: source });

                if (source[j].value > source[pivot].value) {
                    source[pivot].color = 'whitesmoke';
                    pivot = j;
                }

                await delay(SORT_DELAY_DURATION);
                source[i].color = 'whitesmoke';
                source[j].color = 'whitesmoke';
                source[pivot].color = 'orangered';
                callback({ completed: false, times, datalist: source });
            }

            source[i].color = 'lawngreen';
            source[pivot].color = 'orangered';
            callback({ completed: false, times, datalist: source});
            
            if (source[pivot].value > source[i].value) {
                await swap(source, i, pivot, temp);
                times += 1;
            }
            
            await delay(SORT_DELAY_DURATION);

            source[i].color = 'whitesmoke';
            source[pivot].color = 'whitesmoke';
            callback({ completed: false, times, datalist: source});

            k = source.length - i - 1;
            pivot = k;

            for (j = pivot - 1; j > i; j--) {
                source[k].color = 'lawngreen';
                source[j].color = 'dodgerblue';
                source[pivot].color = 'orangered';
                callback({ completed: false, times, datalist: source });

                if (source[j].value < source[pivot].value) {
                    source[pivot].color = 'whitesmoke';
                    pivot = j;
                }

                await delay(SORT_DELAY_DURATION);
                source[k].color = 'whitesmoke';
                source[j].color = 'whitesmoke';
                source[pivot].color = 'orangered';
                callback({ completed: false, times, datalist: source });
            }

            source[k].color = 'lawngreen';
            source[pivot].color = 'orangered';
            callback({ completed: false, times, datalist: source});
            
            if (source[pivot].value < source[k].value) {
                await swap(source, k, pivot, temp);
                times += 1;
            }
            
            await delay(SORT_DELAY_DURATION);
            source[k].color = 'whitesmoke';
            source[pivot].color = 'whitesmoke';
            callback({ completed: false, times, datalist: source});
        }

        await delay(SORT_DELAY_DURATION);
        await complete(source, times, callback);
    }

}
