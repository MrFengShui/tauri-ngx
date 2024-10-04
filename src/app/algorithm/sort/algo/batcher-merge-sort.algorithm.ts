import { SortDataModel, SortStateModel, SortOrder, SortOption } from "../ngrx-store/sort.state";
import { floor } from "lodash";

import { ACCENT_COLOR, delay } from "../../../public/global.utils";
import { PRIMARY_COLOR, SECONDARY_COLOR } from "../../../public/global.utils";

import { AbstractBinarySortAlgorithm } from "../pattern/sort-temp.pattern";

/**
 * 奇偶归并排序（递归）
 */
export class RecursiveBatcherMergeSortAlgorithm extends AbstractBinarySortAlgorithm {

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

    protected async sortByOrder(source: SortDataModel[], lhs: number, rhs: number, order: SortOrder, times: number, callback: (param: SortStateModel) => void): Promise<number> {
        if (lhs < rhs) {
            let mid: number = Math.floor((rhs - lhs) * 0.5);

            if (order === 'ascent') {
                mid = lhs + mid;

                times = await this.sortByOrder(source, lhs, mid, order, times, callback);
                times = await this.sortByOrder(source, mid + 1, rhs, order, times, callback);
                times = await this.mergeByAscent(source, lhs, rhs, 1, times, callback);
            }
            
            if (order === 'descent') {
                mid = rhs - mid;

                times = await this.sortByOrder(source, mid, rhs, order, times, callback);
                times = await this.sortByOrder(source, lhs, mid - 1, order, times, callback);
                times = await this.mergeByDescent(source, lhs, rhs, 1, times, callback);
            }
        }

        return times;
    }

    protected async mergeByAscent(source: SortDataModel[], lhs: number, rhs: number, dist: number, times: number, callback: (param: SortStateModel) => void): Promise<number> {
        const span: number = dist + dist;
        
        if (span < rhs - lhs + 1) {
            times = await this.mergeByAscent(source, lhs, rhs, span, times, callback);
            times = await this.mergeByAscent(source, lhs + dist, rhs, span, times, callback);
    
            for (let i = lhs + dist; i + dist < rhs + 1; i += span) {
                times = source[i].value > source[i + dist].value 
                    ? await this.exchange(source, true, i, i + dist, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, times, callback)
                    : await this.dualSweep(source, i, i + dist, PRIMARY_COLOR, SECONDARY_COLOR, times, callback);         
            }
        } else {
            times = await this.exchange(source, source[lhs].value > source[lhs + dist].value, lhs, lhs + dist, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, times, callback);    
        }
        
        return times;
    }

    protected async mergeByDescent(source: SortDataModel[], lhs: number, rhs: number, dist: number, times: number, callback: (param: SortStateModel) => void): Promise<number> {
        const span: number = dist + dist;
        
        if (span < rhs - lhs + 1) {
            times = await this.mergeByDescent(source, lhs, rhs - dist, span, times, callback);
            times = await this.mergeByDescent(source, lhs, rhs, span, times, callback);
                        
            for (let i = rhs - dist; i - dist > lhs - 1; i -= span) { 
                times = source[i].value > source[i - dist].value 
                    ? await this.exchange(source, true, i, i - dist, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, times, callback)
                    : await this.dualSweep(source, i, i - dist, PRIMARY_COLOR, SECONDARY_COLOR, times, callback);              
            }
        } else {
            times = await this.exchange(source, source[rhs].value > source[rhs - dist].value, rhs, rhs - dist, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, times, callback);     
        }
        
        return times;
    }

}

/**
 * 奇偶归并排序（迭代）
 */
export class IterativeBatcherMergeSortAlgorithm extends RecursiveBatcherMergeSortAlgorithm {

    protected override async sortByAscent(source: SortDataModel[], lhs: number, rhs: number, option: SortOption, callback: (param: SortStateModel) => void): Promise<void> {
        let i: number, j: number, times: number = 0;

        for (let p = 1, length = rhs - lhs + 1; p < length; p += p) {
            for (let dist = p; dist > 0; dist >>= 1) {
                for (let span = dist % p; span + dist < rhs + 1; span += dist + dist) {
                    for (let k = 0; k < dist; k++) { 
                        i = lhs + k + span;
                        j = lhs + k + span + dist;
                        
                        if (floor(i / (p + p), 0) === floor(j / (p + p), 0)) {
                            times = await this.exchange(source, j < rhs + 1 && source[i].value > source[j].value, i, j, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, times, callback);
                        } else {
                            times = await this.dualSweep(source, i, j, PRIMARY_COLOR,SECONDARY_COLOR, times, callback);
                        }
                    }
                }
            }
        }

        await delay();
        await this.complete(source, times, callback);
    }

    protected override async sortByDescent(source: SortDataModel[], lhs: number, rhs: number, option: SortOption, callback: (param: SortStateModel) => void): Promise<void> {
        let i: number, j: number, times: number = 0;

        for (let p = 1, length = rhs - lhs + 1; p < length; p += p) {
            for (let dist = p; dist > 0; dist >>= 1) {
                for (let span = dist % p; span + dist < length; span += dist + dist) {
                    for (let k = 0; k < dist; k++) {
                        i = rhs - k - span;
                        j = rhs - k - span - dist;

                        if (floor(i / (p + p), 0) === floor(j / (p + p), 0)) {
                            times = await this.exchange(source, j > lhs - 1 && source[i].value > source[j].value, i, j, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, times, callback);
                        } else {
                            times = await this.dualSweep(source, i, j, PRIMARY_COLOR,SECONDARY_COLOR, times, callback);
                        }
                    }
                }
            }
        }

        await delay();
        await this.complete(source, times, callback);
    }

}
