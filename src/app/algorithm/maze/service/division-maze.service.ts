import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { random } from "lodash";

import { MazeToolsService } from "../ngrx-store/maze.service";
import { MazeCellModel, MazeGridPoint } from "../ngrx-store/maze.state";
import { delay, MAZE_DELAY_DURATION } from "../maze.utils";
import { MazeGridCell } from "../ngrx-store/maze.state";
import { EMPTY_COLOR, PRIMARY_COLOR, SECONDARY_COLOR } from "../../../public/values.utils";

/**
 * 随机隔离算法
 */
@Injectable()
export class MazeGenerationRandomizedDivisionService {

    constructor(private _service: MazeToolsService) {}

    public maze(source: MazeCellModel[][], rows: number, cols: number, type: 'build' | 'merge'): Observable<MazeCellModel[][]> {
        return new Observable(subscriber => {
            if (type === 'build') {
                this.runByBuild(source, rows, cols, param => subscriber.next(param)).then(() => subscriber.complete());
            }

            if (type === 'merge') {
                this.runByMerge(source, 0, rows - 1, 0, cols - 1, param => subscriber.next(param)).then(() => subscriber.complete());
            }
        });
    }

    private async runByMerge(source: MazeCellModel[][], startRow: number, finalRow: number, startCol: number, finalCol: number, callback: (param: MazeCellModel[][]) => void): Promise<MazeCellModel[][]> {
        if (startRow < finalRow || startCol < finalCol) {
            let point: MazeGridPoint, split: MazeGridCell;

            if (finalRow - startRow > finalCol - startCol) {
                split = { row: random(startRow, finalRow - 1, false), col: random(startCol, finalCol, false) };
                point = { currCell: { row: split.row, col: split.col }, nextCell: { row: split.row + 1, col: split.col } };
    
                source = await this._service.mergeWall(source, point.currCell, point.nextCell);
    
                source = await this.runByMerge(source, startRow, split.row, startCol, finalCol, callback);
                source = await this.runByMerge(source, split.row + 1, finalRow, startCol, finalCol, callback);
            } else {
                split = { row: random(startRow, finalRow, false), col: random(startCol, finalCol - 1, false) };
                point = { currCell: { row: split.row, col: split.col }, nextCell: { row: split.row, col: split.col + 1 } };
    
                source = await this._service.mergeWall(source, point.currCell, point.nextCell);
    
                source = await this.runByMerge(source, startRow, finalRow, startCol, split.col, callback);
                source = await this.runByMerge(source, startRow, finalRow, split.col + 1, finalCol, callback);
            }

            callback(source);
            await delay(MAZE_DELAY_DURATION);
        }

        return source;
    }
    private async runByBuild(source: MazeCellModel[][], rows: number, cols: number, callback: (param: MazeCellModel[][]) => void): Promise<void> {
        source = await this.initGrid(source, rows, cols);
        callback(source);

        await delay(MAZE_DELAY_DURATION);

        await this.task(source, 0, rows - 1, 0, cols - 1, callback);
    }

    private async task(source: MazeCellModel[][], startRow: number, finalRow: number, startCol: number, finalCol: number, callback: (param: MazeCellModel[][]) => void): Promise<void> {
        if (startRow < finalRow || startCol < finalCol) {
            let point: MazeGridPoint, split: MazeGridCell;

            if (finalRow - startRow > finalCol - startCol) {
                split = { row: random(startRow, finalRow - 1, false), col: random(startCol, finalCol, false) };
    
                for (let col = startCol; col <= finalCol; col++) {
                    if (col !== split.col) {
                        point = { currCell: { row: split.row, col }, nextCell: { row: split.row + 1, col } };
    
                        source = await this._service.buildWall(source, point.currCell, point.nextCell);
                    }
                }

                callback(source);
                await delay(MAZE_DELAY_DURATION);
                
                await this.task(source, startRow, split.row, startCol, finalCol, callback);
                await this.task(source, split.row + 1, finalRow, startCol, finalCol, callback);
            } else {
                split = { row: random(startRow, finalRow, false), col: random(startCol, finalCol - 1, false) };
    
                for (let row = startRow; row <= finalRow; row++) {
                    if (row !== split.row) {
                        point = { currCell: { row, col: split.col }, nextCell: { row, col: split.col + 1 } };
    
                        source = await this._service.buildWall(source, point.currCell, point.nextCell);
                    }
                }

                callback(source);
                await delay(MAZE_DELAY_DURATION);

                await this.task(source, startRow, finalRow, startCol, split.col, callback);
                await this.task(source, startRow, finalRow, split.col + 1, finalCol, callback);
            }
        }
    }

    private async initGrid(source: MazeCellModel[][], rows: number, cols: number): Promise<MazeCellModel[][]> {
        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                if (row < rows - 1) {
                    source[row][col].walls.bottom = false;
                }

                if (row > 0) {
                    source[row][col].walls.top = false;
                }

                if (col < cols - 1) {
                    source[row][col].walls.right = false;
                }

                if (col > 0) {
                    source[row][col].walls.left = false;
                }
            }
        }

        return source;
    }

}

