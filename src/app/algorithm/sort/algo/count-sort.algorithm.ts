
import { SortDataModel, SortOption, SortOrder, SortStateModel } from "../ngrx-store/sort.state";

import { delay } from "../../../public/global.utils";
import { ACCENT_TWO_COLOR, ACCENT_ONE_COLOR } from "../../../public/global.utils";

import { AbstractDistributionSortAlgorithm } from "../pattern/sort-temp.pattern";

/**
 * 计数排序
 */
export class CountSortAlgorithm extends AbstractDistributionSortAlgorithm {

    protected override async sortByAscent(source: SortDataModel[], lhs: number, rhs: number, option: SortOption, callback: (param: SortStateModel) => void): Promise<void> {
        let times: number = 0;

        times = await this.saveByOrder(source, lhs, rhs, 'ascent', times, callback);
        times = await this.loadByOrder(source, lhs, rhs, 'ascent', times, callback);

        this.freeKeyValue(this.cacheOfKeyValue);

        await delay();
        await this.complete(source, times, callback);
    }

    protected override async sortByDescent(source: SortDataModel[], lhs: number, rhs: number, option: SortOption, callback: (parram: SortStateModel) => void): Promise<void> {
        let times: number = 0;

        times = await this.saveByOrder(source, lhs, rhs, 'descent', times, callback);
        times = await this.loadByOrder(source, lhs, rhs, 'descent', times, callback);

        this.freeKeyValue(this.cacheOfKeyValue);

        await delay();
        await this.complete(source, times, callback);
    }

    protected override async saveByOrder(source: SortDataModel[], lhs: number, rhs: number, order: SortOrder, times: number, callback: (parram: SortStateModel) => void): Promise<number> {
        let key: string | number, k: number = -1;
        
        for (let i = lhs; i <= rhs; i++) {
            if (order === 'ascent') {
                k = i;
            }

            if (order === 'descent') {
                k = rhs - i;
            }

            key = source[k].value;

            if (this.keys.includes(key)) {
                this.cacheOfKeyValue[key] += 1;
            } else {
                this.cacheOfKeyValue[key] = 1;
                this.keys.push(key);
            }

            times = await this.sweep(source, k, ACCENT_ONE_COLOR, times, callback);    
            times += 1;
        }

        return times;
    }

    protected override async loadByOrder(source: SortDataModel[], lhs: number, rhs: number, order: SortOrder, times: number, callback: (param: SortStateModel) => void): Promise<number> {
        let key: string | number, value: number, k: number = -1;

        this.keys.splice(0);
        this.keys = Object.keys(this.cacheOfKeyValue);

        for (let i = lhs; i <= rhs; ) {
            if (order === 'ascent') {
                k = i;
            }

            if (order === 'descent') {
                k = rhs - i;
            }

            key = this.keys.shift() as (string | number);
            value = this.cacheOfKeyValue[key];

            for (let j = 0; j < value; j++, i++) {
                source[k].value = Number.parseInt(key.toString());

                times = await this.sweep(source, k, ACCENT_TWO_COLOR, times, callback);    
                times += 1;

                if (order === 'ascent') {
                    k += 1;
                }

                if (order === 'descent') {
                    k -= 1;
                }
            }
        }

        return times;
    }

}
