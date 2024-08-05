import { Injectable } from "@angular/core";
import { Observable } from "rxjs";

import { SortDataModel, SortStateModel, SortOrder } from "../ngrx-store/sort.state";
import { SORT_DELAY_DURATION, complete, delay, swap } from "../sort.utils";
import { CLEAR_COLOR, PRIMARY_COLOR, SECONDARY_COLOR } from "../../../public/values.utils";

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

            await swap(source, i, parent);
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

            await swap(source, i, parent);
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

            await swap(source, parent, pivot);
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

            await swap(source, parent, pivot);
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
