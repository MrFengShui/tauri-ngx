import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable, of, map } from "rxjs";
import { random } from 'lodash';

import { SortDataModel, SortStateModel, SortOrder, SortRadix, SortOrderOptionModel, SortRadixOptionModel, SortMergeWayOptionModel } from "../ngrx-store/sort.state";

import { CLEAR_COLOR, PRIMARY_COLOR, SECONDARY_COLOR, SORT_DELAY_DURATION, delay, swap } from "../sort.utils";

import { BubbleSortService, CooktailSortService } from "../service/bubble-sort.service";
import { BinarySearchInserionSortService, InsertionSortService, ShellSortService } from "../service/insertion-sort.service";
import { LibrarySortService } from "../service/library-sort.service";
import { BiSelectionSortService, SelectionSortService } from "../service/selection-sort.service";
import { BogoBubbleSortService, BogoCocktailSortService, BogoSortService } from "../service/bogo-sort.service";
import { DualPivotIterativeQuickSortService, DualPivotRecursiveQuickSortService, IterativeQuickSortService, RecursiveQuickSortService, ThreeWayIterativeQuickSortService, ThreeWayRecursiveQuickSortService, TwoWayIterativeQuickSortService, TwoWayRecursiveQuickSortService } from "../service/quick-sort.service";
import { CountSortService } from "../service/count-sort.service";
import { BucketSortService, InterpolationSortService, PigeonholeSortService } from "../service/bucket-sort.service";
import { RadixLSDSortService, RadixMSDSortService } from "../service/radix-sort.service";
import { SleepSortService } from "../service/sleep-sort.service";
import { CycleSortService } from "../service/cycle-sort.service";
import { HeapSortService, TernaryHeapSortService } from "../service/heap-sort.service";
import { TopDownMergeSortService, MultiWayMergeSortService, BottomUpMergeSortService, InPlaceMergeSortService } from "../service/merge-sort.service";
import { StoogeSortService } from "../service/stooge-sort.service";
import { SlowSortService } from "../service/slow-sort.service";
import { GnomeSortService } from "../service/gnome-sort.service";
import { TournamentSortService } from "../service/tournament-sort.service";
import { BottomUpBitonicMergeSortService, TopDownBitonicMergeSortService } from "../service/bitonic-merge-sort.service";
import { OddEvenSortService } from "../service/bubble-sort.service";
import { CombSortService } from "../service/bubble-sort.service";
import { PancakeSortService } from "../service/pancake-sort.service";
import { GravitySortService } from "../service/gravity-sort.service";
import { BottomUpOddEvenMergeSortService, TopDownOddEvenMergeSortService } from "../service/odd-even-merge-sort.service";
import { PatienceSortService } from "../service/patience-sort.service";
import { StrandSortService } from "../service/strand-sort.service";
import { TimSortService } from "../service/tim-sort.service";
import { LocaleIDType } from "../../../main/ngrx-store/main.state";

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
        return this._http.get<{ list: SortMergeWayOptionModel[] }>(`config/algorithm/sort/merge-way/merge-way.${localeID}.json`, { responseType: 'json' }).pipe(map(value => value.list));
    }

}

@Injectable()
export class SortUtilsService {

    public createDataList(size: number, name: string): Observable<SortDataModel[]> {
        return new Observable(subscriber => {
            const list: SortDataModel[] = Array.from([]);
            const binMaxLength: number = size.toString(2).length;
            const octMaxLength: number = size.toString(8).length;
            const decMaxLength: number = size.toString(10).length;
            const hexMaxLength: number = size.toString(16).length;
    
            for(let i = 0; i < size; i++) {
                list.push({ 
                    value: i + 1, color: CLEAR_COLOR,
                    radix: name.includes('radix-sort') ? { 
                        bin: (i + 1).toString(2).padStart(binMaxLength, '0'),
                        oct: (i + 1).toString(8).padStart(octMaxLength, '0'),
                        dec: (i + 1).toString(10).padStart(decMaxLength, '0'),
                        hex: (i + 1).toString(16).padStart(hexMaxLength, '0')
                    } : undefined
                });
            }
            
            subscriber.next(list);
            subscriber.complete();
        });
    }

    public shuffleDataList(source: SortDataModel[]): Observable<SortStateModel> {
        return new Observable(subscriber => {
            this.shuffle(source, param => subscriber.next(param)).then(() => subscriber.complete());
        });
    }

    private async shuffle(source: SortDataModel[], callback: (param: SortStateModel) => void): Promise<void> {
        const threshold: number = source.length - 1, temp: SortDataModel = { color: '', value: Number.NaN };
        let m: number = Number.NaN, n: number = Number.NaN;

        for (let i = 0, j = threshold; i <= threshold && j >= 0; i++, j--) {
            if (i < j) {
                m = random(i + 1, j, false);
                n = random(i, j - 1, false);
            }

            if (i > j) {
                m = random(j + 1, i - 1, false);
                n = random(j + 1, i - 1, false);
            }            

            source[i].color = PRIMARY_COLOR;
            source[j].color = SECONDARY_COLOR;
            callback({ times: 0, datalist: source });

            await swap(source, i, m, temp);
            await swap(source, j, n, temp);
            await delay(SORT_DELAY_DURATION);
            
            source[i].color = CLEAR_COLOR;
            source[j].color = CLEAR_COLOR;
            source[m].color = CLEAR_COLOR;
            source[n].color = CLEAR_COLOR;
            callback({ times: 0, datalist: source });
        }

        await delay(SORT_DELAY_DURATION);
        callback({ times: 0, datalist: source });
    }

}

@Injectable()
export class SortToolsService {

    public findMinMaxValue(source: SortDataModel[]): [number, number] {
        let min: number = Number.MAX_SAFE_INTEGER, max: number = Number.MIN_SAFE_INTEGER;
        
        for (const item of source) {
            if (item.value < min) {
                min = item.value;
            }

            if (item.value > max) {
                max = item.value;
            }
        }

        return [min, max];
    }

    public searchByAscent(source: SortDataModel[], target: SortDataModel, lhs: number, rhs: number): number {
        const mid = Math.floor((rhs - lhs) * 0.5 + lhs);

        if (target.value > source[mid].value) {
            return this.searchByAscent(source, target, mid + 1, rhs);
        } else if (target.value < source[mid].value) {
            return this.searchByAscent(source, target, lhs, mid - 1);
        } else {
            return mid;
        }
    } 

    public searchByDescent(source: SortDataModel[], target: SortDataModel, lhs: number, rhs: number): number {
        const mid = Math.floor((rhs - lhs) * 0.5 + lhs);

        if (target.value < source[mid].value) {
            return this.searchByAscent(source, target, mid + 1, rhs);
        } else if (target.value > source[mid].value) {
            return this.searchByAscent(source, target, lhs, mid - 1);
        } else {
            return mid;
        }
    } 

    public isSortedByAscent(source: SortDataModel[]): boolean {
        for (let i = 0; i < source.length - 1; i++) {
            if (source[i + 1].value < source[i].value) {
                return false;
            }
        }
    
        return true;
    }
    
    public isSortedByDescent (source: SortDataModel[]): boolean {
        for (let i = 0; i < source.length - 1; i++) {
            if (source[i + 1].value > source[i].value) {
                return false;
            }
        }
    
        return true;
    }

}

@Injectable()
export class SortMatchService {

    constructor(
        private _bubble: BubbleSortService,
        private _cooktail: CooktailSortService,
        private _comb: CombSortService,
        private _oddEven: OddEvenSortService,
        private _insertion: InsertionSortService,
        private _bsInsertion: BinarySearchInserionSortService,
        private _library: LibrarySortService,
        private _shell: ShellSortService,
        private _selection: SelectionSortService,
        private _biSelection: BiSelectionSortService,
        private _recuQuick: RecursiveQuickSortService,
        private _iterQuick: IterativeQuickSortService,
        private _2wRecuQuick: TwoWayRecursiveQuickSortService,
        private _2wIterQuick: TwoWayIterativeQuickSortService,
        private _3wRecuQuick: ThreeWayRecursiveQuickSortService,
        private _3wIterQuick: ThreeWayIterativeQuickSortService,
        private _dpRecuQuick: DualPivotRecursiveQuickSortService,
        private _dpIterQuick: DualPivotIterativeQuickSortService,
        private _heap: HeapSortService,
        private _tHeap: TernaryHeapSortService,
        
        private _bucket: BucketSortService,
        private _count: CountSortService,
        private _interpolation: InterpolationSortService,
        private _pigeonhole: PigeonholeSortService,
        private _radixLSD: RadixLSDSortService,
        private _radixMSD: RadixMSDSortService,
        private _tdMerge: TopDownMergeSortService,
        private _buMerge: BottomUpMergeSortService,
        private _ipMerge: InPlaceMergeSortService,
        private _kMerge: MultiWayMergeSortService,
        private _tim: TimSortService,

        private _tdBitonic: TopDownBitonicMergeSortService,
        private _buBitonic: BottomUpBitonicMergeSortService,
        private _tdOddEven: TopDownOddEvenMergeSortService,
        private _buOddEven: BottomUpOddEvenMergeSortService,

        private _bogo: BogoSortService,
        private _bogoBubble: BogoBubbleSortService,
        private _bogoCocktail: BogoCocktailSortService,
        private _cycle: CycleSortService,
        private _gnome: GnomeSortService,
        private _gravity: GravitySortService,
        private _pancake: PancakeSortService,
        private _patience: PatienceSortService,
        private _sleep: SleepSortService,
        private _stooge: StoogeSortService,
        private _slow: SlowSortService,
        private _strand: StrandSortService,
        private _tournament: TournamentSortService,
    ) {}

    public match(name: string, array: SortDataModel[], order: SortOrder, radix: SortRadix = 10, way: number = 3): Observable<SortStateModel | null> {console.warn('name:', name);
        if (name === 'bogo-sort') {
            return this._bogo.sort(array, order);
        }

        if (name === 'bogo-bubble-sort') {
            return this._bogoBubble.sort(array, order);
        }

        if (name === 'bogo-cocktail-sort') {
            return this._bogoCocktail.sort(array, order);
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
            return this._sleep.sort(array, order);
        }

        if (name === 'stooge-sort') {
            return this._stooge.sort(array, order);
        }

        if (name === 'slow-sort') {
            return this._slow.sort(array, order);
        }

        if (name === 'strand-sort') {
            return this._strand.sort(array, order);
        }

        if (name === 'tournament-sort') {
            return this._tournament.sort(array, order);
        }


        if (name === 'bubble-sort') {
            return this._bubble.sort(array, order);
        }

        if (name === 'cocktail-sort') {
            return this._cooktail.sort(array, order);
        }

        if (name === 'comb-sort') {
            return this._comb.sort(array, order);
        }

        if (name === 'odd-even-sort') {
            return this._oddEven.sort(array, order);
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

        if (name === 'heap-sort') {
            return this._heap.sort(array, order);
        }

        if (name === 'k-node-heap-sort') {
            return this._tHeap.sort(array, order);
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

        if (name === 'msd-radix-sort') {
            return this._radixMSD.sort(array, order, radix);
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

        if (name === 'ip-merge-sort') {
            return this._ipMerge.sort(array, order);
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

        return of(null);
    }

}
