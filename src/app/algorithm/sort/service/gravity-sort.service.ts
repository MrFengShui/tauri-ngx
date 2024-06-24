import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { cloneDeep } from "lodash";

import { SortDataModel, SortStateModel, SortOrder } from "../ngrx-store/sort.state";
import { ACCENT_COLOR, CLEAR_COLOR, PRIMARY_ONE_COLOR, SECONDARY_ONE_COLOR, SORT_DELAY_DURATION, complete, delay, swap } from "../sort.utils";

@Injectable()
export class GravitySortService {

    public sort(array: SortDataModel[], order: SortOrder): Observable<SortStateModel> {
        return new Observable(subscriber => {
            if (order === 'ascent') {
                this.sortByAscent(array, 0, param => subscriber.next(param)).then(() => subscriber.complete());
            }
    
            if (order === 'descent') {
                this.sortByDescent(array, 0, param => subscriber.next(param)).then(() => subscriber.complete());
            }
        });
    }

    private async sortByAscent(source: SortDataModel[], times: number, callback: (param: SortStateModel) => void): Promise<void> {
        let totalRow: number = source.length, totalCol: number = this.findMaxValue(source, 0, source.length - 1), count: number;
        let grid: boolean[][] = Array.from([]);

        for (let i = 0; i < totalRow; i++) {
            times += 1;

            source[i].color = ACCENT_COLOR;
            callback({ times, datalist: source });

            await delay(SORT_DELAY_DURATION);

            source[i].color = CLEAR_COLOR;
            callback({ times, datalist: source });

            let list: boolean[] = Array.from([]);

            for (let j = 0; j < totalCol; j++) {
                list.push(j < totalCol - source[i].value ? false : true);
            }

            grid.push(cloneDeep(list));
        }

        for (let col = 0; col < totalCol; col++) {
            for (let row = 1; row < totalRow; row++) {
                let k: number = row;

                while (k > 0 && grid[k - 1][col] && !grid[k][col]) {
                    grid[k - 1][col] = false;
                    grid[k][col] = true;
                    k -= 1;
                }

                for (let i = 0; i < totalRow; i++) {
                    count = 0;
    
                    for (let j = 0; j < totalCol; j++) {
                        if (grid[i][j]) {
                            count += 1;
                        }
                    }
    
                    source[i].value = count;
                    times += 1;
                }
            }

            callback({ times, datalist: source });
            await delay(SORT_DELAY_DURATION);
        }

        await delay(SORT_DELAY_DURATION);
        await complete(source, times, callback);
    }

    private async sortByDescent(source: SortDataModel[], times: number, callback: (parram: SortStateModel) => void): Promise<void> {
        let totalRow: number = source.length, totalCol: number = this.findMaxValue(source, 0, source.length - 1), count: number;
        let grid: boolean[][] = Array.from([]);

        for (let i = 0; i < totalRow; i++) {
            times += 1;

            source[i].color = ACCENT_COLOR;
            callback({ times, datalist: source });

            await delay(SORT_DELAY_DURATION);

            source[i].color = CLEAR_COLOR;
            callback({ times, datalist: source });

            let list: boolean[] = Array.from([]);

            for (let j = 0; j < totalCol; j++) {
                list.push(j < source[i].value ? true : false);
            }

            grid.push(cloneDeep(list));
        }
        
        for (let col = totalCol - 1; col >= 0; col--) {
            for (let row = 1; row < totalRow; row++) {
                let k: number = row;

                while (k > 0 && grid[k - 1][col] && !grid[k][col]) {
                    grid[k - 1][col] = false;
                    grid[k][col] = true;
                    k -= 1;
                }

                for (let i = 0; i < totalRow; i++) {
                    count = 0;
    
                    for (let j = 0; j < totalCol; j++) {
                        if (grid[i][j]) {
                            count += 1;
                        }
                    }
    
                    source[source.length - i - 1].value = count;
                    times += 1;
                }
            }

            callback({ times, datalist: source });
            await delay(SORT_DELAY_DURATION);
        }

        await delay(SORT_DELAY_DURATION);
        await complete(source, times, callback);
    }

    private findMaxValue(source: SortDataModel[], lhs: number, rhs: number): number {
        if (rhs - lhs <= 1) {
            return source[lhs].value > source[rhs].value ? source[lhs].value : source[rhs].value;
        }

        const mid: number = Math.floor((rhs - lhs) * 0.5 + lhs);
        const fst: number = this.findMaxValue(source, lhs, mid);
        const snd: number = this.findMaxValue(source, mid + 1, rhs);
        return fst > snd ? fst : snd;
    }

}
