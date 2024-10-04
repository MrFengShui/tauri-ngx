
import { delay } from "../../../public/global.utils";
import { ACCENT_ONE_COLOR, ACCENT_TWO_COLOR } from "../../../public/global.utils";

import { SortDataModel, SortStateModel, SortOrder, SortOption } from "../ngrx-store/sort.state";

import { AbstractDistributionSortAlgorithm } from "../pattern/sort-temp.pattern";

/**
 * 耐心排序
 */
export class PatienceSortAlgorithm extends AbstractDistributionSortAlgorithm {

    private stop: boolean = false;

    protected override async sortByAscent(source: SortDataModel[], lhs: number, rhs: number, option: SortOption, callback: (param: SortStateModel) => void): Promise<void> {
        let times: number = 0;
        
        while (true) {
            times = await this.saveByOrder(source, lhs, rhs, 'ascent', times, callback);
            times = await this.loadByOrder(source, lhs, rhs, 'ascent', times, callback);

            if (this.stop) break;
        }
        
        this.freeKeyValues(this.cacheOfKeyValues);

        await delay();
        await this.complete(source, times, callback);
    }

    protected override async sortByDescent(source: SortDataModel[], lhs: number, rhs: number, option: SortOption, callback: (parram: SortStateModel) => void): Promise<void> {
        let times: number = 0;

        while (true) {
            times = await this.saveByOrder(source, lhs, rhs, 'descent', times, callback);
            times = await this.loadByOrder(source, lhs, rhs, 'descent', times, callback);

            if (this.stop) break;
        }
        
        this.freeKeyValues(this.cacheOfKeyValues);

        await delay();
        await this.complete(source, times, callback);
    }

    protected override async saveByOrder(source: SortDataModel[], lhs: number, rhs: number, order: SortOrder, times: number, callback: (param: SortStateModel) => void): Promise<number> {
        let index: number = -1, value: number, key: string | number, flag: boolean;

        for (let i = lhs; i <= rhs; i++) {
            if (order === 'ascent') {
                index = lhs + i;
            }

            if (order === 'descent') {
                index = rhs - i;
            }

            value = source[index].value;

            times = await this.sweep(source, index, ACCENT_ONE_COLOR, times, callback);
            times += 1;

            this.keys = Object.keys(this.cacheOfKeyValues);
            flag = true;

            for (let j = 0, length = this.keys.length; j < length; j++) {
                this.stack = this.cacheOfKeyValues[this.keys[j]];
                flag = value > this.stack[this.stack.length - 1];
                
                if (!flag) {
                    this.stack.push(value);
                    break;
                }
            }

            if (flag) {
                key = this.keys.length;

                this.cacheOfKeyValues[key] = Array.from([]);
                this.cacheOfKeyValues[key].push(value);
            }
            
            this.keys.splice(0);
        }

        return times;
    }

    protected override async loadByOrder(source: SortDataModel[], lhs: number, rhs: number, order: SortOrder, times: number, callback: (param: SortStateModel) => void): Promise<number> {
        let index: number = -1, key: string | number;

        if (order === 'ascent') {
            index = lhs;
        }

        if (order === 'descent') {
            index = rhs;
        }
        
        this.keys = Object.keys(this.cacheOfKeyValues);
        this.stop = true;
        
        while (this.keys.length > 0) {
            key = this.keys.shift() as (string | number);
            this.stack = this.cacheOfKeyValues[key];

            if (this.keys.length > 0) {
                this.array = this.array.concat(this.cacheOfKeyValues[this.keys[0]]);

                if (this.stack[0] > this.array[this.array.length - 1]) this.stop = false;

                this.array.splice(0);
            }
            
            while (this.stack.length > 0) {
                source[index].value = this.stack.pop() as number;

                times = await this.sweep(source, index, ACCENT_TWO_COLOR, times, callback);
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
