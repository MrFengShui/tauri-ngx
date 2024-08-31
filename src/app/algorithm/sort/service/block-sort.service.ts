import { Injectable } from "@angular/core";
import { ceil, floor } from "lodash";

import { ACCENT_COLOR, ACCENT_ONE_COLOR, ACCENT_TWO_COLOR, CLEAR_COLOR, delay, PRIMARY_COLOR, SECONDARY_COLOR } from "../../../public/global.utils";

import { SortDataModel, SortStateModel, SortIndexRange, SortOrder } from "../ngrx-store/sort.state";

import { AbstractSortService } from "./base-sort.service";

/**
 * 分块排序
 */
@Injectable()
export class BlockSortService extends AbstractSortService<SortIndexRange> {

    protected override async sortByAscent(source: SortDataModel[], lhs: number, rhs: number, option: string | number | undefined, callback: (param: SortStateModel) => void): Promise<void> {
        let blockSize: number = this.calcBlockSize(rhs - lhs + 1), range: SortIndexRange, start: number = lhs, final: number = rhs, k: number, index: number, completed: boolean, times: number = 0;

        for (let i = lhs; i <= rhs; i++) {
            if (i % blockSize === 0) {
                start = i;
                final = i;
            }

            if (i % blockSize === blockSize - 1 || i === rhs) {
                final = i;
                this.array.push({ start, final });
            }

            times = await this.render(source, i, i, ACCENT_COLOR, ACCENT_COLOR, times, callback);
            times += 1;
        }
        
        times = await this.sortEachBlock(source, 'ascent', times, callback);

        for (let i = lhs; i <= rhs; i++) {
            [times, index] = await this.indexOf(source, this.array, ceil(i / blockSize, 0), this.array.length - 1, 'ascent', times, callback);

            k = this.array[index] &&source[this.array[index].start].value < source[i].value ? this.array[index].start : i;

            [completed, times] = await this._service.swapAndRender(source, false, k !== i, i, k, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, times, callback);

            if (k !== i) {
                range = this.array[index];
                times = await this._service.stableGapSortByAscent(source, range.start, range.final, 1, 1, times, callback);
            }
        }

        this.array.splice(0);

        await delay();
        await this.complete(source, times, callback);
    }

    protected override async sortByDescent(source: SortDataModel[], lhs: number, rhs: number, option: string | number | undefined, callback: (param: SortStateModel) => void): Promise<void> {
        let blockSize: number = this.calcBlockSize(rhs - lhs + 1), range: SortIndexRange, start: number = lhs, final: number = rhs, k: number, index: number, completed: boolean, times: number = 0;

        for (let i = rhs; i >= lhs; i--) {
            if ((rhs - lhs - i) % blockSize === 0) {
                final = i;
                start = i;
            }

            if ((rhs - lhs - i) % blockSize === blockSize - 1 || i === lhs) {
                start = i;
                this.array.push({ start, final });
            }

            times = await this.render(source, i, i, ACCENT_COLOR, ACCENT_COLOR, times, callback);
            times += 1;
        }
        
        times = await this.sortEachBlock(source, 'descent', times, callback);

        for (let i = rhs; i >= lhs; i--) {
            [times, index] = await this.indexOf(source, this.array, ceil((rhs - lhs - i) / blockSize, 0), this.array.length - 1, 'descent', times, callback);
            
            k = this.array[index] && source[this.array[index].final].value < source[i].value ? this.array[index].final : i;

            [completed, times] = await this._service.swapAndRender(source, false, k !== i, i, k, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, times, callback);

            if (k !== i) {
                range = this.array[index];
                times = await this._service.stableGapSortByDescent(source, range.start, range.final, 1, 1, times, callback);
            }
        }

        this.array.splice(0);

        await delay();
        await this.complete(source, times, callback);
    }

    private async sortEachBlock(source: SortDataModel[], order: SortOrder, times: number, callback: (param: SortStateModel) => void): Promise<number> {
        let range: SortIndexRange;

        for (let i = 0, length = this.array.length; i <= length - 1; i++) {
            range = this.array[i];

            if (order === 'ascent') {
                times = await this._service.stableGapSortByAscent(source, range.start, range.final, 1, 1, times, callback);
            }

            if (order === 'descent') {
                times = await this._service.stableGapSortByDescent(source, range.start, range.final, 1, 1, times, callback);
            }
        }

        return times;
    }

    private async indexOf(source: SortDataModel[], ranges: SortIndexRange[], lhs: number, rhs: number, order: SortOrder, times: number, callback: (param: SortStateModel) => void): Promise<[number, number]> {
        if (ranges.length <= this.THRESHOLD) {
            let index: number = lhs;

            
            for (let i = lhs; i <= rhs; i++) {
                if (order === 'ascent') {
                    source[ranges[index].start].color = PRIMARY_COLOR;
                    source[ranges[i].start].color = SECONDARY_COLOR;
                    callback({ times, datalist: source });
    
                    await delay();
    
                    if (source[ranges[i].start].value < source[ranges[index].start].value) {
                        source[ranges[index].start].color = CLEAR_COLOR;
                        index = i;
                    }
    
                    source[ranges[index].start].color = PRIMARY_COLOR;
                    source[ranges[i].start].color = CLEAR_COLOR;
                    callback({ times, datalist: source });
                }
                
                if (order === 'descent') {
                    source[ranges[index].final].color = PRIMARY_COLOR;
                    source[ranges[i].final].color = SECONDARY_COLOR;
                    callback({ times, datalist: source });
    
                    await delay();
    
                    if (source[ranges[i].final].value < source[ranges[index].final].value) {
                        source[ranges[index].final].color = CLEAR_COLOR;
                        index = i;
                    }
    
                    source[ranges[index].final].color = PRIMARY_COLOR;
                    source[ranges[i].final].color = CLEAR_COLOR;
                    callback({ times, datalist: source });
                }
            }
            
            return [times, index];
        } else {
            if (lhs === rhs) {
                return [times, lhs];
            } else if (lhs > rhs) {
                return [times, rhs];
            } else {
                let mid: number = floor((rhs - lhs) * 0.5 + lhs, 0), fst: number, snd: number;
    
                if (order === 'ascent') {
                    times = await this.render(source, ranges[lhs].start, ranges[rhs].start, ACCENT_ONE_COLOR, ACCENT_TWO_COLOR, times, callback);
                }
                
                if (order === 'descent') {
                    times = await this.render(source, ranges[lhs].final, ranges[rhs].final, ACCENT_ONE_COLOR, ACCENT_TWO_COLOR, times, callback);
                }
    
                [times, fst] = await this.indexOf(source, ranges, lhs, mid, order, times, callback);
                [times, snd] = await this.indexOf(source, ranges, mid + 1, rhs, order, times, callback);
    
                if (order === 'ascent') {
                    return [times, source[ranges[fst].start].value < source[ranges[snd].start].value ? fst : snd];
                }
                
                if (order === 'descent') {
                    return [times, source[ranges[fst].final].value < source[ranges[snd].final].value ? fst : snd];
                }
    
                return [times, -1];
            }
        }
    }

    private calcBlockSize(length: number): number {
        let remainder: number = 0;

        while (true) {
            remainder = length % 2 === 0 ? remainder + 2 : remainder - 1;
            length >>= 1;

            if (length <= this.THRESHOLD) break;

            length += remainder;
        }

        return Math.min(length + remainder, this.THRESHOLD);
    }

}

