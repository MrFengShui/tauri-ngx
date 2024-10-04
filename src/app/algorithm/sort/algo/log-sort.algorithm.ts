import { ceil, floor, random } from "lodash";

import { SortDataModel, SortOption, SortStateModel } from "../ngrx-store/sort.state";

import { ACCENT_COLOR, ACCENT_ONE_COLOR, ACCENT_TWO_COLOR, delay, PRIMARY_COLOR, SECONDARY_COLOR } from "../../../public/global.utils";

import { RecursiveQuickSortAlgorithm } from "./quick-sort.algorithm";
import { PartitionMetaInfo } from "../pattern/sort-temp.pattern";

/**
 * 圆木排序（递归）
 */
export class RecursiveLogSortAlgorithm extends RecursiveQuickSortAlgorithm {
    
    protected override async partitionByAscent(source: SortDataModel[], lhs: number, rhs: number, times: number, callback: (param: SortStateModel) => void): Promise<PartitionMetaInfo> {
        let index: number = random(floor((rhs - lhs) * 0.25 + lhs, 0), ceil((rhs - lhs) * 0.75 + lhs, 0), false), value: number;
        let pivot: number = source[index].value, fstArray: number[] | null = Array.from([]), sndArray: number[] | null = Array.from([]);

        for (let i = lhs; i <= rhs; i++) {
            if (i === index) continue;

            value = source[i].value;

            if (value < pivot) {
                fstArray.push(value);
            } else if (value > pivot) {
                sndArray.push(value);
            } else {
                if (i < index) {
                    fstArray.push(value);
                } else {
                    sndArray.push(value);
                }
            }

            times = await this.sweep(source, i, ACCENT_ONE_COLOR, times, callback);
        }
        
        index = lhs + fstArray.length;

        this.array = this.array.concat(...fstArray, pivot, ...sndArray);
        fstArray.splice(0);
        sndArray.splice(0);
        fstArray = null;
        sndArray = null;
        
        for (let i = lhs; this.array.length > 0; i++) {
            source[i].value = this.array.shift() as number;

            times = await this.sweep(source, i, ACCENT_TWO_COLOR, times, callback);
            times += 1;
        }

        return { times, mid: index };
    }

    protected override async partitionByDescent(source: SortDataModel[], lhs: number, rhs: number, times: number, callback: (param: SortStateModel) => void): Promise<PartitionMetaInfo> {
        let index: number = random(floor((rhs - lhs) * 0.25 + lhs, 0), ceil((rhs - lhs) * 0.75 + lhs, 0), false), value: number;
        let pivot: number = source[index].value, fstArray: number[] | null = Array.from([]), sndArray: number[] | null = Array.from([]);

        for (let i = rhs; i >= lhs; i--) {
            if (i === index) continue;

            value = source[i].value;

            if (value < pivot) {
                fstArray.push(value);
            } else if (value > pivot) {
                sndArray.push(value);
            } else {
                if (i > index) {
                    fstArray.push(value);
                } else {
                    sndArray.push(value);
                }
            }

            times = await this.sweep(source, i, ACCENT_ONE_COLOR, times, callback);
        }
        
        index = rhs - fstArray.length;

        this.array = this.array.concat(...fstArray, pivot, ...sndArray);
        fstArray.splice(0);
        sndArray.splice(0);
        fstArray = null;
        sndArray = null;
        
        for (let i = rhs; this.array.length > 0; i--) {
            source[i].value = this.array.shift() as number;

            times = await this.sweep(source, i, ACCENT_TWO_COLOR, times, callback);
            times += 1;
        }

        return { times, mid: index };
    }

}

/**
 * 圆木排序（迭代）
 */
export class IterativeLogSortAlgorithm extends RecursiveLogSortAlgorithm {

    protected override async sortByAscent(source: SortDataModel[], lhs: number, rhs: number, option: SortOption, callback: (param: SortStateModel) => void): Promise<void> {
        let partition: PartitionMetaInfo, mid: number, times: number = 0;

        this.stack.push(rhs);
        this.stack.push(lhs);

        while (this.stack.length > 0) {
            lhs = this.stack.pop() as number;
            rhs = this.stack.pop() as number;

            partition = await this.partitionByAscent(source, lhs, rhs, times, callback);
            times = partition.times;
            mid = partition?.mid as number;

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

            partition = await this.partitionByDescent(source, lhs, rhs, times, callback);
            times = partition.times;
            mid = partition?.mid as number;

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
 * 原地圆木排序
 */
export class InPlaceLogSortAlgorithm extends IterativeLogSortAlgorithm {

    protected override async partitionByAscent(source: SortDataModel[], lhs: number, rhs: number, times: number, callback: (param: SortStateModel) => void): Promise<PartitionMetaInfo> {
        if (this.insertSort === null) throw new Error(`错误：引用对象${this.insertSort}未被初始化。`);

        let mid: number = random(floor((rhs - lhs) * 0.25 + lhs, 0), ceil((rhs - lhs) * 0.75 + lhs, 0), false);
        const pivot: number = source[mid].value;
        
        if (lhs + 1 === rhs) {
            times = await this.exchange(source, source[lhs].value > source[rhs].value, lhs, rhs, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, times, callback);
        } else {
            for (let idx = lhs; idx <= rhs; ) {
                if (idx < mid) {
                    if (source[idx].value < pivot) {
                        times = await this.dualSweep(source, idx, mid, PRIMARY_COLOR, SECONDARY_COLOR, times, callback);
    
                        idx += 1;
                    } else {
                        times = await this.insertSort.moveByOrder(source, idx, rhs, PRIMARY_COLOR, SECONDARY_COLOR, 'descent', times, callback);
    
                        mid -= 1;
                    }
                } else if (idx > mid) {
                    if (source[idx].value < pivot) {
                        times = await this.insertSort.moveByOrder(source, Math.max(mid - 1, lhs), idx, PRIMARY_COLOR, SECONDARY_COLOR, 'ascent', times, callback);
    
                        idx += 1;
                        mid += 1;
                    } else {
                        times = await this.dualSweep(source, idx, mid, PRIMARY_COLOR, SECONDARY_COLOR, times, callback);
    
                        idx += 1;
                    }
                } else {
                    idx += 1;
                    continue;
                }
            }
        }
        
        return { times, mid };
    }

    protected override async partitionByDescent(source: SortDataModel[], lhs: number, rhs: number, times: number, callback: (param: SortStateModel) => void): Promise<PartitionMetaInfo> {
        if (this.insertSort === null) throw new Error(`错误：引用对象${this.insertSort}未被初始化。`);

        let mid: number = random(floor((rhs - lhs) * 0.25 + lhs, 0), ceil((rhs - lhs) * 0.75 + lhs, 0), false);
        const pivot: number = source[mid].value;

        if (rhs - 1 === lhs) {
            times = await this.exchange(source, source[rhs].value > source[lhs].value, rhs, lhs, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, times, callback);
        } else {
            for (let idx = rhs; idx >= lhs; ) {
                if (idx > mid) {
                    if (source[idx].value < pivot) {
                        times = await this.dualSweep(source, idx, mid, PRIMARY_COLOR, SECONDARY_COLOR, times, callback);
    
                        idx -= 1;
                    } else {
                        times = await this.insertSort.moveByOrder(source, lhs, idx, PRIMARY_COLOR, SECONDARY_COLOR, 'ascent', times, callback);
    
                        mid += 1;
                    }
                } else if (idx < mid) {
                    if (source[idx].value < pivot) {
                        times = await this.insertSort.moveByOrder(source, idx, Math.min(mid + 1, rhs), PRIMARY_COLOR, SECONDARY_COLOR, 'descent', times, callback);
    
                        idx -= 1;
                        mid -= 1;
                    } else {
                        times = await this.dualSweep(source, idx, mid, PRIMARY_COLOR, SECONDARY_COLOR, times, callback);
    
                        idx -= 1;
                    }
                } else {
                    idx -= 1;
                    continue;
                }
            }
        }

        return { times, mid };
    }

}