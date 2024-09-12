import { Injectable } from "@angular/core";
import { floor, random } from "lodash";

import { calcLCM, delay } from "../../../public/global.utils";
import { PRIMARY_COLOR, SECONDARY_COLOR, CLEAR_COLOR, ACCENT_COLOR, PRIMARY_ONE_COLOR, SECONDARY_ONE_COLOR, ACCENT_ONE_COLOR, PRIMARY_TWO_COLOR, SECONDARY_TWO_COLOR, ACCENT_TWO_COLOR } from "../../../public/global.utils";

import { SortDataModel, SortOrder, SortStateModel } from "../ngrx-store/sort.state";

import { AbstractComparisonSortService } from "./base-sort.service";
import { SortToolsService } from "../ngrx-store/sort.service";

/**
 * 猴子排序
 */
@Injectable()
export class BogoSortService extends AbstractComparisonSortService {

    protected override async sortByAscent(source: SortDataModel[], lhs: number, rhs: number, option: string | number | undefined, callback: (param: SortStateModel) => void): Promise<void> {
        let times: number = await this.selectByOrder(source, lhs, rhs, 'ascent', 0, callback);

        await delay();
        await this.complete(source, times, callback);
    }

    protected override async sortByDescent(source: SortDataModel[], lhs: number, rhs: number, option: string | number | undefined, callback: (param: SortStateModel) => void): Promise<void> {
        let times: number = await this.selectByOrder(source, lhs, rhs, 'descent', 0, callback);

        await delay();
        await this.complete(source, times, callback);
    }

    protected async selectByOrder(source: SortDataModel[], lhs: number, rhs: number, order: SortOrder, times: number, callback: (param: SortStateModel) => void): Promise<number> {
        let i: number, j: number, start: number = lhs, final: number = rhs, flag: boolean = false, stop: boolean = false;

        while (!stop) {
            i = random(start, final, false);
            j = random(start, final, false);

            if (order === 'ascent') {
                flag = (i < j && source[i].value > source[j].value) || (i > j && source[i].value < source[j].value);
            }
            
            if (order === 'descent') {
                flag = (i < j && source[i].value < source[j].value) || (i > j && source[i].value > source[j].value);
            }

            times = await this.exchange(source, flag, i, j, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, times, callback);
            [times, stop, start, final] = await this.check(source, lhs, rhs, order, times, callback);
        }

        return times;
    }

    // protected async check(source: SortDataModel[], lhs: number, rhs: number, order: SortOrder, times: number, callback: (param: SortStateModel) => void): Promise<[boolean, number, number, number]> {
    //     let i: number = lhs, j: number = rhs, m: number = -1, n: number = -1, flag: boolean = true, fst: boolean = true, snd: boolean = true;

    //     while (i < j) {
    //         m = Math.min(i + 1, rhs);
    //         n = Math.max(j - 1, lhs);

    //         if (order === 'ascent') {
    //             fst = source[m].value >= source[i].value;
    //             snd = source[n].value <= source[j].value;
    //         }
            
    //         if (order === 'descent') {
    //             fst = source[m].value <= source[i].value;
    //             snd = source[n].value >= source[j].value;
    //         }

    //         times = await this.render(source, i, i, ACCENT_ONE_COLOR, ACCENT_ONE_COLOR, times, callback);
    //         times = await this.render(source, j, j, ACCENT_TWO_COLOR, ACCENT_TWO_COLOR, times, callback);

    //         flag = fst && snd;

    //         if (fst && snd) {
    //             i += 1;
    //             j -= 1;
    //         } else if (fst && !snd) {
    //             i += 1;
    //         } else if (!fst && snd) {
    //             j -= 1;
    //         } else {
    //             m = i;
    //             n = j;
    //             break;
    //         }
    //     }

    //     return [flag, times, m, n];
    // }

}

type IndexPair = { fst: number, snd: number };

/**
 * 猴子排序（并行）
 */
@Injectable()
export class ParallelBogoSortService extends BogoSortService {

    private pairs: IndexPair[] = Array.from([]);
    private flags: boolean[] = Array.from([]);

    protected override async sortByAscent(source: SortDataModel[], lhs: number, rhs: number, option: string | number | undefined, callback: (param: SortStateModel) => void): Promise<void> {
        const length: number = calcLCM(floor(Math.log2(rhs - lhs + 1), 0), 3);
        let start: number = lhs, final: number = rhs, flag: boolean, stop: boolean = false, times: number = 0;

        for (let i = 0; i < length; i++) {
            this.pairs.push({ fst: -1, snd: -1 });
            this.flags.push(false);
        }

        while (!stop) {
            for (let i = 0; i < length; i++) {
                this.pairs[i].fst = random(start, final, false);
                this.pairs[i].snd = random(start, final, false);

                flag = (this.pairs[i].fst < this.pairs[i].snd && source[this.pairs[i].fst].value > source[this.pairs[i].snd].value) || (this.pairs[i].fst > this.pairs[i].snd && source[this.pairs[i].fst].value < source[this.pairs[i].snd].value);
                this.flags[i] = flag;
            }

            times = await this.parallelRender(source, length, times, callback);            
            [times, stop, start, final] = await this.check(source, lhs, rhs, 'ascent', times, callback);
        }

        this.pairs.splice(0);
        this.flags.splice(0);

        await delay();
        await this.complete(source, times, callback);
    }

    protected override async sortByDescent(source: SortDataModel[], lhs: number, rhs: number, option: string | number | undefined, callback: (param: SortStateModel) => void): Promise<void> {
        const length: number = calcLCM(floor(Math.log2(rhs - lhs + 1), 0), 3);
        let start: number = lhs, final: number = rhs, flag: boolean, stop: boolean = false, times: number = 0;

        for (let i = 0; i < length; i++) {
            this.pairs.push({ fst: -1, snd: -1 });
            this.flags.push(false);
        }

        while (!stop) {
            for (let i = 0; i < length; i++) {
                this.pairs[i].fst = random(start, final, false);
                this.pairs[i].snd = random(start, final, false);

                flag = (this.pairs[i].fst < this.pairs[i].snd && source[this.pairs[i].fst].value < source[this.pairs[i].snd].value) || (this.pairs[i].fst > this.pairs[i].snd && source[this.pairs[i].fst].value > source[this.pairs[i].snd].value);
                this.flags[i] = flag;
            }

            times = await this.parallelRender(source, length, times, callback);            
            [times, stop, start, final] = await this.check(source, lhs, rhs, 'descent', times, callback);
        }

        this.pairs.splice(0);
        this.flags.splice(0);

        await delay();
        await this.complete(source, times, callback);
    }

    private async parallelRender(source: SortDataModel[], length: number, times: number, callback: (param: SortStateModel) => void): Promise<number> {
        for (let i = 0; i < length; i++) {
            if (i % 3 === 1) {
                source[this.pairs[i].fst].color = PRIMARY_ONE_COLOR;
                source[this.pairs[i].snd].color = SECONDARY_ONE_COLOR;
            } else if (i % 3 === 2) {
                source[this.pairs[i].fst].color = PRIMARY_TWO_COLOR;
                source[this.pairs[i].snd].color = SECONDARY_TWO_COLOR;
            } else {
                source[this.pairs[i].fst].color = PRIMARY_COLOR;
                source[this.pairs[i].snd].color = SECONDARY_COLOR;
            }
        }

        callback({ times, datalist: source });

        await delay();

        for (let i = 0; i < length; i++) {
            if (this.flags[i]) {
                this.swap(source, this.pairs[i].fst, this.pairs[i].snd);
                times += 1;
            }

            source[this.pairs[i].fst].color = CLEAR_COLOR;
            source[this.pairs[i].snd].color = CLEAR_COLOR;
        }

        callback({ times, datalist: source });
        return times;
    }

}

/**
 * 随机逆序对排序
 */
@Injectable()
export class BogoInversePairSortService extends BogoSortService {

    private pairs: string[] = Array.from([]);
    private split: string[] = Array.from([]);

    protected override async sortByAscent(source: SortDataModel[], lhs: number, rhs: number, option: string | number | undefined, callback: (param: SortStateModel) => void): Promise<void> {
        let i: number, j: number, k: number, times: number = 0;

        while (lhs < rhs) {
            i = lhs;

            for (let k = lhs + 1; k <= rhs; k++) {
                j = Math.min(k, rhs);

                if (i < j && source[i].value > source[j].value) {
                    this.pairs.push(`${i},${j}`);
                }
                
                times = await this.render(source, i, j, PRIMARY_COLOR, ACCENT_COLOR, times, callback);
            }

            if (this.pairs.length === 0) {
                lhs += 1;
                continue;
            }

            k = random(0, this.pairs.length - 1, false);
            this.split = this.pairs[k].split(',');
            i = Number.parseInt(this.split[0]);
            j = Number.parseInt(this.split[1]);

            this.split.splice(0);
            this.pairs.splice(0);

            times = await this.exchange(source, true, i, j, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, times, callback);
        }

        await delay();
        await this.complete(source, times, callback);
    }

    protected override async sortByDescent(source: SortDataModel[], lhs: number, rhs: number, option: string | number | undefined, callback: (param: SortStateModel) => void): Promise<void> {
        let i: number, j: number, k: number, times: number = 0;

        while (lhs < rhs) {
            i = rhs;

            for (let k = rhs - 1; k >= lhs; k--) {
                j = Math.max(k, lhs);

                if (i > j && source[i].value > source[j].value) {
                    this.pairs.push(`${i},${j}`);
                }
                
                times = await this.render(source, i, j, PRIMARY_COLOR, ACCENT_COLOR, times, callback);
            }

            if (this.pairs.length === 0) {
                rhs -= 1;
                continue;
            }

            k = random(0, this.pairs.length - 1, false);
            this.split = this.pairs[k].split(',');
            i = Number.parseInt(this.split[0]);
            j = Number.parseInt(this.split[1]);

            this.split.splice(0);
            this.pairs.splice(0);

            times = await this.exchange(source, true, i, j, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, times, callback);
        }

        await delay();
        await this.complete(source, times, callback);
    }

}

/**
 * 猴子冒泡排序（单向）
 */
@Injectable()
export class BubbleBogoSortService extends BogoSortService {

    protected override async sortByAscent(source: SortDataModel[], lhs: number, rhs: number, option: string | number | undefined, callback: (param: SortStateModel) => void): Promise<void> {
        let start: number = lhs, final: number = rhs, stop: boolean = false, times: number = 0;

        while (!stop) {
            times = await this.swapByAscent(source, start, final, true, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, times, callback);
            [times, stop, start, final] = await this.check(source, lhs, rhs, 'ascent', times, callback);
        }

        await delay();
        await this.complete(source, times, callback);
    }

    protected override async sortByDescent(source: SortDataModel[], lhs: number, rhs: number, option: string | number | undefined, callback: (param: SortStateModel) => void): Promise<void> {
        let start: number = lhs, final: number = rhs, stop: boolean = false, times: number = 0;

        while (!stop) {
            times = await this.swapByDescent(source, start, final, true, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, times, callback);
            [times, stop, start, final] = await this.check(source, lhs, rhs, 'descent', times, callback);
        }

        await delay();
        await this.complete(source, times, callback);
    }

    protected async swapByAscent(source: SortDataModel[], lhs: number, rhs: number, flags: boolean, primaryColor: string, secondaryColor: string, accentColor: string, times: number, callback: (param: SortStateModel) => void): Promise<number> {
        let j: number, k: number, flag: boolean;

        if (flags) {
            for (let i = lhs; i <= rhs; i++) {
                j = random(i, rhs, false);
                k = Math.min(j + 1, rhs);
                flag = source[k].value < source[j].value;

                source[i].color = ACCENT_COLOR;
                callback({ times, datalist: source });

                times = await this.exchange(source, flag, j, k, primaryColor, secondaryColor, accentColor, times, callback);

                source[i].color = CLEAR_COLOR;
                callback({ times, datalist: source });
            }
        } else {
            for (let i = rhs; i >= lhs; i--) {
                j = random(lhs, i, false);
                k = Math.max(j - 1, lhs);
                flag = source[k].value > source[j].value;

                source[i].color = ACCENT_COLOR;
                callback({ times, datalist: source });

                times = await this.exchange(source, flag, j, k, primaryColor, secondaryColor, accentColor, times, callback);

                source[i].color = CLEAR_COLOR;
                callback({ times, datalist: source });
            }
        }

        return times;
    }

    protected async swapByDescent(source: SortDataModel[], lhs: number, rhs: number, flags: boolean, primaryColor: string, secondaryColor: string, accentColor: string, times: number, callback: (param: SortStateModel) => void): Promise<number> {
        let j: number, k: number, flag: boolean;

        if (flags) {
            for (let i = rhs; i >= lhs; i--) {
                j = random(lhs, i, false);
                k = Math.max(j - 1, lhs);
                flag = source[k].value < source[j].value;

                source[i].color = ACCENT_COLOR;
                callback({ times, datalist: source });

                times = await this.exchange(source, flag, j, k, primaryColor, secondaryColor, accentColor, times, callback);

                source[i].color = CLEAR_COLOR;
                callback({ times, datalist: source });
            }
        } else {
            for (let i = lhs; i <= rhs; i++) {
                j = random(i, rhs, false);
                k = Math.min(j + 1, rhs);
                flag = source[k].value > source[j].value;

                source[i].color = ACCENT_COLOR;
                callback({ times, datalist: source });

                times = await this.exchange(source, flag, j, k, primaryColor, secondaryColor, accentColor, times, callback);

                source[i].color = CLEAR_COLOR;
                callback({ times, datalist: source });
            }
        }

        return times;
    }

}

/**
 * 猴子冒泡排序（双向）
 */
@Injectable()
export class ShakerBubbleBogoSortService extends BubbleBogoSortService {

    protected override async sortByAscent(source: SortDataModel[], lhs: number, rhs: number, option: string | number | undefined, callback: (param: SortStateModel) => void): Promise<void> {
        let times: number = await this.sortByOrder(source, lhs, rhs, 'ascent', 0, callback);

        await delay();
        await this.complete(source, times, callback);
    }

    protected override async sortByDescent(source: SortDataModel[], lhs: number, rhs: number, option: string | number | undefined, callback: (param: SortStateModel) => void): Promise<void> {
        let times: number = await this.sortByOrder(source, lhs, rhs, 'descent', 0, callback);

        await delay();
        await this.complete(source, times, callback);
    }

    public async sortByOrder(source: SortDataModel[], lhs: number, rhs: number, order: SortOrder, times: number, callback: (param: SortStateModel) => void): Promise<number> {
        let start: number = lhs, final: number = rhs, stop: boolean = false;

        while (!stop) {
            if (order === 'ascent') {
                times = await this.swapByAscent(source, start, final, true, PRIMARY_ONE_COLOR, SECONDARY_ONE_COLOR, ACCENT_ONE_COLOR, times, callback);
                times = await this.swapByAscent(source, start, final, false, PRIMARY_TWO_COLOR, SECONDARY_TWO_COLOR, ACCENT_TWO_COLOR, times, callback);
            }

            if (order === 'descent') {
                times = await this.swapByDescent(source, start, final, true, PRIMARY_ONE_COLOR, SECONDARY_ONE_COLOR, ACCENT_ONE_COLOR, times, callback);
                times = await this.swapByDescent(source, start, final, false, PRIMARY_TWO_COLOR, SECONDARY_TWO_COLOR, ACCENT_TWO_COLOR, times, callback);
            }
            
            [times, stop, start, final] = await this.check(source, lhs, rhs, order, times, callback);
        }

        return times;
    }

}

/**
 * 猴子插入排序
 */
@Injectable()
export class InsertionBogoSortService extends BogoSortService {

    protected override async sortByAscent(source: SortDataModel[], lhs: number, rhs: number, option: string | number | undefined, callback: (param: SortStateModel) => void): Promise<void> {
        let i: number, start: number = lhs, final: number = rhs, stop: boolean = false, flag: boolean, times: number = 0;
        
        while (!stop) {
            i = random(start, final, false);

            flag = source[Math.min(i + 1, rhs)].value >= source[i].value;

            if (flag) {
                times = await this.sweep(source, i, ACCENT_COLOR, times, callback);
            } else {
                for (let j = i; j < rhs && source[j + 1].value < source[j].value; j++) {
                    source[i].color = ACCENT_COLOR;
                    callback({ times, datalist: source });
    
                    times = await this.exchange(source, true, j, j + 1, PRIMARY_ONE_COLOR, SECONDARY_ONE_COLOR, ACCENT_ONE_COLOR, times, callback);
                }
                
                source[i].color = CLEAR_COLOR;
                callback({ times, datalist: source });
            }

            flag = source[Math.max(i - 1, lhs)].value <= source[i].value;

            if (flag) {
                times = await this.sweep(source, i, ACCENT_COLOR, times, callback);
            } else {
                for (let j = i; j > lhs && source[j - 1].value > source[j].value; j--) {
                    source[i].color = ACCENT_COLOR;
                    callback({ times, datalist: source });
    
                    times = await this.exchange(source, true, j, j - 1, PRIMARY_TWO_COLOR, SECONDARY_TWO_COLOR, ACCENT_TWO_COLOR, times, callback);
                }
                
                source[i].color = CLEAR_COLOR;
                callback({ times, datalist: source });
            }

            [times, stop, start, final] = await this.check(source, lhs, rhs, 'ascent', times, callback);
        }

        await delay();
        await this.complete(source, times, callback);
    }

    protected override async sortByDescent(source: SortDataModel[], lhs: number, rhs: number, option: string | number | undefined, callback: (param: SortStateModel) => void): Promise<void> {
        let i: number, start: number = lhs, final: number = rhs, stop: boolean = false, flag: boolean, times: number = 0;
        
        while (!stop) {
            i = random(start, final, false);

            flag = source[Math.min(i + 1, rhs)].value <= source[i].value;

            if (flag) {
                times = await this.sweep(source, i, ACCENT_COLOR, times, callback);
            } else {
                for (let j = i; j < rhs && source[j + 1].value > source[j].value; j++) {
                    source[i].color = ACCENT_COLOR;
                    callback({ times, datalist: source });
    
                    times = await this.exchange(source, true, j, j + 1, PRIMARY_ONE_COLOR, SECONDARY_ONE_COLOR, ACCENT_ONE_COLOR, times, callback);
                }
                
                source[i].color = CLEAR_COLOR;
                callback({ times, datalist: source });
            }

            flag = source[Math.max(i - 1, lhs)].value >= source[i].value;

            if (flag) {
                times = await this.sweep(source, i, ACCENT_COLOR, times, callback);
            } else {
                for (let j = i; j > lhs && source[j - 1].value < source[j].value; j--) {
                    source[i].color = ACCENT_COLOR;
                    callback({ times, datalist: source });
    
                    times = await this.exchange(source, true, j, j - 1, PRIMARY_TWO_COLOR, SECONDARY_TWO_COLOR, ACCENT_TWO_COLOR, times, callback);
                }
                
                source[i].color = CLEAR_COLOR;
                callback({ times, datalist: source });
            }

            [times, stop, start, final] = await this.check(source, lhs, rhs, 'descent', times, callback);
        }

        await delay();
        await this.complete(source, times, callback);
    }

}

/**
 * 猴子选择排序
 */
@Injectable()
export class SelectionBogoSortService extends BogoSortService {

    protected override async sortByAscent(source: SortDataModel[], lhs: number, rhs: number, option: string | number | undefined, callback: (param: SortStateModel) => void): Promise<void> {
        let i: number, j: number, index: number, start: number = lhs, final: number = rhs, stop: boolean = false, times: number = 0;
        
        while (!stop) {
            i = random(start, final, false);
            j = Math.min(i + 1, final);

            if (i === j) {
                index = i;

                for (let k = i - 1; k >= lhs; k--) {
                    source[i].color = PRIMARY_COLOR;
                    source[k].color = SECONDARY_COLOR;
                    source[index].color = ACCENT_COLOR;
                    callback({ times, datalist: source });

                    await delay();

                    if (source[k].value > source[index].value) {
                        source[index].color = CLEAR_COLOR;
                        index = k;
                    }

                    source[i].color = PRIMARY_COLOR;
                    source[k].color = CLEAR_COLOR;
                    source[index].color = ACCENT_COLOR;
                    callback({ times, datalist: source });
                }

                times = await this.exchange(source, index !== i, i, index, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, times, callback);
            } else {
                start = i;
                final = j;

                for (let m = Math.max(i - 1, lhs), n = Math.min(j + 1, rhs); !(m === lhs && n === rhs); m = Math.max(m - 1, lhs), n = Math.min(n + 1, rhs)) {
                    source[i].color = PRIMARY_ONE_COLOR;
                    source[m].color = SECONDARY_ONE_COLOR;
                    source[start].color = ACCENT_ONE_COLOR;
                    source[j].color = PRIMARY_TWO_COLOR;
                    source[n].color = SECONDARY_TWO_COLOR;
                    source[final].color = ACCENT_TWO_COLOR;
                    callback({ times, datalist: source });

                    await delay();

                    if (source[m].value > source[start].value) {
                        source[start].color = CLEAR_COLOR;
                        start = m;
                    }

                    if (source[n].value < source[final].value) {
                        source[final].color = CLEAR_COLOR;
                        final = n;
                    }

                    source[i].color = PRIMARY_ONE_COLOR;
                    source[m].color = CLEAR_COLOR;
                    source[start].color = ACCENT_ONE_COLOR;
                    source[j].color = PRIMARY_TWO_COLOR;
                    source[n].color = CLEAR_COLOR;
                    source[final].color = ACCENT_TWO_COLOR;
                    callback({ times, datalist: source });
                }

                times = await this.exchange(source, start !== i, i, start, PRIMARY_ONE_COLOR, SECONDARY_ONE_COLOR, ACCENT_ONE_COLOR, times, callback);
                times = await this.exchange(source, final !== j, j, final, PRIMARY_TWO_COLOR, SECONDARY_TWO_COLOR, ACCENT_TWO_COLOR, times, callback);
                times = await this.exchange(source, source[i].value > source[j].value, i, j, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, times, callback);
            }

            [times, stop, start, final] = await this.check(source, lhs, rhs, 'ascent', times, callback);
        }

        await delay();
        await this.complete(source, times, callback);
    }

    protected override async sortByDescent(source: SortDataModel[], lhs: number, rhs: number, option: string | number | undefined, callback: (param: SortStateModel) => void): Promise<void> {
        let i: number, j: number, index: number, start: number = lhs, final: number = rhs, stop: boolean = false, times: number = 0;
        
        while (!stop) {
            i = random(start, final, false);
            j = Math.max(i - 1, start);

            if (i === j) {
                index = i;

                for (let k = i + 1; k <= rhs; k++) {
                    source[i].color = PRIMARY_COLOR;
                    source[k].color = SECONDARY_COLOR;
                    source[index].color = ACCENT_COLOR;
                    callback({ times, datalist: source });

                    await delay();

                    if (source[k].value > source[index].value) {
                        source[index].color = CLEAR_COLOR;
                        index = k;
                    }

                    source[i].color = PRIMARY_COLOR;
                    source[k].color = CLEAR_COLOR;
                    source[index].color = ACCENT_COLOR;
                    callback({ times, datalist: source });
                }

                times = await this.exchange(source, index !== i, i, index, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, times, callback);
            } else {
                start = i;
                final = j;

                for (let m = Math.max(i - 1, lhs), n = Math.min(j + 1, rhs); !(m === lhs && n === rhs); m = Math.max(m - 1, lhs), n = Math.min(n + 1, rhs)) {
                    source[i].color = PRIMARY_ONE_COLOR;
                    source[m].color = SECONDARY_ONE_COLOR;
                    source[start].color = ACCENT_ONE_COLOR;
                    source[j].color = PRIMARY_TWO_COLOR;
                    source[n].color = SECONDARY_TWO_COLOR;
                    source[final].color = ACCENT_TWO_COLOR;
                    callback({ times, datalist: source });

                    await delay();

                    if (source[m].value < source[start].value) {
                        source[start].color = CLEAR_COLOR;
                        start = m;
                    }

                    if (source[n].value > source[final].value) {
                        source[final].color = CLEAR_COLOR;
                        final = n;
                    }

                    source[i].color = PRIMARY_ONE_COLOR;
                    source[m].color = CLEAR_COLOR;
                    source[start].color = ACCENT_ONE_COLOR;
                    source[j].color = PRIMARY_TWO_COLOR;
                    source[n].color = CLEAR_COLOR;
                    source[final].color = ACCENT_TWO_COLOR;
                    callback({ times, datalist: source });
                }

                times = await this.exchange(source, start !== i, i, start, PRIMARY_ONE_COLOR, SECONDARY_ONE_COLOR, ACCENT_ONE_COLOR, times, callback);
                times = await this.exchange(source, final !== j, j, final, PRIMARY_TWO_COLOR, SECONDARY_TWO_COLOR, ACCENT_TWO_COLOR, times, callback);
                times = await this.exchange(source, source[i].value > source[j].value, i, j, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, times, callback);
            }

            [times, stop, start, final] = await this.check(source, lhs, rhs, 'descent', times, callback);
        }

        await delay();
        await this.complete(source, times, callback);
    }

}

@Injectable()
export class MergeBogoSortService extends BogoSortService {

    constructor(
        protected override _service: SortToolsService,
        private _shakerBubbleBogoService: ShakerBubbleBogoSortService
    ) {
        super(_service);
    }

    protected override async sortByAscent(source: SortDataModel[], lhs: number, rhs: number, option: string | number | undefined, callback: (param: SortStateModel) => void): Promise<void> {
        let start: number = lhs, final: number = rhs, stop: boolean = false, times: number = 0;

        while (!stop) {
            times = await this.sortByOrder(source, start, final, 'ascent', times, callback);
            [times, stop, start, final] = await this.check(source, lhs, rhs, 'ascent', times, callback);
        }

        await delay();
        await this.complete(source, times, callback);
    }

    protected override async sortByDescent(source: SortDataModel[], lhs: number, rhs: number, option: string | number | undefined, callback: (param: SortStateModel) => void): Promise<void> {
        let start: number = lhs, final: number = rhs, stop: boolean = false, times: number = 0;

        while (!stop) {
            times = await this.sortByOrder(source, start, final, 'descent', times, callback);
            [times, stop, start, final] = await this.check(source, lhs, rhs, 'descent', times, callback);
        }

        await delay();
        await this.complete(source, times, callback);
    }

    protected async sortByOrder(source: SortDataModel[], lhs: number, rhs: number, order: SortOrder, times: number, callback: (param: SortStateModel) => void): Promise<number> {
        if (lhs < rhs) {
            const mid: number = floor((rhs - lhs) * 0.5 + lhs, 0);

            if (order === 'ascent') {
                times = await this.sortByOrder(source, lhs, mid, order, times, callback);
                times = await this.sortByOrder(source, mid + 1, rhs, order, times, callback);
                times = await this.mergeByAscent(source, lhs, mid, rhs, times, callback);
            }

            if (order === 'descent') {
                times = await this.sortByOrder(source, mid + 1, rhs, order, times, callback);
                times = await this.sortByOrder(source, lhs, mid, order, times, callback);
                times = await this.mergeByDescent(source, lhs, mid, rhs, times, callback);
            }
        }
        
        return times;
    }

    private async mergeByAscent(source: SortDataModel[], lhs: number, mid: number, rhs: number, times: number, callback: (param: SortStateModel) => void): Promise<number> {
        let i: number = lhs, j: number = mid + 1;

        while (i <= mid && j <= rhs) {
            times = await this.exchange(source, this.COIN_FLAG(), i, j, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, times, callback);

            i += 1;
            j += 1;
        }

        return await this._shakerBubbleBogoService.sortByOrder(source, lhs, rhs, 'ascent', times, callback);
    }
    
    private async mergeByDescent(source: SortDataModel[], lhs: number, mid: number, rhs: number, times: number, callback: (param: SortStateModel) => void): Promise<number> {
        let i: number = mid, j: number = rhs;

        while (i >= lhs && j >= mid + 1) {
            times = await this.exchange(source, this.COIN_FLAG(), i, j, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, times, callback);

            i -= 1;
            j -= 1;
        }

        return await this._shakerBubbleBogoService.sortByOrder(source, lhs, rhs, 'descent', times, callback);
    }
    
}