import { Injectable } from "@angular/core";
import { floor } from "lodash";

import { SortDataModel, SortStateModel, SortOrder } from "../ngrx-store/sort.state";
import { delay } from "../../../public/global.utils";
import { SortToolsService } from "../ngrx-store/sort.service";
import { CLEAR_COLOR, ACCENT_COLOR, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_ONE_COLOR, ACCENT_TWO_COLOR, PRIMARY_ONE_COLOR, SECONDARY_ONE_COLOR, PRIMARY_TWO_COLOR, SECONDARY_TWO_COLOR, START_COLOR, FINAL_COLOR } from "../../../public/global.utils";
import { AbstractQuickSortService, PartitionMetaInfo } from "./base-sort.service";

/**
 * 单路快速排序（递归）
 */
@Injectable()
export class RecursiveQuickSortService extends AbstractQuickSortService {

    constructor(protected _service: SortToolsService) {
        super();
    }

    protected override async sortByAscent(source: SortDataModel[], lhs: number, rhs: number, option: string | number | undefined, callback: (param: SortStateModel) => void): Promise<void> {
        let times: number = await this.sortByOrder(source, lhs, rhs, 'ascent', 0, callback);
        await delay();
        await this.complete(source, times, callback);
    }

    protected override async sortByDescent(source: SortDataModel[], lhs: number, rhs: number, option: string | number | undefined, callback: (param: SortStateModel) => void): Promise<void> {
        let times: number = await this.sortByOrder(source, lhs, rhs, 'descent', 0, callback);
        await delay();
        await this.complete(source, times, callback);
    }

    protected override async sortByOrder(source: SortDataModel[], lhs: number, rhs: number, order: SortOrder, times: number, callback: (param: SortStateModel) => void): Promise<number> {
        if (lhs < rhs) {
            let partition: PartitionMetaInfo, mid: number;

            if (order === 'ascent') {
                partition = await this.partitionByAscent(source, lhs, rhs, times, callback);
                times = times = partition.times;
                mid = partition?.mid as number;

                times = await this.sortByOrder(source, lhs, mid - 1, order, times, callback);
                times = await this.sortByOrder(source, mid + 1, rhs, order, times, callback);
            }

            if (order === 'descent') {
                partition = await this.partitionByDescent(source, lhs, rhs, times, callback);
                times = partition.times;
                mid = partition?.mid as number;

                times = await this.sortByOrder(source, mid + 1, rhs, order, times, callback);
                times = await this.sortByOrder(source, lhs, mid - 1, order, times, callback);
            }
        }

        return times;
    }

    protected override async partitionByAscent(source: SortDataModel[], lhs: number, rhs: number, times: number, callback: (param: SortStateModel) => void): Promise<PartitionMetaInfo> {
        if (rhs - lhs < 24) {
            source[lhs].color = START_COLOR;
            source[rhs].color = FINAL_COLOR;
            callback({ times, datalist: source });

            times = await this._service.stableGapSortByAscent(source, lhs, rhs, 1, 1, times, callback);

            source[lhs].color = CLEAR_COLOR;
            source[rhs].color = CLEAR_COLOR;
            callback({ times, datalist: source });
            return { times, mid: rhs };
        } else {
            const pivot: number = source[rhs].value;
            let j: number = lhs - 1, completed: boolean = false, flag: boolean;
            
            for (let i = lhs; i <= rhs - 1; i++) {
                flag = source[i].value < pivot;

                if (flag) {
                    j += 1;
                }

                source[lhs].color = START_COLOR;
                source[rhs].color = FINAL_COLOR;
                callback({ times, datalist: source});

                [completed, times] = await this._service.swapAndRender(source, completed, flag, i, flag ? j : i, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, times, callback);
            }

            source[lhs].color = CLEAR_COLOR;
            source[rhs].color = CLEAR_COLOR;
            callback({ times, datalist: source });

            await this._service.swapAndRender(source, false, true, j + 1, rhs, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, times, callback);
            return { times: times + 1, mid: j + 1 };
        }
    }

    protected override async partitionByDescent(source: SortDataModel[], lhs: number, rhs: number, times: number, callback: (param: SortStateModel) => void): Promise<PartitionMetaInfo> {
        if (rhs - lhs < 24) {
            source[lhs].color = FINAL_COLOR;
            source[rhs].color = START_COLOR;
            callback({ times, datalist: source });
            
            times = await this._service.stableGapSortByDescent(source, lhs, rhs, 1, 1, times, callback);

            source[lhs].color = CLEAR_COLOR;
            source[rhs].color = CLEAR_COLOR;
            callback({ times, datalist: source });
            return { times, mid: rhs };
        } else {
            const pivot: number = source[lhs].value;
            let j: number = rhs + 1, completed: boolean = false, flag: boolean;
            
            for (let i = rhs; i >= lhs + 1; i--) {
                flag = source[i].value < pivot;

                if (flag) {
                    j -= 1;
                }

                source[lhs].color = FINAL_COLOR;
                source[rhs].color = START_COLOR;
                callback({ times, datalist: source});

                [completed, times] = await this._service.swapAndRender(source, completed, flag, i, flag ? j : i, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, times, callback);
            }
    
            source[lhs].color = CLEAR_COLOR;
            source[rhs].color = CLEAR_COLOR;
            callback({ times, datalist: source });

            await this._service.swapAndRender(source, false, true, j - 1, lhs, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, times, callback);
            return { times: times + 1, mid: j - 1 };
        }
    }

}

/**
 * 单路快速排序（迭代）
 */
@Injectable()
export class IterativeQuickSortService extends RecursiveQuickSortService {

    protected override async sortByAscent(source: SortDataModel[], lhs: number, rhs: number, option: string | number | undefined, callback: (param: SortStateModel) => void): Promise<void> {
        let partition: PartitionMetaInfo, mid: number, times: number = 0;

        this.stack.push(rhs);
        this.stack.push(lhs);
        
        while (this.stack.length > 0) {
            lhs = this.stack.pop() as number;
            rhs = this.stack.pop() as number;

            source[lhs].color = START_COLOR;
            source[rhs].color = FINAL_COLOR;
            callback({ times, datalist: source });
            
            partition = await this.partitionByAscent(source, lhs, rhs, times, callback);
            times = partition.times;
            mid = partition?.mid as number;

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

        await delay();
        await this.complete(source, times, callback);
    }

    protected override async sortByDescent(source: SortDataModel[], lhs: number, rhs: number, option: string | number | undefined, callback: (param: SortStateModel) => void): Promise<void> {
        let partition: PartitionMetaInfo, mid: number, times: number = 0;

        this.stack.push(lhs);
        this.stack.push(rhs);

        while (this.stack.length > 0) {
            rhs = this.stack.pop() as number;
            lhs = this.stack.pop() as number;

            source[lhs].color = FINAL_COLOR;
            source[rhs].color = START_COLOR;
            callback({ times, datalist: source });

            partition = await this.partitionByDescent(source, lhs, rhs, times, callback);
            times = partition.times;
            mid = partition?.mid as number;

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

        await delay();
        await this.complete(source, times, callback);
    }

}

/**
 * 二路快速排序（递归）
 */
@Injectable()
export class RecursiveTwoWayQuickSortService extends RecursiveQuickSortService {

    protected override async partitionByAscent(source: SortDataModel[], lhs: number, rhs: number, times: number, callback: (param: SortStateModel) => void): Promise<PartitionMetaInfo> {
        if (rhs - lhs < this.THRESHOLD) {
            source[lhs].color = START_COLOR;
            source[rhs].color = FINAL_COLOR;
            callback({ times, datalist: source});

            times = await this._service.stableGapSortByAscent(source, lhs, rhs, 1, 1, times, callback);

            source[lhs].color = CLEAR_COLOR;
            source[rhs].color = CLEAR_COLOR;
            callback({ times, datalist: source});
            return { times, mid: rhs };
        } else {
            const pivot: number = source[rhs].value;
            let i: number = lhs, j: number = rhs;
            
            while (i < j) {
                source[lhs].color = START_COLOR;
                source[rhs].color = FINAL_COLOR;
                callback({ times, datalist: source});

                while (i < j && source[i].value <= pivot) {
                    await this._service.swapAndRender(source, false, false, i, i, ACCENT_ONE_COLOR, ACCENT_ONE_COLOR, ACCENT_ONE_COLOR, times, callback);

                    i += 1;
                }

                while (i < j && source[j].value >= pivot) {
                    await this._service.swapAndRender(source, false, false, j, j, ACCENT_TWO_COLOR, ACCENT_TWO_COLOR, ACCENT_TWO_COLOR, times, callback);

                    j -= 1;
                }
                
                await this._service.swapAndRender(source, false, true, i, j, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, times, callback);

                times += 1;
            }

            source[lhs].color = CLEAR_COLOR;
            source[rhs].color = CLEAR_COLOR;
            callback({ times, datalist: source});

            await this._service.swapAndRender(source, false, true, i, rhs, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, times, callback);
            return { times: times + 1, mid: i};
        }
    }

    protected override async partitionByDescent(source: SortDataModel[], lhs: number, rhs: number, times: number, callback: (param: SortStateModel) => void): Promise<any> {
        if (rhs - lhs < this.THRESHOLD) {
            source[lhs].color = FINAL_COLOR;
            source[rhs].color = START_COLOR;
            callback({ times, datalist: source});

            times = await this._service.stableGapSortByDescent(source, lhs, rhs, 1, 1, times, callback);

            source[lhs].color = CLEAR_COLOR;
            source[rhs].color = CLEAR_COLOR;
            callback({ times, datalist: source});
            return { times, mid: rhs };
        } else {
            const pivot: number = source[lhs].value;
            let i: number = rhs, j: number = lhs;
            
            while (i > j) {
                source[lhs].color = FINAL_COLOR;
                source[rhs].color = START_COLOR;
                callback({ times, datalist: source});

                while (i > j && source[i].value <= pivot) {
                    await this._service.swapAndRender(source, false, false, i, i, ACCENT_ONE_COLOR, ACCENT_ONE_COLOR, ACCENT_ONE_COLOR, times, callback);
    
                    i -= 1;
                }
    
                while (i > j && source[j].value >= pivot) {
                    await this._service.swapAndRender(source, false, false, j, j, ACCENT_TWO_COLOR, ACCENT_TWO_COLOR, ACCENT_TWO_COLOR, times, callback);
                    
                    j += 1;
                }
    
                await this._service.swapAndRender(source, false, true, i, j, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, times, callback);

                times += 1;
            }
    
            source[lhs].color = CLEAR_COLOR;
            source[rhs].color = CLEAR_COLOR;
            callback({ times, datalist: source});
            
            await this._service.swapAndRender(source, false, true, i, lhs, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, times, callback);
            return { times: times + 1, mid: i};
        }
    }

}

/**
 * 二路快速排序（迭代）
 */
@Injectable()
export class IterativeTwoWayQuickSortService extends RecursiveTwoWayQuickSortService {

    protected override async sortByAscent(source: SortDataModel[], lhs: number, rhs: number, option: string | number | undefined, callback: (param: SortStateModel) => void): Promise<void> {
        let partition: PartitionMetaInfo, mid: number, times: number = 0;

        this.stack.push(rhs);
        this.stack.push(lhs);

        while (this.stack.length > 0) {
            lhs = this.stack.pop() as number;
            rhs = this.stack.pop() as number;

            source[lhs].color = START_COLOR;
            source[rhs].color = FINAL_COLOR;
            callback({ times, datalist: source });

            partition = await this.partitionByAscent(source, lhs, rhs, times, callback);
            times = partition.times;
            mid = partition?.mid as number;

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

        await delay();
        await this.complete(source, times, callback);
    }

    protected override async sortByDescent(source: SortDataModel[], lhs: number, rhs: number, option: string | number | undefined, callback: (param: SortStateModel) => void): Promise<void> {
        let partition: PartitionMetaInfo, mid: number, times: number = 0;

        this.stack.push(lhs);
        this.stack.push(rhs);

        while (this.stack.length > 0) {
            rhs = this.stack.pop() as number;
            lhs = this.stack.pop() as number;

            source[lhs].color = FINAL_COLOR;
            source[rhs].color = START_COLOR;
            callback({ times, datalist: source });

            partition = await this.partitionByDescent(source, lhs, rhs, times, callback);
            times = partition.times;
            mid = partition?.mid as number;

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

        await delay();
        await this.complete(source, times, callback);
    }

}

/**
 * 平均值快速排序（递归）
 */
@Injectable()
export class RecursiveAverageQuickSortService extends RecursiveTwoWayQuickSortService {

    protected override async sortByOrder(source: SortDataModel[], lhs: number, rhs: number, order: SortOrder, times: number, callback: (param: SortStateModel) => void): Promise<number> {
        if (lhs < rhs) {
            let partition: PartitionMetaInfo, mid: number;

            if (order === 'ascent') {
                partition = await this.partitionByAscent(source, lhs, rhs, times, callback);
                times = partition.times;
                mid = partition?.mid as number;

                times = await this.sortByOrder(source, lhs, mid - 1, order, times, callback);
                times = await this.sortByOrder(source, mid, rhs, order, times, callback);
            }

            if (order === 'descent') {
                partition = await this.partitionByDescent(source, lhs, rhs, times, callback);
                times = partition.times;
                mid = partition?.mid as number;

                times = await this.sortByOrder(source, mid + 1, rhs, order, times, callback);
                times = await this.sortByOrder(source, lhs, mid, order, times, callback);
            }
        }

        return times;
    }

    protected override async partitionByAscent(source: SortDataModel[], lhs: number, rhs: number, times: number, callback: (param: SortStateModel) => void): Promise<PartitionMetaInfo> {
        if (rhs - lhs < this.THRESHOLD) {
            source[lhs].color = START_COLOR;
            source[rhs].color = FINAL_COLOR;
            callback({ times, datalist: source });

            times = await this._service.stableGapSortByAscent(source, lhs, rhs, 1, 1, times, callback);

            source[lhs].color = CLEAR_COLOR;
            source[rhs].color = CLEAR_COLOR;
            callback({ times, datalist: source });
            return { times, mid: rhs };
        } else {
            const pivot: number = await this.calcAverageByAscent(source, lhs, rhs, 0, times, callback);
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

            return { times, mid: i };
        }
    }

    protected override async partitionByDescent(source: SortDataModel[], lhs: number, rhs: number, times: number, callback: (param: SortStateModel) => void): Promise<PartitionMetaInfo> {
        if (rhs - lhs < this.THRESHOLD) {
            source[lhs].color = FINAL_COLOR;
            source[rhs].color = START_COLOR;
            callback({ times, datalist: source });
            
            times = await this._service.stableGapSortByDescent(source, lhs, rhs, 1, 1, times, callback);
            
            source[lhs].color = CLEAR_COLOR;
            source[rhs].color = CLEAR_COLOR;
            callback({ times, datalist: source });
            return { times, mid: lhs };
        } else {
            const pivot: number = await this.calcAverageByDescent(source, lhs, rhs, 0, times, callback);
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
            
            return { times, mid: i };
        }
    }

    private async calcAverageByAscent(source: SortDataModel[], lhs: number, rhs: number, sum: number, times: number, callback: (param: SortStateModel) => void): Promise<number> {
        let stack: number[] | null = Array.from([]), mid: number, cnt: number = rhs - lhs + 1;

        stack.push(rhs);
        stack.push(lhs);
        
        while (stack.length > 0) {
            lhs = stack.pop() as number;
            rhs = stack.pop() as number;
            
            if (rhs - lhs < this.THRESHOLD) {
                for (let i = lhs; i <= rhs; i++) {
                    sum += source[i].value;

                    source[i].color = ACCENT_COLOR;
                    callback({ times, datalist: source });

                    await delay();

                    source[i].color = CLEAR_COLOR;
                    callback({ times, datalist: source });
                }
            } else {
                mid = floor((rhs - lhs) * 0.5 + lhs, 0);

                if (mid + 1 < rhs) {
                    stack.push(rhs);
                    stack.push(mid + 1);
                }

                if (lhs < mid) {
                    stack.push(mid);
                    stack.push(lhs);
                }
            }
        }
        
        stack = null;
        return sum / cnt;
    }

    private async calcAverageByDescent(source: SortDataModel[], lhs: number, rhs: number, sum: number, times: number, callback: (param: SortStateModel) => void): Promise<number> {
        let stack: number[] | null = Array.from([]), mid: number, cnt: number = rhs - lhs + 1;

        stack.push(lhs);
        stack.push(rhs);

        while (stack.length > 0) {
            rhs = stack.pop() as number;
            lhs = stack.pop() as number;

            if (rhs - lhs < this.THRESHOLD) {
                for (let i = rhs; i >= lhs; i--) {
                    sum += source[i].value;

                    source[i].color = ACCENT_COLOR;
                    callback({ times, datalist: source });

                    await delay();

                    source[i].color = CLEAR_COLOR;
                    callback({ times, datalist: source });
                }
            } else {
                mid = Math.floor((rhs - lhs) * 0.5 + lhs);

                if (lhs < mid) {
                    stack.push(lhs);
                    stack.push(mid);
                }

                if (mid + 1 < rhs) {
                    stack.push(mid + 1);
                    stack.push(rhs);
                }
            }
        }
        
        stack = null;
        return sum / cnt;
    }

}

/**
 * 平均值快速排序（迭代）
 */
@Injectable()
export class IterativeAverageQuickSortService extends RecursiveAverageQuickSortService {

    protected override async sortByAscent(source: SortDataModel[], lhs: number, rhs: number, option: string | number | undefined, callback: (param: SortStateModel) => void): Promise<void> {
        let partition: PartitionMetaInfo, mid: number, times: number = 0;

        this.stack.push(rhs);
        this.stack.push(lhs);
        
        while (this.stack.length > 0) {
            lhs = this.stack.pop() as number;
            rhs = this.stack.pop() as number;
            
            if (lhs >= rhs) continue;

            source[lhs].color = START_COLOR;
            source[rhs].color = FINAL_COLOR;
            callback({ times, datalist: source });

            partition = await this.partitionByAscent(source, lhs, rhs, times, callback);
            times = partition.times;
            mid = partition?.mid as number;

            source[lhs].color = CLEAR_COLOR;
            source[rhs].color = CLEAR_COLOR;
            callback({ times, datalist: source });

            if (mid < rhs) {
                this.stack.push(rhs);
                this.stack.push(mid);
            }

            if (lhs < mid - 1) {
                this.stack.push(mid - 1);
                this.stack.push(lhs);
            }
        }

        await delay();
        await this.complete(source, times, callback);
    }

    protected override async sortByDescent(source: SortDataModel[], lhs: number, rhs: number, option: string | number | undefined, callback: (param: SortStateModel) => void): Promise<void> {
        let partition: PartitionMetaInfo, mid: number, times: number = 0;

        this.stack.push(lhs);
        this.stack.push(rhs);

        while (this.stack.length > 0) {
            rhs = this.stack.pop() as number;
            lhs = this.stack.pop() as number;

            if (lhs >= rhs) continue;

            source[lhs].color = FINAL_COLOR;
            source[rhs].color = START_COLOR;
            callback({ times, datalist: source });

            partition = await this.partitionByDescent(source, lhs, rhs, times, callback);
            times = partition.times;
            mid = partition?.mid as number;

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

        await delay();
        await this.complete(source, times, callback);
    }

}

/**
 * 三路快速排序（递归）
 */
@Injectable()
export class ThreeWayRecursiveQuickSortService extends RecursiveTwoWayQuickSortService {

    protected override async sortByOrder(source: SortDataModel[], lhs: number, rhs: number, order: SortOrder, times: number, callback: (param: SortStateModel) => void): Promise<number> {
        if (lhs < rhs) {
            let partition: PartitionMetaInfo, fst: number, snd: number;

            if (order === 'ascent') {
                partition = await this.partitionByAscent(source, lhs, rhs, times, callback);
                fst = partition?.fst as number;
                snd = partition?.snd as number;
                times = partition.times;

                times = await this.sortByOrder(source, lhs, fst - 1, order, times, callback);
                times = await this.sortByOrder(source, snd + 1, rhs, order, times, callback);
            }

            if (order === 'descent') {
                partition = await this.partitionByDescent(source, lhs, rhs, times, callback);
                fst = partition?.fst as number;
                snd = partition?.snd as number;
                times = partition.times;

                times = await this.sortByOrder(source, snd + 1, rhs, order, times, callback);
                times = await this.sortByOrder(source, lhs, fst - 1, order, times, callback);
            }
        }

        return times;
    }

    protected override async partitionByAscent(source: SortDataModel[], lhs: number, rhs: number, times: number, callback: (param: SortStateModel) => void): Promise<PartitionMetaInfo> {
        if (rhs - lhs < this.THRESHOLD) {
            source[lhs].color = START_COLOR;
            source[rhs].color = FINAL_COLOR;
            callback({ times, datalist: source});

            times = await this._service.stableGapSortByAscent(source, lhs, rhs, 1, 1, times, callback);

            source[lhs].color = CLEAR_COLOR;
            source[rhs].color = CLEAR_COLOR;
            callback({ times, datalist: source});
            return { times, fst: lhs, snd: rhs };
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

                    await delay();

                    source[fst].color = CLEAR_COLOR;
                    source[snd].color = CLEAR_COLOR;
                    source[i].color = CLEAR_COLOR;
                    callback({ times, datalist: source});

                    i -= 1;
                }
            }

            source[lhs].color = CLEAR_COLOR;
            source[rhs].color = CLEAR_COLOR;
            callback({ times, datalist: source});
            return { times, fst, snd };
        }
    }

    protected override async partitionByDescent(source: SortDataModel[], lhs: number, rhs: number, times: number, callback: (param: SortStateModel) => void): Promise<PartitionMetaInfo> {
        if (rhs - lhs < this.THRESHOLD) {
            source[lhs].color = FINAL_COLOR;
            source[rhs].color = START_COLOR;
            callback({ times, datalist: source});

            times = await this._service.stableGapSortByDescent(source, lhs, rhs, 1, 1, times, callback);

            source[lhs].color = CLEAR_COLOR;
            source[rhs].color = CLEAR_COLOR;
            callback({ times, datalist: source});
            return { times, fst: lhs, snd: rhs };
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
                    source[fst].color = SECONDARY_COLOR;
                    source[snd].color = PRIMARY_COLOR;
                    source[i].color = ACCENT_COLOR;
                    callback({ times, datalist: source});

                    await delay();

                    source[fst].color = CLEAR_COLOR;
                    source[snd].color = CLEAR_COLOR;
                    source[i].color = CLEAR_COLOR;
                    callback({ times, datalist: source});

                    i += 1;
                }
            }

            source[lhs].color = CLEAR_COLOR;
            source[rhs].color = CLEAR_COLOR;
            callback({ times, datalist: source});
            return { times, fst, snd };
        }
    }

}

/**
 * 三路快速排序（迭代）
 */
@Injectable()
export class ThreeWayIterativeQuickSortService extends ThreeWayRecursiveQuickSortService {

    protected override async sortByAscent(source: SortDataModel[], lhs: number, rhs: number, option: string | number | undefined, callback: (param: SortStateModel) => void): Promise<void> {
        let partition: PartitionMetaInfo, fst: number, snd: number, times: number = 0;

        this.stack.push(rhs);
        this.stack.push(lhs);

        while (this.stack.length > 0) {
            lhs = this.stack.pop() as number;
            rhs = this.stack.pop() as number;

            source[lhs].color = START_COLOR;
            source[rhs].color = FINAL_COLOR;
            callback({ times, datalist: source });
            
            partition = await this.partitionByAscent(source, lhs, rhs, times, callback);
            times = partition.times;
            fst = partition?.fst as number;
            snd = partition?.snd as number;

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

        await delay();
        await this.complete(source, times, callback);
    }

    protected override async sortByDescent(source: SortDataModel[], lhs: number, rhs: number, option: string | number | undefined, callback: (param: SortStateModel) => void): Promise<void> {
        let partition: PartitionMetaInfo, fst: number, snd: number, times: number = 0;

        this.stack.push(lhs);
        this.stack.push(rhs);

        while (this.stack.length > 0) {
            rhs = this.stack.pop() as number;
            lhs = this.stack.pop() as number;

            source[lhs].color = FINAL_COLOR;
            source[rhs].color = START_COLOR;
            callback({ times, datalist: source });
            
            partition = await this.partitionByDescent(source, lhs, rhs, times, callback);
            times = partition.times;
            fst = partition?.fst as number;
            snd = partition?.snd as number;

            source[lhs].color = CLEAR_COLOR;
            source[rhs].color = CLEAR_COLOR;
            callback({ times, datalist: source });

            if (lhs < fst - 1) {
                this.stack.push(lhs);
                this.stack.push(fst - 1);
            }

            if (snd + 1 < rhs) {
                this.stack.push(snd + 1);
                this.stack.push(rhs);
            }
        }

        await delay();
        await this.complete(source, times, callback);
    }

}

/**
 * 双轴快速排序（递归）
 */
@Injectable()
export class RecursiveDualPivotQuickSortService extends RecursiveQuickSortService {

    protected override async sortByOrder(source: SortDataModel[], lhs: number, rhs: number, order: SortOrder, times: number, callback: (param: SortStateModel) => void): Promise<number> {
        let partition: PartitionMetaInfo, fst: number, snd: number;

        if (lhs < rhs) {
            if (order === 'ascent') {
                partition = await this.partitionByAscent(source, lhs, rhs, times, callback);
                times = partition.times;
                fst = partition?.fst as number;
                snd = partition?.snd as number;

                times = await this.sortByOrder(source, lhs, fst - 1, order, times, callback);
                times = await this.sortByOrder(source, fst + 1, snd - 1, order, times, callback);
                times = await this.sortByOrder(source, snd + 1, rhs, order, times, callback);
            }

            if (order === 'descent') {
                partition = await this.partitionByDescent(source, lhs, rhs, times, callback);
                times = partition.times;
                fst = partition?.fst as number;
                snd = partition?.snd as number;

                times = await this.sortByOrder(source, snd + 1, rhs, order, times, callback);
                times = await this.sortByOrder(source, fst + 1, snd - 1, order, times, callback);
                times = await this.sortByOrder(source, lhs, fst - 1, order, times, callback);
            }
        }

        return times;
    }

    protected override async partitionByAscent(source: SortDataModel[], lhs: number, rhs: number, times: number, callback: (param: SortStateModel) => void): Promise<PartitionMetaInfo> {
        if (rhs - lhs < this.THRESHOLD) {
            source[lhs].color = START_COLOR;
            source[rhs].color = FINAL_COLOR;
            callback({ times, datalist: source });

            times = await this._service.stableGapSortByAscent(source, lhs, rhs, 1, 1, times, callback);

            source[lhs].color = CLEAR_COLOR;
            source[rhs].color = CLEAR_COLOR;
            callback({ times, datalist: source });
            return { times, fst: lhs, snd: rhs };
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

                    await delay();

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
            return { times: times + 2, fst, snd };
        }
        
    }

    protected override async partitionByDescent(source: SortDataModel[], lhs: number, rhs: number, times: number, callback: (param: SortStateModel) => void): Promise<PartitionMetaInfo> {
        if (rhs - lhs < this.THRESHOLD) {
            source[lhs].color = FINAL_COLOR;
            source[rhs].color = START_COLOR;
            callback({ times, datalist: source });

            times = await this._service.stableGapSortByDescent(source, lhs, rhs, 1, 1, times, callback);

            source[lhs].color = CLEAR_COLOR;
            source[rhs].color = CLEAR_COLOR;
            callback({ times, datalist: source });
            return { times, fst: lhs, snd: rhs };
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

                    await delay();

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
            return { times: times + 2, fst, snd };
        }
    }

}

/**
 * 双轴快速排序（迭代）
 */
@Injectable()
export class IterativeDualPivotQuickSortService extends RecursiveDualPivotQuickSortService {

    protected override async sortByAscent(source: SortDataModel[], lhs: number, rhs: number, option: string | number | undefined, callback: (param: SortStateModel) => void): Promise<void> {
        let partition: PartitionMetaInfo, fst: number, snd: number, times: number = 0;

        this.stack.push(rhs);
        this.stack.push(lhs);

        while (this.stack.length > 0) {
            lhs = this.stack.pop() as number;
            rhs = this.stack.pop() as number;
            
            source[lhs].color = START_COLOR;
            source[rhs].color = FINAL_COLOR;
            callback({ times, datalist: source });

            partition = await this.partitionByAscent(source, lhs, rhs, times, callback);
            times = partition.times;
            fst = partition?.fst as number;
            snd = partition?.snd as number;

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

        await delay();
        await this.complete(source, times, callback);
    }

    protected override async sortByDescent(source: SortDataModel[], lhs: number, rhs: number, option: string | number | undefined, callback: (param: SortStateModel) => void): Promise<void> {
        let partition: PartitionMetaInfo, fst: number, snd: number, times: number = 0;

        this.stack.push(lhs);
        this.stack.push(rhs);

        while (this.stack.length > 0) {
            rhs = this.stack.pop() as number;
            lhs = this.stack.pop() as number;
            
            source[lhs].color = FINAL_COLOR;
            source[rhs].color = START_COLOR;
            callback({ times, datalist: source });

            partition = await this.partitionByDescent(source, lhs, rhs, times, callback);
            times = partition.times;
            fst = partition?.fst as number;
            snd = partition?.snd as number;

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

        await delay();
        await this.complete(source, times, callback);
    }

}
