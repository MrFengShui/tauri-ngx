import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { random } from "lodash";

import { MazeToolsService } from "../ngrx-store/maze.service";
import { MazeCellModel } from "../ngrx-store/maze.state";
import { delay, MAZE_DELAY_DURATION } from "../maze.utils";
import { MazeGridCell } from "../ngrx-store/maze.state";
import { ACCENT_COLOR, EMPTY_COLOR, PRIMARY_COLOR, SECONDARY_COLOR } from "../../../public/values.utils";

/**
 * 绕线机算法
 */
@Injectable()
export class MazeGenerationSidewinderService {

    private cache: MazeGridCell[] = Array.from([]);

    constructor(private _service: MazeToolsService) {}

    public maze(source: MazeCellModel[][], rows: number, cols: number): Observable<MazeCellModel[][]> {
        return new Observable(subscriber => {
            this.run(source, rows, cols, param => subscriber.next(param)).then(() => subscriber.complete());
        });
    }

    private async run(source: MazeCellModel[][], rows: number, cols: number, callback: (param: MazeCellModel[][]) => void): Promise<void> {
        let currPoint: MazeGridCell = { row: -1, col: -1 }, nextPoint: MazeGridCell = { row: -1, col: -1 }, flag: boolean;

        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                if (row === 0) {
                    flag = true;

                    currPoint = { row, col };
                    nextPoint = { row, col: Math.min(col + 1, cols - 1) };

                    source = await this._service.mergeWall(source, currPoint, nextPoint);
                } else {
                    flag = random(0, 1, true) < 0.5 && col < cols - 1;

                    if (flag) {
                        currPoint = { row, col };
                        nextPoint = { row, col: col + 1 }

                        if (!this._service.existed(this.cache, currPoint)) {
                            this.cache.push(currPoint);
                        }

                        if (!this._service.existed(this.cache, nextPoint)) {
                            this.cache.push(nextPoint);
                        }
                        
                        source = await this._service.mergeWall(source, currPoint, nextPoint);
                    } else {
                        currPoint = this.cache.length === 0 ? { row, col } : this.cache[this.cache.length === 1 ? 0 : random(0, this.cache.length - 1, false)];
                        nextPoint = { row: currPoint.row - 1, col: currPoint.col };

                        source = await this._service.mergeWall(source, currPoint, nextPoint);

                        this.cache.splice(0);
                    }
                }

                source[currPoint.row][currPoint.col].color = flag ? ACCENT_COLOR : PRIMARY_COLOR;
                source[nextPoint.row][nextPoint.col].color = flag ? EMPTY_COLOR : SECONDARY_COLOR;
                callback(source);

                await delay(MAZE_DELAY_DURATION);

                source[currPoint.row][currPoint.col].color = EMPTY_COLOR;
                source[nextPoint.row][nextPoint.col].color = EMPTY_COLOR;
                callback(source);
            }
        }

        this.cache.splice(0);
    }

}
