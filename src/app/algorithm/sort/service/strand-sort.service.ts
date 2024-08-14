import { Injectable } from "@angular/core";
import { Observable } from "rxjs";

import { SortDataModel, SortOrder, SortStateModel } from "../ngrx-store/sort.state";
import { delay } from "../../../public/global.utils";
import { SortToolsService } from "../ngrx-store/sort.service";
import { ACCENT_ONE_COLOR, CLEAR_COLOR, ACCENT_TWO_COLOR, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR } from "../../../public/global.utils";

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

            for (let i = 0, length = oldUnsorted.length; i < length; i++) {
                times += 1;
                
                source[i].color = ACCENT_ONE_COLOR;
                callback({ times, datalist: source });
    
                await delay();
    
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

        await delay();
        // await complete(source, times, callback);
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

            for (let i = 0, length = oldUnsorted.length; i < length; i++) {
                times += 1;
                
                source[i].color = ACCENT_ONE_COLOR;
                callback({ times, datalist: source });
    
                await delay();
    
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

        await delay();
        // await complete(source, times, callback);
    }

    public async merge(source: SortDataModel[], newUnsorted: number[], newSorted: number[], oldSorted: number[], times: number, callback: (param: SortStateModel) => void): Promise<[number, number, number]> {
        let index: number = 0, fst: number, snd: number;

        for (let i = 0, length = newUnsorted.length; i < length; i++) {
            times += 1;

            source[index].value = newUnsorted[i];
            source[index].color = ACCENT_TWO_COLOR;
            callback({ times, datalist: source });

            await delay();

            source[index].color = CLEAR_COLOR;
            callback({ times, datalist: source });

            index += 1;
        }

        fst = index;
        await delay();

        for (let i = 0, length = newSorted.length; i < length; i++) {
            times += 1;

            source[index].value = newSorted[i];
            source[index].color = ACCENT_TWO_COLOR;
            callback({ times, datalist: source });

            await delay();

            source[index].color = CLEAR_COLOR;
            callback({ times, datalist: source });

            index += 1;
        }

        snd = index;
        await delay();

        for (let i = 0, length = oldSorted.length; i < length; i++) {
            times += 1;

            source[index].value = oldSorted[i];
            source[index].color = ACCENT_TWO_COLOR;
            callback({ times, datalist: source });

            await delay();

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

            await delay();

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

            await delay();

            source[i].color = CLEAR_COLOR;
            callback({ times, datalist: source });

            array.push(source[i].value);
            i += 1;
        }

        while (j <= rhs) {
            source[j].color = SECONDARY_COLOR;
            callback({ times, datalist: source });

            await delay();

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

            await delay();

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

            await delay();

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

            await delay();

            source[i].color = CLEAR_COLOR;
            callback({ times, datalist: source });

            array.push(source[i].value);
            i += 1;
        }

        while (j <= rhs) {
            source[j].color = SECONDARY_COLOR;
            callback({ times, datalist: source });

            await delay();

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

            await delay();

            source[k + lhs].color = CLEAR_COLOR;
            callback({ times, datalist: source });
        }

        return times;
    }

}

/**
 * 股排序（优化）
 */
@Injectable()
export class OptimalStrandSortService {

    constructor(
        private _sortService: StrandSortService,
        private _toolsService: SortToolsService
    ) {}

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
        let fst: number, snd: number, length: number = oldUnsorted.length, temp: number;
        
        while (length > 0) {
            if (newUnsorted.length > 0) {
                newUnsorted.splice(0);
            }

            if (newSorted.length > 0) {
                newSorted.splice(0);
            }

            if (oldUnsorted[0] > oldUnsorted[length - 1]) {
                temp = oldUnsorted[0];
                oldUnsorted[0] = oldUnsorted[length - 1];
                oldUnsorted[length - 1] = temp;
            }

            for (let i = 0; i < length; i++) {
                times += 1;
                
                source[i].color = ACCENT_ONE_COLOR;
                callback({ times, datalist: source });
    
                await delay();
    
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
            
            [times, fst, snd] = await this._sortService.merge(source, newUnsorted, newSorted, oldSorted, times, callback);
            times = await this.mergeByAscent(source, fst, snd, times, callback);
            
            oldUnsorted.splice(0);
            newUnsorted.forEach(item => oldUnsorted.push(item));
            length = oldUnsorted.length;
        }

        await delay();
        // await complete(source, times, callback);
    }

    private async sortByDescent(source: SortDataModel[], times: number, callback: (parram: SortStateModel) => void): Promise<void> {
        const oldUnsorted: number[] = source.map(item => item.value), oldSorted: number[] = Array.from([]);
        const newUnsorted: number[] = Array.from([]), newSorted: number[] = Array.from([]);
        let fst: number, snd: number, length: number = oldUnsorted.length, temp: number;
        
        while (oldUnsorted.length > 0) {
            if (newUnsorted.length > 0) {
                newUnsorted.splice(0);
            }

            if (newSorted.length > 0) {
                newSorted.splice(0);
            }

            if (oldUnsorted[0] < oldUnsorted[length - 1]) {
                temp = oldUnsorted[0];
                oldUnsorted[0] = oldUnsorted[length - 1];
                oldUnsorted[length - 1] = temp;
            }

            for (let i = 0; i < oldUnsorted.length; i++) {
                times += 1;
                
                source[i].color = ACCENT_ONE_COLOR;
                callback({ times, datalist: source });
    
                await delay();
    
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
            
            [times, fst, snd] = await this._sortService.merge(source, newUnsorted, newSorted, oldSorted, times, callback);
            times = await this.mergeByDescent(source, fst, snd, times, callback);
            
            oldUnsorted.splice(0);
            newUnsorted.forEach(item => oldUnsorted.push(item));
            length = oldUnsorted.length;
        }

        await delay();
        // await complete(source, times, callback);
    }

    private async mergeByAscent(source: SortDataModel[], fst: number, snd: number, times: number, callback: (param: SortStateModel) => void): Promise<number> {
        const lhs: number = fst, mid: number = snd - 1;
        let rhs: number = this._toolsService.indexOfFGTByAscent(source, source[mid], snd, source.length - 1);
        let i: number = fst, j: number = snd;
        const array: number[] = Array.from([]);
        
        if (rhs === -1) {
            rhs = source.length - 1;
        }

        while (i <= mid && j <= rhs) {
            source[i].color = PRIMARY_COLOR;
            source[j].color = SECONDARY_COLOR;
            callback({ times, datalist: source });

            await delay();

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

            await delay();

            source[i].color = CLEAR_COLOR;
            callback({ times, datalist: source });

            array.push(source[i].value);
            i += 1;
        }

        while (j <= rhs) {
            source[j].color = SECONDARY_COLOR;
            callback({ times, datalist: source });

            await delay();

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

            await delay();

            source[k + lhs].color = CLEAR_COLOR;
            callback({ times, datalist: source });
        }

        return times;
    }

    private async mergeByDescent(source: SortDataModel[], fst: number, snd: number, times: number, callback: (param: SortStateModel) => void): Promise<number> {
        const lhs: number = fst, mid: number = snd - 1;
        let rhs: number = this._toolsService.indexOfFLT(source, source[mid], snd, source.length - 1);
        let i: number = fst, j: number = snd;
        const array: number[] = Array.from([]);
        
        if (rhs === -1) {
            rhs = source.length - 1;
        }

        while (i <= mid && j <= rhs) {
            source[i].color = PRIMARY_COLOR;
            source[j].color = SECONDARY_COLOR;
            callback({ times, datalist: source });

            await delay();

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

            await delay();

            source[i].color = CLEAR_COLOR;
            callback({ times, datalist: source });

            array.push(source[i].value);
            i += 1;
        }

        while (j <= rhs) {
            source[j].color = SECONDARY_COLOR;
            callback({ times, datalist: source });

            await delay();

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

            await delay();

            source[k + lhs].color = CLEAR_COLOR;
            callback({ times, datalist: source });
        }

        return times;
    }

}
