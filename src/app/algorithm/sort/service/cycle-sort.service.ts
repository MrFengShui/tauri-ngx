import { Injectable } from "@angular/core";

import { SortDataModel, SortStateModel, SortOrder } from "../ngrx-store/sort.state";

import { ACCENT_COLOR, delay } from "../../../public/global.utils";
import { PRIMARY_COLOR, SECONDARY_COLOR } from "../../../public/global.utils";

import { AbstractBinarySortService, AbstractSortService } from "./base-sort.service";

/**
 * 循环排序（递归）
 */
@Injectable()
export class RecursiveCycleSortService extends AbstractBinarySortService {

    protected override async sortByAscent(source: SortDataModel[], lhs: number, rhs: number, option: string | number | undefined, callback: (param: SortStateModel) => void): Promise<void> {
        let times: number = 0;

        for (let i = lhs; i <= rhs; i++) {
            times = await this.sortByOrder(source, i, rhs, 'ascent', times, callback)
        }

        await delay();
        await this.complete(source, times, callback);
    }

    protected override async sortByDescent(source: SortDataModel[], lhs: number, rhs: number, option: string | number | undefined, callback: (param: SortStateModel) => void): Promise<void> {
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
    
                times = await this.render(source, i, i, ACCENT_COLOR, ACCENT_COLOR, times, callback);
                times += 1;
            }

            await this._service.swapAndRender(source, false, true, lhs, idx, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, times, callback);

            times += 1;
            flag = lhs + 1 === source[lhs].value;
        }

        if (order === 'descent') {
            idx = source.length - source[rhs].value;

            for (let i = rhs; i >= lhs; i--) {
                source[rhs].color = PRIMARY_COLOR;
                source[idx].color = SECONDARY_COLOR;
                callback({ times, datalist: source });
    
                times = await this.render(source, i, i, ACCENT_COLOR, ACCENT_COLOR, times, callback);
                times += 1;
            }

            await this._service.swapAndRender(source, false, true, rhs, idx, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, times, callback);

            times += 1;
            flag = source.length - rhs === source[rhs].value;
        }
        
        return flag ? times : this.sortByOrder(source, lhs, rhs, order, times, callback);
    }

}

/**
 * 循环排序（迭代）
 */
@Injectable()
export class IterativeCycleSortService extends RecursiveCycleSortService {

    protected override async sortByAscent(source: SortDataModel[], lhs: number, rhs: number, option: string | number | undefined, callback: (param: SortStateModel) => void): Promise<void> {
        let index: number, times: number = 0, completed: boolean;

        for (let i = lhs; i <= rhs; i++) {
            completed = false;

            while (!completed) {
                index = source[i].value - 1;

                for (let j = i; j <= rhs; j++) {
                    source[i].color = PRIMARY_COLOR;
                    source[index].color = SECONDARY_COLOR;
                    callback({ times, datalist: source });
        
                    times = await this.render(source, j, j, ACCENT_COLOR, ACCENT_COLOR, times, callback);
                    times += 1;
                }
    
                [completed, times] = await this._service.swapAndRender(source, false, true, i, index, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, times, callback);
    
                completed = i + 1 === source[i].value;
            }
        }

        await delay();
        await this.complete(source, times, callback);
    }

    protected override async sortByDescent(source: SortDataModel[], lhs: number, rhs: number, option: string | number | undefined, callback: (param: SortStateModel) => void): Promise<void> {
        let index: number, times: number = 0, completed: boolean;

        for (let i = rhs; i >= lhs; i--) {
            completed = false;

            while (!completed) {
                index = rhs - lhs + 1 - source[i].value;

                for (let j = i; j >= lhs; j--) {
                    source[i].color = PRIMARY_COLOR;
                    source[index].color = SECONDARY_COLOR;
                    callback({ times, datalist: source });
        
                    times = await this.render(source, j, j, ACCENT_COLOR, ACCENT_COLOR, times, callback);
                    times += 1;
                }

                [completed, times] = await this._service.swapAndRender(source, false, true, i, index, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, times, callback);
                
                completed = rhs - lhs + 1 === source[i].value + i;
            }
        }

        await delay();
        await this.complete(source, times, callback);
    }

}

/**
 * 猜测排序
 */
@Injectable()
export class GuessSortService extends AbstractSortService {

    protected override async sortByAscent(source: SortDataModel[], lhs: number, rhs: number, option: string | number | undefined, callback: (param: SortStateModel) => void): Promise<void> {
        let value: number, completed: boolean = false, times: number = 0;

        while (!completed) {
            completed = true;

            for (let i = lhs; i <= rhs; i++) {
                value = source[i].value;

                [completed, times] = await this._service.swapAndRender(source, completed, i !== value - 1, i, value - 1, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, times, callback);
            }
        }

        await delay();
        await this.complete(source, times, callback);
    }

    protected override async sortByDescent(source: SortDataModel[], lhs: number, rhs: number, option: string | number | undefined, callback: (param: SortStateModel) => void): Promise<void> {
        let index: number, value: number, completed: boolean = false, times: number = 0;

        while (!completed) {
            completed = true;

            for (let i = rhs; i >= lhs; i--) {
                value = source[i].value;
                index = rhs - lhs - value + 1;

                [completed, times] = await this._service.swapAndRender(source, completed, i !== index, i, index, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, times, callback);
            }
        }

        await delay();
        await this.complete(source, times, callback);
    }

}
