import { Observable } from "rxjs";
import { floor, random } from "lodash";

import { SortDataModel, SortIndexRange, SortOption, SortOrder, SortRadix, SortStateModel } from "../ngrx-store/sort.state";

import { ACCENT_COLOR, CLEAR_COLOR, FINAL_COLOR, START_COLOR } from "../../../public/global.utils";
import { delay } from "../../../public/global.utils";

import { SortToolsService } from "../ngrx-store/sort.service";

export abstract class AbstractSortAlgorithm<T = any> {

    protected readonly THRESHOLD: number = 16;
    protected readonly COIN_FLAG = (): boolean => {
        const coin: number = random(0, 1000, false);
        return coin > 450 && coin < 550;
    };

    protected array: T[] = Array.from([]);
    protected stack: T[] = Array.from([]);
    protected queue: T[] = Array.from([]);

    constructor(protected _service: SortToolsService) {}

    public sort(array: SortDataModel[], order: SortOrder, option: SortOption): Observable<SortStateModel> {
        return new Observable(subscriber => {
            if (order === 'ascent') {
                this.sortByAscent(array, 0, array.length - 1, option, param => subscriber.next(param))
                    .then(() => subscriber.complete())
                    .catch(error => subscriber.error(error));
            }
    
            if (order === 'descent') {
                this.sortByDescent(array, 0, array.length - 1, option, param => subscriber.next(param))
                    .then(() => subscriber.complete())
                    .catch(error => subscriber.error(error));
            }
        });
    }

    protected abstract sortByAscent(source: SortDataModel[], lhs: number, rhs: number, option: SortOption, callback: (param: SortStateModel) => void): Promise<void>;

    protected abstract sortByDescent(source: SortDataModel[], lhs: number, rhs: number, option: SortOption, callback: (param: SortStateModel) => void): Promise<void>;
    
    protected async check(source: SortDataModel[], lhs: number, rhs: number, order: SortOrder, times: number, callback: (param: SortStateModel) => void): Promise<[number, boolean, number, number]> {
        let fst: number, snd: number, flag: boolean = true, fstFlag: boolean, sndFlag: boolean;

        if (order === 'ascent') {
            while (lhs < rhs) {
                times = await this.dualSweep(source, lhs, rhs, START_COLOR, FINAL_COLOR, times, callback);
    
                fst = Math.min(lhs + 1, rhs);
                snd = Math.max(rhs - 1, lhs);
                fstFlag = source[fst].value >= source[lhs].value;
                sndFlag = source[snd].value <= source[rhs].value;

                if (!fstFlag && !sndFlag) {
                    flag = false;
                    break;
                }
    
                if (fstFlag) lhs += 1;
    
                if (sndFlag) rhs -= 1;
            }
        }

        if (order === 'descent') {
            while (lhs < rhs) {
                times = await this.dualSweep(source, lhs, rhs, FINAL_COLOR, START_COLOR, times, callback);
    
                fst = Math.max(rhs - 1, lhs);
                snd = Math.min(lhs + 1, rhs);
                fstFlag = source[fst].value >= source[rhs].value;
                sndFlag = source[snd].value <= source[lhs].value;

                if (!fstFlag && !sndFlag) {
                    flag = false;
                    break;
                }
    
                if (fstFlag) rhs -= 1;
    
                if (sndFlag) lhs += 1;
            }
        }
        
        return [times, flag, lhs, rhs];
    }

    protected checkByOrder(source: SortDataModel[], lhs: number, rhs: number, order: SortOrder, depth: number = floor(Math.log(rhs - lhs + 1), 0), flag: boolean = true): boolean {
        if (!flag) return false;
        
        if (depth === 0) {
            if (order === 'ascent') {
                for (let i = lhs; i < rhs; i++) flag &&= (source[i + 1].value >= source[i].value);
            }
            
            if (order === 'descent') {
                for (let i = rhs; i > lhs; i--) flag &&= (source[i - 1].value >= source[i].value);
            }
        } else {
            const mid: number = floor((rhs - lhs) * 0.5 + lhs, 0);
            const fst: boolean = this.checkByOrder(source, lhs, mid, order, depth - 1, flag);
            const snd: boolean = this.checkByOrder(source, mid + 1, rhs, order, depth - 1, flag && fst);
            flag = flag && fst && snd;
        }

        return flag;
    }
    
    protected async sweep(source: SortDataModel[], index: number, color: string, times: number, callback: (param: SortStateModel) => void): Promise<number> {
        return await this.sweepWithDuration(source, index, color, 1, times, callback);
    }

    protected async sweepWithDuration(source: SortDataModel[], index: number, color: string, duration: number, times: number, callback: (param: SortStateModel) => void): Promise<number> {
        source[index].color = color;
        callback({ times, datalist: source });

        await delay(duration);

        source[index].color = CLEAR_COLOR;
        callback({ times, datalist: source });
        return times;
    }

    protected async dualSweep(source: SortDataModel[], i: number, j: number, primaryColor: string, secondaryColor: string, times: number, callback: (param: SortStateModel) => void): Promise<number> {
        return await this.multiSweep(source, [i, j], [primaryColor, secondaryColor], times, callback);
    }

    protected async multiSweep(source: SortDataModel[], places: number[], colors: string[], times: number, callback: (param: SortStateModel) => void): Promise<number> {
        return await this._service.sweepWith(source, places, colors, 1, times, callback);
    }
    
    protected async complete(source: SortDataModel[], times: number, callback: (param: SortStateModel) => void): Promise<void> {
        for (let i = 0, length = source.length; i < length; i++) {
            source[i].color = FINAL_COLOR;
            callback({ times, datalist: source });
            
            await delay();
        }

        if (source.length > 0) {
            source.splice(0);
        }
    };

}

export abstract class AbstractComparisonSortAlgorithm<T = number> extends AbstractSortAlgorithm<T> {

    public async exchange(source: SortDataModel[], flag: boolean, fst: number, snd: number, primaryColor: string, secondaryColor: string, accentColor: string, times: number, callback: (param: SortStateModel) => void): Promise<number> {
        if (fst === snd) {
            source[fst].color = accentColor;
            callback({ times, datalist: source });

            await delay();

            source[fst].color = CLEAR_COLOR;
            callback({ times, datalist: source });
        } else {
            source[fst].color = flag ? primaryColor : accentColor;
            source[snd].color = flag ? secondaryColor : CLEAR_COLOR;
            callback({ times, datalist: source });
    
            await delay();
    
            if (flag) {
                this._service.swap(source, fst, snd);
    
                times += 1;
    
                source[fst].color = secondaryColor;
                source[snd].color = primaryColor;
                callback({ times, datalist: source });
    
                await delay();
            }
    
            source[fst].color = CLEAR_COLOR;
            source[snd].color = CLEAR_COLOR;
            callback({ times, datalist: source });
        }

        return times;
    }

}

export abstract class AbstractInsertionSortAlgorithm<T = number> extends AbstractComparisonSortAlgorithm<T> {

    protected abstract sortByOrder(source: SortDataModel[], lhs: number, rhs: number, innerGap: number, outerGap: number, primaryColor: string, secondaryColor: string, accentColor: string, order: SortOrder, times: number, callback: (param: SortStateModel) => void): Promise<[number, number]>;

    protected abstract insertByAscent(source: SortDataModel[], lhs: number, rhs: number, gap: number, primaryColor: string, secondaryColor: string, accentColor: string, times: number, callback: (param: SortStateModel) => void): Promise<[number, number]>;

    protected abstract insertByDescent(source: SortDataModel[], lhs: number, rhs: number, gap: number, primaryColor: string, secondaryColor: string, accentColor: string, times: number, callback: (param: SortStateModel) => void): Promise<[number, number]>;

    public async moveByOrder(source: SortDataModel[], lhs: number, rhs: number, primaryColor: string, secondaryColor: string, order: SortOrder, times: number, callback: (param: SortStateModel) => void): Promise<number> {
        let value: number = -1, radix: string = '';

        if (order === 'ascent') {
            value = source[rhs].value;
            radix = source[rhs]?.radix as string;

            for (let i = rhs; i >= lhs; i--) source[i].color = i === lhs ? primaryColor : secondaryColor;
        }
        
        if (order === 'descent') {
            value = source[lhs].value;
            radix = source[lhs]?.radix as string;

            for (let i = lhs; i <= rhs; i++) source[i].color = i === rhs ? primaryColor : secondaryColor;
        }

        callback({ times, datalist: source });

        await delay();

        if (order === 'ascent') {
            for (let i = rhs; i >= lhs; i--) {
                if (i === lhs) {
                    source[i].value = value;
                    source[i].radix = radix;
                    source[i].color = secondaryColor;
                } else {
                    source[i].value = source[i - 1].value;
                    source[i].radix = source[i - 1].radix;
                    source[i].color = primaryColor;
                }

                times += 1;
            }
        }

        if (order === 'descent') {
            for (let i = lhs; i <= rhs; i++) {
                if (i === rhs) {
                    source[i].value = value;
                    source[i].radix = radix;
                    source[i].color = secondaryColor;
                } else {
                    source[i].value = source[i + 1].value;
                    source[i].radix = source[i + 1].radix;
                    source[i].color = primaryColor;
                }

                 times += 1;
            }
        }

        callback({ times, datalist: source });

        await delay();

        source.forEach(item => item.color = CLEAR_COLOR);

        callback({ times, datalist: source });
        
        return times;
    }

}

export abstract class AbstractSelectionSortAlgorithm<T = number> extends AbstractComparisonSortAlgorithm<T> {

    /**
     * 该方法主要用于排升序过程中选择剩余部分中相应的最大值或者最小值。
     * @param source 待排数组
     * @param lhs 最左阈值
     * @param rhs 最右阈值
     * @param gap 移动间距
     * @param flag 是否在升序中找最值（true为最大值，false为最小值）
     * @param primaryColor 渲染的主要颜色
     * @param secondaryColor 渲染的辅助颜色
     * @param accentColor 渲染的高亮颜色
     * @param times 读写或者交换次数
     * @param callback 回调函数
     */
    protected abstract selectByAscent(source: SortDataModel[], lhs: number, rhs: number, gap: number, flag: boolean, primaryColor: string, secondaryColor: string, accentColor: string, times: number, callback: (param: SortStateModel) => void): Promise<[number, number]>;

    /**
     * 该方法主要用于排降序过程中选择剩余部分中相应的最大值或者最小值。
     * @param source 待排数组
     * @param lhs 最左阈值
     * @param rhs 最右阈值
     * @param gap 移动间距
     * @param flag 是否在升序中找最值（true为最大值，false为最小值）
     * @param primaryColor 渲染的主要颜色
     * @param secondaryColor 渲染的辅助颜色
     * @param accentColor 渲染的高亮颜色
     * @param times 读写或者交换次数
     * @param callback 回调函数
     */
    protected abstract selectByDescent(source: SortDataModel[], lhs: number, rhs: number, gap: number, flag: boolean, primaryColor: string, secondaryColor: string, accentColor: string, times: number, callback: (param: SortStateModel) => void): Promise<[number, number]>;

}

export abstract class AbstractBinarySortAlgorithm<T = number> extends AbstractComparisonSortAlgorithm<T> {
    
    protected abstract sortByOrder(source: SortDataModel[], lhs: number, rhs: number, order: SortOrder, times: number, callback: (param: SortStateModel) => void): Promise<number>;

}

export abstract class AbstractMergeSortAlgorithm<T = number> extends AbstractBinarySortAlgorithm<T> {
    
    protected abstract mergeByAscent(source: SortDataModel[], lhs: number, mid: number, rhs: number, primaryColor: string, secondaryColor: string, accentColor: string, times: number, callback: (param: SortStateModel) => void): Promise<number>;

    protected abstract mergeByDescent(source: SortDataModel[], lhs: number, mid: number, rhs: number, primaryColor: string, secondaryColor: string, accentColor: string, times: number, callback: (param: SortStateModel) => void): Promise<number>;

}

export type PartitionMetaInfo = { times: number, mid?: number, fst?: number, snd?: number, stop?: boolean };

export abstract class AbstractQuickSortAlgorithm<T = number> extends AbstractBinarySortAlgorithm<T> {

    protected abstract tailSortByOrder(source: SortDataModel[], lhs: number, rhs: number, order: SortOrder, times: number, callback: (param: SortStateModel) => void): Promise<number>;

    protected abstract partitionByAscent(source: SortDataModel[], lhs: number, rhs: number, times: number, callback: (param: SortStateModel) => void): Promise<PartitionMetaInfo>;

    protected abstract partitionByDescent(source: SortDataModel[], lhs: number, rhs: number, times: number, callback: (param: SortStateModel) => void): Promise<PartitionMetaInfo>;

}

export abstract class AbstractDistributionSortAlgorithm<T = number> extends AbstractSortAlgorithm<T> {

    protected keys: Array<string | number> = Array.from([]);
    protected cacheOfKeyValue: { [key: string | number]: T } = {};
    protected cacheOfKeyValues: { [key: string | number]: Array<T> } = {};

    protected abstract saveByOrder(source: SortDataModel[], lhs: number, rhs: number, order: SortOrder, times: number, callback: (param: SortStateModel) => void): Promise<number>;

    protected abstract loadByOrder(source: SortDataModel[], lhs: number, rhs: number, order: SortOrder, times: number, callback: (param: SortStateModel) => void): Promise<number>;

    protected free(): void {
        this.freeKeyValue(this.cacheOfKeyValue);
        this.freeKeyValues(this.cacheOfKeyValues);
    }

    protected freeKeyValue(cache: { [key: string | number]: T | unknown } | null): void {
        if (cache) {
            let keys: string[] | null = Object.keys(cache);

            for (let i = 0, length = keys.length; i < length; i++) {
                delete cache[keys[i]];
            }

            cache = null;
            keys = null;
        }
    }

    protected freeKeyValues(cache: { [key: string | number]: Array<T | unknown> } | null): void {
        if (cache) {
            let keys: string[] | null = Object.keys(cache), key: string;

            for (let i = 0, length = keys.length; i < length; i++) {
                key = keys[i];
                cache[key].splice(0);
                delete cache[key];
            }

            cache = null;
            keys = null;
        }
    }

}

export abstract class AbstractRadixSortAlgorithm<T = any> extends AbstractDistributionSortAlgorithm<T> {

    protected abstract saveByDigit(source: SortDataModel[], lhs: number, rhs: number, digit: number, order: SortOrder, times: number, callback: (param: SortStateModel) => void): Promise<number>;

    protected abstract loadByDigit(source: SortDataModel[], lhs: number, rhs: number, digit: number, order: SortOrder, times: number, callback: (param: SortStateModel) => void): Promise<[number, SortIndexRange[]]>;

    protected async generationByOrder(source: SortDataModel[], lhs: number, rhs: number, radix: SortRadix, order: SortOrder, times: number, callback: (param: SortStateModel) => void): Promise<[number, number]> {
        const value: number = Math.max(...source.map(item => item.value)), digits: number = value.toString(radix).length;
        let index: number= -1;

        for (let i = lhs; i <= rhs; i++) {
            if (order === 'ascent') index = lhs + i;

            if (order === 'descent') index = rhs - i;

            source[index].radix = source[index].value.toString(radix).padStart(digits, '0');
            times = await this.sweep(source, index, ACCENT_COLOR, times, callback);
        }
        
        return [times, digits];
    }

    protected parititionByOrder(source: SortDataModel[], lhs: number, rhs: number, digit: number, order: SortOrder): SortIndexRange[] {
        const ranges: SortIndexRange[] = Array.from([]);
        let idx: number = -1, fst: number = -1, snd: number = -1, fstRadix: string, sndRadix: string;

        if (order === 'ascent') idx = lhs;

        if (order === 'descent') idx = rhs;

        for (let i = lhs; i <= rhs; i++) {
            if (order === 'ascent') {
                fst = i;
                snd = Math.min(fst + 1, rhs)
            }

            if (order === 'descent') {
                fst = rhs - i + lhs;
                snd = Math.max(fst - 1, lhs);
            }

            fstRadix = source[fst]?.radix as string;
            sndRadix = source[snd]?.radix as string;

            if (fstRadix[digit] !== sndRadix[digit] || fst === snd) {
                if (order === 'ascent') ranges.push({ start: idx, final: fst });

                if (order === 'descent') ranges.push({ start: fst, final: idx });

                idx = snd;
            }
        }
        
        return ranges;
    }

}