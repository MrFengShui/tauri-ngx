import { Injectable } from "@angular/core";
import { Observable } from "rxjs";

import { SortDataModel, SortStateModel, SortOrder } from "../ngrx-store/sort.state";
import { SORT_DELAY_DURATION, complete, delay, swap } from "../sort.utils";

@Injectable()
export class TopDownMergeSortService {

    private array: SortDataModel[] = Array.from([]);

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
        times = await this.sortByOrder(source, 0, source.length - 1, 'ascent', times, callback);
        await delay(SORT_DELAY_DURATION);
        await complete(source, times, callback);
    }

    private async sortByDescent(source: SortDataModel[], times: number, callback: (parram: SortStateModel) => void): Promise<void> {
        times = await this.sortByOrder(source, 0, source.length - 1, 'descent', times, callback);
        await delay(SORT_DELAY_DURATION);
        await complete(source, times, callback);
    }

    private async sortByOrder(source: SortDataModel[], lhs: number, rhs: number, order: SortOrder, times: number, callback: (parram: SortStateModel) => void): Promise<number> {
        if (lhs < rhs) {
            let mid: number = Math.floor((rhs - lhs) * 0.5 + lhs);
            times = await this.sortByOrder(source, lhs, mid, order, times, callback);
            times = await this.sortByOrder(source, mid + 1, rhs, order, times, callback);

            if (order === 'ascent') {
                times = await this.mergeByAscent(source, lhs, mid, rhs, times, callback);
            }
            
            if (order === 'descent') {
                times = await this.mergeByDescent(source, lhs, mid, rhs, times, callback);
            }
        }

        return times;
    }

    public async mergeByAscent(source: SortDataModel[], lhs: number, mid: number, rhs: number, times: number, callback: (parram: SortStateModel) => void): Promise<number> {
        let i: number = lhs, j: number = mid + 1;

        while (i <= mid && j <= rhs) {
            times += 1;

            source[i].color = 'lawngreen';
            source[j].color = 'orangered';
            callback({ completed: false, times, datalist: source });

            await delay(SORT_DELAY_DURATION);
            
            source[i].color = 'whitesmoke';
            source[j].color = 'whitesmoke';
            callback({ completed: false, times, datalist: source });

            if (source[i].value < source[j].value) {
                this.array.push(source[i]);
                i += 1;
            } else {
                this.array.push(source[j]);
                j += 1;
            }
        }

        while (i <= mid) {
            times += 1;

            source[i].color = 'lawngreen';
            callback({ completed: false, times, datalist: source });
            
            await delay(SORT_DELAY_DURATION);
            
            source[i].color = 'whitesmoke';
            callback({ completed: false, times, datalist: source });

            this.array.push(source[i]);
            i += 1;
        }

        while (j <= rhs) {
            times += 1;

            source[j].color = 'orangered';
            callback({ completed: false, times, datalist: source });
            
            await delay(SORT_DELAY_DURATION);
            
            source[j].color = 'whitesmoke';
            callback({ completed: false, times, datalist: source });

            this.array.push(source[j]);
            j += 1;
        }

        for (let k = 0; k < this.array.length; k++) {
            times += 1;

            source[lhs + k].color = 'dodgerblue';
            callback({ completed: false, times, datalist: source });

            await delay(SORT_DELAY_DURATION);
            
            source[lhs + k].color = 'whitesmoke';
            source[lhs + k] = this.array[k];
            callback({ completed: false, times, datalist: source });
        }

        this.array.splice(0);
        return times;
    }

    public async mergeByDescent(source: SortDataModel[], lhs: number, mid: number, rhs: number, times: number, callback: (parram: SortStateModel) => void): Promise<number> {
        let i: number = lhs, j: number = mid + 1;

        while (i <= mid && j <= rhs) {
            times += 1;

            source[i].color = 'lawngreen';
            source[j].color = 'orangered';
            callback({ completed: false, times, datalist: source });

            await delay(SORT_DELAY_DURATION);
            
            source[i].color = 'whitesmoke';
            source[j].color = 'whitesmoke';
            callback({ completed: false, times, datalist: source });

            if (source[i].value > source[j].value) {
                this.array.push(source[i]);
                i += 1;
            } else {
                this.array.push(source[j]);
                j += 1;
            }
        }

        while (i <= mid) {
            times += 1;

            source[i].color = 'lawngreen';
            callback({ completed: false, times, datalist: source });
            
            await delay(SORT_DELAY_DURATION);
            
            source[i].color = 'whitesmoke';
            callback({ completed: false, times, datalist: source });

            this.array.push(source[i]);
            i += 1;
        }

        while (j <= rhs) {
            times += 1;

            source[j].color = 'orangered';
            callback({ completed: false, times, datalist: source });
            
            await delay(SORT_DELAY_DURATION);
            
            source[j].color = 'whitesmoke';
            callback({ completed: false, times, datalist: source });

            this.array.push(source[j]);
            j += 1;
        }

        for (let k = 0; k < this.array.length; k++) {
            times += 1;

            source[lhs + k].color = 'dodgerblue';
            callback({ completed: false, times, datalist: source });

            await delay(SORT_DELAY_DURATION);

            source[lhs + k].color = 'whitesmoke';
            source[lhs + k] = this.array[k];
            callback({ completed: false, times, datalist: source });
        }

        this.array.splice(0);
        return times;
    }

}

@Injectable()
export class BottomUpMergeSortService {

    constructor(private _service: TopDownMergeSortService) {}

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
        let lhs: number, rhs: number, mid: number;

        for (let i = 1; i < source.length; i = i + i) {
            for (let j = 0; j < source.length - i; j += i + i) {
                lhs = j;
                rhs = Math.min(j + i + i - 1, source.length - 1);
                mid = Math.floor((rhs - lhs) * 0.5 + lhs);
                times = await this._service.mergeByAscent(source, lhs, mid, rhs, times, callback );
            }
        }

        await delay(SORT_DELAY_DURATION);
        await complete(source, times, callback);
    }

    private async sortByDescent(source: SortDataModel[], times: number, callback: (parram: SortStateModel) => void): Promise<void> {
        let lhs: number, rhs: number, mid: number;

        for (let i = 1; i < source.length; i = i + i) {
            for (let j = 0; j < source.length - i; j += i + i) {
                lhs = j;
                rhs = Math.min(j + i + i - 1, source.length - 1);
                mid = Math.floor((rhs - lhs) * 0.5 + lhs);
                times = await this._service.mergeByDescent(source, lhs, mid, rhs, times, callback );
            }
        }

        await delay(SORT_DELAY_DURATION);
        await complete(source, times, callback);
    }

}

@Injectable()
export class InPlaceMergeSortService {

    public sort(array: SortDataModel[], order: SortOrder): Observable<SortStateModel> {
        return new Observable(subscriber => {
            let temp: SortDataModel = { value: 0, color: 'whitesmoke' };

            if (order === 'ascent') {
                this.sortByAscent(array, 0, array.length - 1, temp, 0, param => subscriber.next(param)).then(() => subscriber.complete());
            }
    
            if (order === 'descent') {
                this.sortByDescent(array, 0, array.length - 1, temp, 0, param => subscriber.next(param)).then(() => subscriber.complete());
            }
        });
    }

    private async sortByAscent(source: SortDataModel[], lhs: number, rhs: number, temp: SortDataModel, times: number, callback: (param: SortStateModel) => void): Promise<void> {
        times = await this.sortByOrder(source, lhs, rhs, 'ascent', temp, times, callback);
        await delay(SORT_DELAY_DURATION);
        await complete(source, times, callback);
    }

    private async sortByDescent(source: SortDataModel[], lhs: number, rhs: number, temp: SortDataModel, times: number, callback: (parram: SortStateModel) => void): Promise<void> {
        times = await this.sortByOrder(source, lhs, rhs, 'descent', temp, times, callback);
        await delay(SORT_DELAY_DURATION);
        await complete(source, times, callback);
    }

    private async sortByOrder(source: SortDataModel[], lhs: number, rhs: number, order: SortOrder, temp: SortDataModel, times: number, callback: (parram: SortStateModel) => void): Promise<number> {
        if (lhs < rhs) {
            const mid: number = Math.floor((rhs - lhs) * 0.5 + lhs);
            times = await this.sortByOrder(source, lhs, mid, order, temp, times, callback);
            times = await this.sortByOrder(source, mid + 1, rhs, order, temp, times, callback);

            if (order === 'ascent') {
                times = await this.mergeByAscent(source, lhs, mid, rhs, temp, times, callback);
            }
            
            if (order === 'descent') {
                times = await this.mergeByDescent(source, lhs, mid, rhs, temp, times, callback);
            }
        }

        return times;
    }

    private async mergeByAscent(source: SortDataModel[], lhs: number, mid: number, rhs: number, temp: SortDataModel, times: number, callback: (parram: SortStateModel) => void): Promise<number> {
        let i: number = lhs, j: number = mid + 1;

        while (i <= mid && j <= rhs) {
            times += 1;

            source[i].color = 'steelblue';
            source[j].color = 'firebrick';
            callback({ completed: false, times, datalist: source });

            await delay(SORT_DELAY_DURATION);
            
            if (source[i].value < source[j].value) {
                source[i].color = 'whitesmoke';
                callback({ completed: false, times, datalist: source });

                i += 1;
            } else {
                for (let k = j; k > i; k--) {
                    source[k].color = 'lawngreen';
                    source[k - 1].color = 'orangered';
                    callback({ completed: false, times, datalist: source });

                    await swap(source, k, k - 1, temp);
                    await delay(SORT_DELAY_DURATION);

                    source[k].color = 'whitesmoke';
                    source[k - 1].color = 'whitesmoke';
                    callback({ completed: false, times, datalist: source });
                }

                source[i].color = 'whitesmoke';
                source[j].color = 'whitesmoke';
                callback({ completed: false, times, datalist: source });

                i += 1;
                j += 1;
                mid += 1;
            }
        }

        await delay(SORT_DELAY_DURATION);

        source[rhs].color = 'whitesmoke';
        callback({ completed: false, times, datalist: source });

        return times;
    }

    private async mergeByDescent(source: SortDataModel[], lhs: number, mid: number, rhs: number, temp: SortDataModel, times: number, callback: (parram: SortStateModel) => void): Promise<number> {
        let i: number = lhs, j: number = mid + 1;

        while (i <= mid && j <= rhs) {
            times += 1;

            source[i].color = 'steelblue';
            source[j].color = 'firebrick';
            callback({ completed: false, times, datalist: source });

            await delay(SORT_DELAY_DURATION);
            
            if (source[i].value > source[j].value) {
                source[i].color = 'whitesmoke';
                callback({ completed: false, times, datalist: source });

                i += 1;
            } else {
                for (let k = j; k > i; k--) {
                    source[k].color = 'lawngreen';
                    source[k - 1].color = 'orangered';
                    callback({ completed: false, times, datalist: source });

                    await swap(source, k, k - 1, temp);
                    await delay(SORT_DELAY_DURATION);

                    source[k].color = 'whitesmoke';
                    source[k - 1].color = 'whitesmoke';
                    callback({ completed: false, times, datalist: source });
                }

                source[i].color = 'whitesmoke';
                source[j].color = 'whitesmoke';
                callback({ completed: false, times, datalist: source });

                i += 1;
                j += 1;
                mid += 1;
            }
        }

        await delay(SORT_DELAY_DURATION);

        source[rhs].color = 'whitesmoke';
        callback({ completed: false, times, datalist: source });
        
        return times;
    }

}

@Injectable()
export class FourWayMergeSortService {

    private group: { [key: string | number]: SortDataModel[] } = { 0: [], 1: [], 2: [], 3: [] };
    private final: { [key: string | number]: SortDataModel | null } = { 0: null, 1: null, 2: null, 3: null };
    private pivot: { [key: string | number]: number } = { 0: -1, 1: -1, 2: -1, 3: -1 };

    public sort(array: SortDataModel[], order: SortOrder): Observable<SortStateModel> {
        return new Observable(subscriber => {
            if (order === 'ascent') {
                this.sortByAscent(array, 0, array.length - 1, 0, param => subscriber.next(param)).then(() => subscriber.complete());
            }
    
            if (order === 'descent') {
                this.sortByDescent(array, 0, array.length - 1, 0, param => subscriber.next(param)).then(() => subscriber.complete());
            }
        });
    }

    private async sortByAscent(source: SortDataModel[], lhs: number, rhs: number, times: number, callback: (param: SortStateModel) => void): Promise<void> {
        times = await this.sortByOrder(source, lhs, rhs, 'ascent', times, callback);
        await delay(SORT_DELAY_DURATION);
        await complete(source, times, callback);
    }

    private async sortByDescent(source: SortDataModel[], lhs: number, rhs: number, times: number, callback: (param: SortStateModel) => void): Promise<void> {
        times = await this.sortByOrder(source, lhs, rhs, 'descent', times, callback);
        await delay(SORT_DELAY_DURATION);
        await complete(source, times, callback);
    }

    private async sortByOrder(source: SortDataModel[], lhs: number, rhs: number, order: SortOrder, times: number, callback: (param: SortStateModel) => void): Promise<number> {
        if (rhs - lhs >= 3) {
            const fst: number = Math.floor((rhs - lhs) * 0.25 + lhs);
            const mid: number = Math.floor((rhs - lhs) * 0.5 + lhs);
            const snd: number = Math.floor((rhs - lhs) * 0.75 + lhs);
            times = await this.sortByOrder(source, lhs, fst, order, times, callback);
            times = await this.sortByOrder(source, fst + 1, mid, order, times, callback);
            times = await this.sortByOrder(source, mid + 1, snd, order, times, callback);
            times = await this.sortByOrder(source, snd + 1, rhs, order, times, callback);

            if (order === 'ascent') {
                times = await this.mergeByAscent(source, lhs, fst, mid, snd, rhs, times, callback);
            }
            
            if (order === 'descent') {
                times = await this.mergeByDescent(source, lhs, fst, mid, snd, rhs, times, callback);
            }
        }
        
        return times;
    }

    private async mergeByAscent(source: SortDataModel[], lhs: number, fst: number, mid: number, snd: number, rhs: number, times: number, callback: (parram: SortStateModel) => void): Promise<number> {
        let array: SortDataModel[] = Array.from([]), target: SortDataModel, index: number, start: number, end: number, color: string;
        
        for (let key of Object.keys(this.group)) {
            if (key === '1') {
                start = fst + 1;
                end = mid;
                color = 'orangered';
            } else if (key === '2') {
                start = mid + 1;
                end = snd;
                color = 'steelblue';
            } else if (key === '3') {
                start = snd + 1;
                end = rhs;
                color = 'firebrick';
            } else {
                start = lhs;
                end = fst;
                color = 'lawngreen';
            }

            for (let i = start; i <= end; i++) {
                times += 1;
    
                source[i].color = color;
                callback({ completed: false, times, datalist: source });
    
                await delay(SORT_DELAY_DURATION);
                
                source[i].color = 'whitesmoke';
                callback({ completed: false, times, datalist: source });
    
                this.group[3].push(source[i]);
            }
        }
        
        while (array.length < (rhs - lhs + 1)) {
            for (let key of Object.keys(this.group)) {
                index = await this.findMinInGroup(this.group[key]);
                this.final[key] = index === -1 ? { color: '', value: Number.MAX_SAFE_INTEGER } : this.group[key][index];
                this.pivot[key] = index;
            }
    
            index = this.findMinInFinal(this.final);
            target = this.group[index].splice(this.pivot[index], 1)[0];
            array.push(target);
        }

        for (let i = 0; i < array.length; i++) {
            times += 1;

            source[lhs + i].color = 'dodgerblue';
            callback({ completed: false, times, datalist: source });

            await delay(SORT_DELAY_DURATION);
            
            source[lhs + i].color = 'whitesmoke';
            source[lhs + i] = array[i];
            callback({ completed: false, times, datalist: source });
        }
        
        for (let key of Object.keys(this.group)) {
            this.group[key].length = 0;
            this.final[key] = null;
            this.pivot[key] = -1;
        }

        return times;
    }

    private async mergeByDescent(source: SortDataModel[], lhs: number, fst: number, mid: number, snd: number, rhs: number, times: number, callback: (parram: SortStateModel) => void): Promise<number> {
        let array: SortDataModel[] = Array.from([]), target: SortDataModel, index: number, start: number, end: number, color: string;
        
        for (let key of Object.keys(this.group)) {
            if (key === '1') {
                start = fst + 1;
                end = mid;
                color = 'orangered';
            } else if (key === '2') {
                start = mid + 1;
                end = snd;
                color = 'steelblue';
            } else if (key === '3') {
                start = snd + 1;
                end = rhs;
                color = 'firebrick';
            } else {
                start = lhs;
                end = fst;
                color = 'lawngreen';
            }

            for (let i = start; i <= end; i++) {
                times += 1;
    
                source[i].color = color;
                callback({ completed: false, times, datalist: source });
    
                await delay(SORT_DELAY_DURATION);
                
                source[i].color = 'whitesmoke';
                callback({ completed: false, times, datalist: source });
    
                this.group[3].push(source[i]);
            }
        }
        
        while (array.length < (rhs - lhs + 1)) {
            for (let key of Object.keys(this.group)) {
                index = await this.findMaxInGroup(this.group[key]);
                this.final[key] = index === -1 ? { color: '', value: Number.MIN_SAFE_INTEGER } : this.group[key][index];
                this.pivot[key] = index;
            }
    
            index = this.findMaxInFinal(this.final);
            target = this.group[index].splice(this.pivot[index], 1)[0];
            array.push(target);
        }

        for (let i = 0; i < array.length; i++) {
            times += 1;

            source[lhs + i].color = 'dodgerblue';
            callback({ completed: false, times, datalist: source });

            await delay(SORT_DELAY_DURATION);
            
            source[lhs + i].color = 'whitesmoke';
            source[lhs + i] = array[i];
            callback({ completed: false, times, datalist: source });
        }
        
        for (let key of Object.keys(this.group)) {
            this.group[key].length = 0;
            this.final[key] = null;
            this.pivot[key] = -1;
        }

        return times;
    }

    private async findMinInGroup(list: SortDataModel[]): Promise<number> {
        let index: number = -1, value: number = Number.MAX_SAFE_INTEGER;

        for (let i = 0; i < list.length; i++) {
            if (list[i].value < value) {
                index = i;
                value = list[i].value;
            }
        }

        return index;
    }

    private async findMaxInGroup(list: SortDataModel[]): Promise<number> {
        let index: number = -1, value: number = Number.MIN_SAFE_INTEGER;

        for (let i = 0; i < list.length; i++) {
            if (list[i].value > value) {
                index = i;
                value = list[i].value;
            }
        }

        return index;
    }

    private findMinInFinal(dict: { [key: string | number]: SortDataModel | null }): number{
        let fst: number = (dict[0]?.value as number) < (dict[1]?.value as number) ? 0 : 1;
        let snd: number = (dict[2]?.value as number) < (dict[3]?.value as number) ? 2 : 3;
        return (dict[fst]?.value as number) < (dict[snd]?.value as number) ? fst : snd;
    }

    private findMaxInFinal(dict: { [key: string | number]: SortDataModel | null }): number{
        let fst: number = (dict[0]?.value as number) > (dict[1]?.value as number) ? 0 : 1;
        let snd: number = (dict[2]?.value as number) > (dict[3]?.value as number) ? 2 : 3;
        return (dict[fst]?.value as number) > (dict[snd]?.value as number) ? fst : snd;
    }

}