import { Injectable } from "@angular/core";
import { floor } from "lodash";

import { delay } from "../../../public/global.utils";
import { PRIMARY_COLOR, SECONDARY_COLOR, PRIMARY_ONE_COLOR, SECONDARY_ONE_COLOR, PRIMARY_TWO_COLOR, SECONDARY_TWO_COLOR, ACCENT_COLOR, ACCENT_ONE_COLOR, ACCENT_TWO_COLOR } from "../../../public/global.utils";

import { SortDataModel, SortOrder, SortStateModel } from "../ngrx-store/sort.state";

import { AbstractComparisonSortService } from "./base-sort.service";

/**
 * 交換排序
 */
@Injectable()
export class ExchangeSortService extends AbstractComparisonSortService {

    protected override async sortByAscent(source: SortDataModel[], lhs: number, rhs: number, option: string | number | undefined, callback: (param: SortStateModel) => void): Promise<void> {
        let k: number, stop: boolean = false, flag: boolean, times: number = 0;

        for (let i = lhs; i <= rhs && !stop; i++) {
            stop = true;

            for (let j = lhs; j <= rhs; j++) {
                k = Math.min(j + 1, rhs);
                flag = source[k].value < source[j].value;
                stop &&= !flag;
                
                times = await this.exchange(source, flag, j, k, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, times, callback);
            }
        }

        await delay();
        await this.complete(source, times, callback);
    }

    protected override async sortByDescent(source: SortDataModel[], lhs: number, rhs: number, option: string | number | undefined, callback: (param: SortStateModel) => void): Promise<void> {
        let k: number, stop: boolean = false, flag: boolean, times: number = 0;

        for (let i = rhs; i >= lhs && !stop; i--) {
            stop = true;

            for (let j = rhs; j >= lhs; j--) {
                k = Math.max(j - 1, lhs);
                flag = source[k].value < source[j].value;
                stop &&= !flag;

                times = await this.exchange(source, flag, j, k, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, times, callback);
            }
        }

        await delay();
        await this.complete(source, times, callback);
    }

}

/**
 * 冒泡排序（单向）
 */
@Injectable()
export class BubbleSortService extends ExchangeSortService {

    protected override async sortByAscent(source: SortDataModel[], lhs: number, rhs: number, option: string| number | undefined, callback: (param: SortStateModel) => void): Promise<void> {
        let times: number = await this.sortByOrder(source, lhs, rhs, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, 'ascent', 0, callback);

        await delay();
        await this.complete(source, times, callback);
    }

    protected override async sortByDescent(source: SortDataModel[], lhs: number, rhs: number, option: string| number | undefined, callback: (param: SortStateModel) => void): Promise<void> {
        let times: number = await this.sortByOrder(source, lhs, rhs, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, 'descent', 0, callback);

        await delay();
        await this.complete(source, times, callback);
    }

    protected async sortByOrder(source: SortDataModel[], lhs: number, rhs: number, primaryColor: string, secondaryColor: string, accentColor: string, order: SortOrder, times: number, callback: (param: SortStateModel) => void): Promise<number> {
        let stop: boolean = false;

        if (order === 'ascent') {
            for (let i = lhs; i <= rhs && !stop; i++) {
                [times, stop] = await this.swapByAscent(source, lhs, rhs - i + lhs, true, primaryColor, secondaryColor, accentColor, times, callback);
            }
        }

        if (order === 'descent') {
            for (let i = rhs; i >= lhs && !stop; i--) {
                [times, stop] = await this.swapByDescent(source, rhs - i + lhs, rhs, true, primaryColor, secondaryColor, accentColor, times, callback);
            }
        }

        return times;
    }

    protected async swapByAscent(source: SortDataModel[], lhs: number, rhs: number, flags: boolean, primaryColor: string, secondaryColor: string, accentColor: string, times: number, callback: (param: SortStateModel) => void): Promise<[number, boolean]> {
        let j: number, stop: boolean = true, flag: boolean;

        if (flags) {
            for (let i = lhs; i <= rhs; i++) {
                j = Math.min(i + 1, rhs);
                flag = source[j].value < source[i].value;
                stop &&= !flag;

                times = await this.exchange(source, flag, i, j, primaryColor, secondaryColor, accentColor, times, callback);
            }
        } else {
            for (let i = rhs; i >= lhs; i--) {
                j = Math.max(i - 1, lhs);
                flag = source[j].value > source[i].value;
                stop &&= !flag;

                times = await this.exchange(source, flag, i, j, primaryColor, secondaryColor, accentColor, times, callback);
            }
        }

        return [times, stop];
    }

    protected async swapByDescent(source: SortDataModel[], lhs: number, rhs: number, flags: boolean, primaryColor: string, secondaryColor: string, accentColor: string, times: number, callback: (param: SortStateModel) => void): Promise<[number, boolean]> {
        let j: number, stop: boolean = true, flag: boolean;

        if (flags) {
            for (let i = rhs; i >= lhs; i--) {
                j = Math.max(i - 1, lhs);
                flag = source[j].value < source[i].value;
                stop &&= !flag;

                times = await this.exchange(source, flag, i, j, primaryColor, secondaryColor, accentColor, times, callback);
            }
        } else {
            for (let i = lhs; i <= rhs; i++) {
                j = Math.min(i + 1, rhs);
                flag = source[j].value > source[i].value;
                stop &&= !flag;

                times = await this.exchange(source, flag, i, j, primaryColor, secondaryColor, accentColor, times, callback);
            }
        }
        
        return [times, stop];
    }

}

/**
 * 冒泡排序（双向）
 */
@Injectable()
export class ShakerBubbleSortService extends BubbleSortService {

    protected override async sortByAscent(source: SortDataModel[], lhs: number, rhs: number, option: string | number | undefined, callback: (param: SortStateModel) => void): Promise<void> {
        let stop: boolean, times: number = 0;

        for (let i = lhs; i <= rhs; i++) {
            [times, stop] = await this.swapByAscent(source, i, rhs - i, true, PRIMARY_ONE_COLOR, SECONDARY_ONE_COLOR, ACCENT_ONE_COLOR, times, callback);

            if (stop) break;

            [times, stop] = await this.swapByAscent(source, i, rhs - i, false, PRIMARY_TWO_COLOR, SECONDARY_TWO_COLOR, ACCENT_TWO_COLOR, times, callback);

            if (stop) break;
        }

        await delay();
        await this.complete(source, times, callback);
    }

    protected override async sortByDescent(source: SortDataModel[], lhs: number, rhs: number, option: string | number | undefined, callback: (param: SortStateModel) => void): Promise<void> {
        let stop: boolean, times: number = 0;

        for (let i = rhs; i >= lhs; i--) {
            [times, stop] = await this.swapByDescent(source, rhs - i, i, true, PRIMARY_ONE_COLOR, SECONDARY_ONE_COLOR, ACCENT_ONE_COLOR, times, callback);

            if (stop) break;

            [times, stop] = await this.swapByDescent(source, rhs - i, i, false, PRIMARY_TWO_COLOR, SECONDARY_TWO_COLOR, ACCENT_ONE_COLOR, times, callback);

            if (stop) break;
        }

        await delay();
        await this.complete(source, times, callback);
    }

}

/**
 * 二路冒泡排序
 */
@Injectable()
export class DualBubbleSortService extends ShakerBubbleSortService {

    protected override async sortByAscent(source: SortDataModel[], lhs: number, rhs: number, option: string | number | undefined, callback: (param: SortStateModel) => void): Promise<void> {
        let m: number, n: number, fstFlag: boolean, sndFlag: boolean, stop: boolean = false, times: number = 0;

        for (let start = lhs, final = rhs; start <= final && !stop; start++, final--) {
            stop = true;

            for (let i = start, j = final; i <= final && j >= start; i++, j--) {
                m = Math.min(i + 1, final);
                n = Math.max(j - 1, start);

                fstFlag = source[m].value < source[i].value;
                stop &&= !fstFlag;

                times = await this.exchange(source, fstFlag, i, m, PRIMARY_ONE_COLOR, SECONDARY_ONE_COLOR, ACCENT_ONE_COLOR, times, callback);

                sndFlag = source[n].value > source[j].value;
                stop &&= !sndFlag;
                
                times = await this.exchange(source, sndFlag, j, n, PRIMARY_TWO_COLOR, SECONDARY_TWO_COLOR, ACCENT_TWO_COLOR, times, callback);
            }
        }
        
        await delay();
        await this.complete(source, times, callback);
    }

    protected override async sortByDescent(source: SortDataModel[], lhs: number, rhs: number, option: string | number | undefined, callback: (param: SortStateModel) => void): Promise<void> {
        let m: number, n: number, fstFlag: boolean, sndFlag: boolean, stop: boolean = false, times: number = 0;

        for (let start = lhs, final = rhs; start <= final && !stop; start++, final--) {
            stop = true;

            for (let i = start, j = final; i <= final && j >= start; i++, j--) {
                m = Math.min(i + 1, final);
                n = Math.max(j - 1, start);

                fstFlag = source[m].value > source[i].value;
                stop &&= !fstFlag;

                times = await this.exchange(source, fstFlag, i, m, PRIMARY_ONE_COLOR, SECONDARY_ONE_COLOR, ACCENT_ONE_COLOR, times, callback);

                sndFlag = source[n].value < source[j].value;
                stop &&= !sndFlag;
                
                times = await this.exchange(source, sndFlag, j, n, PRIMARY_TWO_COLOR, SECONDARY_TWO_COLOR, ACCENT_TWO_COLOR, times, callback);
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
        let times: number = await this.sortByOrder(source, lhs, rhs, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, 'ascent', 0, callback);

        await delay();
        await this.complete(source, times, callback);
    }

    protected override async sortByDescent(source: SortDataModel[], lhs: number, rhs: number, option: string | number | undefined, callback: (param: SortStateModel) => void): Promise<void> {
        let times: number = await this.sortByOrder(source, lhs, rhs, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, 'descent', 0, callback);

        await delay();
        await this.complete(source, times, callback);
    }
    
    protected override async sortByOrder(source: SortDataModel[], lhs: number, rhs: number, primaryColor: string, secondaryColor: string, accentColor: string, order: SortOrder, times: number, callback: (param: SortStateModel) => void): Promise<number> {
        if (lhs < rhs) {
            const mid: number = floor((rhs - lhs) * 0.5 + lhs, 0);

            if (order === 'ascent') {
                times = await this.sortByOrder(source, lhs, mid, primaryColor, secondaryColor, accentColor, order, times, callback);
                times = await this.sortByOrder(source, mid + 1, rhs, primaryColor, secondaryColor, accentColor, order, times, callback);
                times = await this.mergeByOrder(source, lhs, mid, rhs, primaryColor, secondaryColor, accentColor, order, times, callback);
            }

            if (order === 'descent') {
                times = await this.sortByOrder(source, mid + 1, rhs, primaryColor, secondaryColor, accentColor, order, times, callback);
                times = await this.sortByOrder(source, lhs, mid, primaryColor, secondaryColor, accentColor, order, times, callback);
                times = await this.mergeByOrder(source, lhs, mid, rhs, primaryColor, secondaryColor, accentColor, order, times, callback);
            }
        }
        
        return times;
    }

    private async mergeByOrder(source: SortDataModel[], lhs: number, mid: number, rhs: number, primaryColor: string, secondaryColor: string, accentColor: string, order: SortOrder, times: number, callback: (param: SortStateModel) => void): Promise<number> {
        let idx: number, stop: boolean;

        if (order === 'ascent') {
            mid = Math.max(mid - 1, lhs);

            while (mid >= lhs) {
                idx = this._service.indexOfFGTByAscent(source, source[mid].value, mid + 1, rhs);
                idx = idx === -1 ? rhs : idx;        
    
                [times, stop] = await this.swapByAscent(source, mid, idx, true, primaryColor, secondaryColor, accentColor, times, callback);
    
                mid -= 1;
            }
        }
        
        if (order === 'descent') {
            mid = Math.min(mid + 1, rhs);

            while (mid <= rhs) {
                idx = this._service.indexOfFGTByDescent(source, source[mid].value, lhs, mid - 1);
                idx = idx === -1 ? lhs : idx;        
    
                [times, stop] = await this.swapByDescent(source, idx, mid, true, primaryColor, secondaryColor, accentColor, times, callback);

                mid += 1;
            }
        }

        return times;
    }

}

/**
 * 梳排序
 */
@Injectable()
export class CombSortService extends BubbleSortService {

    private readonly SCALE: number = 1 / 1.3;

    protected override async sortByAscent(source: SortDataModel[], lhs: number, rhs: number, option: string | number | undefined, callback: (param: SortStateModel) => void): Promise<void> {
        let k: number, stop: boolean = false, flag: boolean, times: number = 0;

        for (let gap = rhs - lhs + 1; gap > 0 || !stop; gap = floor(gap * this.SCALE, 0)) {
            stop = true;

            for (let j = lhs; j <= rhs - gap; j++) {
                k = Math.min(j + gap, rhs);
                flag = source[k].value < source[j].value;
                stop &&= !flag;

                times = await this.exchange(source, flag, j, k, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, times, callback);
            }
        }

        times = await this.sortByOrder(source, lhs, rhs, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, 'ascent', times, callback);

        await delay();
        await this.complete(source, times, callback);
    }

    protected override async sortByDescent(source: SortDataModel[], lhs: number, rhs: number, option: string | number | undefined, callback: (param: SortStateModel) => void): Promise<void> {
        let k: number, stop: boolean = false, flag: boolean, times: number = 0;

        for (let gap = rhs - lhs + 1; gap > 0 || !stop; gap = floor(gap * this.SCALE, 0)) {
            stop = true;

            for (let j = rhs; j >= lhs + gap; j--) {
                k = Math.max(j - gap, lhs);
                flag = source[k].value < source[j].value;
                stop &&= !flag;

                times = await this.exchange(source, flag, j, k, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, times, callback);
            }
        }

        times = await this.sortByOrder(source, lhs, rhs, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, 'descent', times, callback);

        await delay();
        await this.complete(source, times, callback);
    }

}

/**
 * 希尔冒泡排序
 */
@Injectable()
export class ShellBubbleSortService extends CombSortService {

    protected override async sortByAscent(source: SortDataModel[], lhs: number, rhs: number, option: string | number | undefined, callback: (param: SortStateModel) => void): Promise<void> {
        let times: number = await this.sortByOrder(source, lhs, rhs, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, 'ascent', 0, callback);

        await delay();
        await this.complete(source, times, callback);
    }

    protected override async sortByDescent(source: SortDataModel[], lhs: number, rhs: number, option: string | number | undefined, callback: (param: SortStateModel) => void): Promise<void> {
        let times: number = await this.sortByOrder(source, lhs, rhs, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, 'descent', 0, callback);

        await delay();
        await this.complete(source, times, callback);
    }

    protected override async sortByOrder(source: SortDataModel[], lhs: number, rhs: number, primaryColor: string, secondaryColor: string, accentColor: string, order: SortOrder, times: number, callback: (param: SortStateModel) => void): Promise<number> {
        let k: number, stop: boolean, flag: boolean;

        for (let gap = (rhs - lhs + 1) >> 1; gap > 0; gap = gap === 3 ? gap - 1 : gap >> 1) {
            stop = false;

            if (order === 'ascent') {
                for (let i = lhs + gap; i <= rhs && !stop; i++) {
                    stop = gap === 1;
 
                    for (let j = i - gap; j <= rhs - i + gap; j += gap) {
                        k = Math.min(j + gap, rhs);
                        flag = source[k].value < source[j].value;
                        stop &&= !flag;
    
                        times = await this.exchange(source, flag, j, k, primaryColor, secondaryColor, accentColor, times, callback);
                    }
                }
            }
            
            if (order === 'descent') {
                for (let i = rhs - gap; i >= lhs && !stop; i--) {
                    stop = gap === 1;
    
                    for (let j = i + gap; j >= rhs - i - gap; j -= gap) {
                        k = Math.max(j - gap, lhs);
                        flag = source[k].value < source[j].value;
                        stop &&= !flag;
    
                        times = await this.exchange(source, flag, j, k, primaryColor, secondaryColor, accentColor, times, callback);
                    }
                }
            }
        }
        
        return times;
    }

}

/**
 * 奇偶排序（单向）
 */
@Injectable()
export class OddEvenSortService extends BubbleSortService {

    protected override async sortByAscent(source: SortDataModel[], lhs: number, rhs: number, option: string | number | undefined, callback: (param: SortStateModel) => void): Promise<void> {
        let stop: boolean = false, times: number = 0;

        for (let i = 0; !stop; i = (i + 1) % 2) {
            [times, stop] = await this.swapByAscent(source, lhs + i, rhs, true, i % 2 === 0 ? PRIMARY_ONE_COLOR : PRIMARY_TWO_COLOR, i % 2 === 0 ? SECONDARY_ONE_COLOR : SECONDARY_TWO_COLOR, i % 2 === 0 ? ACCENT_ONE_COLOR : ACCENT_TWO_COLOR, times, callback);
        }
        
        await delay();
        await this.complete(source, times, callback);
    }

    protected override async sortByDescent(source: SortDataModel[], lhs: number, rhs: number, option: string | number | undefined, callback: (param: SortStateModel) => void): Promise<void> {
        let stop: boolean = false, times: number = 0;

        for (let i = 0; !stop; i = (i + 1) % 2) {
            [times, stop] = await this.swapByDescent(source, lhs, rhs - i, true, i % 2 === 0 ? PRIMARY_ONE_COLOR : PRIMARY_TWO_COLOR, i % 2 === 0 ? SECONDARY_ONE_COLOR : SECONDARY_TWO_COLOR, i % 2 === 0 ? ACCENT_ONE_COLOR : ACCENT_TWO_COLOR, times, callback);
        }

        await delay();
        await this.complete(source, times, callback);
    }

    protected override async swapByAscent(source: SortDataModel[], lhs: number, rhs: number, flags: boolean, primaryColor: string, secondaryColor: string, accentColor: string, times: number, callback: (param: SortStateModel) => void): Promise<[number, boolean]> {
        let j: number, stop: boolean = true, flag: boolean;

        if (flags) {
            for (let i = lhs; i <= rhs; i += 2) {
                j = Math.min(i + 1, rhs);
                flag = source[j].value < source[i].value;
                stop &&= !flag;

                times = await this.exchange(source, flag, i, j, primaryColor, secondaryColor, accentColor, times, callback);
            }
        } else {
            for (let i = rhs; i >= lhs; i -= 2) {
                j = Math.max(i - 1, lhs);
                flag = source[j].value > source[i].value;
                stop &&= !flag;
                
                times = await this.exchange(source, flag, i, j, primaryColor, secondaryColor, accentColor, times, callback);
            }
        }

        return [times, stop];
    }

    protected override async swapByDescent(source: SortDataModel[], lhs: number, rhs: number, flags: boolean, primaryColor: string, secondaryColor: string, accentColor: string, times: number, callback: (param: SortStateModel) => void): Promise<[number, boolean]> {
        let j: number, stop: boolean = true, flag: boolean;

        if (flags) {
            for (let i = rhs; i >= lhs; i -= 2) {
                j = Math.max(i - 1, lhs);
                flag = source[j].value < source[i].value;
                stop &&= !flag;
                
                times = await this.exchange(source, flag, i, j, primaryColor, secondaryColor, accentColor, times, callback);
            }
        } else {
            for (let i = lhs; i <= rhs; i += 2) {
                j = Math.min(i + 1, rhs);
                flag = source[j].value > source[i].value;
                stop &&= !flag;

                times = await this.exchange(source, flag, i, j, primaryColor, secondaryColor, accentColor, times, callback);
            }
        }

        return [times, stop];
    }

}

/**
 * 奇偶排序（双向）
 */
@Injectable()
export class ShakerOddEvenSortService extends OddEvenSortService {

    protected override async sortByAscent(source: SortDataModel[], lhs: number, rhs: number, option: string | number | undefined, callback: (param: SortStateModel) => void): Promise<void> {
        let i: number = 0, k: number, stop: boolean, times: number = 0;
        
        while (true) {
            [times, stop] = await this.swapByAscent(source, lhs + i, rhs, i === 0, PRIMARY_ONE_COLOR, SECONDARY_ONE_COLOR, ACCENT_ONE_COLOR, times, callback);

            if (stop) break;

            i = (i + 1) % 2;

            [times, stop] = await this.swapByAscent(source, lhs, rhs - i, i === 0, PRIMARY_TWO_COLOR, SECONDARY_TWO_COLOR, ACCENT_TWO_COLOR, times, callback);

            if (stop) break;

            i = (i + 1) % 2;
        }
        
        await delay();
        await this.complete(source, times, callback);
    }

    protected override async sortByDescent(source: SortDataModel[], lhs: number, rhs: number, option: string | number | undefined, callback: (param: SortStateModel) => void): Promise<void> {
        let i: number = 0, k: number, stop: boolean, times: number = 0;

        while (true) {
            [times, stop] = await this.swapByDescent(source, lhs, rhs - i, i === 0, PRIMARY_ONE_COLOR, SECONDARY_ONE_COLOR, ACCENT_ONE_COLOR, times, callback);

            if (stop) break;

            i = (i + 1) % 2;

            [times, stop] = await this.swapByDescent(source, lhs + i, rhs, i === 0, PRIMARY_TWO_COLOR, SECONDARY_TWO_COLOR, ACCENT_TWO_COLOR, times, callback);

            if (stop) break;

            i = (i + 1) % 2;
        }

        await delay();
        await this.complete(source, times, callback);
    }

}

