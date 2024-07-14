import { Injectable } from "@angular/core";
import { Observable } from "rxjs";

import { SortDataModel, SortStateModel, SortOrder } from "../ngrx-store/sort.state";
import { SORT_DELAY_DURATION, complete, delay, swap } from "../sort.utils";
import { PRIMARY_COLOR, SECONDARY_COLOR, CLEAR_COLOR } from "../../../public/values.utils";

/**
 * 奇偶归并排序（自顶向下）
 */
@Injectable()
export class TopDownOddEvenMergeSortService {

    public sort(array: SortDataModel[], order: SortOrder): Observable<SortStateModel> {
        return new Observable(subscriber => {
            const temp: SortDataModel = { value: 0, color: 'whitesmoke' };

            if (order === 'ascent') {
                this.sortByAscent(array, 0, array.length - 1, temp, 0, param => subscriber.next(param)).then(() => subscriber.complete());
            }
    
            if (order === 'descent') {
                this.sortByDescent(array, 0, array.length - 1, temp, 0, param => subscriber.next(param)).then(() => subscriber.complete());
            }
        });
    }

    private async sortByAscent(source: SortDataModel[], lhs: number, rhs: number, temp: SortDataModel, times: number, callback: (param: SortStateModel) => void): Promise<void> {
        times = await this.sortByOrder(source, lhs, rhs, temp, 'ascent', times, callback);
        await delay(SORT_DELAY_DURATION);
        await complete(source, times, callback);
    }

    private async sortByDescent(source: SortDataModel[], lhs: number, rhs: number, temp: SortDataModel, times: number, callback: (parram: SortStateModel) => void): Promise<void> {
        times = await this.sortByOrder(source, lhs, rhs, temp, 'descent', times, callback);
        await delay(SORT_DELAY_DURATION);
        await complete(source, times, callback);
    }

    private async sortByOrder(source: SortDataModel[], lhs: number, rhs: number, temp: SortDataModel, order: SortOrder, times: number, callback: (parram: SortStateModel) => void): Promise<number> {
        if (lhs < rhs) {
            const mid: number = Math.floor((rhs - lhs) * 0.5 + lhs);
            times = await this.sortByOrder(source, lhs, mid, temp, order, times, callback);
            times = await this.sortByOrder(source, mid + 1, rhs, temp, order, times, callback);

            if (order === 'ascent') {
                times = await this.mergeByAscent(source, lhs, rhs, 1, temp, times, callback);
            }
            
            if (order === 'descent') {
                times = await this.mergeByDescent(source, lhs, rhs, 1, temp, times, callback);
            }
        }

        return times;
    }

    private async mergeByAscent(source: SortDataModel[], lhs: number, rhs: number, dist: number, temp: SortDataModel, times: number, callback: (parram: SortStateModel) => void): Promise<number> {
        const span: number = dist * 2;
        
        if (span < rhs - lhs + 1) {
            times = await this.mergeByAscent(source, lhs, rhs, span, temp, times, callback);
            times = await this.mergeByAscent(source, lhs + dist, rhs, span, temp, times, callback);
    
            for (let i = lhs + dist; i + dist < rhs + 1; i += span) {
                source[i].color = PRIMARY_COLOR;
                source[i + dist].color = SECONDARY_COLOR;
                callback({ times, datalist: source});  
    
                await delay(SORT_DELAY_DURATION);
    
                if (source[i].value > source[i + dist].value) {
                    await swap(source, i, i + dist, temp);
                    times += 1;
                }
    
                source[i].color = CLEAR_COLOR;
                source[i + dist].color = CLEAR_COLOR;
                callback({ times, datalist: source});                
            }
        } else {
            source[lhs].color = PRIMARY_COLOR;
            source[lhs + dist].color = SECONDARY_COLOR;
            callback({ times, datalist: source});  

            await delay(SORT_DELAY_DURATION);

            if (source[lhs].value > source[lhs + dist].value) {
                await swap(source, lhs, lhs + dist, temp);
                times += 1;
            }

            source[lhs].color = CLEAR_COLOR;
            source[lhs + dist].color = CLEAR_COLOR;
            callback({ times, datalist: source});  
        }
        
        return times;
    }

    private async mergeByDescent(source: SortDataModel[], lhs: number, rhs: number, dist: number, temp: SortDataModel, times: number, callback: (parram: SortStateModel) => void): Promise<number> {
        const span: number = dist * 2;
        
        if (span < rhs - lhs + 1) {
            times = await this.mergeByDescent(source, lhs, rhs, span, temp, times, callback);
            times = await this.mergeByDescent(source, lhs + dist, rhs, span, temp, times, callback);
    
            for (let i = lhs + dist; i + dist < rhs + 1; i += span) {
                source[i].color = PRIMARY_COLOR;
                source[i + dist].color = SECONDARY_COLOR;
                callback({ times, datalist: source});  
    
                await delay(SORT_DELAY_DURATION);
    
                if (source[i].value < source[i + dist].value) {
                    await swap(source, i, i + dist, temp);
                    times += 1;
                }
    
                source[i].color = CLEAR_COLOR;
                source[i + dist].color = CLEAR_COLOR;
                callback({ times, datalist: source});                
            }
        } else {
            source[lhs].color = PRIMARY_COLOR;
            source[lhs + dist].color = SECONDARY_COLOR;
            callback({ times, datalist: source});  

            await delay(SORT_DELAY_DURATION);

            if (source[lhs].value < source[lhs + dist].value) {
                await swap(source, lhs, lhs + dist, temp);
                times += 1;
            }

            source[lhs].color = CLEAR_COLOR;
            source[lhs + dist].color = CLEAR_COLOR;
            callback({ times, datalist: source});  
        }
        
        return times;
    }

}

/**
 * 奇偶归并排序（自底向上）
 */
@Injectable()
export class BottomUpOddEvenMergeSortService {

    public sort(array: SortDataModel[], order: SortOrder): Observable<SortStateModel> {
        return new Observable(subscriber => {
            const temp: SortDataModel = { value: 0, color: 'whitesmoke' };

            if (order === 'ascent') {
                this.sortByAscent(array, temp, 0, param => subscriber.next(param)).then(() => subscriber.complete());
            }
    
            if (order === 'descent') {
                this.sortByDescent(array, temp, 0, param => subscriber.next(param)).then(() => subscriber.complete());
            }
        });
    }

    private async sortByAscent(source: SortDataModel[], temp: SortDataModel, times: number, callback: (param: SortStateModel) => void): Promise<void> {
        for (let size = 1, length = source.length; size < length; size *= 2) {
            for (let span = size; span > 0; span >>= 1) {
                for (let low = span % size; low <= length - span - 1; low += span + span) {
                    times = await this.mergeByAscent(source, low, size, span, temp, times, callback);
                }
            }
        }

        await delay(SORT_DELAY_DURATION);
        await complete(source, times, callback);
    }

    private async sortByDescent(source: SortDataModel[], temp: SortDataModel, times: number, callback: (parram: SortStateModel) => void): Promise<void> {
        for (let size = 1, length = source.length; size < length; size *= 2) {
            for (let span = size; span > 0; span >>= 1) {
                for (let low = span % size; low <= length - span - 1; low += span + span) {
                    times = await this.mergeByDescent(source, low, size, span, temp, times, callback);
                }
            }
        }

        await delay(SORT_DELAY_DURATION);
        await complete(source, times, callback);
    }

    private async mergeByAscent(source: SortDataModel[], low: number, size: number, span: number, temp: SortDataModel, times: number, callback: (parram: SortStateModel) => void): Promise<number> {
        let fst: number, snd: number;

        for (let i = 0, length = source.length; i <= Math.min(span - 1, length - span - 1); i++) {
            fst = Math.floor((i + low) / (size + size));
            snd = Math.floor((i + low + span) / (size + size));

            source[i + low].color = PRIMARY_COLOR;
            source[i + low + span].color = SECONDARY_COLOR;
            callback({ times, datalist: source});  

            if (fst === snd && source[i + low].value > source[i + low + span].value) {
                await swap(source, i + low, i + low + span, temp);
                times += 1;
            }

            await delay(SORT_DELAY_DURATION);

            source[i + low].color = CLEAR_COLOR;
            source[i + low + span].color = CLEAR_COLOR;
            callback({ times, datalist: source}); 
        }

        return times;
    }

    private async mergeByDescent(source: SortDataModel[], low: number, size: number, span: number, temp: SortDataModel, times: number, callback: (parram: SortStateModel) => void): Promise<number> {
        let fst: number, snd: number;

        for (let i = 0, length = source.length; i <= Math.min(span - 1, length - span - 1); i++) {
            fst = Math.floor((i + low) / (size + size));
            snd = Math.floor((i + low + span) / (size + size));

            source[i + low].color = PRIMARY_COLOR;
            source[i + low + span].color = SECONDARY_COLOR;
            callback({ times, datalist: source});  

            if (fst === snd && source[i + low].value < source[i + low + span].value) {
                await swap(source, i + low, i + low + span, temp);
                times += 1;
            }

            await delay(SORT_DELAY_DURATION);

            source[i + low].color = CLEAR_COLOR;
            source[i + low + span].color = CLEAR_COLOR;
            callback({ times, datalist: source}); 
        }

        return times;
    }

}
