import { Injectable } from "@angular/core";
import { floor } from "lodash";

import { SortDataModel, SortOrder, SortStateModel } from "../ngrx-store/sort.state";

import { ACCENT_COLOR, CLEAR_COLOR, delay, PRIMARY_COLOR, SECONDARY_COLOR } from "../../../public/global.utils";

import { AbstractComparisonSortService } from "./base-sort.service";

/**
 * 圆圈排序（递归）
 */
@Injectable()
export class RecursiveCircleSortService extends AbstractComparisonSortService {

    protected override async sortByAscent(source: SortDataModel[], lhs: number, rhs: number, option: string | number | undefined, callback: (param: SortStateModel) => void): Promise<void> {
        let stop: boolean = false, times: number = 0;

        while (!stop) {
            [times, stop] = await this.sortByOrder(source, lhs, rhs, 'ascent', 0, callback);
        }

        await delay();
        await this.complete(source, times, callback);
    }

    protected override async sortByDescent(source: SortDataModel[], lhs: number, rhs: number, option: string | number | undefined, callback: (param: SortStateModel) => void): Promise<void> {
        let stop: boolean = false, times: number = 0;
        
        while (!stop) {
            [times, stop] = await this.sortByOrder(source, lhs, rhs, 'descent', 0, callback);
        }

        await delay();
        await this.complete(source, times, callback);
    }

    protected async sortByOrder(source: SortDataModel[], lhs: number, rhs: number, order: SortOrder, times: number, callback: (param: SortStateModel) => void): Promise<[number, boolean]> {
        let stop: boolean = true, fstFlag: boolean = true, sndFlag: boolean = true;

        if (lhs < rhs) {
            let mid: number = floor((rhs - lhs) * 0.5 + lhs, 0);

            if (order === 'ascent') {
                [times, stop] = await this.rotateByOrder(source, lhs, rhs, order, times, callback);
                [times, fstFlag] = await this.sortByOrder(source, lhs, mid, order, times, callback);
                [times, sndFlag] = await this.sortByOrder(source, mid + 1, rhs, order, times, callback);
            }
            
            if (order === 'descent') {
                [times, stop] = await this.rotateByOrder(source, lhs, rhs, order, times, callback);
                [times, fstFlag] = await this.sortByOrder(source, mid + 1, rhs, order, times, callback);
                [times, sndFlag] = await this.sortByOrder(source, lhs, mid, order, times, callback);
            }

            stop = stop && fstFlag && sndFlag;
        }   
        
        return [times, stop];
    }

    protected async rotateByOrder(source: SortDataModel[], lhs: number, rhs: number, order: SortOrder, times: number, callback: (param: SortStateModel) => void): Promise<[number, boolean]> {
        let stop: boolean = true, flag: boolean;

        if (order === 'ascent') {
            for (let i = lhs, j = rhs; i <= j; i++, j--) {
                if (i === j) {
                    flag = source[i].value > source[j + 1].value;
                    stop &&= !flag;

                    times = await this.exchange(source, flag, i, j + 1, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, times, callback);
                } else {
                    flag = source[i].value > source[j].value;
                    stop &&= !flag;

                    times = await this.exchange(source, flag, i, j, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, times, callback);
                }
            }
        }

        if (order === 'descent') {
            for (let i = rhs, j = lhs; i >= j; i--, j++) {
                if (i === j) {
                    flag = source[i + 1].value > source[j].value;
                    stop &&= !flag;
    
                    times = await this.exchange(source, flag, i + 1, j, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, times, callback);
                } else {
                    flag = source[i].value > source[j].value;
                    stop &&= !flag;
    
                    times = await this.exchange(source, flag, i, j, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, times, callback);
                }
            }
        }
        
        return [times, stop];
    }
    
}

/**
 * 圆圈排序（迭代）
 */
@Injectable()
export class IterativeCircleSortService extends RecursiveCircleSortService {

    protected override async sortByAscent(source: SortDataModel[], lhs: number, rhs: number, option: string | number | undefined, callback: (param: SortStateModel) => void): Promise<void> {
        let start: number, final: number, split: number, stop: boolean = false, flag: boolean, times: number = 0;

        while (!stop) {
            stop = true;

            this.stack.push(rhs);
            this.stack.push(lhs);

            while (this.stack.length > 0) {
                start = this.stack.pop() as number;
                final = this.stack.pop() as number;
                
                [times, flag] = await this.rotateByOrder(source, start, final, 'ascent', times, callback);
                
                if (start < final) {
                    split = floor((final - start) * 0.5 + start, 0);
    
                    if (split + 1 < final) {
                        this.stack.push(final);
                        this.stack.push(split + 1);
                    }
    
                    if (start < split) {
                        this.stack.push(split);
                        this.stack.push(start);
                    }
                }
                
                stop &&= flag;
            }
        }

        await delay();
        await this.complete(source, times, callback);
    }

    protected override async sortByDescent(source: SortDataModel[], lhs: number, rhs: number, option: string | number | undefined, callback: (param: SortStateModel) => void): Promise<void> {
        let start: number, final: number, split: number, stop: boolean = false, flag: boolean, times: number = 0;

        while (!stop) {
            stop = true;

            this.stack.push(lhs);
            this.stack.push(rhs);

            while (this.stack.length > 0) {
                final = this.stack.pop() as number;
                start = this.stack.pop() as number;
                
                [times, flag] = await this.rotateByOrder(source, start, final, 'descent', times, callback);
                
                if (start < final) {
                    split = floor((final - start) * 0.5 + start, 0);
    
                    if (start < split) {
                        this.stack.push(start);
                        this.stack.push(split);
                    }

                    if (split + 1 < final) {
                        this.stack.push(split + 1);
                        this.stack.push(final);
                    }
                }
                
                stop &&= flag;
            }
        }

        await delay();
        await this.complete(source, times, callback);
    }

}