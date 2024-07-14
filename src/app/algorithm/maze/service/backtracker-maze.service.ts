import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { random } from "lodash";

import { MazeCellModel } from "../ngrx-store/maze.state";
import { delay, MAZE_DELAY_DURATION, NeighborAccordionate } from "../maze.utils";
import { MazeToolsService } from "../ngrx-store/maze.service";
import { ACCENT_COLOR, CLEAR_COLOR, EMPTY_COLOR, PRIMARY_COLOR, SECONDARY_COLOR } from "../../../public/values.utils";

@Injectable()
export class MazeGenerationRandomBacktrackerService {

    constructor(private _service: MazeToolsService) {}

    public maze(source: MazeCellModel[][], rows: number, cols: number): Observable<MazeCellModel[][]> {
        return new Observable(subscriber => {
            this.run(source, rows, cols, param => subscriber.next(param)).then(() => subscriber.complete());
        });
    }

    private async run(source: MazeCellModel[][], rows: number, cols: number, callback: (param: MazeCellModel[][]) => void): Promise<void> {
        const stack: NeighborAccordionate[] = Array.from([{ row: random(0, rows - 1, false), col: random(0, cols - 1, false) }]);
        let currRowCol: NeighborAccordionate, nextRowCol: NeighborAccordionate, neighbors: NeighborAccordionate[] = Array.from([]);

        while (stack.length > 0) {
            currRowCol = stack.pop() as NeighborAccordionate;
            source[currRowCol.row][currRowCol.col].visited = true;
            
            neighbors = await this._service.findNeighbors(source, rows, cols, currRowCol, neighbors);
            
            if (neighbors.length > 0) {
                stack.push(currRowCol);

                nextRowCol = neighbors[neighbors.length === 1 ? 0 : random(0, neighbors.length - 1)];
                stack.push(nextRowCol);

                source[nextRowCol.row][nextRowCol.col].visited = true;
                source = await this._service.mergeWall(source, currRowCol, nextRowCol);
            }
            
            source[currRowCol.row][currRowCol.col].bdcolor = PRIMARY_COLOR;
            source[currRowCol.row][currRowCol.col].bgcolor = SECONDARY_COLOR;
            callback(source);

            await delay(MAZE_DELAY_DURATION);

            source[currRowCol.row][currRowCol.col].bdcolor = CLEAR_COLOR;
            source[currRowCol.row][currRowCol.col].bgcolor = EMPTY_COLOR;
            callback(source);
        }
    }

}