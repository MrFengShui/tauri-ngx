import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { random } from "lodash";

import { SortDataModel, SortOrder, SortStateModel } from "../ngrx-store/sort.state";

import { ACCENT_ONE_COLOR, ACCENT_TWO_COLOR, CLEAR_COLOR, FINAL_COLOR } from "../../../public/global.utils";
import { delay } from "../../../public/global.utils";

import { SortToolsService } from "../ngrx-store/sort.service";

@Injectable()
export abstract class AbstractSortService<T = any> {

    protected readonly THRESHOLD: number = 24;
    protected readonly COIN_FLAG = (): boolean => {
        const coin: number = random(0, 1000, false);
        return coin > 450 && coin < 550;
    };

    protected array: T[] = Array.from([]);
    protected stack: T[] = Array.from([]);

    constructor(protected _service: SortToolsService) {}

    public sort(array: SortDataModel[], order: SortOrder, option?: string | number): Observable<SortStateModel> {
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

    protected abstract sortByAscent(source: SortDataModel[], lhs: number, rhs: number, option: string | number | undefined, callback: (param: SortStateModel) => void): Promise<void>;

    protected abstract sortByDescent(source: SortDataModel[], lhs: number, rhs: number, option: string | number | undefined, callback: (param: SortStateModel) => void): Promise<void>;
    
    protected async check(source: SortDataModel[], lhs: number, rhs: number, order: SortOrder, times: number, callback: (param: SortStateModel) => void): Promise<[number, boolean, number, number]> {
        let i: number = lhs, j: number = rhs, m: number = -1, n: number = -1, flag: boolean = true, fst: boolean = true, snd: boolean = true;

        while (i < j) {
            m = Math.min(i + 1, rhs);
            n = Math.max(j - 1, lhs);

            if (order === 'ascent') {
                fst = source[m].value >= source[i].value;
                snd = source[n].value <= source[j].value;
            }
            
            if (order === 'descent') {
                fst = source[m].value <= source[i].value;
                snd = source[n].value >= source[j].value;
            }

            times = await this.render(source, i, i, ACCENT_ONE_COLOR, ACCENT_ONE_COLOR, times, callback);
            times = await this.render(source, j, j, ACCENT_TWO_COLOR, ACCENT_TWO_COLOR, times, callback);

            flag = fst && snd;

            if (fst && snd) {
                i += 1;
                j -= 1;
            } else if (fst && !snd) {
                i += 1;
            } else if (!fst && snd) {
                j -= 1;
            } else {
                m = i;
                n = j;
                break;
            }
        }

        return [times, flag, m, n];
    }
    protected async sweep(source: SortDataModel[], index: number, color: string, times: number, callback: (param: SortStateModel) => void): Promise<number> {
        source[index].color = color;
        callback({ times, datalist: source });

        await delay();

        source[index].color = CLEAR_COLOR;
        callback({ times, datalist: source });

        return times;
    }

    protected async render(source: SortDataModel[], i: number, j: number, primaryColor: string, secondaryColor: string, times: number, callback: (param: SortStateModel) => void): Promise<number> {
        return this.renderWithDuration(source, i, j, primaryColor, secondaryColor, 1, times, callback);
    }

    protected async renderWithDuration(source: SortDataModel[], i: number, j: number, primaryColor: string, secondaryColor: string, duration: number, times: number, callback: (param: SortStateModel) => void): Promise<number> {
        source[i].color = primaryColor;
        source[j].color = secondaryColor;
        callback({ times, datalist: source });

        await delay(duration);

        source[i].color = CLEAR_COLOR;
        source[j].color = CLEAR_COLOR;
        callback({ times, datalist: source });

        return times;
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

@Injectable()
export abstract class AbstractComparisonSortService<T = number> extends AbstractSortService<T> {

    protected async exchange(source: SortDataModel[], flag: boolean, fst: number, snd: number, primaryColor: string, secondaryColor: string, accentColor: string, times: number, callback: (param: SortStateModel) => void): Promise<number> {
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
                this.swap(source, fst, snd);
    
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

    protected swap(source: SortDataModel[], fst: number, snd: number): void {
        let temp: SortDataModel = source[fst];
        source[fst] = source[snd];
        source[snd] = temp;
    }

}

@Injectable()
export abstract class AbstractInsertionSortService<T = number> extends AbstractComparisonSortService<T> {

    protected abstract sortByOrder(source: SortDataModel[], lhs: number, rhs: number, gap: number, step: number, primaryColor: string, secondaryColor: string, accentColor: string, order: SortOrder, times: number, callback: (param: SortStateModel) => void): Promise<number>;

    protected abstract insertByAscent(source: SortDataModel[], lhs: number, rhs: number, gap: number, primaryColor: string, secondaryColor: string, accentColor: string, times: number, callback: (param: SortStateModel) => void): Promise<number>;

    protected abstract insertByDescent(source: SortDataModel[], lhs: number, rhs: number, gap: number, primaryColor: string, secondaryColor: string, accentColor: string, times: number, callback: (param: SortStateModel) => void): Promise<number>;

}

@Injectable()
export abstract class AbstractSelectionSortService<T = number> extends AbstractComparisonSortService<T> {

    /**
     * 该方法主要用于排升序过程中选择剩余部分中相应的最大值或者最小值。
     * @param source 待排数组
     * @param lhs 最左阈值
     * @param rhs 最右与之
     * @param flag 是否在升序中找最值（true为最大值，false为最小值）
     * @param primaryColor 渲染的主要颜色
     * @param secondaryColor 渲染的辅助颜色
     * @param accentColor 渲染的高亮颜色
     * @param times 读写或者交换次数
     * @param callback 回调函数
     */
    protected abstract selectByAscent(source: SortDataModel[], lhs: number, rhs: number, flag: boolean, primaryColor: string, secondaryColor: string, accentColor: string, times: number, callback: (param: SortStateModel) => void): Promise<[number, number]>;

    /**
     * 该方法主要用于排降序过程中选择剩余部分中相应的最大值或者最小值。
     * @param source 待排数组
     * @param lhs 最左阈值
     * @param rhs 最右与之
     * @param flag 是否在升序中找最值（true为最大值，false为最小值）
     * @param primaryColor 渲染的主要颜色
     * @param secondaryColor 渲染的辅助颜色
     * @param accentColor 渲染的高亮颜色
     * @param times 读写或者交换次数
     * @param callback 回调函数
     */
    protected abstract selectByDescent(source: SortDataModel[], lhs: number, rhs: number, flag: boolean, primaryColor: string, secondaryColor: string, accentColor: string, times: number, callback: (param: SortStateModel) => void): Promise<[number, number]>;

}

@Injectable()
export abstract class AbstractBinarySortService<T = number> extends AbstractComparisonSortService<T> {
    
    protected abstract sortByOrder(source: SortDataModel[], lhs: number, rhs: number, order: SortOrder, times: number, callback: (param: SortStateModel) => void): Promise<number>;

}

@Injectable()
export abstract class AbstractMergeSortService<T = number> extends AbstractBinarySortService<T> {
    
    protected abstract mergeByAscent(source: SortDataModel[], lhs: number, mid: number, rhs: number, primaryColor: string, secondaryColor: string, accentColor: string, times: number, callback: (param: SortStateModel) => void): Promise<number>;

    protected abstract mergeByDescent(source: SortDataModel[], lhs: number, mid: number, rhs: number, primaryColor: string, secondaryColor: string, accentColor: string, times: number, callback: (param: SortStateModel) => void): Promise<number>;

}

export type PartitionMetaInfo = { times: number, mid?: number, fst?: number, snd?: number };

@Injectable()
export abstract class AbstractQuickSortService<T = number> extends AbstractBinarySortService<T> {

    protected abstract tailSortByOrder(source: SortDataModel[], lhs: number, rhs: number, order: SortOrder, times: number, callback: (param: SortStateModel) => void): Promise<number>;

    protected abstract partitionByAscent(source: SortDataModel[], lhs: number, rhs: number, times: number, callback: (param: SortStateModel) => void): Promise<PartitionMetaInfo>;

    protected abstract partitionByDescent(source: SortDataModel[], lhs: number, rhs: number, times: number, callback: (param: SortStateModel) => void): Promise<PartitionMetaInfo>;

}

@Injectable()
export abstract class AbstractDistributionSortService<T = any> extends AbstractSortService<T> {

    protected keys: string[] = Array.from([]);
    protected cacheOfKeyValue: { [key: string | number]: T } = {};
    protected cacheOfKeyValues: { [key: string | number]: T[] } = {};

    protected abstract save(source: SortDataModel[], lhs: number, rhs: number, order: SortOrder, times: number, callback: (param: SortStateModel) => void): Promise<number>;

    protected abstract load(source: SortDataModel[], lhs: number, rhs: number, order: SortOrder, times: number, callback: (param: SortStateModel) => void): Promise<number>;

    protected free(): void {
        this.freeKeyValue(this.cacheOfKeyValue);
        this.freeKeyValues(this.cacheOfKeyValues);
    }

    protected freeKeyValue(cache: { [key: string | number]: T } | null): void {
        if (cache) {
            let keys: string[] | null = Object.keys(cache);

            for (let i = 0, length = keys.length; i < length; i++) {
                delete cache[keys[i]];
            }

            cache = null;
            keys = null;
        }
    }

    protected freeKeyValues(cache: { [key: string | number]: T[] } | null): void {
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