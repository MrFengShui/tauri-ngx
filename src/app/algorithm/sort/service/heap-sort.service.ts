import { Injectable } from "@angular/core";
import { Observable } from "rxjs";

import { SortDataModel, SortStateModel, SortOrder } from "../ngrx-store/sort.state";
import { SORT_DELAY_DURATION, complete, delay, swap } from "../sort.utils";

@Injectable()
export class HeapSortService {

    public sort(array: SortDataModel[], order: SortOrder): Observable<SortStateModel> {
        return new Observable(subscriber => {
            let temp: SortDataModel = { value: 0, color: 'whitesmoke' };

            if (order === 'ascent') {
                this.sortByAscent(array, temp, param => subscriber.next(param)).then(() => subscriber.complete());
            }
    
            if (order === 'descent') {
                this.sortByDescent(array, temp, param => subscriber.next(param)).then(() => subscriber.complete());
            }
        });
    }

    private async sortByAscent(source: SortDataModel[], temp: SortDataModel, callback: (param: SortStateModel) => void): Promise<void> {
        for (let i = Math.floor(source.length * 0.5) - 1; i >= 0; i--) {
            await this.heapifyMaxHeap(source, source.length, i, temp, callback);
        }    

        for (let i = source.length - 1; i > 0; i--) {
            source[i].color = 'orangered';
            callback({ completed: false, datalist: source });
            await swap(source, i, 0, temp);
            await this.heapifyMaxHeap(source, i, 0, temp, callback);
            source[i].color = 'white';
            callback({ completed: false, datalist: source });
        }

        await delay(SORT_DELAY_DURATION);
        await complete(source, 0, callback);
    }

    private async sortByDescent(source: SortDataModel[], temp: SortDataModel, callback: (parram: SortStateModel) => void): Promise<void> {
        for (let i = Math.floor(source.length * 0.5 - 1); i >= 0; i--) {
            await this.heapifyMinHeap(source, source.length, i, temp, callback);
        }    

        for (let i = source.length - 1; i > 0; i--) {
            source[i].color = 'orangered';
            callback({ completed: false, datalist: source });
            await swap(source, i, 0, temp);
            await this.heapifyMinHeap(source, i, 0, temp, callback);
            source[i].color = 'white';
            callback({ completed: false, datalist: source });
        }

        await delay(SORT_DELAY_DURATION);
        await complete(source, 0, callback);
    }

    private async heapifyMaxHeap(source: SortDataModel[], length: number, parent: number, temp: SortDataModel, callback: (parram: SortStateModel) => void): Promise<void> {
        let leftChild: number, rightChild: number, pivot: number, index: number = parent;
        
        while (true) {
            leftChild = parent + parent + 1;
            rightChild = parent + parent + 2;
            pivot = parent;

            if (leftChild < length && source[leftChild].value > source[pivot].value) {
                pivot = leftChild;
            }
    
            if (rightChild < length && source[rightChild].value > source[pivot].value) {
                pivot = rightChild;
            }

            if (pivot === parent) break;

            source[parent].color = 'lawngreen';
            await swap(source, parent, pivot, temp);
            await delay(SORT_DELAY_DURATION);
            callback({ completed: false, datalist: source });
            source[parent].color = 'whitesmoke';
            source[pivot].color = 'whitesmoke';
            parent = pivot;
        }
    }

    private async heapifyMinHeap(source: SortDataModel[], length: number, parent: number, temp: SortDataModel, callback: (parram: SortStateModel) => void): Promise<void> {
        let leftChild: number, rightChild: number, pivot: number;

        while (true) {
            leftChild = parent + parent + 1;
            rightChild = parent + parent + 2;
            pivot = parent;

            if (leftChild < length && source[leftChild].value < source[pivot].value) {
                pivot = leftChild;
            }

            if (rightChild < length && source[rightChild].value < source[pivot].value) {
                pivot = rightChild;
            }

            if (pivot === parent) break;

            source[parent].color = 'lawngreen';
            await delay(SORT_DELAY_DURATION);
            await swap(source, pivot, parent, temp);
            callback({ completed: false, datalist: source });
            source[parent].color = 'whitesmoke';
            source[pivot].color = 'whitesmoke';
            parent = pivot;
        }
    }

}
