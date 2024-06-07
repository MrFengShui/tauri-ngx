import { Injectable } from "@angular/core";
import { Observable } from "rxjs";

import { SortDataModel, SortStateModel, SortOrder } from "../ngrx-store/sort.state";
import { SORT_DELAY_DURATION, complete, delay, swap } from "../sort.utils";

/**
 * 锦标赛排序
 */
@Injectable()
export class TournamentSortService {

    private fstCache: SortDataModel[] = Array.from([]);
    private sndCache: SortDataModel[] = Array.from([]);
    private trdCache: SortDataModel[] = Array.from([]);

    public sort(array: SortDataModel[], order: SortOrder): Observable<SortStateModel> {
        return new Observable(subscriber => {
            let temp: SortDataModel = { value: 0, color: 'whitesmoke' };

            if (order === 'ascent') {
                this.sortByAscent(array, temp, 0, param => subscriber.next(param)).then(() => subscriber.complete());
            }

            if (order === 'descent') {
                this.sortByDescent(array, temp, 0, param => subscriber.next(param)).then(() => subscriber.complete());
            }
        });
    }

    private async sortByAscent(source: SortDataModel[], temp: SortDataModel, times: number, callback: (param: SortStateModel) => void): Promise<void> {
        let winner: SortDataModel;

        for (let i = 0; i < source.length; i++) {
            this.fstCache.push({ value: source[i].value, color: source[i].color });
            times += 1; 

            source[i].color = 'lawngreen';
            callback({ completed: false, times, datalist: source });

            await delay(SORT_DELAY_DURATION);

            source[i].color = 'whitesmoke';
            callback({ completed: false, times, datalist: source });
        }

        for (let i = 0; i < this.fstCache.length; i++) {
            for (let j = 0; j < this.fstCache.length; j++) {
                this.sndCache.push(this.fstCache[j]);
                times += 1; 

                source[i].color = 'lawngreen';
                source[j].color = 'dodgerblue';
                callback({ completed: false, times, datalist: source });

                await delay(SORT_DELAY_DURATION);

                source[i].color = 'lawngreen';
                source[j].color = 'whitesmoke';
                callback({ completed: false, times, datalist: source });
            }

            while (this.sndCache.length > 2) {
                for (let j = 0; j < this.sndCache.length; j += 2) {
                    if (this.sndCache[j + 1]) {
                        this.trdCache.push(this.sndCache[j].value < this.sndCache[j + 1].value ? this.sndCache[j] : this.sndCache[j + 1]);
                    } else {
                        this.trdCache.push(this.sndCache[j]);
                    }

                    times += 1;
                }

                this.sndCache.splice(0);

                for (let item of this.trdCache) {
                    this.sndCache.push(item);

                    times += 1;
                }
                
                this.trdCache.splice(0);
            }
            
            winner = this.sndCache[0].value < this.sndCache[1].value ? this.sndCache[0] : this.sndCache[1]; 
            source[i].value = winner.value;
            times += 1;
            
            for (let j = 0; j < this.fstCache.length; j++) {
                source[i].color = 'lawngreen';
                source[j].color = 'orangered';
                callback({ completed: false, times, datalist: source });  

                await delay(SORT_DELAY_DURATION);   

                if (this.fstCache[j].value === source[i].value) {
                    this.fstCache[j].value = Number.MAX_SAFE_INTEGER;
                    times += 1;

                    source[j].color = 'whitesmoke';
                    callback({ completed: false, times, datalist: source });    
                    break;
                }

                source[j].color = 'whitesmoke';
                callback({ completed: false, times, datalist: source });    
            }
        }

        await delay(SORT_DELAY_DURATION);
        await complete(source, times, callback);
        await this.clear();
    }

    private async sortByDescent(source: SortDataModel[], temp: SortDataModel, times: number, callback: (parram: SortStateModel) => void): Promise<void> {
        let winner: SortDataModel;

        for (let i = 0; i < source.length; i++) {
            this.fstCache.push({ value: source[i].value, color: source[i].color });
            times += 1; 

            source[i].color = 'lawngreen';
            callback({ completed: false, times, datalist: source });

            await delay(SORT_DELAY_DURATION);

            source[i].color = 'whitesmoke';
            callback({ completed: false, times, datalist: source });
        }

        for (let i = 0; i < this.fstCache.length; i++) {
            for (let j = 0; j < this.fstCache.length; j++) {
                this.sndCache.push(this.fstCache[j]);
                times += 1; 
                
                source[i].color = 'lawngreen';
                source[j].color = 'dodgerblue';
                callback({ completed: false, times, datalist: source });

                await delay(SORT_DELAY_DURATION);

                source[i].color = 'lawngreen';
                source[j].color = 'whitesmoke';
                callback({ completed: false, times, datalist: source });
            }

            while (this.sndCache.length > 2) {
                for (let j = 0; j < this.sndCache.length; j += 2) {
                    if (this.sndCache[j + 1]) {
                        this.trdCache.push(this.sndCache[j].value > this.sndCache[j + 1].value ? this.sndCache[j] : this.sndCache[j + 1]);
                    } else {
                        this.trdCache.push(this.sndCache[j]);
                    }

                    times += 1;
                }

                this.sndCache.splice(0);

                for (let item of this.trdCache) {
                    this.sndCache.push(item);

                    times += 1;
                }
                
                this.trdCache.splice(0);
            }
            
            winner = this.sndCache[0].value > this.sndCache[1].value ? this.sndCache[0] : this.sndCache[1]; 
            source[i].value = winner.value;
            times += 1;
            
            for (let j = 0; j < this.fstCache.length; j++) {
                source[i].color = 'lawngreen';
                source[j].color = 'orangered';
                callback({ completed: false, times, datalist: source });  

                await delay(SORT_DELAY_DURATION);   

                if (this.fstCache[j].value === source[i].value) {
                    this.fstCache[j].value = Number.MIN_SAFE_INTEGER;
                    times += 1;

                    source[j].color = 'whitesmoke';
                    callback({ completed: false, times, datalist: source });    
                    break;
                }

                source[j].color = 'whitesmoke';
                callback({ completed: false, times, datalist: source });    
            }
        }

        await delay(SORT_DELAY_DURATION);
        await complete(source, times, callback);
        await this.clear();
    }

    private async clear(): Promise<void> {
        this.fstCache.splice(0);
        this.sndCache.splice(0);
        this.trdCache.splice(0);
    }

}
