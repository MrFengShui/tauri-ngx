import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { random } from "lodash";

import { SortDataModel, SortStateModel, SortOrder } from "../ngrx-store/sort.state";
import { ACCENT_COLOR, ACCENT_ONE_COLOR, ACCENT_TWO_COLOR, CLEAR_COLOR, PRIMARY_COLOR, PRIMARY_ONE_COLOR, 
    PRIMARY_TWO_COLOR, SECONDARY_COLOR, SECONDARY_ONE_COLOR, SECONDARY_TWO_COLOR, SORT_DELAY_DURATION, complete, delay, swap } from "../sort.utils";
import { SortToolsService } from "../ngrx-store/sort.service";

/**
 * 猴子排序
 */
@Injectable()
export class BogoSortService {

    public sort(array: SortDataModel[], order: SortOrder): Observable<SortStateModel> {
        return new Observable(subscriber => {
            let temp: SortDataModel = { value: 0, color: 'whitesmoke' };

            if (order === 'ascent') {
                this.sortByAscent(array, false, temp, 0, param => subscriber.next(param)).then(() => subscriber.complete());
            }
    
            if (order === 'descent') {
                this.sortByDescent(array, false, temp, 0, param => subscriber.next(param)).then(() => subscriber.complete());
            }
        });
    }

    private async sortByAscent(source: SortDataModel[], flag: boolean, temp: SortDataModel, times: number, callback: (param: SortStateModel) => void): Promise<void> {
        let i: number, j: number;
        
        while (!flag) {
            i = random(0, source.length - 1, false);
            j = random(0, source.length - 1, false);
            flag = true;
            
            if (i === j) {
                flag = false;
                continue;
            }

            source[i].color = PRIMARY_COLOR;
            source[j].color = SECONDARY_COLOR;
            callback({ times, datalist: source});

            if (i < j && source[i].value > source[j].value) {
                await swap(source, i, j, temp);
                times += 1;
            }

            await delay(SORT_DELAY_DURATION);
            
            source[i].color = CLEAR_COLOR;
            source[j].color = CLEAR_COLOR;
            callback({ times, datalist: source});

            await delay(SORT_DELAY_DURATION);

            for (let k = source.length - 1; k > 0; k--) {
                source[k].color = ACCENT_COLOR;
                callback({ times, datalist: source});

                await delay(SORT_DELAY_DURATION);

                source[k].color = CLEAR_COLOR;
                callback({ times, datalist: source});

                if (source[k - 1].value > source[k].value) {
                    flag = false;
                    break;
                }
            }
        }

        await delay(SORT_DELAY_DURATION);
        await complete(source, times, callback);
    }

    private async sortByDescent(source: SortDataModel[], flag: boolean, temp: SortDataModel, times: number, callback: (parram: SortStateModel) => void): Promise<void> {
        let i: number, j: number;
        
        while (!flag) {
            i = random(0, source.length - 1, false);
            j = random(0, source.length - 1, false);
            flag = true;
            
            if (i === j) {
                flag = false;
                continue;
            }

            source[i].color = PRIMARY_COLOR;
            source[j].color = SECONDARY_COLOR;

            if (i < j && source[i].value < source[j].value) {
                await swap(source, i, j, temp);
                times += 1;
            }

            callback({ times, datalist: source});

            await delay(SORT_DELAY_DURATION);
            
            source[i].color = CLEAR_COLOR;
            source[j].color = CLEAR_COLOR;
            callback({ times, datalist: source});

            await delay(SORT_DELAY_DURATION);

            for (let k = source.length - 1; k > 0; k--) {
                source[k].color = ACCENT_COLOR;
                callback({ times, datalist: source});

                await delay(SORT_DELAY_DURATION);

                source[k].color = CLEAR_COLOR;
                callback({ times, datalist: source});

                if (source[k - 1].value < source[k].value) {
                    flag = false;
                    break;
                }
            }
        }

        await delay(SORT_DELAY_DURATION);
        await complete(source, times, callback);
    }

}

/**
 * 猴子冒泡排序（单向）
 */
@Injectable()
export class BogoBubbleSortService {

    constructor(private _service: SortToolsService) {}

    public sort(array: SortDataModel[], order: SortOrder): Observable<SortStateModel> {
        return new Observable(subscriber => {
            let temp: SortDataModel = { value: 0, color: 'whitesmoke' };

            if (order === 'ascent') {
                this.sortByAscent(array, false, temp, 0, param => subscriber.next(param)).then(() => subscriber.complete());
            }
    
            if (order === 'descent') {
                this.sortByDescent(array, false, temp, 0, param => subscriber.next(param)).then(() => subscriber.complete());
            }
        });
    }

    private async sortByAscent(source: SortDataModel[], flag: boolean, temp: SortDataModel, times: number, callback: (param: SortStateModel) => void): Promise<void> {
        let index: number, threshold: number = source.length - 1;
        
        while (!flag) {
            flag = true;
            
            for (let i = 0; i < threshold; i++) {
                index = random(i + 1, threshold - 1, false);
                
                source[i].color = PRIMARY_COLOR;
                source[index].color = SECONDARY_COLOR;
                callback({ times, datalist: source});

                if (source[index].value < source[i].value) {
                    await swap(source, i, index, temp);
                    times += 1;
                }

                await delay(SORT_DELAY_DURATION);

                source[i].color = CLEAR_COLOR;
                source[index].color = CLEAR_COLOR;
                callback({ times, datalist: source});
            }

            await delay(SORT_DELAY_DURATION);
            
            for (let i = source.length - 1; i > 0; i--) {
                source[i].color = ACCENT_COLOR;
                callback({ times, datalist: source});

                await delay(SORT_DELAY_DURATION);

                source[i].color = CLEAR_COLOR;
                callback({ times, datalist: source});

                if (source[i - 1].value > source[i].value) {
                    flag = false;
                    threshold = i;

                    await swap(source, i - 1, i, temp);
                    callback({ times, datalist: source});
                    break;
                }
            }
        }

        await delay(SORT_DELAY_DURATION);
        await complete(source, times, callback);
    }

    private async sortByDescent(source: SortDataModel[], flag: boolean, temp: SortDataModel, times: number, callback: (param: SortStateModel) => void): Promise<void> {
        let index: number, threshold: number = source.length - 1;
        
        while (!flag) {
            flag = true;
            
            for (let i = 0; i < threshold; i++) {
                index = random(i + 1, threshold - 1, false);
                
                source[i].color = PRIMARY_COLOR;
                source[index].color = SECONDARY_COLOR;
                callback({ times, datalist: source});

                if (source[index].value > source[i].value) {
                    await swap(source, i, index, temp);
                    times += 1;
                }

                await delay(SORT_DELAY_DURATION);

                source[i].color = CLEAR_COLOR;
                source[index].color = CLEAR_COLOR;
                callback({ times, datalist: source});
            }

            await delay(SORT_DELAY_DURATION);
            
            for (let i = source.length - 1; i > 0; i--) {
                source[i].color = ACCENT_COLOR;
                callback({ times, datalist: source});

                await delay(SORT_DELAY_DURATION);

                source[i].color = CLEAR_COLOR;
                callback({ times, datalist: source});

                if (source[i - 1].value < source[i].value) {
                    flag = false;
                    threshold = i;

                    await swap(source, i - 1, i, temp);
                    callback({ times, datalist: source});
                    break;
                }
            }
        }

        await delay(SORT_DELAY_DURATION);
        await complete(source, times, callback);
    }

}

/**
 * 猴子冒泡排序（双向）
 */
@Injectable()
export class BogoCocktailSortService {

    constructor(private _service: SortToolsService) {}

    public sort(array: SortDataModel[], order: SortOrder): Observable<SortStateModel> {
        return new Observable(subscriber => {
            let temp: SortDataModel = { value: 0, color: 'whitesmoke' };

            if (order === 'ascent') {
                this.sortByAscent(array, false, temp, 0, param => subscriber.next(param)).then(() => subscriber.complete());
            }
    
            if (order === 'descent') {
                this.sortByDescent(array, false, temp, 0, param => subscriber.next(param)).then(() => subscriber.complete());
            }
        });
    }

    private async sortByAscent(source: SortDataModel[], flag: boolean, temp: SortDataModel, times: number, callback: (param: SortStateModel) => void): Promise<void> {
        let index: number, lhs: number = 0, rhs: number = source.length - 1;
        
        while (!flag) {
            flag = true;

            for (let i = lhs; i < rhs; i++) {
                index = random(i + 1, rhs - 1, false);
                
                source[i].color = PRIMARY_ONE_COLOR;
                source[index].color = SECONDARY_ONE_COLOR;
                callback({ times, datalist: source});

                if (source[index].value < source[i].value) {
                    await swap(source, i, index, temp);
                    times += 1;
                }

                await delay(SORT_DELAY_DURATION);

                source[i].color = CLEAR_COLOR;
                source[index].color = CLEAR_COLOR;
                callback({ times, datalist: source});
            }

            await delay(SORT_DELAY_DURATION);

            for (let i = source.length - 1; i > lhs; i--) {
                source[i].color = ACCENT_ONE_COLOR;
                callback({ times, datalist: source});

                await delay(SORT_DELAY_DURATION);

                source[i].color = CLEAR_COLOR;
                callback({ times, datalist: source});

                if (source[i - 1].value > source[i].value) {
                    flag = false;
                    rhs = i;

                    await swap(source, i - 1, i, temp);
                    break;
                }
            }

            await delay(SORT_DELAY_DURATION);

            for (let i = rhs; i > lhs; i--) {
                index = random(lhs + 1, i - 1, false);
                
                source[i].color = PRIMARY_TWO_COLOR;
                source[index].color = SECONDARY_TWO_COLOR;
                callback({ times, datalist: source});

                if (source[index].value > source[i].value) {
                    await swap(source, i, index, temp);
                    times += 1;
                }

                await delay(SORT_DELAY_DURATION);

                source[i].color = CLEAR_COLOR;
                source[index].color = CLEAR_COLOR;
                callback({ times, datalist: source});
            }
            
            await delay(SORT_DELAY_DURATION);
            
            for (let i = 0; i < rhs; i++) {
                source[i].color = ACCENT_TWO_COLOR;
                callback({ times, datalist: source});

                await delay(SORT_DELAY_DURATION);

                source[i].color = CLEAR_COLOR;
                callback({ times, datalist: source});

                if (source[i + 1].value < source[i].value) {
                    flag = false;
                    lhs = i;

                    await swap(source, i + 1, i, temp);
                    break;
                }
            }
        }

        await delay(SORT_DELAY_DURATION);
        await complete(source, times, callback);
    }

    private async sortByDescent(source: SortDataModel[], flag: boolean, temp: SortDataModel, times: number, callback: (parram: SortStateModel) => void): Promise<void> {
        let index: number, lhs: number = 0, rhs: number = source.length - 1;
        
        while (!flag) {
            flag = true;

            for (let i = lhs; i < rhs; i++) {
                index = random(i + 1, rhs - 1, false);
                
                source[i].color = PRIMARY_ONE_COLOR;
                source[index].color = SECONDARY_ONE_COLOR;
                callback({ times, datalist: source});

                if (source[index].value > source[i].value) {
                    await swap(source, i, index, temp);
                    times += 1;
                }

                await delay(SORT_DELAY_DURATION);

                source[i].color = CLEAR_COLOR;
                source[index].color = CLEAR_COLOR;
                callback({ times, datalist: source});
            }

            await delay(SORT_DELAY_DURATION);

            for (let i = source.length - 1; i > lhs; i--) {
                source[i].color = ACCENT_ONE_COLOR;
                callback({ times, datalist: source});

                await delay(SORT_DELAY_DURATION);

                source[i].color = CLEAR_COLOR;
                callback({ times, datalist: source});

                if (source[i - 1].value < source[i].value) {
                    flag = false;
                    rhs = i;

                    await swap(source, i - 1, i, temp);
                    break;
                }
            }

            await delay(SORT_DELAY_DURATION);

            for (let i = rhs; i > lhs; i--) {
                index = random(lhs + 1, i - 1, false);
                
                source[i].color = PRIMARY_TWO_COLOR;
                source[index].color = SECONDARY_TWO_COLOR;
                callback({ times, datalist: source});

                if (source[index].value < source[i].value) {
                    await swap(source, i, index, temp);
                    times += 1;
                }

                await delay(SORT_DELAY_DURATION);

                source[i].color = CLEAR_COLOR;
                source[index].color = CLEAR_COLOR;
                callback({ times, datalist: source});
            }
            
            await delay(SORT_DELAY_DURATION);
            
            for (let i = 0; i < rhs; i++) {
                source[i].color = ACCENT_TWO_COLOR;
                callback({ times, datalist: source});

                await delay(SORT_DELAY_DURATION);

                source[i].color = CLEAR_COLOR;
                callback({ times, datalist: source});

                if (source[i + 1].value > source[i].value) {
                    flag = false;
                    lhs = i;

                    await swap(source, i + 1, i, temp);
                    break;
                }
            }
        }

        await delay(SORT_DELAY_DURATION);
        await complete(source, times, callback);
    }

}
