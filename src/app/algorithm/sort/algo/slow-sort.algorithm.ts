import { floor } from "lodash";

import { delay } from "../../../public/global.utils";
import { PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR } from "../../../public/global.utils";

import { SortDataModel, SortStateModel, SortOrder, SortOption } from "../ngrx-store/sort.state";

import { AbstractBinarySortAlgorithm } from "../pattern/sort-temp.pattern";

/**
 * 慢速排序
 */
export class SlowSortAlgorithm extends AbstractBinarySortAlgorithm {

    protected override async sortByAscent(source: SortDataModel[], lhs: number, rhs: number, option: SortOption, callback: (param: SortStateModel) => void): Promise<void> {
        let times: number = await this.sortByOrder(source, lhs, rhs, 'ascent', 0, callback);

        await delay();
        await this.complete(source, times, callback);
    }

    protected override async sortByDescent(source: SortDataModel[], lhs: number, rhs: number, option: SortOption, callback: (param: SortStateModel) => void): Promise<void> {
        let times: number = await this.sortByOrder(source, lhs, rhs, 'descent', 0, callback);

        await delay();
        await this.complete(source, times, callback);
    }

    protected override async sortByOrder(source: SortDataModel[], lhs: number, rhs: number, order: SortOrder, times: number, callback: (param: SortStateModel) => void): Promise<number> {
        if (lhs < rhs) {
            let mid: number = floor((rhs - lhs) * 0.5, 0), flag: boolean;

            if (order === 'ascent') {
                mid = lhs + mid;

                times = await this.sortByOrder(source, lhs, mid, order, times, callback);
                times = await this.sortByOrder(source, mid + 1, rhs, order, times, callback);

                flag = source[mid].value > source[rhs].value;

                times = await this.exchange(source, flag, mid, rhs, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, times, callback);
                times = await this.sortByOrder(source, lhs, rhs - 1, order, times, callback);
            }

            if (order === 'descent') {
                mid = rhs - mid;

                times = await this.sortByOrder(source, mid, rhs, order, times, callback);
                times = await this.sortByOrder(source, lhs, mid - 1, order, times, callback);
                
                flag = source[mid].value > source[lhs].value;

                times = await this.exchange(source, flag, mid, lhs, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, times, callback);
                times = await this.sortByOrder(source, lhs + 1, rhs, order, times, callback);
            }
        }

        return times;
    }

}
