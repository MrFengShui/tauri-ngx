import { Injectable } from "@angular/core";

import { delay } from "../../../public/global.utils";
import { PRIMARY_COLOR, SECONDARY_COLOR, PRIMARY_ONE_COLOR, SECONDARY_ONE_COLOR, PRIMARY_TWO_COLOR, SECONDARY_TWO_COLOR, ACCENT_COLOR, ACCENT_ONE_COLOR, ACCENT_TWO_COLOR } from "../../../public/global.utils";

import { SortDataModel, SortOrder, SortStateModel } from "../ngrx-store/sort.state";

import { AbstractSortService } from "./base-sort.service";
import { floor, times } from "lodash";

/**
 * 交換排序
 */
@Injectable()
export class ExchangeSortService extends AbstractSortService {

    protected override async sortByAscent(source: SortDataModel[], lhs: number, rhs: number, option: string | number | undefined, callback: (param: SortStateModel) => void): Promise<void> {
        let times: number = await this.bubbleSortByAscent(source, lhs, rhs, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, 0, callback);

        await delay();
        await this.complete(source, times, callback);
    }

    protected override async sortByDescent(source: SortDataModel[], lhs: number, rhs: number, option: string | number | undefined, callback: (param: SortStateModel) => void): Promise<void> {
        let times: number = await this.bubbleSortByDescent(source, lhs, rhs, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, 0, callback);

        await delay();
        await this.complete(source, times, callback);
    }

    protected async bubbleSortByAscent(source: SortDataModel[], lhs: number, rhs: number, primaryColor: string, secondaryColor: string, accentColor: string, times: number, callback: (param: SortStateModel) => void): Promise<number> {
        let k: number, completed: boolean = false, flag: boolean;

        for (let i = lhs; i <= rhs && !completed; i++) {
            completed = true;
            
            for (let j = lhs; j <= rhs - i + lhs; j++) {
                k = Math.min(j + 1, rhs);
                flag = source[k].value < source[j].value;

                [completed, times] = await this._service.swapAndRender(source, completed, flag, j, k, primaryColor, secondaryColor, accentColor, times, callback);
            }
        }

        return times;
    }

    protected async bubbleSortByDescent(source: SortDataModel[], lhs: number, rhs: number, primaryColor: string, secondaryColor: string, accentColor: string, times: number, callback: (param: SortStateModel) => void): Promise<number> {
        let k: number, completed: boolean = false, flag: boolean;

        for (let i = rhs; i >= lhs && !completed; i--) {
            completed = true;
            
            for (let j = rhs; j >= rhs - i + lhs; j--) {
                k = Math.max(j - 1, lhs);
                flag = source[k].value < source[j].value;

                [completed, times] = await this._service.swapAndRender(source, completed, flag, j, k, primaryColor, secondaryColor, accentColor, times, callback);
            }
        }

        return times;
    }

}

/**
 * 冒泡排序（单向）
 */
@Injectable()
export class BubbleSortService extends ExchangeSortService {

    protected override async sortByAscent(source: SortDataModel[], lhs: number, rhs: number, option: string| number | undefined, callback: (param: SortStateModel) => void): Promise<void> {
        let completed: boolean = false, flag: boolean, k: number, times: number = 0;

        for (let i = lhs; i <= rhs && !completed; i++) {
            completed = true;

            for (let j = lhs; j <= rhs - i; j++) {
                k = Math.min(j + 1, rhs);
                flag = source[k].value < source[j].value;

                [completed, times] = await this._service.swapAndRender(source, completed, flag, j, k, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, times, callback);
            }
        }

        await delay();
        await this.complete(source, times, callback);
    }

    protected override async sortByDescent(source: SortDataModel[], lhs: number, rhs: number, option: string| number | undefined, callback: (param: SortStateModel) => void): Promise<void> {
        let completed: boolean = false, flag: boolean, k: number, times: number = 0;

        for (let i = lhs; i <= rhs && !completed; i++) {
            completed = true;

            for (let j = rhs; j >= lhs + i; j--) {
                k = Math.max(j - 1, lhs);
                flag = source[k].value < source[j].value;

                [completed, times] = await this._service.swapAndRender(source, completed, flag, j, k, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, times, callback);
            }
        }

        await delay();
        await this.complete(source, times, callback);
    }

}

/**
 * 冒泡排序（双向）
 */
@Injectable()
export class ShakerBubbleSortService extends BubbleSortService {

    protected override async sortByAscent(source: SortDataModel[], lhs: number, rhs: number, option: string | number | undefined, callback: (param: SortStateModel) => void): Promise<void> {
        let completed: boolean, flag: boolean, pivot: number = lhs, k: number = -1, times: number = 0;

        for (let i = lhs; i <= rhs; i++) {
            completed = true;

            for (let j = pivot; j <= rhs - i; j++) {
                k = Math.min(j + 1, rhs - i);
                flag = source[k].value < source[j].value;

                [completed, times] = await this._service.swapAndRender(source, completed, flag, j, k, PRIMARY_ONE_COLOR, SECONDARY_ONE_COLOR, ACCENT_ONE_COLOR, times, callback);
            }

            if (completed) break;

            completed = true;
            pivot = k;

            for (let j = pivot; j >= lhs + i; j--) {
                k = Math.max(j - 1, lhs + i);
                flag = source[k].value > source[j].value;

                [completed, times] = await this._service.swapAndRender(source, completed, flag, j, k, PRIMARY_TWO_COLOR, SECONDARY_TWO_COLOR, ACCENT_TWO_COLOR, times, callback);
            }

            if (completed) break;

            pivot = k;
        }

        await delay();
        await this.complete(source, times, callback);
    }

    protected override async sortByDescent(source: SortDataModel[], lhs: number, rhs: number, option: string | number | undefined, callback: (param: SortStateModel) => void): Promise<void> {
        let completed: boolean, flag: boolean, pivot: number = rhs, k: number = -1, times: number = 0;

        for (let i = lhs; i <= rhs; i++) {
            completed = true;

            for (let j = pivot; j >= lhs + i; j--) {
                k = Math.max(j - 1, lhs + i);
                flag = source[k].value < source[j].value;

                [completed, times] = await this._service.swapAndRender(source, completed, flag, j, k, PRIMARY_ONE_COLOR, SECONDARY_ONE_COLOR, ACCENT_ONE_COLOR, times, callback);
            }

            if (completed) break;

            completed = true;
            pivot = k;

            for (let j = pivot; j <= rhs - i; j++) {
                k = Math.min(j + 1, rhs - i);
                flag = source[k].value > source[j].value;
                
                [completed, times] = await this._service.swapAndRender(source, completed, flag, j, k, PRIMARY_TWO_COLOR, SECONDARY_TWO_COLOR, ACCENT_TWO_COLOR, times, callback);
            }

            if (completed) break;

            pivot = k;
        }

        await delay();
        await this.complete(source, times, callback);
    }

}

/**
 * 二路冒泡排序
 */
@Injectable()
export class TwoWayBubbleSortService extends ShakerBubbleSortService {

    protected override async sortByAscent(source: SortDataModel[], lhs: number, rhs: number, option: string | number | undefined, callback: (param: SortStateModel) => void): Promise<void> {
        let m: number, n: number, fstFlag: boolean, sndFlag: boolean, completed: boolean = false, times: number = 0;

        for (let start = lhs, final = rhs; start <= final && !completed; start++, final--) {
            completed = true;

            for (let i = start, j = final; i <= final && j >= start; i++, j--) {
                m = Math.min(i + 1, final);
                n = Math.max(j - 1, start);

                fstFlag = source[m].value < source[i].value;

                [completed, times] = await this._service.swapAndRender(source, completed, fstFlag, i, m, PRIMARY_ONE_COLOR, SECONDARY_ONE_COLOR, ACCENT_ONE_COLOR, times, callback);

                sndFlag = source[n].value > source[j].value;
                
                [completed, times] = await this._service.swapAndRender(source, completed, sndFlag, j, n, PRIMARY_TWO_COLOR, SECONDARY_TWO_COLOR, ACCENT_TWO_COLOR, times, callback);
            }
        }
        
        await delay();
        await this.complete(source, times, callback);
    }

    protected override async sortByDescent(source: SortDataModel[], lhs: number, rhs: number, option: string | number | undefined, callback: (param: SortStateModel) => void): Promise<void> {
        let m: number, n: number, fstFlag: boolean, sndFlag: boolean, completed: boolean = false, times: number = 0;

        for (let start = lhs, final = rhs; start <= final && !completed; start++, final--) {
            completed = true;

            for (let i = start, j = final; i <= final && j >= start; i++, j--) {
                m = Math.min(i + 1, final);
                n = Math.max(j - 1, start);

                fstFlag = source[m].value > source[i].value;

                [completed, times] = await this._service.swapAndRender(source, completed, fstFlag, i, m, PRIMARY_ONE_COLOR, SECONDARY_ONE_COLOR, ACCENT_ONE_COLOR, times, callback);

                sndFlag = source[n].value < source[j].value;
                
                [completed, times] = await this._service.swapAndRender(source, completed, sndFlag, j, n, PRIMARY_TWO_COLOR, SECONDARY_TWO_COLOR, ACCENT_TWO_COLOR, times, callback);
            }
        }

        await delay();
        await this.complete(source, times, callback);
    }

}

/**
 * 归并冒泡排序
 */
@Injectable()
export class MergeBubbleSortService extends BubbleSortService {

    protected override async sortByAscent(source: SortDataModel[], lhs: number, rhs: number, option: string | number | undefined, callback: (param: SortStateModel) => void): Promise<void> {
        let times: number = await this.sortByOrder(source, lhs, rhs, option, 'ascent', 0, callback);

        await delay();
        await this.complete(source, times, callback);
    }

    protected override async sortByDescent(source: SortDataModel[], lhs: number, rhs: number, option: string | number | undefined, callback: (param: SortStateModel) => void): Promise<void> {
        let times: number = await this.sortByOrder(source, lhs, rhs, option, 'descent', 0, callback);

        await delay();
        await this.complete(source, times, callback);
    }
    
    protected async sortByOrder(source: SortDataModel[], lhs: number, rhs: number, option: string | number | undefined, order: SortOrder, times: number, callback: (param: SortStateModel) => void): Promise<number> {
        if (lhs < rhs) {
            const mid: number = floor((rhs - lhs) * 0.5 + lhs, 0);

            if (order === 'ascent') {
                times = await this.sortByOrder(source, lhs, mid, option, order, times, callback);
                times = await this.sortByOrder(source, mid + 1, rhs, option, order, times, callback);
                times = await this.merge(source, lhs, mid, rhs, order, times, callback);
            }

            if (order === 'descent') {
                times = await this.sortByOrder(source, mid + 1, rhs, option, order, times, callback);
                times = await this.sortByOrder(source, lhs, mid, option, order, times, callback);
                times = await this.merge(source, lhs, mid, rhs, order, times, callback);
            }
        }
        
        return times;
    }

    private async merge(source: SortDataModel[], lhs: number, mid: number, rhs: number, order: SortOrder, times: number, callback: (param: SortStateModel) => void): Promise<number> {
        if (order === 'ascent') {
            times = await this.bubbleSortByAscent(source, lhs, mid, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, times, callback);
            times = await this.bubbleSortByAscent(source, mid + 1, rhs, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, times, callback);
            times = await this.bubbleSortByAscent(source, lhs, rhs, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, times, callback);
        }
        
        if (order === 'descent') {
            times = await this.bubbleSortByDescent(source, mid + 1, rhs, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, times, callback);
            times = await this.bubbleSortByDescent(source, lhs, mid, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, times, callback);
            times = await this.bubbleSortByDescent(source, lhs, rhs, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, times, callback);
        }

        return times;
    }

}

/**
 * 希尔冒泡排序
 */
@Injectable()
export class ShellBubbleSortService extends BubbleSortService {

    protected override async sortByAscent(source: SortDataModel[], lhs: number, rhs: number, option: string | number | undefined, callback: (param: SortStateModel) => void): Promise<void> {
        let k: number, times: number = 0, completed: boolean, flag: boolean;

        for (let gap = (rhs - lhs + 1) >> 1; gap > 0; gap = gap === 3 ? gap - 1 : gap >> 1) {
            for (let i = lhs + gap; i <= rhs; i++) {
                completed = gap === 1;

                for (let j = i - gap; j <= rhs - i + gap; j += gap) {
                    k = Math.min(j + gap, rhs);
                    flag = source[k].value < source[j].value;

                    [completed, times] = await this._service.swapAndRender(source, completed, flag, j, k, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, times, callback);
                }

                if (completed) break;
            }
        }

        await delay();
        await this.complete(source, times, callback);
    }

    protected override async sortByDescent(source: SortDataModel[], lhs: number, rhs: number, option: string | number | undefined, callback: (param: SortStateModel) => void): Promise<void> {
        let k: number, times: number = 0, completed: boolean, flag: boolean;

        for (let gap = (rhs - lhs + 1) >> 1; gap > 0; gap = gap === 3 ? gap - 1 : gap >> 1) {
            for (let i = rhs - gap; i >= lhs; i--) {
                completed = gap === 1;

                for (let j = i + gap; j >= rhs - i - gap; j -= gap) {
                    k = Math.max(j - gap, lhs);
                    flag = source[k].value < source[j].value;

                    [completed, times] = await this._service.swapAndRender(source, completed, flag, j, k, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, times, callback);
                }

                if (completed) break;
            }
        }

        await delay();
        await this.complete(source, times, callback);
    }

}

/**
 * 梳排序
 */
@Injectable()
export class CombSortService extends BubbleSortService {

    protected override async sortByAscent(source: SortDataModel[], lhs: number, rhs: number, option: string | number | undefined, callback: (param: SortStateModel) => void): Promise<void> {
        let completed: boolean = false, flag: boolean, k: number, times: number = 0;

        for (let gap = rhs - lhs + 1; gap > lhs + 1 || !completed; gap = Math.floor(gap * 0.8)) {
            completed = true;

            for (let j = lhs; j <= rhs - gap; j++) {
                k = Math.min(j + gap, rhs);
                flag = source[k].value < source[j].value;

                [completed, times] = await this._service.swapAndRender(source, completed, flag, j, k, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, times, callback);
            }
        }

        await delay();
        await this.complete(source, times, callback);
    }

    protected override async sortByDescent(source: SortDataModel[], lhs: number, rhs: number, option: string | number | undefined, callback: (param: SortStateModel) => void): Promise<void> {
        let completed: boolean = false, flag: boolean, k: number, times: number = 0;

        for (let gap = rhs - lhs + 1; gap > 1 || !completed; gap = Math.floor(gap * 0.8)) {
            completed = true;

            for (let j = rhs; j >= lhs + gap; j--) {
                k = Math.max(j - gap, lhs);
                flag = source[k].value < source[j].value;

                [completed, times] = await this._service.swapAndRender(source, completed, flag, j, k, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, times, callback);
            }
        }

        await delay();
        await this.complete(source, times, callback);
    }

}

/**
 * 奇偶排序
 */
@Injectable()
export class OddEvenSortService extends BubbleSortService {

    protected override async sortByAscent(source: SortDataModel[], lhs: number, rhs: number, option: string | number | undefined, callback: (param: SortStateModel) => void): Promise<void> {
        let completed: boolean = false, flag: boolean, k: number, times: number = 0;

        for (let i = 0; !completed; i = (i + 1) % 2) {
            completed = true;

            for (let j = lhs + i % 2; j <= rhs; j += 2) {
                k = Math.min(j + 1, rhs);
                flag = source[k].value < source[j].value;
                
                [completed, times] = await this._service.swapAndRender(source, completed, flag, j, k, PRIMARY_ONE_COLOR, SECONDARY_ONE_COLOR, ACCENT_ONE_COLOR, times, callback);
            }
        }
        
        await delay();
        await this.complete(source, times, callback);
    }

    protected override async sortByDescent(source: SortDataModel[], lhs: number, rhs: number, option: string | number | undefined, callback: (param: SortStateModel) => void): Promise<void> {
        let completed: boolean = false, flag: boolean, k: number, times: number = 0;

        for (let i = 0; !completed; i = (i + 1) % 2) {
            completed = true;
            
            for (let j = rhs - i % 2; j >= lhs; j -= 2) {
                k = Math.max(j - 1, lhs);
                flag = source[k].value < source[j].value;
                
                [completed, times] = await this._service.swapAndRender(source, completed, flag, j, k, PRIMARY_ONE_COLOR, SECONDARY_ONE_COLOR, ACCENT_ONE_COLOR, times, callback);
            }
        }

        await delay();
        await this.complete(source, times, callback);
    }

}

