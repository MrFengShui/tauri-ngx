import { Injectable } from "@angular/core";
import { ceil, floor, random } from "lodash";

import { SortDataModel, SortStateModel } from "../ngrx-store/sort.state";

import { ACCENT_COLOR, ACCENT_ONE_COLOR, ACCENT_TWO_COLOR, delay, PRIMARY_COLOR, SECONDARY_COLOR } from "../../../public/global.utils";

import { RecursiveQuickSortService } from "./quick-sort.service";
import { PartitionMetaInfo } from "./base-sort.service";

/**
 * 圆木排序
 */
@Injectable()
export class RecursiveLogSortService extends RecursiveQuickSortService {
    
    protected override async partitionByAscent(source: SortDataModel[], lhs: number, rhs: number, times: number, callback: (param: SortStateModel) => void): Promise<PartitionMetaInfo> {
        let index: number = random(floor((rhs - lhs) * 0.25 + lhs, 0), ceil((rhs - lhs) * 0.75 + lhs, 0), false);
        let pivot: number = source[index].value, fstArray: number[] | null = Array.from([]), sndArray: number[] | null = Array.from([]);

        for (let i = lhs; i <= rhs; i++) {
            if (i === index) continue;

            if (source[i].value < pivot) {
                fstArray.push(source[i].value);
            } else if (source[i].value > pivot) {
                sndArray.push(source[i].value);
            } else {
                if (i < index) {
                    fstArray.push(source[i].value);
                } else {
                    sndArray.push(source[i].value);
                }
            }

            times = await this.sweep(source, i, ACCENT_ONE_COLOR, times, callback);
        }
        
        index = lhs + fstArray.length;

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

        return { times, mid: index };
    }

    protected override async partitionByDescent(source: SortDataModel[], lhs: number, rhs: number, times: number, callback: (param: SortStateModel) => void): Promise<PartitionMetaInfo> {
        let index: number = random(floor((rhs - lhs) * 0.25 + lhs, 0), ceil((rhs - lhs) * 0.75 + lhs, 0), false);
        let pivot: number = source[index].value, fstArray: number[] | null = Array.from([]), sndArray: number[] | null = Array.from([]);

        for (let i = rhs; i >= lhs; i--) {
            if (i === index) continue;

            if (source[i].value < pivot) {
                fstArray.push(source[i].value);
            } else if (source[i].value > pivot) {
                sndArray.push(source[i].value);
            } else {
                if (i > index) {
                    fstArray.push(source[i].value);
                } else {
                    sndArray.push(source[i].value);
                }
            }

            times = await this.sweep(source, i, ACCENT_ONE_COLOR, times, callback);
        }
        
        index = rhs - fstArray.length;

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

        return { times, mid: index };
    }

}

@Injectable()
export class IterativeLogSortService extends RecursiveLogSortService {

    protected override async sortByAscent(source: SortDataModel[], lhs: number, rhs: number, option: string | number | undefined, callback: (param: SortStateModel) => void): Promise<void> {
        let partition: PartitionMetaInfo, mid: number, times: number = 0;

        this.stack.push(rhs);
        this.stack.push(lhs);

        while (this.stack.length > 0) {
            lhs = this.stack.pop() as number;
            rhs = this.stack.pop() as number;

            partition = await this.partitionByAscent(source, lhs, rhs, times, callback);
            times = partition.times;
            mid = partition?.mid as number;

            if (mid + 1 < rhs) {
                this.stack.push(rhs);
                this.stack.push(mid + 1);
            }

            if (lhs < mid - 1) {
                this.stack.push(mid - 1);
                this.stack.push(lhs);
            }
        }

        await delay();
        await this.complete(source, times, callback);
    }

    protected override async sortByDescent(source: SortDataModel[], lhs: number, rhs: number, option: string | number | undefined, callback: (param: SortStateModel) => void): Promise<void> {
        let partition: PartitionMetaInfo, mid: number, times: number = 0;

        this.stack.push(lhs);
        this.stack.push(rhs);

        while (this.stack.length > 0) {
            rhs = this.stack.pop() as number;
            lhs = this.stack.pop() as number;

            partition = await this.partitionByDescent(source, lhs, rhs, times, callback);
            times = partition.times;
            mid = partition?.mid as number;

            if (lhs < mid - 1) {
                this.stack.push(lhs);
                this.stack.push(mid - 1);
            }

            if (mid + 1 < rhs) {
                this.stack.push(mid + 1);
                this.stack.push(rhs);
            }
        }

        await delay();
        await this.complete(source, times, callback);
    }

}

@Injectable()
export class InPlaceLogSortService extends IterativeLogSortService {

    protected override async partitionByAscent(source: SortDataModel[], lhs: number, rhs: number, times: number, callback: (param: SortStateModel) => void): Promise<PartitionMetaInfo> {
        let index: number = random(floor((rhs - lhs) * 0.25 + lhs, 0), ceil((rhs - lhs) * 0.75 + lhs, 0), false);
        let pivot: number = source[index].value, idx: number;
        
        if (lhs + 1 === rhs) {
            times = await this.exchange(source, source[lhs].value > source[rhs].value, lhs, rhs, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, times, callback);
        } else {
            for (let i = lhs; i <= rhs; ) {
                if (i < index) {
                    if (source[i].value < pivot) {
                        times = await this.dualSweep(source, i, index, ACCENT_ONE_COLOR, ACCENT_TWO_COLOR, times, callback);
    
                        i += 1;
                    } else {
                        for (let j = i; j < rhs; j++) {
                            source[i].color = ACCENT_ONE_COLOR;
                            source[index].color = ACCENT_TWO_COLOR;
                            callback({ times, datalist: source });
    
                            times = await this.exchange(source, true, j, j + 1, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, times, callback);
                        }
    
                        times = await this.dualSweep(source, i, index, ACCENT_ONE_COLOR, ACCENT_TWO_COLOR, times, callback);
    
                        index -= 1;
                    }
                } else if (i > index) {
                    if (source[i].value < pivot) {
                        idx = Math.max(index - 1, lhs);

                        for (let j = i; j > idx; j--) {
                            source[i].color = ACCENT_ONE_COLOR;
                            source[index].color = ACCENT_TWO_COLOR;
                            callback({ times, datalist: source });
    
                            times = await this.exchange(source, true, j, j - 1, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, times, callback);
                        }
    
                        times = await this.dualSweep(source, i, index, ACCENT_ONE_COLOR, ACCENT_TWO_COLOR, times, callback);
    
                        i += 1;
                        index += 1;
                    } else {
                        times = await this.dualSweep(source, i, index, ACCENT_ONE_COLOR, ACCENT_TWO_COLOR, times, callback);
    
                        i += 1;
                    }
                } else {
                    i += 1;
                    continue;
                }
            }
        }
        
        return { times, mid: index };
    }

    protected override async partitionByDescent(source: SortDataModel[], lhs: number, rhs: number, times: number, callback: (param: SortStateModel) => void): Promise<PartitionMetaInfo> {
        let index: number = random(floor((rhs - lhs) * 0.25 + lhs, 0), ceil((rhs - lhs) * 0.75 + lhs, 0), false);
        let pivot: number = source[index].value, idx: number;

        if (rhs - 1 === lhs) {
            times = await this.exchange(source, source[rhs].value > source[lhs].value, rhs, lhs, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, times, callback);
        } else {
            for (let i = rhs; i >= lhs; ) {
                if (i > index) {
                    if (source[i].value < pivot) {
                        times = await this.dualSweep(source, i, index, ACCENT_ONE_COLOR, ACCENT_TWO_COLOR, times, callback);
    
                        i -= 1;
                    } else {
                        for (let j = i; j > lhs; j--) {
                            source[i].color = ACCENT_ONE_COLOR;
                            source[index].color = ACCENT_TWO_COLOR;
                            callback({ times, datalist: source });
    
                            times = await this.exchange(source, true, j, j - 1, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, times, callback);
                        }

                        times = await this.dualSweep(source, i, index, ACCENT_ONE_COLOR, ACCENT_TWO_COLOR, times, callback);
    
                        index += 1;
                    }
                } else if (i < index) {
                    if (source[i].value < pivot) {
                        idx = Math.min(index + 1, rhs);

                        for (let j = i; j < idx; j++) {
                            source[i].color = ACCENT_ONE_COLOR;
                            source[index].color = ACCENT_TWO_COLOR;
                            callback({ times, datalist: source });
    
                            times = await this.exchange(source, true, j, j + 1, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, times, callback);
                        }

                        times = await this.dualSweep(source, i, index, ACCENT_ONE_COLOR, ACCENT_TWO_COLOR, times, callback);
    
                        i -= 1;
                        index -= 1;
                    } else {
                        times = await this.dualSweep(source, i, index, ACCENT_ONE_COLOR, ACCENT_TWO_COLOR, times, callback);
    
                        i -= 1;
                    }
                } else {
                    i -= 1;
                    continue;
                }
            }
        }

        return { times, mid: index };
    }

}