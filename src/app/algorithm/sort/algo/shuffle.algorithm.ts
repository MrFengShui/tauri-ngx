import { random } from "lodash";

import { CLEAR_COLOR, delay, PLACE_FST_COLOR, PLACE_FTH_COLOR, PLACE_SND_COLOR, PLACE_TRD_COLOR } from "../../../public/global.utils";

import { SortToolsService } from "../ngrx-store/sort.service";
import { SortDataModel, SortStateModel } from "../ngrx-store/sort.state";

export class SortDataShuffleMachine {
    
    constructor(private _service: SortToolsService) {}

    public async shuffle(source: SortDataModel[], callback: (param: SortStateModel) => void): Promise<void> {
        const threshold: number = source.length - 1;
        let lhs: number = 0, rhs: number = threshold, fst: number = -1, snd: number = -1;

        for (let i = lhs; i <= rhs; i++) source[i].color = CLEAR_COLOR;
        
        while (true) {
            if (lhs < rhs) {
                fst = random(lhs + 1, rhs, false);
                snd = random(lhs, rhs - 1, false);
            }

            if (lhs > rhs) {
                fst = random(rhs, lhs - 1, false);
                snd = random(rhs + 1, lhs, false);
            }            

            source[lhs].color = PLACE_FST_COLOR;
            source[fst].color = PLACE_TRD_COLOR;
            source[rhs].color = PLACE_SND_COLOR;
            source[snd].color = PLACE_FTH_COLOR;
            callback({ times: 0, datalist: source });

            await delay();
            await this._service.swap(source, lhs, fst);
            await this._service.swap(source, rhs, snd);

            source[lhs].color = PLACE_TRD_COLOR;
            source[fst].color = PLACE_FST_COLOR;
            source[rhs].color = PLACE_FTH_COLOR;
            source[snd].color = PLACE_SND_COLOR;
            callback({ times: 0, datalist: source });

            await delay();

            source[lhs].color = CLEAR_COLOR;
            source[fst].color = CLEAR_COLOR;
            source[rhs].color = CLEAR_COLOR;
            source[snd].color = CLEAR_COLOR;
            callback({ times: 0, datalist: source });

            if (lhs === threshold && rhs === 0) break;

            lhs += 1;
            rhs -= 1;
        }
    }

}