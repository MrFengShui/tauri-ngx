import { Injectable } from "@angular/core";

import { SortDataModel, SortOrder, SortStateModel } from "../ngrx-store/sort.state";
import { delay } from "../../../public/global.utils";
import { ACCENT_TWO_COLOR, ACCENT_ONE_COLOR, PRIMARY_TWO_COLOR, SECONDARY_TWO_COLOR, PRIMARY_ONE_COLOR, SECONDARY_ONE_COLOR } from "../../../public/global.utils";
import { AbstractDistributionSortService } from "./base-sort.service";
import { SortToolsService } from "../ngrx-store/sort.service";

/**
 * 计数排序
 */
@Injectable()
export class CountSortService extends AbstractDistributionSortService {

    constructor(private _service: SortToolsService) {
        super();
    }

    protected override async sortByAscent(source: SortDataModel[], lhs: number, rhs: number, option: string | number | undefined, callback: (param: SortStateModel) => void): Promise<void> {
        let times: number = 0, keys: string[];

        times = await this.save(source, 'ascent', times, callback);
        times = await this.load(source, 'ascent', times, callback);

        await delay();
        await this.complete(source, times, callback);
        await this.clear(this.cacheOfKeyValue);
    }

    protected override async sortByDescent(source: SortDataModel[], lhs: number, rhs: number, option: string | number | undefined, callback: (parram: SortStateModel) => void): Promise<void> {
        let index: number, value: number = 0, times: number = 0, keys: string[];

        times = await this.save(source, 'descent', times, callback);
        times = await this.load(source, 'descent', times, callback);

        await delay();
        await this.complete(source, times, callback);
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

    protected override async load(source: SortDataModel[], order: SortOrder, times: number, callback: (param: SortStateModel) => void): Promise<number> {
        let index: number = -1, value: number;

        this.keys = Object.keys(this.cacheOfKeyValue);

        if (order === 'ascent') {
            index = 0;
        }
        
        if (order === 'descent') {
            index = source.length - 1;
        }

        for (let i = 0, length = this.keys.length; i < length; i++) {
            value = Number.parseInt(this.keys[i]);

            for (let j = 0; j < this.cacheOfKeyValue[value]; j++) {
                source[index].value = value;
                
                await this._service.swapAndRender(source, false, false, index, i, PRIMARY_TWO_COLOR, SECONDARY_TWO_COLOR, ACCENT_TWO_COLOR, times, callback);

                if (order === 'ascent') {
                    index += 1;
                }

                if (order === 'descent') {
                    index -= 1;
                }
                
                times += 1;
            }
        }
        
        return times;
    }

}
