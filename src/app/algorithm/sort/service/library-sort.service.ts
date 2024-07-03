import { Injectable } from "@angular/core";
import { Observable } from "rxjs";

import { SortDataModel, SortOrder, SortStateModel } from "../ngrx-store/sort.state";
import { CLEAR_COLOR, PRIMARY_COLOR, delay, SORT_DELAY_DURATION, swap, complete, SECONDARY_COLOR, ACCENT_ONE_COLOR, ACCENT_TWO_COLOR } from "../sort.utils";

/**
 * 图书馆排序
 * 公式1：f(x) = (gap + 1) * x + gap
 * 公式2：g(x) = (x - gap) / (gap + 1)
 */
@Injectable()
export class LibrarySortService {

    private cache: SortDataModel[] = Array.from([]);

    public sort(array: SortDataModel[], order: SortOrder, gap: number = 4): Observable<SortStateModel> {
        return new Observable(subscriber => {
            const temp: SortDataModel = { value: 0, color: CLEAR_COLOR };

            if (order === 'ascent') {
                this.sortByAscent(array, gap, temp, 0, param => subscriber.next(param)).then(() => subscriber.complete());
            }

            if (order === 'descent') {
                this.sortByDescent(array, gap, temp, 0, param => subscriber.next(param)).then(() => subscriber.complete());
            }
        });
    }

    private async sortByAscent(source: SortDataModel[], gap: number, temp: SortDataModel, times: number, callback: (param: SortStateModel) => void): Promise<void> {
        let sourceIndex: number = 1, cacheIndex: number, sourceThreshold: number, cacheThreshold: number, point: number = 0, index: number = -1, lhs: number, rhs: number, flag: boolean = false;

        while (sourceIndex < source.length) {
            times = await this.import(source, sourceIndex, gap, times, callback);
            
            sourceThreshold = sourceIndex - 1;
            cacheThreshold = (gap + 1) * sourceThreshold + gap;
            
            for (let i = sourceIndex; i < source.length; i++) {
                cacheIndex = i - sourceThreshold + cacheThreshold;
                point = this.searchByAscent(source, source[i].value, sourceThreshold);
                
                if (point === -1) {
                    sourceIndex = i + 1;
                    break;
                }
                
                this.cache[cacheIndex].color = PRIMARY_COLOR;
                callback({ times, datalist: this.cache });

                await delay(SORT_DELAY_DURATION);

                this.cache[cacheIndex].color = CLEAR_COLOR;
                callback({ times, datalist: this.cache });
                
                rhs = (gap + 1) * point + gap;
                lhs = rhs - gap;

                for (let j = lhs; j < rhs; j++) {
                    flag = false;

                    this.cache[cacheIndex].color = PRIMARY_COLOR;

                    if (this.cache[j].value === 0) {
                        times += 1;
                        flag = true;

                        this.cache[j].color = SECONDARY_COLOR;                        
                        await swap(this.cache, cacheIndex, j, temp);
                        break;
                    }

                    callback({ times, datalist: this.cache });

                    await delay(SORT_DELAY_DURATION);

                    this.cache[cacheIndex].color = CLEAR_COLOR;
                    this.cache[j].color = CLEAR_COLOR;
                    callback({ times, datalist: this.cache });
                }
                
                if (flag) {
                    for (let j = lhs + 1; j <= rhs; j++) {
                        for (let k = j; k > lhs; k--) {
                            this.cache[k].color = PRIMARY_COLOR;
    
                            if (this.cache[k - 1].value > this.cache[k].value) {
                                this.cache[k - 1].color = SECONDARY_COLOR;
                                await swap(this.cache, k - 1, k, temp);
                                times += 1;
                            }
    
                            callback({ times, datalist: this.cache });
    
                            await delay(SORT_DELAY_DURATION);
    
                            this.cache[k].color = CLEAR_COLOR;
                            this.cache[k - 1].color = CLEAR_COLOR;
                            callback({ times, datalist: this.cache });
                        }
                    }
                } else {
                    sourceIndex = i;
                    break;
                }
            }
            
            times = await this.export(source, times, callback);
            
            await delay(SORT_DELAY_DURATION);
            callback({ times, datalist: source });
            
            this.cache.splice(0);
            
            if (index === cacheThreshold) {
                break;
            } else {
                index = cacheThreshold;
            }
        }

        await delay(SORT_DELAY_DURATION);
        await complete(source, times, callback);
    }

    private async sortByDescent(source: SortDataModel[], gap: number, temp: SortDataModel, times: number, callback: (param: SortStateModel) => void): Promise<void> {
        let sourceIndex: number = 1, cacheIndex: number, sourceThreshold: number, cacheThreshold: number, point: number = 0, index: number = -1, lhs: number, rhs: number, flag: boolean = false;

        while (sourceIndex < source.length) {
            times = await this.import(source, sourceIndex, gap, times, callback);
            
            sourceThreshold = sourceIndex - 1;
            cacheThreshold = (gap + 1) * sourceThreshold + gap;
            
            for (let i = sourceIndex; i < source.length; i++) {
                cacheIndex = i - sourceThreshold + cacheThreshold;
                point = this.searchByDescent(source, source[i].value, sourceThreshold);
                
                if (point === -1) {
                    sourceIndex = i + 1;
                    break;
                }
                
                this.cache[cacheIndex].color = PRIMARY_COLOR;
                callback({ times, datalist: this.cache });

                await delay(SORT_DELAY_DURATION);

                this.cache[cacheIndex].color = CLEAR_COLOR;
                callback({ times, datalist: this.cache });
                
                rhs = (gap + 1) * point + gap;
                lhs = rhs - gap;

                for (let j = lhs; j < rhs; j++) {
                    flag = false;

                    this.cache[cacheIndex].color = PRIMARY_COLOR;

                    if (this.cache[j].value === 0) {
                        times += 1;
                        flag = true;

                        this.cache[j].color = SECONDARY_COLOR;                        
                        await swap(this.cache, cacheIndex, j, temp);
                        break;
                    }

                    callback({ times, datalist: this.cache });

                    await delay(SORT_DELAY_DURATION);

                    this.cache[cacheIndex].color = CLEAR_COLOR;
                    this.cache[j].color = CLEAR_COLOR;
                    callback({ times, datalist: this.cache });
                }
                
                if (flag) {
                    for (let j = lhs + 1; j <= rhs; j++) {
                        for (let k = j; k > lhs; k--) {
                            this.cache[k].color = PRIMARY_COLOR;
    
                            if (this.cache[k - 1].value < this.cache[k].value) {
                                this.cache[k - 1].color = SECONDARY_COLOR;
                                await swap(this.cache, k - 1, k, temp);
                                times += 1;
                            }
    
                            callback({ times, datalist: this.cache });
    
                            await delay(SORT_DELAY_DURATION);
    
                            this.cache[k].color = CLEAR_COLOR;
                            this.cache[k - 1].color = CLEAR_COLOR;
                            callback({ times, datalist: this.cache });
                        }
                    }
                } else {
                    sourceIndex = i;
                    break;
                }
            }
            
            times = await this.export(source, times, callback);
            
            await delay(SORT_DELAY_DURATION);
            callback({ times, datalist: source });
            
            this.cache.splice(0);
            
            if (index === cacheThreshold) {
                break;
            } else {
                index = cacheThreshold;
            }
        }

        await delay(SORT_DELAY_DURATION);
        await complete(source, times, callback);
    }

    private async import(source: SortDataModel[], index: number, gap: number, times: number, callback: (param: SortStateModel) => void): Promise<number> {
        for (let i = 0; i < source.length; i++) {
            times += 1;

            source[i].color = ACCENT_ONE_COLOR;
            callback({ times, datalist: source });

            await delay(SORT_DELAY_DURATION);

            source[i].color = CLEAR_COLOR;
            callback({ times, datalist: source });

            if (i < index) {
                for (let j = 0; j < gap; j++) {
                    this.cache.push({ color: CLEAR_COLOR, value: 0 });
                }
            }
            
            this.cache.push({ color: source[i].color, value: source[i].value });
        }

        return times;
    }

    private async export(source: SortDataModel[], times: number, callback: (param: SortStateModel) => void): Promise<number> {
        let pivot: number = 0;

        for (const item of this.cache) {
            if (item.value !== 0) {
                times += 1;

                source[pivot].value = item.value;
                source[pivot].color = ACCENT_TWO_COLOR;
                callback({ times, datalist: source });

                await delay(SORT_DELAY_DURATION);

                source[pivot].color = CLEAR_COLOR;
                callback({ times, datalist: source });

                pivot += 1;
            }
        }

        return times;
    }

    private searchByAscent(source: SortDataModel[], target: number, threshold: number): number {
        let lhs: number = 0, rhs: number = threshold, mid: number;
        
        while (lhs <= rhs) {
            mid = Math.floor((rhs - lhs) * 0.5 + lhs);
            
            if (source[mid].value > target) {
                rhs = mid - 1;
            } else {
                lhs = mid + 1;
            }
        }
        
        return lhs > threshold ? -1 : lhs;
    }

    private searchByDescent(source: SortDataModel[], target: number, threshold: number): number {
        let lhs: number = 0, rhs: number = threshold, mid: number;
        
        while (lhs <= rhs) {
            mid = Math.floor((rhs - lhs) * 0.5 + lhs);
            
            if (source[mid].value < target) {
                rhs = mid - 1;
            } else {
                lhs = mid + 1;
            }
        }
        
        return lhs > threshold ? -1 : lhs;
    }

}

