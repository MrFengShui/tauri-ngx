import { floor } from "lodash";

import { ACCENT_COLOR, CLEAR_COLOR, delay, PRIMARY_COLOR, SECONDARY_COLOR } from "../../../public/global.utils";

import { SortDataModel, SortStateModel, SortIndexRange, SortOption } from "../ngrx-store/sort.state";

import { AbstractComparisonSortAlgorithm } from "../pattern/sort-temp.pattern";

import { SortToolsService } from "../ngrx-store/sort.service";
import { InsertionSortAlgorithm } from "./insertion-sort.algorithm";
import { RecursiveMergeSortAlgorithm } from "./merge-sort.algorithm";

/**
 * 分块排序
 */
export class BlockSortAlgorithm extends AbstractComparisonSortAlgorithm<SortIndexRange> {

    private insertSort: InsertionSortAlgorithm | null = null;
    private fstRange: SortIndexRange | null = null;
    private sndRange: SortIndexRange | null = null;

    constructor(protected override _service: SortToolsService) {
        super(_service);

        if (this.insertSort === null) this.insertSort = new InsertionSortAlgorithm(_service);
    }

    protected override async sortByAscent(source: SortDataModel[], lhs: number, rhs: number, option: SortOption, callback: (param: SortStateModel) => void): Promise<void> {
        if (this.insertSort === null) throw new Error(`错误：引用对象${this.insertSort}未被初始化。`);

        let j: number, times: number = 0;

        for (let i = lhs; i <= rhs; i += this.fstRange.final - this.fstRange.start + 1) {
            if (i % this.THRESHOLD === 0) {
                this.array.push({ start: i, final: Math.min(i + this.THRESHOLD - 1, rhs) });
            }

            this.fstRange = this.array[this.array.length - 1];
            
            [times] = await this.insertSort.sortByOrder(source, this.fstRange.start, this.fstRange.final, 1, 1, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, 'ascent', times, callback);
        }

        while (this.array.length > 0) {
            this.fstRange = this.array.shift() as SortIndexRange;

            for (let i = this.fstRange.start; i <= this.fstRange.final; i++) {
                [times, j] = await this.seekByAscent(source, 0, this.array.length - 1, times, callback);

                this.sndRange = this.array[j];

                if (!this.sndRange) break;

                if (source[this.sndRange.start].value < source[i].value) {
                    times = await this.exchange(source, true, i, this.sndRange.start, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, times, callback);
                    [times] = await this.insertSort.sortByOrder(source, this.sndRange.start, this.sndRange.final, 1, 1, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, 'ascent', times, callback);
                } else {
                    times = await this.sweep(source, i, ACCENT_COLOR, times, callback);
                }
            }
        }

        this.fstRange = null;
        this.sndRange = null;
        
        await delay();
        await this.complete(source, times, callback);
    }

    protected override async sortByDescent(source: SortDataModel[], lhs: number, rhs: number, option: SortOption, callback: (param: SortStateModel) => void): Promise<void> {
        if (this.insertSort === null) throw new Error(`错误：引用对象${this.insertSort}未被初始化。`);

        let j: number, times: number = 0;

        for (let i = rhs; i >= lhs; i -= this.fstRange.final - this.fstRange.start + 1) {
            if ((rhs - i) % this.THRESHOLD === 0) {
                this.array.push({ start: Math.max(i - this.THRESHOLD + 1, lhs), final: i });
            }

            this.fstRange = this.array[this.array.length - 1];
            
            [times] = await this.insertSort.sortByOrder(source, this.fstRange.start, this.fstRange.final, 1, 1, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, 'descent', times, callback);
        }

        while (this.array.length > 0) {
            this.fstRange = this.array.shift() as SortIndexRange;

            for (let i = this.fstRange.final; i >= this.fstRange.start; i--) {
                [times, j] = await this.seekByDescent(source, 0, this.array.length - 1, times, callback);

                this.sndRange = this.array[j];
                
                if (!this.sndRange) break;

                if (source[this.sndRange.final].value < source[i].value) {
                    times = await this.exchange(source, true, i, this.sndRange.final, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, times, callback);
                    [times] = await this.insertSort.sortByOrder(source, this.sndRange.start, this.sndRange.final, 1, 1, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, 'descent', times, callback);
                } else {
                    times = await this.sweep(source, i, ACCENT_COLOR, times, callback);
                }
            }
        }

        this.fstRange = null;
        this.sndRange = null;
        
        await delay();
        await this.complete(source, times, callback);
    }

    private async seekByAscent(source: SortDataModel[], lhs: number, rhs: number, times: number, callback: (param: SortStateModel) => void): Promise<[number, number]> {
        if (rhs - lhs + 1 <= this.THRESHOLD) {
            let fstRange: SortIndexRange | null = this.array[lhs], sndRange: SortIndexRange | null = null, i: number = lhs;

            for (let j = lhs; j <= rhs; j++) {
                sndRange = this.array[j];
                
                source[fstRange.start].color = PRIMARY_COLOR;
                source[sndRange.start].color = SECONDARY_COLOR;
                callback({ times, datalist: source });

                await delay();

                if (source[sndRange.start].value < source[fstRange.start].value) {
                    source[fstRange.start].color = CLEAR_COLOR;

                    fstRange = sndRange;
                    i = j;
                }

                source[fstRange.start].color = PRIMARY_COLOR;
                source[sndRange.start].color = CLEAR_COLOR;
                callback({ times, datalist: source });
            }

            if (fstRange && sndRange) {
                times = await this.dualSweep(source, fstRange.start, sndRange.start, PRIMARY_COLOR, SECONDARY_COLOR, times, callback);

                fstRange = null;
                sndRange = null;
            }

            return [times, i];
        } else {
            if (lhs === rhs) {
                return [times, lhs];
            } else if (lhs > rhs) {
                return [times, rhs];
            } else {
                const mid: number = lhs + floor((rhs - lhs) * 0.5, 0);
                let fst: number, snd: number;
    
                [times, fst] = await this.seekByAscent(source, lhs, mid, times, callback);
                [times, snd] = await this.seekByAscent(source, mid + 1, rhs, times, callback);
    
                return [times, source[this.array[fst].start].value < source[this.array[snd].start].value ? fst : snd];
            }
        }
    }

    private async seekByDescent(source: SortDataModel[], lhs: number, rhs: number, times: number, callback: (param: SortStateModel) => void): Promise<[number, number]> {
        if (rhs - lhs + 1 <= this.THRESHOLD) {
            let fstRange: SortIndexRange | null = this.array[rhs], sndRange: SortIndexRange | null = null, i: number = rhs;

            for (let j = rhs; j >= lhs; j--) {
                sndRange = this.array[j];
                
                source[fstRange.final].color = PRIMARY_COLOR;
                source[sndRange.final].color = SECONDARY_COLOR;
                callback({ times, datalist: source });

                await delay();

                if (source[sndRange.final].value < source[fstRange.final].value) {
                    source[fstRange.final].color = CLEAR_COLOR;

                    fstRange = sndRange;
                    i = j;
                }

                source[fstRange.final].color = PRIMARY_COLOR;
                source[sndRange.final].color = CLEAR_COLOR;
                callback({ times, datalist: source });
            }

            if (fstRange && sndRange) {
                times = await this.dualSweep(source, fstRange.final, sndRange.final, PRIMARY_COLOR, SECONDARY_COLOR, times, callback);

                fstRange = null;
                sndRange = null;
            }

            return [times, i];
        } else {
            if (lhs === rhs) {
                return [times, lhs];
            } else if (lhs > rhs) {
                return [times, rhs];
            } else {
                const mid: number = rhs - floor((rhs - lhs) * 0.5, 0);
                let fst: number, snd: number;
    
                [times, fst] = await this.seekByDescent(source, mid, rhs, times, callback);
                [times, snd] = await this.seekByDescent(source, lhs, mid - 1, times, callback);
    
                return [times, source[this.array[fst].final].value < source[this.array[snd].final].value ? fst : snd];
            }
        }
    }

}

