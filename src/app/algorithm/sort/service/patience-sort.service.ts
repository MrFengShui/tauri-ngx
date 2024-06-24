import { Injectable } from "@angular/core";
import { Observable } from "rxjs";

import { SortDataModel, SortStateModel, SortOrder } from "../ngrx-store/sort.state";
import { ACCENT_COLOR, CLEAR_COLOR, SORT_DELAY_DURATION, complete, delay } from "../sort.utils";

@Injectable()
export class PatienceSortService {

    private piles: { [key: string | number]: number[] } = {};

    public sort(array: SortDataModel[], order: SortOrder): Observable<SortStateModel> {
        return new Observable(subscriber => {
            let temp: SortDataModel = { value: 0, color: CLEAR_COLOR };

            if (order === 'ascent') {
                this.sortByAscent(array, false, 0, param => subscriber.next(param)).then(() => subscriber.complete());
            }
    
            if (order === 'descent') {
                this.sortByDescent(array, false, 0, param => subscriber.next(param)).then(() => subscriber.complete());
            }
        });
    }

    private async sortByAscent(source: SortDataModel[], flag: boolean, times: number, callback: (param: SortStateModel) => void): Promise<void> {
        let pile: number[], index: number = 0, count: number, exist: boolean;
        
        while (!flag) {
            for (let i = 0; i < source.length; i++) {
                times += 1;

                source[i].color = ACCENT_COLOR;
                callback({ times, datalist: source});

                await delay(SORT_DELAY_DURATION);

                source[i].color = CLEAR_COLOR;
                callback({ times, datalist: source});

                exist = false;

                for (const key of Object.keys(this.piles)) {
                    pile = this.piles[key];

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
            count = 0;
            
            for (const key of Object.keys(this.piles)) {
                pile = this.piles[key];

                if (pile.length === 1) count += 1;

                for (let i = pile.length - 1; i >= 0; i--) {
                    times+= 1;

                    source[index].color = ACCENT_COLOR;
                    source[index].value = pile[i];
                    callback({ times, datalist: source});

                    await delay(SORT_DELAY_DURATION);

                    source[index].color = CLEAR_COLOR;
                    callback({ times, datalist: source});

                    index += 1;
                }
            }

            flag = count === source.length;
            await this.clear();
        }

        await delay(SORT_DELAY_DURATION);
        await complete(source, times, callback);
    }

    private async sortByDescent(source: SortDataModel[], flag: boolean, times: number, callback: (parram: SortStateModel) => void): Promise<void> {
        let pile: number[], index: number = 0, count: number, exist: boolean;
        
        while (!flag) {
            for (let i = 0; i < source.length; i++) {
                times += 1;

                source[i].color = ACCENT_COLOR;
                callback({ times, datalist: source});

                await delay(SORT_DELAY_DURATION);

                source[i].color = CLEAR_COLOR;
                callback({ times, datalist: source});

                exist = false;

                for (const key of Object.keys(this.piles)) {
                    pile = this.piles[key];

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
            count = 0;
            
            for (const key of Object.keys(this.piles)) {
                pile = this.piles[key];

                if (pile.length === 1) count += 1;

                for (let i = pile.length - 1; i >= 0; i--) {
                    times+= 1;

                    source[index].color = ACCENT_COLOR;
                    source[index].value = pile[i];
                    callback({ times, datalist: source});

                    await delay(SORT_DELAY_DURATION);

                    source[index].color = CLEAR_COLOR;
                    callback({ times, datalist: source});

                    index += 1;
                }
            }

            flag = count === source.length;
            await this.clear();
        }

        await delay(SORT_DELAY_DURATION);
        await complete(source, times, callback);
    }

    private async clear(): Promise<void> {
        for (const key of Object.keys(this.piles)) {
            this.piles[key].splice(0);
            delete this.piles[key];
        }
    }

}
