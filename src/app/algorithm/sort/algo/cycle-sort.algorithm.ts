
import { SortDataModel, SortStateModel, SortOrder, SortOption } from "../ngrx-store/sort.state";

import { ACCENT_COLOR, delay } from "../../../public/global.utils";
import { PRIMARY_COLOR, SECONDARY_COLOR } from "../../../public/global.utils";

import { AbstractBinarySortAlgorithm, AbstractComparisonSortAlgorithm } from "../pattern/sort-temp.pattern";

/**
 * 循环排序（递归）
 */
export class RecursiveCycleSortAlgorithm extends AbstractBinarySortAlgorithm {

    protected override async sortByAscent(source: SortDataModel[], lhs: number, rhs: number, option: SortOption, callback: (param: SortStateModel) => void): Promise<void> {
        let times: number = 0;

        for (let i = lhs; i <= rhs; i++) {
            times = await this.sortByOrder(source, i, rhs, 'ascent', times, callback)
        }

        await delay();
        await this.complete(source, times, callback);
    }

    protected override async sortByDescent(source: SortDataModel[], lhs: number, rhs: number, option: SortOption, callback: (param: SortStateModel) => void): Promise<void> {
        let times: number = 0;

        for (let i = rhs; i >= lhs; i--) {
            times = await this.sortByOrder(source, lhs, i, 'descent', times, callback)
        }

        await delay();
        await this.complete(source, times, callback);
    }

    protected override async sortByOrder(source: SortDataModel[], lhs: number, rhs: number, order: SortOrder, times: number, callback: (param: SortStateModel) => void): Promise<number> {
        let flag: boolean = false, idx: number = -1;

        if (order === 'ascent') {
            idx = source[lhs].value - 1;

            for (let i = lhs; i <= rhs; i++) {
                source[lhs].color = PRIMARY_COLOR;
                source[idx].color = SECONDARY_COLOR;
                callback({ times, datalist: source });
    
                times = await this.sweep(source, i, ACCENT_COLOR, times, callback);
            }

            times = await this.exchange(source, true, lhs, idx, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, times, callback);

            flag = lhs + 1 === source[lhs].value;
        }

        if (order === 'descent') {
            idx = source.length - source[rhs].value;

            for (let i = rhs; i >= lhs; i--) {
                source[rhs].color = PRIMARY_COLOR;
                source[idx].color = SECONDARY_COLOR;
                callback({ times, datalist: source });
    
                times = await this.sweep(source, i, ACCENT_COLOR, times, callback);
            }

            times = await this.exchange(source, true, rhs, idx, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, times, callback);

            flag = source.length - rhs === source[rhs].value;
        }
        
        return flag ? times : await this.sortByOrder(source, lhs, rhs, order, times, callback);
    }

}

/**
 * 循环排序（迭代）
 */
export class IterativeCycleSortAlgorithm extends RecursiveCycleSortAlgorithm {

    protected override async sortByAscent(source: SortDataModel[], lhs: number, rhs: number, option: SortOption, callback: (param: SortStateModel) => void): Promise<void> {
        let k: number, stop: boolean, times: number = 0;

        for (let i = lhs; i <= rhs; i++) {
            stop = false;

            while (!stop) {
                k = source[i].value - 1;

                for (let j = i; j <= rhs; j++) {
                    source[i].color = PRIMARY_COLOR;
                    source[k].color = SECONDARY_COLOR;
                    callback({ times, datalist: source });
        
                    times = await this.sweep(source, j, ACCENT_COLOR, times, callback);
                }
    
                times = await this.exchange(source, true, i, k, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, times, callback);
    
                stop = i + 1 === source[i].value;
            }
        }

        await delay();
        await this.complete(source, times, callback);
    }

    protected override async sortByDescent(source: SortDataModel[], lhs: number, rhs: number, option: SortOption, callback: (param: SortStateModel) => void): Promise<void> {
        let k: number, stop: boolean, times: number = 0;

        for (let i = rhs; i >= lhs; i--) {
            stop = false;

            while (!stop) {
                k = rhs - lhs + 1 - source[i].value;

                for (let j = i; j >= lhs; j--) {
                    source[i].color = PRIMARY_COLOR;
                    source[k].color = SECONDARY_COLOR;
                    callback({ times, datalist: source });
        
                    times = await this.sweep(source, j, ACCENT_COLOR, times, callback);
                }

                times = await this.exchange(source, true, i, k, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, times, callback);
                
                stop = rhs - lhs + 1 === source[i].value + i;
            }
        }

        await delay();
        await this.complete(source, times, callback);
    }

}

/**
 * 猜测排序
 */
export class GuessSortAlgorithm extends AbstractComparisonSortAlgorithm {

    protected override async sortByAscent(source: SortDataModel[], lhs: number, rhs: number, option: SortOption, callback: (param: SortStateModel) => void): Promise<void> {
        let j: number, stop: boolean = false, times: number = 0;

        while (!stop) {
            stop = true;

            for (let i = lhs; i <= rhs; i++) {
                j = source[i].value - 1;

                if (i !== j) stop = false;

                times = await this.exchange(source, i !== j, i, j, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, times, callback);
            }
        }

        await delay();
        await this.complete(source, times, callback);
    }

    protected override async sortByDescent(source: SortDataModel[], lhs: number, rhs: number, option: SortOption, callback: (param: SortStateModel) => void): Promise<void> {
        let j: number, stop: boolean = false, times: number = 0;

        while (!stop) {
            stop = true;

            for (let i = rhs; i >= lhs; i--) {
                j = rhs - lhs + 1 - source[i].value;
                
                if (i !== j) stop = false;

                times = await this.exchange(source, i !== j, i, j, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, times, callback);
            }
        }

        await delay();
        await this.complete(source, times, callback);
    }

}
