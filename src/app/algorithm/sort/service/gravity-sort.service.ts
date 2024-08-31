import { Injectable } from "@angular/core";

import { SortDataModel, SortStateModel, SortOrder } from "../ngrx-store/sort.state";

import { ACCENT_COLOR } from "../../../public/global.utils";
import { delay } from "../../../public/global.utils";

import { AbstractDistributionSortService } from "./base-sort.service";

/**
 * 重力排序
 */
@Injectable()
export class GravitySortService extends AbstractDistributionSortService {

    private grid: number[][] = Array.from([]);
    private totalRow: number = -1;
    private totalCol: number = -1;

    protected override async sortByAscent(source: SortDataModel[], lhs: number, rhs: number, option: string | number | undefined, callback: (param: SortStateModel) => void): Promise<void> {
        let times: number = 0;

        this.totalRow = rhs - lhs + 1;
        this.totalCol = source.map(item => item.value).reduce((prev, curr) => Math.max(prev, curr));
        
        times = await this.save(source, 'ascent', times, callback);
        times = await this.load(source, 'ascent', times, callback);

        this.free();
        
        await delay();
        await this.complete(source, times, callback);
    }

    protected override async sortByDescent(source: SortDataModel[], lhs: number, rhs: number, option: string | number | undefined, callback: (parram: SortStateModel) => void): Promise<void> {
        let times: number = 0;

        this.totalRow = rhs - lhs + 1;
        this.totalCol = source.map(item => item.value).reduce((prev, curr) => Math.max(prev, curr));
        
        times = await this.save(source, 'descent', times, callback);
        times = await this.load(source, 'descent', times, callback);

        this.free();

        await delay();
        await this.complete(source, times, callback);
    }

    protected override async save(source: SortDataModel[], order: SortOrder, times: number, callback: (param: SortStateModel) => void): Promise<number> {
        let index: number = -1;

        for (let row = 0; row <= this.totalRow - 1; row++) {
            if (order === 'ascent') {
                index = row;
            }

            if (order === 'descent') {
                index = this.totalRow - row - 1;
            }

            times = await this.render(source, index, index, ACCENT_COLOR, ACCENT_COLOR, times, callback);
            times += 1;

            const list: number[] = Array.from([]);
    
            for (let col = 0; col <= this.totalCol - 1; col++) {
                list.push(col < source[row].value ? 1 : 0);
            }

            this.grid.push(list);
        }

        return times;
    }

    protected override async load(source: SortDataModel[], order: SortOrder, times: number, callback: (param: SortStateModel) => void): Promise<number> {
        let index: number = -1, count: number;

        for (let col = this.totalCol - 1; col >= 0; col--) {
            for (let row = 1; row < this.totalRow; row++) {
                index = row;
                
                while (index > 0 && this.grid[index - 1][col] > this.grid[index][col]) {
                    this.grid[index - 1][col] = 0;
                    this.grid[index][col] = 1;
                    index -= 1;
                }
            }
            
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

            callback({ times, datalist: source });

            await delay();
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
