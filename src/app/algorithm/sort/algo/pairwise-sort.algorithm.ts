import { Injectable } from "@angular/core";
import { floor } from "lodash";

import { SortDataModel, SortOption, SortOrder, SortStateModel } from "../ngrx-store/sort.state";

import { ACCENT_COLOR, delay, PRIMARY_COLOR, SECONDARY_COLOR } from "../../../public/global.utils";

import { AbstractBinarySortAlgorithm } from "../pattern/sort-temp.pattern";


/**
 * 成对网络排序（递归）
 */
export class RecursivePairwiseNetworkSortAlgorithm extends AbstractBinarySortAlgorithm {

    protected override async sortByAscent(source: SortDataModel[], lhs: number, rhs: number, option: SortOption, callback: (param: SortStateModel) => void): Promise<void> {
        let times: number = await this.newSortByOrder(source, lhs, rhs, 1, 'ascent', 0, callback);

        await delay();
        await this.complete(source, times, callback);
    }

    protected override async sortByDescent(source: SortDataModel[], lhs: number, rhs: number, option: SortOption, callback: (param: SortStateModel) => void): Promise<void> {
        let times: number = await this.newSortByOrder(source, lhs, rhs, 1, 'descent', 0, callback);

        await delay();
        await this.complete(source, times, callback);
    }

    protected override async sortByOrder(source: SortDataModel[], lhs: number, rhs: number, order: SortOrder, times: number, callback: (param: SortStateModel) => void): Promise<number> {
        throw new Error("Method not implemented.");
    }

    protected async newSortByOrder(source: SortDataModel[], lhs: number, rhs: number, dist: number, order: SortOrder, times: number, callback: (param: SortStateModel) => void): Promise<number> {
        if (lhs < rhs + 1 - dist) {
            let mod: number = floor((rhs - lhs + 1) / dist, 0);

            if (order === 'ascent') {
                times = await this.beforePairwiseByOrder(source, lhs, rhs, dist, order, times, callback);
    
                if (mod % 2 === 0) {
                    times = await this.newSortByOrder(source, lhs, rhs, dist + dist, order, times, callback);
                    times = await this.newSortByOrder(source, lhs + dist, rhs + dist, dist + dist, order, times, callback);
                } else {
                    times = await this.newSortByOrder(source, lhs, rhs + dist, dist + dist, order, times, callback);
                    times = await this.newSortByOrder(source, lhs + dist, rhs, dist + dist, order, times, callback);
                }
                
                times = await this.afterPairwiseByOrder(source, lhs, rhs, dist, order, times, callback);
            }
            
            if (order === 'descent') {
                times = await this.beforePairwiseByOrder(source, lhs, rhs, dist, order, times, callback);
    
                if (mod % 2 === 0) {
                    times = await this.newSortByOrder(source, lhs, rhs, dist + dist, order, times, callback);
                    times = await this.newSortByOrder(source, lhs - dist, rhs - dist, dist + dist, order, times, callback);
                } else {
                    times = await this.newSortByOrder(source, lhs - dist, rhs, dist + dist, order, times, callback);
                    times = await this.newSortByOrder(source, lhs, rhs - dist, dist + dist, order, times, callback);
                }
    
                times = await this.afterPairwiseByOrder(source, lhs, rhs, dist, order, times, callback);
            }
        }
        

        return times;
    }

    protected async beforePairwiseByOrder(source: SortDataModel[], lhs: number, rhs: number, dist: number, order: SortOrder, times: number, callback: (param: SortStateModel) => void): Promise<number> {
        let j: number;

        if (order === 'ascent') {
            for (let i = lhs + dist; i <= rhs; i += dist + dist) {
                j = i - dist;
                
                times = source[i].value < source[j].value 
                    ? await this.exchange(source, true, i, j, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, times, callback)
                    : await this.dualSweep(source, i, j, PRIMARY_COLOR, SECONDARY_COLOR, times, callback);
            }
        }
        
        if (order === 'descent') {
            for (let i = rhs - dist; i >= lhs; i -= dist + dist) {
                j = i + dist;
                
                times = source[i].value < source[j].value 
                    ? await this.exchange(source, true, i, j, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, times, callback)
                    : await this.dualSweep(source, i, j, PRIMARY_COLOR, SECONDARY_COLOR, times, callback);
            }
        }
        
        return times;
    }

    protected async afterPairwiseByOrder(source: SortDataModel[], lhs: number, rhs: number, dist: number, order: SortOrder, times: number, callback: (param: SortStateModel) => void): Promise<number> {
        let j: number, span: number = 1;

        while (span < floor((rhs - lhs + 1) / dist, 0)) span = span + span + 1;

        if (order === 'ascent') {
            for (let i = lhs + dist; i + dist <= rhs; i += dist + dist) {
                for (let k = span >> 1; k > 0; k >>= 1) {
                    j = i + k * dist;
                    
                    if (j < rhs) {
                        times = source[i].value > source[j].value 
                            ? await this.exchange(source, true, i, j, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, times, callback)
                            : await this.dualSweep(source, i, j, PRIMARY_COLOR, SECONDARY_COLOR, times, callback);
                    }
                }
            }
        }
        
        if (order === 'descent') {
            for (let i = rhs - dist; i - dist >= lhs; i -= dist + dist) {
                for (let k = span >> 1; k > 0; k >>= 1) {
                    j = i - k * dist;
                    
                    if (j > lhs) {
                        times = source[i].value > source[j].value 
                            ? await this.exchange(source, true, i, j, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, times, callback)
                            : await this.dualSweep(source, i, j, PRIMARY_COLOR, SECONDARY_COLOR, times, callback);
                    }
                }
            }
        }

        return times;
    }

}

/**
 * 成对网络排序（迭代）
 */
export class IterativePairwiseNetworkSortAlgorithm extends RecursivePairwiseNetworkSortAlgorithm {

    protected override async sortByAscent(source: SortDataModel[], lhs: number, rhs: number, option: SortOption, callback: (param: SortStateModel) => void): Promise<void> {
        let j: number, level: number, index: number = -1, times: number = 0;

        for (let dist = 1; dist < rhs - lhs + 1; dist = dist + dist, index = dist) {
            level = 0;

            for (let i = dist; i <= rhs;) {
                j = i - dist;

                times = source[i].value < source[j].value
                    ? await this.exchange(source, true, i, j, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, times, callback)
                    : await this.dualSweep(source, i, j, PRIMARY_COLOR, SECONDARY_COLOR, times, callback);

                level = (level + 1) % dist;
                i += 1;

                if (level === 0) i += dist;
            }
        }

        for (let dist = index >> 2, span = 1; dist > 0; dist >>= 1, span = span + span + 1) {
            for (let k = span; k > 0; k >>= 1) {
                level = 0;
                j = lhs + dist + k * dist;

                for (let i = j; i <= rhs;) {
                    j = i - k * dist;

                    times = source[i].value < source[j].value
                        ? await this.exchange(source, true, i, j, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, times, callback)
                        : await this.dualSweep(source, i, j, PRIMARY_COLOR, SECONDARY_COLOR, times, callback);
                    
                    level = (level + 1) % dist;
                    i += 1;
    
                    if (level === 0) i += dist;
                }
            }
        }
        
        await delay();
        await this.complete(source, times, callback);
    }

    protected override async sortByDescent(source: SortDataModel[], lhs: number, rhs: number, option: SortOption, callback: (param: SortStateModel) => void): Promise<void> {
        let j: number, level: number, index: number = -1, times: number = 0;

        for (let dist = 1; dist < rhs - lhs + 1; dist = dist + dist, index = dist) {
            level = 0;

            for (let i = rhs - dist; i >= lhs;) {
                j = i + dist;

                times = source[i].value < source[j].value
                    ? await this.exchange(source, true, i, j, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, times, callback)
                    : await this.dualSweep(source, i, j, PRIMARY_COLOR, SECONDARY_COLOR, times, callback);

                level = (level + 1) % dist;
                i -= 1;

                if (level === 0) i -= dist;
            }
        }

        for (let dist = index >> 2, span = 1; dist > 0; dist >>= 1, span = span + span + 1) {
            for (let k = span; k > 0; k >>= 1) {
                level = 0;
                j = rhs - dist - k * dist;

                for (let i = j; i >= lhs;) {
                    j = i + k * dist;

                    times = source[i].value < source[j].value
                        ? await this.exchange(source, true, i, j, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, times, callback)
                        : await this.dualSweep(source, i, j, PRIMARY_COLOR, SECONDARY_COLOR, times, callback);
                    
                    level = (level + 1) % dist;
                    i -= 1;
    
                    if (level === 0) i -= dist;
                }
            }
        }

        await delay();
        await this.complete(source, times, callback);
    }

}