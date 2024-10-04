import { floor } from "lodash";

import { SortDataModel, SortStateModel, SortOrder, SortOption } from "../ngrx-store/sort.state";

import { delay } from "../../../public/global.utils";
import { ACCENT_COLOR, PRIMARY_COLOR, SECONDARY_COLOR } from "../../../public/global.utils";

import { AbstractBinarySortAlgorithm } from "../pattern/sort-temp.pattern";

/**
 * 臭皮匠排序（递归）
 */
export class RecursiveStoogeSortAlgorithm extends AbstractBinarySortAlgorithm {

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
        let mid: number;
        
        if (order === 'ascent') {
            times = await this.exchange(source, source[lhs].value > source[rhs].value, lhs, rhs, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, times, callback);

            if (rhs - lhs + 1 >= 3) {
                mid = floor((rhs - lhs + 1)  / 3, 0);
                times = await this.sortByOrder(source, lhs, rhs - mid, order, times, callback);
                times = await this.sortByOrder(source, lhs + mid, rhs, order, times, callback);
                times = await this.sortByOrder(source, lhs, rhs - mid, order, times, callback);
            }
        }

        if (order === 'descent') {
            times = await this.exchange(source, source[lhs].value < source[rhs].value, lhs, rhs, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, times, callback);
            
            if (rhs - lhs + 1 >= 3) {
                mid = floor((rhs - lhs + 1)  / 3, 0);
                times = await this.sortByOrder(source, lhs + mid, rhs, order, times, callback);
                times = await this.sortByOrder(source, lhs, rhs - mid, order, times, callback);
                times = await this.sortByOrder(source, lhs + mid, rhs, order, times, callback);
            }
        }

        return times;
    }

}

/**
 * 臭皮匠排序（迭代）
 */
export class IterativeStoogeSortAlgorithm extends RecursiveStoogeSortAlgorithm {

    protected override async sortByAscent(source: SortDataModel[], lhs: number, rhs: number, option: SortOption, callback: (param: SortStateModel) => void): Promise<void> {
        let mid: number, times: number = 0;

        this.stack.push(rhs);
        this.stack.push(lhs);

        while (this.stack.length > 0) {
            lhs = this.stack.pop() as number;
            rhs = this.stack.pop() as number;

            times = await this.exchange(source, source[lhs].value > source[rhs].value, lhs, rhs, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, times, callback);

            if (rhs - lhs + 1 >= 3) {
                mid = floor((rhs - lhs + 1)  / 3, 0);
    
                if (lhs < rhs - mid) {
                    this.stack.push(rhs - mid);
                    this.stack.push(lhs);
                }
    
                if (lhs + mid < rhs) {
                    this.stack.push(rhs);
                    this.stack.push(lhs + mid);
                }
    
                if (lhs < rhs - mid) {
                    this.stack.push(rhs - mid);
                    this.stack.push(lhs);
                }
            }
        }

        await delay();
        await this.complete(source, times, callback);
    }

    protected override async sortByDescent(source: SortDataModel[], lhs: number, rhs: number, option: SortOption, callback: (param: SortStateModel) => void): Promise<void> {
        let mid: number, times: number = 0;

        this.stack.push(lhs);
        this.stack.push(rhs);

        while (this.stack.length > 0) {
            rhs = this.stack.pop() as number;
            lhs = this.stack.pop() as number;

            times = await this.exchange(source, source[lhs].value < source[rhs].value, lhs, rhs, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, times, callback);

            if (rhs - lhs + 1 >= 3) {
                mid = floor((rhs - lhs + 1)  / 3, 0);
    
                if (lhs + mid < rhs) {
                    this.stack.push(lhs + mid);
                    this.stack.push(rhs);
                }
    
                if (lhs < rhs - mid) {
                    this.stack.push(lhs);
                    this.stack.push(rhs - mid);
                }
    
                if (lhs + mid < rhs) {
                    this.stack.push(lhs + mid);
                    this.stack.push(rhs);
                }
            }
        }

        await delay();
        await this.complete(source, times, callback);
    }

}
