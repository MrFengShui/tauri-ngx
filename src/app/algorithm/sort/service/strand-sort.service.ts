import { Injectable } from "@angular/core";
import { Observable } from "rxjs";

import { SortDataModel, SortOrder, SortStateModel } from "../ngrx-store/sort.state";
import { PRIMARY_COLOR, SECONDARY_COLOR, SORT_DELAY_DURATION, CLEAR_COLOR, ACCENT_COLOR, complete, delay, ACCENT_ONE_COLOR, ACCENT_TWO_COLOR } from "../sort.utils";

/**
 * 股排序
 */
@Injectable()
export class StrandSortService {

    public sort(array: SortDataModel[], order: SortOrder): Observable<SortStateModel> {
        return new Observable(subscriber => {
            if (order === 'ascent') {
                this.sortByAscent(array, 0, param => subscriber.next(param)).then(() => subscriber.complete());
            }
    
            if (order === 'descent') {
                this.sortByDescent(array, 0, param => subscriber.next(param)).then(() => subscriber.complete());
            }
        });
    }

    private async sortByAscent(source: SortDataModel[], times: number, callback: (param: SortStateModel) => void): Promise<void> {
        const oldUnsorted: number[] = source.map(item => item.value), oldSorted: number[] = Array.from([]);
        const newUnsorted: number[] = Array.from([]), newSorted: number[] = Array.from([]);
        let fst: number, snd: number;
        
        while (oldUnsorted.length > 0) {
            if (newUnsorted.length > 0) {
                newUnsorted.splice(0);
            }

            if (newSorted.length > 0) {
                newSorted.splice(0);
            }

            for (let i = 0; i < oldUnsorted.length; i++) {
                times += 1;
                
                source[i].color = ACCENT_ONE_COLOR;
                callback({ times, datalist: source });
    
                await delay(SORT_DELAY_DURATION);
    
                source[i].color = CLEAR_COLOR;
                callback({ times, datalist: source });
                
                if (i === 0) {
                    newSorted.push(oldUnsorted[i]);
                    continue;
                }
    
                if (oldUnsorted[i] > newSorted[newSorted.length - 1]) {
                    newSorted.push(oldUnsorted[i]);
                } else {
                    newUnsorted.push(oldUnsorted[i]);
                }
            }
            
            [times, fst, snd] = await this.merge(source, newUnsorted, newSorted, oldSorted, times, callback);
            times = await this.mergeByAscent(source, fst, snd, times, callback);
            
            oldUnsorted.splice(0);
            newUnsorted.forEach(item => oldUnsorted.push(item));
        }

        await delay(SORT_DELAY_DURATION);
        await complete(source, times, callback);
    }

    private async sortByDescent(source: SortDataModel[], times: number, callback: (parram: SortStateModel) => void): Promise<void> {
        const oldUnsorted: number[] = source.map(item => item.value), oldSorted: number[] = Array.from([]);
        const newUnsorted: number[] = Array.from([]), newSorted: number[] = Array.from([]);
        let fst: number, snd: number;
        
        while (oldUnsorted.length > 0) {
            if (newUnsorted.length > 0) {
                newUnsorted.splice(0);
            }

            if (newSorted.length > 0) {
                newSorted.splice(0);
            }

            for (let i = 0; i < oldUnsorted.length; i++) {
                times += 1;
                
                source[i].color = ACCENT_ONE_COLOR;
                callback({ times, datalist: source });
    
                await delay(SORT_DELAY_DURATION);
    
                source[i].color = CLEAR_COLOR;
                callback({ times, datalist: source });
                
                if (i === 0) {
                    newSorted.push(oldUnsorted[i]);
                    continue;
                }
    
                if (oldUnsorted[i] < newSorted[newSorted.length - 1]) {
                    newSorted.push(oldUnsorted[i]);
                } else {
                    newUnsorted.push(oldUnsorted[i]);
                }
            }
            
            [times, fst, snd] = await this.merge(source, newUnsorted, newSorted, oldSorted, times, callback);
            times = await this.mergeByDescent(source, fst, snd, times, callback);
            
            oldUnsorted.splice(0);
            newUnsorted.forEach(item => oldUnsorted.push(item));
        }

        await delay(SORT_DELAY_DURATION);
        await complete(source, times, callback);
    }

    private async merge(source: SortDataModel[], newUnsorted: number[], newSorted: number[], oldSorted: number[], times: number, callback: (param: SortStateModel) => void): Promise<[number, number, number]> {
        let index: number = 0, fst: number, snd: number;

        for (const item of newUnsorted) {
            times += 1;

            source[index].value = item;
            source[index].color = ACCENT_TWO_COLOR;
            callback({ times, datalist: source });

            await delay(SORT_DELAY_DURATION);

            source[index].color = CLEAR_COLOR;
            callback({ times, datalist: source });

            index += 1;
        }

        fst = index;
        await delay(SORT_DELAY_DURATION);

        for (const item of newSorted) {
            times += 1;

            source[index].value = item;
            source[index].color = ACCENT_TWO_COLOR;
            callback({ times, datalist: source });

            await delay(SORT_DELAY_DURATION);

            source[index].color = CLEAR_COLOR;
            callback({ times, datalist: source });

            index += 1;
        }

        snd = index;
        await delay(SORT_DELAY_DURATION);

        for (const item of oldSorted) {
            times += 1;

            source[index].value = item;
            source[index].color = ACCENT_TWO_COLOR;
            callback({ times, datalist: source });

            await delay(SORT_DELAY_DURATION);

            source[index].color = CLEAR_COLOR;
            callback({ times, datalist: source });

            index += 1;
        }
        
        return [times, fst, snd];
    }

    private async mergeByAscent(source: SortDataModel[], fst: number, snd: number, times: number, callback: (param: SortStateModel) => void): Promise<number> {
        const lhs: number = fst, rhs: number = source.length - 1, mid: number = snd - 1;
        let i: number = fst, j: number = snd;
        const array: number[] = Array.from([]);
        
        while (i <= mid && j <= rhs) {
            source[i].color = PRIMARY_COLOR;
            source[j].color = SECONDARY_COLOR;
            callback({ times, datalist: source });

            await delay(SORT_DELAY_DURATION);

            source[i].color = CLEAR_COLOR;
            source[j].color = CLEAR_COLOR;
            callback({ times, datalist: source });

            if (source[i].value < source[j].value) {
                array.push(source[i].value);
                i += 1;
            } else {
                array.push(source[j].value);
                j += 1;
            }
        }
        
        while (i <= mid) {
            source[i].color = PRIMARY_COLOR;
            callback({ times, datalist: source });

            await delay(SORT_DELAY_DURATION);

            source[i].color = CLEAR_COLOR;
            callback({ times, datalist: source });

            array.push(source[i].value);
            i += 1;
        }

        while (j <= rhs) {
            source[j].color = SECONDARY_COLOR;
            callback({ times, datalist: source });

            await delay(SORT_DELAY_DURATION);

            source[j].color = CLEAR_COLOR;
            callback({ times, datalist: source });

            array.push(source[j].value);
            j += 1;
        }

        for (let k = 0; k < array.length; k++) {
            times += 1;

            source[k + lhs].value = array[k];
            source[k + lhs].color = ACCENT_COLOR;
            callback({ times, datalist: source });

            await delay(SORT_DELAY_DURATION);

            source[k + lhs].color = CLEAR_COLOR;
            callback({ times, datalist: source });
        }

        return times;
    }

    private async mergeByDescent(source: SortDataModel[], fst: number, snd: number, times: number, callback: (param: SortStateModel) => void): Promise<number> {
        const lhs: number = fst, rhs: number = source.length - 1, mid: number = snd - 1;
        let i: number = fst, j: number = snd;
        const array: number[] = Array.from([]);
        
        while (i <= mid && j <= rhs) {
            source[i].color = PRIMARY_COLOR;
            source[j].color = SECONDARY_COLOR;
            callback({ times, datalist: source });

            await delay(SORT_DELAY_DURATION);

            source[i].color = CLEAR_COLOR;
            source[j].color = CLEAR_COLOR;
            callback({ times, datalist: source });

            if (source[i].value > source[j].value) {
                array.push(source[i].value);
                i += 1;
            } else {
                array.push(source[j].value);
                j += 1;
            }
        }
        
        while (i <= mid) {
            source[i].color = PRIMARY_COLOR;
            callback({ times, datalist: source });

            await delay(SORT_DELAY_DURATION);

            source[i].color = CLEAR_COLOR;
            callback({ times, datalist: source });

            array.push(source[i].value);
            i += 1;
        }

        while (j <= rhs) {
            source[j].color = SECONDARY_COLOR;
            callback({ times, datalist: source });

            await delay(SORT_DELAY_DURATION);

            source[j].color = CLEAR_COLOR;
            callback({ times, datalist: source });

            array.push(source[j].value);
            j += 1;
        }

        for (let k = 0; k < array.length; k++) {
            times += 1;

            source[k + lhs].value = array[k];
            source[k + lhs].color = ACCENT_COLOR;
            callback({ times, datalist: source });

            await delay(SORT_DELAY_DURATION);

            source[k + lhs].color = CLEAR_COLOR;
            callback({ times, datalist: source });
        }

        return times;
    }

}
