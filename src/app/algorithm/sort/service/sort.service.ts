import { Injectable } from "@angular/core";
import { Observable, of } from "rxjs";

import { SortDataModel, SortStateModel, SortOrder, SortRadix } from "../ngrx-store/sort.state";

import { BubbleSortService, BiBubbleSortService } from "./bubble-sort.service";
import { BSInsertionSortService, InsertionSortService, ShellSortService } from "./insertion-sort.service";
import { BiSelectionSortService, BoSelectionSortService, SelectionSortService } from "./selection-sort.service";
import { BogoBubbleSortService, BogoSortService } from "./bogo-sort.service";
import { QuickSortService, TwoWayQuickSortService } from "./quick-sort.service";
import { CountSortService } from "./count-sort.service";
import { BucketSortService } from "./bucket-sort.service";
import { RadixLSDSortService, RadixMSDSortService } from "./radix-sort.service";
import { SleepSortService } from "./sleep-sort.service";
import { CycleSortService } from "./cycle-sort.service";
import { HeapSortService } from "./heap-sort.service";
import { MergeSortService } from "./merge-sort.service";
import { StoogeSortService } from "./stooge-sort.service";
import { SlowSortService } from "./slow-sort.service";
import { GnomeSortService } from "./gnome-sort.service";
import { TournamentSortService } from "./tournament-sort.service";

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
                    value: i + 1, color: 'whitesmoke',
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

    public shuffleDataList(list: SortDataModel[]): Observable<SortDataModel[]> {
        return new Observable(subscriber => {
            let j: number, temp: SortDataModel;

            list.forEach(item => item.color = 'whitesmoke');

            for(let i = 0; i < list.length; i++) {
                j = Math.floor(Math.random() * (list.length - 1 - i) + 1);
                
                temp = list[j];
                list[j] = list[i];
                list[i] = temp;
            }

            subscriber.next(list);
            subscriber.complete();
        });
    }

}

@Injectable()
export class SortMatchService {

    constructor(
        private _bubble: BubbleSortService,
        private _biBubble: BiBubbleSortService,
        private _insertion: InsertionSortService,
        private _bsInsertion: BSInsertionSortService,
        private _shell: ShellSortService,
        private _selection: SelectionSortService,
        private _biSelection: BiSelectionSortService,
        private _boSelection: BoSelectionSortService,
        private _quick: QuickSortService,
        private _2wQuick: TwoWayQuickSortService,
        private _heap: HeapSortService,
        
        private _bucket: BucketSortService,
        private _count: CountSortService,
        private _radixLSD: RadixLSDSortService,
        private _radixMSD: RadixMSDSortService,
        private _merge: MergeSortService,

        private _bogo: BogoSortService,
        private _bogoBubble: BogoBubbleSortService,
        private _cycle: CycleSortService,
        private _gnome: GnomeSortService,
        private _sleep: SleepSortService,
        private _stooge: StoogeSortService,
        private _slow: SlowSortService,
        private _tournament: TournamentSortService
    ) {}

    public match(name: string, array: SortDataModel[], order: SortOrder, radix: SortRadix = 10): Observable<SortStateModel | null> {console.warn('name:', name);
        if (name === 'bogo-sort') {
            return this._bogo.sort(array, order);
        }

        if (name === 'bogo-bubble-sort') {
            return this._bogoBubble.sort(array, order);
        }

        if (name === 'cycle-sort') {
            return this._cycle.sort(array, order);
        }

        if (name === 'gravity-sort') {

        }

        if (name === 'gnome-sort') {
            return this._gnome.sort(array, order);
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


        if (name === 'bubble-sort') {
            return this._bubble.sort(array, order);
        }

        if (name === 'bi-bubble-sort') {
            return this._biBubble.sort(array, order);
        }

        if (name === 'insertion-sort') {
            return this._insertion.sort(array, order);
        }

        // if (name === 'bs-insertion-sort') {
        //     return this._bsInsertion.sort(array, order);
        // }

        if (name === 'shell-sort') {
            return this._shell.sort(array, order);
        }

        if (name === 'selection-sort') {
            return this._selection.sort(array, order);
        }

        if (name === 'bi-selection-sort') {
            return this._biSelection.sort(array, order);
        }

        // if (name === 'bo-selection-sort') {
        //     return this._boSelection.sort(array, order);
        // }

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

        if (name === 'merge-sort') {
            return this._merge.sort(array, order);
        }

        return of(null);
    }

}
