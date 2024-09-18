import { Injectable } from "@angular/core";

import { ACCENT_COLOR, delay } from "../../../public/global.utils";
import { ACCENT_ONE_COLOR, ACCENT_TWO_COLOR } from "../../../public/global.utils";

import { SortDataModel, SortStateModel, SortOrder } from "../ngrx-store/sort.state";

import { AbstractDistributionSortService } from "./base-sort.service";

@Injectable()
export class PatienceSortService extends AbstractDistributionSortService<number> {

    protected override async sortByAscent(source: SortDataModel[], lhs: number, rhs: number, option: string | number | undefined, callback: (param: SortStateModel) => void): Promise<void> {
        let times: number = 0, flag: [number, boolean, number, number] = [0, false, -1, -1];
        
        while (!flag[1]) {
            times = await this.saveByOrder(source, lhs, rhs, 'ascent', times, callback);
            times = await this.loadByOrder(source, lhs, rhs, 'ascent', times, callback);
            flag = await this.check(source, lhs, rhs, 'ascent', times, callback);
        }
        
        this.freeKeyValues(this.cacheOfKeyValues);

        await delay();
        await this.complete(source, times, callback);
    }

    protected override async sortByDescent(source: SortDataModel[], lhs: number, rhs: number, option: string | number | undefined, callback: (parram: SortStateModel) => void): Promise<void> {
        let times: number = 0, flag: [number, boolean, number, number] = [0, false, -1, -1];

        while (!flag[1]) {
            times = await this.saveByOrder(source, lhs, rhs, 'descent', times, callback);
            times = await this.loadByOrder(source, lhs, rhs, 'descent', times, callback);
            flag = await this.check(source, lhs, rhs, 'descent', times, callback);
        }
        
        this.freeKeyValues(this.cacheOfKeyValues);

        await delay();
        await this.complete(source, times, callback);
    }

    protected override async saveByOrder(source: SortDataModel[], lhs: number, rhs: number, order: SortOrder, times: number, callback: (param: SortStateModel) => void): Promise<number> {
        let index: number = -1, value: number, key: string | number = 0, flag: boolean;

        for (let i = 0, length = source.length; i < length; i++) {
            if (order === 'ascent') {
                index = i;
            }

            if (order === 'descent') {
                index = length - i - 1;
            }

            value = source[index].value;

            times = await this.dualSweep(source, index, index, ACCENT_ONE_COLOR, ACCENT_ONE_COLOR, times, callback);
            times += 1;

            this.keys = Object.keys(this.cacheOfKeyValues);

            flag = false;

            for (let j = 0, keyLength = this.keys.length; j < keyLength; j++) {
                this.stack = this.cacheOfKeyValues[this.keys[j]];
                flag = value <= this.stack[this.stack.length - 1];

                if (flag) {
                    this.stack.push(value);
                    break;
                }
            }

            this.keys.splice(0);

            if (!flag) {
                this.cacheOfKeyValues[key] = Array.from([]);
                this.cacheOfKeyValues[key].push(value);

                key += 1;
            }
        }

        return times;
    }

    protected override async loadByOrder(source: SortDataModel[], lhs: number, rhs: number, order: SortOrder, times: number, callback: (param: SortStateModel) => void): Promise<number> {
        let index: number = -1;

        if (order === 'ascent') {
            index = 0;
        }

        if (order === 'descent') {
            index = source.length - 1;
        }

        this.keys = Object.keys(this.cacheOfKeyValues);

        for (let i = 0, length = this.keys.length; i < length; i++) {
            this.stack = this.cacheOfKeyValues[this.keys[i]];
            
            while (this.stack.length > 0) {
                source[index].value = this.stack.pop() as number;

                times = await this.dualSweep(source, index, index, ACCENT_TWO_COLOR, ACCENT_TWO_COLOR, times, callback);
                times += 1;

                if (order === 'ascent') {
                    index += 1;
                }

                if (order === 'descent') {
                    index -= 1;
                }
            }
        }

        return times;
    }

}
