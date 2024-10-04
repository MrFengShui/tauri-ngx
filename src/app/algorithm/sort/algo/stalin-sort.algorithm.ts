
import { SortDataModel, SortOption, SortOrder, SortStateModel } from "../ngrx-store/sort.state";

import { ACCENT_COLOR, ACCENT_ONE_COLOR, ACCENT_TWO_COLOR, delay, PRIMARY_COLOR, SECONDARY_COLOR } from "../../../public/global.utils";

import { AbstractComparisonSortAlgorithm, AbstractDistributionSortAlgorithm } from "../pattern/sort-temp.pattern";
import { SortToolsService } from "../ngrx-store/sort.service";
import { InsertionSortAlgorithm } from "./insertion-sort.algorithm";

/**
 * 斯大林排序
 */
export class StalinSortAlgorithm extends AbstractDistributionSortAlgorithm {

    protected size: number = -1;

    protected override async sortByAscent(source: SortDataModel[], lhs: number, rhs: number, option: SortOption, callback: (param: SortStateModel) => void): Promise<void> {
        let times: number = 0;

        while (this.size !== 0) {
            times = await this.saveByOrder(source, lhs, rhs, 'ascent', times, callback);
            times = await this.loadByOrder(source, lhs, rhs, 'ascent', times, callback);
        }

        this.size = -1;
        
        await delay();
        await this.complete(source, times, callback);
    }

    protected override async sortByDescent(source: SortDataModel[], lhs: number, rhs: number, option: SortOption, callback: (param: SortStateModel) => void): Promise<void> {
        let times: number = 0;

        while (this.size !== 0) {
            times = await this.saveByOrder(source, lhs, rhs, 'descent', times, callback);
            times = await this.loadByOrder(source, lhs, rhs, 'descent', times, callback);
        }

        this.size = -1;
        
        await delay();
        await this.complete(source, times, callback);
    }

    protected override async saveByOrder(source: SortDataModel[], lhs: number, rhs: number, order: SortOrder, times: number, callback: (param: SortStateModel) => void): Promise<number> {
        let index: number = -1;

        for (let i = lhs; i <= rhs; i++) {
            if (order === 'ascent') index = lhs + i;

            if (order === 'descent') index = rhs - i;

            this.array.push(source[index].value);

            times = await this.sweep(source, index, ACCENT_ONE_COLOR, times, callback);
            times += 1;
        }

        for (let i = 0; i < this.array.length - 1; ) {
            if (this.array[i + 1] < this.array[i]) {
                this.queue.push(...this.array.splice(i + 1, 1));
            } else {
                i += 1;
            }
        }

        return times;
    }

    protected override async loadByOrder(source: SortDataModel[], lhs: number, rhs: number, order: SortOrder, times: number, callback: (param: SortStateModel) => void): Promise<number> {
        let index: number = -1;

        this.size = this.queue.length;

        if (this.queue.length > 0) {
            this.array = this.queue.concat(...this.array);
            this.queue.splice(0);
        }

        if (order === 'ascent') index = lhs;

        if (order === 'descent') index = rhs;

        while (this.array.length > 0) {
            source[index].value = this.array.shift() as number;

            times = await this.sweep(source, index, ACCENT_TWO_COLOR, times, callback);
            times += 1;
            
            if (order === 'ascent') index += 1;

            if (order === 'descent') index -= 1;
        }

        return times;
    }

}

/**
 * 斯大林排序
 */
export class InPlaceStalinSortAlgorithm extends AbstractComparisonSortAlgorithm {

    private insertSort: InsertionSortAlgorithm | null = null;

    constructor(protected override _service: SortToolsService) {
        super(_service);

        if (this.insertSort === null) this.insertSort = new InsertionSortAlgorithm(_service);
    }

    protected override async sortByAscent(source: SortDataModel[], lhs: number, rhs: number, option: SortOption, callback: (param: SortStateModel) => void): Promise<void> {
        if (this.insertSort === null) throw new Error(`错误：引用对象${this.insertSort}未被初始化。`);

        let k: number = -1, stop: boolean = false, flag: boolean, delta: number, times: number = 0;

        while (!stop) {
            stop = true;

            for (let i = lhs, j = lhs + 1; j <= rhs; j++, k = i) {
                times = await this.dualSweep(source, i, j, PRIMARY_COLOR, SECONDARY_COLOR, times, callback);
                flag = source[j].value >= source[i].value;
                stop &&= flag;

                if (flag) {
                    times = await this.exchange(source, true, i + 1, j, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, times, callback);

                    i += 1;
                }
            }

            delta = lhs + k + 1;

            for (let i = k + 1; i <= rhs; i++, k++) {
                k = i - delta;

                times = await this.insertSort.moveByOrder(source, k, i, PRIMARY_COLOR, SECONDARY_COLOR, 'ascent', times, callback);
            }
        }
        
        await delay();
        await this.complete(source, times, callback);
    }

    protected override async sortByDescent(source: SortDataModel[], lhs: number, rhs: number, option: SortOption, callback: (param: SortStateModel) => void): Promise<void> {
        if (this.insertSort === null) throw new Error(`错误：引用对象${this.insertSort}未被初始化。`);

        let k: number = -1, stop: boolean = false, flag: boolean, delta: number, times: number = 0;

        while (!stop) {
            stop = true;

            for (let i = rhs, j = rhs - 1; j >= lhs; j--, k = i) {
                times = await this.dualSweep(source, i, j, PRIMARY_COLOR, SECONDARY_COLOR, times, callback);
                flag = source[j].value >= source[i].value;
                stop &&= flag;

                if (flag) {
                    times = await this.exchange(source, true, i - 1, j, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, times, callback);

                    i -= 1;
                }
            }

            delta = rhs - k + 1;

            for (let i = k - 1; i >= lhs; i--, k--) {
                k = i + delta;
                
                times = await this.insertSort.moveByOrder(source, i, k, PRIMARY_COLOR, SECONDARY_COLOR, 'descent', times, callback);
            }
        }
        
        await delay();
        await this.complete(source, times, callback);
    }

}
