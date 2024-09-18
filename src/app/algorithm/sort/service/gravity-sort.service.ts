import { Injectable } from "@angular/core";

import { SortDataModel, SortStateModel, SortOrder } from "../ngrx-store/sort.state";

import { ACCENT_COLOR, ACCENT_ONE_COLOR, ACCENT_TWO_COLOR } from "../../../public/global.utils";
import { delay } from "../../../public/global.utils";

import { AbstractDistributionSortService } from "./base-sort.service";

/**
 * 重力排序
 */
@Injectable()
export class GravitySortService extends AbstractDistributionSortService<number> {

    protected grid: number[][] = Array.from([]);
    protected totalRow: number = -1;
    protected totalCol: number = -1;

    protected override async sortByAscent(source: SortDataModel[], lhs: number, rhs: number, option: string | number | undefined, callback: (param: SortStateModel) => void): Promise<void> {
        let times: number = 0;

        this.totalRow = rhs - lhs + 1;
        this.totalCol = source.map(item => item.value).reduce((prev, curr) => Math.max(prev, curr));
        
        times = await this.saveByOrder(source, lhs, rhs, 'ascent', times, callback);
        times = await this.loadByOrder(source, lhs, rhs, 'ascent', times, callback);

        this.free();
        
        await delay();
        await this.complete(source, times, callback);
    }

    protected override async sortByDescent(source: SortDataModel[], lhs: number, rhs: number, option: string | number | undefined, callback: (parram: SortStateModel) => void): Promise<void> {
        let times: number = 0;

        this.totalRow = rhs - lhs + 1;
        this.totalCol = source.map(item => item.value).reduce((prev, curr) => Math.max(prev, curr));
        
        times = await this.saveByOrder(source, lhs, rhs, 'descent', times, callback);
        times = await this.loadByOrder(source, lhs, rhs, 'descent', times, callback);

        this.free();

        await delay();
        await this.complete(source, times, callback);
    }

    protected override async saveByOrder(source: SortDataModel[], lhs: number, rhs: number, order: SortOrder, times: number, callback: (param: SortStateModel) => void): Promise<number> {
        let index: number = -1;

        for (let row = 0; row <= this.totalRow - 1; row++) {
            if (order === 'ascent') {
                index = row;
            }

            if (order === 'descent') {
                index = this.totalRow - row - 1;
            }

            times = await this.dualSweep(source, index, index, ACCENT_COLOR, ACCENT_COLOR, times, callback);
            times += 1;

            const list: number[] = Array.from([]);
    
            for (let col = 0; col <= this.totalCol - 1; col++) {
                list.push(col < source[row].value ? 1 : 0);
            }

            this.grid.push(list);
        }

        return times;
    }

    protected override async loadByOrder(source: SortDataModel[], lhs: number, rhs: number, order: SortOrder, times: number, callback: (param: SortStateModel) => void): Promise<number> {
        let index: number = -1;

        for (let col = this.totalCol - 1; col >= 0; col--) {
            for (let row = 1; row < this.totalRow; row++) {
                index = row;
                
                while (index > 0 && this.grid[index - 1][col] > this.grid[index][col]) {
                    this.grid[index - 1][col] = 0;
                    this.grid[index][col] = 1;
                    index -= 1;
                }
            }
            
            times = this.countBeads(source, order, times);
            callback({ times, datalist: source });

            await delay(); 
        }

        return times;
    }

    protected countBeads(source: SortDataModel[], order: SortOrder, times: number): number {
        let index: number = -1, count: number;

        for (let row = 0; row <= this.totalRow - 1; row++) {
            count = this.grid[row].filter(item => item === 1).length;

            if (order === 'ascent') {
                index = row;
            }

            if (order === 'descent') {
                index = this.totalRow - row - 1;
            }

            source[index].value = count;

            times += 1;
        }

        return times;
    }

    protected override free(): void {
        for (let i = 0, length = this.grid.length; i < length; i++) {
            this.grid[i].splice(0);
        }

        this.grid.splice(0);
    }

}

@Injectable()
export class SimpleGravitySortService extends GravitySortService {

    protected override async loadByOrder(source: SortDataModel[], lhs: number, rhs: number, order: SortOrder, times: number, callback: (param: SortStateModel) => void): Promise<number> {
        let index: number;

        for (let row = this.totalRow - 1; row >= 0; row--) {
            index = -1;

            for (let col = 0; col <= this.totalCol - 1; col++) {
                if (this.grid[row][col] === 0) {
                    if (index === -1) index = col;

                    this.array.push(1);
                }
            }

            if (this.array.length > 0 && row > 0) {
                for (let i = row - 1; i >= 0; i--) {
                    for (let j = 0, length = this.array.length; j < length; j++) {
                        if (this.array[j] === 1 && this.grid[i][j + index] === 1) {
                            this.grid[i][j + index] = 0;
                            this.array[j] = 0;
                        }
                    }
                }

                for (let i = 0, length = this.array.length; i < length; i++) {
                    if (this.array[i] === 0) {
                        this.grid[row][i + index] = 1;
                    }
                }
            }

            this.array.splice(0);
                        
            times = this.countBeads(source, order, times);

            if (order === 'ascent') {
                times = await this.sweep(source, row, ACCENT_COLOR, times, callback);
            }
            
            if (order === 'descent') {
                times = await this.sweep(source, this.totalRow - row - 1, ACCENT_COLOR, times, callback);
            }
        }

        return times;
    }

}