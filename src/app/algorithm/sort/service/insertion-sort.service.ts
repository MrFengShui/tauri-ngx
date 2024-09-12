import { Injectable } from "@angular/core";
import { floor } from "lodash";

import { ACCENT_ONE_COLOR, ACCENT_TWO_COLOR, delay, PRIMARY_ONE_COLOR, PRIMARY_TWO_COLOR, SECONDARY_ONE_COLOR, SECONDARY_TWO_COLOR } from "../../../public/global.utils";
import { ACCENT_COLOR, CLEAR_COLOR, FINAL_COLOR, PRIMARY_COLOR, SECONDARY_COLOR, START_COLOR } from "../../../public/global.utils";

import { SortDataModel, SortStateModel, SortOrder, SortIndexRange } from "../ngrx-store/sort.state";

import { AbstractDistributionSortService, AbstractInsertionSortService, AbstractSortService } from "./base-sort.service";

/**
 * 侏儒排序
 */
@Injectable()
export class GnomeSortService extends AbstractInsertionSortService {

    protected override async sortByAscent(source: SortDataModel[], lhs: number, rhs: number, option: string | number | undefined, callback: (param: SortStateModel) => void): Promise<void> {
        let i: number, j: number, completed: boolean, flag: boolean, times: number = 0;
 
        for (let k = lhs + 1; k <= rhs; k++) {
            i = k;

            while (true) {
                j = Math.max(i - 1, lhs);
                flag = source[j].value > source[i].value;
                
                source[k].color = ACCENT_COLOR;
                callback({ times, datalist: source });

                [completed, times] = await this._service.swapAndRender(source, false, flag, i, j, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, times, callback);

                source[k].color = ACCENT_COLOR;
                callback({ times, datalist: source });
    
                i = flag ? i - 1 : i + 1;
                
                if (i >= k) break;
            }
            
            source[k].color = CLEAR_COLOR;
            callback({ times, datalist: source });
        }

        await delay();
        await this.complete(source, times, callback);
    }

    protected override async sortByDescent(source: SortDataModel[], lhs: number, rhs: number, option: string | number | undefined, callback: (param: SortStateModel) => void): Promise<void> {
        let i: number, j: number, completed: boolean, flag: boolean, times: number = 0;
 
        for (let k = rhs - 1; k >= lhs; k--) {
            i = k;

            while (true) {
                j = Math.min(i + 1, rhs);
                flag = source[j].value > source[i].value;
                
                source[k].color = ACCENT_COLOR;
                callback({ times, datalist: source });

                [completed, times] = await this._service.swapAndRender(source, false, flag, i, j, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, times, callback);

                source[k].color = ACCENT_COLOR;
                callback({ times, datalist: source });
    
                i = flag ? i + 1 : i - 1;
                
                if (i <= k) break;
            }
            
            source[k].color = CLEAR_COLOR;
            callback({ times, datalist: source });
        }

        await delay();
        await this.complete(source, times, callback);
    }

    protected override sortByOrder(source: SortDataModel[], lhs: number, rhs: number, gap: number, step: number, primaryColor: string, secondaryColor: string, accentColor: string, order: SortOrder, times: number, callback: (param: SortStateModel) => void): Promise<number> {
        throw new Error("Method not implemented.");
    }

    protected override insertByAscent(source: SortDataModel[], lhs: number, rhs: number, gap: number, primaryColor: string, secondaryColor: string, accentColor: string, times: number, callback: (param: SortStateModel) => void): Promise<number> {
        throw new Error("Method not implemented.");
    }

    protected override insertByDescent(source: SortDataModel[], lhs: number, rhs: number, gap: number, primaryColor: string, secondaryColor: string, accentColor: string, times: number, callback: (param: SortStateModel) => void): Promise<number> {
        throw new Error("Method not implemented.");
    }

}

/**
 * 插入排序
 */
@Injectable()
export class InsertionSortService extends GnomeSortService {

    protected override async sortByAscent(source: SortDataModel[], lhs: number, rhs: number, option: string | number | undefined, callback: (param: SortStateModel) => void): Promise<void> {
        let times: number = await this.sortByOrder(source, lhs, rhs, 1, 1, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, 'ascent', 0, callback);

        await delay();
        await this.complete(source, times, callback);
    }

    protected override async sortByDescent(source: SortDataModel[], lhs: number, rhs: number, option: string | number | undefined, callback: (param: SortStateModel) => void): Promise<void> {
        let times: number = await this.sortByOrder(source, lhs, rhs, 1, 1, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, 'descent', 0, callback);

        await delay();
        await this.complete(source, times, callback);
    }

    public override async sortByOrder(source: SortDataModel[], lhs: number, rhs: number, gap: number, step: number, primaryColor: string, secondaryColor: string, accentColor: string, order: SortOrder, times: number, callback: (param: SortStateModel) => void): Promise<number> {
        if (order === 'ascent') {
            for (let i = lhs + gap; i <= rhs; i += step) {
                times = await this.insertByAscent(source, lhs, i, gap, primaryColor, secondaryColor, accentColor, times, callback);
                times = await this.sweep(source, i, accentColor, times, callback);
            }
        }

        if (order === 'descent') {
            for (let i = rhs - gap; i >= lhs; i -= step) {
                times = await this.insertByDescent(source, i, rhs, gap, primaryColor, secondaryColor, accentColor, times, callback);
                times = await this.sweep(source, i, accentColor, times, callback);
            }
        }

        return times;
    }

    protected override async insertByAscent(source: SortDataModel[], lhs: number, rhs: number, gap: number, primaryColor: string, secondaryColor: string, accentColor: string, times: number, callback: (param: SortStateModel) => void): Promise<number> {
        for (let j = rhs - gap; j >= lhs && source[j].value > source[j + gap].value; j -= gap) {
            source[rhs].color = accentColor;
            callback({ times, datalist: source });

            times = await this.exchange(source, true, j, j + gap, primaryColor, secondaryColor, accentColor, times, callback);
        }
        
        return times;
    }

    protected override async insertByDescent(source: SortDataModel[], lhs: number, rhs: number, gap: number, primaryColor: string, secondaryColor: string, accentColor: string, times: number, callback: (param: SortStateModel) => void): Promise<number> {
        for (let j = lhs + gap; j <= rhs && source[j].value > source[j - gap].value; j += gap) {
            source[lhs].color = ACCENT_COLOR;
            callback({ times, datalist: source });

            times = await this.exchange(source, true, j, j - gap, primaryColor, secondaryColor, accentColor, times, callback);
        }
        
        return times;
    }

}

/**
 * 插入排序（双向）
 */
@Injectable()
export class ShakerInsertionSortService extends InsertionSortService {

    protected override async sortByAscent(source: SortDataModel[], lhs: number, rhs: number, option: string | number | undefined, callback: (param: SortStateModel) => void): Promise<void> {
        let start: number = floor((rhs - lhs) * 0.5 + lhs, 0), final: number = start, times: number = 0;

        while (true) {
            for (let i = final; i > start && source[i - 1].value > source[i].value; i--) {
                source[start].color = START_COLOR;
                source[final].color = FINAL_COLOR;
                callback({ times, datalist: source });

                times = await this.exchange(source, true, i, i - 1, PRIMARY_ONE_COLOR, SECONDARY_ONE_COLOR, ACCENT_ONE_COLOR, times, callback);
            }

            source[start].color = CLEAR_COLOR;
            source[final].color = CLEAR_COLOR;
            callback({ times, datalist: source });

            if (start === lhs && final === rhs) break;

            start = Math.max(start - 1, lhs);

            for (let i = start; i < final && source[i + 1].value < source[i].value; i++) {
                source[start].color = START_COLOR;
                source[final].color = FINAL_COLOR;
                callback({ times, datalist: source });

                times = await this.exchange(source, true, i, i + 1, PRIMARY_TWO_COLOR, SECONDARY_TWO_COLOR, ACCENT_TWO_COLOR, times, callback);
            }

            source[start].color = CLEAR_COLOR;
            source[final].color = CLEAR_COLOR;
            callback({ times, datalist: source });
            
            final = Math.min(final + 1, rhs);
        }

        await delay();
        await this.complete(source, times, callback);
    }

    protected override async sortByDescent(source: SortDataModel[], lhs: number, rhs: number, option: string | number | undefined, callback: (param: SortStateModel) => void): Promise<void> {
        let start: number = floor((rhs - lhs) * 0.5 + lhs, 0), final: number = start, times: number = 0;

        while (true) {
            for (let i = start; i < final && source[i + 1].value > source[i].value; i++) {
                source[start].color = START_COLOR;
                source[final].color = FINAL_COLOR;
                callback({ times, datalist: source });

                times = await this.exchange(source, true, i, i + 1, PRIMARY_TWO_COLOR, SECONDARY_TWO_COLOR, ACCENT_TWO_COLOR, times, callback);
            }

            source[start].color = CLEAR_COLOR;
            source[final].color = CLEAR_COLOR;
            callback({ times, datalist: source });

            if (start === lhs && final === rhs) break;

            final = Math.min(final + 1, rhs);
            
            for (let i = final; i > start && source[i - 1].value < source[i].value; i--) {
                source[start].color = START_COLOR;
                source[final].color = FINAL_COLOR;
                callback({ times, datalist: source });

                times = await this.exchange(source, true, i, i - 1, PRIMARY_ONE_COLOR, SECONDARY_ONE_COLOR, ACCENT_ONE_COLOR, times, callback);
            }

            source[start].color = CLEAR_COLOR;
            source[final].color = CLEAR_COLOR;
            callback({ times, datalist: source });

            start = Math.max(start - 1, lhs);
        }

        await delay();
        await this.complete(source, times, callback);
    }

}

/**
 * 二分插入排序
 */
@Injectable()
export class BinaryInserionSortService extends InsertionSortService {

    protected override async sortByAscent(source: SortDataModel[], lhs: number, rhs: number, option: string | number | undefined, callback: (param: SortStateModel) => void): Promise<void> {
        let threshold: number, k: number, completed: boolean, times: number = 0;

        for (let i = lhs + 1; i <= rhs; i++) {
            threshold = this._service.indexOfFGTByAscent(source, source[i].value, lhs, i - 1);
            
            if (threshold === -1) continue;

            source[threshold].color = ACCENT_COLOR;
            callback({ times, datalist: source });

            times = await this.insertByAscent(source, threshold, i, 1, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, times, callback);
            times = await this.sweep(source, i, ACCENT_COLOR, times, callback);
        }

        await delay();
        await this.complete(source, times, callback);
    }

    protected override async sortByDescent(source: SortDataModel[], lhs: number, rhs: number, option: string | number | undefined, callback: (param: SortStateModel) => void): Promise<void> {
        let threshold: number, k: number, completed: boolean, times: number = 0;

        for (let i = rhs - 1; i >= lhs; i--) {
            threshold = this._service.indexOfFGTByDescent(source, source[i].value, i + 1, rhs);
            
            if (threshold === -1) continue;
            
            source[threshold].color = ACCENT_COLOR;
            callback({ times, datalist: source });

            times = await this.insertByDescent(source, i, threshold, 1, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, times, callback);
            times = await this.sweep(source, i, ACCENT_COLOR, times, callback);
        }

        await delay();
        await this.complete(source, times, callback);
    }

}

/**
 * 希尔排序
 */
@Injectable()
export class ShellSortService extends InsertionSortService {

    protected override async sortByAscent(source: SortDataModel[], lhs: number, rhs: number, option: string | number | undefined, callback: (param: SortStateModel) => void): Promise<void> {
        let times: number = 0;

        for (let gap = (rhs - lhs + 1) >> 1; gap > 0; gap >>= 1) {
            times = await this.sortByOrder(source, lhs, rhs, gap, 1, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, 'ascent', times, callback);
        }
        
        await delay();
        await this.complete(source, times, callback);
    }

    protected override async sortByDescent(source: SortDataModel[], lhs: number, rhs: number, option: string | number | undefined, callback: (param: SortStateModel) => void): Promise<void> {
        let times: number = 0;

        for (let gap = (rhs - lhs + 1) >> 1; gap > 0; gap >>= 1) {
            times = await this.sortByOrder(source, lhs, rhs, gap, 1, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, 'descent', times, callback);
        }

        await delay();
        await this.complete(source, times, callback);
    }

}

/**
 * 图书馆排序
 */
@Injectable()
export class LibrarySortService extends AbstractDistributionSortService<SortDataModel> {

    protected readonly BLANKS: number = 4;

    protected rmdRange: SortIndexRange = { start: -1, final: -1 };
    protected bsRange: SortIndexRange = { start: -1, final: -1 };
    protected threshold: number = -1;

    protected override async sortByAscent(source: SortDataModel[], lhs: number, rhs: number, option: string | number | undefined, callback: (param: SortStateModel) => void): Promise<void> {
        let times: number = 0;

        this.threshold = lhs;

        while (this.threshold < rhs) {
            times = await this.save(source, lhs, rhs, 'ascent', times, callback);
            times = await this.load(source, lhs, rhs, 'ascent', times, callback);
        }

        await delay();
        await this.complete(source, times, callback);
    }

    protected override async sortByDescent(source: SortDataModel[], lhs: number, rhs: number, option: string | number | undefined, callback: (param: SortStateModel) => void): Promise<void> {
        let times: number = 0;

        this.threshold = rhs;

        while (this.threshold > lhs) {
            times = await this.save(source, lhs, rhs, 'descent', times, callback);
            times = await this.load(source, lhs, rhs, 'descent', times, callback);
        }
        
        await delay();
        await this.complete(source, times, callback);
    }
    
    protected override async save(source: SortDataModel[], lhs: number, rhs: number, order: SortOrder, times: number, callback: (param: SortStateModel) => void): Promise<number> {
        if (order === 'ascent') {
            for (let length = source.length, i = 0; i <= length - 1; i++) {
                if (i <= this.threshold) {
                    for (let k = 0; k < this.BLANKS; k++) {
                        this.array.push({ color: CLEAR_COLOR, value: 0 });
                    }
                }
    
                this.array.push({ color: source[i].color, value: source[i].value });
                
                times = await this.render(source, i, i, ACCENT_ONE_COLOR, ACCENT_ONE_COLOR, times, callback);
                times += 1;
            }
        }
        
        if (order === 'descent') {
            for (let length = source.length, i = length - 1; i >= 0; i--) {
                if (i >= this.threshold) {
                    for (let k = 0; k < this.BLANKS; k++) {
                        this.array.unshift({ color: CLEAR_COLOR, value: 0 });
                    }
                }
    
                this.array.unshift({ color: source[i].color, value: source[i].value });
                
                times = await this.render(source, i, i, ACCENT_ONE_COLOR, ACCENT_ONE_COLOR, times, callback);
                times += 1;
            }
        }
        
        return times;
    }

    protected override async load(source: SortDataModel[], lhs: number, rhs: number, order: SortOrder, times: number, callback: (param: SortStateModel) => void): Promise<number> {
        let index: number, value: number;
        
        if (order === 'ascent') {
            this.rmdRange = { start: this.BLANKS * this.threshold + this.BLANKS + this.threshold + 1, final: this.array.length - 1 };
            this.bsRange = { start: 0, final: this.threshold };
            times = await this.insertByAscent(source, this.rmdRange.final, times, callback);

            index = 0;
            
            while (this.array.length > 0) {
                value = (this.array.shift() as SortDataModel).value;

                if (value !== 0) {
                    source[index].value = value;

                    times = await this.render(source, index, index, ACCENT_TWO_COLOR, ACCENT_TWO_COLOR, times, callback);
                    times += 1;
                    index += 1;
                }
            }
        }
        
        if (order === 'descent') {
            this.rmdRange = { start: 0, final: this.threshold - 1 };
            this.bsRange = { start: this.threshold, final: source.length - 1 };
            times = await this.insertByDescent(source, this.rmdRange.start, times, callback);

            index = source.length - 1;
            
            while (this.array.length > 0) {
                value = (this.array.pop() as SortDataModel).value;

                if (value !== 0) {
                    source[index].value = value;

                    times = await this.render(source, index, index, ACCENT_TWO_COLOR, ACCENT_TWO_COLOR, times, callback);
                    times += 1;
                    index -= 1;
                }
            }
        }

        return times;
    }

    private async insertByAscent(source: SortDataModel[], threshold: number, times: number, callback: (param: SortStateModel) => void): Promise<number> {
        let start: number, final: number, index: number, flag: boolean;
         
        for (let i = this.rmdRange.start; i <= this.rmdRange.final; i++) {
            index = this._service.indexOfFGTByAscent(source, this.array[i].value, this.bsRange.start, this.bsRange.final);
            
            times = await this.renderWithDuration(this.array, i, i, ACCENT_COLOR, ACCENT_COLOR, 100, times, callback);

            if (index === -1) {
                this.threshold = i - this.threshold * this.BLANKS - this.BLANKS;
                break;
            }

            final = index * this.BLANKS + index + this.BLANKS;
            start = final - this.BLANKS;
            flag = true;

            for (let j = final - 1; j >= start; j--) {
                if (this.array[j].value === 0) {
                    flag = j === start;
                    index = j;
                    break;
                }
            }

            await this._service.swapAndRender(this.array, false, true, i, index, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, times, callback);

            times = await this._service.stableGapSortByAscent(this.array, start, final, 1, 1, times, callback);
            times += 1;

            if (i === threshold) {
                this.threshold = threshold;
                break;
            }

            if (flag) {
                this.threshold = i - this.threshold * this.BLANKS - this.BLANKS;
                break;
            }
        }
        
        return times;
    }

    private async insertByDescent(source: SortDataModel[], threshold: number, times: number, callback: (param: SortStateModel) => void): Promise<number> {
        let start: number, final: number, index: number, flag: boolean;
        
        for (let i = this.rmdRange.final; i >= this.rmdRange.start; i--) {
            index = this._service.indexOfFGTByDescent(source, this.array[i].value, this.bsRange.start, this.bsRange.final);
            
            times = await this.renderWithDuration(this.array, i, i, ACCENT_COLOR, ACCENT_COLOR, 100, times, callback);

            if (index === -1) {
                this.threshold = i;
                break;
            }

            start = index + this.BLANKS * index - this.BLANKS * this.bsRange.start;
            final = start + this.BLANKS;
            flag = true;
            
            for (let j = start + 1; j <= final; j++) {
                if (this.array[j].value === 0) {
                    flag = j === final;
                    index = j;
                    break;
                }
            }

            await this._service.swapAndRender(this.array, false, true, i, index, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, times, callback);

            times = await this._service.stableGapSortByDescent(this.array, start, final, 1, 1, times, callback);
            times += 1;

            if (i === threshold) {
                this.threshold = threshold;
                break;
            }

            if (flag) {
                this.threshold = i;
                break;
            }
        }
    
        return times;
    }

}

@Injectable()
export class OptimalLibrarySortService extends LibrarySortService {

    protected override async save(source: SortDataModel[], lhs: number, rhs: number, order: SortOrder, times: number, callback: (param: SortStateModel) => void): Promise<number> {
        let minValue: number, maxValue: number;

        if (order === 'ascent') {
            this.rmdRange = { 
                ...this.rmdRange, 
                start: this.threshold + 1, 
                final: Math.min(this.threshold + 16, source.length - 1) 
            };

            [minValue, maxValue] = this._service.findMinMaxValue(source, this.rmdRange.start, this.rmdRange.final);

            this.bsRange = {
                start: this._service.indexOfFGTByAscent(source, minValue, 0, this.threshold),
                final: this._service.indexOfFGTByAscent(source, maxValue, 0, this.threshold)
            };
        }

        if (order === 'descent') {

        }

        return times;
    }

    protected override async load(source: SortDataModel[], lhs: number, rhs: number, order: SortOrder, times: number, callback: (param: SortStateModel) => void): Promise<number> {
        if (order === 'ascent') {

        }

        if (order === 'descent') {

        }
        
        return times;
    }

}