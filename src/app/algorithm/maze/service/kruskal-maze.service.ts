import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { random } from "lodash";

import { MazeToolsService } from "../ngrx-store/maze.service";
import { MazeCellModel } from "../ngrx-store/maze.state";
import { delay, MAZE_DELAY_DURATION } from "../maze.utils";
import { MazeGridXY } from "../ngrx-store/maze.state";
import { EMPTY_COLOR, PRIMARY_COLOR, SECONDARY_COLOR } from "../../../public/values.utils";

/**
 * 随机克鲁斯卡尔算法
 */
@Injectable()
export class MazeGenerationRandomizedKruskalService {

    constructor(private _service: MazeToolsService) {}

    public maze(source: MazeCellModel[][], rows: number, cols: number): Observable<MazeCellModel[][]> {
        return new Observable(subscriber => {
            this.run(source, rows, cols, param => subscriber.next(param)).then(() => subscriber.complete());
        });
    }

    private async run(source: MazeCellModel[][], rows: number, cols: number, callback: (param: MazeCellModel[][]) => void): Promise<void> {
        const length: number = rows * cols;
        let currPoint: MazeGridXY = { row: -1, col: -1 }, nextPoint: MazeGridXY = { row: -1, col: -1 }, neighbors: MazeGridXY[] = Array.from([]), currWeight: number, nextWeight: number, count: number = 1;

        while (count < length) {
            currPoint.row = random(0, rows - 1);
            currPoint.col = random(0, cols - 1);
            currWeight = source[currPoint.row][currPoint.col].weight;

            neighbors = await this._service.findFitNeighbors(source, rows, cols, currPoint, neighbors);

            if (neighbors.length > 0) {
                nextPoint = neighbors[neighbors.length === 1 ? 0 : random(0, neighbors.length - 1)];
                nextWeight = source[nextPoint.row][nextPoint.col].weight;

                if (nextWeight !== currWeight) {
                    count += 1;

                    for (let row = 0; row < rows; row++) {
                        for (let col = 0; col < cols; col++) {
                            if (source[row][col].weight === nextWeight) {
                                source[row][col].weight = currWeight;
                            }
                        }
                    }

                    source = await this._service.mergeWall(source, currPoint, nextPoint);
                }
            }
            
            source[currPoint.row][currPoint.col].color = PRIMARY_COLOR;
            source[nextPoint.row][nextPoint.col].color = SECONDARY_COLOR;
            callback(source);

            await delay(MAZE_DELAY_DURATION);

            source[currPoint.row][currPoint.col].color = EMPTY_COLOR;
            source[nextPoint.row][nextPoint.col].color = EMPTY_COLOR;
            callback(source);
        }
    }

}
