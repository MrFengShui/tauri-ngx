import { Injectable } from "@angular/core";
import { Observable } from "rxjs";

import { SortDataModel, SortStateModel, SortOrder } from "../ngrx-store/sort.state";
import { ACCENT_COLOR, CLEAR_COLOR, PRIMARY_COLOR, SECONDARY_COLOR, SORT_DELAY_DURATION, complete, delay, swap } from "../sort.utils";

/**
 * 堆排序
 */
@Injectable()
export class HeapSortService {

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
        for (let i = Math.floor(source.length * 0.5) - 1; i >= 0; i--) {
            times = await this.heapifyMaxHeap(source, source.length, i, temp, times, callback);
        }    

        for (let i = source.length - 1; i > 0; i--) {
            source[i].color = ACCENT_COLOR;
            callback({ times, datalist: source });

            times += 1;
            await swap(source, i, 0, temp);
            times = await this.heapifyMaxHeap(source, i, 0, temp, times, callback);

            source[i].color = CLEAR_COLOR;
            callback({ times, datalist: source });
        }

        await delay(SORT_DELAY_DURATION);
        await complete(source, times, callback);
    }

    private async sortByDescent(source: SortDataModel[], temp: SortDataModel, times: number, callback: (parram: SortStateModel) => void): Promise<void> {
        for (let i = Math.floor(source.length * 0.5 - 1); i >= 0; i--) {
            times = await this.heapifyMinHeap(source, source.length, i, temp, times, callback);
        }    

        for (let i = source.length - 1; i > 0; i--) {
            source[i].color = ACCENT_COLOR;
            callback({ times, datalist: source });

            times += 1;
            await swap(source, i, 0, temp);
            times = await this.heapifyMinHeap(source, i, 0, temp, times, callback);

            source[i].color = CLEAR_COLOR;
            callback({ times, datalist: source });
        }

        await delay(SORT_DELAY_DURATION);
        await complete(source, times, callback);
    }

    private async heapifyMaxHeap(source: SortDataModel[], length: number, parent: number, temp: SortDataModel, times: number, callback: (parram: SortStateModel) => void): Promise<number> {
        let leftChild: number, rightChild: number, pivot: number;
        
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

            source[parent].color = PRIMARY_COLOR;
            source[pivot].color = SECONDARY_COLOR;
            callback({ times, datalist: source });

            times += 1;
            await swap(source, parent, pivot, temp);
            await delay(SORT_DELAY_DURATION);
            
            source[parent].color = CLEAR_COLOR;
            source[pivot].color = CLEAR_COLOR;
            callback({ times, datalist: source });

            parent = pivot;
        }

        return times;
    }

    private async heapifyMinHeap(source: SortDataModel[], length: number, parent: number, temp: SortDataModel, times: number, callback: (parram: SortStateModel) => void): Promise<number> {
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

            source[parent].color = PRIMARY_COLOR;
            source[pivot].color = SECONDARY_COLOR;
            callback({ times, datalist: source });

            times += 1;
            await swap(source, pivot, parent, temp);
            await delay(SORT_DELAY_DURATION);
            
            source[parent].color = CLEAR_COLOR;
            source[pivot].color = CLEAR_COLOR;
            callback({ times, datalist: source });

            parent = pivot;
        }

        return times;
    }

}

/**
 * 堆排序（多节点）
 */
@Injectable()
export class TernaryHeapSortService {

    public sort(array: SortDataModel[], order: SortOrder, nodes: number = 8): Observable<SortStateModel> {
        return new Observable(subscriber => {
            let temp: SortDataModel = { value: 0, color: 'whitesmoke' };

            if (order === 'ascent') {
                this.sortByAscent(array, nodes, temp, 0, param => subscriber.next(param)).then(() => subscriber.complete());
            }
    
            if (order === 'descent') {
                this.sortByDescent(array, nodes, temp, 0, param => subscriber.next(param)).then(() => subscriber.complete());
            }
        });
    }

    private async sortByAscent(source: SortDataModel[], nodes: number, temp: SortDataModel, times: number, callback: (param: SortStateModel) => void): Promise<void> {
        for (let i = Math.floor(source.length / nodes) - 1; i >= 0; i--) {
            times = await this.heapifyMaxHeap(source, nodes, source.length, i, temp, times, callback);
        }    

        for (let i = source.length - 1; i > 0; i--) {
            source[i].color = ACCENT_COLOR;
            callback({ times, datalist: source });

            times += 1;
            await swap(source, i, 0, temp);
            times = await this.heapifyMaxHeap(source, nodes, i, 0, temp, times, callback);

            source[i].color = CLEAR_COLOR;
            callback({ times, datalist: source });
        }

        await delay(SORT_DELAY_DURATION);
        await complete(source, times, callback);
    }

    private async sortByDescent(source: SortDataModel[], nodes: number, temp: SortDataModel, times: number, callback: (parram: SortStateModel) => void): Promise<void> {
        for (let i = Math.floor(source.length / nodes - 1); i >= 0; i--) {
            times = await this.heapifyMinHeap(source, nodes, source.length, i, temp, times, callback);
        }    

        for (let i = source.length - 1; i > 0; i--) {
            source[i].color = ACCENT_COLOR;
            callback({ times, datalist: source });

            times += 1;
            await swap(source, i, 0, temp);
            times = await this.heapifyMinHeap(source, nodes, i, 0, temp, times, callback);

            source[i].color = CLEAR_COLOR;
            callback({ times, datalist: source });
        }

        await delay(SORT_DELAY_DURATION);
        await complete(source, times, callback);
    }

    private async heapifyMaxHeap(source: SortDataModel[], way: number, length: number, parent: number, temp: SortDataModel, times: number, callback: (parram: SortStateModel) => void): Promise<number> {
        let children: number[] = Array.from([]), pivot: number, index: number = 0, value: number;
        
        while (true) {
            for (let i = 0; i < way; i++) {
                children[i] = parent * way + i + 1;
            }

            pivot = parent;
            value = Number.MIN_SAFE_INTEGER;
            
            for (let i = 0; i < children.length; i++) {
                if (children[i] < length && source[children[i]].value > value) {
                    index = children[i];
                    value = source[index].value;
                }
            }
            
            if (index < length && source[index].value > source[pivot].value) {
                pivot = index;
            }

            if (pivot === parent) break;

            source[parent].color = PRIMARY_COLOR;
            source[pivot].color = SECONDARY_COLOR;
            callback({ times, datalist: source });

            times += 1;
            await swap(source, parent, pivot, temp);
            await delay(SORT_DELAY_DURATION);
            
            source[parent].color = CLEAR_COLOR;
            source[pivot].color = CLEAR_COLOR;
            callback({ times, datalist: source });

            parent = pivot;
        }

        return times;
    }

    private async heapifyMinHeap(source: SortDataModel[], way: number, length: number, parent: number, temp: SortDataModel, times: number, callback: (parram: SortStateModel) => void): Promise<number> {
        let children: number[] = Array.from([]), pivot: number, index: number = 0, value: number;

        while (true) {
            for (let i = 0; i < way; i++) {
                children[i] = parent * way + i + 1;
            }

            pivot = parent;
            value = Number.MAX_SAFE_INTEGER;
            
            for (let i = 0; i < children.length; i++) {
                if (children[i] < length && source[children[i]].value < value) {
                    index = children[i];
                    value = source[index].value;
                }
            }
            
            if (index < length && source[index].value < source[pivot].value) {
                pivot = index;
            }

            if (pivot === parent) break;

            source[parent].color = PRIMARY_COLOR;
            source[pivot].color = SECONDARY_COLOR;
            callback({ times, datalist: source });

            times += 1;
            await swap(source, pivot, parent, temp);
            await delay(SORT_DELAY_DURATION);
            
            source[parent].color = CLEAR_COLOR;
            source[pivot].color = CLEAR_COLOR;
            callback({ times, datalist: source });

            parent = pivot;
        }

        return times;
    }

}
