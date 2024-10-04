import { floor } from "lodash";

import { delay } from "../../../public/global.utils";
import { PRIMARY_COLOR, SECONDARY_COLOR, PRIMARY_ONE_COLOR, SECONDARY_ONE_COLOR, PRIMARY_TWO_COLOR, SECONDARY_TWO_COLOR, ACCENT_COLOR, ACCENT_ONE_COLOR, ACCENT_TWO_COLOR } from "../../../public/global.utils";

import { SortDataModel, SortOption, SortOrder, SortStateModel } from "../ngrx-store/sort.state";

import { AbstractComparisonSortAlgorithm } from "../pattern/sort-temp.pattern";

/**
 * 交換排序
 */
export class ExchangeSortAlgorithm extends AbstractComparisonSortAlgorithm {

    protected override async sortByAscent(source: SortDataModel[], lhs: number, rhs: number, option: SortOption, callback: (param: SortStateModel) => void): Promise<void> {
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

    protected override async sortByDescent(source: SortDataModel[], lhs: number, rhs: number, option: SortOption, callback: (param: SortStateModel) => void): Promise<void> {
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
export class BubbleSortAlgorithm extends ExchangeSortAlgorithm {

    protected override async sortByAscent(source: SortDataModel[], lhs: number, rhs: number, option: SortOption, callback: (param: SortStateModel) => void): Promise<void> {
        let times: number = await this.sortByOrder(source, lhs, rhs, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, 'ascent', 0, callback);

        await delay();
        await this.complete(source, times, callback);
    }

    protected override async sortByDescent(source: SortDataModel[], lhs: number, rhs: number, option: SortOption, callback: (param: SortStateModel) => void): Promise<void> {
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
export class ShakerBubbleSortAlgorithm extends BubbleSortAlgorithm {

    protected override async sortByAscent(source: SortDataModel[], lhs: number, rhs: number, option: SortOption, callback: (param: SortStateModel) => void): Promise<void> {
        let times: number = await this.sortByOrder(source, lhs, rhs, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, 'ascent', 0, callback);

        await delay();
        await this.complete(source, times, callback);
    }

    protected override async sortByDescent(source: SortDataModel[], lhs: number, rhs: number, option: SortOption, callback: (param: SortStateModel) => void): Promise<void> {
        let times: number = await this.sortByOrder(source, lhs, rhs, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, 'descent', 0, callback);

        await delay();
        await this.complete(source, times, callback);
    }

    public override async sortByOrder(source: SortDataModel[], lhs: number, rhs: number, primaryColor: string, secondaryColor: string, accentColor: string, order: SortOrder, times: number, callback: (param: SortStateModel) => void): Promise<number> {
        let stop: boolean = false;

        while (lhs < rhs) {
            if (order === 'ascent') {
                [times, stop] = await this.swapByAscent(source, lhs, rhs, true, primaryColor, secondaryColor, accentColor, times, callback);

                rhs -= 1;
            }

            if (order === 'descent') {
                [times, stop] = await this.swapByDescent(source, lhs, rhs, true, primaryColor, secondaryColor, accentColor, times, callback);
    
                lhs += 1;
            }
            
            if (stop) break;

            if (order === 'ascent') {
                [times, stop] = await this.swapByAscent(source, lhs, rhs, false, primaryColor, secondaryColor, accentColor, times, callback);

                lhs += 1;
            }

            if (order === 'descent') {
                [times, stop] = await this.swapByDescent(source, lhs, rhs, false, primaryColor, secondaryColor, accentColor, times, callback);
    
                rhs -= 1;
            }

            if (stop) break;
        }

        return times;
    }

}

/**
 * 二路冒泡排序
 */
export class DualBubbleSortAlgorithm extends ShakerBubbleSortAlgorithm {

    protected override async sortByAscent(source: SortDataModel[], lhs: number, rhs: number, option: SortOption, callback: (param: SortStateModel) => void): Promise<void> {
        let m: number, n: number, fstFlag: boolean, sndFlag: boolean, stop: boolean = false, times: number = 0;

        while (lhs < rhs) {
            stop = true;

            for (let i = lhs, j = rhs; i <= rhs && j >= lhs; i++, j--) {
                source[lhs].color = ACCENT_ONE_COLOR;
                source[rhs].color = ACCENT_TWO_COLOR;
                callback({ times, datalist: source });

                m = Math.min(i + 1, rhs);
                n = Math.max(j - 1, lhs);

                fstFlag = source[m].value < source[i].value;
                stop &&= !fstFlag;

                times = await this.exchange(source, fstFlag, i, m, PRIMARY_ONE_COLOR, SECONDARY_ONE_COLOR, ACCENT_ONE_COLOR, times, callback);

                sndFlag = source[n].value > source[j].value;
                stop &&= !sndFlag;
                
                times = await this.exchange(source, sndFlag, j, n, PRIMARY_TWO_COLOR, SECONDARY_TWO_COLOR, ACCENT_TWO_COLOR, times, callback);
            }

            times = await this.dualSweep(source, lhs, rhs, ACCENT_ONE_COLOR, ACCENT_TWO_COLOR, times, callback);

            if (stop) break;

            lhs += 1;
            rhs -= 1;
        }
        
        await delay();
        await this.complete(source, times, callback);
    }

    protected override async sortByDescent(source: SortDataModel[], lhs: number, rhs: number, option: SortOption, callback: (param: SortStateModel) => void): Promise<void> {
        let m: number, n: number, fstFlag: boolean, sndFlag: boolean, stop: boolean = false, times: number = 0;

        while (lhs < rhs) {
            stop = true;

            for (let i = rhs, j = lhs; i >= lhs && j <= rhs; i--, j++) {
                source[lhs].color = ACCENT_TWO_COLOR;
                source[rhs].color = ACCENT_ONE_COLOR;
                callback({ times, datalist: source });

                m = Math.max(i - 1, lhs);
                n = Math.min(j + 1, rhs);

                fstFlag = source[m].value < source[i].value;
                stop &&= !fstFlag;

                times = await this.exchange(source, fstFlag, i, m, PRIMARY_ONE_COLOR, SECONDARY_ONE_COLOR, ACCENT_ONE_COLOR, times, callback);

                sndFlag = source[n].value > source[j].value;
                stop &&= !sndFlag;
                
                times = await this.exchange(source, sndFlag, j, n, PRIMARY_TWO_COLOR, SECONDARY_TWO_COLOR, ACCENT_TWO_COLOR, times, callback);
            }
            
            times = await this.dualSweep(source, lhs, rhs, ACCENT_TWO_COLOR, ACCENT_ONE_COLOR, times, callback);

            if (stop) break;

            lhs += 1;
            rhs -= 1;
        }

        await delay();
        await this.complete(source, times, callback);
    }

}

/**
 * 梳排序
 */
export class CombSortAlgorithm extends BubbleSortAlgorithm {

    public readonly SCALE: number = 1 / 1.3;

    protected override async sortByAscent(source: SortDataModel[], lhs: number, rhs: number, option: SortOption, callback: (param: SortStateModel) => void): Promise<void> {
        let times: number = 0;

        for (let gap = rhs - lhs + 1; gap > 0; gap = floor(gap * this.SCALE, 0)) {
            times = await this.moveByOrder(source, lhs, rhs, gap, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, 'ascent', times, callback);
        }

        times = await this.sortByOrder(source, lhs, rhs, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, 'ascent', times, callback);

        await delay();
        await this.complete(source, times, callback);
    }

    protected override async sortByDescent(source: SortDataModel[], lhs: number, rhs: number, option: SortOption, callback: (param: SortStateModel) => void): Promise<void> {
        let times: number = 0;

        for (let gap = rhs - lhs + 1; gap > 0; gap = floor(gap * this.SCALE, 0)) {
            times = await this.moveByOrder(source, lhs, rhs, gap, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, 'descent', times, callback);
        }

        times = await this.sortByOrder(source, lhs, rhs, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, 'descent', times, callback);

        await delay();
        await this.complete(source, times, callback);
    }

    public async moveByOrder(source: SortDataModel[], lhs: number, rhs: number, gap: number, primaryColor: string, secondaryColor: string, accentColor: string, order: SortOrder, times: number, callback: (param: SortStateModel) => void): Promise<number> {
        let k: number;

        if (order === 'ascent') {
            for (let j = lhs; j <= rhs - gap; j++) {
                k = Math.min(j + gap, rhs);
                
                times = await this.exchange(source, source[k].value < source[j].value, j, k, primaryColor, secondaryColor, accentColor, times, callback);
            }
        }
        
        if (order === 'descent') {
            for (let j = rhs; j >= lhs + gap; j--) {
                k = Math.max(j - gap, lhs);
                
                times = await this.exchange(source, source[k].value < source[j].value, j, k, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, times, callback);
            }
        }

        return times;
    }

}

/**
 * 希尔冒泡排序
 */
export class ShellBubbleSortAlgorithm extends CombSortAlgorithm {

    protected override async sortByAscent(source: SortDataModel[], lhs: number, rhs: number, option: SortOption, callback: (param: SortStateModel) => void): Promise<void> {
        let times: number = await this.sortByOrder(source, lhs, rhs, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, 'ascent', 0, callback);

        await delay();
        await this.complete(source, times, callback);
    }

    protected override async sortByDescent(source: SortDataModel[], lhs: number, rhs: number, option: SortOption, callback: (param: SortStateModel) => void): Promise<void> {
        let times: number = await this.sortByOrder(source, lhs, rhs, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, 'descent', 0, callback);

        await delay();
        await this.complete(source, times, callback);
    }

    public override async sortByOrder(source: SortDataModel[], lhs: number, rhs: number, primaryColor: string, secondaryColor: string, accentColor: string, order: SortOrder, times: number, callback: (param: SortStateModel) => void): Promise<number> {
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
export class OddEvenSortAlgorithm extends BubbleSortAlgorithm {

    protected override async sortByAscent(source: SortDataModel[], lhs: number, rhs: number, option: SortOption, callback: (param: SortStateModel) => void): Promise<void> {
        let stop: boolean = false, times: number = 0;

        for (let i = 0; !stop; i = (i + 1) % 2) {
            [times, stop] = await this.swapByAscent(source, lhs + i, rhs, true, i % 2 === 0 ? PRIMARY_ONE_COLOR : PRIMARY_TWO_COLOR, i % 2 === 0 ? SECONDARY_ONE_COLOR : SECONDARY_TWO_COLOR, i % 2 === 0 ? ACCENT_ONE_COLOR : ACCENT_TWO_COLOR, times, callback);
        }
        
        await delay();
        await this.complete(source, times, callback);
    }

    protected override async sortByDescent(source: SortDataModel[], lhs: number, rhs: number, option: SortOption, callback: (param: SortStateModel) => void): Promise<void> {
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
export class ShakerOddEvenSortAlgorithm extends OddEvenSortAlgorithm {

    protected override async sortByAscent(source: SortDataModel[], lhs: number, rhs: number, option: SortOption, callback: (param: SortStateModel) => void): Promise<void> {
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

    protected override async sortByDescent(source: SortDataModel[], lhs: number, rhs: number, option: SortOption, callback: (param: SortStateModel) => void): Promise<void> {
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

