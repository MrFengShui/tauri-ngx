import { Injectable } from "@angular/core";
import { floor } from "lodash";

import { delay } from "../../../public/global.utils";
import { PRIMARY_COLOR, SECONDARY_COLOR, CLEAR_COLOR, ACCENT_COLOR } from "../../../public/global.utils";

import { SortDataModel, SortStateModel, SortOrder } from "../ngrx-store/sort.state";

import { AbstractSortService } from "./base-sort.service";

/**
 * 双调归并排序（自顶向下）
 */
@Injectable()
export class TopDownBitonicMergeSortService extends AbstractSortService {

    protected override async sortByAscent(source: SortDataModel[], lhs: number, rhs: number, option: string | number | undefined, callback: (param: SortStateModel) => void): Promise<void> {
        let times: number = await this.sortByOrder(source, lhs, rhs, 'up', 'ascent', 0, callback);
        await delay();
        await this.complete(source, times, callback);
    }

    protected override async sortByDescent(source: SortDataModel[], lhs: number, rhs: number, option: string | number | undefined, callback: (param: SortStateModel) => void): Promise<void> {
        let times: number = await this.sortByOrder(source, lhs, rhs, 'up', 'descent', 0, callback);
        await delay();
        await this.complete(source, times, callback);
    }

    private async sortByOrder(source: SortDataModel[], lhs: number, rhs: number, flag: 'up' | 'down', order: SortOrder, times: number, callback: (param: SortStateModel) => void): Promise<number> {
        if (lhs < rhs) {
            const mid: number = floor((rhs - lhs) * 0.5 + lhs, 0);
            
            if (order === 'ascent') {
                times = await this.sortByOrder(source, lhs, mid, 'up', order, times, callback);
                times = await this.sortByOrder(source, mid + 1, rhs, 'down', order, times, callback);
                times = await this.mergeByAscent(source, lhs, rhs, flag, times, callback);
            }
            
            if (order === 'descent') {
                times = await this.sortByOrder(source, mid + 1, rhs, 'up', order, times, callback);
                times = await this.sortByOrder(source, lhs, mid, 'down', order, times, callback);
                times = await this.mergeByDescent(source, lhs, rhs, flag, times, callback);
            }
        }

        return times;
    }

    private async mergeByAscent(source: SortDataModel[], lhs: number, rhs: number, dir: 'up' | 'down', times: number, callback: (param: SortStateModel) => void): Promise<number> {
        if (lhs < rhs) {
            let mid: number = Math.floor((rhs - lhs) * 0.5 + lhs), flag: boolean;

            for (let i = lhs, j = mid + 1; i <= mid && j <= rhs; i++, j++) {     
                flag = (source[i].value > source[j].value && dir === 'up') || (source[i].value < source[j].value && dir === 'down');

                await this._service.swapAndRender(source, false, flag, i, j, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, times, callback);

                if (flag) times += 1;
            }

            times = await this.mergeByAscent(source, lhs, mid, dir, times, callback);
            times = await this.mergeByAscent(source, mid + 1, rhs, dir, times, callback);
        }

        return times;
    }

    private async mergeByDescent(source: SortDataModel[], lhs: number, rhs: number, dir: 'up' | 'down', times: number, callback: (param: SortStateModel) => void): Promise<number> {
        if (lhs < rhs) {
            let mid: number = Math.floor((rhs - lhs) * 0.5 + lhs), flag: boolean;

            for (let i = rhs, j = mid; i >= mid + 1 && j >= lhs; i--, j--) {   
                flag = (source[i].value > source[j].value && dir === 'up') || (source[i].value < source[j].value && dir === 'down');
                
                await this._service.swapAndRender(source, false, flag, i, j, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, times, callback);

                if (flag) times += 1;
            }

            times = await this.mergeByDescent(source, mid + 1, rhs, dir, times, callback);
            times = await this.mergeByDescent(source, lhs, mid, dir, times, callback);
        }

        return times;
    }

}

/**
 * 双调归并排序（自底向上）
 */
@Injectable()
export class BottomUpBitonicMergeSortService extends TopDownBitonicMergeSortService {

    protected override async sortByAscent(source: SortDataModel[], lhs: number, rhs: number, option: string | number | undefined, callback: (param: SortStateModel) => void): Promise<void> {
        let times: number= 0, and: number, xor: number;

        for (let scale = 2; scale <= rhs - lhs + 1; scale *= 2) {
            for (let gap = scale >> 1; gap > 0; gap >>= 1) {
                for (let i = lhs; i <= rhs; i++) {
                    xor = gap ^ i;
        
                    if (xor > i) {
                        and = scale & i;
        
                        source[i].color = PRIMARY_COLOR;
                        source[xor].color = SECONDARY_COLOR;
                        callback({ times, datalist: source});  
        
                        await delay();
                        
                        if ((source[i].value > source[xor].value && and === 0) || (source[i].value < source[xor].value && and !== 0)) {
                            // await swap(source, i, xor);
                            times += 1;
                        }
        
                        source[i].color = CLEAR_COLOR;
                        source[xor].color = CLEAR_COLOR;
                        callback({ times, datalist: source});  
                    }
                }
            }
        }

        await delay();
        await this.complete(source, times, callback);
    }

    protected override async sortByDescent(source: SortDataModel[], lhs: number, rhs: number, option: string | number | undefined, callback: (param: SortStateModel) => void): Promise<void> {
        let times: number = 0, and: number, xor: number;

        for (let scale = 2; scale <= rhs - lhs + 1; scale *= 2) {
            for (let gap = scale >> 1; gap > 0; gap >>= 1) {
                for (let i = rhs; i >= lhs; i--) {
                    xor = gap ^ i;
        
                    if (xor > i) {
                        and = scale & i;
        
                        source[i].color = PRIMARY_COLOR;
                        source[xor].color = SECONDARY_COLOR;
                        callback({ times, datalist: source});  
        
                        await delay();
                        
                        if ((source[i].value < source[xor].value && and === 0) || (source[i].value > source[xor].value && and !== 0)) {
                            // await swap(source, i, xor);
                            times += 1;
                        }
        
                        source[i].color = CLEAR_COLOR;
                        source[xor].color = CLEAR_COLOR;
                        callback({ times, datalist: source});  
                    }
                }
            }
        }

        await delay();
        await this.complete(source, times, callback);
    }

}
