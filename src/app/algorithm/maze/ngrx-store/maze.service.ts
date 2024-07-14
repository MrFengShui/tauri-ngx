import { Injectable } from "@angular/core";
import { Observable, of } from "rxjs";
import { random } from "lodash";

import { MazeCellModel } from "./maze.state";
import { CLEAR_COLOR, EMPTY_COLOR } from "../../../public/values.utils";
import { MazeGenerationName, NeighborAccordionate } from "../maze.utils";

import { MazeGenerationRandomBacktrackerService } from "../service/backtracker-maze.service";

@Injectable()
export class MazeUtilsService {

    public createDataGrid(rows: number, cols: number): Observable<MazeCellModel[][]> {
        return new Observable(subscriber => {
            const grid: MazeCellModel[][] = Array.from([]);

            for (let row = 0; row < rows; row++) {
                let array: MazeCellModel[] = Array.from([]);

                for (let col = 0; col < cols; col++) {
                    array.push({
                        bdcolor: CLEAR_COLOR, bgcolor: EMPTY_COLOR, visited: false, 
                        walls: { top: true, bottom: true, left: true, right: true }
                    });
                }

                grid.push(array);
            }

            subscriber.next(grid);
            subscriber.complete();
        });
    }

    public resetDataGrid(source: MazeCellModel[][], rows: number, cols: number): Observable<MazeCellModel[][]> {
        return new Observable(subscriber => {
            for (let row = 0; row < rows; row++) {
                for (let col = 0; col < cols; col++) {
                    source[row][col] = { 
                        ...source[row][col], 
                        visited: false, walls: { top: true, bottom: true, left: true, right: true }
                    };
                }
            }

            subscriber.next(source);
            subscriber.complete();
        });
    }

}

@Injectable()
export class MazeToolsService {

    public async findNeighbors(source: MazeCellModel[][], rows: number, cols: number, currRowCol: NeighborAccordionate, neighbors: NeighborAccordionate[]): Promise<NeighborAccordionate[]> {
        if (neighbors.length > 0) {
            neighbors.splice(0);
        }
        /* 添加上边 */
        if (currRowCol.col > 0 && !source[currRowCol.row][currRowCol.col - 1].visited) {
            neighbors.push({ row: currRowCol.row, col: currRowCol.col - 1 });
        }
        /* 添加右边 */
        if (currRowCol.row < rows - 1 && !source[currRowCol.row + 1][currRowCol.col].visited) {
            neighbors.push({ row: currRowCol.row + 1, col: currRowCol.col });
        }
        /* 添加下边 */
        if (currRowCol.col < cols - 1 && !source[currRowCol.row][currRowCol.col + 1].visited) {
            neighbors.push({ row: currRowCol.row, col: currRowCol.col + 1 });
        }
        /* 添加左边 */
        if (currRowCol.row > 0 && !source[currRowCol.row - 1][currRowCol.col].visited) {
            neighbors.push({ row: currRowCol.row - 1, col: currRowCol.col });
        }

        return neighbors;
    }

    public async mergeWall(source: MazeCellModel[][], currRowCol: NeighborAccordionate, nextRowCol: NeighborAccordionate): Promise<MazeCellModel[][]> {
        /* 拆上边 */
        if (currRowCol.row === nextRowCol.row && currRowCol.col - 1 === nextRowCol.col) {
            source[currRowCol.row][currRowCol.col].walls.top = false;
            source[nextRowCol.row][nextRowCol.col].walls.bottom = false;
        }
        /* 拆右边 */
        if (currRowCol.row + 1 === nextRowCol.row && currRowCol.col === nextRowCol.col) {
            source[currRowCol.row][currRowCol.col].walls.right = false;
            source[nextRowCol.row][nextRowCol.col].walls.left = false;
        }
        /* 拆下边 */
        if (currRowCol.row === nextRowCol.row && currRowCol.col + 1 === nextRowCol.col) {
            source[currRowCol.row][currRowCol.col].walls.bottom = false;
            source[nextRowCol.row][nextRowCol.col].walls.top = false;
        }
        /* 拆左边 */
        if (currRowCol.row - 1 === nextRowCol.row && currRowCol.col === nextRowCol.col) {
            source[currRowCol.row][currRowCol.col].walls.left = false;
            source[nextRowCol.row][nextRowCol.col].walls.right = false;
        }

        return source;
    }

}

@Injectable()
export class MazeMatchService {

    constructor(
        private _randomBack: MazeGenerationRandomBacktrackerService
    ) {}

    public match(name: MazeGenerationName, source: MazeCellModel[][], rows: number, cols: number): Observable<MazeCellModel[][] | null> {
        console.info('name:', name, 'rows:', rows, 'cols:', cols);
        if (name === 'random-backtracker') {
            return this._randomBack.maze(source, rows, cols);
        }

        return of(null);
    }

}