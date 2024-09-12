import { Injectable } from "@angular/core";
import { floor, random } from "lodash";

import { SortDataModel, SortOrder, SortStateModel } from "../ngrx-store/sort.state";

import { ACCENT_COLOR, ACCENT_ONE_COLOR, ACCENT_TWO_COLOR, PRIMARY_COLOR, SECONDARY_COLOR } from "../../../public/global.utils";

import { RecursiveQuickSortService } from "./quick-sort.service";

/**
 * 圆木排序
 */
@Injectable()
export class LogSortService extends RecursiveQuickSortService {
    
    protected override async sortByOrder(source: SortDataModel[], lhs: number, rhs: number, order: SortOrder, times: number, callback: (param: SortStateModel) => void): Promise<number> {
        let size: number = rhs - lhs + 1,  mid: number = random(floor(size * 0.25 + lhs, 0), floor(size * 0.75 + lhs, 0), false);

        if (lhs < rhs) {
            if (order === 'ascent') {
                [times, mid] = await this.newPartitionByAscent(source, lhs, mid, rhs, times, callback);
                times = await this.sortByOrder(source, lhs, mid - 1, order, times, callback);
                times = await this.sortByOrder(source, mid + 1, rhs, order, times, callback);
            }

            if (order === 'descent') {
                [times, mid] = await this.newPartitionByDescent(source, lhs, mid, rhs, times, callback);
                times = await this.sortByOrder(source, mid + 1, rhs, order, times, callback);
                times = await this.sortByOrder(source, lhs, mid - 1, order, times, callback);
            }
        }

        return times;
    }
    
    protected override async tailSortByOrder(source: SortDataModel[], lhs: number, rhs: number, order: SortOrder, times: number, callback: (param: SortStateModel) => void): Promise<number> {
        let size: number = rhs - lhs + 1,  mid: number = random(floor(size * 0.25 + lhs, 0), floor(size * 0.75 + lhs, 0), false);

        while (lhs < rhs) {
            if (order === 'ascent') {
                [times, mid] = await this.newPartitionByAscent(source, lhs, mid, rhs, times, callback);
                times = await this.tailSortByOrder(source, lhs, mid - 1, order, times, callback);
                lhs = mid + 1;
            }

            if (order === 'descent') {
                [times, mid] = await this.newPartitionByDescent(source, lhs, mid, rhs, times, callback);
                times = await this.tailSortByOrder(source, mid + 1, rhs, order, times, callback);
                rhs = mid - 1;
            }
        }

        return times;
    }

    protected async newPartitionByAscent(source: SortDataModel[], lhs: number, mid: number, rhs: number, times: number, callback: (param: SortStateModel) => void): Promise<[number, number]> {
        let fstArray: number[] | null = Array.from([]), sndArray: number[] | null = Array.from([]), pivot: number = source[mid].value;

        for (let i = lhs; i <= rhs; i++) {
            if (i === mid) continue;

            if (source[i].value < pivot) {
                fstArray.push(source[i].value);
            } else if (source[i].value > pivot) {
                sndArray.push(source[i].value);
            } else {
                if (i < mid) {
                    fstArray.push(source[i].value);
                } else {
                    sndArray.push(source[i].value);
                }
            }

            times = await this.sweep(source, i, ACCENT_ONE_COLOR, times, callback);
        }
        
        mid = lhs + fstArray.length;

        this.array = this.array.concat(...fstArray, pivot, ...sndArray);
        fstArray.splice(0);
        sndArray.splice(0);
        fstArray = null;
        sndArray = null;
        
        for (let i = lhs; this.array.length > 0; i++) {
            source[i].value = this.array.shift() as number;

            times = await this.sweep(source, i, ACCENT_TWO_COLOR, times, callback);
            times += 1;
        }

        return [times, mid];
    }

    protected async newPartitionByDescent(source: SortDataModel[], lhs: number, mid: number, rhs: number, times: number, callback: (param: SortStateModel) => void): Promise<[number, number]> {
        let fstArray: number[] | null = Array.from([]), sndArray: number[] | null = Array.from([]), pivot: number = source[mid].value;

        for (let i = rhs; i >= lhs; i--) {
            if (i === mid) continue;

            if (source[i].value < pivot) {
                fstArray.push(source[i].value);
            } else if (source[i].value > pivot) {
                sndArray.push(source[i].value);
            } else {
                if (i > mid) {
                    fstArray.push(source[i].value);
                } else {
                    sndArray.push(source[i].value);
                }
            }

            times = await this.sweep(source, i, ACCENT_ONE_COLOR, times, callback);
        }
        
        mid = rhs - fstArray.length;

        this.array = this.array.concat(...fstArray, pivot, ...sndArray);
        fstArray.splice(0);
        sndArray.splice(0);
        fstArray = null;
        sndArray = null;
        
        for (let i = rhs; this.array.length > 0; i--) {
            source[i].value = this.array.shift() as number;

            times = await this.sweep(source, i, ACCENT_TWO_COLOR, times, callback);
            times += 1;
        }

        return [times, mid];
    }

}

@Injectable()
export class InPlaceLogSortService extends LogSortService {

    protected override async newPartitionByAscent(source: SortDataModel[], lhs: number, mid: number, rhs: number, times: number, callback: (param: SortStateModel) => void): Promise<[number, number]> {
        let pivot: number = source[mid].value, idx: number;
        
        if (lhs + 1 === rhs) {
            times = await this.exchange(source, source[lhs].value > source[rhs].value, lhs, rhs, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, times, callback);
        } else {
            for (let i = lhs; i <= rhs; ) {
                if (i < mid) {
                    if (source[i].value < pivot) {
                        times = await this.render(source, i, mid, ACCENT_ONE_COLOR, ACCENT_TWO_COLOR, times, callback);
    
                        i += 1;
                    } else {
                        for (let j = i; j < rhs; j++) {
                            source[i].color = ACCENT_ONE_COLOR;
                            source[mid].color = ACCENT_TWO_COLOR;
                            callback({ times, datalist: source });
    
                            times = await this.exchange(source, true, j, j + 1, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, times, callback);
                        }
    
                        times = await this.render(source, i, mid, ACCENT_ONE_COLOR, ACCENT_TWO_COLOR, times, callback);
    
                        mid -= 1;
                    }
                } else if (i > mid) {
                    if (source[i].value < pivot) {
                        idx = Math.max(mid - 1, lhs);

                        for (let j = i; j > idx; j--) {
                            source[i].color = ACCENT_ONE_COLOR;
                            source[mid].color = ACCENT_TWO_COLOR;
                            callback({ times, datalist: source });
    
                            times = await this.exchange(source, true, j, j - 1, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, times, callback);
                        }
    
                        times = await this.render(source, i, mid, ACCENT_ONE_COLOR, ACCENT_TWO_COLOR, times, callback);
    
                        i += 1;
                        mid += 1;
                    } else {
                        times = await this.render(source, i, mid, ACCENT_ONE_COLOR, ACCENT_TWO_COLOR, times, callback);
    
                        i += 1;
                    }
                } else {
                    i += 1;
                    continue;
                }
            }
        }
        
        return [times, mid];
    }

    protected override async newPartitionByDescent(source: SortDataModel[], lhs: number, mid: number, rhs: number, times: number, callback: (param: SortStateModel) => void): Promise<[number, number]> {
        let pivot: number = source[mid].value, idx: number;

        if (rhs - 1 === lhs) {
            times = await this.exchange(source, source[rhs].value > source[lhs].value, rhs, lhs, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, times, callback);
        } else {
            for (let i = rhs; i >= lhs; ) {
                if (i > mid) {
                    if (source[i].value < pivot) {
                        times = await this.render(source, i, mid, ACCENT_ONE_COLOR, ACCENT_TWO_COLOR, times, callback);
    
                        i -= 1;
                    } else {
                        for (let j = i; j > lhs; j--) {
                            source[i].color = ACCENT_ONE_COLOR;
                            source[mid].color = ACCENT_TWO_COLOR;
                            callback({ times, datalist: source });
    
                            times = await this.exchange(source, true, j, j - 1, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, times, callback);
                        }

                        times = await this.render(source, i, mid, ACCENT_ONE_COLOR, ACCENT_TWO_COLOR, times, callback);
    
                        mid += 1;
                    }
                } else if (i < mid) {
                    if (source[i].value < pivot) {
                        idx = Math.min(mid + 1, rhs);

                        for (let j = i; j < idx; j++) {
                            source[i].color = ACCENT_ONE_COLOR;
                            source[mid].color = ACCENT_TWO_COLOR;
                            callback({ times, datalist: source });
    
                            times = await this.exchange(source, true, j, j + 1, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, times, callback);
                        }

                        times = await this.render(source, i, mid, ACCENT_ONE_COLOR, ACCENT_TWO_COLOR, times, callback);
    
                        i -= 1;
                        mid -= 1;
                    } else {
                        times = await this.render(source, i, mid, ACCENT_ONE_COLOR, ACCENT_TWO_COLOR, times, callback);
    
                        i -= 1;
                    }
                } else {
                    i -= 1;
                    continue;
                }
            }
        }

        return [times, mid];
    }

}