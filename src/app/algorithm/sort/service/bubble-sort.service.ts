import { Injectable } from "@angular/core";
import { Observable } from "rxjs";

import { SortDataModel, SortStateModel, SortOrder } from "../ngrx-store/sort.state";
import { delay } from "../../../public/global.utils";
import { PRIMARY_COLOR, SECONDARY_COLOR, CLEAR_COLOR, PRIMARY_ONE_COLOR, SECONDARY_ONE_COLOR, PRIMARY_TWO_COLOR, SECONDARY_TWO_COLOR, ACCENT_COLOR, ACCENT_ONE_COLOR, ACCENT_TWO_COLOR } from "../../../public/global.utils";
import { SortToolsService } from "../ngrx-store/sort.service";
import { AbstractSortService } from "./base-sort.service";

/**
 * 交換排序
 */
@Injectable()
export class ExchangeSortService extends AbstractSortService {

    constructor(private _service: SortToolsService) {
        super();
    }

    protected override async sortByAscent(source: SortDataModel[], lhs: number, rhs: number, option: string | number | undefined, callback: (param: SortStateModel) => void): Promise<void> {
        let completed: boolean = false, flag: boolean, k: number, times: number = 0;

        for (let i = lhs; i <= rhs && !completed; i++) {
            completed = true;

            for (let j = lhs; j <= rhs; j++) {
                k = Math.min(j + 1, rhs);
                flag = source[k].value < source[j].value;

                [completed, times] = await this._service.swapAndRender(source, completed, flag, j, k, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, times, callback);
            }
        }

        await delay();
        await this.complete(source, times, callback);
    }

    protected override async sortByDescent(source: SortDataModel[], lhs: number, rhs: number, option: string | number | undefined, callback: (param: SortStateModel) => void): Promise<void> {
        let completed: boolean = false, flag: boolean, k: number, times: number = 0;

        for (let i = lhs; i <= rhs && !completed; i++) {
            completed = true;

            for (let j = rhs; j >= lhs; j--) {
                k = Math.max(j - 1, 0);
                flag = source[k].value < source[j].value;

                [completed, times] = await this._service.swapAndRender(source, completed, flag, j, k, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, times, callback);
            }
        }

        await delay();
        await this.complete(source, times, callback);
    }

}

/**
 * 冒泡排序（单向）
 */
@Injectable()
export class BubbleSortService extends AbstractSortService {

    constructor(private _service: SortToolsService) {
        super();
    }

    protected override async sortByAscent(source: SortDataModel[], lhs: number, rhs: number, option: string| number | undefined, callback: (param: SortStateModel) => void): Promise<void> {
        let completed: boolean = false, flag: boolean, k: number, times: number = 0;

        for (let i = lhs; i <= rhs && !completed; i++) {
            completed = true;

            for (let j = lhs; j <= rhs - i; j++) {
                k = Math.min(j + 1, rhs);
                flag = source[k].value < source[j].value;

                [completed, times] = await this._service.swapAndRender(source, completed, flag, j, k, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, times, callback);
            }
        }

        await delay();
        await this.complete(source, times, callback);
    }

    protected override async sortByDescent(source: SortDataModel[], lhs: number, rhs: number, option: string| number | undefined, callback: (param: SortStateModel) => void): Promise<void> {
        let completed: boolean = false, flag: boolean, k: number, times: number = 0;

        for (let i = lhs; i <= rhs && !completed; i++) {
            completed = true;

            for (let j = rhs; j >= lhs + i; j--) {
                k = Math.max(j - 1, lhs);
                flag = source[k].value < source[j].value;

                [completed, times] = await this._service.swapAndRender(source, completed, flag, j, k, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, times, callback);
            }
        }

        await delay();
        await this.complete(source, times, callback);
    }

}

/**
 * 冒泡排序（双向）
 */
@Injectable()
export class ShakerBubbleSortService extends AbstractSortService {

    constructor(private _service: SortToolsService) {
        super();
    }

    protected override async sortByAscent(source: SortDataModel[], lhs: number, rhs: number, option: string | number | undefined, callback: (param: SortStateModel) => void): Promise<void> {
        let completed: boolean, flag: boolean, pivot: number = lhs, k: number = -1, times: number = 0;

        for (let i = lhs; i <= rhs; i++) {
            completed = true;

            for (let j = pivot; j <= rhs - i; j++) {
                k = Math.min(j + 1, rhs - i);
                flag = source[k].value < source[j].value;

                [completed, times] = await this._service.swapAndRender(source, completed, flag, j, k, PRIMARY_ONE_COLOR, SECONDARY_ONE_COLOR, ACCENT_ONE_COLOR, times, callback);
            }

            if (completed) break;

            completed = true;
            pivot = k;

            for (let j = pivot; j >= lhs + i; j--) {
                k = Math.max(j - 1, lhs + i);
                flag = source[k].value > source[j].value;

                [completed, times] = await this._service.swapAndRender(source, completed, flag, j, k, PRIMARY_TWO_COLOR, SECONDARY_TWO_COLOR, ACCENT_TWO_COLOR, times, callback);
            }

            if (completed) break;

            pivot = k;
        }

        await delay();
        await this.complete(source, times, callback);
    }

    protected override async sortByDescent(source: SortDataModel[], lhs: number, rhs: number, option: string | number | undefined, callback: (param: SortStateModel) => void): Promise<void> {
        let completed: boolean, flag: boolean, pivot: number = rhs, k: number = -1, times: number = 0;

        for (let i = lhs; i <= rhs; i++) {
            completed = true;

            for (let j = pivot; j >= lhs + i; j--) {
                k = Math.max(j - 1, lhs + i);
                flag = source[k].value < source[j].value;

                [completed, times] = await this._service.swapAndRender(source, completed, flag, j, k, PRIMARY_ONE_COLOR, SECONDARY_ONE_COLOR, ACCENT_ONE_COLOR, times, callback);
            }

            if (completed) break;

            completed = true;
            pivot = k;

            for (let j = pivot; j <= rhs - i; j++) {
                k = Math.min(j + 1, rhs - i);
                flag = source[k].value > source[j].value;
                
                [completed, times] = await this._service.swapAndRender(source, completed, flag, j, k, PRIMARY_TWO_COLOR, SECONDARY_TWO_COLOR, ACCENT_TWO_COLOR, times, callback);
            }

            if (completed) break;

            pivot = k;
        }

        await delay();
        await this.complete(source, times, callback);
    }

}

/**
 * 二路冒泡排序
 */
@Injectable()
export class TwoWayBubbleSortService extends AbstractSortService {

    constructor(private _service: SortToolsService) {
        super();
    }

    protected override async sortByAscent(source: SortDataModel[], lhs: number, rhs: number, option: string | number | undefined, callback: (param: SortStateModel) => void): Promise<void> {
        const length: number = source.length;
        let m: number, n: number, fstFlag: boolean, sndFlag: boolean, completed: boolean = false, times: number = 0;

        for (let lhs = 0, rhs = length - 1; lhs <= rhs && !completed; lhs++, rhs--) {
            completed = true;

            for (let i = lhs, j = rhs; i <= rhs && j >= lhs; i++, j--) {
                m = Math.min(i + 1, rhs);
                n = Math.max(j - 1, lhs);

                fstFlag = source[m].value < source[i].value;

                [completed, times] = await this._service.swapAndRender(source, completed, fstFlag, i, m, PRIMARY_ONE_COLOR, SECONDARY_ONE_COLOR, ACCENT_ONE_COLOR, times, callback);

                sndFlag = source[n].value > source[j].value;
                
                [completed, times] = await this._service.swapAndRender(source, completed, sndFlag, j, n, PRIMARY_TWO_COLOR, SECONDARY_TWO_COLOR, ACCENT_TWO_COLOR, times, callback);
            }
        }
        
        await delay();
        await this.complete(source, times, callback);
    }

    protected override async sortByDescent(source: SortDataModel[], lhs: number, rhs: number, option: string | number | undefined, callback: (param: SortStateModel) => void): Promise<void> {
        const length: number = source.length;
        let m: number, n: number, fstFlag: boolean, sndFlag: boolean, completed: boolean = false, times: number = 0;

        for (let lhs = 0, rhs = length - 1; lhs <= rhs && !completed; lhs++, rhs--) {
            completed = true;

            for (let i = lhs, j = rhs; i <= rhs && j >= lhs; i++, j--) {
                m = Math.min(i + 1, rhs);
                n = Math.max(j - 1, lhs);

                fstFlag = source[m].value > source[i].value;

                [completed, times] = await this._service.swapAndRender(source, completed, fstFlag, i, m, PRIMARY_ONE_COLOR, SECONDARY_ONE_COLOR, ACCENT_ONE_COLOR, times, callback);

                sndFlag = source[n].value < source[j].value;
                
                [completed, times] = await this._service.swapAndRender(source, completed, sndFlag, j, n, PRIMARY_TWO_COLOR, SECONDARY_TWO_COLOR, ACCENT_TWO_COLOR, times, callback);
            }
        }

        await delay();
        await this.complete(source, times, callback);
    }

}

/**
 * 希尔冒泡排序
 */
@Injectable()
export class ShellBubbleSortService extends AbstractSortService {

    constructor(private _service: SortToolsService) {
        super();
    }

    protected override async sortByAscent(source: SortDataModel[], lhs: number, rhs: number, option: string | number | undefined, callback: (param: SortStateModel) => void): Promise<void> {
        let k: number, times: number = 0, completed: boolean, flag: boolean;

        for (let gap = (rhs - lhs + 1) >> 1; gap > 0; gap = gap === 3 ? gap - 1 : gap >> 1) {
            for (let i = lhs + gap; i <= rhs; i++) {
                completed = gap === 1;

                for (let j = i - gap; j <= rhs - i + gap; j += gap) {
                    k = Math.min(j + gap, rhs);
                    flag = source[k].value < source[j].value;

                    [completed, times] = await this._service.swapAndRender(source, completed, flag, j, k, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, times, callback);
                }

                if (completed) break;
            }
        }

        await delay();
        await this.complete(source, times, callback);
    }

    protected override async sortByDescent(source: SortDataModel[], lhs: number, rhs: number, option: string | number | undefined, callback: (param: SortStateModel) => void): Promise<void> {
        let k: number, times: number = 0, completed: boolean, flag: boolean;

        for (let gap = (rhs - lhs + 1) >> 1; gap > 0; gap = gap === 3 ? gap - 1 : gap >> 1) {
            for (let i = rhs - gap; i >= lhs; i--) {
                completed = gap === 1;

                for (let j = i + gap; j >= rhs - i - gap; j -= gap) {
                    k = Math.max(j - gap, lhs);
                    flag = source[k].value < source[j].value;

                    [completed, times] = await this._service.swapAndRender(source, completed, flag, j, k, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, times, callback);
                }

                if (completed) break;
            }
        }

        await delay();
        await this.complete(source, times, callback);
    }

}

/**
 * 梳排序
 */
@Injectable()
export class CombSortService extends AbstractSortService {

    constructor(private _service: SortToolsService) {
        super();
    }

    protected override async sortByAscent(source: SortDataModel[], lhs: number, rhs: number, option: string | number | undefined, callback: (param: SortStateModel) => void): Promise<void> {
        let completed: boolean = false, flag: boolean, k: number, times: number = 0;

        for (let gap = rhs - lhs + 1; gap > lhs + 1 || !completed; gap = Math.floor(gap * 0.8)) {
            completed = true;

            for (let j = lhs; j <= rhs - gap; j++) {
                k = Math.min(j + gap, rhs);
                flag = source[k].value < source[j].value;

                [completed, times] = await this._service.swapAndRender(source, completed, flag, j, k, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, times, callback);
            }
        }

        await delay();
        await this.complete(source, times, callback);
    }

    protected override async sortByDescent(source: SortDataModel[], lhs: number, rhs: number, option: string | number | undefined, callback: (param: SortStateModel) => void): Promise<void> {
        let completed: boolean = false, flag: boolean, k: number, times: number = 0;

        for (let gap = rhs - lhs + 1; gap > 1 || !completed; gap = Math.floor(gap * 0.8)) {
            completed = true;

            for (let j = rhs; j >= lhs + gap; j--) {
                k = Math.max(j - gap, lhs);
                flag = source[k].value < source[j].value;

                [completed, times] = await this._service.swapAndRender(source, completed, flag, j, k, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, times, callback);
            }
        }

        await delay();
        await this.complete(source, times, callback);
    }

}

/**
 * 奇偶排序
 */
@Injectable()
export class OddEvenSortService extends AbstractSortService {

    constructor(private _service: SortToolsService) {
        super();
    }

    protected override async sortByAscent(source: SortDataModel[], lhs: number, rhs: number, option: string | number | undefined, callback: (param: SortStateModel) => void): Promise<void> {
        let completed: boolean = false, flag: boolean, k: number, times: number = 0;

        for (let i = 0; !completed; i = (i + 1) % 2) {
            completed = true;

            for (let j = lhs + i % 2; j <= rhs; j += 2) {
                k = Math.min(j + 1, rhs);
                flag = source[k].value < source[j].value;
                
                [completed, times] = await this._service.swapAndRender(source, completed, flag, j, k, PRIMARY_ONE_COLOR, SECONDARY_ONE_COLOR, ACCENT_ONE_COLOR, times, callback);
            }
        }
        
        await delay();
        await this.complete(source, times, callback);
    }

    protected override async sortByDescent(source: SortDataModel[], lhs: number, rhs: number, option: string | number | undefined, callback: (param: SortStateModel) => void): Promise<void> {
        let completed: boolean = false, flag: boolean, k: number, times: number = 0;

        for (let i = 0; !completed; i = (i + 1) % 2) {
            completed = true;
            
            for (let j = rhs - i % 2; j >= lhs; j -= 2) {
                k = Math.max(j - 1, lhs);
                flag = source[k].value < source[j].value;
                
                [completed, times] = await this._service.swapAndRender(source, completed, flag, j, k, PRIMARY_ONE_COLOR, SECONDARY_ONE_COLOR, ACCENT_ONE_COLOR, times, callback);
            }
        }

        await delay();
        await this.complete(source, times, callback);
    }

}

