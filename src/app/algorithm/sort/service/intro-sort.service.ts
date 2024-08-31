import { Injectable } from "@angular/core";
import { floor } from "lodash";

import { SortDataModel, SortOrder, SortStateModel } from "../ngrx-store/sort.state";

import { delay } from "../../../public/global.utils";

import { SortToolsService } from "../ngrx-store/sort.service";
import { AbstractSortService, PartitionMetaInfo } from "./base-sort.service";
import { HeapSortService } from "./selection-sort.service";
import { RecursiveQuickSortService } from "./quick-sort.service";

/**
 * 内省排序
 */
@Injectable()
export class IntrospectiveSortService extends AbstractSortService {

    constructor(
        protected override _service: SortToolsService,
        protected _quickSortService: RecursiveQuickSortService,
        protected _heapSortService: HeapSortService
    ) {
        super(_service);
    }

    protected override async sortByAscent(source: SortDataModel[], lhs: number, rhs: number, option: string | number | undefined, callback: (param: SortStateModel) => void): Promise<void> {
        let depth: number = floor(Math.log2(rhs - lhs + 1)) << 1;
        let times: number = await this.sortByOrder(source, lhs, rhs, depth % 2 === 0 ? depth : depth - 1, 'ascent', 0, callback);

        await delay();
        await this.complete(source, times, callback);
    }

    protected override async sortByDescent(source: SortDataModel[], lhs: number, rhs: number, option: string | number | undefined, callback: (param: SortStateModel) => void): Promise<void> {
        let depth: number = floor(Math.log2(rhs - lhs + 1));
        let times: number = await this.sortByOrder(source, lhs, rhs, depth % 2 === 0 ? depth : depth - 1, 'descent', 0, callback);

        await delay();
        await this.complete(source, times, callback);
    }

    protected async sortByOrder(source: SortDataModel[], lhs: number, rhs: number, depth: number, order: SortOrder, times: number, callback: (param: SortStateModel) => void): Promise<number> {
        if (lhs < rhs) {console.debug('depth:', depth, 'lhs:', lhs, 'rhs:', rhs);
            if (depth === 0) {
                if (order === 'ascent') {
                    times = await this._heapSortService.ascent(source, lhs, rhs, times, callback);
                }

                if (order === 'descent') {
                    times = await this._heapSortService.descent(source, lhs, rhs, times, callback);
                }
            } else {
                let partition: PartitionMetaInfo, mid: number;

                if (order === 'ascent') {
                    partition = await this._quickSortService.ascent(source, lhs, rhs, times, callback);
                    times = partition.times;
                    mid = partition?.mid as number;
    
                    times = await this.sortByOrder(source, lhs, mid - 1, depth - 1, order, times, callback);
                    times = await this.sortByOrder(source, mid + 1, rhs, depth - 1, order, times, callback);
                }
    
                if (order === 'descent') {
                    partition = await this._quickSortService.descent(source, lhs, rhs, times, callback);
                    times = partition.times;
                    mid = partition?.mid as number;
    
                    times = await this.sortByOrder(source, mid + 1, rhs, depth - 1, order, times, callback);
                    times = await this.sortByOrder(source, lhs, mid - 1, depth - 1, order, times, callback);
                }
            }
        }

        return times;
    }

}