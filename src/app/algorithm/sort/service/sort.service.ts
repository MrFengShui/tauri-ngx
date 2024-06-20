import { Injectable } from "@angular/core";
import { Observable, of } from "rxjs";
import { random } from 'lodash';

import { SortDataModel, SortStateModel, SortOrder, SortRadix } from "../ngrx-store/sort.state";

import { CLEAR_COLOR, PRIMARY_ONE_COLOR, PRIMARY_TWO_COLOR, SECONDARY_ONE_COLOR, SECONDARY_TWO_COLOR, SORT_DELAY_DURATION, delay } from "../sort.utils";

import { BubbleSortService, CooktailSortService } from "./bubble-sort.service";
import { BinarySearchInserionSortService, InsertionSortService, ShellSortService } from "./insertion-sort.service";
import { LibrarySortService } from "./library-sort.service";
import { BiSelectionSortService, SelectionSortService } from "./selection-sort.service";
import { BogoBubbleSortService, BogoCocktailSortService, BogoSortService } from "./bogo-sort.service";
import { QuickSortService, TwoWayQuickSortService } from "./quick-sort.service";
import { CountSortService } from "./count-sort.service";
import { BucketSortService } from "./bucket-sort.service";
import { RadixLSDSortService, RadixMSDSortService } from "./radix-sort.service";
import { SleepSortService } from "./sleep-sort.service";
import { CycleSortService } from "./cycle-sort.service";
import { HeapSortService, TernaryHeapSortService } from "./heap-sort.service";
import { TopDownMergeSortService, FourWayMergeSortService, BottomUpMergeSortService, InPlaceMergeSortService } from "./merge-sort.service";
import { StoogeSortService } from "./stooge-sort.service";
import { SlowSortService } from "./slow-sort.service";
import { GnomeSortService } from "./gnome-sort.service";
import { TournamentSortService } from "./tournament-sort.service";
import { BottomUpBitonicMergeSortService, TopDownBitonicMergeSortService } from "./bitonic-merge-sort.service";
import { OddEvenSortService } from "./odd-even-sort.service";
import { CombSortService } from "./bubble-sort.service";
import { PancakeSortService } from "./pancake-sort.service";
import { GravitySortService } from "./gravity-sort.service";
import { BottomUpOddEvenMergeSortService, TopDownOddEvenMergeSortService } from "./odd-even-merge-sort.service";
import { PatienceSortService } from "./patience-sort.service";

@Injectable()
export class SortUtilsService {

    public createDataList(size: number, name: string): Observable<SortDataModel[]> {
        return new Observable(subscriber => {
            let list: SortDataModel[] = Array.from([]);
            let binMaxLength: number = size.toString(2).length;
            let octMaxLength: number = size.toString(8).length;
            let decMaxLength: number = size.toString(10).length;
            let hexMaxLength: number = size.toString(16).length;
    
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

    public shuffleDataList(list: SortDataModel[]): Observable<SortStateModel> {
        return new Observable(subscriber => {
            this.shuffle(list, param => subscriber.next(param)).then(() => subscriber.complete());
        });
    }

    private async shuffle(list: SortDataModel[], callback: (param: SortStateModel) => void): Promise<void> {
        let i: number = 0, j: number = list.length - 1, m: number, n: number, temp: SortDataModel;

        while(i < j) {
            m = random(i + 1, j, false);
            n = random(i, j - 1, false);

            list[i].color = PRIMARY_ONE_COLOR;
            list[j].color = SECONDARY_ONE_COLOR;
            list[m].color = PRIMARY_TWO_COLOR;
            list[n].color = SECONDARY_TWO_COLOR;
            callback({ times: 0, datalist: list });

            await delay(SORT_DELAY_DURATION);
            
            temp = list[i];
            list[i] = list[m];
            list[m] = temp;
            
            temp = list[j];
            list[j] = list[n];
            list[n] = temp;

            list[i].color = CLEAR_COLOR;
            list[j].color = CLEAR_COLOR;
            list[m].color = CLEAR_COLOR;
            list[n].color = CLEAR_COLOR;
            callback({ times: 0, datalist: list });

            i += 1;
            j -= 1;
        }

        await delay(SORT_DELAY_DURATION);
        callback({ times: 0, datalist: list });
    }

}

@Injectable()
export class SortToolsService {

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

    public stableSortByAscent(source: number[], times: number, temp: number = -1): number {
        for (let i = 1; i < source.length; i++) {
            for (let j = i; j > 0; j--) {
                if (source[j - 1] > source[j]) {
                    temp = source[j - 1];
                    source[j - 1] = source[j];
                    source[j] = temp;
                    times += 1;
                }
            }
        }
    
        return times;
    } 
    

    public stableSortByDescent(source: number[], times: number, temp: number = -1): number {
        for (let i = 1; i < source.length; i++) {
            for (let j = i; j > 0; j--) {
                if (source[j - 1] < source[j]) {
                    temp = source[j - 1];
                    source[j - 1] = source[j];
                    source[j] = temp;
                    times += 1;
                }
            }
        }
    
        return times;
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
        private _quick: QuickSortService,
        private _2wQuick: TwoWayQuickSortService,
        private _heap: HeapSortService,
        private _tHeap: TernaryHeapSortService,
        
        private _bucket: BucketSortService,
        private _count: CountSortService,
        private _radixLSD: RadixLSDSortService,
        private _radixMSD: RadixMSDSortService,
        private _tdMerge: TopDownMergeSortService,
        private _buMerge: BottomUpMergeSortService,
        private _ipMerge: InPlaceMergeSortService,
        private _4wMerge: FourWayMergeSortService,

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
        private _sleep: SleepSortService,
        private _stooge: StoogeSortService,
        private _slow: SlowSortService,
        private _tournament: TournamentSortService,
        private _pancake: PancakeSortService,
        private _patience: PatienceSortService

    ) {}

    public match(name: string, array: SortDataModel[], order: SortOrder, radix: SortRadix = 10): Observable<SortStateModel | null> {console.warn('name:', name);
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

        if (name === 'tournament-sort') {
            return this._tournament.sort(array, order);
        }

        if (name === 'library-sort') {
            return this._library.sort(array, order);
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

        if (name === 'quick-sort') {
            return this._quick.sort(array, order);
        }

        if (name === '2w-quick-sort') {
            return this._2wQuick.sort(array, order);
        }

        if (name === '3w-quick-sort') {
            // return this._quick.sort(array, order);
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

        if (name === '4w-merge-sort') {
            return this._4wMerge.sort(array, order);
        }

        if (name === 'ip-merge-sort') {
            return this._ipMerge.sort(array, order);
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
