import { Injectable } from "@angular/core";
import { floor } from "lodash";

import { delay } from "../../../public/global.utils";
import { PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR } from "../../../public/global.utils";

import { SortDataModel, SortStateModel, SortOrder } from "../ngrx-store/sort.state";

import { AbstractBinarySortService } from "./base-sort.service";

/**
 * 慢速排序
 */
@Injectable()
export class SlowSortService extends AbstractBinarySortService {

    protected override async sortByAscent(source: SortDataModel[], lhs: number, rhs: number, option: string | number | undefined, callback: (param: SortStateModel) => void): Promise<void> {
        let times: number = await this.sortByOrder(source, lhs, rhs, 'ascent', 0, callback);

        await delay();
        await this.complete(source, times, callback);
    }

    protected override async sortByDescent(source: SortDataModel[], lhs: number, rhs: number, option: string | number | undefined, callback: (param: SortStateModel) => void): Promise<void> {
        let times: number = await this.sortByOrder(source, lhs, rhs, 'descent', 0, callback);

        await delay();
        await this.complete(source, times, callback);
    }

    protected override async sortByOrder(source: SortDataModel[], lhs: number, rhs: number, order: SortOrder, times: number, callback: (param: SortStateModel) => void): Promise<number> {
        if (lhs < rhs) {
            let mid: number = floor((rhs - lhs) * 0.5 + lhs, 0), completed: boolean, flag: boolean;

            if (order === 'ascent') {
                times = await this.sortByOrder(source, lhs, mid, order, times, callback);
                times = await this.sortByOrder(source, mid + 1, rhs, order, times, callback);

                flag = source[mid].value > source[rhs].value;

                [completed, times] = await this._service.swapAndRender(source, false, flag, mid, rhs, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, times, callback);

                times = await this.sortByOrder(source, lhs, rhs - 1, order, times, callback);
            }

            if (order === 'descent') {
                times = await this.sortByOrder(source, mid + 1, rhs, order, times, callback);
                times = await this.sortByOrder(source, lhs, mid, order, times, callback);
                
                flag = source[mid + 1].value > source[lhs].value;

                [completed, times] = await this._service.swapAndRender(source, false, flag, mid + 1, lhs, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, times, callback);

                times = await this.sortByOrder(source, lhs + 1, rhs, order, times, callback);
            }
        }

        return times;
    }

}
