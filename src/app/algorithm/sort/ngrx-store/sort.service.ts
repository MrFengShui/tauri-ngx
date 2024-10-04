import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable, of, map } from "rxjs";
import { floor, max, min, now, random } from 'lodash';
import { DES, enc } from 'crypto-js';

import { SortDataModel, SortStateModel, SortOrder, SortDataExportModel, SortName, SortOption, SortType, GENERATE_SORTDATA_SECRETKEY, SortOptionModel, SortDataImportModel } from "../ngrx-store/sort.state";
import { LocaleIDType } from "../../../main/ngrx-store/main.state";

import { delay } from "../../../public/global.utils";
import { CLEAR_COLOR } from "../../../public/global.utils";

import { SortAlgorithmMatchFlyWeightFactory } from "../pattern/sort-algo.pattern";
import { AbstractSortAlgorithm } from "../pattern/sort-temp.pattern";
import { SortDataShuffleMachine } from "../algo/shuffle.algorithm";

@Injectable()
export class SortConfigService {

    constructor(private _http: HttpClient) {}

    public loadSortOrderOptions(localeID: LocaleIDType | string): Observable<SortOptionModel[]> {
        return this._http.get<{ list: SortOptionModel[] }>(`config/algorithm/sort/order/order.${localeID}.json`, 
            { responseType: 'json' }).pipe(map(value => value.list));
    }

    public loadSortRadixOptions(localeID: LocaleIDType | string): Observable<SortOptionModel[]> {
        return this._http.get<{ list: SortOptionModel[] }>(`config/algorithm/sort/radix/radix.${localeID}.json`, 
            { responseType: 'json' }).pipe(map(value => value.list));
    }

    public loadSortMergeWayOptions(localeID: LocaleIDType | string): Observable<SortOptionModel[]> {
        return this._http.get<{ list: SortOptionModel[] }>(`config/algorithm/sort/merge/merge.${localeID}.json`, { responseType: 'json' }).pipe(map(value => value.list));
    }

    public loadSortHeapNodeOptions(localeID: LocaleIDType | string): Observable<SortOptionModel[]> {
        return this._http.get<{ list: SortOptionModel[] }>(`config/algorithm/sort/heap/heap.${localeID}.json`, { responseType: 'json' }).pipe(map(value => value.list));
    }

}

@Injectable()
export class SortDataService {

    public createDataList(length: number, unique: boolean): Observable<SortDataModel[]> {
        return new Observable(subscriber => {
            const source: SortDataModel[] = Array.from([]);
            let index: number = random(0, length - 1, false), value: number;

            for(let i = 0; i < length; i++) {
                if (unique) {
                    value = i + 1;
                } else {
                    value = i === index ? length : random(1, length - 1, false);
                }
                
                source.push({ color: CLEAR_COLOR, value });
            }
            
            subscriber.next(source);
            subscriber.complete();
        });
    }

    public importDataList(file: File): Observable<SortDataImportModel> {
        return new Observable(subscriber => {
            const reader = new window.FileReader();
                reader.onload = event => {
                    let target: SortDataExportModel | null = JSON.parse(event.target?.result as string) as SortDataExportModel, list: number[] | null;
                    const text: string = DES.decrypt(target.data, GENERATE_SORTDATA_SECRETKEY(target.timestamp)).toString(enc.Utf8);

                    list = JSON.parse(text) as number[];
                    
                    subscriber.next({ 
                        source: list.map<SortDataModel>(item => ({ color: CLEAR_COLOR, value: item })), 
                        unique: target.unique 
                    });
                    subscriber.complete();

                    list.splice(0);
                    list = null;
                    target = null;
                };
                reader.onerror = event => subscriber.error(event);
                reader.readAsText(file);
        });
    }

    public exportDataList(data: number[]): Observable<SortDataExportModel> {
        return new Observable(subscriber => {
            const minValue: number = min(data) as number, maxValue: number = max(data) as number;
            const timestamp: number = now();
            const metadata: SortDataExportModel = {
                unique: this.isUnique(data), metainfo: { count: data.length, minValue, maxValue }, timestamp,
                data: DES.encrypt(JSON.stringify(data), GENERATE_SORTDATA_SECRETKEY(timestamp)).toString()
            };
            subscriber.next(metadata);
            subscriber.complete();
        });
    }

    private isUnique(array: number[]): boolean {
        let lhs: number = 0, rhs: number = array.length - 1, cache: number[] | null = Array.from([]);

        while (lhs < rhs) {
            if (cache[array[lhs] - 1] || cache[array[rhs] - 1]) {
                cache.splice(0);
                cache = null;
                return false;
            }

            cache[array[lhs] - 1] = 1;
            cache[array[rhs] - 1] = 1;

            lhs += 1;
            rhs -= 1;
        }

        return true;
    }

}

@Injectable()
export class SortToolsService {

    public async swap(source: SortDataModel[], fst: number, snd: number): Promise<void> {
        const temp: SortDataModel = source[fst];
        source[fst] = source[snd];
        source[snd] = temp;
    };

    public async sweepWith(source: SortDataModel[], places: number[], colors: string[], duration: number, times: number, callback: (param: SortStateModel) => void): Promise<number> {
        if (places.length === 2) {
            source[places[0]].color = colors[0];
            source[places[1]].color = colors[1];
            callback({ times, datalist: source });
    
            await delay(duration);
    
            source[places[0]].color = CLEAR_COLOR;
            source[places[1]].color = CLEAR_COLOR;
            callback({ times, datalist: source });
        } else {
            for (let i = 0, length = places.length; i < length; i++) {
                source[places[i]].color = colors[i % colors.length];
            }
    
            callback({ times, datalist: source });
    
            await delay(duration);
    
            for (let i = 0, length = places.length; i < length; i++) {
                source[places[i]].color = CLEAR_COLOR;
            }
            
            callback({ times, datalist: source });
        }        

        return times;
    }
    
    public minimax(source: SortDataModel[]): [number, number] {
        const minValue: number = min(source.map(item => item.value)) as number;
        const maxValue: number = max(source.map(item => item.value)) as number;        
        return [minValue, maxValue];
    }

    public indexOfFGTByAscent(source: SortDataModel[], value: number, lhs: number, rhs: number): number {
        let mid: number, start: number = lhs, final: number = rhs;
        
        while (lhs <= rhs) {
            if (rhs - lhs < 8) {
                mid = -1;
                lhs = Math.max(lhs - 1, start);
                rhs = Math.min(rhs + 1, final);
                
                for (let i = lhs; i <= rhs; i++) {
                    if (source[i].value >= value) {
                        mid = i;
                        break;
                    }
                }
                
                return mid;
            }
            
            mid = floor((rhs - lhs) * 0.5 + lhs, 0);

            if (source[mid].value < value) {
                lhs = mid + 1;
            } else {
                rhs = mid - 1;
            }
        }
        
        return -1;
    } 

    public indexOfFGTByDescent(source: SortDataModel[], value: number, lhs: number, rhs: number): number {
        let mid: number, start: number = lhs, final: number = rhs;

        while (lhs <= rhs) {
            if (rhs - lhs < 8) {
                mid = -1;
                lhs = Math.max(lhs - 1, start);
                rhs = Math.min(rhs + 1, final);

                for (let i = rhs; i >= lhs; i--) {
                    if (source[i].value >= value) {
                        mid = i;
                        break;
                    }
                }

                return mid;
            }

            mid = floor((rhs - lhs) * 0.5 + lhs, 0);

            if (source[mid].value > value) {
                lhs = mid + 1;
            } else {
                rhs = mid - 1;
            }
        }
        
        return -1;
    } 

}

@Injectable()
export class SortMatchService {

    private factory: SortAlgorithmMatchFlyWeightFactory = SortAlgorithmMatchFlyWeightFactory.newInstance();
    private service: AbstractSortAlgorithm | null = null;
    private machine: SortDataShuffleMachine | null = null;

    constructor(private _service: SortToolsService) {}

    public match(name: SortName, type: SortType, source: SortDataModel[], order: SortOrder, option: SortOption): Observable<SortStateModel | null> {
        console.warn('name:', name, 'order:', order, 'option:', option);
        source = this.clearColumnColor(source);
        this.service = this.factory.fetch(type, name, this._service);
        this.factory.lookup();
        return this.service ? this.service.sort(source, order, option) : of(null);
    }

    public shuffle(source: SortDataModel[]): Observable<SortStateModel> {
        return new Observable(subscriber => {
            if (this.machine === null) this.machine = new SortDataShuffleMachine(this._service);

            this.machine.shuffle(source, value => subscriber.next(value)).then(() => subscriber.complete());
        });
    }

    public clear(): void {
        this.factory.clear();
    }

    private clearColumnColor(source: SortDataModel[]): SortDataModel[] {
        if (!source.every(item => item.color === CLEAR_COLOR)) {
            for (let i = 0, length = source.length; i < length; i++) {
                source[i].color = CLEAR_COLOR;
            }
        }

        return source;
    }

}


