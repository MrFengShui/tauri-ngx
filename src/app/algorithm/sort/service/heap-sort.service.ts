import { Injectable } from "@angular/core";
import { Observable } from "rxjs";

import { SortDataModel, SortStateModel, SortOrder } from "../ngrx-store/sort.state";
import { SORT_DELAY_DURATION, complete, delay, swap } from "../sort.utils";
import { ACCENT_COLOR, CLEAR_COLOR, PRIMARY_COLOR, SECONDARY_COLOR } from "../../../public/values.utils";

/**
 * 堆排序
 */
@Injectable()
export class HeapSortService {

    public sort(array: SortDataModel[], order: SortOrder): Observable<SortStateModel> {
        return new Observable(subscriber => {
            const temp: SortDataModel = { value: 0, color: 'whitesmoke' };

            if (order === 'ascent') {
                this.sortByAscent(array, temp, 0, param => subscriber.next(param)).then(() => subscriber.complete());
            }
    
            if (order === 'descent') {
                this.sortByDescent(array, temp, 0, param => subscriber.next(param)).then(() => subscriber.complete());
            }
        });
    }

    private async sortByAscent(source: SortDataModel[], temp: SortDataModel, times: number, callback: (param: SortStateModel) => void): Promise<void> {
        for (let length = source.length, i = Math.floor(length * 0.5) - 1; i >= 0; i--) {
            times = await this.heapifyMaxHeap(source, length, i, temp, times, callback);
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
        for (let length = source.length, i = Math.floor(length * 0.5 - 1); i >= 0; i--) {
            times = await this.heapifyMinHeap(source, length, i, temp, times, callback);
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

    public sort(array: SortDataModel[], order: SortOrder, node: number = 3): Observable<SortStateModel> {
        return new Observable(subscriber => {
            const temp: SortDataModel = { value: 0, color: 'whitesmoke' };

            if (order === 'ascent') {
                this.sortByAscent(array, node, temp, 0, param => subscriber.next(param)).then(() => subscriber.complete());
            }
    
            if (order === 'descent') {
                this.sortByDescent(array, node, temp, 0, param => subscriber.next(param)).then(() => subscriber.complete());
            }
        });
    }

    private async sortByAscent(source: SortDataModel[], nodes: number, temp: SortDataModel, times: number, callback: (param: SortStateModel) => void): Promise<void> {
        for (let length = source.length, i = Math.floor(length / nodes) - 1; i >= 0; i--) {
            times = await this.heapifyMaxHeap(source, nodes, length, i, temp, times, callback);
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
        for (let length = source.length, i = Math.floor(length / nodes - 1); i >= 0; i--) {
            times = await this.heapifyMinHeap(source, nodes, length, i, temp, times, callback);
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
        let pivot: number, index: number = 0, value: number;
        const children: number[] = Array.from([]);
        
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
        let pivot: number, index: number = 0, value: number;
        const children: number[] = Array.from([]);

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

/**
 * 平滑排序
 */
@Injectable()
export class SmoothSortService {

    public sort(array: SortDataModel[], order: SortOrder): Observable<SortStateModel> {
        return new Observable(subscriber => {
            const temp: SortDataModel = { value: 0, color: '' };

            if (order === 'ascent') {
                this.sortByAscent(array, temp, 0, param => subscriber.next(param)).then(() => subscriber.complete());
            }

            if (order === 'descent') {
                this.sortByDescent(array, temp, 0, param => subscriber.next(param)).then(() => subscriber.complete());
            }
        });
    }

    private async sortByAscent(source: SortDataModel[], temp: SortDataModel, times: number, callback: (param: SortStateModel) => void): Promise<void> {
        let levels: number[] = new Array(source.length).fill(1), levelIndex: number = 0;

        for (let i = 1, length = source.length; i < length; i++) {
            if (levelIndex > 0 && levels[levelIndex - 1] - levels[levelIndex] === 1) {
                levelIndex -= 1;
                levels[levelIndex] += 1;
            } else if (levels[levelIndex] !== 1) {
                levelIndex += 1;
                levels[levelIndex] = 1;
            } else {
                levelIndex += 1;
                levels[levelIndex] = 0;
            }

            times = await this.buildMaxHeap(source, i, levelIndex, levels, temp, times, callback);
        }

        for (let length = source.length, i = length - 2; i > 0; i--) {
            if (levels[levelIndex] <= 1) {
                levelIndex -= 1;
            } else {
                levels[levelIndex] -= 1;
                levels[levelIndex + 1] = levels[levelIndex] - 1;
                levelIndex += 1;

                times = await this.buildMaxHeap(source, i - this.leonardo(levels[levelIndex]), levelIndex - 1, levels, temp, times, callback);
                times = await this.buildMaxHeap(source, i, levelIndex, levels, temp, times, callback);
            }
        }

        await delay(SORT_DELAY_DURATION);
        await complete(source, times, callback);
        levels.splice(0);
    }

    private async sortByDescent(source: SortDataModel[], temp: SortDataModel, times: number, callback: (param: SortStateModel) => void): Promise<void> {
        let levels: number[] = new Array(64).fill(1), levelIndex: number = 0;

        for (let i = 1, length = source.length; i < length; i++) {
            if (levelIndex > 0 && levels[levelIndex - 1] - levels[levelIndex] === 1) {
                levelIndex -= 1;
                levels[levelIndex] += 1;
            } else if (levels[levelIndex] !== 1) {
                levelIndex += 1;
                levels[levelIndex] = 1;
            } else {
                levelIndex += 1;
                levels[levelIndex] = 0;
            }

            times = await this.buildMinHeap(source, i, levelIndex, levels, temp, times, callback);
        }

        for (let length = source.length, i = length - 2; i > 0; i--) {
            if (levels[levelIndex] <= 1) {
                levelIndex -= 1;
            } else {
                levels[levelIndex] -= 1;
                levels[levelIndex + 1] = levels[levelIndex] - 1;
                levelIndex += 1;

                times = await this.buildMinHeap(source, i - this.leonardo(levels[levelIndex]), levelIndex - 1, levels, temp, times, callback);
                times = await this.buildMinHeap(source, i, levelIndex, levels, temp, times, callback);
            }
        }

        await delay(SORT_DELAY_DURATION);
        await complete(source, times, callback);
        levels.splice(0);
    }

    private async buildMaxHeap(source: SortDataModel[], i: number, levelIndex: number, levels: number[], temp: SortDataModel, times: number, callback: (param: SortStateModel) => void): Promise<number> {
        let parent: number, leftChild: number, rightChild: number;

        while (levelIndex > 0) {
            parent = i - this.leonardo(levels[levelIndex]);

            if (source[i].value > source[parent].value) break;

            if (levels[levelIndex] > 1) {
                leftChild = i - 1 - this.leonardo(levels[levelIndex] - 2);
                rightChild = i - 1;

                if (source[parent].value < source[leftChild].value) break;

                if (source[parent].value < source[rightChild].value) break;
            }

            times += 1;

            source[i].color = PRIMARY_COLOR;
            source[parent].color = SECONDARY_COLOR;
            callback({ times, datalist: source });

            await swap(source, i, parent, temp);
            await delay(SORT_DELAY_DURATION);

            source[i].color = CLEAR_COLOR;
            source[parent].color = CLEAR_COLOR;
            callback({ times, datalist: source });

            i = parent;
            levelIndex -= 1;
        }

        times = await this.maxHeapify(source, i, levels[levelIndex], temp, times, callback);
        return times;
    }

    private async buildMinHeap(source: SortDataModel[], i: number, levelIndex: number, levels: number[], temp: SortDataModel, times: number, callback: (param: SortStateModel) => void): Promise<number> {
        let parent: number, leftChild: number, rightChild: number;

        while (levelIndex > 0) {
            parent = i - this.leonardo(levels[levelIndex]);

            if (source[i].value < source[parent].value) break;

            if (levels[levelIndex] > 1) {
                leftChild = i - 1 - this.leonardo(levels[levelIndex] - 2);
                rightChild = i - 1;

                if (source[parent].value > source[leftChild].value) break;

                if (source[parent].value > source[rightChild].value) break;
            }

            times += 1;

            source[i].color = PRIMARY_COLOR;
            source[parent].color = SECONDARY_COLOR;
            callback({ times, datalist: source });

            await swap(source, i, parent, temp);
            await delay(SORT_DELAY_DURATION);

            source[i].color = CLEAR_COLOR;
            source[parent].color = CLEAR_COLOR;
            callback({ times, datalist: source });

            i = parent;
            levelIndex -= 1;
        }

        times = await this.minHeapify(source, i, levels[levelIndex], temp, times, callback);
        return times;
    }

    private async maxHeapify(source: SortDataModel[], parent: number, currLevel: number, temp: SortDataModel, times: number, callback: (param: SortStateModel) => void): Promise<number> {
        let leftChild: number, rightChild: number, pivot: number;

        while (currLevel > 1) {
            leftChild = parent - 1 - this.leonardo(currLevel - 2);
            rightChild = parent - 1;
            pivot = parent;

            if (source[pivot].value < source[leftChild].value) {
                pivot = leftChild;
            }

            if (source[pivot].value < source[rightChild].value) {
                pivot = rightChild;
            }

            if (pivot === parent) break;

            times += 1;

            source[parent].color = PRIMARY_COLOR;
            source[pivot].color = SECONDARY_COLOR;
            callback({ times, datalist: source });

            await swap(source, parent, pivot, temp);
            await delay(SORT_DELAY_DURATION);

            source[parent].color = CLEAR_COLOR;
            source[pivot].color = CLEAR_COLOR;
            callback({ times, datalist: source });

            parent = pivot;
            currLevel = pivot === leftChild ? currLevel - 1 : currLevel - 2;
        }

        return times;
    }

    private async minHeapify(source: SortDataModel[], parent: number, currLevel: number, temp: SortDataModel, times: number, callback: (param: SortStateModel) => void): Promise<number> {
        let leftChild: number, rightChild: number, pivot: number;

        while (currLevel > 1) {
            leftChild = parent - 1 - this.leonardo(currLevel - 2);
            rightChild = parent - 1;
            pivot = parent;

            if (source[pivot].value > source[leftChild].value) {
                pivot = leftChild;
            }

            if (source[pivot].value > source[rightChild].value) {
                pivot = rightChild;
            }

            if (pivot === parent) break;

            times += 1;

            source[parent].color = PRIMARY_COLOR;
            source[pivot].color = SECONDARY_COLOR;
            callback({ times, datalist: source });

            await swap(source, parent, pivot, temp);
            await delay(SORT_DELAY_DURATION);

            source[parent].color = CLEAR_COLOR;
            source[pivot].color = CLEAR_COLOR;
            callback({ times, datalist: source });

            parent = pivot;
            currLevel = pivot === leftChild ? currLevel - 1 : currLevel - 2;
        }

        return times;
    }

    /**
     * k = ceil(log(n) + 1)
     * root: L(k) - 1
     * left: L(k - 1) - 1
     * right: L(k) - 2
     * @param index
     * @param fst
     * @param snd
     * @returns
     */
    private leonardo(index: number, fst: number = 1, snd: number = 1): number {
        if (index === 0) {
            return fst;
        } else if (index === 1) {
            return snd;
        } else {
            let sum: number = 0;

            for (let i = 2; i <= index; i++) {
                sum = fst + snd + 1;
                fst = snd;
                snd = sum;
            }

            return sum;
        }
    }

}
