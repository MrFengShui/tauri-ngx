import { Injectable } from "@angular/core";
import { floor, random } from "lodash";

import { calcLCM, delay } from "../../../public/global.utils";
import { PRIMARY_COLOR, SECONDARY_COLOR, CLEAR_COLOR, ACCENT_COLOR, PRIMARY_ONE_COLOR, SECONDARY_ONE_COLOR, ACCENT_ONE_COLOR, PRIMARY_TWO_COLOR, SECONDARY_TWO_COLOR, ACCENT_TWO_COLOR, START_COLOR, FINAL_COLOR } from "../../../public/global.utils";

import { SortDataModel, SortOrder, SortStateModel } from "../ngrx-store/sort.state";

import { AbstractRecursiveSortService, AbstractSortService } from "./base-sort.service";

/**
 * 猴子排序
 */
@Injectable()
export class BogoSortService extends AbstractSortService<number> {

    protected override async sortByAscent(source: SortDataModel[], lhs: number, rhs: number, option: string | number | undefined, callback: (param: SortStateModel) => void): Promise<void> {
        let i: number, j: number, start: number = lhs, final: number = rhs, flag: boolean, completed: boolean = false, times: number = 0;

        while (!completed) {
            i = random(start, final, false);
            j = random(start, final, false);
            flag = (i < j && source[i].value > source[j].value) || (i > j && source[i].value < source[j].value);

            [completed, times] = await this._service.swapAndRender(source, completed, flag, i, j, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, times, callback);
            [completed, times, start, final] = await this.check(source, lhs, rhs, 'ascent', times, callback);
        }

        await delay();
        await this.complete(source, times, callback);
    }

    protected override async sortByDescent(source: SortDataModel[], lhs: number, rhs: number, option: string | number | undefined, callback: (parram: SortStateModel) => void): Promise<void> {
        let i: number, j: number, start: number = lhs, final: number = rhs, flag: boolean, completed: boolean = false, times: number = 0;

        while (!completed) {
            i = random(start, final, false);
            j = random(start, final, false);
            flag = (i < j && source[i].value < source[j].value) || (i > j && source[i].value > source[j].value);

            [completed, times] = await this._service.swapAndRender(source, completed, flag, i, j, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, times, callback);
            [completed, times, start, final] = await this.check(source, lhs, rhs, 'descent', times, callback);
        }

        await delay();
        await this.complete(source, times, callback);
    }

    protected async check(source: SortDataModel[], lhs: number, rhs: number, order: SortOrder, times: number, callback: (param: SortStateModel) => void): Promise<[boolean, number, number, number]> {
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

        return [flag, times, m, n];
    }

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
        let start: number = lhs, final: number = rhs, flag: boolean, completed: boolean = false, times: number = 0;

        for (let i = 0; i < length; i++) {
            this.pairs.push({ fst: -1, snd: -1 });
            this.flags.push(false);
        }

        while (!completed) {
            for (let i = 0; i < length; i++) {
                this.pairs[i].fst = random(start, final, false);
                this.pairs[i].snd = random(start, final, false);

                flag = (this.pairs[i].fst < this.pairs[i].snd && source[this.pairs[i].fst].value > source[this.pairs[i].snd].value) || (this.pairs[i].fst > this.pairs[i].snd && source[this.pairs[i].fst].value < source[this.pairs[i].snd].value);
                this.flags[i] = flag;
            }

            times = await this.parallelRender(source, length, times, callback);            
            [completed, times, start, final] = await this.check(source, lhs, rhs, 'ascent', times, callback);
        }

        this.pairs.splice(0);
        this.flags.splice(0);

        await delay();
        await this.complete(source, times, callback);
    }

    protected override async sortByDescent(source: SortDataModel[], lhs: number, rhs: number, option: string | number | undefined, callback: (param: SortStateModel) => void): Promise<void> {
        const length: number = calcLCM(floor(Math.log2(rhs - lhs + 1), 0), 3);
        let start: number = lhs, final: number = rhs, flag: boolean, completed: boolean = false, times: number = 0;

        for (let i = 0; i < length; i++) {
            this.pairs.push({ fst: -1, snd: -1 });
            this.flags.push(false);
        }

        while (!completed) {
            for (let i = 0; i < length; i++) {
                this.pairs[i].fst = random(start, final, false);
                this.pairs[i].snd = random(start, final, false);

                flag = (this.pairs[i].fst < this.pairs[i].snd && source[this.pairs[i].fst].value < source[this.pairs[i].snd].value) || (this.pairs[i].fst > this.pairs[i].snd && source[this.pairs[i].fst].value > source[this.pairs[i].snd].value);
                this.flags[i] = flag;
            }

            times = await this.parallelRender(source, length, times, callback);            
            [completed, times, start, final] = await this.check(source, lhs, rhs, 'descent', times, callback);
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
                await this._service.swap(source, this.pairs[i].fst, this.pairs[i].snd);

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

            await this._service.swapAndRender(source, false, true, i, j, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, times, callback);

            times += 1;
        }

        await delay();
        await this.complete(source, times, callback);
    }

    protected override async sortByDescent(source: SortDataModel[], lhs: number, rhs: number, option: string | number | undefined, callback: (parram: SortStateModel) => void): Promise<void> {
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

            await this._service.swapAndRender(source, false, true, i, j, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, times, callback);

            times += 1;
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
        let j: number, k: number, start: number = lhs, final: number = rhs, completed: boolean = false, flag: boolean, times: number = 0;

        while (!completed) {
            for (let i = start; i <= final; i++) {
                j = random(i, final, false);
                k = Math.min(j + 1, rhs);
                flag = source[k].value < source[j].value;

                source[i].color = ACCENT_COLOR;
                callback({ times, datalist: source });

                [completed, times] = await this._service.swapAndRender(source, completed, flag, j, k, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, times, callback);

                source[i].color = CLEAR_COLOR;
                callback({ times, datalist: source });
            }

            [completed, times, start, final] = await this.check(source, lhs, rhs, 'ascent', times, callback);
        }

        await delay();
        await this.complete(source, times, callback);
    }

    protected override async sortByDescent(source: SortDataModel[], lhs: number, rhs: number, option: string | number | undefined, callback: (param: SortStateModel) => void): Promise<void> {
        let j: number, k: number, start: number = lhs, final: number = rhs, completed: boolean = false, flag: boolean, times: number = 0;

        while (!completed) {
            for (let i = final; i >= start; i--) {
                j = random(start, i, false);
                k = Math.max(j - 1, lhs);
                flag = source[k].value < source[j].value;

                source[i].color = ACCENT_COLOR;
                callback({ times, datalist: source });

                [completed, times] = await this._service.swapAndRender(source, completed, flag, j, k, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, times, callback);

                source[i].color = CLEAR_COLOR;
                callback({ times, datalist: source });
            }

            [completed, times, start, final] = await this.check(source, lhs, rhs, 'descent', times, callback);
        }

        await delay();
        await this.complete(source, times, callback);
    }

}

/**
 * 猴子冒泡排序（双向）
 */
@Injectable()
export class ShakerBubbleBogoSortService extends BubbleBogoSortService {

    protected override async sortByAscent(source: SortDataModel[], lhs: number, rhs: number, option: string | number | undefined, callback: (param: SortStateModel) => void): Promise<void> {
        let j: number, k: number, start: number = lhs, final: number = rhs, completed: boolean = false, flag: boolean, times: number = 0;

        while (!completed) {
            for (let i = start; i <= final; i++) {
                j = random(i, final, false);
                k = Math.min(j + 1, rhs);
                flag = source[k].value < source[j].value;

                source[i].color = ACCENT_ONE_COLOR;
                callback({ times, datalist: source });

                [completed, times] = await this._service.swapAndRender(source, completed, flag, j, k, PRIMARY_ONE_COLOR, SECONDARY_ONE_COLOR, ACCENT_ONE_COLOR, times, callback);

                source[i].color = CLEAR_COLOR;
                callback({ times, datalist: source });
            }

            for (let i = final; i >= start; i--) {
                j = random(start, i, false);
                k = Math.max(j - 1, lhs);
                flag = source[k].value > source[j].value;

                source[i].color = ACCENT_TWO_COLOR;
                callback({ times, datalist: source });

                [completed, times] = await this._service.swapAndRender(source, completed, flag, j, k, PRIMARY_TWO_COLOR, SECONDARY_TWO_COLOR, ACCENT_TWO_COLOR, times, callback);

                source[i].color = CLEAR_COLOR;
                callback({ times, datalist: source });
            }

            [completed, times, start, final] = await this.check(source, lhs, rhs, 'ascent', times, callback);
        }

        await delay();
        await this.complete(source, times, callback);
    }

    protected override async sortByDescent(source: SortDataModel[], lhs: number, rhs: number, option: string | number | undefined, callback: (parram: SortStateModel) => void): Promise<void> {
        let j: number, k: number, start: number = lhs, final: number = rhs, completed: boolean = false, flag: boolean, times: number = 0;

        while (!completed) {
            for (let i = final; i >= start; i--) {
                j = random(start, i, false);
                k = Math.max(j - 1, lhs);
                flag = source[k].value < source[j].value;

                source[i].color = ACCENT_ONE_COLOR;
                callback({ times, datalist: source });

                [completed, times] = await this._service.swapAndRender(source, completed, flag, j, k, PRIMARY_ONE_COLOR, SECONDARY_ONE_COLOR, ACCENT_ONE_COLOR, times, callback);

                source[i].color = CLEAR_COLOR;
                callback({ times, datalist: source });
            }

            for (let i = start; i <= final; i++) {
                j = random(i, final, false);
                k = Math.min(j + 1, rhs);
                flag = source[k].value > source[j].value;

                source[i].color = ACCENT_TWO_COLOR;
                callback({ times, datalist: source });

                [completed, times] = await this._service.swapAndRender(source, completed, flag, j, k, PRIMARY_TWO_COLOR, SECONDARY_TWO_COLOR, ACCENT_TWO_COLOR, times, callback);

                source[i].color = CLEAR_COLOR;
                callback({ times, datalist: source });
            }

            [completed, times, start, final] = await this.check(source, lhs, rhs, 'descent', times, callback);
        }

        await delay();
        await this.complete(source, times, callback);
    }

}

/**
 * 猴子插入排序
 */
@Injectable()
export class InsertionBogoSortService extends BogoSortService {

    protected override async sortByAscent(source: SortDataModel[], lhs: number, rhs: number, option: string | number | undefined, callback: (param: SortStateModel) => void): Promise<void> {
        let i: number, start: number = lhs, final: number = rhs, completed: boolean = false, flag: boolean, times: number = 0;
        
        while (!completed) {
            i = random(start, final, false);

            flag = source[Math.min(i + 1, rhs)].value >= source[i].value;

            if (flag) {
                times = await this.render(source, i, i, ACCENT_COLOR, ACCENT_COLOR, times, callback);
            } else {
                for (let j = i; j < rhs && source[j + 1].value < source[j].value; j++) {
                    source[i].color = ACCENT_COLOR;
                    callback({ times, datalist: source });
    
                    [completed, times] = await this._service.swapAndRender(source, false, true, j, j + 1, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, times, callback);
                }
                
                source[i].color = CLEAR_COLOR;
                callback({ times, datalist: source });
            }

            flag = source[Math.max(i - 1, lhs)].value <= source[i].value;

            if (flag) {
                times = await this.render(source, i, i, ACCENT_COLOR, ACCENT_COLOR, times, callback);
            } else {
                for (let j = i; j > lhs && source[j - 1].value > source[j].value; j--) {
                    source[i].color = ACCENT_COLOR;
                    callback({ times, datalist: source });
    
                    [completed, times] = await this._service.swapAndRender(source, false, true, j, j - 1, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, times, callback);
                }
                
                source[i].color = CLEAR_COLOR;
                callback({ times, datalist: source });
            }

            [completed, times, start, final] = await this.check(source, lhs, rhs, 'ascent', times, callback);
        }

        await delay();
        await this.complete(source, times, callback);
    }

    protected override async sortByDescent(source: SortDataModel[], lhs: number, rhs: number, option: string | number | undefined, callback: (parram: SortStateModel) => void): Promise<void> {
        let i: number, start: number = lhs, final: number = rhs, completed: boolean = false, flag: boolean, times: number = 0;
        
        while (!completed) {
            i = random(start, final, false);

            flag = source[Math.min(i + 1, rhs)].value <= source[i].value;

            if (flag) {
                times = await this.render(source, i, i, ACCENT_COLOR, ACCENT_COLOR, times, callback);
            } else {
                for (let j = i; j < rhs && source[j + 1].value > source[j].value; j++) {
                    source[i].color = ACCENT_COLOR;
                    callback({ times, datalist: source });
    
                    [completed, times] = await this._service.swapAndRender(source, false, true, j, j + 1, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, times, callback);
                }
                
                source[i].color = CLEAR_COLOR;
                callback({ times, datalist: source });
            }

            flag = source[Math.max(i - 1, lhs)].value >= source[i].value;

            if (flag) {
                times = await this.render(source, i, i, ACCENT_COLOR, ACCENT_COLOR, times, callback);
            } else {
                for (let j = i; j > lhs && source[j - 1].value < source[j].value; j--) {
                    source[i].color = ACCENT_COLOR;
                    callback({ times, datalist: source });
    
                    [completed, times] = await this._service.swapAndRender(source, false, true, j, j - 1, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, times, callback);
                }
                
                source[i].color = CLEAR_COLOR;
                callback({ times, datalist: source });
            }

            [completed, times, start, final] = await this.check(source, lhs, rhs, 'descent', times, callback);
        }

        await delay();
        await this.complete(source, times, callback);
    }

}

/**
 * 猴子选择排序（单向）
 */
@Injectable()
export class SelectionBogoSortService extends BogoSortService {

    protected override async sortByAscent(source: SortDataModel[], lhs: number, rhs: number, option: string | number | undefined, callback: (param: SortStateModel) => void): Promise<void> {
        let i: number, k: number, start: number = lhs, final: number = rhs, completed: boolean = false, flag: boolean, times: number = 0;
        
        while (!completed) {
            i = random(start, final, false);
            k = i;

            for (let j = i + 1; j <= rhs; j++) {
                source[i].color = PRIMARY_COLOR;
                source[j].color = SECONDARY_COLOR;
                source[k].color = ACCENT_COLOR;
                callback({ times, datalist: source });

                await delay();

                if (source[j].value < source[k].value) {
                    source[k].color = CLEAR_COLOR;
                    k = j;
                }

                source[i].color = PRIMARY_COLOR;
                source[j].color = CLEAR_COLOR;
                source[k].color = ACCENT_COLOR;
                callback({ times, datalist: source });
            }

            [completed, times] = await this._service.swapAndRender(source, false, k !== i, i, k, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, times, callback);
            [completed, times, start, final] = await this.check(source, lhs, rhs, 'ascent', times, callback);
        }

        await delay();
        await this.complete(source, times, callback);
    }

    protected override async sortByDescent(source: SortDataModel[], lhs: number, rhs: number, option: string | number | undefined, callback: (parram: SortStateModel) => void): Promise<void> {
        let i: number, k: number, start: number = lhs, final: number = rhs, completed: boolean = false, flag: boolean, times: number = 0;
        
        while (!completed) {
            i = random(start, final, false);
            k = i;

            for (let j = i - 1; j >= lhs; j--) {
                source[i].color = PRIMARY_COLOR;
                source[j].color = SECONDARY_COLOR;
                source[k].color = ACCENT_COLOR;
                callback({ times, datalist: source });

                await delay();

                if (source[j].value < source[k].value) {
                    source[k].color = CLEAR_COLOR;
                    k = j;
                }

                source[i].color = PRIMARY_COLOR;
                source[j].color = CLEAR_COLOR;
                source[k].color = ACCENT_COLOR;
                callback({ times, datalist: source });
            }

            [completed, times] = await this._service.swapAndRender(source, false, k !== i, i, k, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, times, callback);
            [completed, times, start, final] = await this.check(source, lhs, rhs, 'descent', times, callback);
        }

        await delay();
        await this.complete(source, times, callback);
    }

}

/**
 * 猴子选择排序（双向）
 */
@Injectable()
export class ShakerSelectionBogoSortService extends SelectionBogoSortService {

    protected override async sortByAscent(source: SortDataModel[], lhs: number, rhs: number, option: string | number | undefined, callback: (param: SortStateModel) => void): Promise<void> {
        let i: number, k: number, start: number = lhs, final: number = rhs, completed: boolean = false, flag: boolean, times: number = 0;
        
        while (!completed) {
            i = random(start, final, false);
            k = i;

            for (let j = i + 1; j <= rhs; j++) {
                source[i].color = PRIMARY_ONE_COLOR;
                source[j].color = SECONDARY_ONE_COLOR;
                source[k].color = ACCENT_ONE_COLOR;
                callback({ times, datalist: source });

                await delay();

                if (source[j].value < source[k].value) {
                    source[k].color = CLEAR_COLOR;
                    k = j;
                }

                source[i].color = PRIMARY_ONE_COLOR;
                source[j].color = CLEAR_COLOR;
                source[k].color = ACCENT_ONE_COLOR;
                callback({ times, datalist: source });
            }

            [completed, times] = await this._service.swapAndRender(source, false, k !== i, i, k, PRIMARY_ONE_COLOR, SECONDARY_ONE_COLOR, ACCENT_ONE_COLOR, times, callback);

            i = random(start, final, false);
            k = i;

            for (let j = i - 1; j >= lhs; j--) {
                source[i].color = PRIMARY_TWO_COLOR;
                source[j].color = SECONDARY_TWO_COLOR;
                source[k].color = ACCENT_TWO_COLOR;
                callback({ times, datalist: source });

                await delay();

                if (source[j].value > source[k].value) {
                    source[k].color = CLEAR_COLOR;
                    k = j;
                }

                source[i].color = PRIMARY_TWO_COLOR;
                source[j].color = CLEAR_COLOR;
                source[k].color = ACCENT_TWO_COLOR;
                callback({ times, datalist: source });
            }

            [completed, times] = await this._service.swapAndRender(source, false, k !== i, i, k, PRIMARY_TWO_COLOR, SECONDARY_TWO_COLOR, ACCENT_TWO_COLOR, times, callback);
            [completed, times, start, final] = await this.check(source, lhs, rhs, 'ascent', times, callback);
        }

        await delay();
        await this.complete(source, times, callback);
    }

    protected override async sortByDescent(source: SortDataModel[], lhs: number, rhs: number, option: string | number | undefined, callback: (parram: SortStateModel) => void): Promise<void> {
        let i: number, k: number, start: number = lhs, final: number = rhs, completed: boolean = false, flag: boolean, times: number = 0;
        
        while (!completed) {
            i = random(start, final, false);
            k = i;

            for (let j = i - 1; j >= lhs; j--) {
                source[i].color = PRIMARY_ONE_COLOR;
                source[j].color = SECONDARY_ONE_COLOR;
                source[k].color = ACCENT_ONE_COLOR;
                callback({ times, datalist: source });

                await delay();

                if (source[j].value < source[k].value) {
                    source[k].color = CLEAR_COLOR;
                    k = j;
                }

                source[i].color = PRIMARY_ONE_COLOR;
                source[j].color = CLEAR_COLOR;
                source[k].color = ACCENT_ONE_COLOR;
                callback({ times, datalist: source });
            }

            [completed, times] = await this._service.swapAndRender(source, false, k !== i, i, k, PRIMARY_ONE_COLOR, SECONDARY_ONE_COLOR, ACCENT_ONE_COLOR, times, callback);

            i = random(start, final, false);
            k = i;

            for (let j = i + 1; j <= rhs; j++) {
                source[i].color = PRIMARY_TWO_COLOR;
                source[j].color = SECONDARY_TWO_COLOR;
                source[k].color = ACCENT_TWO_COLOR;
                callback({ times, datalist: source });

                await delay();

                if (source[j].value > source[k].value) {
                    source[k].color = CLEAR_COLOR;
                    k = j;
                }

                source[i].color = PRIMARY_TWO_COLOR;
                source[j].color = CLEAR_COLOR;
                source[k].color = ACCENT_TWO_COLOR;
                callback({ times, datalist: source });
            }

            [completed, times] = await this._service.swapAndRender(source, false, k !== i, i, k, PRIMARY_TWO_COLOR, SECONDARY_TWO_COLOR, ACCENT_TWO_COLOR, times, callback);
            [completed, times, start, final] = await this.check(source, lhs, rhs, 'descent', times, callback);
        }

        await delay();
        await this.complete(source, times, callback);
    }

}

@Injectable()
export class MergeBogoSortService extends BogoSortService {

    protected override async sortByAscent(source: SortDataModel[], lhs: number, rhs: number, option: string | number | undefined, callback: (param: SortStateModel) => void): Promise<void> {
        let completed: boolean = false, start: number = lhs, final: number = rhs, times: number = 0;

        while (!completed) {
            times = await this.sortByOrder(source, start, final, 'ascent', times, callback);
            [completed, times, start, final] = await this.check(source, lhs, rhs, 'ascent', times, callback);
        }

        await delay();
        await this.complete(source, times, callback);
    }

    protected override async sortByDescent(source: SortDataModel[], lhs: number, rhs: number, option: string | number | undefined, callback: (param: SortStateModel) => void): Promise<void> {
        let completed: boolean = false, start: number = lhs, final: number = rhs, times: number = 0;

        while (!completed) {
            times = await this.sortByOrder(source, start, final, 'descent', times, callback);
            [completed, times, start, final] = await this.check(source, lhs, rhs, 'descent', times, callback);
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
            times = await this.render(source, i, j, PRIMARY_COLOR, SECONDARY_COLOR, times, callback);
            times += 1;

            if (this.COIN_FLAG()) {
                this.array.push(source[i].value);
                i += 1;
            } else {
                this.array.push(source[j].value);
                j += 1;
            }
        }

        while (i <= mid) {
            times = await this.render(source, i, i, PRIMARY_COLOR, PRIMARY_COLOR, times, callback);
            times += 1;

            this.array.push(source[i].value);
            i += 1;
        }

        while (j <= rhs) {
            times = await this.render(source, j, j, SECONDARY_COLOR, SECONDARY_COLOR, times, callback);
            times += 1;

            this.array.push(source[j].value);
            j += 1;
        }

        for (let k = lhs; this.array.length > 0; k++) {
            source[k].value = this.array.shift() as number;

            times = await this.render(source, k, k, ACCENT_COLOR, ACCENT_COLOR, times, callback);
            times += 1;
        }

        return times;
    }
    

    private async mergeByDescent(source: SortDataModel[], lhs: number, mid: number, rhs: number, times: number, callback: (param: SortStateModel) => void): Promise<number> {
        let i: number = mid, j: number = rhs;

        while (i >= lhs && j >= mid + 1) {
            times = await this.render(source, i, j, PRIMARY_COLOR, SECONDARY_COLOR, times, callback);
            times += 1;

            if (this.COIN_FLAG()) {
                this.array.push(source[i].value);
                i -= 1;
            } else {
                this.array.push(source[j].value);
                j -= 1;
            }
        }

        while (i >= lhs) {
            times = await this.render(source, i, i, PRIMARY_COLOR, PRIMARY_COLOR, times, callback);
            times += 1;

            this.array.push(source[i].value);
            i -= 1;
        }

        while (j >= mid + 1) {
            times = await this.render(source, j, j, SECONDARY_COLOR, SECONDARY_COLOR, times, callback);
            times += 1;

            this.array.push(source[j].value);
            j -= 1;
        }

        for (let k = rhs; this.array.length > 0; k--) {
            source[k].value = this.array.shift() as number;

            times = await this.render(source, k, k, ACCENT_COLOR, ACCENT_COLOR, times, callback);
            times += 1;
        }

        return times;
    }
    
}