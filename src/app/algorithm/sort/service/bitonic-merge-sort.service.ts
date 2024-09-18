import { Injectable } from "@angular/core";
import { floor } from "lodash";

import { SortDataModel, SortStateModel, SortOrder } from "../ngrx-store/sort.state";

import { delay } from "../../../public/global.utils";
import { PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR } from "../../../public/global.utils";

import { AbstractBinarySortService } from "./base-sort.service";

/**
 * 双调归并排序（递归）
 */
@Injectable()
export class RecursiveBitonicMergeSortService extends AbstractBinarySortService {

    protected override async sortByAscent(source: SortDataModel[], lhs: number, rhs: number, option: string | number | undefined, callback: (param: SortStateModel) => void): Promise<void> {
        let times: number = await this.newSortByOrder(source, lhs, rhs, true, 'ascent', 0, callback);
        await delay();
        await this.complete(source, times, callback);
    }

    protected override async sortByDescent(source: SortDataModel[], lhs: number, rhs: number, option: string | number | undefined, callback: (param: SortStateModel) => void): Promise<void> {
        let times: number = await this.newSortByOrder(source, lhs, rhs, true, 'descent', 0, callback);
        await delay();
        await this.complete(source, times, callback);
    }

    protected override sortByOrder(source: SortDataModel[], lhs: number, rhs: number, order: SortOrder, times: number, callback: (param: SortStateModel) => void): Promise<number> {
        throw new Error("Method not implemented.");
    }

    private async newSortByOrder(source: SortDataModel[], lhs: number, rhs: number, flag: boolean, order: SortOrder, times: number, callback: (param: SortStateModel) => void): Promise<number> {
        if (lhs < rhs) {
            let mid: number = floor((rhs - lhs) * 0.5, 0);
            
            if (order === 'ascent') {
                mid = lhs + mid;

                times = await this.newSortByOrder(source, lhs, mid, flag, order, times, callback);
                times = await this.newSortByOrder(source, mid + 1, rhs, !flag, order, times, callback);
                times = await this.mergeByAscent(source, lhs, rhs, flag, times, callback);
            }
            
            if (order === 'descent') {
                mid = rhs - mid;

                times = await this.newSortByOrder(source, mid, rhs, flag, order, times, callback);
                times = await this.newSortByOrder(source, lhs, mid - 1, !flag, order, times, callback);
                times = await this.mergeByDescent(source, lhs, rhs, flag, times, callback);
            }
        }

        return times;
    }

    private async mergeByAscent(source: SortDataModel[], lhs: number, rhs: number, dir: boolean, times: number, callback: (param: SortStateModel) => void): Promise<number> {
        if (lhs < rhs) {
            let mid: number = lhs + floor((rhs - lhs) * 0.5, 0), flag: boolean;

            for (let i = lhs, j = mid + 1; i <= mid && j <= rhs; i++, j++) {     
                flag = (dir && source[i].value > source[j].value) || (!dir && source[i].value < source[j].value);

                times = await this.exchange(source, flag, i, j, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, times, callback);

                if (flag) times += 1;
            }

            times = await this.mergeByAscent(source, lhs, mid, dir, times, callback);
            times = await this.mergeByAscent(source, mid + 1, rhs, dir, times, callback);
        }

        return times;
    }

    private async mergeByDescent(source: SortDataModel[], lhs: number, rhs: number, dir: boolean, times: number, callback: (param: SortStateModel) => void): Promise<number> {
        if (lhs < rhs) {
            let mid: number = rhs - floor((rhs - lhs) * 0.5), flag: boolean;

            for (let i = rhs, j = mid - 1; i >= mid && j >= lhs; i--, j--) {   
                flag = (dir && source[i].value > source[j].value) || (!dir && source[i].value < source[j].value);
                
                times = await this.exchange(source, flag, i, j, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, times, callback);

                if (flag) times += 1;
            }

            times = await this.mergeByDescent(source, mid, rhs, dir, times, callback);
            times = await this.mergeByDescent(source, lhs, mid - 1, dir, times, callback);
        }

        return times;
    }

}

/**
 * 双调归并排序（迭代）
 */
@Injectable()
export class IterativeBitonicMergeSortService extends RecursiveBitonicMergeSortService {

    protected override async sortByAscent(source: SortDataModel[], lhs: number, rhs: number, option: string | number | undefined, callback: (param: SortStateModel) => void): Promise<void> {
        let xor: number, flag: boolean, ascFlag: boolean, desFlag: boolean, times: number = 0;

        for (let k = 2, length = rhs - lhs + 1; k < length + length; k = k + k) {
            for (let j = k >> 1; j > 0; j >>= 1) {
                for (let i = lhs; i <= rhs; i++) {
                    xor = i ^ j;

                    if (xor > i && xor < length) {
                        ascFlag = ((i & k) === 0);
                        desFlag = ((i & k) !== 0);
                        flag = (ascFlag && source[i].value > source[xor].value) || (desFlag && source[i].value < source[xor].value)

                        times = await this.exchange(source, flag, i, xor, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, times, callback);
                    } else {
                        times = await this.sweep(source, i, ACCENT_COLOR, times, callback);
                    }
                }
            }
        }

        await delay();
        await this.complete(source, times, callback);
    }

    protected override async sortByDescent(source: SortDataModel[], lhs: number, rhs: number, option: string | number | undefined, callback: (param: SortStateModel) => void): Promise<void> {
        let xor: number, flag: boolean, ascFlag: boolean, desFlag: boolean, times: number = 0;

        for (let k = 2, length = rhs - lhs + 1; k < length + length; k = k + k) {
            for (let j = k >> 1; j > 0; j >>= 1) {
                for (let i = rhs; i >= lhs; i--) {
                    xor = i ^ j;

                    if (xor > i && xor < length) {
                        ascFlag = ((i & k) !== 0) === ((floor((length - 1) / k + 1, 0) & 1) === 0);
                        desFlag = ((i & k) === 0) === ((floor((length - 1) / k + 1, 0) & 1) === 0);
                        flag = (ascFlag && source[i].value < source[xor].value) || (desFlag && source[i].value > source[xor].value)

                        times = await this.exchange(source, flag, i, xor, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, times, callback);
                    } else {
                        times = await this.sweep(source, i, ACCENT_COLOR, times, callback);
                    }
                }
            }
        }

        await delay();
        await this.complete(source, times, callback);
    }

}
