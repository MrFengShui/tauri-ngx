import { Injectable } from "@angular/core";

import { SortDataModel, SortOrder, SortStateModel } from "../ngrx-store/sort.state";
import { SORT_DELAY_DURATION, complete, delay } from "../sort.utils";
import { ACCENT_TWO_COLOR, ACCENT_ONE_COLOR, PRIMARY_TWO_COLOR, SECONDARY_TWO_COLOR, PRIMARY_ONE_COLOR, SECONDARY_ONE_COLOR } from "../../../public/values.utils";
import { BaseSortService } from "./base-sort.service";
import { SortToolsService } from "../ngrx-store/sort.service";

/**
 * 计数排序
 */
@Injectable()
export class CountSortService extends BaseSortService {

    constructor(private _service: SortToolsService) {
        super();
    }

    protected override async sortByAscent(source: SortDataModel[], lhs: number, rhs: number, option: string | number | undefined, callback: (param: SortStateModel) => void): Promise<void> {
        let index: number, value: number, times: number = 0, keys: string[];

        times = await this.save(source, 'ascent', times, callback);

        keys = Object.keys(this.cacheOfKeyValue);
        index = 0;

        for (let i = 0, length = keys.length; i < length; i++) {
            value = Number.parseInt(keys[i]);

            for (let j = 0; j < this.cacheOfKeyValue[value]; j++) {
                source[index].value = value;
                
                await this._service.swapAndRender(source, false, false, index, i, PRIMARY_TWO_COLOR, SECONDARY_TWO_COLOR, ACCENT_TWO_COLOR, times, callback);

                index += 1;
                times += 1;
            }
        }
        
        await delay(SORT_DELAY_DURATION);
        await complete(source, times, callback);
        await this.clear(this.cacheOfKeyValue);
    }

    protected override async sortByDescent(source: SortDataModel[], lhs: number, rhs: number, option: string | number | undefined, callback: (parram: SortStateModel) => void): Promise<void> {
        let index: number, value: number = 0, times: number = 0, keys: string[];

        times = await this.save(source, 'descent', times, callback);

        keys = Object.keys(this.cacheOfKeyValue);
        index = source.length - 1;

        for (let i = 0, length = keys.length; i < length; i++) {
            value = Number.parseInt(keys[i]);

            for (let j = 0; j < this.cacheOfKeyValue[value]; j++) {
                source[index].value = Number.parseInt(keys[i]);

                await this._service.swapAndRender(source, false, false, index, i, PRIMARY_TWO_COLOR, SECONDARY_TWO_COLOR, ACCENT_TWO_COLOR, times, callback);

                index -= 1;
                times += 1;
            }
        }
        
        await delay(SORT_DELAY_DURATION);
        await complete(source, times, callback);
        await this.clear(this.cacheOfKeyValue);
    }

    protected override async save(source: SortDataModel[], order: SortOrder, times: number, callback: (parram: SortStateModel) => void): Promise<number> {
        let index: number;

        if (order === 'ascent') {
            for (let i = 0, length = source.length; i <= length - 1; i++) {
                index = source[i].value;
                this.cacheOfKeyValue[index] = !this.cacheOfKeyValue[index] ? 1 : this.cacheOfKeyValue[index] + 1;
    
                await this._service.swapAndRender(source, false, false, i, i, PRIMARY_ONE_COLOR, SECONDARY_ONE_COLOR, ACCENT_ONE_COLOR, times, callback);
    
                times += 1;
            }
        }
        
        if (order === 'descent') {
            for (let length = source.length, i = length - 1; i >= 0; i--) {
                index = source[i].value;
                this.cacheOfKeyValue[index] = !this.cacheOfKeyValue[index] ? 1 : this.cacheOfKeyValue[index] + 1;
    
                await this._service.swapAndRender(source, false, false, i, i, PRIMARY_ONE_COLOR, SECONDARY_ONE_COLOR, ACCENT_ONE_COLOR, times, callback);
    
                times += 1;
            }
        }

        return times;
    }

}
