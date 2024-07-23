import { Injectable } from "@angular/core";
import { Observable } from "rxjs";

import { SortDataModel, SortStateModel, SortOrder } from "../ngrx-store/sort.state";
import { SORT_DELAY_DURATION, complete, delay, swap } from "../sort.utils";
import { SortToolsService } from "../ngrx-store/sort.service";
import { CLEAR_COLOR, ACCENT_COLOR, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_ONE_COLOR, ACCENT_TWO_COLOR, PRIMARY_ONE_COLOR, SECONDARY_ONE_COLOR, PRIMARY_TWO_COLOR, SECONDARY_TWO_COLOR } from "../../../public/values.utils";

const THRESHOLD: number = 16;
/**
 * 单路快速排序（递归）
 */
@Injectable()
export class RecursiveQuickSortService {

    constructor(private _service: SortToolsService) {}

    public sort(array: SortDataModel[], order: SortOrder): Observable<SortStateModel> {
        return new Observable(subscriber => {
            const temp: SortDataModel = { value: 0, color: CLEAR_COLOR };

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

    private async sortByDescent(source: SortDataModel[], lhs: number, rhs: number, temp: SortDataModel, times: number, callback: (param: SortStateModel) => void): Promise<void> {
        times = await this.sortByOrder(source, lhs, rhs, temp, 'descent', times, callback);
        await delay(SORT_DELAY_DURATION);
        await complete(source, times, callback);
    }

    private async sortByOrder(source: SortDataModel[], lhs: number, rhs: number, temp: SortDataModel, order: SortOrder, times: number, callback: (param: SortStateModel) => void): Promise<number> {
        let mid: number = -1;

        if (lhs < rhs) {
            if (order === 'ascent') {
                [times, mid] = await this.partitionByAscent(source, lhs, rhs, temp, times, callback);
            }

            if (order === 'descent') {
                [times, mid] = await this.partitionByDescent(source, lhs, rhs, temp, times, callback);
            }
            
            times = await this.sortByOrder(source, lhs, mid - 1, temp, order, times, callback);
            times = await this.sortByOrder(source, mid + 1, rhs, temp, order, times, callback);
        }

        return times;
    }

    public async partitionByAscent(source: SortDataModel[], lhs: number, rhs: number, temp: SortDataModel, times: number, callback: (param: SortStateModel) => void): Promise<[number, number]> {
        if (rhs - lhs < THRESHOLD) {
            times = await this._service.stableSortByAscent(source, lhs, rhs, temp, times, callback);
            return [times, rhs];
        } else {
            const pivot: number = rhs;
            let i: number = lhs - 1;
            source[pivot].color = ACCENT_COLOR;

            for (let j = lhs; j < rhs; j++) {
                source[j].color = PRIMARY_COLOR;
                callback({ times, datalist: source});

                if (source[j].value < source[pivot].value) {
                    i += 1;
                    source[i].color = SECONDARY_COLOR;
                    callback({ times, datalist: source});
                    
                    times += 1;
                    await swap(source, i, j, temp);
                }

                await delay(SORT_DELAY_DURATION);
                
                if (i > -1) {
                    source[i].color = CLEAR_COLOR;
                }

                source[j].color = CLEAR_COLOR;
                callback({ times, datalist: source});
            }

            await delay(SORT_DELAY_DURATION);
            await swap(source, i + 1, pivot, temp);

            source[i + 1].color = CLEAR_COLOR;
            callback({ times, datalist: source});
            return [times, i + 1];
        }
    }

    public async partitionByDescent(source: SortDataModel[], lhs: number, rhs: number, temp: SortDataModel, times: number, callback: (param: SortStateModel) => void): Promise<[number, number]> {
        if (rhs - lhs < THRESHOLD) {
            times = await this._service.stableSortByDescent(source, lhs, rhs, temp, times, callback);
            return [times, rhs];
        } else {
            const pivot: number = rhs;
            let i: number = lhs - 1;
            source[pivot].color = ACCENT_COLOR;
    
            for (let j = lhs; j < rhs; j++) {
                source[j].color = PRIMARY_COLOR;
                callback({ times, datalist: source});
    
                if (source[j].value > source[pivot].value) {
                    i += 1;
                    source[i].color = SECONDARY_COLOR;
                    callback({ times, datalist: source});
    
                    times += 1;
                    await swap(source, i, j, temp);
                }
    
                await delay(SORT_DELAY_DURATION);
                
                if (i > -1) {
                    source[i].color = CLEAR_COLOR;
                }
    
                source[j].color = CLEAR_COLOR;
                callback({ times, datalist: source});
            }
    
            await delay(SORT_DELAY_DURATION);
            await swap(source, i + 1, pivot, temp);
    
            source[i + 1].color = CLEAR_COLOR;
            callback({ times, datalist: source});
            return [times, i + 1];
        }
    }

}

/**
 * 单路快速排序（迭代）
 */
@Injectable()
export class IterativeQuickSortService {

    private stack: number[] = Array.from([]);

    constructor(
        private _sortService: RecursiveQuickSortService,
        private _toolsService: SortToolsService
    ) {}

    public sort(array: SortDataModel[], order: SortOrder): Observable<SortStateModel> {
        return new Observable(subscriber => {
            const temp: SortDataModel = { value: 0, color: CLEAR_COLOR };

            if (order === 'ascent') {
                this.sortByAscent(array, 0, array.length - 1, temp, 0, param => subscriber.next(param)).then(() => subscriber.complete());
            }
    
            if (order === 'descent') {
                this.sortByDescent(array, 0, array.length - 1, temp, 0, param => subscriber.next(param)).then(() => subscriber.complete());
            }
        });
    }

    private async sortByAscent(source: SortDataModel[], lhs: number, rhs: number, temp: SortDataModel, times: number, callback: (param: SortStateModel) => void): Promise<void> {
        let mid: number;

        this.stack.push(rhs);
        this.stack.push(lhs);
        
        while (this.stack.length > 0) {
            lhs = this.stack.pop() as number;
            rhs = this.stack.pop() as number;
            
            if (rhs - lhs < THRESHOLD) {
                times = await this._toolsService.stableSortByAscent(source, lhs, rhs, temp, times, callback);
            } else {
                [times, mid] = await this._sortService.partitionByAscent(source, lhs, rhs, temp, times, callback);

                if (mid + 1 < rhs) {
                    this.stack.push(rhs);
                    this.stack.push(mid + 1);
                }
    
                if (lhs < mid - 1) {
                    this.stack.push(mid - 1);
                    this.stack.push(lhs);
                }
            }
            
            source[lhs].color = PRIMARY_COLOR;
            source[rhs].color = SECONDARY_COLOR;
            callback({ times, datalist: source });

            await delay(SORT_DELAY_DURATION);

            source[lhs].color = CLEAR_COLOR;
            source[rhs].color = CLEAR_COLOR;
            callback({ times, datalist: source });
        }

        await delay(SORT_DELAY_DURATION);
        await complete(source, times, callback);
        this.stack.splice(0);
    }

    private async sortByDescent(source: SortDataModel[], lhs: number, rhs: number, temp: SortDataModel, times: number, callback: (param: SortStateModel) => void): Promise<void> {
        let mid: number;

        this.stack.push(rhs);
        this.stack.push(lhs);

        while (this.stack.length > 0) {
            lhs = this.stack.pop() as number;
            rhs = this.stack.pop() as number;

            if (rhs - lhs < THRESHOLD) {
                times = await this._toolsService.stableSortByDescent(source, lhs, rhs, temp, times, callback);
            } else {
                [times, mid] = await this._sortService.partitionByDescent(source, lhs, rhs, temp, times, callback);

                if (mid + 1 < rhs) {
                    this.stack.push(rhs);
                    this.stack.push(mid + 1);
                }
    
                if (lhs < mid - 1) {
                    this.stack.push(mid - 1);
                    this.stack.push(lhs);
                }
            }
            
            source[lhs].color = PRIMARY_COLOR;
            source[rhs].color = SECONDARY_COLOR;
            callback({ times, datalist: source });

            await delay(SORT_DELAY_DURATION);

            source[lhs].color = CLEAR_COLOR;
            source[rhs].color = CLEAR_COLOR;
            callback({ times, datalist: source });
        }

        await delay(SORT_DELAY_DURATION);
        await complete(source, times, callback);
        this.stack.splice(0);
    }

}

/**
 * 二路快速排序（递归）
 */
@Injectable()
export class TwoWayRecursiveQuickSortService {

    constructor(private _service: SortToolsService) {}

    public sort(array: SortDataModel[], order: SortOrder): Observable<SortStateModel> {
        return new Observable(subscriber => {
            const temp: SortDataModel = { value: 0, color: CLEAR_COLOR };

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

    private async sortByDescent(source: SortDataModel[], lhs: number, rhs: number, temp: SortDataModel, times: number, callback: (param: SortStateModel) => void): Promise<void> {
        times = await this.sortByOrder(source, lhs, rhs, temp, 'descent', times, callback);
        await delay(SORT_DELAY_DURATION);
        await complete(source, times, callback);
    }

    private async sortByOrder(source: SortDataModel[], lhs: number, rhs: number, temp: SortDataModel, order: SortOrder, times: number, callback: (param: SortStateModel) => void): Promise<number> {
        let mid: number = -1;

        if (lhs < rhs) {
            if (order === 'ascent') {
                [times, mid] = await this.partitionByAscent(source, lhs, rhs, temp, times, callback);
            }

            if (order === 'descent') {
                [times, mid] = await this.partitionByDescent(source, lhs, rhs, temp, times, callback);
            }
            
            times = await this.sortByOrder(source, lhs, mid - 1, temp, order, times, callback);
            times = await this.sortByOrder(source, mid + 1, rhs, temp, order, times, callback);
        }

        return times;
    }

    public async partitionByAscent(source: SortDataModel[], lhs: number, rhs: number, temp: SortDataModel, times: number, callback: (param: SortStateModel) => void): Promise<[number, number]> {
        if (rhs - lhs < THRESHOLD) {
            times = await this._service.stableSortByAscent(source, lhs, rhs, temp, times, callback);
            return [times, rhs];
        } else {
            const pivot: number = rhs;
            let i: number = lhs, j: number = rhs;
            
            while (i < j) {
                source[pivot].color = ACCENT_COLOR;

                while (i < j && source[i].value <= source[pivot].value) {
                    source[i].color = PRIMARY_COLOR;
                    callback({ times, datalist: source});

                    await delay(SORT_DELAY_DURATION);

                    source[i].color = CLEAR_COLOR;
                    callback({ times, datalist: source});

                    i += 1;
                }

                while (i < j && source[j].value >= source[pivot].value) {
                    source[j].color = SECONDARY_COLOR;
                    callback({ times, datalist: source});

                    await delay(SORT_DELAY_DURATION);

                    source[j].color = CLEAR_COLOR;
                    callback({ times, datalist: source});
                    
                    j -= 1;
                }

                await delay(SORT_DELAY_DURATION);
                await swap(source, i, j, temp);
                times += 1;

                source[pivot].color = CLEAR_COLOR;
                source[i].color = CLEAR_COLOR;
                source[j].color = CLEAR_COLOR;
                callback({ times, datalist: source});
            }

            await delay(SORT_DELAY_DURATION);
            await swap(source, i, pivot, temp);
            
            source[i].color = CLEAR_COLOR;
            callback({ times, datalist: source});
            return [times, i];
        }
    }

    public async partitionByDescent(source: SortDataModel[], lhs: number, rhs: number, temp: SortDataModel, times: number, callback: (param: SortStateModel) => void): Promise<[number, number]> {
        if (rhs - lhs < THRESHOLD) {
            times = await this._service.stableSortByDescent(source, lhs, rhs, temp, times, callback);
            return [times, rhs];
        } else {
            const pivot: number = rhs;
            let i: number = lhs, j: number = rhs;
            
            while (i < j) {
                source[pivot].color = ACCENT_COLOR;
    
                while (i < j && source[i].value >= source[pivot].value) {
                    source[i].color = PRIMARY_COLOR;
                    callback({ times, datalist: source});
    
                    await delay(SORT_DELAY_DURATION);
    
                    source[i].color = CLEAR_COLOR;
                    callback({ times, datalist: source});
    
                    i += 1;
                }
    
                while (i < j && source[j].value <= source[pivot].value) {
                    source[j].color = SECONDARY_COLOR;
                    callback({ times, datalist: source});
    
                    await delay(SORT_DELAY_DURATION);
    
                    source[j].color = CLEAR_COLOR;
                    callback({ times, datalist: source});
                    
                    j -= 1;
                }
    
                await delay(SORT_DELAY_DURATION);
                await swap(source, i, j, temp);
                times += 1;
                
                source[pivot].color = CLEAR_COLOR;
                source[i].color = CLEAR_COLOR;
                source[j].color = CLEAR_COLOR;
                callback({ times, datalist: source});
            }
    
            await delay(SORT_DELAY_DURATION);
            await swap(source, i, pivot, temp);
    
            source[i].color = CLEAR_COLOR;     
            callback({ times, datalist: source});
            return [times, i];
        }
    }

}

/**
 * 二路快速排序（迭代）
 */
@Injectable()
export class TwoWayIterativeQuickSortService {

    private stack: number[] = Array.from([]);

    constructor(private _service: TwoWayRecursiveQuickSortService) {}

    public sort(array: SortDataModel[], order: SortOrder): Observable<SortStateModel> {
        return new Observable(subscriber => {
            const temp: SortDataModel = { value: 0, color: CLEAR_COLOR };

            if (order === 'ascent') {
                this.sortByAscent(array, 0, array.length - 1, temp, 0, param => subscriber.next(param)).then(() => subscriber.complete());
            }
    
            if (order === 'descent') {
                this.sortByDescent(array, 0, array.length - 1, temp, 0, param => subscriber.next(param)).then(() => subscriber.complete());
            }
        });
    }

    private async sortByAscent(source: SortDataModel[], lhs: number, rhs: number, temp: SortDataModel, times: number, callback: (param: SortStateModel) => void): Promise<void> {
        let mid: number;

        this.stack.push(rhs);
        this.stack.push(lhs);

        while (this.stack.length > 0) {
            lhs = this.stack.pop() as number;
            rhs = this.stack.pop() as number;

            [times, mid] = await this._service.partitionByAscent(source, lhs, rhs, temp, times, callback);

            if (mid + 1 < rhs) {
                this.stack.push(rhs);
                this.stack.push(mid + 1);
            }

            if (lhs < mid - 1) { 
                this.stack.push(mid - 1);
                this.stack.push(lhs);
            }

            source[lhs].color = PRIMARY_COLOR;
            source[rhs].color = SECONDARY_COLOR;
            callback({ times, datalist: source });

            await delay(SORT_DELAY_DURATION);

            source[lhs].color = CLEAR_COLOR;
            source[rhs].color = CLEAR_COLOR;
            callback({ times, datalist: source });
        }

        await delay(SORT_DELAY_DURATION);
        await complete(source, times, callback);
    }

    private async sortByDescent(source: SortDataModel[], lhs: number, rhs: number, temp: SortDataModel, times: number, callback: (param: SortStateModel) => void): Promise<void> {
        let mid: number;

        this.stack.push(rhs);
        this.stack.push(lhs);

        while (this.stack.length > 0) {
            lhs = this.stack.pop() as number;
            rhs = this.stack.pop() as number;

            [times, mid] = await this._service.partitionByDescent(source, lhs, rhs, temp, times, callback);

            if (mid + 1 < rhs) {
                this.stack.push(rhs);
                this.stack.push(mid + 1);
            }

            if (lhs < mid - 1) { 
                this.stack.push(mid - 1);
                this.stack.push(lhs);
            }

            source[lhs].color = PRIMARY_COLOR;
            source[rhs].color = SECONDARY_COLOR;
            callback({ times, datalist: source });

            await delay(SORT_DELAY_DURATION);

            source[lhs].color = CLEAR_COLOR;
            source[rhs].color = CLEAR_COLOR;
            callback({ times, datalist: source });
        }

        await delay(SORT_DELAY_DURATION);
        await complete(source, times, callback);
    }

}

/**
 * 三路快速排序（递归）
 */
@Injectable()
export class ThreeWayRecursiveQuickSortService {

    public sort(array: SortDataModel[], order: SortOrder): Observable<SortStateModel> {
        return new Observable(subscriber => {
            const temp: SortDataModel = { value: 0, color: CLEAR_COLOR };

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

    private async sortByDescent(source: SortDataModel[], lhs: number, rhs: number, temp: SortDataModel, times: number, callback: (param: SortStateModel) => void): Promise<void> {
        times = await this.sortByOrder(source, lhs, rhs, temp, 'descent', times, callback);
        await delay(SORT_DELAY_DURATION);
        await complete(source, times, callback);
    }

    private async sortByOrder(source: SortDataModel[], lhs: number, rhs: number, temp: SortDataModel, order: SortOrder, times: number, callback: (param: SortStateModel) => void): Promise<number> {
        let fst: number = -1, snd: number = -1;

        if (lhs < rhs) {
            if (order === 'ascent') {
                [times, fst, snd] = await this.partitionByAscent(source, lhs, rhs, temp, times, callback);
            }

            if (order === 'descent') {
                [times, fst, snd] = await this.partitionByDescent(source, lhs, rhs, temp, times, callback);
            }
            
            times = await this.sortByOrder(source, lhs, fst - 1, temp, order, times, callback);
            times = await this.sortByOrder(source, snd + 1, rhs, temp, order, times, callback);
        }

        return times;
    }

    public async partitionByAscent(source: SortDataModel[], lhs: number, rhs: number, temp: SortDataModel, times: number, callback: (param: SortStateModel) => void): Promise<[number, number, number]> {
        const pivot: number = source[rhs].value;
        let i: number = rhs - 1, fst: number = lhs, snd: number = rhs;
        
        while (i >= fst) {
            source[rhs].color = ACCENT_COLOR;

            if (source[i].value < pivot) {
                source[i].color = PRIMARY_COLOR;
                source[fst].color = SECONDARY_COLOR;
                callback({ times, datalist: source });

                await swap(source, i, fst, temp);
                await delay(SORT_DELAY_DURATION);

                source[i].color = CLEAR_COLOR;
                source[fst].color = CLEAR_COLOR;
                callback({ times, datalist: source });

                fst += 1;
            } else if (source[i].value > pivot) {
                source[i].color = PRIMARY_COLOR;
                source[snd].color = SECONDARY_COLOR;
                callback({ times, datalist: source });

                await swap(source, i, snd, temp);
                await delay(SORT_DELAY_DURATION);

                source[i].color = CLEAR_COLOR;
                source[snd].color = CLEAR_COLOR;
                callback({ times, datalist: source });

                i -= 1;
                snd -= 1;
            } else {
                source[i].color = ACCENT_COLOR;
                callback({ times, datalist: source });

                await delay(SORT_DELAY_DURATION);

                source[i].color = CLEAR_COLOR;
                callback({ times, datalist: source });

                i -= 1;
            }

            source[rhs].color = CLEAR_COLOR;
        }

        callback({ times, datalist: source });
        return [times, fst, snd];
    }

    public async partitionByDescent(source: SortDataModel[], lhs: number, rhs: number, temp: SortDataModel, times: number, callback: (param: SortStateModel) => void): Promise<[number, number, number]> {
        const pivot: number = source[rhs].value;
        let i: number = rhs - 1, fst: number = lhs, snd: number = rhs;
        
        while (i >= fst) {
            source[rhs].color = ACCENT_COLOR;

            if (source[i].value > pivot) {
                source[i].color = PRIMARY_COLOR;
                source[fst].color = SECONDARY_COLOR;
                callback({ times, datalist: source });

                await swap(source, i, fst, temp);
                await delay(SORT_DELAY_DURATION);

                source[i].color = CLEAR_COLOR;
                source[fst].color = CLEAR_COLOR;
                callback({ times, datalist: source });

                fst += 1;
            } else if (source[i].value < pivot) {
                source[i].color = PRIMARY_COLOR;
                source[snd].color = SECONDARY_COLOR;
                callback({ times, datalist: source });

                await swap(source, i, snd, temp);
                await delay(SORT_DELAY_DURATION);

                source[i].color = CLEAR_COLOR;
                source[snd].color = CLEAR_COLOR;
                callback({ times, datalist: source });

                i -= 1;
                snd -= 1;
            } else {
                source[i].color = ACCENT_COLOR;
                callback({ times, datalist: source });

                await delay(SORT_DELAY_DURATION);

                source[i].color = CLEAR_COLOR;
                callback({ times, datalist: source });

                i -= 1;
            }

            source[rhs].color = CLEAR_COLOR;
        }

        callback({ times, datalist: source });
        return [times, fst, snd];
    }

}

/**
 * 三路快速排序（递归）
 */
@Injectable()
export class ThreeWayIterativeQuickSortService {

    private stack: number[] = Array.from([]);

    constructor(private _service: ThreeWayRecursiveQuickSortService) {}

    public sort(array: SortDataModel[], order: SortOrder): Observable<SortStateModel> {
        return new Observable(subscriber => {
            const temp: SortDataModel = { value: 0, color: CLEAR_COLOR };

            if (order === 'ascent') {
                this.sortByAscent(array, 0, array.length - 1, temp, 0, param => subscriber.next(param)).then(() => subscriber.complete());
            }
    
            if (order === 'descent') {
                this.sortByDescent(array, 0, array.length - 1, temp, 0, param => subscriber.next(param)).then(() => subscriber.complete());
            }
        });
    }

    private async sortByAscent(source: SortDataModel[], lhs: number, rhs: number, temp: SortDataModel, times: number, callback: (param: SortStateModel) => void): Promise<void> {
        let fst: number, snd: number;

        this.stack.push(rhs);
        this.stack.push(lhs);

        while (this.stack.length > 0) {
            lhs = this.stack.pop() as number;
            rhs = this.stack.pop() as number;
            
            [times, fst, snd] = await this._service.partitionByAscent(source, lhs, rhs, temp, times, callback);

            if (snd + 1 < rhs) {
                this.stack.push(rhs);
                this.stack.push(snd + 1);
            }

            if (lhs < fst - 1) {
                this.stack.push(fst - 1);
                this.stack.push(lhs);
            }

            source[lhs].color = PRIMARY_COLOR;
            source[rhs].color = SECONDARY_COLOR;
            callback({ times, datalist: source });

            await delay(SORT_DELAY_DURATION);

            source[lhs].color = CLEAR_COLOR;
            source[rhs].color = CLEAR_COLOR;
            callback({ times, datalist: source });
        }

        await delay(SORT_DELAY_DURATION);
        await complete(source, times, callback);
        this.stack.splice(0);
    }

    private async sortByDescent(source: SortDataModel[], lhs: number, rhs: number, temp: SortDataModel, times: number, callback: (param: SortStateModel) => void): Promise<void> {
        let fst: number, snd: number;

        this.stack.push(rhs);
        this.stack.push(lhs);

        while (this.stack.length > 0) {
            lhs = this.stack.pop() as number;
            rhs = this.stack.pop() as number;
            
            [times, fst, snd] = await this._service.partitionByDescent(source, lhs, rhs, temp, times, callback);

            if (snd + 1 < rhs) {
                this.stack.push(rhs);
                this.stack.push(snd + 1);
            }

            if (lhs < fst - 1) {
                this.stack.push(fst - 1);
                this.stack.push(lhs);
            }

            source[lhs].color = PRIMARY_COLOR;
            source[rhs].color = SECONDARY_COLOR;
            callback({ times, datalist: source });

            await delay(SORT_DELAY_DURATION);

            source[lhs].color = CLEAR_COLOR;
            source[rhs].color = CLEAR_COLOR;
            callback({ times, datalist: source });
        }

        await delay(SORT_DELAY_DURATION);
        await complete(source, times, callback);
        this.stack.splice(0);
    }

}

/**
 * 双轴快速排序（递归）
 */
@Injectable()
export class DualPivotRecursiveQuickSortService {

    constructor(private _service: SortToolsService) {}

    public sort(array: SortDataModel[], order: SortOrder): Observable<SortStateModel> {
        return new Observable(subscriber => {
            const temp: SortDataModel = { value: 0, color: CLEAR_COLOR };

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

    private async sortByDescent(source: SortDataModel[], lhs: number, rhs: number, temp: SortDataModel, times: number, callback: (param: SortStateModel) => void): Promise<void> {
        times = await this.sortByOrder(source, lhs, rhs, temp, 'descent', times, callback);
        await delay(SORT_DELAY_DURATION);
        await complete(source, times, callback);
    }

    private async sortByOrder(source: SortDataModel[], lhs: number, rhs: number, temp: SortDataModel, order: SortOrder, times: number, callback: (param: SortStateModel) => void): Promise<number> {
        let fst: number = -1, snd: number = -1;

        if (lhs < rhs) {
            if (order === 'ascent') {
                [times, fst, snd] = await this.partitionByAscent(source, lhs, rhs, temp, times, callback);
            }

            if (order === 'descent') {
                [times, fst, snd] = await this.partitionByDescent(source, lhs, rhs, temp, times, callback);
            }
            
            times = await this.sortByOrder(source, lhs, fst - 1, temp, order, times, callback);
            times = await this.sortByOrder(source, fst + 1, snd - 1, temp, order, times, callback);
            times = await this.sortByOrder(source, snd + 1, rhs, temp, order, times, callback);
        }

        return times;
    }

    public async partitionByAscent(source: SortDataModel[], lhs: number, rhs: number, temp: SortDataModel, times: number, callback: (param: SortStateModel) => void): Promise<[number, number, number]> {
        if (rhs - lhs < THRESHOLD) {
            times = await this._service.stableSortByAscent(source, lhs, rhs, temp, times, callback);
            return [times, lhs, rhs];
        } else {
            let fst: number = lhs + 1, snd: number = rhs - 1, i: number = lhs + 1;

            if (source[lhs].value > source[rhs].value) {
                await swap(source, lhs, rhs, temp);
            }
    
            while (i <= snd) {
                source[lhs].color = ACCENT_ONE_COLOR;
                source[rhs].color = ACCENT_TWO_COLOR;
    
                if (source[i].value < source[lhs].value) {
                    times += 1;
    
                    source[i].color = PRIMARY_ONE_COLOR;
                    source[fst].color = SECONDARY_ONE_COLOR;
                    callback({ times, datalist: source });
    
                    await swap(source, i, fst, temp);
                    await delay(SORT_DELAY_DURATION);
    
                    source[i].color = CLEAR_COLOR;
                    source[fst].color = CLEAR_COLOR;
                    callback({ times, datalist: source });
    
                    fst += 1;
                } 
                
                if (source[i].value > source[rhs].value) {
                    while (i < snd && source[snd].value > source[rhs].value) {
                        snd -= 1;
                    }
    
                    times += 1;
    
                    source[i].color = PRIMARY_TWO_COLOR;
                    source[snd].color = SECONDARY_TWO_COLOR;
                    callback({ times, datalist: source });
    
                    await swap(source, i, snd, temp);
                    await delay(SORT_DELAY_DURATION);
    
                    source[i].color = CLEAR_COLOR;
                    source[snd].color = CLEAR_COLOR;
                    callback({ times, datalist: source });
    
                    snd -= 1;
    
                    if (source[i].value < source[lhs].value) {
                        times += 1;
    
                        source[i].color = PRIMARY_TWO_COLOR;
                        source[fst].color = SECONDARY_TWO_COLOR;
                        callback({ times, datalist: source });
        
                        await swap(source, i, fst, temp);
                        await delay(SORT_DELAY_DURATION);
        
                        source[i].color = CLEAR_COLOR;
                        source[fst].color = CLEAR_COLOR;
                        callback({ times, datalist: source });
    
                        fst += 1;
                    }
                }
                
                i += 1;
                source[lhs].color = CLEAR_COLOR;
                source[rhs].color = CLEAR_COLOR;
            }
    
            fst -= 1;
            snd += 1;
            await delay(SORT_DELAY_DURATION);
    
            source[lhs].color = PRIMARY_COLOR;
            source[fst].color = SECONDARY_COLOR;
            callback({ times, datalist: source });
    
            await swap(source, lhs, fst, temp);
            await delay(SORT_DELAY_DURATION);
    
            source[lhs].color = CLEAR_COLOR;
            source[fst].color = CLEAR_COLOR;
            callback({ times, datalist: source });
    
            await delay(SORT_DELAY_DURATION);
    
            source[rhs].color = PRIMARY_COLOR;
            source[snd].color = SECONDARY_COLOR;
            callback({ times, datalist: source });
    
            await swap(source, rhs, snd, temp);
            await delay(SORT_DELAY_DURATION);
    
            source[rhs].color = CLEAR_COLOR;
            source[snd].color = CLEAR_COLOR;
            callback({ times, datalist: source });
    
            return [times + 2, fst, snd];
        }
        
    }

    public async partitionByDescent(source: SortDataModel[], lhs: number, rhs: number, temp: SortDataModel, times: number, callback: (param: SortStateModel) => void): Promise<[number, number, number]> {
        if (rhs - lhs < THRESHOLD) {
            times = await this._service.stableSortByDescent(source, lhs, rhs, temp, times, callback);
            return [times, lhs, rhs];
        } else {
            let fst: number = lhs + 1, snd: number = rhs - 1, i: number = lhs + 1;

            if (source[lhs].value < source[rhs].value) {
                await swap(source, lhs, rhs, temp);
            }

            while (i <= snd) {
                source[lhs].color = ACCENT_ONE_COLOR;
                source[rhs].color = ACCENT_TWO_COLOR;

                if (source[i].value > source[lhs].value) {
                    times += 1;

                    source[i].color = PRIMARY_ONE_COLOR;
                    source[fst].color = SECONDARY_ONE_COLOR;
                    callback({ times, datalist: source });

                    await swap(source, i, fst, temp);
                    await delay(SORT_DELAY_DURATION);

                    source[i].color = CLEAR_COLOR;
                    source[fst].color = CLEAR_COLOR;
                    callback({ times, datalist: source });

                    fst += 1;
                } 
                
                if (source[i].value < source[rhs].value) {
                    while (i < snd && source[snd].value < source[rhs].value) {
                        snd -= 1;
                    }

                    times += 1;

                    source[i].color = PRIMARY_TWO_COLOR;
                    source[snd].color = SECONDARY_TWO_COLOR;
                    callback({ times, datalist: source });

                    await swap(source, i, snd, temp);
                    await delay(SORT_DELAY_DURATION);

                    source[i].color = CLEAR_COLOR;
                    source[snd].color = CLEAR_COLOR;
                    callback({ times, datalist: source });

                    snd -= 1;

                    if (source[i].value > source[lhs].value) {
                        times += 1;

                        source[i].color = PRIMARY_TWO_COLOR;
                        source[fst].color = SECONDARY_TWO_COLOR;
                        callback({ times, datalist: source });
        
                        await swap(source, i, fst, temp);
                        await delay(SORT_DELAY_DURATION);
        
                        source[i].color = CLEAR_COLOR;
                        source[fst].color = CLEAR_COLOR;
                        callback({ times, datalist: source });

                        fst += 1;
                    }
                }
                
                i += 1;
                source[lhs].color = CLEAR_COLOR;
                source[rhs].color = CLEAR_COLOR;
            }

            fst -= 1;
            snd += 1;
            await delay(SORT_DELAY_DURATION);

            source[lhs].color = PRIMARY_COLOR;
            source[fst].color = SECONDARY_COLOR;
            callback({ times, datalist: source });

            await swap(source, lhs, fst, temp);
            await delay(SORT_DELAY_DURATION);

            source[lhs].color = CLEAR_COLOR;
            source[fst].color = CLEAR_COLOR;
            callback({ times, datalist: source });

            await delay(SORT_DELAY_DURATION);

            source[rhs].color = PRIMARY_COLOR;
            source[snd].color = SECONDARY_COLOR;
            callback({ times, datalist: source });

            await swap(source, rhs, snd, temp);
            await delay(SORT_DELAY_DURATION);

            source[rhs].color = CLEAR_COLOR;
            source[snd].color = CLEAR_COLOR;
            callback({ times, datalist: source });

            return [times + 2, fst, snd];
        }
    }

}

/**
 * 双轴快速排序（递归）
 */
@Injectable()
export class DualPivotIterativeQuickSortService {

    private stack: number[] = Array.from([]);

    constructor(private _service: DualPivotRecursiveQuickSortService) {}

    public sort(array: SortDataModel[], order: SortOrder): Observable<SortStateModel> {
        return new Observable(subscriber => {
            const temp: SortDataModel = { value: 0, color: CLEAR_COLOR };

            if (order === 'ascent') {
                this.sortByAscent(array, 0, array.length - 1, temp, 0, param => subscriber.next(param)).then(() => subscriber.complete());
            }
    
            if (order === 'descent') {
                this.sortByDescent(array, 0, array.length - 1, temp, 0, param => subscriber.next(param)).then(() => subscriber.complete());
            }
        });
    }

    private async sortByAscent(source: SortDataModel[], lhs: number, rhs: number, temp: SortDataModel, times: number, callback: (param: SortStateModel) => void): Promise<void> {
        let fst: number, snd: number;

        this.stack.push(rhs);
        this.stack.push(lhs);

        while (this.stack.length > 0) {
            lhs = this.stack.pop() as number;
            rhs = this.stack.pop() as number;
            
            [times, fst, snd] = await this._service.partitionByAscent(source, lhs, rhs, temp, times, callback);

            if (snd + 1 < rhs) {
                this.stack.push(rhs);
                this.stack.push(snd + 1);
            }

            if (fst + 1 < snd - 1) {
                this.stack.push(snd - 1);
                this.stack.push(fst + 1);
            }

            if (lhs < fst - 1) {
                this.stack.push(fst - 1);
                this.stack.push(lhs);
            }

            source[lhs].color = PRIMARY_COLOR;
            source[rhs].color = SECONDARY_COLOR;
            callback({ times, datalist: source });

            await delay(SORT_DELAY_DURATION);

            source[lhs].color = CLEAR_COLOR;
            source[rhs].color = CLEAR_COLOR;
            callback({ times, datalist: source });
        }

        await delay(SORT_DELAY_DURATION);
        await complete(source, times, callback);
        this.stack.splice(0);
    }

    private async sortByDescent(source: SortDataModel[], lhs: number, rhs: number, temp: SortDataModel, times: number, callback: (param: SortStateModel) => void): Promise<void> {
        let fst: number, snd: number;

        this.stack.push(rhs);
        this.stack.push(lhs);

        while (this.stack.length > 0) {
            lhs = this.stack.pop() as number;
            rhs = this.stack.pop() as number;
            
            [times, fst, snd] = await this._service.partitionByDescent(source, lhs, rhs, temp, times, callback);

            if (snd + 1 < rhs) {
                this.stack.push(rhs);
                this.stack.push(snd + 1);
            }

            if (fst + 1 < snd - 1) {
                this.stack.push(snd - 1);
                this.stack.push(fst + 1);
            }

            if (lhs < fst - 1) {
                this.stack.push(fst - 1);
                this.stack.push(lhs);
            }

            source[lhs].color = PRIMARY_COLOR;
            source[rhs].color = SECONDARY_COLOR;
            callback({ times, datalist: source });

            await delay(SORT_DELAY_DURATION);

            source[lhs].color = CLEAR_COLOR;
            source[rhs].color = CLEAR_COLOR;
            callback({ times, datalist: source });
        }

        await delay(SORT_DELAY_DURATION);
        await complete(source, times, callback);
        this.stack.splice(0);
    }

}
