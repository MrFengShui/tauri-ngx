import { ceil, floor, parseInt } from "lodash";

import { SortDataModel, SortStateModel, SortOrder, SortOption } from "../ngrx-store/sort.state";

import { calcGridRowCol, delay } from "../../../public/global.utils";
import { ACCENT_ONE_COLOR, ACCENT_TWO_COLOR, ACCENT_COLOR, PRIMARY_COLOR, SECONDARY_COLOR } from "../../../public/global.utils";

import { SortToolsService } from "../ngrx-store/sort.service";
import { AbstractComparisonSortAlgorithm, AbstractDistributionSortAlgorithm } from "../pattern/sort-temp.pattern";
import { InsertionSortAlgorithm } from "./insertion-sort.algorithm";
import { SelectionSortAlgorithm } from "./selection-sort.algorithm";

/**
 * 刀鞘排序
 */
export class ShearSortAlgorithm extends AbstractDistributionSortAlgorithm {

    private grid: number[][] = Array.from([]);
    private rows: number = -1;
    private cols: number = -1;

    protected override async sortByAscent(source: SortDataModel[], lhs: number, rhs: number, option: SortOption, callback: (param: SortStateModel) => void): Promise<void> {
        let times: number = await this.saveByOrder(source, lhs, rhs, 'ascent', 0, callback);
        
        for (let i = 0, threshold = floor(Math.log2(rhs - lhs + 1), 0); i < threshold; i++) {
            for (let row = 0; row <= this.rows - 1; row++) this.gridRowSort(row);

            for (let col = 0; col <= this.cols - 1; col++) this.gridColSort(col);

            times = await this.loadByOrder(source, lhs, rhs, 'ascent', times, callback);
        }

        times = await this.finalize(source, lhs, rhs, 'ascent', times, callback);

        this.grid.forEach(item => item.splice(0))
        this.grid.splice(0);

        await delay();
        await this.complete(source, times, callback);
    }

    protected override async sortByDescent(source: SortDataModel[], lhs: number, rhs: number, option: SortOption, callback: (param: SortStateModel) => void): Promise<void> {
        let times: number = await this.saveByOrder(source, lhs, rhs, 'descent', 0, callback);
        
        for (let i = 0, threshold = floor(Math.log2(rhs - lhs + 1), 0); i < threshold; i++) {
            for (let row = 0; row <= this.rows - 1; row++) this.gridRowSort(row);

            for (let col = 0; col <= this.cols - 1; col++) this.gridColSort(col);

            times = await this.loadByOrder(source, lhs, rhs, 'descent', times, callback);
        }

        times = await this.finalize(source, lhs, rhs, 'descent', times, callback);

        this.grid.forEach(item => item.splice(0))
        this.grid.splice(0);

        await delay();
        await this.complete(source, times, callback);
    }

    protected override async saveByOrder(source: SortDataModel[], lhs: number, rhs: number, order: SortOrder, times: number, callback: (param: SortStateModel) => void): Promise<number> {
        let row: number, idx: number = -1, size: number;

        [this.rows, this.cols] = calcGridRowCol(rhs - lhs + 1);

        for (let i = lhs; i <= rhs; i++) {
            if (order === 'ascent') idx = lhs + i;

            if (order === 'descent') idx = rhs - i;

            row = floor(i / this.cols, 0);

            if (i % this.cols === 0) this.grid[row] = Array.from([]);

            this.grid[row].push(source[idx].value);

            times = await this.sweep(source, idx, ACCENT_ONE_COLOR, times, callback);
            times += 1;
        }
        
        size = this.grid[this.rows - 1].length;
        return times;
    }

    protected override async loadByOrder(source: SortDataModel[], lhs: number, rhs: number, order: SortOrder, times: number, callback: (param: SortStateModel) => void): Promise<number> {
        let idx: number = -1;

        if (order === 'ascent') idx = lhs;

        if (order === 'descent') idx = rhs;
        
        for (let row = 0; row <= this.rows - 1; row++) {
            for (let col = 0; col <= this.cols - 1; col++) {
                source[idx].value = this.grid[row][col];

                times = await this.sweep(source, idx, ACCENT_TWO_COLOR, times, callback);
                times += 1;

                if (order === 'ascent') idx += 1;

                if (order === 'descent') idx -= 1;
            }
        }

        return times;
    }

    private gridRowSort(row: number): void {
        let key: string | number, idx: number = row % 2 === 0 ? 0 : this.cols - 1;

        for (let col = 0; col <= this.cols - 1; col++) {
            key = this.grid[row][col];

            if (this.keys.includes(key)) {
                this.cacheOfKeyValue[key] += 1;
            } else {
                this.cacheOfKeyValue[key] = 1;
                this.keys.push(key);
            }
        }
        
        this.keys.splice(0);
        this.keys = Object.keys(this.cacheOfKeyValue);

        while (this.keys.length > 0) {
            key = this.keys.shift() as (string | number);

            for (let i = 0; i < this.cacheOfKeyValue[key]; i++, idx = row % 2 === 0 ? idx + 1 : idx - 1) {
                this.grid[row][idx] = parseInt(key.toString());
            }
        }

        this.freeKeyValue(this.cacheOfKeyValue);
    }

    private gridColSort(col: number): void {
        let key: string | number, idx: number = 0;

        for (let row = 0; row <= this.rows - 1; row++) {
            key = this.grid[row][col];

            if (this.keys.includes(key)) {
                this.cacheOfKeyValue[key] += 1;
            } else {
                this.cacheOfKeyValue[key] = 1;
                this.keys.push(key);
            }
        }

        this.keys.splice(0);
        this.keys = Object.keys(this.cacheOfKeyValue);

        while (this.keys.length > 0) {
            key = this.keys.shift() as (string | number);

            for (let i = 0; i < this.cacheOfKeyValue[key]; i++, idx++) {
                this.grid[idx][col] = parseInt(key.toString());
            }
        }

        this.freeKeyValue(this.cacheOfKeyValue);
    }

    private async finalize(source: SortDataModel[], lhs: number, rhs: number, order: SortOrder, times: number, callback: (param: SortStateModel) => void): Promise<number> {
        let col: number, idx: number = -1;

        if (order === 'ascent') idx = lhs;

        if (order === 'descent') idx = rhs;
        
        for (let row = 0; row <= this.rows - 1; row++) {
            for (let i = 0; i <= this.cols - 1; i++) {
                col = row % 2 === 0 ? i : this.cols - i - 1;

                if (!Number.isFinite(this.grid[row][col])) continue;

                source[idx].value = this.grid[row][col];
                
                times = await this.sweep(source, idx, ACCENT_COLOR, times, callback);
                times += 1;

                if (order === 'ascent') idx += 1;

                if (order === 'descent') idx -= 1;
            }
        }
        
        return times;
    }

}

/**
 * 原地刀鞘排序
 */
export abstract class AbstractInPlaceShearSortAlgorithm extends AbstractComparisonSortAlgorithm {

    protected rows: number = -1;
    protected cols: number = -1;

    protected override async sortByAscent(source: SortDataModel[], lhs: number, rhs: number, option: SortOption, callback: (param: SortStateModel) => void): Promise<void> {
        let start: number, final: number, count: number, delta: number, times: number = 0;

        [this.rows, this.cols] = calcGridRowCol(rhs - lhs + 1);
        
        for (let i = 0, threshold = floor(Math.log2(rhs - lhs + 1), 0); i < threshold; i++) {
            count = 0;

            for (let row = 0; row <= this.rows - 1; row++) {
                start = this.cols * row;
                final = Math.min(start + this.cols - 1, rhs);
                
                [times, delta] = await this.sortByOrder(source, start, final, 1, row % 2 === 0 ? 'ascent' : 'descent', times, callback);
                count += delta;
            }

            for (let col = 0; col <= this.cols - 1; col++) {
                start = col;
                final = rhs;
                
                [times, delta] = await this.sortByOrder(source, start, final, this.cols, 'ascent', times, callback);
                count += delta;
            }

            if (count === 0) break;
        }

        times = await this.finalize(source, lhs, rhs, 'ascent', times, callback);

        await delay();
        await this.complete(source, times, callback);
    }

    protected override async sortByDescent(source: SortDataModel[], lhs: number, rhs: number, option: SortOption, callback: (param: SortStateModel) => void): Promise<void> {
        let start: number, final: number, count: number, delta: number, times: number = 0;

        this.cols = floor(Math.sqrt(rhs - lhs + 1), 0);
        this.rows = ceil((rhs - lhs + 1) / this.cols, 0);
        
        for (let i = 0, threshold = floor(Math.log2(rhs - lhs + 1), 0); i < threshold; i++) {
            count = 0;

            for (let row = 0; row <= this.rows - 1; row++) {
                final = rhs - this.cols * row;
                start = Math.max(final - this.cols + 1, lhs);
                
                [times, delta] = await this.sortByOrder(source, start, final, 1, row % 2 === 0 ? 'descent' : 'ascent', times, callback);
                count += delta;
            }

            for (let col = 0; col <= this.cols - 1; col++) {
                final = rhs - col;
                start = lhs;
                
                [times, delta] = await this.sortByOrder(source, start, final, this.cols, 'descent', times, callback);
                count += delta;
            }

            if (count === 0) break;
        }

        times = await this.finalize(source, lhs, rhs, 'descent', times, callback);

        await delay();
        await this.complete(source, times, callback);
    }

    protected abstract sortByOrder(source: SortDataModel[], lhs: number, rhs: number, gap: number, order: SortOrder, times: number, callback: (param: SortStateModel) => void): Promise<[number, number]>;

    protected abstract finalize(source: SortDataModel[], lhs: number, rhs: number, order: SortOrder, times: number, callback: (param: SortStateModel) => void): Promise<number>;
}

/**
 * 插入刀鞘排序
 */
export class InsertionShearSortAlgorithm extends AbstractInPlaceShearSortAlgorithm {

    private insertSort: InsertionSortAlgorithm | null = null;

    constructor(protected override _service: SortToolsService) {
        super(_service);

        if (this.insertSort === null) this.insertSort = new InsertionSortAlgorithm(_service);
    }

    protected override async sortByOrder(source: SortDataModel[], lhs: number, rhs: number, gap: number, order: SortOrder, times: number, callback: (param: SortStateModel) => void): Promise<[number, number]> {
        if (this.insertSort === null) throw new Error(`错误：引用对象${this.insertSort}未被初始化。`);
        
        return await this.insertSort.sortByOrder(source, lhs, rhs, gap, gap, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, order, times, callback);
    }

    protected override async finalize(source: SortDataModel[], lhs: number, rhs: number, order: SortOrder, times: number, callback: (param: SortStateModel) => void): Promise<number> {
        if (this.insertSort === null) throw new Error(`错误：引用对象${this.insertSort}未被初始化。`);

        let start: number, final: number;

        if (order === 'ascent') {
            for (let i = lhs; i < rhs; ) {
                start = i;
                final = Math.min(i + this.cols - 1, rhs);
    
                if (floor((lhs + i) / this.cols, 0) % 2 === 0) {
                    for (let j = start; j <= final; j++) {
                        times = await this.sweep(source, j, ACCENT_COLOR, times, callback);
                    }
                } else {
                    [times] = await this.insertSort.sortByOrder(source, start, final, 1, 1, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, order, times, callback);
                }
                
                i = final + 1;
            }
        }
        
        if (order === 'descent') {
            for (let i = rhs; i > lhs; ) {
                final = i;
                start = Math.max(i - this.cols + 1, lhs);
    
                if (floor((rhs - i) / this.cols, 0) % 2 === 0) {
                    for (let j = final; j >= start; j--) {
                        times = await this.sweep(source, j, ACCENT_COLOR, times, callback);
                    }
                } else {
                    [times] = await this.insertSort.sortByOrder(source, start, final, 1, 1, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, order, times, callback);
                }
                
                i = start - 1;
            }
        }

        return times;
    }

}

/**
 * 选择刀鞘排序
 */
export class SelectionShearSortAlgorithm extends AbstractInPlaceShearSortAlgorithm {

    private selectSort: SelectionSortAlgorithm | null = null;

    constructor(protected override _service: SortToolsService) {
        super(_service);

        if (this.selectSort === null) this.selectSort = new SelectionSortAlgorithm(_service);
    }

    protected override async sortByOrder(source: SortDataModel[], lhs: number, rhs: number, gap: number, order: SortOrder, times: number, callback: (param: SortStateModel) => void): Promise<[number, number]> {
        if (this.selectSort === null) throw new Error(`错误：引用对象${this.selectSort}未被初始化。`);
        
        return await this.selectSort.sortByOrder(source, lhs, rhs, gap, gap, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, order, times, callback);
    }

    protected override async finalize(source: SortDataModel[], lhs: number, rhs: number, order: SortOrder, times: number, callback: (param: SortStateModel) => void): Promise<number> {
        if (this.selectSort === null) throw new Error(`错误：引用对象${this.selectSort}未被初始化。`);

        let start: number, final: number;

        if (order === 'ascent') {
            for (let i = lhs; i < rhs; ) {
                start = i;
                final = Math.min(i + this.cols - 1, rhs);
    
                if (floor((lhs + i) / this.cols, 0) % 2 === 0) {
                    for (let j = start; j <= final; j++) {
                        times = await this.sweep(source, j, ACCENT_COLOR, times, callback);
                    }
                } else {
                    [times] = await this.selectSort.sortByOrder(source, start, final, 1, 1, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, order, times, callback);
                }
                
                i = final + 1;
            }
        }
        
        if (order === 'descent') {
            for (let i = rhs; i > lhs; ) {
                final = i;
                start = Math.max(i - this.cols + 1, lhs);
    
                if (floor((rhs - i) / this.cols, 0) % 2 === 0) {
                    for (let j = final; j >= start; j--) {
                        times = await this.sweep(source, j, ACCENT_COLOR, times, callback);
                    }
                } else {
                    [times] = await this.selectSort.sortByOrder(source, start, final, 1, 1, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, order, times, callback);
                }
                
                i = start - 1;
            }
        }

        return times;
    }

}
