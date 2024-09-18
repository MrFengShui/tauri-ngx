import { Injectable } from "@angular/core";

import { SortDataModel, SortOrder, SortStateModel } from "../ngrx-store/sort.state";

import { ACCENT_COLOR, ACCENT_ONE_COLOR, ACCENT_TWO_COLOR, delay, FINAL_COLOR, PRIMARY_COLOR, SECONDARY_COLOR, START_COLOR } from "../../../public/global.utils";

import { AbstractComparisonSortService, AbstractDistributionSortService } from "./base-sort.service";
import { SortToolsService } from "../ngrx-store/sort.service";
import { InsertionSortService } from "./insertion-sort.service";

/**
 * 斯大林排序
 */
@Injectable()
export class StalinSortService extends AbstractDistributionSortService<number> {

    constructor(
        protected override _service: SortToolsService,
        protected _insertSortService: InsertionSortService
    ) {
        super(_service);
    }

    protected override async sortByAscent(source: SortDataModel[], lhs: number, rhs: number, option: string | number | undefined, callback: (param: SortStateModel) => void): Promise<void> {
        let point: number, times: number = 0;

        while (true) {
            times = await this.saveByOrder(source, lhs, rhs, 'ascent', times, callback);
            times = await this.loadByOrder(source, lhs, rhs, 'ascent', times, callback);
    
            point = -1;

            for (let i = lhs; i < rhs; i++) {
                if (source[i + 1].value < source[i].value) {
                    point = i;
                    break;
                }
            }

            if (point === -1) break;
            
            times = await this.mergeByOrder(source, lhs, rhs, point, 'ascent', times, callback);
        }
        
        await delay();
        await this.complete(source, times, callback);
    }

    protected override async sortByDescent(source: SortDataModel[], lhs: number, rhs: number, option: string | number | undefined, callback: (param: SortStateModel) => void): Promise<void> {
        let point: number, times: number = 0;

        while (true) {
            times = await this.saveByOrder(source, lhs, rhs, 'descent', times, callback);
            times = await this.loadByOrder(source, lhs, rhs, 'descent', times, callback);
    
            point = -1;

            for (let i = rhs; i > lhs; i--) {
                if (source[i - 1].value < source[i].value) {
                    point = i;
                    break;
                }
            }

            if (point === -1) break;
            
            times = await this.mergeByOrder(source, lhs, rhs, point, 'descent', times, callback);
        }
        
        await delay();
        await this.complete(source, times, callback);
    }

    protected override async saveByOrder(source: SortDataModel[], lhs: number, rhs: number, order: SortOrder, times: number, callback: (param: SortStateModel) => void): Promise<number> {
        if (order === 'ascent') {
            for (let i = lhs; i <= rhs; i++) {
                times = await this.sweep(source, i, ACCENT_ONE_COLOR, times, callback);
                times += 1;
    
                this.array.push(source[i].value);
            }
        }
        
        if (order === 'descent') {
            for (let i = rhs; i >= lhs; i--) {
                times = await this.sweep(source, i, ACCENT_ONE_COLOR, times, callback);
                times += 1;
    
                this.array.push(source[i].value);
            }
        }

        return times;
    }

    protected override async loadByOrder(source: SortDataModel[], lhs: number, rhs: number, order: SortOrder, times: number, callback: (param: SortStateModel) => void): Promise<number> {
        for (let i = 0; i < this.array.length - 1; ) {
            if (this.array[i + 1] < this.array[i]) {
                this.stack.push(...this.array.splice(i + 1, 1));
            } else {
                i += 1;
            }
        }
        
        if (this.stack.length > 0) {
            this.array = this.array.concat(...this.stack);
            this.stack.splice(0);
        }

        if (order === 'ascent') {
            for (let i = lhs; i <= rhs; i++) {
                source[i].value = this.array.shift() as number;
    
                times = await this.sweep(source, i, ACCENT_TWO_COLOR, times, callback);
                times += 1;
            }
        }

        if (order === 'descent') {
            for (let i = rhs; i >= lhs; i--) {
                source[i].value = this.array.shift() as number;
    
                times = await this.sweep(source, i, ACCENT_TWO_COLOR, times, callback);
                times += 1;
            }
        }

        return times;
    }

    protected async mergeByOrder(source: SortDataModel[], lhs: number, rhs: number, idx: number, order: SortOrder, times: number, callback: (param: SortStateModel) => void): Promise<number> {
        if (order === 'ascent') {
            times = await this.mergeByAscent(source, lhs, rhs, idx, times, callback);

            rhs = Math.min(idx, lhs + this.THRESHOLD - 1);
        }
        
        if (order === 'descent') {
            times = await this.mergeByDescent(source, lhs, rhs, idx, times, callback);

            lhs = Math.max(idx, rhs - this.THRESHOLD + 1);
        }

        return await this._insertSortService.sortByOrder(source, lhs, rhs, 1, 1, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, order, times, callback);
    }

    protected async mergeByAscent(source: SortDataModel[], lhs: number, rhs: number, idx: number, times: number, callback: (param: SortStateModel) => void): Promise<number> {
        let i: number = lhs, j: number = idx + 1;

        while (i <= idx && j <= rhs) {
            times = await this.dualSweep(source, i, j, PRIMARY_COLOR, SECONDARY_COLOR, times, callback);
            times += 1;

            if (source[i].value < source[j].value) {
                this.array.push(source[i].value, source[j].value);
            } else {
                this.array.push(source[j].value, source[i].value);
            }

            i += 1;
            j += 1;
        }

        while (i <= idx) {
            times = await this.sweep(source, i, PRIMARY_COLOR, times, callback);
            times += 1;

            this.array.push(source[i].value);
            i += 1;
        }

        while (j <= rhs) {
            times = await this.sweep(source, j, SECONDARY_COLOR, times, callback);
            times += 1;

            this.array.push(source[j].value);
            j += 1;
        }

        for (let k = lhs; this.array.length > 0; k++) {
            source[k].value = this.array.shift() as number;

            times = await this.sweep(source, k, ACCENT_COLOR, times, callback);
            times += 1;
        }

        return times;
    }

    protected async mergeByDescent(source: SortDataModel[], lhs: number, rhs: number, idx: number, times: number, callback: (param: SortStateModel) => void): Promise<number> {
        let i: number = rhs, j: number = idx - 1;

        while (i >= idx && j >= lhs) {
            times = await this.dualSweep(source, i, j, PRIMARY_COLOR, SECONDARY_COLOR, times, callback);
            times += 1;

            if (source[i].value < source[j].value) {
                this.array.push(source[i].value, source[j].value);
            } else {
                this.array.push(source[j].value, source[i].value);
            }

            i -= 1;
            j -= 1;
        }

        while (i >= idx) {
            times = await this.sweep(source, i, PRIMARY_COLOR, times, callback);
            times += 1;

            this.array.push(source[i].value);
            i -= 1;
        }

        while (j >= rhs) {
            times = await this.sweep(source, j, SECONDARY_COLOR, times, callback);
            times += 1;

            this.array.push(source[j].value);
            j -= 1;
        }
        
        for (let k = rhs; this.array.length > 0; k--) {
            source[k].value = this.array.shift() as number;

            times = await this.sweep(source, k, ACCENT_COLOR, times, callback);
            times += 1;
        }

        return times;
    }

}

@Injectable()
export class BinaryStalinSortService extends StalinSortService {

    protected override async sortByAscent(source: SortDataModel[], lhs: number, rhs: number, option: string | number | undefined, callback: (param: SortStateModel) => void): Promise<void> {
        let point: number, times: number = 0;

        while (true) {
            times = await this.saveByOrder(source, lhs, rhs, 'ascent', times, callback);
            times = await this.loadByOrder(source, lhs, rhs, 'ascent', times, callback);
    
            point = -1;

            for (let i = lhs; i < rhs; i++) {
                if (source[i + 1].value < source[i].value) {
                    point = i;
                    break;
                }
            }

            if (point === -1) break;
            
            times = await this.mergeByOrder(source, lhs, rhs, point, 'ascent', times, callback);
        }
        
        await delay();
        await this.complete(source, times, callback);
    }

    protected override async sortByDescent(source: SortDataModel[], lhs: number, rhs: number, option: string | number | undefined, callback: (param: SortStateModel) => void): Promise<void> {
        let point: number, times: number = 0;

        while (true) {
            times = await this.saveByOrder(source, lhs, rhs, 'descent', times, callback);
            times = await this.loadByOrder(source, lhs, rhs, 'descent', times, callback);
    
            point = -1;

            for (let i = rhs; i > lhs; i--) {
                if (source[i - 1].value < source[i].value) {
                    point = i;
                    break;
                }
            }

            if (point === -1) break;
            
            times = await this.mergeByOrder(source, lhs, rhs, point, 'descent', times, callback);
        }
        
        await delay();
        await this.complete(source, times, callback);
    }

    protected override async mergeByOrder(source: SortDataModel[], lhs: number, rhs: number, idx: number, order: SortOrder, times: number, callback: (param: SortStateModel) => void): Promise<number> {
        let k: number;

        if (order === 'ascent') {
            k = this._service.indexOfFGTByAscent(source, source[idx + 1].value, lhs, idx);
            lhs = k === -1 ? lhs : k;

            times = await this.mergeByAscent(source, lhs, rhs, idx, times, callback);

            rhs = Math.min(rhs, lhs + this.THRESHOLD - 1);
        }
        
        if (order === 'descent') {
            k = this._service.indexOfFGTByDescent(source, source[idx - 1].value, idx, rhs);
            rhs = k === -1 ? rhs : k;

            times = await this.mergeByDescent(source, lhs, rhs, idx, times, callback);

            lhs = Math.max(lhs, rhs - this.THRESHOLD + 1);
        }

        return await this._insertSortService.sortByOrder(source, lhs, rhs, 1, 1, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, order, times, callback);
    }

}

/**
 * 斯大林排序
 */
@Injectable()
export class InPlaceStalinSortService extends AbstractComparisonSortService {

    constructor(
        protected override _service: SortToolsService,
        protected _insertSortService: InsertionSortService
    ) {
        super(_service);
    }

    protected override async sortByAscent(source: SortDataModel[], lhs: number, rhs: number, option: string | number | undefined, callback: (param: SortStateModel) => void): Promise<void> {
        let index: number = -1, start: number = lhs, final: number = rhs, stop: boolean, times: number = 0;

        while (true) {
            stop = true;

            for (let i = lhs; i < rhs; ) {
                start = Math.min(i + 1, rhs);
                final = Math.min(i + this.THRESHOLD, rhs);

                if (index === -1) {
                    index = final;
                    times = await this.exchange(source, source[index - 1].value > source[index].value, index, index - 1, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, times, callback);
                }

                if (source[start].value < source[i].value) {
                    stop = false;

                    for (let j = start; j < final; j++) {
                        source[index].color = ACCENT_COLOR;
                        source[start].color = START_COLOR;
                        source[final].color = FINAL_COLOR;
                        callback({ times, datalist: source });

                        times = await this.exchange(source, true, j, j + 1, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, times, callback);
                    }

                    times = await this.sweep(source, index, ACCENT_COLOR, times, callback);
                    times = await this.dualSweep(source, start, final, START_COLOR, FINAL_COLOR, times, callback);

                    index -= 1;
                } else {
                    times = await this.sweep(source, i, ACCENT_ONE_COLOR, times, callback);

                    i += 1;
                    index = -1;
                }

                if (i === index) break;
            }

            if (stop) break;

            start = this._service.indexOfFGTByAscent(source, source[index + 1].value, lhs, index);
            start = start === -1 ? lhs : start;
            final = rhs;
            times = await this.mergeByAscent(source, start, final, index, times, callback);
        }
        
        await delay();
        await this.complete(source, times, callback);
    }

    protected override async sortByDescent(source: SortDataModel[], lhs: number, rhs: number, option: string | number | undefined, callback: (param: SortStateModel) => void): Promise<void> {
        let index: number = -1, start: number = lhs, final: number = rhs, stop: boolean, times: number = 0;

        while (true) {
            stop = true;

            for (let i = rhs; i > lhs; ) {
                start = Math.max(i - this.THRESHOLD, lhs);
                final = Math.max(i - 1, lhs);

                if (index === -1) {
                    index = start;
                    times = await this.exchange(source, source[index + 1].value > source[index].value, index, index + 1, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, times, callback);
                }

                if (source[final].value < source[i].value) {
                    stop = false;

                    for (let j = final; j > start; j--) {
                        source[index].color = ACCENT_COLOR;
                        source[start].color = START_COLOR;
                        source[final].color = FINAL_COLOR;
                        callback({ times, datalist: source });

                        times = await this.exchange(source, true, j, j - 1, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, times, callback);
                    }

                    times = await this.sweep(source, index, ACCENT_COLOR, times, callback);
                    times = await this.dualSweep(source, start, final, START_COLOR, FINAL_COLOR, times, callback);

                    index += 1;
                } else {
                    times = await this.sweep(source, i, ACCENT_ONE_COLOR, times, callback);

                    i -= 1;
                    index = -1;
                }

                if (i === index) break;
            }

            if (stop) break;

            final = this._service.indexOfFGTByDescent(source, source[index - 1].value, index, rhs);
            final = final === -1 ? rhs : final;
            start = lhs;
            times = await this.mergeByDescent(source, start, final, index, times, callback);
        }
        
        await delay();
        await this.complete(source, times, callback);
    }

    private async mergeByAscent(source: SortDataModel[], lhs: number, rhs: number, idx: number, times: number, callback: (param: SortStateModel) => void): Promise<number> {
        let count: number = Math.min(idx - lhs + 1, rhs - idx, this.THRESHOLD);
        let start: number = idx + 1, final: number = idx + count, k: number = lhs;

        for (let i = start; i <= final; i++) {
            for (let j = i; j > k + 1; j--) {
                times = await this.exchange(source, true, j, j - 1, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, times, callback);
            }

            k += 2;
        }

        rhs = Math.min(lhs + this.THRESHOLD - 1);
        return await this._insertSortService.sortByOrder(source, lhs, rhs, 1, 1, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, 'ascent', times, callback);
    }

    private async mergeByDescent(source: SortDataModel[], lhs: number, rhs: number, idx: number, times: number, callback: (param: SortStateModel) => void): Promise<number> {
        let count: number = Math.min(rhs - idx + 1, lhs + idx, this.THRESHOLD);
        let start: number = idx - count, final: number = idx - 1, k: number = rhs;

        for (let i = final; i >= start; i--) {
            for (let j = i; j < k - 1; j++) {
                times = await this.exchange(source, true, j, j + 1, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, times, callback);
            }

            k -= 2;
        }

        lhs = Math.max(rhs - this.THRESHOLD + 1);
        return await this._insertSortService.sortByOrder(source, lhs, rhs, 1, 1, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, 'descent', times, callback);
    }

}
