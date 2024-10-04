import { floor } from "lodash";

import { SortDataModel, SortOption, SortOrder, SortStateModel } from "../ngrx-store/sort.state";

import { ACCENT_COLOR, delay, PRIMARY_COLOR, SECONDARY_COLOR } from "../../../public/global.utils";

import { SortToolsService } from "../ngrx-store/sort.service";
import { PartitionMetaInfo } from "../pattern/sort-temp.pattern";
import { HeapSortAlgorithm } from "./selection-sort.algorithm";
import { RecursiveQuickSortAlgorithm } from "./quick-sort.algorithm";

/**
 * 内省排序（递归）
 */
export class RecursiveIntrospectiveSortAlgorithm extends RecursiveQuickSortAlgorithm {

    private heapSort: HeapSortAlgorithm | null = null;

    constructor(protected override _service: SortToolsService) {
        super(_service);

        if (this.heapSort === null) this.heapSort = new HeapSortAlgorithm(_service);
    }

    protected override async sortByAscent(source: SortDataModel[], lhs: number, rhs: number, option: SortOption, callback: (param: SortStateModel) => void): Promise<void> {
        const depth: number = this.calcDepthLimit(source.length);
        let times: number = await this.sortByOrderAndDepth(source, lhs, rhs, depth % 2 === 0 ? depth : depth - 1, 'ascent', 0, callback);

        await delay();
        await this.complete(source, times, callback);
    }

    protected override async sortByDescent(source: SortDataModel[], lhs: number, rhs: number, option: SortOption, callback: (param: SortStateModel) => void): Promise<void> {
        const depth: number = this.calcDepthLimit(source.length);
        let times: number = await this.sortByOrderAndDepth(source, lhs, rhs, depth % 2 === 0 ? depth : depth - 1, 'descent', 0, callback);

        await delay();
        await this.complete(source, times, callback);
    }

    protected async sortByOrderAndDepth(source: SortDataModel[], lhs: number, rhs: number, depth: number, order: SortOrder, times: number, callback: (param: SortStateModel) => void): Promise<number> {
        if (lhs < rhs) {
            if (depth === 0) {
                times = await this.introSelectByOrder(source, lhs, rhs, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, order, times, callback);
            } else {
                let partition: PartitionMetaInfo, mid: number;

                if (order === 'ascent') {
                    partition = await this.partitionByAscent(source, lhs, rhs, times, callback);
                    times = partition.times;
                    mid = partition?.mid as number;
    
                    times = await this.sortByOrderAndDepth(source, lhs, mid - 1, depth - 1, order, times, callback);
                    times = await this.sortByOrderAndDepth(source, mid + 1, rhs, depth - 1, order, times, callback);
                }
    
                if (order === 'descent') {
                    partition = await this.partitionByDescent(source, lhs, rhs, times, callback);
                    times = partition.times;
                    mid = partition?.mid as number;
    
                    times = await this.sortByOrderAndDepth(source, mid + 1, rhs, depth - 1, order, times, callback);
                    times = await this.sortByOrderAndDepth(source, lhs, mid - 1, depth - 1, order, times, callback);
                }
            }
        }

        return times;
    }

    protected async introSelectByOrder(source: SortDataModel[], lhs: number, rhs: number, primaryColor: string, secondaryColor: string, accentColor: string, order: SortOrder, times: number, callback: (param: SortStateModel) => void): Promise<number> {
        if (this.insertSort === null) throw new Error(`错误：引用对象${this.insertSort}未被初始化。`);
        if (this.heapSort === null) throw new Error(`错误：引用对象${this.heapSort}未被初始化。`);

        [times] = rhs - lhs < this.THRESHOLD 
            ? await this.insertSort.sortByOrder(source, lhs, rhs, 1, 1, primaryColor, secondaryColor, accentColor, order, times, callback)
            : await this.heapSort.sortByOrder(source, lhs, rhs, -1, -1, primaryColor, secondaryColor, accentColor, order, times, callback);
            
        return times;
    }

    public calcDepthLimit(length: number, scale: number = 0.85): number {
        if (length > 1546) {
            return floor(Math.log10(length), 0);
        } else if (length >= 768 && length <= 1546) {
            return floor(Math.log(length), 0);
        } else {
            return floor(Math.log2(length) * scale, 0);
        }
    }

}

/**
 * 内省排序（迭代）
 */
export class IterativeIntrospectiveSortAlgorithm extends RecursiveIntrospectiveSortAlgorithm {

    protected override async sortByAscent(source: SortDataModel[], lhs: number, rhs: number, option: SortOption, callback: (param: SortStateModel) => void): Promise<void> {
        let partition: PartitionMetaInfo, mid: number, depth: number = this.calcDepthLimit(source.length), times: number = 0;

        this.stack.push(depth);
        this.stack.push(rhs);
        this.stack.push(lhs);

        while (this.stack.length > 0) {
            lhs = this.stack.pop() as number;
            rhs = this.stack.pop() as number;
            depth = this.stack.pop() as number;
            
            if (depth === 0) {
                times = await this.introSelectByOrder(source, lhs, rhs, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, 'ascent', times, callback);
            } else {
                partition = await this.partitionByAscent(source, lhs, rhs, times, callback);
                times = partition.times;
                mid = partition?.mid as number;
                
                if (mid + 1 < rhs) {
                    this.stack.push(depth - 1);
                    this.stack.push(rhs);
                    this.stack.push(mid + 1);
                }
                
                if (lhs < mid - 1) {
                    this.stack.push(depth - 1);
                    this.stack.push(mid - 1);
                    this.stack.push(lhs);
                }
            }
        }

        await delay();
        await this.complete(source, times, callback);
    }

    protected override async sortByDescent(source: SortDataModel[], lhs: number, rhs: number, option: SortOption, callback: (param: SortStateModel) => void): Promise<void> {
        let partition: PartitionMetaInfo, mid: number, depth: number = this.calcDepthLimit(source.length), times: number = 0;

        this.stack.push(depth);
        this.stack.push(lhs);
        this.stack.push(rhs);

        while (this.stack.length > 0) {
            rhs = this.stack.pop() as number;
            lhs = this.stack.pop() as number;
            depth = this.stack.pop() as number;
            
            if (depth === 0) {
                times = await this.introSelectByOrder(source, lhs, rhs, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, 'descent', times, callback);
            } else {
                partition = await this.partitionByDescent(source, lhs, rhs, times, callback);
                times = partition.times;
                mid = partition?.mid as number;
                
                if (lhs < mid - 1) {
                    this.stack.push(depth - 1);
                    this.stack.push(lhs);
                    this.stack.push(mid - 1);
                }

                if (mid + 1 < rhs) {
                    this.stack.push(depth - 1);
                    this.stack.push(mid + 1);
                    this.stack.push(rhs);
                }
            }
        }

        await delay();
        await this.complete(source, times, callback);
    }

}