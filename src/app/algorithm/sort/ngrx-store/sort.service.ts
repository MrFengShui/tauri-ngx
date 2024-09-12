import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable, of, map, Subject, debounceTime, BehaviorSubject } from "rxjs";
import { floor, random } from 'lodash';
import { DES, HmacSHA256, enc } from 'crypto-js';

import { SortDataModel, SortStateModel, SortOrder, SortRadix, SortOrderOptionModel, SortRadixOptionModel, SortMergeWayOptionModel, SortHeapNodeOptionModel, SortMetadataModel } from "../ngrx-store/sort.state";

import { delay } from "../../../public/global.utils";
import { CLEAR_COLOR, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, PRIMARY_ONE_COLOR, SECONDARY_ONE_COLOR,  PRIMARY_TWO_COLOR, SECONDARY_TWO_COLOR } from "../../../public/global.utils";


import { BubbleSortService, ShakerBubbleSortService, ExchangeSortService, DualBubbleSortService, ShellBubbleSortService, MergeBubbleSortService, ShakerOddEvenSortService } from "../service/bubble-sort.service";
import { BinaryInserionSortService, InsertionSortService, ShakerInsertionSortService, ShellSortService } from "../service/insertion-sort.service";
import { LibrarySortService } from "../service/insertion-sort.service";
import { ShakerSelectionSortService, SelectionSortService, TwoWaySelectionSortService, ShakerPancakeSortService } from "../service/selection-sort.service";
import { BubbleBogoSortService, ShakerBubbleBogoSortService, InsertionBogoSortService, SelectionBogoSortService, BogoSortService, BogoInversePairSortService, ParallelBogoSortService, MergeBogoSortService } from "../service/bogo-sort.service";
import { IterativeAverageQuickSortService, RecursiveAverageQuickSortService, IterativeDualPivotQuickSortService, RecursiveDualPivotQuickSortService, IterativeQuickSortService, RecursiveQuickSortService, ThreeWayIterativeQuickSortService, ThreeWayRecursiveQuickSortService, IterativeTwoWayQuickSortService, RecursiveTwoWayQuickSortService } from "../service/quick-sort.service";
import { CountSortService } from "../service/count-sort.service";
import { BucketSortService, InterpolationSortService, PigeonholeSortService } from "../service/bucket-sort.service";
import { InPlaceRadixLSDSortService, InPlaceRadixMSDSortService, IterativeRadixMSDSortService, RadixLSDSortService, RecursiveRadixMSDSortService } from "../service/radix-sort.service";
import { SleepSortService } from "../service/sleep-sort.service";
import { IterativeCycleSortService, RecursiveCycleSortService } from "../service/cycle-sort.service";
import { TernaryHeapSortService } from "../service/selection-sort.service";
import { HeapSortService } from "../service/selection-sort.service";
import { RecursiveMergeSortService, MultiWayMergeSortService, IterativeMergeSortService, RecursiveInPlaceMergeSortService, IterativeInPlaceMergeSortService, RecursiveWeaveMergeSortService, InPlaceRecursiveWeaveMergeSortService, IterativeWeaveMergeSortService, InPlaceIterativeWeaveMergeSortService, InPlaceStrandSortService } from "../service/merge-sort.service";
import { IterativeStoogeSortService, RecursiveStoogeSortService } from "../service/stooge-sort.service";
import { SlowSortService } from "../service/slow-sort.service";
import { GnomeSortService } from "../service/insertion-sort.service";
import { TournamentSortService } from "../service/selection-sort.service";
import { BottomUpBitonicMergeSortService, TopDownBitonicMergeSortService } from "../service/bitonic-merge-sort.service";
import { OddEvenSortService } from "../service/bubble-sort.service";
import { CombSortService } from "../service/bubble-sort.service";
import { PancakeSortService } from "../service/selection-sort.service";
import { GravitySortService } from "../service/gravity-sort.service";
import { BottomUpOddEvenMergeSortService, TopDownOddEvenMergeSortService } from "../service/odd-even-merge-sort.service";
import { PatienceSortService } from "../service/patience-sort.service";
import { IterativeStrandSortService } from "../service/merge-sort.service";
import { RecursiveStrandSortService } from "../service/merge-sort.service";
import { TimSortService } from "../service/merge-sort.service";
import { LocaleIDType } from "../../../main/ngrx-store/main.state";
import { BinarySearchTreeSortService } from "../service/tree-sort.service";
import { SmoothSortService } from "../service/selection-sort.service";
import { OptimalShearSortService, ShearSortService } from "../service/shear-sort.service";
import { BlockSortService } from "../service/block-sort.service";
import { GuessSortService } from "../service/cycle-sort.service";
import { IterativeIntrospectiveSortService, RecursiveIntrospectiveSortService } from "../service/intro-sort.service";
import { IterativeCircleSortService, RecursiveCircleSortService } from "../service/circle-sort.service";
import { StalinSortService, InPlaceStalinSortService, BinaryStalinSortService } from "../service/stalin-sort.service";
import { InPlaceLogSortService, LogSortService } from "../service/log-sort.service";

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

    constructor(private _service: SortToolsService) {}
    
    public createDataList(size: number, unique: boolean): Observable<SortDataModel[]> {
        let index: number = random(0, size - 1, false), value: number;

        if (this.source.length > 0) {
            this.source.splice(0);
        }

        for(let i = 0; i < size; i++) {
            if (unique) {
                value = i + 1;
            } else {
                value = i === index ? size : random(1, size - 1, false);
            }
            
            this.source.push({ color: CLEAR_COLOR, value });
        }
        
        this.subject.next(this.source);
        return this.subject.asObservable().pipe(debounceTime(100));
    }

    public importDataList(file: File | null): Observable<SortDataModel[]> {
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

                for(let i = 0; i < size; i++) {
                    this.source.push({ color: CLEAR_COLOR, value: list[i] });
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

            await this._service.swap(source, i, m);
            await this._service.swap(source, j, n);
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

    public async stableGapSortByAscent(source: SortDataModel[], lhs: number, rhs: number, gap: number, step: number, times: number, callback: (param: SortStateModel) => void): Promise<number> {
        for (let i = lhs + gap; i <= rhs; i += step) {
            for (let j = i - gap; j >= lhs && source[j].value > source[j + gap].value; j -= gap) {
                times += 1;
                
                source[i].color = ACCENT_COLOR;
                source[j].color = PRIMARY_COLOR;
                source[j + gap].color = SECONDARY_COLOR;
                callback({ times, datalist: source });

                await this.swap(source, j + gap, j);
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
                
                source[i].color = ACCENT_COLOR;
                source[j].color = PRIMARY_COLOR;
                source[j - gap].color = SECONDARY_COLOR;
                callback({ times, datalist: source});
                
                await this.swap(source, j, j - gap);
                await delay();

                source[i].color = ACCENT_COLOR;
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
    
            await this.swap(source, n, m);
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

    public async swap(source: SortDataModel[], fst: number, snd: number): Promise<void> {
        const temp: SortDataModel = source[fst];
        source[fst] = source[snd];
        source[snd] = temp;
    };

    public findMinMaxValue(source: SortDataModel[], lhs: number, rhs: number): [number, number] {
        let minValue: number = Number.MAX_SAFE_INTEGER, maxValue: number = Number.MIN_SAFE_INTEGER;
        
        for (let i = lhs; i <= rhs; i++) {
            if (source[i].value < minValue) {
                minValue = source[i].value;
            }

            if (source[i].value > maxValue) {
                maxValue = source[i].value;
            }
        }

        return [minValue, maxValue];
    }

    public binarySearchByAscent(source: SortDataModel[], target: SortDataModel, lhs: number, rhs: number): number {
        let mid: number;

        while (lhs <= rhs) {
            mid = floor((rhs - lhs) * 0.5 + lhs, 0);

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
            mid = floor((rhs - lhs) * 0.5 + lhs, 0);

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

    constructor(
        private _exchange: ExchangeSortService,
        private _bubble: BubbleSortService,
        private _shakerBubble: ShakerBubbleSortService,
        private _dualBubble: DualBubbleSortService,
        private _mergeBubble: MergeBubbleSortService,
        private _shellBubble: ShellBubbleSortService,
        private _comb: CombSortService,
        private _oddEven: OddEvenSortService,
        private _shakerOddEvent: ShakerOddEvenSortService,
        private _gnome: GnomeSortService,
        private _insert: InsertionSortService,
        private _shakerInsert: ShakerInsertionSortService,
        private _binInsert: BinaryInserionSortService,
        private _library: LibrarySortService,
        private _shell: ShellSortService,
        private _select: SelectionSortService,
        private _2wSelect: TwoWaySelectionSortService,
        private _shakerSelect: ShakerSelectionSortService,
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
        private _recuCircle: RecursiveCircleSortService,
        private _iterCircle: IterativeCircleSortService,
        private _heap: HeapSortService,
        private _knHeap: TernaryHeapSortService,
        private _smooth: SmoothSortService,
        private _ipRadixLSD: InPlaceRadixLSDSortService,
        private _ipRadixMSD: InPlaceRadixMSDSortService,

        private _bucket: BucketSortService,
        private _block: BlockSortService,
        private _count: CountSortService,
        private _interpolation: InterpolationSortService,
        private _pigeonhole: PigeonholeSortService,
        private _radixLSD: RadixLSDSortService,
        private _recuRadixMSD: RecursiveRadixMSDSortService,
        private _iterRadixMSD: IterativeRadixMSDSortService,
        private _tdMerge: RecursiveMergeSortService,
        private _buMerge: IterativeMergeSortService,
        private _tdIPMerge: RecursiveInPlaceMergeSortService,
        private _buIPMerge: IterativeInPlaceMergeSortService,
        private _kwMerge: MultiWayMergeSortService,
        private _recuWeaveMerge: RecursiveWeaveMergeSortService,
        private _iterWeaveMerge: IterativeWeaveMergeSortService,
        private _ipRecuWeaveMerge: InPlaceRecursiveWeaveMergeSortService,
        private _ipIterWeaveMerge: InPlaceIterativeWeaveMergeSortService,
        private _recuStrand: RecursiveStrandSortService,
        private _iterStrand: IterativeStrandSortService,
        private _ipStrand: InPlaceStrandSortService,

        private _tdBitonic: TopDownBitonicMergeSortService,
        private _buBitonic: BottomUpBitonicMergeSortService,
        private _tdOddEven: TopDownOddEvenMergeSortService,
        private _buOddEven: BottomUpOddEvenMergeSortService,
        private _shear: ShearSortService,
        private _optShear: OptimalShearSortService,
        
        private _recuIntro: RecursiveIntrospectiveSortService,
        private _iterIntro: IterativeIntrospectiveSortService,
        private _tim: TimSortService,

        private _bst: BinarySearchTreeSortService,
        private _bogo: BogoSortService,
        private _paraBogo: ParallelBogoSortService,
        private _bogoInversePair: BogoInversePairSortService,
        private _bubbleBogo: BubbleBogoSortService,
        private _shakerBubbleBogo: ShakerBubbleBogoSortService,
        private _insertBogo: InsertionBogoSortService,
        private _selectBogo: SelectionBogoSortService,
        private _mergeBogo: MergeBogoSortService,
        private _recuCycle: RecursiveCycleSortService,
        private _iterCycle: IterativeCycleSortService,
        private _gravity: GravitySortService,
        private _guess: GuessSortService,
        private _log: LogSortService,
        private _ipLog: InPlaceLogSortService,
        private _pancake: PancakeSortService,
        private _shakerPancake: ShakerPancakeSortService,
        private _patience: PatienceSortService,
        private _sleep: SleepSortService,
        private _stalin: StalinSortService,
        private _binStalin: BinaryStalinSortService,
        private _ipStalin: InPlaceStalinSortService,
        private _recrStooge: RecursiveStoogeSortService,
        private _iterStooge: IterativeStoogeSortService,
        private _slow: SlowSortService,
        private _tournament: TournamentSortService
    ) {}

    public match(name: string, array: SortDataModel[], order: SortOrder, radix: SortRadix, way: number, node: number): Observable<SortStateModel | null> {
        console.warn('name:', name, 'radix:', radix, 'way:', way, 'node:', node);
        if (!array.every(item => item.color === CLEAR_COLOR)) {
            for (let i = 0, length = array.length; i < length; i++) {
                array[i].color = CLEAR_COLOR;
            }
        }
        
        if (name === 'exchange-sort') {
            return this._exchange.sort(array, order);
        }

        if (name === 'bubble-sort') {
            return this._bubble.sort(array, order);
        }

        if (name === 'shaker-bubble-sort') {
            return this._shakerBubble.sort(array, order);
        }

        if (name === '2w-bubble-sort') {
            return this._dualBubble.sort(array, order);
        }

        if (name === 'merge-bubble-sort') {
            return this._mergeBubble.sort(array, order);
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

        if (name === 'shaker-odd-even-sort') {
            return this._shakerOddEvent.sort(array, order);
        }

        if (name === 'gnome-sort') {
            return this._gnome.sort(array, order);
        }

        if (name === 'insertion-sort') {
            return this._insert.sort(array, order);
        }

        if (name === 'shaker-insertion-sort') {
            return this._shakerInsert.sort(array, order);
        }

        if (name === 'bs-insertion-sort') {
            return this._binInsert.sort(array, order);
        }

        if (name === 'shell-sort') {
            return this._shell.sort(array, order);
        }

        if (name === 'selection-sort') {
            return this._select.sort(array, order);
        }

        if (name === 'bi-selection-sort') {
            return this._shakerSelect.sort(array, order);
        }

        if (name === '2w-selection-sort') {
            return this._2wSelect.sort(array, order);
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

        if (name === 'recu-circle-sort') {
            return this._recuCircle.sort(array, order);
        }

        if (name === 'iter-circle-sort') {
            return this._iterCircle.sort(array, order);
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

        if (name === 'ip-lsd-radix-sort') {
            return this._ipRadixLSD.sort(array, order, radix);
        }

        if (name === 'ip-msd-radix-sort') {
            return this._ipRadixMSD.sort(array, order, radix);
        }


        if (name === 'bucket-sort') {
            return this._bucket.sort(array, order);
        }

        if (name === 'block-sort') {
            return this._block.sort(array, order);
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

        if (name === 'recu-merge-sort') {
            return this._tdMerge.sort(array, order);
        }

        if (name === 'iter-merge-sort') {
            return this._buMerge.sort(array, order);
        }

        if (name === 'recu-ip-merge-sort') {
            return this._tdIPMerge.sort(array, order);
        }

        if (name === 'iter-ip-merge-sort') {
            return this._buIPMerge.sort(array, order);
        }

        if (name === 'recu-weave-merge-sort') {
            return this._recuWeaveMerge.sort(array, order);
        }

        if (name === 'iter-weave-merge-sort') {
            return this._iterWeaveMerge.sort(array, order);
        }

        if (name === 'ip-recu-weave-merge-sort') {
            return this._ipRecuWeaveMerge.sort(array, order);
        }

        if (name === 'ip-iter-weave-merge-sort') {
            return this._ipIterWeaveMerge.sort(array, order);
        }

        if (name === 'kw-merge-sort') {
            return this._kwMerge.sort(array, order, way);
        }
        
        if (name === 'recu-strand-sort') {
            return this._recuStrand.sort(array, order);
        }

        if (name === 'iter-strand-sort') {
            return this._iterStrand.sort(array, order);
        }

        if (name === 'ip-strand-sort') {
            return this._ipStrand.sort(array, order);
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

        
        if (name === 'recu-intro-sort') {
            return this._recuIntro.sort(array, order);
        }
        
        if (name === 'iter-intro-sort') {
            return this._iterIntro.sort(array, order);
        }

        if (name === 'tim-sort') {
            return this._tim.sort(array, order);
        }


        if (name === 'bst-sort') {
            return this._bst.sort(array, order);
        }

        if (name === 'bogo-sort') {
            return this._bogo.sort(array, order);
        }

        if (name === 'parallel-bogo-sort') {
            return this._paraBogo.sort(array, order);
        }

        if (name === 'bogo-inverse-pair-sort') {
            return this._bogoInversePair.sort(array, order);
        }

        if (name === 'bubble-bogo-sort') {
            return this._bubbleBogo.sort(array, order);
        }

        if (name === 'shaker-bubble-bogo-sort') {
            return this._shakerBubbleBogo.sort(array, order);
        }

        if (name === 'insertion-bogo-sort') {
            return this._insertBogo.sort(array, order);
        }

        if (name === 'selection-bogo-sort') {
            return this._selectBogo.sort(array, order);
        }

        if (name === 'merge-bogo-sort') {
            return this._mergeBogo.sort(array, order);
        }

        if (name === 'recu-cycle-sort') {
            return this._recuCycle.sort(array, order);
        }

        if (name === 'iter-cycle-sort') {
            return this._iterCycle.sort(array, order);
        }

        if (name === 'gravity-sort') {
            return this._gravity.sort(array, order);
        }

        if (name === 'guess-sort') {
            return this._guess.sort(array, order);
        }

        if (name === 'library-sort') {
            return this._library.sort(array, order);
        }

        if (name === 'log-sort') {
            return this._log.sort(array, order);
        }

        if (name === 'ip-log-sort') {
            return this._ipLog.sort(array, order);
        }

        if (name === 'pancake-sort') {
            return this._pancake.sort(array, order);
        }

        if (name === 'shaker-pancake-sort') {
            return this._shakerPancake.sort(array, order);
        }

        if (name === 'patience-sort') {
            return this._patience.sort(array, order);
        }

        if (name === 'sleep-sort') {
            return this._sleep.sort(array, order);
        }

        if (name === 'slow-sort') {
            return this._slow.sort(array, order);
        }

        if (name === 'stalin-sort') {
            return this._stalin.sort(array, order);
        }

        if (name === 'bin-stalin-sort') {
            return this._binStalin.sort(array, order);
        }

        if (name === 'ip-stalin-sort') {
            return this._ipStalin.sort(array, order);
        }

        if (name === 'recu-stooge-sort') {
            return this._recrStooge.sort(array, order);
        }

        if (name === 'iter-stooge-sort') {
            return this._iterStooge.sort(array, order);
        }

        if (name === 'tournament-sort') {
            return this._tournament.sort(array, order);
        }

        return of(null);
    }

}


