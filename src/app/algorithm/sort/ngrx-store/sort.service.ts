import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable, of, map, AsyncSubject, Subject, debounceTime, BehaviorSubject } from "rxjs";
import { random } from 'lodash';
import { DES, HmacSHA256, enc } from 'crypto-js';

import { SortDataModel, SortStateModel, SortOrder, SortRadix, SortOrderOptionModel, SortRadixOptionModel, SortMergeWayOptionModel, SortHeapNodeOptionModel, SortMetadataModel } from "../ngrx-store/sort.state";

import { delay } from "../../../public/global.utils";
import { CLEAR_COLOR, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, PRIMARY_ONE_COLOR, SECONDARY_ONE_COLOR, ACCENT_ONE_COLOR, PRIMARY_TWO_COLOR, SECONDARY_TWO_COLOR, ACCENT_TWO_COLOR } from "../../../public/global.utils";
import { swap } from "../sort.utils";


import { BubbleSortService, ShakerBubbleSortService, ExchangeSortService, TwoWayBubbleSortService, ShellBubbleSortService } from "../service/bubble-sort.service";
import { BinarySearchInserionSortService, InsertionSortService, ShellSortService } from "../service/insertion-sort.service";
import { LibrarySortService } from "../service/insertion-sort.service";
import { ShakerSelectionSortService, SelectionSortService, TwoWaySelectionSortService } from "../service/selection-sort.service";
import { BogoBubbleSortService, BogoShakerBubbleSortService, BogoInsertionSortService, BogoSelectionSortService, BogoSortService } from "../service/bogo-sort.service";
import { IterativeAverageQuickSortService, RecursiveAverageQuickSortService, IterativeDualPivotQuickSortService, RecursiveDualPivotQuickSortService, IterativeQuickSortService, RecursiveQuickSortService, ThreeWayIterativeQuickSortService, ThreeWayRecursiveQuickSortService, IterativeTwoWayQuickSortService, RecursiveTwoWayQuickSortService } from "../service/quick-sort.service";
import { CountSortService } from "../service/count-sort.service";
import { BucketSortService, InterpolationSortService, PigeonholeSortService } from "../service/bucket-sort.service";
import { IterativeRadixMSDSortService, RadixLSDSortService, RecursiveRadixMSDSortService } from "../service/radix-sort.service";
import { AsyncSleepSortService, SyncSleepSortService } from "../service/sleep-sort.service";
import { CycleSortService } from "../service/cycle-sort.service";
import { TernaryHeapSortService } from "../service/selection-sort.service";
import { HeapSortService } from "../service/selection-sort.service";
import { TopDownMergeSortService, MultiWayMergeSortService, BottomUpMergeSortService, RecursiveInPlaceMergeSortService, IterativeInPlaceMergeSortService } from "../service/merge-sort.service";
import { IterativeStoogeSortService, RecursiveStoogeSortService } from "../service/stooge-sort.service";
import { SlowSortService } from "../service/slow-sort.service";
import { GnomeSortService } from "../service/insertion-sort.service";
import { TournamentSortService } from "../service/tree-sort.service";
import { BottomUpBitonicMergeSortService, TopDownBitonicMergeSortService } from "../service/bitonic-merge-sort.service";
import { OddEvenSortService } from "../service/bubble-sort.service";
import { CombSortService } from "../service/bubble-sort.service";
import { PancakeSortService } from "../service/pancake-sort.service";
import { GravitySortService } from "../service/gravity-sort.service";
import { BottomUpOddEvenMergeSortService, TopDownOddEvenMergeSortService } from "../service/odd-even-merge-sort.service";
import { PatienceSortService } from "../service/patience-sort.service";
import { OptimalStrandSortService, StrandSortService } from "../service/strand-sort.service";
import { TimSortService } from "../service/merge-sort.service";
import { LocaleIDType } from "../../../main/ngrx-store/main.state";
import { BinarySearchTreeSortService } from "../service/tree-sort.service";
import { SmoothSortService } from "../service/selection-sort.service";
import { OptimalShearSortService, ShearSortService } from "../service/shear-sort.service";

export const SORT_DATA_SECRET_KEY: string = HmacSHA256('SORT_DATA_SECRET_KEY', 'SORT_DATA_SECRET_KEY').toString();

@Injectable()
export class SortLoadConfigService {

    constructor(private _http: HttpClient) {}

    public loadSortOrderOptions(localeID: LocaleIDType | string): Observable<SortOrderOptionModel[]> {
        return this._http.get<{ list: SortOrderOptionModel[] }>(`config/algorithm/sort/order/order.${localeID}.json`, 
            { responseType: 'json' }).pipe(map(value => value.list));
    }

    public loadSortRadixOptions(localeID: LocaleIDType | string): Observable<SortRadixOptionModel[]> {
        return this._http.get<{ list: SortRadixOptionModel[] }>(`config/algorithm/sort/radix/radix.${localeID}.json`, 
            { responseType: 'json' }).pipe(map(value => value.list));
    }

    public loadSortMergeWayOptions(localeID: LocaleIDType | string): Observable<SortMergeWayOptionModel[]> {
        return this._http.get<{ list: SortMergeWayOptionModel[] }>(`config/algorithm/sort/merge/merge.${localeID}.json`, { responseType: 'json' }).pipe(map(value => value.list));
    }

    public loadSortHeapNodeOptions(localeID: LocaleIDType | string): Observable<SortHeapNodeOptionModel[]> {
        return this._http.get<{ list: SortMergeWayOptionModel[] }>(`config/algorithm/sort/heap/heap.${localeID}.json`, { responseType: 'json' }).pipe(map(value => value.list));
    }

}

@Injectable()
export class SortUtilsService {

    private source: SortDataModel[] = Array.from([]);
    private subject: Subject<SortDataModel[]> = new BehaviorSubject<SortDataModel[]>(this.source);
    
    public createDataList(size: number, name: string, unique: boolean): Observable<SortDataModel[]> {
        const binMaxLength: number = size.toString(2).length;
        const octMaxLength: number = size.toString(8).length;
        const decMaxLength: number = size.toString(10).length;
        const hexMaxLength: number = size.toString(16).length;
        let value: number;

        if (this.source.length > 0) {
            this.source.splice(0);
        }

        for(let i = 0; i < size; i++) {
            value = unique ? i + 1 : (i === size - 1 ? size : random(1, size - 1, false));
            this.source.push({ 
                color: CLEAR_COLOR, value, 
                radix: name.includes('radix-sort') ? { 
                    bin: value.toString(2).padStart(binMaxLength, '0'),
                    oct: value.toString(8).padStart(octMaxLength, '0'),
                    dec: value.toString(10).padStart(decMaxLength, '0'),
                    hex: value.toString(16).padStart(hexMaxLength, '0')
                } : undefined
            });
        }
        
        this.subject.next(this.source);
        return this.subject.asObservable().pipe(debounceTime(100));
    }

    public importDataList(file: File | null, name: string): Observable<SortDataModel[]> {
        if (file) {
            const reader = new window.FileReader();
            reader.onload = event => {
                const result: string = event.target?.result as string;
                const target: SortMetadataModel = JSON.parse(result);
                const text: string = DES.decrypt(target.data, SORT_DATA_SECRET_KEY).toString(enc.Utf8);
                const list: number[] = JSON.parse(text);
                const size: number = list.length;
                
                if (this.source.length > 0) {
                    this.source.splice(0);
                }

                const binMaxLength: number = size.toString(2).length;
                const octMaxLength: number = size.toString(8).length;
                const decMaxLength: number = size.toString(10).length;
                const hexMaxLength: number = size.toString(16).length;
    
                for(let i = 0; i < size; i++) {
                    this.source.push({ 
                        color: CLEAR_COLOR, value: list[i], 
                        radix: name.includes('radix-sort') ? { 
                            bin: (i + 1).toString(2).padStart(binMaxLength, '0'),
                            oct: (i + 1).toString(8).padStart(octMaxLength, '0'),
                            dec: (i + 1).toString(10).padStart(decMaxLength, '0'),
                            hex: (i + 1).toString(16).padStart(hexMaxLength, '0')
                        } : undefined
                    });
                }
                
                this.subject.next(this.source);
            }
            reader.readAsText(file);
        }
        
        return this.subject.asObservable().pipe(debounceTime(100));
    }

    public shuffleDataList(source: SortDataModel[]): Observable<SortStateModel> {
        for (let i = 0, length = source.length; i < length; i++) {
            source[i].color = CLEAR_COLOR;
        }
        
        return new Observable(subscriber => {
            this.shuffle(source, param => subscriber.next(param))
                .then(() => subscriber.complete())
                .catch(error => subscriber.error(error));
        });
    }

    private async shuffle(source: SortDataModel[], callback: (param: SortStateModel) => void): Promise<void> {
        const threshold: number = source.length - 1, temp: SortDataModel = { color: '', value: Number.NaN };
        let m: number = -1, n: number = -1;
        
        for (let i = 0, j = threshold; i <= threshold && j >= 0; i++, j--) {
            if (i < j) {
                m = random(i + 1, j, false);
                n = random(i, j - 1, false);
            }

            if (i > j) {
                m = random(j + 1, i - 1, false);
                n = random(j + 1, i - 1, false);
            }            

            source[i].color = PRIMARY_ONE_COLOR;
            source[m].color = SECONDARY_ONE_COLOR;
            source[j].color = PRIMARY_TWO_COLOR;
            source[n].color = SECONDARY_TWO_COLOR;
            callback({ times: 0, datalist: source });

            await swap(source, i, m);
            await swap(source, j, n);
            await delay();

            source[i].color = SECONDARY_ONE_COLOR;
            source[m].color = PRIMARY_ONE_COLOR;
            source[j].color = SECONDARY_TWO_COLOR;
            source[n].color = PRIMARY_TWO_COLOR;
            callback({ times: 0, datalist: source });

            await delay();

            source[i].color = CLEAR_COLOR;
            source[m].color = CLEAR_COLOR;
            source[j].color = CLEAR_COLOR;
            source[n].color = CLEAR_COLOR;
            callback({ times: 0, datalist: source });
        }
        
        await delay();
        callback({ times: 0, datalist: source });
    }

    public dispose(): void {
        if (this.source.length > 0) {
            this.source.splice(0);
        }

        this.subject.complete();
    }

}

@Injectable()
export class SortToolsService {

    private array: number[] = Array.from([]);

    public async mergeByAscent(source: SortDataModel[], lhs: number, mid: number, rhs: number, times: number, callback: (param: SortStateModel) => void): Promise<number> {
        let i: number = lhs, j: number = mid + 1;
        
        while (i <= mid && j <= rhs) {
            times += 1;

            source[i].color = ACCENT_ONE_COLOR;
            source[j].color = ACCENT_TWO_COLOR;
            callback({ times, datalist: source });

            await delay();

            source[i].color = CLEAR_COLOR;
            source[j].color = CLEAR_COLOR;
            callback({ times, datalist: source });

            if (source[i].value < source[j].value) {
                this.array.push(source[i].value);
                i += 1;
            } else {
                this.array.push(source[j].value);
                j += 1;
            }
        }

        while (i <= mid) {
            await this.swapAndRender(source, false, false, i, i, ACCENT_ONE_COLOR, ACCENT_ONE_COLOR, ACCENT_ONE_COLOR, times, callback);

            this.array.push(source[i].value);

            i += 1;
            times += 1;
        }

        while (j <= rhs) {
            await this.swapAndRender(source, false, false, j, j, ACCENT_TWO_COLOR, ACCENT_TWO_COLOR, ACCENT_TWO_COLOR, times, callback);

            this.array.push(source[j].value);

            j += 1;
            times += 1;
        }

        for (let k = 0, length = this.array.length; k < length; k++) {
            source[k + lhs].value = this.array[k];

            await this.swapAndRender(source, false, false, k + lhs, k + lhs, ACCENT_COLOR, ACCENT_COLOR, ACCENT_COLOR, times, callback);

            times += 1;
        }

        this.array.splice(0);
        return times;
    }

    public async mergeByDescent(source: SortDataModel[], lhs: number, mid: number, rhs: number, times: number, callback: (param: SortStateModel) => void): Promise<number> {
        let i: number = mid, j: number = rhs;
        
        while (i >= lhs && j >= mid + 1) {
            times += 1;

            source[i].color = ACCENT_ONE_COLOR;
            source[j].color = ACCENT_TWO_COLOR;
            callback({ times, datalist: source });

            await delay();

            source[i].color = CLEAR_COLOR;
            source[j].color = CLEAR_COLOR;
            callback({ times, datalist: source });

            if (source[i].value < source[j].value) {
                this.array.push(source[i].value);
                i -= 1;
            } else {
                this.array.push(source[j].value);
                j -= 1;
            }
        }

        while (i >= lhs) {
            await this.swapAndRender(source, false, false, i, i, ACCENT_ONE_COLOR, ACCENT_ONE_COLOR, ACCENT_ONE_COLOR, times, callback);

            this.array.push(source[i].value);

            i -= 1;
            times += 1;
        }

        while (j >= mid + 1) {
            await this.swapAndRender(source, false, false, j, j, ACCENT_TWO_COLOR, ACCENT_TWO_COLOR, ACCENT_TWO_COLOR, times, callback);

            this.array.push(source[j].value);

            j -= 1;
            times += 1;
        }

        for (let k = 0, length = this.array.length; k < length; k++) {
            source[rhs - k].value = this.array[k];

            await this.swapAndRender(source, false, false, rhs - k, rhs - k, ACCENT_COLOR, ACCENT_COLOR, ACCENT_COLOR, times, callback);

            times += 1;
        }

        this.array.splice(0);
        return times;
    }

    public async stableGapSortByAscent(source: SortDataModel[], lhs: number, rhs: number, gap: number, step: number, times: number, callback: (param: SortStateModel) => void): Promise<number> {
        for (let i = lhs + gap; i <= rhs; i += step) {
            for (let j = i - gap; j >= lhs && source[j].value > source[j + gap].value; j -= gap) {
                times += 1;
                
                source[i].color = ACCENT_COLOR;
                source[j].color = PRIMARY_COLOR;
                source[j + gap].color = SECONDARY_COLOR;
                callback({ times, datalist: source });

                await swap(source, j + gap, j);
                await delay();

                source[i].color = ACCENT_COLOR;
                source[j].color = CLEAR_COLOR;
                source[j + gap].color = CLEAR_COLOR;
                callback({ times, datalist: source });
            }

            source[i].color = CLEAR_COLOR;
            callback({ times, datalist: source });
        }
        
        return times;
    }

    public async stableGapSortByDescent(source: SortDataModel[], lhs: number, rhs: number, gap: number, step: number, times: number, callback: (param: SortStateModel) => void): Promise<number> {
        for (let i = rhs - gap; i >= lhs; i -= step) {
            for (let j = i + gap; j <= rhs && source[j].value > source[j - gap].value; j += gap) {
                times += 1;
                
                callback({ times, datalist: source});
                source[j].color = PRIMARY_COLOR;
                source[j - gap].color = SECONDARY_COLOR;
                callback({ times, datalist: source});
                
                await swap(source, j, j - gap);
                await delay();

                callback({ times, datalist: source});
                source[j].color = CLEAR_COLOR;
                source[j - gap].color = CLEAR_COLOR;
                callback({ times, datalist: source});
            }

            source[i].color = CLEAR_COLOR;
            callback({ times, datalist: source});
        }
        
        return times;
    }

    public async swapAndRender(source: SortDataModel[], completed: boolean, flag: boolean, m: number, n: number, primaryColor: string, secondaryColor: string, accentColor: string, times: number, callback: (param: SortStateModel) => void): Promise<[boolean, number]> {
        source[m].color = flag ? primaryColor : accentColor;
        source[n].color = flag ? secondaryColor : (m === n ? accentColor : CLEAR_COLOR);
        callback({ times, datalist: source });
    
        if (flag) {
            completed = false;
            times += 1;
    
            await swap(source, n, m);
            await delay();
    
            source[m].color = flag ? secondaryColor : accentColor;
            source[n].color = flag ? primaryColor : (m === n ? accentColor : CLEAR_COLOR);
            callback({ times, datalist: source });
        }
    
        await delay();
    
        source[m].color = CLEAR_COLOR;
        source[n].color = CLEAR_COLOR;
        callback({ times, datalist: source });
    
        return [completed, times];
    }

    public findMinMaxValue(source: SortDataModel[]): [number, number] {
        let min: number = Number.MAX_SAFE_INTEGER, max: number = Number.MIN_SAFE_INTEGER;
        
        for (let i = 0, length = source.length; i < length; i++) {
            if (source[i].value < min) {
                min = source[i].value;
            }

            if (source[i].value > max) {
                max = source[i].value;
            }
        }

        return [min, max];
    }

    public indexOfMaxValue(source: SortDataModel[], lhs: number, rhs: number): number {
        if (rhs - lhs <= 1) {
            return source[lhs].value > source[rhs].value ? source[lhs].value : source[rhs].value;
        }

        const mid: number = Math.floor((rhs - lhs) * 0.5 + lhs);
        const fst: number = this.indexOfMaxValue(source, lhs, mid);
        const snd: number = this.indexOfMaxValue(source, mid + 1, rhs);
        return fst > snd ? fst : snd;
    }

    public indexOfMinValue(source: SortDataModel[], lhs: number, rhs: number): number {
        if (rhs - lhs <= 1) {
            return source[lhs].value < source[rhs].value ? source[lhs].value : source[rhs].value;
        }

        const mid: number = Math.floor((rhs - lhs) * 0.5 + lhs);
        const fst: number = this.indexOfMaxValue(source, lhs, mid);
        const snd: number = this.indexOfMaxValue(source, mid + 1, rhs);
        return fst < snd ? fst : snd;
    }

    public binarySearchByAscent(source: SortDataModel[], target: SortDataModel, lhs: number, rhs: number): number {
        let mid: number;

        while (lhs <= rhs) {
            mid = Math.floor((rhs - lhs) * 0.5 + lhs);

            if (source[mid].value < target.value) {
                lhs = mid + 1;
            } else if (source[mid].value > target.value) {
                rhs = mid - 1;
            } else {
                return mid;
            }
        }
        
        return -1;
    } 

    public binarySearchByDescent(source: SortDataModel[], target: SortDataModel, lhs: number, rhs: number): number {
        let mid: number;

        while (lhs <= rhs) {
            mid = Math.floor((rhs - lhs) * 0.5 + lhs);

            if (source[mid].value > target.value) {
                lhs = mid + 1;
            } else if (source[mid].value < target.value) {
                rhs = mid - 1;
            } else {
                return mid;
            }
        }
        
        return -1;
    } 

    public indexOfFGTByAscent(source: SortDataModel[], target: SortDataModel, lhs: number, rhs: number): number {
        let mid: number;

        while (lhs <= rhs) {
            mid = Math.floor((rhs - lhs) * 0.5 + lhs);

            if (source[mid].value < target.value) {
                lhs = mid + 1;
            } else {
                rhs = mid - 1;
            }
        }
        
        return lhs === source.length ? -1 : lhs;
    } 

    public indexOfFGTByDescent(source: SortDataModel[], target: SortDataModel, lhs: number, rhs: number): number {
        let mid: number;

        while (lhs <= rhs) {
            mid = Math.floor((rhs - lhs) * 0.5 + lhs);

            if (source[mid].value > target.value) {
                lhs = mid + 1;
            } else {
                rhs = mid - 1;
            }
        }
        
        return rhs === -1 ? -1 : lhs - 1;
    } 

    public indexOfFLT(source: SortDataModel[], target: SortDataModel, lhs: number, rhs: number): number {
        let mid: number;

        while (lhs <= rhs) {
            mid = Math.floor((rhs - lhs) * 0.5 + lhs);

            if (source[mid].value > target.value) {
                lhs = mid + 1;
            } else {
                rhs = mid - 1;
            }
        }
        
        return lhs === source.length ? -1 : lhs;
    } 

    public async clear(dict: { [key: string | number]: any[] }): Promise<void> {
        for (const key of Object.keys(dict)) {
            dict[key].splice(0);
            delete dict[key];
        }
    }

}

@Injectable()
export class SortMatchService {

    constructor(
        private _bubble: BubbleSortService,
        private _shakerBubble: ShakerBubbleSortService,
        private _2wBubble: TwoWayBubbleSortService,
        private _shellBubble: ShellBubbleSortService,
        private _comb: CombSortService,
        private _oddEven: OddEvenSortService,
        private _exchange: ExchangeSortService,
        private _insertion: InsertionSortService,
        private _bsInsertion: BinarySearchInserionSortService,
        private _library: LibrarySortService,
        private _shell: ShellSortService,
        private _selection: SelectionSortService,
        private _2wSelection: TwoWaySelectionSortService,
        private _biSelection: ShakerSelectionSortService,
        private _recuQuick: RecursiveQuickSortService,
        private _iterQuick: IterativeQuickSortService,
        private _2wRecuQuick: RecursiveTwoWayQuickSortService,
        private _2wIterQuick: IterativeTwoWayQuickSortService,
        private _3wRecuQuick: ThreeWayRecursiveQuickSortService,
        private _3wIterQuick: ThreeWayIterativeQuickSortService,
        private _dpRecuQuick: RecursiveDualPivotQuickSortService,
        private _dpIterQuick: IterativeDualPivotQuickSortService,
        private _averRecuQuick: RecursiveAverageQuickSortService,
        private _averIterQuick: IterativeAverageQuickSortService,
        private _heap: HeapSortService,
        private _knHeap: TernaryHeapSortService,
        private _smooth: SmoothSortService,

        private _bucket: BucketSortService,
        private _count: CountSortService,
        private _interpolation: InterpolationSortService,
        private _pigeonhole: PigeonholeSortService,
        private _radixLSD: RadixLSDSortService,
        private _recuRadixMSD: RecursiveRadixMSDSortService,
        private _iterRadixMSD: IterativeRadixMSDSortService,
        private _tdMerge: TopDownMergeSortService,
        private _buMerge: BottomUpMergeSortService,
        private _tdIPMerge: RecursiveInPlaceMergeSortService,
        private _buIPMerge: IterativeInPlaceMergeSortService,
        private _kMerge: MultiWayMergeSortService,
        private _tim: TimSortService,

        private _tdBitonic: TopDownBitonicMergeSortService,
        private _buBitonic: BottomUpBitonicMergeSortService,
        private _tdOddEven: TopDownOddEvenMergeSortService,
        private _buOddEven: BottomUpOddEvenMergeSortService,
        private _shear: ShearSortService,
        private _optShear: OptimalShearSortService,

        private _bst: BinarySearchTreeSortService,
        private _bogo: BogoSortService,
        private _bogoBubble: BogoBubbleSortService,
        private _bogoShakerBubble: BogoShakerBubbleSortService,
        private _bogoInsertion: BogoInsertionSortService,
        private _bogoSelection: BogoSelectionSortService,
        private _cycle: CycleSortService,
        private _gnome: GnomeSortService,
        private _gravity: GravitySortService,
        private _pancake: PancakeSortService,
        private _patience: PatienceSortService,
        private _syncSleep: SyncSleepSortService,
        private _asyncSleep: AsyncSleepSortService,
        private _recrStooge: RecursiveStoogeSortService,
        private _iterStooge: IterativeStoogeSortService,
        private _slow: SlowSortService,
        private _strand: StrandSortService,
        private _optStrand: OptimalStrandSortService,
        private _tournament: TournamentSortService,
    ) {}

    public match(name: string, array: SortDataModel[], order: SortOrder, radix: SortRadix, way: number, node: number): Observable<SortStateModel | null> {
        console.warn('name:', name, 'radix:', radix, 'way:', way, 'node:', node);
        if (!array.every(item => item.color === CLEAR_COLOR)) {
            for (let i = 0, length = array.length; i < length; i++) {
                array[i].color = CLEAR_COLOR;
            }
        }
        
        if (name === 'bubble-sort') {
            return this._bubble.sort(array, order);
        }

        if (name === 'shaker-bubble-sort') {
            return this._shakerBubble.sort(array, order);
        }

        if (name === '2w-bubble-sort') {
            return this._2wBubble.sort(array, order);
        }

        if (name === 'shell-bubble-sort') {
            return this._shellBubble.sort(array, order);
        }

        if (name === 'comb-sort') {
            return this._comb.sort(array, order);
        }

        if (name === 'odd-even-sort') {
            return this._oddEven.sort(array, order);
        }

        if (name === 'exchange-sort') {
            return this._exchange.sort(array, order);
        }

        if (name === 'insertion-sort') {
            return this._insertion.sort(array, order);
        }

        if (name === 'bs-insertion-sort') {
            return this._bsInsertion.sort(array, order);
        }

        if (name === 'shell-sort') {
            return this._shell.sort(array, order);
        }

        if (name === 'selection-sort') {
            return this._selection.sort(array, order);
        }

        if (name === 'bi-selection-sort') {
            return this._biSelection.sort(array, order);
        }

        if (name === '2w-selection-sort') {
            return this._2wSelection.sort(array, order);
        }

        if (name === 'recu-quick-sort') {
            return this._recuQuick.sort(array, order);
        }

        if (name === 'iter-quick-sort') {
            return this._iterQuick.sort(array, order);
        }

        if (name === '2wr-quick-sort') {
            return this._2wRecuQuick.sort(array, order);
        }

        if (name === '2wi-quick-sort') {
            return this._2wIterQuick.sort(array, order);
        }

        if (name === '3wr-quick-sort') {
            return this._3wRecuQuick.sort(array, order);
        }

        if (name === '3wi-quick-sort') {
            return this._3wIterQuick.sort(array, order);
        }

        if (name === 'dpr-quick-sort') {
            return this._dpRecuQuick.sort(array, order);
        }

        if (name === 'dpi-quick-sort') {
            return this._dpIterQuick.sort(array, order);
        }

        if (name === 'ar-quick-sort') {
            return this._averRecuQuick.sort(array, order);
        }

        if (name === 'ai-quick-sort') {
            return this._averIterQuick.sort(array, order);
        }

        if (name === 'heap-sort') {
            return this._heap.sort(array, order);
        }

        if (name === 'kn-heap-sort') {
            return this._knHeap.sort(array, order, node);
        }

        if (name === 'smooth-sort') {
            return this._smooth.sort(array, order);
        }


        if (name === 'bucket-sort') {
            return this._bucket.sort(array, order);
        }

        if (name === 'interpolation-sort') {
            return this._interpolation.sort(array, order);
        }
        if (name === 'pigeonhole-sort') {
            return this._pigeonhole.sort(array, order);
        }

        if (name === 'count-sort') {
            return this._count.sort(array, order);
        }

        if (name === 'lsd-radix-sort') {
            return this._radixLSD.sort(array, order, radix);
        }

        if (name === 'recu-msd-radix-sort') {
            return this._recuRadixMSD.sort(array, order, radix);
        }

        if (name === 'iter-msd-radix-sort') {
            return this._iterRadixMSD.sort(array, order, radix);
        }

        if (name === 'td-merge-sort') {
            return this._tdMerge.sort(array, order);
        }

        if (name === 'bu-merge-sort') {
            return this._buMerge.sort(array, order);
        }

        if (name === 'kw-merge-sort') {
            return this._kMerge.sort(array, order, way);
        }

        if (name === 'td-ip-merge-sort') {
            return this._tdIPMerge.sort(array, order);
        }

        if (name === 'bu-ip-merge-sort') {
            return this._buIPMerge.sort(array, order);
        }

        if (name === 'tim-sort') {
            return this._tim.sort(array, order);
        }


        if (name === 'td-odd-even-merge-sort') {
            return this._tdOddEven.sort(array, order);
        }

        if (name === 'bu-odd-even-merge-sort') {
            return this._buOddEven.sort(array, order);
        }

        if (name === 'td-bitonic-merge-sort') {
            return this._tdBitonic.sort(array, order);
        }

        if (name === 'bu-bitonic-merge-sort') {
            return this._buBitonic.sort(array, order);
        }

        if (name === 'shear-sort') {
            return this._shear.sort(array, order);
        }

        if (name === 'insertion-shear-sort') {
            return this._optShear.sort(array, order, 'insertion');
        }

        if (name === 'selection-shear-sort') {
            return this._optShear.sort(array, order, 'selection');
        }


        if (name === 'bst-sort') {
            return this._bst.sort(array, order);
        }

        if (name === 'bogo-sort') {
            return this._bogo.sort(array, order);
        }

        if (name === 'bogo-bubble-sort') {
            return this._bogoBubble.sort(array, order);
        }

        if (name === 'bogo-shaker-bubble-sort') {
            return this._bogoShakerBubble.sort(array, order);
        }

        if (name === 'bogo-insertion-sort') {
            return this._bogoInsertion.sort(array, order);
        }

        if (name === 'bogo-selection-sort') {
            return this._bogoSelection.sort(array, order);
        }

        if (name === 'cycle-sort') {
            return this._cycle.sort(array, order);
        }

        if (name === 'gravity-sort') {
            return this._gravity.sort(array, order);
        }

        if (name === 'gnome-sort') {
            return this._gnome.sort(array, order);
        }

        if (name === 'library-sort') {
            return this._library.sort(array, order);
        }

        if (name === 'pancake-sort') {
            return this._pancake.sort(array, order);
        }

        if (name === 'patience-sort') {
            return this._patience.sort(array, order);
        }

        if (name === 'sleep-sort') {
            return this._syncSleep.sort(array, order);
        }

        if (name === 'async-sleep-sort') {
            return this._asyncSleep.sort(array, order);
        }

        if (name === 'slow-sort') {
            return this._slow.sort(array, order);
        }

        if (name === 'recu-stooge-sort') {
            return this._recrStooge.sort(array, order);
        }

        if (name === 'iter-stooge-sort') {
            return this._iterStooge.sort(array, order);
        }

        if (name === 'strand-sort') {
            return this._strand.sort(array, order);
        }

        if (name === 'opt-strand-sort') {
            return this._optStrand.sort(array, order);
        }

        if (name === 'tournament-sort') {
            return this._tournament.sort(array, order);
        }

        return of(null);
    }

}
