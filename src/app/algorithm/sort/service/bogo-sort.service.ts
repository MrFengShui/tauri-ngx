import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { floor, random } from "lodash";

import { SortDataModel, SortStateModel, SortOrder } from "../ngrx-store/sort.state";
import { delay } from "../../../public/global.utils";
import { SortToolsService } from "../ngrx-store/sort.service";
import { PRIMARY_COLOR, SECONDARY_COLOR, CLEAR_COLOR, ACCENT_COLOR, PRIMARY_ONE_COLOR, SECONDARY_ONE_COLOR, ACCENT_ONE_COLOR, PRIMARY_TWO_COLOR, SECONDARY_TWO_COLOR, ACCENT_TWO_COLOR, START_COLOR, FINAL_COLOR } from "../../../public/global.utils";
import { AbstractSortService } from "./base-sort.service";

/**
 * 猴子排序
 */
@Injectable()
export class BogoSortService extends AbstractSortService {

    constructor(private _service: SortToolsService) {
        super();
    }

    protected override async sortByAscent(source: SortDataModel[], lhs: number, rhs: number, option: string | number | undefined, callback: (param: SortStateModel) => void): Promise<void> {
        let i: number, j: number, threshold: number = -1, completed: boolean, flag: boolean, times: number = 0;
        
        while (true) {
            completed = true;

            for (let k = rhs; k >= lhs && completed; k--) {
                i = k;
                j = Math.max(k - 1, lhs);
                completed = source[j].value <= source[i].value;
                threshold = i;

                [completed, times] = await this._service.swapAndRender(source, false, false, i, j, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, times, callback);
            }
            
            if (completed) break;

            i = random(lhs, threshold, false);
            j = random(lhs, threshold, false);
            flag = (i < j && source[i].value > source[j].value) || (i > j && source[i].value < source[j].value);

            times = await this.render(source, i, j, PRIMARY_COLOR, SECONDARY_COLOR, times, callback);

            if (!flag) continue;

            [completed, times] = await this._service.swapAndRender(source, completed, flag, i, j, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, times, callback);
        }

        await delay();
        await this.complete(source, times, callback);
    }

    protected override async sortByDescent(source: SortDataModel[], lhs: number, rhs: number, option: string | number | undefined, callback: (parram: SortStateModel) => void): Promise<void> {
        let i: number, j: number, threshold: number = -1, completed: boolean, flag: boolean, times: number = 0;
        
        while (true) {
            completed = true;

            for (let k = lhs; k <= rhs && completed; k++) {
                i = k;
                j = Math.min(k + 1, rhs);
                completed = source[j].value <= source[i].value;
                threshold = i;

                [completed, times] = await this._service.swapAndRender(source, false, false, i, j, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, times, callback);
            }

            if (completed) break;

            i = random(threshold, rhs, false);
            j = random(threshold, rhs, false);
            flag = (i < j && source[i].value < source[j].value) || (i > j && source[i].value > source[j].value);
            
            times = await this.render(source, i, j, PRIMARY_COLOR, SECONDARY_COLOR, times, callback);

            if (!flag) continue;

            [completed, times] = await this._service.swapAndRender(source, completed, flag, i, j, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, times, callback);
        }

        await delay();
        await this.complete(source, times, callback);
    }

}

/**
 * 猴子冒泡排序（单向）
 */
@Injectable()
export class BogoBubbleSortService extends AbstractSortService {

    constructor(private _service: SortToolsService) {
        super();
    }

    protected override async sortByAscent(source: SortDataModel[], lhs: number, rhs: number, option: string | number | undefined, callback: (param: SortStateModel) => void): Promise<void> {
        let completed: boolean, flag: boolean, threshold: number = -1, times: number = 0, k: number;

        while (true) {
            completed = true;

            for (let i = rhs; i >= lhs && completed; i--) {
                k = Math.max(i - 1, lhs);
                completed = source[k].value <= source[i].value;
                threshold = i;

                await this._service.swapAndRender(source, false, false, i, k, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, times, callback);
            }

            if (completed) break;

            for (let i = lhs; i <= threshold; i++) {
                k = random(Math.min(i + 1, threshold), threshold, false);
                flag = source[k].value < source[i].value;

                source[threshold].color = ACCENT_COLOR;
                callback({ times, datalist: source });
    
                [completed, times] = await this._service.swapAndRender(source, completed, flag, i, k, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, times, callback);
            }
            
            source[threshold].color = CLEAR_COLOR;
            callback({ times, datalist: source });
        }

        await delay();
        await this.complete(source, times, callback);
    }

    protected override async sortByDescent(source: SortDataModel[], lhs: number, rhs: number, option: string | number | undefined, callback: (param: SortStateModel) => void): Promise<void> {
        let completed: boolean, flag: boolean, threshold: number = -1, times: number = 0, k: number;

        while (true) {
            completed = true;

            for (let i = lhs; i <= rhs && completed; i++) {
                k = Math.min(i + 1, rhs);
                completed = source[k].value <= source[i].value;
                threshold = i;

                await this._service.swapAndRender(source, false, false, i, k, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, times, callback);
            }

            if (completed) break;

            for (let i = rhs; i >= threshold; i--) {
                k = random(Math.max(i - 1, threshold), threshold, false);
                flag = source[k].value < source[i].value;

                source[threshold].color = ACCENT_COLOR;
                callback({ times, datalist: source });
    
                [completed, times] = await this._service.swapAndRender(source, completed, flag, i, k, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, times, callback);
            }
            
            source[threshold].color = CLEAR_COLOR;
            callback({ times, datalist: source });
        }

        await delay();
        await this.complete(source, times, callback);
    }

}

/**
 * 猴子冒泡排序（双向）
 */
@Injectable()
export class BogoShakerBubbleSortService extends AbstractSortService {

    constructor(private _service: SortToolsService) {
        super();
    }

    protected override async sortByAscent(source: SortDataModel[], lhs: number, rhs: number, option: string | number | undefined, callback: (param: SortStateModel) => void): Promise<void> {
        let completed: boolean, flag: boolean, start: number = lhs, final: number = rhs, times: number = 0, k: number;
        
        while (true) {
            completed = true;

            for (let i = lhs; i <= rhs && completed; i++) {
                k = Math.min(i + 1, rhs);
                completed = source[k].value >= source[i].value;
                start = i;

                await this._service.swapAndRender(source, false, false, i, k, PRIMARY_ONE_COLOR, SECONDARY_ONE_COLOR, ACCENT_ONE_COLOR, times, callback);
            }
            
            if (completed) break;

            for (let i = start; i <= final; i++) {
                k = random(Math.min(i + 1, final), final, false);
                flag = source[k].value < source[i].value;

                source[start].color = START_COLOR;
                source[final].color = FINAL_COLOR;
                callback({ times, datalist: source });

                [completed, times] = await this._service.swapAndRender(source, completed, flag, i, k, PRIMARY_ONE_COLOR, SECONDARY_ONE_COLOR, ACCENT_ONE_COLOR, times, callback);
            }

            source[start].color = CLEAR_COLOR;
            source[final].color = CLEAR_COLOR;
            callback({ times, datalist: source });

            completed = true;

            for (let i = rhs; i >= lhs && completed; i--) {
                k = Math.max(i - 1, lhs);
                completed = source[k].value <= source[i].value;
                final = i;

                await this._service.swapAndRender(source, false, false, i, k, PRIMARY_TWO_COLOR, SECONDARY_TWO_COLOR, ACCENT_TWO_COLOR, times, callback);
            }

            if (completed) break;

            for (let i = final; i >= start; i--) {
                k = random(start, Math.max(i - 1, start), false);
                flag = source[k].value > source[i].value;

                source[start].color = START_COLOR;
                source[final].color = FINAL_COLOR;
                callback({ times, datalist: source });

                [completed, times] = await this._service.swapAndRender(source, completed, flag, i, k, PRIMARY_TWO_COLOR, SECONDARY_TWO_COLOR, ACCENT_TWO_COLOR, times, callback);
            }
            
            source[start].color = CLEAR_COLOR;
            source[final].color = CLEAR_COLOR;
            callback({ times, datalist: source });
        }

        await delay();
        await this.complete(source, times, callback);
    }

    protected override async sortByDescent(source: SortDataModel[], lhs: number, rhs: number, option: string | number | undefined, callback: (parram: SortStateModel) => void): Promise<void> {
        const length: number = source.length;
        let completed: boolean, flag: boolean, start: number = rhs, final: number = lhs, times: number = 0, k: number;

        while (true) {
            completed = true;

            for (let i = rhs; i >= lhs && completed; i--) {
                k = Math.max(i - 1, lhs);
                completed = source[k].value >= source[i].value;
                start = i;

                await this._service.swapAndRender(source, false, false, i, k, PRIMARY_TWO_COLOR, SECONDARY_TWO_COLOR, ACCENT_TWO_COLOR, times, callback);
            }

            if (completed) break;

            for (let i = start; i >= final; i--) {
                k = random(final, Math.max(i - 1, final), false);
                flag = source[k].value < source[i].value;

                source[start].color = START_COLOR;
                source[final].color = FINAL_COLOR;
                callback({ times, datalist: source });

                [completed, times] = await this._service.swapAndRender(source, completed, flag, i, k, PRIMARY_TWO_COLOR, SECONDARY_TWO_COLOR, ACCENT_TWO_COLOR, times, callback);
            }
            
            source[start].color = CLEAR_COLOR;
            source[final].color = CLEAR_COLOR;
            callback({ times, datalist: source });

            completed = true;
            
            for (let i = lhs; i <= rhs && completed; i++) {
                k = Math.min(i + 1, rhs);
                completed = source[k].value <= source[i].value;
                final = i;

                await this._service.swapAndRender(source, false, false, i, k, PRIMARY_ONE_COLOR, SECONDARY_ONE_COLOR, ACCENT_ONE_COLOR, times, callback);
            }
            
            if (completed) break;

            for (let i = final; i <= start; i++) {
                k = random(Math.min(i + 1, start), start, false);
                flag = source[k].value > source[i].value;

                source[start].color = START_COLOR;
                source[final].color = FINAL_COLOR;
                callback({ times, datalist: source });

                [completed, times] = await this._service.swapAndRender(source, completed, flag, i, k, PRIMARY_ONE_COLOR, SECONDARY_ONE_COLOR, ACCENT_ONE_COLOR, times, callback);
            }

            source[start].color = CLEAR_COLOR;
            source[final].color = CLEAR_COLOR;
            callback({ times, datalist: source });
        }

        await delay();
        await this.complete(source, times, callback);
    }

}

/**
 * 猴子插入排序
 */
@Injectable()
export class BogoInsertionSortService extends AbstractSortService {

    constructor(private _service: SortToolsService) {
        super();
    }

    protected override async sortByAscent(source: SortDataModel[], lhs: number, rhs: number, option: string | number | undefined, callback: (param: SortStateModel) => void): Promise<void> {
        let k: number, threshold: number = 0, times: number = 0, completed: boolean, flag: boolean;
        
        while (true) {
            completed = true;

            for (let i = lhs; i <= rhs && completed; i++) {
                k = Math.min(i + 1, rhs);
                completed = source[k].value >= source[i].value;
                threshold = i;

                [completed, times] = await this._service.swapAndRender(source, completed, false, i, k, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, times, callback);
            }
            
            if (completed) break;

            flag = true;

            if (this.COIN_FLAG()) {
                for (let i = Math.min(threshold + 1, rhs); i >= lhs && flag; i--) {
                    k = Math.max(i - 1, lhs);
                    flag = source[k].value > source[i].value;
    
                    [completed, times] = await this._service.swapAndRender(source, completed, flag, i, k, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, times, callback);
                }
            } else {
                for (let i = random(Math.min(threshold + 1, rhs), rhs, false); i >= threshold && flag; i--) {
                    k = Math.max(i - 1, threshold);
                    flag = source[k].value > source[i].value;
    
                    [completed, times] = await this._service.swapAndRender(source, completed, flag, i, k, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, times, callback);
                }
            }
        }

        await delay();
        await this.complete(source, times, callback);
    }

    protected override async sortByDescent(source: SortDataModel[], lhs: number, rhs: number, option: string | number | undefined, callback: (parram: SortStateModel) => void): Promise<void> {
        let k: number, threshold: number = 0, times: number = 0, completed: boolean, flag: boolean;
        
        while (true) {
            completed = true;

            for (let i = rhs; i >= lhs && completed; i--) {
                k = Math.max(i - 1, lhs);
                completed = source[k].value >= source[i].value;
                threshold = i;

                [completed, times] = await this._service.swapAndRender(source, completed, false, i, k, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, times, callback);
            }
            
            if (completed) break;

            flag = true;

            if (this.COIN_FLAG()) {
                for (let i = Math.max(threshold - 1, lhs); i <= rhs && flag; i++) {
                    k = Math.min(i + 1, rhs);
                    flag = source[k].value > source[i].value;
    
                    [completed, times] = await this._service.swapAndRender(source, completed, flag, i, k, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, times, callback);
                }
            } else {
                for (let i = random(lhs, Math.max(threshold - 1, lhs), false); i <= threshold && flag; i++) {
                    k = Math.min(i + 1, threshold);
                    flag = source[k].value > source[i].value;
    
                    [completed, times] = await this._service.swapAndRender(source, completed, flag, i, k, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, times, callback);
                }
            }
        }

        await delay();
        await this.complete(source, times, callback);
    }

}

/**
 * 猴子选择排序
 */
@Injectable()
export class BogoSelectionSortService extends AbstractSortService {

    constructor(private _service: SortToolsService) {
        super();
    }

    protected override async sortByAscent(source: SortDataModel[], lhs: number, rhs: number, option: string | number | undefined, callback: (param: SortStateModel) => void): Promise<void> {
        let j: number, k: number = -1, times: number = 0, completed: boolean;
        
        while (true) {
            completed = true;

            for (let i = lhs; i <= rhs && completed; i++) {
                j = Math.min(i + 1, rhs);
                completed = source[j].value >= source[i].value;
                k = i;

                await this._service.swapAndRender(source, false, false, i, j, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, times, callback);
            }
            
            if (completed) break;

            j = this.COIN_FLAG() ? Math.min(k, rhs) : random(Math.min(k, rhs), rhs, false);
            k = j;

            for (let i = Math.min(j + 1, rhs); i <= rhs; i++) {
                source[j].color = PRIMARY_COLOR;
                source[i].color = SECONDARY_COLOR;
                source[k].color = ACCENT_COLOR;
                callback({ times, datalist: source });

                if (source[i].value < source[k].value) {
                    source[k].color = CLEAR_COLOR;

                    k = i;
                }

                await delay();

                source[j].color = PRIMARY_COLOR;
                source[i].color = CLEAR_COLOR;
                source[k].color = ACCENT_COLOR;
                callback({ times, datalist: source });
            }

            [completed, times] = await this._service.swapAndRender(source, completed, j !== k, j, k, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, times, callback);
        }

        await delay();
        await this.complete(source, times, callback);
    }

    protected override async sortByDescent(source: SortDataModel[], lhs: number, rhs: number, option: string | number | undefined, callback: (parram: SortStateModel) => void): Promise<void> {
        let j: number, k: number = -1, times: number = 0, completed: boolean;
        
        while (true) {
            completed = true;

            for (let i = rhs; i >= lhs && completed; i--) {
                j = Math.max(i - 1, lhs);
                completed = source[j].value >= source[i].value;
                k = i;

                await this._service.swapAndRender(source, false, false, i, j, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, times, callback);
            }
            
            if (completed) break;

            j = this.COIN_FLAG() ? Math.max(k, lhs) : random(lhs, Math.max(k, lhs), false);
            k = j;

            for (let i = Math.max(k - 1, lhs); i >= lhs; i--) {
                source[j].color = PRIMARY_COLOR;
                source[i].color = SECONDARY_COLOR;
                source[k].color = ACCENT_COLOR;
                callback({ times, datalist: source });

                if (source[i].value < source[k].value) {
                    source[k].color = CLEAR_COLOR;

                    k = i;
                }

                await delay();

                source[j].color = PRIMARY_COLOR;
                source[i].color = CLEAR_COLOR;
                source[k].color = ACCENT_COLOR;
                callback({ times, datalist: source });
            }

            [completed, times] = await this._service.swapAndRender(source, completed, j !== k, j, k, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, times, callback);
        }

        await delay();
        await this.complete(source, times, callback);
    }

}
