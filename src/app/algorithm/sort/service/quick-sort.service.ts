import { Injectable } from "@angular/core";

import { SortDataModel, SortStateModel, SortOrder } from "../ngrx-store/sort.state";
import { SORT_DELAY_DURATION, complete, delay, swap } from "../sort.utils";
import { SortToolsService } from "../ngrx-store/sort.service";
import { CLEAR_COLOR, ACCENT_COLOR, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_ONE_COLOR, ACCENT_TWO_COLOR, PRIMARY_ONE_COLOR, SECONDARY_ONE_COLOR, PRIMARY_TWO_COLOR, SECONDARY_TWO_COLOR, START_COLOR, FINAL_COLOR } from "../../../public/values.utils";
import { BaseSortService } from "./base-sort.service";

/**
 * 单路快速排序（递归）
 */
@Injectable()
export class RecursiveQuickSortService extends BaseSortService {

    constructor(private _service: SortToolsService) {
        super();
    }

    protected override async sortByAscent(source: SortDataModel[], lhs: number, rhs: number, option: string | number | undefined, callback: (param: SortStateModel) => void): Promise<void> {
        let times: number = await this.sortByOrder(source, lhs, rhs, 'ascent', 0, callback);
        await delay(SORT_DELAY_DURATION);
        await complete(source, times, callback);
    }

    protected override async sortByDescent(source: SortDataModel[], lhs: number, rhs: number, option: string | number | undefined, callback: (param: SortStateModel) => void): Promise<void> {
        let times: number = await this.sortByOrder(source, lhs, rhs, 'descent', 0, callback);
        await delay(SORT_DELAY_DURATION);
        await complete(source, times, callback);
    }

    private async sortByOrder(source: SortDataModel[], lhs: number, rhs: number, order: SortOrder, times: number, callback: (param: SortStateModel) => void): Promise<number> {
        if (lhs < rhs) {
            let mid: number = -1;

            if (order === 'ascent') {
                [times, mid] = await this.partitionByAscent(source, lhs, rhs, times, callback);
                times = await this.sortByOrder(source, lhs, mid - 1, order, times, callback);
                times = await this.sortByOrder(source, mid + 1, rhs, order, times, callback);
            }

            if (order === 'descent') {
                [times, mid] = await this.partitionByDescent(source, lhs, rhs, times, callback);
                times = await this.sortByOrder(source, mid + 1, rhs, order, times, callback);
                times = await this.sortByOrder(source, lhs, mid - 1, order, times, callback);
            }
        }

        return times;
    }

    public async partitionByAscent(source: SortDataModel[], lhs: number, rhs: number, times: number, callback: (param: SortStateModel) => void): Promise<[number, number]> {
        if (rhs - lhs < 24) {
            source[lhs].color = START_COLOR;
            source[rhs].color = FINAL_COLOR;
            callback({ times, datalist: source });

            times = await this._service.stableGapSortByAscent(source, lhs, rhs, 1, 1, times, callback);

            source[lhs].color = CLEAR_COLOR;
            source[rhs].color = CLEAR_COLOR;
            callback({ times, datalist: source });
            return [times, rhs];
        } else {
            const pivot: number = source[rhs].value;
            let j: number = lhs - 1, flag: boolean;
            
            for (let i = lhs; i <= rhs - 1; i++) {
                flag = source[i].value < pivot;

                source[lhs].color = START_COLOR;
                source[rhs].color = FINAL_COLOR;
                source[i].color = flag ? PRIMARY_COLOR : ACCENT_COLOR;

                if (j > -1) {
                    source[j].color = flag ? SECONDARY_COLOR : CLEAR_COLOR;
                }
                
                callback({ times, datalist: source});

                if (flag) {
                    if (j > -1) {
                        source[j].color = CLEAR_COLOR;
                    }

                    j += 1;
                    times += 1;

                    await swap(source, j, i);
                    await delay(SORT_DELAY_DURATION);

                    source[lhs].color = START_COLOR;
                    source[rhs].color = FINAL_COLOR;
                    source[i].color = flag ? SECONDARY_COLOR : ACCENT_COLOR;
                    source[j].color = flag ? PRIMARY_COLOR : CLEAR_COLOR;
                    callback({ times, datalist: source});  
                }

                await delay(SORT_DELAY_DURATION);
                
                source[lhs].color = START_COLOR;
                source[rhs].color = FINAL_COLOR;
                source[i].color = CLEAR_COLOR;

                if (j > -1) {
                    source[j].color = CLEAR_COLOR;
                }

                callback({ times, datalist: source});
            }

            source[lhs].color = CLEAR_COLOR;
            source[rhs].color = CLEAR_COLOR;
            callback({ times, datalist: source });

            await this._service.swapAndRender(source, false, true, j + 1, rhs, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, times, callback);
            return [times + 1, j + 1];
        }
    }

    public async partitionByDescent(source: SortDataModel[], lhs: number, rhs: number, times: number, callback: (param: SortStateModel) => void): Promise<[number, number]> {
        if (rhs - lhs < 24) {
            source[lhs].color = FINAL_COLOR;
            source[rhs].color = START_COLOR;
            callback({ times, datalist: source });
            
            times = await this._service.stableGapSortByDescent(source, lhs, rhs, 1, 1, times, callback);

            source[lhs].color = CLEAR_COLOR;
            source[rhs].color = CLEAR_COLOR;
            callback({ times, datalist: source });
            return [times, rhs];
        } else {
            const pivot: number = source[lhs].value;
            let j: number = rhs + 1, flag: boolean;
            
            for (let i = rhs, length = source.length; i >= lhs + 1; i--) {
                flag = source[i].value < pivot;

                source[lhs].color = FINAL_COLOR;
                source[rhs].color = START_COLOR;
                source[i].color = flag ? PRIMARY_COLOR : ACCENT_COLOR;
                
                if (j < length) {
                    source[j].color = flag ? SECONDARY_COLOR : CLEAR_COLOR;
                }
    
                callback({ times, datalist: source});
    
                if (flag) {
                    if (j < length) {
                        source[j].color = CLEAR_COLOR;
                    }

                    j -= 1;
                    times += 1;

                    await swap(source, j, i);
                    await delay(SORT_DELAY_DURATION);

                    source[lhs].color = FINAL_COLOR;
                    source[rhs].color = START_COLOR;
                    source[i].color = flag ? SECONDARY_COLOR : ACCENT_COLOR;
                    source[j].color = flag ? PRIMARY_COLOR : CLEAR_COLOR;
                    callback({ times, datalist: source}); 
                }
    
                await delay(SORT_DELAY_DURATION);
                
                source[lhs].color = FINAL_COLOR;
                source[rhs].color = START_COLOR;
                source[i].color = CLEAR_COLOR;

                if (j < length) {
                    source[j].color = CLEAR_COLOR;
                }

                callback({ times, datalist: source});
            }
    
            source[lhs].color = CLEAR_COLOR;
            source[rhs].color = CLEAR_COLOR;
            callback({ times, datalist: source });

            await this._service.swapAndRender(source, false, true, j - 1, lhs, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, times, callback);
            return [times + 1, j - 1];
        }
    }

}

/**
 * 单路快速排序（迭代）
 */
@Injectable()
export class IterativeQuickSortService extends BaseSortService {

    constructor(private _sortService: RecursiveQuickSortService) {
        super();
    }

    protected override async sortByAscent(source: SortDataModel[], lhs: number, rhs: number, option: string | number | undefined, callback: (param: SortStateModel) => void): Promise<void> {
        let mid: number, times: number = 0;

        this.stack.push(rhs);
        this.stack.push(lhs);
        
        while (this.stack.length > 0) {
            lhs = this.stack.pop() as number;
            rhs = this.stack.pop() as number;

            source[lhs].color = START_COLOR;
            source[rhs].color = FINAL_COLOR;
            callback({ times, datalist: source });
            
            [times, mid] = await this._sortService.partitionByAscent(source, lhs, rhs, times, callback);

            source[lhs].color = CLEAR_COLOR;
            source[rhs].color = CLEAR_COLOR;
            callback({ times, datalist: source });

            if (mid + 1 < rhs) {
                this.stack.push(rhs);
                this.stack.push(mid + 1);
            }

            if (lhs < mid - 1) {
                this.stack.push(mid - 1);
                this.stack.push(lhs);
            }
            
            await delay(SORT_DELAY_DURATION);
        }

        await delay(SORT_DELAY_DURATION);
        await complete(source, times, callback);
    }

    protected override async sortByDescent(source: SortDataModel[], lhs: number, rhs: number, option: string | number | undefined, callback: (param: SortStateModel) => void): Promise<void> {
        let mid: number, times: number = 0;

        this.stack.push(lhs);
        this.stack.push(rhs);

        while (this.stack.length > 0) {
            rhs = this.stack.pop() as number;
            lhs = this.stack.pop() as number;

            source[lhs].color = FINAL_COLOR;
            source[rhs].color = START_COLOR;
            callback({ times, datalist: source });

            [times, mid] = await this._sortService.partitionByDescent(source, lhs, rhs, times, callback);

            source[lhs].color = CLEAR_COLOR;
            source[rhs].color = CLEAR_COLOR;
            callback({ times, datalist: source });

            if (lhs < mid - 1) {
                this.stack.push(lhs);
                this.stack.push(mid - 1);
            }
            
            if (mid + 1 < rhs) {
                this.stack.push(mid + 1);
                this.stack.push(rhs);
            }
            
            await delay(SORT_DELAY_DURATION);
        }

        await delay(SORT_DELAY_DURATION);
        await complete(source, times, callback);
    }

}

/**
 * 平均值快速排序（递归）
 */
@Injectable()
export class AverageRecursiveQuickSortService extends BaseSortService {

    constructor(private _service: SortToolsService) {
        super();
    }

    protected override async sortByAscent(source: SortDataModel[], lhs: number, rhs: number, option: string | number | undefined, callback: (param: SortStateModel) => void): Promise<void> {
        let times: number = await this.sortByOrder(source, lhs, rhs, 'ascent', 0, callback);
        await delay(SORT_DELAY_DURATION);
        await complete(source, times, callback);
    }

    protected override async sortByDescent(source: SortDataModel[], lhs: number, rhs: number, option: string | number | undefined, callback: (param: SortStateModel) => void): Promise<void> {
        let times: number = await this.sortByOrder(source, lhs, rhs, 'descent', 0, callback);
        await delay(SORT_DELAY_DURATION);
        await complete(source, times, callback);
    }

    private async sortByOrder(source: SortDataModel[], lhs: number, rhs: number, order: SortOrder, times: number, callback: (param: SortStateModel) => void): Promise<number> {
        if (lhs < rhs) {
            let mid: number = -1;

            if (order === 'ascent') {
                [times, mid] = await this.partitionByAscent(source, lhs, rhs, times, callback);
                times = await this.sortByOrder(source, lhs, mid - 1, order, times, callback);
                times = await this.sortByOrder(source, mid, rhs, order, times, callback);
            }

            if (order === 'descent') {
                [times, mid] = await this.partitionByDescent(source, lhs, rhs, times, callback);
                times = await this.sortByOrder(source, mid + 1, rhs, order, times, callback);
                times = await this.sortByOrder(source, lhs, mid, order, times, callback);
            }
        }

        return times;
    }

    public async partitionByAscent(source: SortDataModel[], lhs: number, rhs: number, times: number, callback: (param: SortStateModel) => void): Promise<[number, number]> {
        if (rhs - lhs < this.THRESHOLD) {
            source[lhs].color = START_COLOR;
            source[rhs].color = FINAL_COLOR;
            callback({ times, datalist: source });

            times = await this._service.stableGapSortByAscent(source, lhs, rhs, 1, 1, times, callback);

            source[lhs].color = CLEAR_COLOR;
            source[rhs].color = CLEAR_COLOR;
            callback({ times, datalist: source });
            return [times, rhs];
        } else {
            const pivot: number = await this.sumByAscent(source, lhs, rhs, 0, times, callback) / (rhs - lhs + 1);
            let i: number = lhs, j: number = rhs;
            
            while (i < j) {
                source[lhs].color = START_COLOR;
                source[rhs].color = FINAL_COLOR;
                callback({ times, datalist: source });

                while (i < j && source[i].value <= pivot) {
                    await this._service.swapAndRender(source, false, false, i, j, PRIMARY_ONE_COLOR, SECONDARY_ONE_COLOR, ACCENT_ONE_COLOR, times, callback);

                    i += 1;
                }

                while (i < j && source[j].value >= pivot) {
                    await this._service.swapAndRender(source, false, false, j, i, PRIMARY_TWO_COLOR, SECONDARY_TWO_COLOR, ACCENT_TWO_COLOR, times, callback);
                    
                    j -= 1;
                }

                await this._service.swapAndRender(source, false, true, i, j, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, times, callback);

                source[lhs].color = CLEAR_COLOR;
                source[rhs].color = CLEAR_COLOR;
                callback({ times, datalist: source });

                times += 1;
            }

            return [times, i];
        }
    }

    public async partitionByDescent(source: SortDataModel[], lhs: number, rhs: number, times: number, callback: (param: SortStateModel) => void): Promise<[number, number]> {
        if (rhs - lhs < this.THRESHOLD) {
            source[lhs].color = FINAL_COLOR;
            source[rhs].color = START_COLOR;
            callback({ times, datalist: source });
            
            times = await this._service.stableGapSortByDescent(source, lhs, rhs, 1, 1, times, callback);
            
            source[lhs].color = CLEAR_COLOR;
            source[rhs].color = CLEAR_COLOR;
            callback({ times, datalist: source });
            return [times, lhs];
        } else {
            const pivot: number = await this.sumByDescent(source, lhs, rhs, 0, times, callback) / (rhs - lhs + 1);
            let i: number = rhs, j: number = lhs;
            
            while (i > j) {
                source[lhs].color = FINAL_COLOR;
                source[rhs].color = START_COLOR;
                callback({ times, datalist: source });

                while (i > j && source[i].value <= pivot) {
                    await this._service.swapAndRender(source, false, false, i, j, PRIMARY_ONE_COLOR, SECONDARY_ONE_COLOR, ACCENT_ONE_COLOR, times, callback);
    
                    i -= 1;
                }
    
                while (i > j && source[j].value >= pivot) {
                    await this._service.swapAndRender(source, false, false, j, i, PRIMARY_TWO_COLOR, SECONDARY_TWO_COLOR, ACCENT_TWO_COLOR, times, callback);
                    
                    j += 1;
                }
                
                await this._service.swapAndRender(source, false, true, i, j, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, times, callback);

                source[lhs].color = CLEAR_COLOR;
                source[rhs].color = CLEAR_COLOR;
                callback({ times, datalist: source });
                
                times += 1;
            }
            
            return [times, i];
        }
    }

    private async sumByAscent(source: SortDataModel[], lhs: number, rhs: number, sum: number, times: number, callback: (param: SortStateModel) => void): Promise<number> {
        if (lhs + 1 === rhs) {
            sum = source[lhs].value + source[rhs].value;
        } else {
            let mid: number;

            this.stack.push(rhs);
            this.stack.push(lhs);
    
            while (this.stack.length > 0) {
                lhs = this.stack.pop() as number;
                rhs = this.stack.pop() as number;
    
                if (lhs >= rhs) continue;
    
                if (rhs - lhs < this.THRESHOLD) {
                    for (let i = lhs; i <= rhs; i++) {
                        sum += source[i].value;
    
                        source[i].color = ACCENT_COLOR;
                        callback({ times, datalist: source });
    
                        await delay(SORT_DELAY_DURATION);
    
                        source[i].color = CLEAR_COLOR;
                        callback({ times, datalist: source });
                    }
                } else {
                    mid = Math.floor((rhs - lhs) * 0.5 + lhs);
    
                    if (mid + 1 < rhs) {
                        this.stack.push(rhs);
                        this.stack.push(mid + 1);
                    }
    
                    if (lhs < mid) {
                        this.stack.push(mid);
                        this.stack.push(lhs);
                    }
                }
            }
        }
        
        return sum;
    }

    private async sumByDescent(source: SortDataModel[], lhs: number, rhs: number, sum: number, times: number, callback: (param: SortStateModel) => void): Promise<number> {
        if (lhs + 1 === rhs) {
            sum = source[lhs].value + source[rhs].value;
        } else {
            let mid: number;

            this.stack.push(lhs);
            this.stack.push(rhs);
    
            while (this.stack.length > 0) {
                rhs = this.stack.pop() as number;
                lhs = this.stack.pop() as number;
    
                if (lhs >= rhs) continue;
    
                if (rhs - lhs < this.THRESHOLD) {
                    for (let i = rhs; i >= lhs; i--) {
                        sum += source[i].value;
    
                        source[i].color = ACCENT_COLOR;
                        callback({ times, datalist: source });
    
                        await delay(SORT_DELAY_DURATION);
    
                        source[i].color = CLEAR_COLOR;
                        callback({ times, datalist: source });
                    }
                } else {
                    mid = Math.floor((rhs - lhs) * 0.5 + lhs);
    
                    if (lhs < mid) {
                        this.stack.push(lhs);
                        this.stack.push(mid);
                    }
    
                    if (mid + 1 < rhs) {
                        this.stack.push(mid + 1);
                        this.stack.push(rhs);
                    }
                }
            }
        }
        
        return sum;
    }

}

/**
 * 平均值快速排序（迭代）
 */
@Injectable()
export class AverageIterativeQuickSortService extends BaseSortService {

    constructor(private _sortService: AverageRecursiveQuickSortService) {
        super();
    }

    protected override async sortByAscent(source: SortDataModel[], lhs: number, rhs: number, option: string | number | undefined, callback: (param: SortStateModel) => void): Promise<void> {
        let mid: number, times: number = 0;

        this.stack.push(rhs);
        this.stack.push(lhs);
        
        while (this.stack.length > 0) {
            lhs = this.stack.pop() as number;
            rhs = this.stack.pop() as number;
            
            if (lhs >= rhs) continue;

            [times, mid] = await this._sortService.partitionByAscent(source, lhs, rhs, times, callback);

            if (mid < rhs) {
                this.stack.push(rhs);
                this.stack.push(mid);
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

    protected override async sortByDescent(source: SortDataModel[], lhs: number, rhs: number, option: string | number | undefined, callback: (param: SortStateModel) => void): Promise<void> {
        let mid: number, times: number = 0;

        this.stack.push(lhs);
        this.stack.push(rhs);

        while (this.stack.length > 0) {
            rhs = this.stack.pop() as number;
            lhs = this.stack.pop() as number;

            if (lhs >= rhs) continue;

            source[lhs].color = FINAL_COLOR;
            source[rhs].color = START_COLOR;
            callback({ times, datalist: source });

            [times, mid] = await this._sortService.partitionByDescent(source, lhs, rhs, times, callback);

            source[lhs].color = CLEAR_COLOR;
            source[rhs].color = CLEAR_COLOR;
            callback({ times, datalist: source });

            if (lhs < mid) {
                this.stack.push(lhs);
                this.stack.push(mid);
            }

            if (mid + 1 < rhs) {
                this.stack.push(mid + 1);
                this.stack.push(rhs);
            }
        }

        await delay(SORT_DELAY_DURATION);
        await complete(source, times, callback);
    }

}

/**
 * 二路快速排序（递归）
 */
@Injectable()
export class TwoWayRecursiveQuickSortService extends BaseSortService {

    constructor(private _service: SortToolsService) {
        super();
    }

    protected override async sortByAscent(source: SortDataModel[], lhs: number, rhs: number, option: string | number | undefined, callback: (param: SortStateModel) => void): Promise<void> {
        let times: number = await this.sortByOrder(source, lhs, rhs, 'ascent', 0, callback);
        await delay(SORT_DELAY_DURATION);
        await complete(source, times, callback);
    }

    protected override async sortByDescent(source: SortDataModel[], lhs: number, rhs: number, option: string | number | undefined, callback: (param: SortStateModel) => void): Promise<void> {
        let times: number = await this.sortByOrder(source, lhs, rhs, 'descent', 0, callback);
        await delay(SORT_DELAY_DURATION);
        await complete(source, times, callback);
    }

    private async sortByOrder(source: SortDataModel[], lhs: number, rhs: number, order: SortOrder, times: number, callback: (param: SortStateModel) => void): Promise<number> {
        if (lhs < rhs) {
            let mid: number = -1;

            if (order === 'ascent') {
                [times, mid] = await this.partitionByAscent(source, lhs, rhs, times, callback);
                times = await this.sortByOrder(source, lhs, mid - 1, order, times, callback);
                times = await this.sortByOrder(source, mid + 1, rhs, order, times, callback);
            }

            if (order === 'descent') {
                [times, mid] = await this.partitionByDescent(source, lhs, rhs, times, callback);
                times = await this.sortByOrder(source, mid + 1, rhs, order, times, callback);
                times = await this.sortByOrder(source, lhs, mid - 1, order, times, callback);
            }
        }

        return times;
    }

    public async partitionByAscent(source: SortDataModel[], lhs: number, rhs: number, times: number, callback: (param: SortStateModel) => void): Promise<[number, number]> {
        if (rhs - lhs < this.THRESHOLD) {
            source[lhs].color = START_COLOR;
            source[rhs].color = FINAL_COLOR;
            callback({ times, datalist: source});

            times = await this._service.stableGapSortByAscent(source, lhs, rhs, 1, 1, times, callback);

            source[lhs].color = CLEAR_COLOR;
            source[rhs].color = CLEAR_COLOR;
            callback({ times, datalist: source});
            return [times, rhs];
        } else {
            const pivot: number = source[rhs].value;
            let i: number = lhs, j: number = rhs;
            
            while (i < j) {
                source[lhs].color = START_COLOR;
                source[rhs].color = FINAL_COLOR;
                callback({ times, datalist: source});

                while (i < j && source[i].value <= pivot) {
                    await this._service.swapAndRender(source, false, false, i, j, PRIMARY_ONE_COLOR, SECONDARY_ONE_COLOR, ACCENT_ONE_COLOR, times, callback);

                    i += 1;
                }

                while (i < j && source[j].value >= pivot) {
                    await this._service.swapAndRender(source, false, false, j, i, PRIMARY_TWO_COLOR, SECONDARY_TWO_COLOR, ACCENT_TWO_COLOR, times, callback);

                    j -= 1;
                }
                
                await this._service.swapAndRender(source, false, true, i, j, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, times, callback);

                source[lhs].color = CLEAR_COLOR;
                source[rhs].color = CLEAR_COLOR;
                callback({ times, datalist: source});

                times += 1;
            }

            await this._service.swapAndRender(source, false, true, i, rhs, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, times, callback);
            return [times + 1, i];
        }
    }

    public async partitionByDescent(source: SortDataModel[], lhs: number, rhs: number, times: number, callback: (param: SortStateModel) => void): Promise<[number, number]> {
        if (rhs - lhs < this.THRESHOLD) {
            source[lhs].color = FINAL_COLOR;
            source[rhs].color = START_COLOR;
            callback({ times, datalist: source});

            times = await this._service.stableGapSortByDescent(source, lhs, rhs, 1, 1, times, callback);

            source[lhs].color = CLEAR_COLOR;
            source[rhs].color = CLEAR_COLOR;
            callback({ times, datalist: source});
            return [times, rhs];
        } else {
            const pivot: number = source[lhs].value;
            let i: number = rhs, j: number = lhs;
            
            while (i > j) {
                source[lhs].color = FINAL_COLOR;
                source[lhs].color = START_COLOR;
                callback({ times, datalist: source});

                while (i > j && source[i].value <= pivot) {
                    await this._service.swapAndRender(source, false, false, i, j, PRIMARY_ONE_COLOR, SECONDARY_ONE_COLOR, ACCENT_ONE_COLOR, times, callback);
    
                    i -= 1;
                }
    
                while (i > j && source[j].value >= pivot) {
                    await this._service.swapAndRender(source, false, false, j, i, PRIMARY_TWO_COLOR, SECONDARY_TWO_COLOR, ACCENT_TWO_COLOR, times, callback);
                    
                    j += 1;
                }
    
                await this._service.swapAndRender(source, false, true, i, j, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, times, callback);

                source[lhs].color = CLEAR_COLOR;
                source[rhs].color = CLEAR_COLOR;
                callback({ times, datalist: source});
                
                times += 1;
            }
    
            await this._service.swapAndRender(source, false, true, i, lhs, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, times, callback);
            return [times + 1, i];
        }
    }

}

/**
 * 二路快速排序（迭代）
 */
@Injectable()
export class TwoWayIterativeQuickSortService extends BaseSortService {

    constructor(private _service: TwoWayRecursiveQuickSortService) {
        super();
    }

    protected override async sortByAscent(source: SortDataModel[], lhs: number, rhs: number, option: string | number | undefined, callback: (param: SortStateModel) => void): Promise<void> {
        let mid: number, times: number = 0;

        this.stack.push(rhs);
        this.stack.push(lhs);

        while (this.stack.length > 0) {
            lhs = this.stack.pop() as number;
            rhs = this.stack.pop() as number;

            source[lhs].color = START_COLOR;
            source[rhs].color = FINAL_COLOR;
            callback({ times, datalist: source });

            [times, mid] = await this._service.partitionByAscent(source, lhs, rhs, times, callback);

            source[lhs].color = CLEAR_COLOR;
            source[rhs].color = CLEAR_COLOR;
            callback({ times, datalist: source });

            if (mid + 1 < rhs) {
                this.stack.push(rhs);
                this.stack.push(mid + 1);
            }

            if (lhs < mid - 1) { 
                this.stack.push(mid - 1);
                this.stack.push(lhs);
            }
        }

        await delay(SORT_DELAY_DURATION);
        await complete(source, times, callback);
    }

    protected override async sortByDescent(source: SortDataModel[], lhs: number, rhs: number, option: string | number | undefined, callback: (param: SortStateModel) => void): Promise<void> {
        let mid: number, times: number = 0;

        this.stack.push(lhs);
        this.stack.push(rhs);

        while (this.stack.length > 0) {
            rhs = this.stack.pop() as number;
            lhs = this.stack.pop() as number;

            source[lhs].color = FINAL_COLOR;
            source[rhs].color = START_COLOR;
            callback({ times, datalist: source });

            [times, mid] = await this._service.partitionByDescent(source, lhs, rhs, times, callback);

            source[lhs].color = CLEAR_COLOR;
            source[rhs].color = CLEAR_COLOR;
            callback({ times, datalist: source });

            if (lhs < mid - 1) { 
                this.stack.push(lhs);
                this.stack.push(mid - 1);
            }

            if (mid + 1 < rhs) {
                this.stack.push(mid + 1);
                this.stack.push(rhs);
            }
        }

        await delay(SORT_DELAY_DURATION);
        await complete(source, times, callback);
    }

}

/**
 * 三路快速排序（递归）
 */
@Injectable()
export class ThreeWayRecursiveQuickSortService extends BaseSortService {

    constructor(private _service: SortToolsService) {
        super();
    }

    protected override async sortByAscent(source: SortDataModel[], lhs: number, rhs: number, option: string | number | undefined, callback: (param: SortStateModel) => void): Promise<void> {
        let times: number = await this.sortByOrder(source, lhs, rhs, 'ascent', 0, callback);
        await delay(SORT_DELAY_DURATION);
        await complete(source, times, callback);
    }

    protected override async sortByDescent(source: SortDataModel[], lhs: number, rhs: number, option: string | number | undefined, callback: (param: SortStateModel) => void): Promise<void> {
        let times: number = await this.sortByOrder(source, lhs, rhs, 'descent', 0, callback);
        await delay(SORT_DELAY_DURATION);
        await complete(source, times, callback);
    }

    private async sortByOrder(source: SortDataModel[], lhs: number, rhs: number, order: SortOrder, times: number, callback: (param: SortStateModel) => void): Promise<number> {
        let fst: number = -1, snd: number = -1;

        if (lhs < rhs) {
            if (order === 'ascent') {
                [times, fst, snd] = await this.partitionByAscent(source, lhs, rhs, times, callback);
                times = await this.sortByOrder(source, lhs, fst - 1, order, times, callback);
                times = await this.sortByOrder(source, snd + 1, rhs, order, times, callback);
            }

            if (order === 'descent') {
                [times, fst, snd] = await this.partitionByDescent(source, lhs, rhs, times, callback);
                times = await this.sortByOrder(source, snd + 1, rhs, order, times, callback);
                times = await this.sortByOrder(source, lhs, fst - 1, order, times, callback);
            }
        }

        return times;
    }

    public async partitionByAscent(source: SortDataModel[], lhs: number, rhs: number, times: number, callback: (param: SortStateModel) => void): Promise<[number, number, number]> {
        if (rhs - lhs < this.THRESHOLD) {
            source[lhs].color = START_COLOR;
            source[rhs].color = FINAL_COLOR;
            callback({ times, datalist: source});

            times = await this._service.stableGapSortByAscent(source, lhs, rhs, 1, 1, times, callback);

            source[lhs].color = CLEAR_COLOR;
            source[rhs].color = CLEAR_COLOR;
            callback({ times, datalist: source});
            return [times, lhs, rhs];
        } else {
            const pivot: number = source[rhs].value;
            let i: number = rhs - 1, fst: number = lhs, snd: number = rhs;
            
            while (i >= fst) {
                source[lhs].color = START_COLOR;
                source[rhs].color = FINAL_COLOR;
                callback({ times, datalist: source});

                if (source[i].value < pivot) {
                    await this._service.swapAndRender(source, false, true, i, fst, PRIMARY_ONE_COLOR, SECONDARY_ONE_COLOR, ACCENT_ONE_COLOR, times, callback);

                    fst += 1;
                    times += 1;
                } else if (source[i].value > pivot) {
                    await this._service.swapAndRender(source, false, true, i, snd, PRIMARY_ONE_COLOR, SECONDARY_ONE_COLOR, ACCENT_ONE_COLOR, times, callback);

                    i -= 1;
                    snd -= 1;
                    times += 1;
                } else {
                    source[fst].color = PRIMARY_COLOR;
                    source[snd].color = SECONDARY_COLOR;
                    source[i].color = ACCENT_COLOR;
                    callback({ times, datalist: source});

                    await delay(SORT_DELAY_DURATION);

                    source[fst].color = CLEAR_COLOR;
                    source[snd].color = CLEAR_COLOR;
                    source[i].color = CLEAR_COLOR;
                    callback({ times, datalist: source});

                    i -= 1;
                }

                source[lhs].color = START_COLOR;
                source[rhs].color = FINAL_COLOR;
                callback({ times, datalist: source});
            }

            source[lhs].color = CLEAR_COLOR;
            source[rhs].color = CLEAR_COLOR;
            callback({ times, datalist: source});
            return [times, fst, snd];
        }
    }

    public async partitionByDescent(source: SortDataModel[], lhs: number, rhs: number, times: number, callback: (param: SortStateModel) => void): Promise<[number, number, number]> {
        if (rhs - lhs < this.THRESHOLD) {
            source[lhs].color = FINAL_COLOR;
            source[rhs].color = START_COLOR;
            callback({ times, datalist: source});

            times = await this._service.stableGapSortByDescent(source, lhs, rhs, 1, 1, times, callback);

            source[lhs].color = CLEAR_COLOR;
            source[rhs].color = CLEAR_COLOR;
            callback({ times, datalist: source});
            return [times, lhs, rhs];
        } else {
            const pivot: number = source[lhs].value;
            let i: number = lhs + 1, fst: number = lhs, snd: number = rhs;
            
            while (i <= snd) {
                source[lhs].color = FINAL_COLOR;
                source[rhs].color = START_COLOR;
                callback({ times, datalist: source});

                if (source[i].value > pivot) {
                    await this._service.swapAndRender(source, false, true, i, fst, PRIMARY_ONE_COLOR, SECONDARY_ONE_COLOR, ACCENT_ONE_COLOR, times, callback);

                    fst += 1;
                    times += 1;
                } else if (source[i].value < pivot) {
                    await this._service.swapAndRender(source, false, true, i, snd, PRIMARY_ONE_COLOR, SECONDARY_ONE_COLOR, ACCENT_ONE_COLOR, times, callback);

                    i -= 1;
                    snd -= 1;
                    times += 1;
                } else {
                    source[fst].color = PRIMARY_COLOR;
                    source[snd].color = SECONDARY_COLOR;
                    source[i].color = ACCENT_COLOR;
                    callback({ times, datalist: source});

                    await delay(SORT_DELAY_DURATION);

                    source[fst].color = CLEAR_COLOR;
                    source[snd].color = CLEAR_COLOR;
                    source[i].color = CLEAR_COLOR;
                    callback({ times, datalist: source});

                    i += 1;
                }

                source[lhs].color = FINAL_COLOR;
                source[rhs].color = START_COLOR;
                callback({ times, datalist: source});
            }

            source[lhs].color = CLEAR_COLOR;
            source[rhs].color = CLEAR_COLOR;
            callback({ times, datalist: source});
            return [times, fst, snd];
        }
    }

}

/**
 * 三路快速排序（迭代）
 */
@Injectable()
export class ThreeWayIterativeQuickSortService extends BaseSortService {

    constructor(private _service: ThreeWayRecursiveQuickSortService) {
        super();
    }

    protected override async sortByAscent(source: SortDataModel[], lhs: number, rhs: number, option: string | number | undefined, callback: (param: SortStateModel) => void): Promise<void> {
        let fst: number, snd: number, times: number = 0;

        this.stack.push(rhs);
        this.stack.push(lhs);

        while (this.stack.length > 0) {
            lhs = this.stack.pop() as number;
            rhs = this.stack.pop() as number;

            source[lhs].color = START_COLOR;
            source[rhs].color = FINAL_COLOR;
            callback({ times, datalist: source });
            
            [times, fst, snd] = await this._service.partitionByAscent(source, lhs, rhs, times, callback);

            source[lhs].color = CLEAR_COLOR;
            source[rhs].color = CLEAR_COLOR;
            callback({ times, datalist: source });

            if (snd + 1 < rhs) {
                this.stack.push(rhs);
                this.stack.push(snd + 1);
            }

            if (lhs < fst - 1) {
                this.stack.push(fst - 1);
                this.stack.push(lhs);
            }
        }

        await delay(SORT_DELAY_DURATION);
        await complete(source, times, callback);
    }

    protected override async sortByDescent(source: SortDataModel[], lhs: number, rhs: number, option: string | number | undefined, callback: (param: SortStateModel) => void): Promise<void> {
        let fst: number, snd: number, times: number = 0;

        this.stack.push(rhs);
        this.stack.push(lhs);

        while (this.stack.length > 0) {
            lhs = this.stack.pop() as number;
            rhs = this.stack.pop() as number;

            source[lhs].color = FINAL_COLOR;
            source[rhs].color = START_COLOR;
            callback({ times, datalist: source });
            
            [times, fst, snd] = await this._service.partitionByDescent(source, lhs, rhs, times, callback);

            source[lhs].color = CLEAR_COLOR;
            source[rhs].color = CLEAR_COLOR;
            callback({ times, datalist: source });

            if (snd + 1 < rhs) {
                this.stack.push(rhs);
                this.stack.push(snd + 1);
            }

            if (lhs < fst - 1) {
                this.stack.push(fst - 1);
                this.stack.push(lhs);
            }
        }

        await delay(SORT_DELAY_DURATION);
        await complete(source, times, callback);
    }

}

/**
 * 双轴快速排序（递归）
 */
@Injectable()
export class DualPivotRecursiveQuickSortService extends BaseSortService {

    constructor(private _service: SortToolsService) {
        super();
    }

    protected override async sortByAscent(source: SortDataModel[], lhs: number, rhs: number, option: string | number | undefined, callback: (param: SortStateModel) => void): Promise<void> {
        let times: number = await this.sortByOrder(source, lhs, rhs, 'ascent', 0, callback);
        await delay(SORT_DELAY_DURATION);
        await complete(source, times, callback);
    }

    protected override async sortByDescent(source: SortDataModel[], lhs: number, rhs: number, option: string | number | undefined, callback: (param: SortStateModel) => void): Promise<void> {
        let times = await this.sortByOrder(source, lhs, rhs, 'descent', 0, callback);
        await delay(SORT_DELAY_DURATION);
        await complete(source, times, callback);
    }

    private async sortByOrder(source: SortDataModel[], lhs: number, rhs: number, order: SortOrder, times: number, callback: (param: SortStateModel) => void): Promise<number> {
        let fst: number = -1, snd: number = -1;

        if (lhs < rhs) {
            if (order === 'ascent') {
                [times, fst, snd] = await this.partitionByAscent(source, lhs, rhs, times, callback);
                times = await this.sortByOrder(source, lhs, fst - 1, order, times, callback);
                times = await this.sortByOrder(source, fst + 1, snd - 1, order, times, callback);
                times = await this.sortByOrder(source, snd + 1, rhs, order, times, callback);
            }

            if (order === 'descent') {
                [times, fst, snd] = await this.partitionByDescent(source, lhs, rhs, times, callback);
                times = await this.sortByOrder(source, snd + 1, rhs, order, times, callback);
                times = await this.sortByOrder(source, fst + 1, snd - 1, order, times, callback);
                times = await this.sortByOrder(source, lhs, fst - 1, order, times, callback);
            }
        }

        return times;
    }

    public async partitionByAscent(source: SortDataModel[], lhs: number, rhs: number, times: number, callback: (param: SortStateModel) => void): Promise<[number, number, number]> {
        if (rhs - lhs < this.THRESHOLD) {
            source[lhs].color = START_COLOR;
            source[rhs].color = FINAL_COLOR;
            callback({ times, datalist: source });

            times = await this._service.stableGapSortByAscent(source, lhs, rhs, 1, 1, times, callback);

            source[lhs].color = CLEAR_COLOR;
            source[rhs].color = CLEAR_COLOR;
            callback({ times, datalist: source });
            return [times, lhs, rhs];
        } else {
            let fst: number = lhs + 1, snd: number = rhs - 1, idx: number = lhs + 1;

            if (source[lhs].value > source[rhs].value) {
                await this._service.swapAndRender(source, false, true, lhs, rhs, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, times, callback);
            }
    
            while (idx <= snd) {
                source[lhs].color = START_COLOR;
                source[rhs].color = FINAL_COLOR;
                callback({ times, datalist: source });
    
                if (source[idx].value < source[lhs].value) {
                    await this._service.swapAndRender(source, false, true, idx, fst, PRIMARY_ONE_COLOR, SECONDARY_ONE_COLOR, ACCENT_ONE_COLOR, times, callback);
    
                    fst += 1;
                    idx += 1;
                    times += 1;
                } else if (source[idx].value > source[rhs].value) {
                    while (idx < snd && source[snd].value > source[rhs].value) {
                        snd -= 1;
                    }
    
                    await this._service.swapAndRender(source, false, true, idx, snd, PRIMARY_TWO_COLOR, SECONDARY_TWO_COLOR, ACCENT_TWO_COLOR, times, callback);
    
                    snd -= 1;
                    times += 1;
    
                    if (source[idx].value < source[lhs].value) {
                        await this._service.swapAndRender(source, false, true, idx, fst, PRIMARY_ONE_COLOR, SECONDARY_ONE_COLOR, ACCENT_ONE_COLOR, times, callback);
    
                        fst += 1;
                        times += 1;
                    }

                    idx += 1;
                } else {
                    source[idx].color = ACCENT_COLOR;
                    callback({ times, datalist: source });

                    await delay(SORT_DELAY_DURATION);

                    source[idx].color = CLEAR_COLOR;
                    callback({ times, datalist: source });

                    idx += 1;
                }
                
                source[lhs].color = CLEAR_COLOR;
                source[rhs].color = CLEAR_COLOR;
                callback({ times, datalist: source });
            }
    
            fst -= 1;
            snd += 1;

            await this._service.swapAndRender(source, false, true, lhs, fst, PRIMARY_ONE_COLOR, SECONDARY_ONE_COLOR, ACCENT_ONE_COLOR, times, callback);
            await this._service.swapAndRender(source, false, true, rhs, snd, PRIMARY_TWO_COLOR, SECONDARY_TWO_COLOR, ACCENT_TWO_COLOR, times, callback);
            return [times + 2, fst, snd];
        }
        
    }

    public async partitionByDescent(source: SortDataModel[], lhs: number, rhs: number, times: number, callback: (param: SortStateModel) => void): Promise<[number, number, number]> {
        if (rhs - lhs < this.THRESHOLD) {
            source[lhs].color = FINAL_COLOR;
            source[rhs].color = START_COLOR;
            callback({ times, datalist: source });

            times = await this._service.stableGapSortByDescent(source, lhs, rhs, 1, 1, times, callback);

            source[lhs].color = CLEAR_COLOR;
            source[rhs].color = CLEAR_COLOR;
            callback({ times, datalist: source });
            return [times, lhs, rhs];
        } else {
            let fst: number = lhs + 1, snd: number = rhs - 1, idx: number = rhs - 1;

            if (source[lhs].value < source[rhs].value) {
                await this._service.swapAndRender(source, false, true, lhs, rhs, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, times, callback);
            }

            while (idx >= fst) {
                source[lhs].color = FINAL_COLOR;
                source[rhs].color = START_COLOR;
                callback({ times, datalist: source });

                if (source[idx].value < source[rhs].value) {
                    await this._service.swapAndRender(source, false, true, idx, snd, PRIMARY_ONE_COLOR, SECONDARY_ONE_COLOR, ACCENT_ONE_COLOR, times, callback);

                    snd -= 1;
                    idx -= 1;
                    times += 1;
                } else if (source[idx].value > source[lhs].value) {
                    while (idx > fst && source[fst].value > source[lhs].value) {
                        fst += 1;
                    }

                    await this._service.swapAndRender(source, false, true, idx, fst, PRIMARY_TWO_COLOR, SECONDARY_TWO_COLOR, ACCENT_TWO_COLOR, times, callback);

                    fst += 1;
                    times += 1;

                    if (source[idx].value < source[rhs].value) {
                        await this._service.swapAndRender(source, false, true, idx, snd, PRIMARY_ONE_COLOR, SECONDARY_ONE_COLOR, ACCENT_ONE_COLOR, times, callback);

                        snd -= 1;
                        times += 1;
                    }

                    idx -= 1;
                } else {
                    source[idx].color = ACCENT_COLOR;
                    callback({ times, datalist: source });

                    await delay(SORT_DELAY_DURATION);

                    source[idx].color = CLEAR_COLOR;
                    callback({ times, datalist: source });
                    
                    idx -= 1;
                }
                
                source[lhs].color = CLEAR_COLOR;
                source[rhs].color = CLEAR_COLOR;
                callback({ times, datalist: source });
            }

            fst -= 1;
            snd += 1;

            await this._service.swapAndRender(source, false, true, lhs, fst, PRIMARY_ONE_COLOR, SECONDARY_ONE_COLOR, ACCENT_ONE_COLOR, times, callback);
            await this._service.swapAndRender(source, false, true, rhs, snd, PRIMARY_TWO_COLOR, SECONDARY_TWO_COLOR, ACCENT_TWO_COLOR, times, callback);
            return [times + 2, fst, snd];
        }
    }

}

/**
 * 双轴快速排序（迭代）
 */
@Injectable()
export class DualPivotIterativeQuickSortService extends BaseSortService {

    constructor(private _service: DualPivotRecursiveQuickSortService) {
        super();
    }

    protected override async sortByAscent(source: SortDataModel[], lhs: number, rhs: number, option: string | number | undefined, callback: (param: SortStateModel) => void): Promise<void> {
        let fst: number, snd: number, times: number = 0;

        this.stack.push(rhs);
        this.stack.push(lhs);

        while (this.stack.length > 0) {
            lhs = this.stack.pop() as number;
            rhs = this.stack.pop() as number;
            
            source[lhs].color = START_COLOR;
            source[rhs].color = FINAL_COLOR;
            callback({ times, datalist: source });

            [times, fst, snd] = await this._service.partitionByAscent(source, lhs, rhs, times, callback);

            source[lhs].color = CLEAR_COLOR;
            source[rhs].color = CLEAR_COLOR;
            callback({ times, datalist: source });

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
        }

        await delay(SORT_DELAY_DURATION);
        await complete(source, times, callback);
    }

    protected override async sortByDescent(source: SortDataModel[], lhs: number, rhs: number, option: string | number | undefined, callback: (param: SortStateModel) => void): Promise<void> {
        let fst: number, snd: number, times: number = 0;

        this.stack.push(lhs);
        this.stack.push(rhs);

        while (this.stack.length > 0) {
            rhs = this.stack.pop() as number;
            lhs = this.stack.pop() as number;
            
            source[lhs].color = FINAL_COLOR;
            source[rhs].color = START_COLOR;
            callback({ times, datalist: source });

            [times, fst, snd] = await this._service.partitionByDescent(source, lhs, rhs, times, callback);

            source[lhs].color = CLEAR_COLOR;
            source[rhs].color = CLEAR_COLOR;
            callback({ times, datalist: source });

            if (lhs < fst - 1) {
                this.stack.push(lhs);
                this.stack.push(fst - 1);
            }
            
            if (fst + 1 < snd - 1) {
                this.stack.push(fst + 1);
                this.stack.push(snd - 1);
            }

            if (snd + 1 < rhs) {
                this.stack.push(snd + 1);
                this.stack.push(rhs);
            }
        }

        await delay(SORT_DELAY_DURATION);
        await complete(source, times, callback);
    }

}
