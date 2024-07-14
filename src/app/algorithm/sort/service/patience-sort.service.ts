import { Injectable } from "@angular/core";
import { Observable } from "rxjs";

import { SortDataModel, SortStateModel, SortOrder } from "../ngrx-store/sort.state";
import { SORT_DELAY_DURATION, complete, delay } from "../sort.utils";
import { SortToolsService } from "../ngrx-store/sort.service";
import { ACCENT_ONE_COLOR, CLEAR_COLOR, ACCENT_TWO_COLOR } from "../../../public/values.utils";

@Injectable()
export class PatienceSortService {

    private piles: { [key: string | number]: number[] } = {};

    constructor(private _service: SortToolsService) {}

    public sort(array: SortDataModel[], order: SortOrder): Observable<SortStateModel> {
        return new Observable(subscriber => {
            if (order === 'ascent') {
                this.sortByAscent(array, false, 0, param => subscriber.next(param)).then(() => subscriber.complete());
            }
    
            if (order === 'descent') {
                this.sortByDescent(array, false, 0, param => subscriber.next(param)).then(() => subscriber.complete());
            }
        });
    }

    private async sortByAscent(source: SortDataModel[], flag: boolean, times: number, callback: (param: SortStateModel) => void): Promise<void> {
        let pile: number[], index: number = 0, exist: boolean, keys: string[];
        
        while (!flag) {
            flag = true;

            for (let i = 0, length = source.length; i < length; i++) {
                times += 1;

                source[i].color = ACCENT_ONE_COLOR;
                callback({ times, datalist: source});

                await delay(SORT_DELAY_DURATION);

                source[i].color = CLEAR_COLOR;
                callback({ times, datalist: source});

                exist = false;
                keys = Object.keys(this.piles);

                for (let j = 0, keyLength = keys.length; j < keyLength; j++) {
                    pile = this.piles[keys[j]];
                    
                    if (source[i].value < pile[pile.length - 1]) {
                        pile.push(source[i].value);
                        exist = true;
                        break;
                    }
                }

                if (!exist) {
                    this.piles[index] = Array.from([]);
                    this.piles[index].push(source[i].value);
                    index += 1;
                }
            }
            
            index = 0;
            keys = Object.keys(this.piles);

            for (let i = 0, length = keys.length; i < length; i++) {
                pile = this.piles[keys[i]];
                flag &&= pile.length === 1;

                for (let j = pile.length - 1; j >= 0; j--) {
                    times+= 1;

                    source[index].color = ACCENT_TWO_COLOR;
                    source[index].value = pile[j];
                    callback({ times, datalist: source});

                    await delay(SORT_DELAY_DURATION);

                    source[index].color = CLEAR_COLOR;
                    callback({ times, datalist: source});

                    index += 1;
                }
            }

            await this._service.clear(this.piles);
        }

        await delay(SORT_DELAY_DURATION);
        await complete(source, times, callback);
    }

    private async sortByDescent(source: SortDataModel[], flag: boolean, times: number, callback: (parram: SortStateModel) => void): Promise<void> {
        let pile: number[], index: number = 0, exist: boolean, keys: string[];
        
        while (!flag) {
            flag = true;

            for (let i = 0, length = source.length; i < length; i++) {
                times += 1;

                source[i].color = ACCENT_ONE_COLOR;
                callback({ times, datalist: source});

                await delay(SORT_DELAY_DURATION);

                source[i].color = CLEAR_COLOR;
                callback({ times, datalist: source});

                exist = false;
                keys = Object.keys(this.piles);

                for (let j = 0, keyLength = keys.length; j < keyLength; j++) {
                    pile = this.piles[keys[j]];

                    if (source[i].value > pile[pile.length - 1]) {
                        pile.push(source[i].value);
                        exist = true;
                        break;
                    }
                }

                if (!exist) {
                    this.piles[index] = Array.from([]);
                    this.piles[index].push(source[i].value);
                    index += 1;
                }
            }
            
            index = 0;
            keys = Object.keys(this.piles);
            
            for (let i = 0, length = keys.length; i < length; i++) {
                pile = this.piles[keys[i]];
                flag &&= pile.length === 1;

                for (let j = pile.length - 1; j >= 0; j--) {
                    times+= 1;

                    source[index].color = ACCENT_TWO_COLOR;
                    source[index].value = pile[j];
                    callback({ times, datalist: source});

                    await delay(SORT_DELAY_DURATION);

                    source[index].color = CLEAR_COLOR;
                    callback({ times, datalist: source});

                    index += 1;
                }
            }

            await this._service.clear(this.piles);
        }

        await delay(SORT_DELAY_DURATION);
        await complete(source, times, callback);
    }

}
