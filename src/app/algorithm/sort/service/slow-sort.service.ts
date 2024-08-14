import { Injectable } from "@angular/core";
import { Observable } from "rxjs";

import { SortDataModel, SortStateModel, SortOrder } from "../ngrx-store/sort.state";
import { swap } from "../sort.utils";
import { delay } from "../../../public/global.utils";
import { CLEAR_COLOR, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR } from "../../../public/global.utils";

/**
 * 慢速排序
 */
@Injectable()
export class SlowSortService {

    public sort(array: SortDataModel[], order: SortOrder): Observable<SortStateModel> {
        return new Observable(subscriber => {
            const temp: SortDataModel = { value: 0, color: CLEAR_COLOR };

            if (order === 'ascent') {
                this.sortByAscent(array, temp, 0, param => subscriber.next(param)).then(() => subscriber.complete());
            }
    
            if (order === 'descent') {
                this.sortByDescent(array, temp, 0, param => subscriber.next(param)).then(() => subscriber.complete());
            }
        });
    }

    private async sortByAscent(source: SortDataModel[], temp: SortDataModel, times: number, callback: (param: SortStateModel) => void): Promise<void> {
        times = await this.sortByOrder(source, 0, source.length - 1, temp, 'ascent', times, callback);
        await delay();
        // await complete(source, times, callback);
    }

    private async sortByDescent(source: SortDataModel[], temp: SortDataModel, times: number, callback: (parram: SortStateModel) => void): Promise<void> {
        times = await this.sortByOrder(source, 0, source.length - 1, temp, 'descent', times, callback);
        await delay();
        // await complete(source, times, callback);
    }

    private async sortByOrder(source: SortDataModel[], lhs: number, rhs: number, temp: SortDataModel, order: SortOrder, times: number, callback: (parram: SortStateModel) => void): Promise<number> {
        if (rhs > lhs) {
            const mid: number = Math.floor((rhs - lhs) * 0.5 + lhs);
            times = await this.sortByOrder(source, lhs, mid, temp, order, times, callback);
            times = await this.sortByOrder(source, mid + 1, rhs, temp, order, times, callback);

            source[lhs].color = PRIMARY_COLOR;
            source[rhs].color = SECONDARY_COLOR;

            if (order === 'ascent' && source[mid].value > source[rhs].value) {
                times += 1;

                source[mid].color = ACCENT_COLOR;
                await swap(source, mid, rhs);
            }

            if (order === 'descent' && source[mid].value < source[rhs].value) {
                times += 1;

                source[mid].color = ACCENT_COLOR;
                await swap(source, mid, rhs);
            }

            callback({ times, datalist: source });

            await delay();

            source[lhs].color = CLEAR_COLOR;
            source[mid].color = CLEAR_COLOR;
            source[rhs].color = CLEAR_COLOR;
            callback({ times, datalist: source });

            times = await this.sortByOrder(source, lhs, rhs - 1, temp, order, times, callback);
        }

        return times;
    }

}
