import { max, min } from "lodash";

import { ACCENT_COLOR, delay, PRIMARY_COLOR, SECONDARY_COLOR } from "../../../public/global.utils";

import { SortDataModel, SortOption, SortStateModel } from "../ngrx-store/sort.state";

import { AbstractComparisonSortAlgorithm } from "../pattern/sort-temp.pattern";

export class SpaghettiSortAlgorithm extends AbstractComparisonSortAlgorithm {

    protected override async sortByAscent(source: SortDataModel[], lhs: number, rhs: number, option: SortOption, callback: (param: SortStateModel) => void): Promise<void> {
        const minValue: number = min(source.map(item => item.value)) as number;
        const maxValue: number = max(source.map(item => item.value)) as number;
        let idx: number, times: number = 0;

        for (let hand = maxValue; hand >= minValue; hand--) {
            for (let i = lhs; i <= rhs; i++) {
                times = await this.sweep(source, i, ACCENT_COLOR, times, callback);
                
                if (source[i].value === hand) this.stack.push(i);
            }

            while (this.stack.length > 0) {
                idx = this.stack.pop() as number;
                times = await this.exchange(source, idx < rhs, idx, rhs, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, times, callback);

                rhs -= 1;
            }
        }

        await delay();
        await this.complete(source, times, callback);
    }

    protected override async sortByDescent(source: SortDataModel[], lhs: number, rhs: number, option: SortOption, callback: (param: SortStateModel) => void): Promise<void> {
        const minValue: number = min(source.map(item => item.value)) as number;
        const maxValue: number = max(source.map(item => item.value)) as number;
        let idx: number, times: number = 0;

        for (let hand = maxValue; hand >= minValue; hand--) {
            for (let i = rhs; i >= lhs; i--) {
                times = await this.sweep(source, i, ACCENT_COLOR, times, callback);
                
                if (source[i].value === hand) this.stack.push(i);
            }

            while (this.stack.length > 0) {
                idx = this.stack.pop() as number;
                times = await this.exchange(source, idx > lhs, idx, lhs, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, times, callback);

                lhs += 1;
            }
        }
        
        await delay();
        await this.complete(source, times, callback);
    }
    
}