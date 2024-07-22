import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { random } from "lodash";

import { MazeToolsService } from "../ngrx-store/maze.service";
import { MazeCellModel } from "../ngrx-store/maze.state";
import { delay, MAZE_DELAY_DURATION } from "../maze.utils";
import { MazeGridXY } from "../ngrx-store/maze.state";
import { EMPTY_COLOR, PRIMARY_COLOR, SECONDARY_COLOR } from "../../../public/values.utils";

/**
 * 随机隔离算法（拆墙）
 */
@Injectable()
export class MazeGenerationRandomizedDivisionMergeService {

    constructor(private _service: MazeToolsService) {}

    public maze(source: MazeCellModel[][], rows: number, cols: number): Observable<MazeCellModel[][]> {
        return new Observable(subscriber => {
            this.run(source, 0, rows - 1, 0, cols - 1, param => subscriber.next(param)).then(() => subscriber.complete());
        });
    }

    private async run(source: MazeCellModel[][], startRow: number, finalRow: number, startCol: number, finalCol: number, callback: (param: MazeCellModel[][]) => void): Promise<MazeCellModel[][]> {
        if (startRow < finalRow || startCol < finalCol) {
            let currPoint: MazeGridXY, nextPoint: MazeGridXY, splitRow: number = -1, splitCol: number = -1;

            if (finalRow - startRow > finalCol - startCol) {
                splitRow = random(startRow, finalRow - 1, false);
                splitCol = random(startCol, finalCol, false);
    
                currPoint = { row: splitRow, col: splitCol };
                nextPoint = { row: splitRow + 1, col: splitCol };
    
                source = await this._service.mergeWall(source, currPoint, nextPoint);
    
                source = await this.run(source, startRow, splitRow, startCol, finalCol, callback);
                source = await this.run(source, splitRow + 1, finalRow, startCol, finalCol, callback);
            } else {
                splitCol = random(startCol, finalCol - 1, false);
                splitRow = random(startRow, finalRow, false);
    
                currPoint = { row: splitRow, col: splitCol };
                nextPoint = { row: splitRow, col: splitCol + 1 };
    
                source = await this._service.mergeWall(source, currPoint, nextPoint);
    
                source = await this.run(source, startRow, finalRow, startCol, splitCol, callback);
                source = await this.run(source, startRow, finalRow, splitCol + 1, finalCol, callback);
            }

            source[currPoint.row][currPoint.col].color = PRIMARY_COLOR;
            source[nextPoint.row][nextPoint.col].color = SECONDARY_COLOR;
            callback(source);

            await delay(MAZE_DELAY_DURATION);
            
            source[currPoint.row][currPoint.col].color = EMPTY_COLOR;
            source[nextPoint.row][nextPoint.col].color = EMPTY_COLOR;
            callback(source);
        }

        return source;
    }

}

/**
 * 随机隔离算法（建墙）
 */
@Injectable()
export class MazeGenerationRandomizedDivisionBuildService {

    constructor(private _service: MazeToolsService) {}

    public maze(source: MazeCellModel[][], rows: number, cols: number): Observable<MazeCellModel[][]> {
        return new Observable(subscriber => {
            this.run(source, rows, cols, param => subscriber.next(param)).then(() => subscriber.complete());
        });
    }

    private async run(source: MazeCellModel[][], rows: number, cols: number, callback: (param: MazeCellModel[][]) => void): Promise<void> {
        source = await this.initGrid(source, rows, cols);
        callback(source);

        await delay(MAZE_DELAY_DURATION);

        await this.task(source, 0, rows - 1, 0, cols - 1, callback);
    }

    private async task(source: MazeCellModel[][], startRow: number, finalRow: number, startCol: number, finalCol: number, callback: (param: MazeCellModel[][]) => void): Promise<void> {
        if (startRow < finalRow || startCol < finalCol) {
            let currPoint: MazeGridXY, nextPoint: MazeGridXY, splitRow: number = -1, splitCol: number = -1;

            if (finalRow - startRow > finalCol - startCol) {
                splitRow = random(startRow, finalRow - 1, false);
                splitCol = random(startCol, finalCol, false);
    
                for (let col = startCol; col <= finalCol; col++) {
                    if (col !== splitCol) {
                        currPoint = { row: splitRow, col };
                        nextPoint = { row: splitRow + 1, col };
    
                        source = await this._service.buildWall(source, currPoint, nextPoint);
                    }

                    callback(source);
                    await delay(MAZE_DELAY_DURATION);
                }
                
                await this.task(source, startRow, splitRow, startCol, finalCol, callback);
                await this.task(source, splitRow + 1, finalRow, startCol, finalCol, callback);
            } else {
                splitCol = random(startCol, finalCol - 1, false);
                splitRow = random(startRow, finalRow, false);
    
                for (let row = startRow; row <= finalRow; row++) {
                    if (row !== splitRow) {
                        currPoint = { row, col: splitCol };
                        nextPoint = { row, col: splitCol + 1 };
    
                        source = await this._service.buildWall(source, currPoint, nextPoint);
                    }

                    callback(source);
                    await delay(MAZE_DELAY_DURATION);
                }

                await this.task(source, startRow, finalRow, startCol, splitCol, callback);
                await this.task(source, startRow, finalRow, splitCol + 1, finalCol, callback);
            }
        }
    }

    // private async taskByIterative(source: MazeCellModel[][], rows: number, cols: number, callback: (param: MazeCellModel[][]) => void): Promise<void> {
    //     const rowStack: number[] = Array.from([]), colStack: number[] = Array.from([]);
    //     let startRow: number = 0, finalRow: number = rows - 1, startCol: number = 0, finalCol: number = cols - 1;
    //     let currPoint: MazeGridXY, nextPoint: MazeGridXY, splitRow: number, splitCol: number;

    //     rowStack.push(finalRow);
    //     rowStack.push(startRow);
    //     colStack.push(finalCol);
    //     colStack.push(startCol);

    //     while (rowStack.length > 0 && colStack.length > 0) {
    //         startRow = rowStack.pop() as number;
    //         finalRow = rowStack.pop() as number;
    //         startCol = colStack.pop() as number;
    //         finalCol = colStack.pop() as number;

    //         if (finalRow - startRow > finalCol - startCol) {
    //             splitRow = random(startRow, finalRow - 1, false);
    //             splitCol = random(startCol, finalCol, false);

    //             for (let col = startCol; col <= finalCol; col++) {
    //                 if (col !== splitCol) {
    //                     currPoint = { row: splitRow, col };
    //                     nextPoint = { row: splitRow + 1, col };
    
    //                     source = await this._service.buildWall(source, currPoint, nextPoint);
    //                 }

    //                 callback(source);
    //                 await delay(MAZE_DELAY_DURATION);
    //             }

    //             if (splitRow + 1 < finalRow) {
    //                 rowStack.push(finalRow);
    //                 rowStack.push(splitRow + 1);
    //             }

    //             if (startRow < splitRow) {
    //                 rowStack.push(splitRow);
    //                 rowStack.push(startRow);
    //             }

    //             colStack.push(finalCol);
    //             colStack.push(startCol);
    //         } else {
    //             splitCol = random(startCol, finalCol - 1, false);
    //             splitRow = random(startRow, finalRow, false);

    //             for (let row = startRow; row <= finalRow; row++) {
    //                 if (row !== splitRow) {
    //                     currPoint = { row, col: splitCol };
    //                     nextPoint = { row, col: splitCol + 1 };
    
    //                     source = await this._service.buildWall(source, currPoint, nextPoint);
    //                 }

    //                 callback(source);
    //                 await delay(MAZE_DELAY_DURATION);
    //             }

    //             if (splitCol + 1 < finalCol) {
    //                 colStack.push(finalCol);
    //                 colStack.push(splitCol + 1);
    //             }

    //             if (startCol < splitCol) {
    //                 colStack.push(splitCol);
    //                 colStack.push(startCol);
    //             }

    //             rowStack.push(finalRow);
    //             rowStack.push(startRow);
    //         }
    //     }
    // }

    private async initGrid(source: MazeCellModel[][], rows: number, cols: number): Promise<MazeCellModel[][]> {
        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                if (row === 0) {
                    source[row][col].walls.bottom = false;

                    if (col > 0 && col < cols - 1) {
                        source[row][col].walls.left = false;
                        source[row][col].walls.right = false;
                    }
                }

                if (row === rows - 1) {
                    source[row][col].walls.top = false;

                    if (col > 0 && col < cols - 1) {
                        source[row][col].walls.left = false;
                        source[row][col].walls.right = false;
                    }
                }

                if (col === 0) {
                    source[row][col].walls.right = false;

                    if (row > 0 && row < rows - 1) {
                        source[row][col].walls.top = false;
                        source[row][col].walls.bottom = false;
                    }
                }

                if (col === cols - 1) {
                    source[row][col].walls.left = false;

                    if (row > 0 && row < rows - 1) {
                        source[row][col].walls.top = false;
                        source[row][col].walls.bottom = false;
                    }
                }

                if (row > 0 && row < rows - 1 && col > 0 && col < cols - 1) {
                    source[row][col].walls.top = false;
                    source[row][col].walls.bottom = false;
                    source[row][col].walls.left = false;
                    source[row][col].walls.right = false;
                }
            }
        }

        return source;
    }

}
