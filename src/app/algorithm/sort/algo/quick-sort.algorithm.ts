import { ceil, floor, random } from "lodash";

import { SortDataModel, SortStateModel, SortOrder, SortOption } from "../ngrx-store/sort.state";

import { delay } from "../../../public/global.utils";
import { CLEAR_COLOR, ACCENT_COLOR, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_ONE_COLOR, ACCENT_TWO_COLOR, PRIMARY_ONE_COLOR, SECONDARY_ONE_COLOR, PRIMARY_TWO_COLOR, SECONDARY_TWO_COLOR, START_COLOR, FINAL_COLOR } from "../../../public/global.utils";

import { AbstractQuickSortAlgorithm, PartitionMetaInfo } from "../pattern/sort-temp.pattern";
import { SortToolsService } from "../ngrx-store/sort.service";
import { InsertionSortAlgorithm } from "./insertion-sort.algorithm";

/**
 * 单路快速排序（递归）
 */
export class RecursiveQuickSortAlgorithm extends AbstractQuickSortAlgorithm {

    protected insertSort: InsertionSortAlgorithm | null = null;

    constructor(protected override _service: SortToolsService) {
        super(_service);

        if (this.insertSort === null) this.insertSort = new InsertionSortAlgorithm(_service);
    }

    protected override async sortByAscent(source: SortDataModel[], lhs: number, rhs: number, option: SortOption, callback: (param: SortStateModel) => void): Promise<void> {
        let times: number = rhs - lhs + 1 > 384 
            ? await this.tailSortByOrder(source, lhs, rhs, 'ascent', 0, callback) 
            : await this.sortByOrder(source, lhs, rhs, 'ascent', 0, callback);
        
        await delay();
        await this.complete(source, times, callback);
    }

    protected override async sortByDescent(source: SortDataModel[], lhs: number, rhs: number, option: SortOption, callback: (param: SortStateModel) => void): Promise<void> {
        let times: number = rhs - lhs + 1 > 384 
            ? await this.tailSortByOrder(source, lhs, rhs, 'descent', 0, callback) 
            : await this.sortByOrder(source, lhs, rhs, 'descent', 0, callback);
        
        await delay();
        await this.complete(source, times, callback);
    }

    protected override async sortByOrder(source: SortDataModel[], lhs: number, rhs: number, order: SortOrder, times: number, callback: (param: SortStateModel) => void): Promise<number> {
        if (lhs < rhs) {
            let partition: PartitionMetaInfo, mid: number;

            if (order === 'ascent') {
                partition = await this.partitionByAscent(source, lhs, rhs, times, callback);
                times = partition.times;
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

    protected override async tailSortByOrder(source: SortDataModel[], lhs: number, rhs: number, order: SortOrder, times: number, callback: (param: SortStateModel) => void): Promise<number> {
        let partition: PartitionMetaInfo, mid: number;

        while (lhs < rhs) {
            if (order === 'ascent') {
                partition = await this.partitionByAscent(source, lhs, rhs, times, callback);
                mid = partition?.mid as number;

                times = await this.tailSortByOrder(source, lhs, mid - 1, order, partition.times, callback);
                lhs = mid + 1;
            }

            if (order === 'descent') {
                partition = await this.partitionByDescent(source, lhs, rhs, times, callback);
                mid = partition?.mid as number;

                times = await this.tailSortByOrder(source, mid + 1, rhs, order, partition.times, callback);
                rhs = mid - 1;
            }
        }

        return times;
    }

    protected override async partitionByAscent(source: SortDataModel[], lhs: number, rhs: number, times: number, callback: (param: SortStateModel) => void): Promise<PartitionMetaInfo> {
        const pivot: number = source[rhs].value;
        let j: number = lhs - 1, flag: boolean;
        
        for (let i = lhs; i <= rhs - 1; i++) {
            flag = source[i].value < pivot;

            if (flag) j += 1;

            source[lhs].color = START_COLOR;
            source[rhs].color = FINAL_COLOR;
            callback({ times, datalist: source});

            times = await this.exchange(source, flag, i, flag ? j : i, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, times, callback);
        }

        times = await this.dualSweep(source, lhs, rhs, START_COLOR, FINAL_COLOR, times, callback);
        times = await this.exchange(source, true, j + 1, rhs, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, times, callback);
        return { times: times + 1, mid: j + 1 };
    }

    protected override async partitionByDescent(source: SortDataModel[], lhs: number, rhs: number, times: number, callback: (param: SortStateModel) => void): Promise<PartitionMetaInfo> {
        const pivot: number = source[lhs].value;
        let j: number = rhs + 1, flag: boolean;
        
        for (let i = rhs; i >= lhs + 1; i--) {
            flag = source[i].value < pivot;

            if (flag) j -= 1;

            source[lhs].color = FINAL_COLOR;
            source[rhs].color = START_COLOR;
            callback({ times, datalist: source});

            times = await this.exchange(source, flag, i, flag ? j : i, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, times, callback);
        }

        times = await this.dualSweep(source, lhs, rhs, FINAL_COLOR, START_COLOR, times, callback);
        times = await this.exchange(source, true, j - 1, lhs, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, times, callback);
        return { times: times + 1, mid: j - 1 };
    }

}

/**
 * 单路快速排序（迭代）
 */
export class IterativeQuickSortAlgorithm extends RecursiveQuickSortAlgorithm {

    protected override async sortByAscent(source: SortDataModel[], lhs: number, rhs: number, option: SortOption, callback: (param: SortStateModel) => void): Promise<void> {
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

    protected override async sortByDescent(source: SortDataModel[], lhs: number, rhs: number, option: SortOption, callback: (param: SortStateModel) => void): Promise<void> {
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
export class RecursiveTwoWayQuickSortAlgorithm extends RecursiveQuickSortAlgorithm {

    protected override async sortByOrder(source: SortDataModel[], lhs: number, rhs: number, order: SortOrder, times: number, callback: (param: SortStateModel) => void): Promise<number> {
        return rhs - lhs + 1 <= this.THRESHOLD 
            ? await this.renderByOrder(source, lhs, rhs, order, times, callback)
            : await super.sortByOrder(source, lhs, rhs, order, times, callback);
    }

    protected override async tailSortByOrder(source: SortDataModel[], lhs: number, rhs: number, order: SortOrder, times: number, callback: (param: SortStateModel) => void): Promise<number> {
        return rhs - lhs + 1 <= this.THRESHOLD 
            ? await this.renderByOrder(source, lhs, rhs, order, times, callback)
            : await super.tailSortByOrder(source, lhs, rhs, order, times, callback);
    }

    protected override async partitionByAscent(source: SortDataModel[], lhs: number, rhs: number, times: number, callback: (param: SortStateModel) => void): Promise<PartitionMetaInfo> {
        const pivot: number = source[rhs].value;
        let i: number = lhs, j: number = rhs;
        
        while (i < j) {
            source[lhs].color = START_COLOR;
            source[rhs].color = FINAL_COLOR;
            callback({ times, datalist: source});

            while (i < j && source[i].value <= pivot) {
                times = await this.dualSweep(source, i, j, PRIMARY_COLOR, SECONDARY_COLOR, times, callback);

                i += 1;
            }

            while (i < j && source[j].value >= pivot) {
                times = await this.dualSweep(source, i, j, PRIMARY_COLOR, SECONDARY_COLOR, times, callback);

                j -= 1;
            }
            
            times = await this.exchange(source, true, i, j, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, times, callback);
        }

        times = await this.dualSweep(source, lhs, rhs, START_COLOR, FINAL_COLOR, times, callback);
        times = await this.exchange(source, true, i, rhs, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, times, callback);
        return { times, mid: i};
    }

    protected override async partitionByDescent(source: SortDataModel[], lhs: number, rhs: number, times: number, callback: (param: SortStateModel) => void): Promise<PartitionMetaInfo> {
        const pivot: number = source[lhs].value;
        let i: number = rhs, j: number = lhs;
        
        while (i > j) {
            source[lhs].color = FINAL_COLOR;
            source[rhs].color = START_COLOR;
            callback({ times, datalist: source});

            while (i > j && source[i].value <= pivot) {
                times = await this.dualSweep(source, i, j, PRIMARY_COLOR, SECONDARY_COLOR, times, callback);

                i -= 1;
            }

            while (i > j && source[j].value >= pivot) {
                times = await this.dualSweep(source, i, j, PRIMARY_COLOR, SECONDARY_COLOR, times, callback);
                
                j += 1;
            }

            times = await this.exchange(source, true, i, j, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, times, callback);
        }

        times = await this.dualSweep(source, lhs, rhs, FINAL_COLOR, START_COLOR, times, callback);
        times = await this.exchange(source, true, i, lhs, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, times, callback);
        return { times, mid: i};
    }

    protected async renderByOrder(source: SortDataModel[], lhs: number, rhs: number, order: SortOrder, times: number, callback: (param: SortStateModel) => void): Promise<number> {
        if (this.insertSort === null) throw new Error(`错误：引用对象${this.insertSort}未被初始化。`);

        if (order === 'ascent') {
            source[lhs].color = START_COLOR;
            source[rhs].color = FINAL_COLOR;
        }
        
        if (order === 'descent') {
            source[lhs].color = FINAL_COLOR;
            source[rhs].color = START_COLOR;
        }
        
        callback({ times, datalist: source});

        [times] = await this.insertSort.sortByOrder(source, lhs, rhs, 1, 1, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, order, times, callback);

        source[lhs].color = CLEAR_COLOR;
        source[rhs].color = CLEAR_COLOR;
        callback({ times, datalist: source});

        return times;
    }

}

/**
 * 二路快速排序（迭代）
 */
export class IterativeTwoWayQuickSortAlgorithm extends RecursiveTwoWayQuickSortAlgorithm {

    protected override async sortByAscent(source: SortDataModel[], lhs: number, rhs: number, option: SortOption, callback: (param: SortStateModel) => void): Promise<void> {
        let partition: PartitionMetaInfo, mid: number, times: number = 0;

        this.stack.push(rhs);
        this.stack.push(lhs);

        while (this.stack.length > 0) {
            lhs = this.stack.pop() as number;
            rhs = this.stack.pop() as number;

            if (rhs - lhs + 1 <= this.THRESHOLD) {
                times = await this.renderByOrder(source, lhs, rhs, 'ascent', times, callback);
            } else {
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
        }

        await delay();
        await this.complete(source, times, callback);
    }

    protected override async sortByDescent(source: SortDataModel[], lhs: number, rhs: number, option: SortOption, callback: (param: SortStateModel) => void): Promise<void> {
        let partition: PartitionMetaInfo, mid: number, times: number = 0;

        this.stack.push(lhs);
        this.stack.push(rhs);

        while (this.stack.length > 0) {
            rhs = this.stack.pop() as number;
            lhs = this.stack.pop() as number;

            if (rhs - lhs + 1 <= this.THRESHOLD) {
                times = await this.renderByOrder(source, lhs, rhs, 'descent', times, callback);
            } else {
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
        }

        await delay();
        await this.complete(source, times, callback);
    }

}

/**
 * 平均值快速排序（递归）
 */
export class RecursiveAverageQuickSortAlgorithm extends RecursiveTwoWayQuickSortAlgorithm {

    protected override async sortByOrder(source: SortDataModel[], lhs: number, rhs: number, order: SortOrder, times: number, callback: (param: SortStateModel) => void): Promise<number> {
        if (rhs - lhs + 1 <= this.THRESHOLD) {
            times = await this.renderByOrder(source, lhs, rhs, order, times, callback);
        } else {
            let partition: PartitionMetaInfo, fst: number, snd: number;
            
            if (order === 'ascent') {
                partition = await this.partitionByAscent(source, lhs, rhs, times, callback);
                fst = partition?.fst as number;
                snd = partition?.snd as number;
                
                times = await this.sortByOrder(source, lhs, fst, order, partition.times, callback);
                times = await this.sortByOrder(source, snd, rhs, order, partition.times, callback);
            }

            if (order === 'descent') {
                partition = await this.partitionByDescent(source, lhs, rhs, times, callback);
                fst = partition?.fst as number;
                snd = partition?.snd as number;

                times = await this.sortByOrder(source, snd, rhs, order, partition.times, callback);
                times = await this.sortByOrder(source, lhs, fst, order, partition.times, callback);
            }
        }

        return times;
    }

    protected override async tailSortByOrder(source: SortDataModel[], lhs: number, rhs: number, order: SortOrder, times: number, callback: (param: SortStateModel) => void): Promise<number> {
        if (rhs - lhs + 1 <= this.THRESHOLD) {
            times = await this.renderByOrder(source, lhs, rhs, order, times, callback);
        } else {
            let partition: PartitionMetaInfo;

            while (lhs < rhs) {
                if (order === 'ascent') {
                    partition = await this.partitionByAscent(source, lhs, rhs, times, callback);                
                    times = await this.sortByOrder(source, lhs, partition?.fst as number, order, partition.times, callback);
    
                    lhs = partition?.snd as number;
                }
    
                if (order === 'descent') {
                    partition = await this.partitionByDescent(source, lhs, rhs, times, callback);
                    times = await this.sortByOrder(source, partition?.snd as number, rhs, order, partition.times, callback);
    
                    rhs = partition?.fst as number;
                }
            }
        }
        
        return times;
    }

    protected override async partitionByAscent(source: SortDataModel[], lhs: number, rhs: number, times: number, callback: (param: SortStateModel) => void): Promise<PartitionMetaInfo> {
        let i: number = lhs, j: number = rhs, pivot: number = this.calcPivot(source, lhs, rhs);
            
        while (i < j) {
            source[lhs].color = START_COLOR;
            source[rhs].color = FINAL_COLOR;
            callback({ times, datalist: source });

            while (i < j && source[i].value <= pivot) {
                times = await this.dualSweep(source, i, j, PRIMARY_COLOR, SECONDARY_COLOR, times, callback);

                i += 1;
            }

            while (i < j && source[j].value >= pivot) {
                times = await this.dualSweep(source, i, j, PRIMARY_COLOR, SECONDARY_COLOR, times, callback);
                
                j -= 1;
            }

            times = await this.exchange(source, true, i, j, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, times, callback);
        }

        return { 
            times: await this.dualSweep(source, lhs, rhs, START_COLOR, FINAL_COLOR, times, callback), 
            fst: i - 1, snd: i 
        };
    }

    protected override async partitionByDescent(source: SortDataModel[], lhs: number, rhs: number, times: number, callback: (param: SortStateModel) => void): Promise<PartitionMetaInfo> {
        let i: number = rhs, j: number = lhs, pivot: number = this.calcPivot(source, lhs, rhs);
            
            while (i > j) {
                source[lhs].color = FINAL_COLOR;
                source[rhs].color = START_COLOR;
                callback({ times, datalist: source });

                while (i > j && source[i].value <= pivot) {
                    times = await this.dualSweep(source, i, j, PRIMARY_COLOR, SECONDARY_COLOR, times, callback);
    
                    i -= 1;
                }
    
                while (i > j && source[j].value >= pivot) {
                    times = await this.dualSweep(source, j, i, PRIMARY_COLOR, SECONDARY_COLOR, times, callback);
                    
                    j += 1;
                }
                
                times = await this.exchange(source, true, i, j, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, times, callback);
            }
            
            return { 
                times: await this.dualSweep(source, lhs, rhs, FINAL_COLOR, START_COLOR, times, callback), 
                fst: i, snd: i + 1 
            };
    }

    private calcPivot(source: SortDataModel[], lhs: number, rhs: number): number {
        let value: number = 0;
        
        for (let i = lhs, count: number = 1; i <= rhs; i++, count++) {
            value += (source[i].value - value) / count;
        }

        return value;
    }

}

/**
 * 平均值快速排序（迭代）
 */
export class IterativeAverageQuickSortAlgorithm extends RecursiveAverageQuickSortAlgorithm {

    protected override async sortByAscent(source: SortDataModel[], lhs: number, rhs: number, option: SortOption, callback: (param: SortStateModel) => void): Promise<void> {
        let partition: PartitionMetaInfo, fst: number, snd: number, times: number = 0;

        this.stack.push(rhs);
        this.stack.push(lhs);
        
        while (this.stack.length > 0) {
            lhs = this.stack.pop() as number;
            rhs = this.stack.pop() as number;
            
            if (lhs >= rhs) continue;

            if (rhs - lhs + 1 <= this.THRESHOLD) {
                times = await this.renderByOrder(source, lhs, rhs, 'ascent', times, callback);
            } else {
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
    
                if (snd < rhs) {
                    this.stack.push(rhs);
                    this.stack.push(snd);
                }
    
                if (lhs < fst) {
                    this.stack.push(fst);
                    this.stack.push(lhs);
                }
            }
        }

        await delay();
        await this.complete(source, times, callback);
    }

    protected override async sortByDescent(source: SortDataModel[], lhs: number, rhs: number, option: SortOption, callback: (param: SortStateModel) => void): Promise<void> {
        let partition: PartitionMetaInfo, fst: number, snd: number, times: number = 0;

        this.stack.push(lhs);
        this.stack.push(rhs);

        while (this.stack.length > 0) {
            rhs = this.stack.pop() as number;
            lhs = this.stack.pop() as number;

            if (lhs >= rhs) continue;

            if (rhs - lhs + 1 <= this.THRESHOLD) {
                times = await this.renderByOrder(source, lhs, rhs, 'descent', times, callback);
            } else {
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
    
                if (lhs < fst) {
                    this.stack.push(lhs);
                    this.stack.push(fst);
                }
    
                if (snd < rhs) {
                    this.stack.push(snd);
                    this.stack.push(rhs);
                }
            }
        }

        await delay();
        await this.complete(source, times, callback);
    }

}

/**
 * 对数快速排序（递归）
 */
export class RecursiveLogarithmQuickSortAlgorithm extends RecursiveTwoWayQuickSortAlgorithm {

    protected override async sortByAscent(source: SortDataModel[], lhs: number, rhs: number, option: SortOption, callback: (param: SortStateModel) => void): Promise<void> {
        for (let i = lhs; i <= rhs; i++) source[i].radix = Math.log2(source[i].value);

        await super.sortByAscent(source, lhs, rhs, option, callback);
    }

    protected override async sortByDescent(source: SortDataModel[], lhs: number, rhs: number, option: SortOption, callback: (param: SortStateModel) => void): Promise<void> {
        for (let i = rhs; i >= lhs; i--) source[i].radix = Math.log2(source[i].value);

        await super.sortByDescent(source, lhs, rhs, option, callback);
    }

    protected override async partitionByAscent(source: SortDataModel[], lhs: number, rhs: number, times: number, callback: (param: SortStateModel) => void): Promise<PartitionMetaInfo> {
        const fst: number = floor(lhs + (rhs - lhs) * 0.25, 0), snd: number = ceil(rhs - (rhs - lhs) * 0.25, 0);
        let idx: number = random(fst, snd, false), pivot: number = source[idx]?.radix as number, i: number = lhs, j: number = rhs;

        times = await this.exchange(source, pivot > (source[rhs]?.radix as number), idx, rhs, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, times, callback);

        pivot = source[rhs]?.radix as number;
        
        while (i < j) {
            source[lhs].color = START_COLOR;
            source[rhs].color = FINAL_COLOR;
            callback({ times, datalist: source});

            while (i < j && (source[i]?.radix as number) <= pivot) {
                times = await this.dualSweep(source, i, j, PRIMARY_COLOR, SECONDARY_COLOR, times, callback);

                i += 1;
            }

            while (i < j && (source[j]?.radix as number) >= pivot) {
                times = await this.dualSweep(source, i, j, PRIMARY_COLOR, SECONDARY_COLOR, times, callback);

                j -= 1;
            }
            
            times = await this.exchange(source, true, i, j, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, times, callback);
        }

        times = await this.dualSweep(source, lhs, rhs, START_COLOR, FINAL_COLOR, times, callback);
        times = await this.exchange(source, true, i, rhs, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, times, callback);
        return { times, mid: i};
    }

    protected override async partitionByDescent(source: SortDataModel[], lhs: number, rhs: number, times: number, callback: (param: SortStateModel) => void): Promise<PartitionMetaInfo> {
        const fst: number = floor(lhs + (rhs - lhs) * 0.25, 0), snd: number = ceil(rhs - (rhs - lhs) * 0.25, 0);
        let idx: number = random(fst, snd, false), pivot: number = source[idx]?.radix as number, i: number = rhs, j: number = lhs;
        
        times = await this.exchange(source, pivot > (source[lhs]?.radix as number), idx, lhs, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, times, callback);

        pivot = source[lhs]?.radix as number;
        
        while (i > j) {
            source[lhs].color = FINAL_COLOR;
            source[rhs].color = START_COLOR;
            callback({ times, datalist: source});

            while (i > j && (source[i]?.radix as number) <= pivot) {
                times = await this.dualSweep(source, i, j, PRIMARY_COLOR, SECONDARY_COLOR, times, callback);

                i -= 1;
            }

            while (i > j && (source[j]?.radix as number) >= pivot) {
                times = await this.dualSweep(source, i, j, PRIMARY_COLOR, SECONDARY_COLOR, times, callback);
                
                j += 1;
            }

            times = await this.exchange(source, true, i, j, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, times, callback);
        }

        times = await this.dualSweep(source, lhs, rhs, FINAL_COLOR, START_COLOR, times, callback);
        times = await this.exchange(source, true, i, lhs, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, times, callback);
        return { times, mid: i};
    }

}

/**
 * 对数快速排序（迭代）
 */
export class IterativeLogarithmQuickSortAlgorithm extends RecursiveLogarithmQuickSortAlgorithm {

    protected override async sortByAscent(source: SortDataModel[], lhs: number, rhs: number, option: SortOption, callback: (param: SortStateModel) => void): Promise<void> {
        let partition: PartitionMetaInfo, mid: number, times: number = 0;

        for (let i = lhs; i <= rhs; i++) source[i].radix = Math.log2(source[i].value);

        this.stack.push(rhs);
        this.stack.push(lhs);
        
        while (this.stack.length > 0) {
            lhs = this.stack.pop() as number;
            rhs = this.stack.pop() as number;
            
            if (rhs - lhs + 1 <= this.THRESHOLD) {
                times = await this.renderByOrder(source, lhs, rhs, 'ascent', times, callback);
            } else {
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
        }

        await delay();
        await this.complete(source, times, callback);
    }

    protected override async sortByDescent(source: SortDataModel[], lhs: number, rhs: number, option: SortOption, callback: (param: SortStateModel) => void): Promise<void> {
        let partition: PartitionMetaInfo, mid: number, times: number = 0;

        for (let i = rhs; i >= lhs; i--) source[i].radix = Math.log2(source[i].value);

        this.stack.push(lhs);
        this.stack.push(rhs);

        while (this.stack.length > 0) {
            rhs = this.stack.pop() as number;
            lhs = this.stack.pop() as number;

            if (rhs - lhs + 1 <= this.THRESHOLD) {
                times = await this.renderByOrder(source, lhs, rhs, 'descent', times, callback);
            } else {
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
        }

        await delay();
        await this.complete(source, times, callback);
    }

}

/**
 * 三路快速排序（递归）
 */
export class RecursiveThreeWayQuickSortAlgorithm extends RecursiveTwoWayQuickSortAlgorithm {

    protected override async sortByOrder(source: SortDataModel[], lhs: number, rhs: number, order: SortOrder, times: number, callback: (param: SortStateModel) => void): Promise<number> {
        if (rhs - lhs + 1 <= this.THRESHOLD) {
            times = await this.renderByOrder(source, lhs, rhs, order, times, callback);
        } else {
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

    protected override async tailSortByOrder(source: SortDataModel[], lhs: number, rhs: number, order: SortOrder, times: number, callback: (param: SortStateModel) => void): Promise<number> {
        if (rhs - lhs + 1 <= this.THRESHOLD) {
            times = await this.renderByOrder(source, lhs, rhs, order, times, callback);
        } else {
            let partition: PartitionMetaInfo, fst: number, snd: number;

            while (lhs < rhs) {
                if (order === 'ascent') {
                    partition = await this.partitionByAscent(source, lhs, rhs, times, callback);
                    fst = partition?.fst as number;
                    snd = partition?.snd as number;
                    times = partition.times;
    
                    times = await this.tailSortByOrder(source, lhs, fst - 1, order, times, callback);
                    lhs = snd + 1;
                }
    
                if (order === 'descent') {
                    partition = await this.partitionByDescent(source, lhs, rhs, times, callback);
                    fst = partition?.fst as number;
                    snd = partition?.snd as number;
                    times = partition.times;
    
                    times = await this.tailSortByOrder(source, snd + 1, rhs, order, times, callback);
                    rhs = fst - 1;
                }
            }
        }

        return times;
    }

    protected override async partitionByAscent(source: SortDataModel[], lhs: number, rhs: number, times: number, callback: (param: SortStateModel) => void): Promise<PartitionMetaInfo> {
        const pivot: number = source[rhs].value;
        let i: number = rhs - 1, fst: number = lhs, snd: number = rhs;
        
        while (i >= fst) {
            source[lhs].color = START_COLOR;
            source[rhs].color = FINAL_COLOR;
            callback({ times, datalist: source});

            if (source[i].value < pivot) {
                times = await this.exchange(source, true, i, fst, PRIMARY_ONE_COLOR, SECONDARY_ONE_COLOR, ACCENT_ONE_COLOR, times, callback);

                fst += 1;
            } else if (source[i].value > pivot) {
                times = await this.exchange(source, true, i, snd, PRIMARY_TWO_COLOR, SECONDARY_TWO_COLOR, ACCENT_TWO_COLOR, times, callback);

                i -= 1;
                snd -= 1;
            } else {
                times = await this.multiSweep(source, [fst, snd, i], [PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR], times, callback);

                i -= 1;
            }
        }

        return { times: await this.dualSweep(source, lhs, rhs, START_COLOR, FINAL_COLOR, times, callback), fst, snd };
    }

    protected override async partitionByDescent(source: SortDataModel[], lhs: number, rhs: number, times: number, callback: (param: SortStateModel) => void): Promise<PartitionMetaInfo> {
        const pivot: number = source[lhs].value;
        let i: number = lhs + 1, fst: number = lhs, snd: number = rhs;
        
        while (i <= snd) {
            source[lhs].color = FINAL_COLOR;
            source[rhs].color = START_COLOR;
            callback({ times, datalist: source});

            if (source[i].value > pivot) {
                times = await this.exchange(source, true, i, fst, PRIMARY_ONE_COLOR, SECONDARY_ONE_COLOR, ACCENT_ONE_COLOR, times, callback);

                fst += 1;
                times += 1;
            } else if (source[i].value < pivot) {
                times = await this.exchange(source, true, i, snd, PRIMARY_ONE_COLOR, SECONDARY_ONE_COLOR, ACCENT_ONE_COLOR, times, callback);

                i -= 1;
                snd -= 1;
                times += 1;
            } else {
                times = await this.multiSweep(source, [fst, snd, i], [PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR], times, callback);

                i += 1;
            }
        }

        return { times: await this.dualSweep(source, lhs, rhs, FINAL_COLOR, START_COLOR, times, callback), fst, snd };
    }

}

/**
 * 三路快速排序（迭代）
 */
export class IterativeThreeWayQuickSortAlgorithm extends RecursiveThreeWayQuickSortAlgorithm {

    protected override async sortByAscent(source: SortDataModel[], lhs: number, rhs: number, option: SortOption, callback: (param: SortStateModel) => void): Promise<void> {
        let partition: PartitionMetaInfo, fst: number, snd: number, times: number = 0;

        this.stack.push(rhs);
        this.stack.push(lhs);

        while (this.stack.length > 0) {
            lhs = this.stack.pop() as number;
            rhs = this.stack.pop() as number;

            if (rhs - lhs + 1 <= this.THRESHOLD) {
                times = await this.renderByOrder(source, lhs, rhs, 'ascent', times, callback);
            } else {
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
        }

        await delay();
        await this.complete(source, times, callback);
    }

    protected override async sortByDescent(source: SortDataModel[], lhs: number, rhs: number, option: SortOption, callback: (param: SortStateModel) => void): Promise<void> {
        let partition: PartitionMetaInfo, fst: number, snd: number, times: number = 0;

        this.stack.push(lhs);
        this.stack.push(rhs);

        while (this.stack.length > 0) {
            rhs = this.stack.pop() as number;
            lhs = this.stack.pop() as number;

            if (rhs - lhs + 1 <= this.THRESHOLD) {
                times = await this.renderByOrder(source, lhs, rhs, 'descent', times, callback);
            } else {
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
        }

        await delay();
        await this.complete(source, times, callback);
    }

}

/**
 * 双轴快速排序（递归）
 */
export class RecursiveDualPivotQuickSortAlgorithm extends RecursiveTwoWayQuickSortAlgorithm {

    protected override async sortByAscent(source: SortDataModel[], lhs: number, rhs: number, option: SortOption, callback: (param: SortStateModel) => void): Promise<void> {
        let times: number = await this.sortByOrder(source, lhs, rhs, 'ascent', 0, callback);
        
        await delay();
        await this.complete(source, times, callback);
    }

    protected override async sortByDescent(source: SortDataModel[], lhs: number, rhs: number, option: SortOption, callback: (param: SortStateModel) => void): Promise<void> {
        let times: number = await this.sortByOrder(source, lhs, rhs, 'descent', 0, callback);
        
        await delay();
        await this.complete(source, times, callback);
    }

    protected override async sortByOrder(source: SortDataModel[], lhs: number, rhs: number, order: SortOrder, times: number, callback: (param: SortStateModel) => void): Promise<number> {
        let partition: PartitionMetaInfo, fst: number, snd: number;

        if (rhs - lhs + 1 <= this.THRESHOLD) {
            times = await this.renderByOrder(source, lhs, rhs, order, times, callback);
        } else {
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

    public override async partitionByAscent(source: SortDataModel[], lhs: number, rhs: number, times: number, callback: (param: SortStateModel) => void): Promise<PartitionMetaInfo> {
        let fst: number = lhs + 1, snd: number = rhs - 1, idx: number = lhs + 1;

        if (source[lhs].value > source[rhs].value) {
            times = await this.exchange(source, true, lhs, rhs, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, times, callback);
        }

        while (idx <= snd) {
            source[lhs].color = START_COLOR;
            source[rhs].color = FINAL_COLOR;
            callback({ times, datalist: source });

            if (source[idx].value < source[lhs].value) {
                times = await this.exchange(source, true, idx, fst, PRIMARY_ONE_COLOR, SECONDARY_ONE_COLOR, ACCENT_ONE_COLOR, times, callback);

                fst += 1;
                idx += 1;
            } else if (source[idx].value > source[rhs].value) {
                while (idx < snd && source[snd].value > source[rhs].value) snd -= 1;

                times = await this.exchange(source, true, idx, snd, PRIMARY_TWO_COLOR, SECONDARY_TWO_COLOR, ACCENT_TWO_COLOR, times, callback);

                snd -= 1;

                if (source[idx].value < source[lhs].value) {
                    times = await this.exchange(source, true, idx, fst, PRIMARY_ONE_COLOR, SECONDARY_ONE_COLOR, ACCENT_ONE_COLOR, times, callback);

                    fst += 1;
                }

                idx += 1;
            } else {
                times = await this.sweep(source, idx, ACCENT_COLOR, times, callback);

                idx += 1;
            }
            
            source[lhs].color = CLEAR_COLOR;
            source[rhs].color = CLEAR_COLOR;
            callback({ times, datalist: source });
        }

        fst -= 1;
        snd += 1;

        times = await this.exchange(source, true, lhs, fst, PRIMARY_ONE_COLOR, SECONDARY_ONE_COLOR, ACCENT_ONE_COLOR, times, callback);
        times = await this.exchange(source, true, rhs, snd, PRIMARY_TWO_COLOR, SECONDARY_TWO_COLOR, ACCENT_TWO_COLOR, times, callback);
        return { times, fst, snd };
    }

    protected override async partitionByDescent(source: SortDataModel[], lhs: number, rhs: number, times: number, callback: (param: SortStateModel) => void): Promise<PartitionMetaInfo> {
        let fst: number = lhs + 1, snd: number = rhs - 1, idx: number = rhs - 1;

        if (source[lhs].value < source[rhs].value) {
            times = await this.exchange(source, true, lhs, rhs, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, times, callback);
        }

        while (idx >= fst) {
            source[lhs].color = FINAL_COLOR;
            source[rhs].color = START_COLOR;
            callback({ times, datalist: source });

            if (source[idx].value < source[rhs].value) {
                times = await this.exchange(source, true, idx, snd, PRIMARY_ONE_COLOR, SECONDARY_ONE_COLOR, ACCENT_ONE_COLOR, times, callback);

                snd -= 1;
                idx -= 1;
            } else if (source[idx].value > source[lhs].value) {
                while (idx > fst && source[fst].value > source[lhs].value) fst += 1;

                times = await this.exchange(source, true, idx, fst, PRIMARY_TWO_COLOR, SECONDARY_TWO_COLOR, ACCENT_TWO_COLOR, times, callback);

                fst += 1;

                if (source[idx].value < source[rhs].value) {
                    times = await this.exchange(source, true, idx, snd, PRIMARY_ONE_COLOR, SECONDARY_ONE_COLOR, ACCENT_ONE_COLOR, times, callback);

                    snd -= 1;
                }

                idx -= 1;
            } else {
                times = await this.sweep(source, idx, ACCENT_COLOR, times, callback);
                
                idx -= 1;
            }
            
            source[lhs].color = CLEAR_COLOR;
            source[rhs].color = CLEAR_COLOR;
            callback({ times, datalist: source });
        }

        fst -= 1;
        snd += 1;

        times = await this.exchange(source, true, lhs, fst, PRIMARY_ONE_COLOR, SECONDARY_ONE_COLOR, ACCENT_ONE_COLOR, times, callback);
        times = await this.exchange(source, true, rhs, snd, PRIMARY_TWO_COLOR, SECONDARY_TWO_COLOR, ACCENT_TWO_COLOR, times, callback);
        return { times, fst, snd };
    }

}

/**
 * 双轴快速排序（迭代）
 */
export class IterativeDualPivotQuickSortAlgorithm extends RecursiveDualPivotQuickSortAlgorithm {

    protected override async sortByAscent(source: SortDataModel[], lhs: number, rhs: number, option: SortOption, callback: (param: SortStateModel) => void): Promise<void> {
        let partition: PartitionMetaInfo, fst: number, snd: number, times: number = 0;

        this.stack.push(rhs);
        this.stack.push(lhs);

        while (this.stack.length > 0) {
            lhs = this.stack.pop() as number;
            rhs = this.stack.pop() as number;
            
            if (rhs - lhs + 1 <= this.THRESHOLD) {
                times = await this.renderByOrder(source, lhs, rhs, 'ascent', times, callback);
            } else {
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
        }

        await delay();
        await this.complete(source, times, callback);
    }

    protected override async sortByDescent(source: SortDataModel[], lhs: number, rhs: number, option: SortOption, callback: (param: SortStateModel) => void): Promise<void> {
        let partition: PartitionMetaInfo, fst: number, snd: number, times: number = 0;

        this.stack.push(lhs);
        this.stack.push(rhs);

        while (this.stack.length > 0) {
            rhs = this.stack.pop() as number;
            lhs = this.stack.pop() as number;
            
            if (rhs - lhs + 1 <= this.THRESHOLD) {
                times = await this.renderByOrder(source, lhs, rhs, 'descent', times, callback);
            } else {
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
        }

        await delay();
        await this.complete(source, times, callback);
    }

}
