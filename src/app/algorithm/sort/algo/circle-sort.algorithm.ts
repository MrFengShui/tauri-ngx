import { floor } from "lodash";

import { SortDataModel, SortOption, SortOrder, SortStateModel } from "../ngrx-store/sort.state";

import { ACCENT_COLOR, delay, PRIMARY_COLOR, SECONDARY_COLOR } from "../../../public/global.utils";

import { AbstractComparisonSortAlgorithm } from "../pattern/sort-temp.pattern";

/**
 * 圆圈排序（递归）
 */
export class RecursiveCircleSortAlgorithm extends AbstractComparisonSortAlgorithm {
    
    protected override async sortByAscent(source: SortDataModel[], lhs: number, rhs: number, option: SortOption, callback: (param: SortStateModel) => void): Promise<void> {
        let count: number = -1, times: number = 0;

        while (count !== 0) {
            [times, count] = rhs - lhs + 1 > 384 
                ? await this.tailSortByOrder(source, lhs, rhs, 0, 'ascent', times, callback)
                : await this.sortByOrder(source, lhs, rhs, 0, 'ascent', 0, callback);
        }

        await delay();
        await this.complete(source, times, callback);
    }

    protected override async sortByDescent(source: SortDataModel[], lhs: number, rhs: number, option: SortOption, callback: (param: SortStateModel) => void): Promise<void> {
        let count: number = -1, times: number = 0;
        
        while (count !== 0) {
            [times, count] = rhs - lhs + 1 > 384 
                ? await this.tailSortByOrder(source, lhs, rhs, 0, 'descent', times, callback)
                : await this.sortByOrder(source, lhs, rhs, 0, 'descent', 0, callback);
        }

        await delay();
        await this.complete(source, times, callback);
    }

    protected async sortByOrder(source: SortDataModel[], lhs: number, rhs: number, count: number, order: SortOrder, times: number, callback: (param: SortStateModel) => void): Promise<[number, number]> {
        let mid: number;

        if (lhs < rhs) {
            if (order === 'ascent') {
                mid = lhs + floor((rhs - lhs) * 0.5);

                [times, count] = await this.rotateByOrder(source, lhs, rhs, count, order, times, callback);
                [times, count] = await this.sortByOrder(source, lhs, mid, count, order, times, callback);
                [times, count]= await this.sortByOrder(source, mid + 1, rhs, count, order, times, callback);
            }
            
            if (order === 'descent') {
                mid = rhs - floor((rhs - lhs) * 0.5);

                [times, count] = await this.rotateByOrder(source, lhs, rhs, count, order, times, callback);
                [times, count] = await this.sortByOrder(source, mid, rhs, count, order, times, callback);
                [times, count] = await this.sortByOrder(source, lhs, mid - 1, count, order, times, callback);
            }
        } 

        return [times, count];
    }

    protected async tailSortByOrder(source: SortDataModel[], lhs: number, rhs: number, count: number, order: SortOrder, times: number, callback: (param: SortStateModel) => void): Promise<[number, number]> {
        let mid: number;

        while (lhs < rhs) {
            if (order === 'ascent') {
                mid = lhs + floor((rhs - lhs) * 0.5);

                [times, count] = await this.rotateByOrder(source, lhs, rhs, count, order, times, callback);
                [times, count] = await this.tailSortByOrder(source, lhs, mid, count, order, times, callback);

                lhs = mid + 1;
            }
            
            if (order === 'descent') {
                mid = rhs - floor((rhs - lhs) * 0.5);

                [times, count] = await this.rotateByOrder(source, lhs, rhs, count, order, times, callback);
                [times, count] = await this.tailSortByOrder(source, mid, rhs, count, order, times, callback);

                rhs = mid - 1;
            }
        } 
        
        return [times, count];
    }

    protected async rotateByOrder(source: SortDataModel[], lhs: number, rhs: number, count: number, order: SortOrder, times: number, callback: (param: SortStateModel) => void): Promise<[number, number]> {
        let start: number = lhs, final: number = rhs;

        while (start < final) {
            if (order === 'ascent' && source[start].value > source[final].value) {
                count += 1;

                times = await this.exchange(source, true, start, final, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, times, callback);
            }

            if (order === 'descent' && source[start].value < source[final].value) {
                count += 1;

                times = await this.exchange(source, true, start, final, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, times, callback);
            }

            times = await this.dualSweep(source, start, final, PRIMARY_COLOR, SECONDARY_COLOR, times, callback);

            start += 1;
            final -= 1;
        }
        
        if (start === final) {
            if (order === 'ascent') {
                final = Math.min(final + 1, rhs);

                if (source[start].value > source[final].value) {
                    count += 1;

                    times = await this.exchange(source, true, start, final, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, times, callback);
                }
            }

            if (order === 'descent') {
                start = Math.max(start - 1, lhs);

                if (source[start].value < source[final].value) {
                    count += 1;

                    times = await this.exchange(source, true, start, final, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, times, callback);
                }
            }
        }
        
        return [times, count];
    }
    
}

/**
 * 圆圈排序（迭代）
 */
export class IterativeCircleSortAlgorithm extends RecursiveCircleSortAlgorithm {

    protected override async sortByAscent(source: SortDataModel[], lhs: number, rhs: number, option: SortOption, callback: (param: SortStateModel) => void): Promise<void> {
        let start: number, final: number, split: number, count: number = -1, times: number = 0;

        while (count !== 0) {
            count = 0;

            this.stack.push(rhs);
            this.stack.push(lhs);

            while (this.stack.length > 0) {
                start = this.stack.pop() as number;
                final = this.stack.pop() as number;
                
                [times, count] = await this.rotateByOrder(source, start, final, count, 'ascent', times, callback);
                
                if (start < final) {
                    split = start + floor((final - start) * 0.5, 0);
    
                    if (split + 1 < final) {
                        this.stack.push(final);
                        this.stack.push(split + 1);
                    }
    
                    if (start < split) {
                        this.stack.push(split);
                        this.stack.push(start);
                    }
                }
            }
        }

        await delay();
        await this.complete(source, times, callback);
    }

    protected override async sortByDescent(source: SortDataModel[], lhs: number, rhs: number, option: SortOption, callback: (param: SortStateModel) => void): Promise<void> {
        let start: number, final: number, split: number, count: number = -1, flag: boolean, times: number = 0;

        while (count !== 0) {
            count = 0;

            this.stack.push(lhs);
            this.stack.push(rhs);

            while (this.stack.length > 0) {
                final = this.stack.pop() as number;
                start = this.stack.pop() as number;
                
                [times, count] = await this.rotateByOrder(source, start, final, count, 'descent', times, callback);
                
                if (start < final) {
                    split = final - floor((final - start) * 0.5, 0);
    
                    if (start < split) {
                        this.stack.push(start);
                        this.stack.push(split - 1);
                    }

                    if (split < final) {
                        this.stack.push(split);
                        this.stack.push(final);
                    }
                }
            }
        }

        await delay();
        await this.complete(source, times, callback);
    }

}