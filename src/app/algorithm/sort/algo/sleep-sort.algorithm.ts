
import { sum } from "lodash";
import { delay } from "../../../public/global.utils";
import { ACCENT_ONE_COLOR, ACCENT_TWO_COLOR } from "../../../public/global.utils";

import { SortDataModel, SortStateModel, SortOrder, SortOption } from "../ngrx-store/sort.state";

import { AbstractDistributionSortAlgorithm } from "../pattern/sort-temp.pattern";

/**
 * 睡眠排序（阻塞）
 */
export class BlockSleepSortAlgorithm extends AbstractDistributionSortAlgorithm {

    protected override async sortByAscent(source: SortDataModel[], lhs: number, rhs: number, option: SortOption, callback: (param: SortStateModel) => void): Promise<void> {
        let times: number = 0;

        times = await this.saveByOrder(source, lhs, rhs, 'ascent', times, callback);
        times = await this.loadByOrder(source, lhs, rhs, 'ascent', times, callback);

        await delay();
        await this.complete(source, times, callback);
    }

    protected override async sortByDescent(source: SortDataModel[], lhs: number, rhs: number, option: SortOption, callback: (param: SortStateModel) => void): Promise<void> {
        let times: number = 0;

        times = await this.saveByOrder(source, lhs, rhs, 'descent', times, callback);
        times = await this.loadByOrder(source, lhs, rhs, 'descent', times, callback);

        await delay();
        await this.complete(source, times, callback);
    }

    protected override async saveByOrder(source: SortDataModel[], lhs: number, rhs: number, order: SortOrder, times: number, callback: (param: SortStateModel) => void): Promise<number> {
        let index: number = -1;

        for (let i = lhs; i <= rhs; i++) {
            if (order === 'ascent') {
                index = lhs + i;
                this.array.push(source[index].value);
            }

            if (order === 'descent') {
                index = rhs - i;
                this.array.push(source[index].value);
            }
            
            times = await this.sweep(source, index, ACCENT_ONE_COLOR, times, callback);
            times += 1;
            
            source[index].value = 0;
        }

        return times;
    }

    protected override async loadByOrder(source: SortDataModel[], lhs: number, rhs: number, order: SortOrder, times: number, callback: (param: SortStateModel) => void): Promise<number> {
        let value: number;
        
        while (this.array.length > 0) {
            value = this.array.pop() as number;

            times = await this.task(source, value, order, value, times, callback);
        }
        
        return times;
    }

    protected async task(source: SortDataModel[], value: number, order: SortOrder, duration: number, times: number, callback: (param: SortStateModel) => void): Promise<number> {
        let index: number = -1;

        if (order === 'ascent') index = value - 1;
            
        if (order === 'descent') index = source.length - value;

        source[index].value = value;
        
        times = await this.sweepWithDuration(source, index, ACCENT_TWO_COLOR, duration, times, callback);
        return times + 1;
    }

}

/**
 * 睡眠排序（异步）
 */
export class AsyncSleepSortAlgorithm extends BlockSleepSortAlgorithm {

    private tasks: Promise<number>[] = Array.from([]);

    protected override async loadByOrder(source: SortDataModel[], lhs: number, rhs: number, order: SortOrder, times: number, callback: (param: SortStateModel) => void): Promise<number> {
        let value: number;

        while (this.array.length > 0) {
            value = this.array.pop() as number;
            this.tasks.push(this.createTask(source, value, order, times, callback));
        }

        value = (await Promise.all(this.tasks)).pop() as number;

        this.tasks.splice(0);
        return times + value - 1;
    }

    private createTask(source: SortDataModel[], value: number, order: SortOrder, times: number, callback: (param: SortStateModel) => void): Promise<number> {
        return new Promise(resolve => {
            let task = setTimeout(async () => {
                clearTimeout(task);

                times = await this.task(source, value, order, 1, times, callback);

                resolve(times);
            }, value * 10);
        });
    }

}