import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, CanDeactivateFn, RouterStateSnapshot } from "@angular/router";
import { Observable, of } from "rxjs";

import { MazeCellModel } from "./maze.state";
import { EMPTY_COLOR } from "../../../public/values.utils";
import { MazeActionType, MazeActionmName, MazeGridXY } from "./maze.state";

import { MazeGenerationRandomizedBacktrackerService, MazeGenerationParallelRandomizedBacktrackerService } from "../service/backtracker-maze.service";
import { AlgorithmMazePageComponent } from "../maze.component";
import { MazeGenerationParallelPrimService, MazeGenerationRandomizedPrimService } from "../service/prim-maze.service";

@Injectable()
export class MazeUtilsService {

    public createDataGrid(rows: number, cols: number): Observable<MazeCellModel[][]> {
        return new Observable(subscriber => {
            const grid: MazeCellModel[][] = Array.from([]);

            for (let row = 0; row < rows; row++) {
                let array: MazeCellModel[] = Array.from([]);

                for (let col = 0; col < cols; col++) {
                    array.push({
                        color: EMPTY_COLOR, visited: false,
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

    public async findNeighbors(source: MazeCellModel[][], rows: number, cols: number, currPoint: MazeGridXY, neighbors: MazeGridXY[]): Promise<MazeGridXY[]> {
        if (neighbors.length > 0) {
            neighbors.splice(0);
        }

        if (currPoint) {
            /* 添加上边 */
            if (currPoint.col > 0 && !source[currPoint.row][currPoint.col - 1].visited) {
                neighbors.push({ row: currPoint.row, col: currPoint.col - 1 });
            }
            /* 添加右边 */
            if (currPoint.row < rows - 1 && !source[currPoint.row + 1][currPoint.col].visited) {
                neighbors.push({ row: currPoint.row + 1, col: currPoint.col });
            }
            /* 添加下边 */
            if (currPoint.col < cols - 1 && !source[currPoint.row][currPoint.col + 1].visited) {
                neighbors.push({ row: currPoint.row, col: currPoint.col + 1 });
            }
            /* 添加左边 */
            if (currPoint.row > 0 && !source[currPoint.row - 1][currPoint.col].visited) {
                neighbors.push({ row: currPoint.row - 1, col: currPoint.col });
            }
        }

        return neighbors;
    }

    public async mergeWall(source: MazeCellModel[][], currPoint: MazeGridXY, nextPoint: MazeGridXY): Promise<MazeCellModel[][]> {
        if (currPoint && nextPoint) {
            /* 拆上边 */
            if (currPoint.row - 1 === nextPoint.row && currPoint.col === nextPoint.col) {
                source[currPoint.row][currPoint.col].walls.top = false;
                source[nextPoint.row][nextPoint.col].walls.bottom = false;
            }
            /* 拆右边 */
            if (currPoint.row === nextPoint.row && currPoint.col + 1 === nextPoint.col) {
                source[currPoint.row][currPoint.col].walls.right = false;
                source[nextPoint.row][nextPoint.col].walls.left = false;
            }
            /* 拆下边 */
            if (currPoint.row + 1 === nextPoint.row && currPoint.col === nextPoint.col) {
                source[currPoint.row][currPoint.col].walls.bottom = false;
                source[nextPoint.row][nextPoint.col].walls.top = false;
            }
            /* 拆左边 */
            if (currPoint.row === nextPoint.row && currPoint.col - 1 === nextPoint.col) {
                source[currPoint.row][currPoint.col].walls.left = false;
                source[nextPoint.row][nextPoint.col].walls.right = false;
            }
        }

        return source;
    }

    public existed(array: MazeGridXY[], neighbor: MazeGridXY): boolean {
        if (neighbor) {
            for (let i = 0, length = array.length; i < length; i++) {
                if (neighbor.row === array[i].row && neighbor.col === array[i].col) {
                    return true;
                }
            }
        }

        return false;
    }

}

@Injectable()
export class MazeMatchService {

    constructor(
        private _rbt: MazeGenerationRandomizedBacktrackerService,
        private _paraRBT: MazeGenerationParallelRandomizedBacktrackerService,
        private _prim: MazeGenerationRandomizedPrimService,
        private _paraPrim: MazeGenerationParallelPrimService
    ) { }

    public match(type: MazeActionType, name: MazeActionmName, source: MazeCellModel[][], rows: number, cols: number): Observable<MazeCellModel[][] | null> {
        if (type === 'generation') {
            if (name === 'rbt') {
                return this._rbt.maze(source, rows, cols);
            }

            if (name === 'para-rbt') {
                return this._paraRBT.maze(source, rows, cols);
            }

            if (name === 'prim') {
                return this._prim.maze(source, rows, cols);
            }

            if (name === 'para-prim') {
                return this._paraPrim.maze(source, rows, cols);
            }
        }

        if (type === 'path-finder') {

        }

        return of(null);
    }

}
