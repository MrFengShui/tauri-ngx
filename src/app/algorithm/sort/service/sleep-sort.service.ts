import { Injectable } from "@angular/core";

import { delay } from "../../../public/global.utils";
import { ACCENT_ONE_COLOR, CLEAR_COLOR, ACCENT_TWO_COLOR } from "../../../public/global.utils";

import { SortDataModel, SortStateModel, SortOrder } from "../ngrx-store/sort.state";

import { AbstractDistributionSortService } from "./base-sort.service";

/**
 * 睡眠排序
 */
@Injectable()
export class SleepSortService extends AbstractDistributionSortService<number> {

    protected readonly SCALE: number = 10;

    protected override async sortByAscent(source: SortDataModel[], lhs: number, rhs: number, option: string | number | undefined, callback: (param: SortStateModel) => void): Promise<void> {
        let times: number = 0;

        times = await this.saveByOrder(source, lhs, rhs, 'ascent', times, callback);
        times = await this.loadByOrder(source, lhs, rhs, 'ascent', times, callback);

        await delay();
        await this.complete(source, times, callback);
    }

    protected override async sortByDescent(source: SortDataModel[], lhs: number, rhs: number, option: string | number | undefined, callback: (param: SortStateModel) => void): Promise<void> {
        let times: number = 0;

        times = await this.saveByOrder(source, lhs, rhs, 'descent', times, callback);
        times = await this.loadByOrder(source, lhs, rhs, 'descent', times, callback);

        await delay();
        await this.complete(source, times, callback);
    }

    protected override async saveByOrder(source: SortDataModel[], lhs: number, rhs: number, order: SortOrder, times: number, callback: (param: SortStateModel) => void): Promise<number> {
        let index: number = -1;

        for (let i = lhs, length = source.length; i <= rhs; i++) {
            if (order === 'ascent') {
                index = i;
                this.array.push(source[index].value);
            }

            if (order === 'descent') {
                index = length - i - 1;
                this.array.push(source[index].value);
            }
            
            times += 1;

            source[index].color = ACCENT_ONE_COLOR;
            callback({ times, datalist: source });
            
            await delay();

            source[index].value = 0;
            source[index].color = CLEAR_COLOR;
            callback({ times, datalist: source });
        }

        return times;
    }

    protected override async loadByOrder(source: SortDataModel[], lhs: number, rhs: number, order: SortOrder, times: number, callback: (param: SortStateModel) => void): Promise<number> {
        let index: number = -1, value: number, length: number = source.length;
        
        while (this.array.length > 0) {
            value = this.array.pop() as number;
            
            if (order === 'ascent') {
                index = value - 1;
            }
            
            if (order === 'descent') {
                index = length - value;
            }

            times += 1;

            source[index].value = value;
            source[index].color = ACCENT_TWO_COLOR;
            callback({ times, datalist: source });

            await delay(value * this.SCALE);

            source[index].color = CLEAR_COLOR;
            callback({ times, datalist: source });
        }
        
        return times;
    }

}

