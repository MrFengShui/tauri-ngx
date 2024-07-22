import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, CanDeactivateFn, RouterStateSnapshot } from "@angular/router";
import { Observable, of } from "rxjs";

import { MazeCellModel } from "./maze.state";
import { EMPTY_COLOR } from "../../../public/values.utils";
import { MazeActionType, MazeActionmName, MazeGridXY } from "./maze.state";

import { MazeGenerationRandomizedBacktrackerService, MazeGenerationParallelRandomizedBacktrackerService } from "../service/backtracker-maze.service";
import { MazeGenerationRandomizedPrimService } from "../service/prim-maze.service";
import { MazeGenerationRandomizedKruskalService } from "../service/kruskal-maze.service";
import { MazeGenerationAldousBroderService } from "../service/aldous-broder-maze.service";
import { MazeGenerationHuntAndKillService } from "../service/hunt-kill-maze.service";
import { MazeGenerationRandomizedDivisionBuildService, MazeGenerationRandomizedDivisionMergeService } from "../service/division-maze.service";
import { MazeGenerationSidewinderService } from "../service/sidewinder-maze.service";
import { MazeGenerationGrowTreeService } from "../service/grow-tree-maze.service";
import { MazeGenerationEllerService } from "../service/eller-maze.service";
import { MazeGenerationWilsonService } from "../service/wilson-maze.service";

@Injectable()
export class MazeUtilsService {

    public createDataGrid(rows: number, cols: number): Observable<MazeCellModel[][]> {
        return new Observable(subscriber => {
            const grid: MazeCellModel[][] = Array.from([]);
            let index: number = 0;

            for (let row = 0; row < rows; row++) {
                let array: MazeCellModel[] = Array.from([]);

                for (let col = 0; col < cols; col++) {
                    array.push({
                        color: EMPTY_COLOR, direction: null, weight: index, visited: false,
                        walls: { top: true, bottom: true, left: true, right: true }
                    });
                    index += 1;
                }

                grid.push(array);
            }
            
            subscriber.next(grid);
            subscriber.complete();
        });
    }

    public resetDataGrid(source: MazeCellModel[][], rows: number, cols: number): Observable<MazeCellModel[][]> {
        return new Observable(subscriber => {
            let index: number = 0;
            
            for (let row = 0; row < rows; row++) {
                for (let col = 0; col < cols; col++) {
                    source[row][col] = {
                        ...source[row][col], 
                        color: EMPTY_COLOR, weight: index, visited: false, 
                        walls: { top: true, bottom: true, left: true, right: true }
                    };
                    index += 1;
                }
            }

            subscriber.next(source);
            subscriber.complete();
        });
    }

}

@Injectable()
export class MazeToolsService {

    public async findFitNeighbors(source: MazeCellModel[][], rows: number, cols: number, currPoint: MazeGridXY, neighbors: MazeGridXY[]): Promise<MazeGridXY[]> {
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

    public async findAnyNeighbors(source: MazeCellModel[][], rows: number, cols: number, currPoint: MazeGridXY, neighbors: MazeGridXY[]): Promise<MazeGridXY[]> {
        if (neighbors.length > 0) {
            neighbors.splice(0);
        }

        if (currPoint) {
            /* 添加上边 */
            if (currPoint.col > 0) {
                neighbors.push({ row: currPoint.row, col: currPoint.col - 1 });
            }
            /* 添加右边 */
            if (currPoint.row < rows - 1) {
                neighbors.push({ row: currPoint.row + 1, col: currPoint.col });
            }
            /* 添加下边 */
            if (currPoint.col < cols - 1) {
                neighbors.push({ row: currPoint.row, col: currPoint.col + 1 });
            }
            /* 添加左边 */
            if (currPoint.row > 0) {
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

    public async buildWall(source: MazeCellModel[][], currPoint: MazeGridXY, nextPoint: MazeGridXY): Promise<MazeCellModel[][]> {
        if (currPoint && nextPoint) {
            /* 建上边 */
            if (currPoint.row - 1 === nextPoint.row && currPoint.col === nextPoint.col) {
                source[currPoint.row][currPoint.col].walls.top = true;
                source[nextPoint.row][nextPoint.col].walls.bottom = true;
            }
            /* 建右边 */
            if (currPoint.row === nextPoint.row && currPoint.col + 1 === nextPoint.col) {
                source[currPoint.row][currPoint.col].walls.right = true;
                source[nextPoint.row][nextPoint.col].walls.left = true;
            }
            /* 建下边 */
            if (currPoint.row + 1 === nextPoint.row && currPoint.col === nextPoint.col) {
                source[currPoint.row][currPoint.col].walls.bottom = true;
                source[nextPoint.row][nextPoint.col].walls.top = true;
            }
            /* 建左边 */
            if (currPoint.row === nextPoint.row && currPoint.col - 1 === nextPoint.col) {
                source[currPoint.row][currPoint.col].walls.left = true;
                source[nextPoint.row][nextPoint.col].walls.right = true;
            }
        }

        return source;
    }

    public async direct(source: MazeCellModel[][], currPoint: MazeGridXY, nextPoint: MazeGridXY): Promise<MazeCellModel[][]> {
        if (currPoint && nextPoint) {
            /* 在上边 */
            if (currPoint.row - 1 === nextPoint.row && currPoint.col === nextPoint.col) {
                source[currPoint.row][currPoint.col].direction = 'u';
            }
            /* 在右边 */
            if (currPoint.row === nextPoint.row && currPoint.col + 1 === nextPoint.col) {
                source[currPoint.row][currPoint.col].direction = 'r';
            }
            /* 在下边 */
            if (currPoint.row + 1 === nextPoint.row && currPoint.col === nextPoint.col) {
                source[currPoint.row][currPoint.col].direction = 'd';
            }
            /* 在左边 */
            if (currPoint.row === nextPoint.row && currPoint.col - 1 === nextPoint.col) {
                source[currPoint.row][currPoint.col].direction = 'l';
            }
        }

        return source;
    }

    public existed(array: MazeGridXY[], target: MazeGridXY): boolean {
        return this.indexOf(array, target) > -1;
    }

    public indexOf(array: MazeGridXY[], target: MazeGridXY): number {
        if (array.length === 0) {
            return -1;
        }

        if (target) {
            for (let index = 0, length = array.length; index < length; index++) {
                if (target.row === array[index].row && target.col === array[index].col) {
                    return index;
                }
            }
        }

        return -1;
    }

}

@Injectable()
export class MazeMatchService {

    constructor(
        private _ab: MazeGenerationAldousBroderService,
        private _buildDivide: MazeGenerationRandomizedDivisionBuildService,
        private _mergeDivide: MazeGenerationRandomizedDivisionMergeService,
        private _rbt: MazeGenerationRandomizedBacktrackerService,
        private _paraRBT: MazeGenerationParallelRandomizedBacktrackerService,
        private _eller: MazeGenerationEllerService,
        private _gt: MazeGenerationGrowTreeService,
        private _hak: MazeGenerationHuntAndKillService,
        private _kruskal: MazeGenerationRandomizedKruskalService,
        private _prim: MazeGenerationRandomizedPrimService,
        private _sidewinder: MazeGenerationSidewinderService,
        private _wilson: MazeGenerationWilsonService
    ) { }

    public match(type: MazeActionType, name: MazeActionmName, source: MazeCellModel[][], rows: number, cols: number): Observable<MazeCellModel[][] | null> {
        if (type === 'generation') {
            if (name === 'aldous-broder' || name === 'parallel-aldous-broder') {
                return this._ab.maze(source, rows, cols, name.includes('parallel') ? 'all' : 'one');
            }

            if (name === 'randomized-backtracker') {
                return this._rbt.maze(source, rows, cols);
            }

            if (name === 'parallel-randomized-backtracker') {
                return this._paraRBT.maze(source, rows, cols);
            }

            if (name === 'randomized-division-build') {
                return this._buildDivide.maze(source, rows, cols);
            }

            if (name === 'randomized-division-merge') {
                return this._mergeDivide.maze(source, rows, cols);
            }

            if (name === 'eller') {
                return this._eller.maze(source, rows, cols);
            }

            if (name === 'depth-first-growing-tree' || name === 'breadth-first-growing-tree' || name === 'parallel-depth-first-growing-tree' || name === 'parallel-breadth-first-growing-tree') {
                return this._gt.maze(source, rows, cols, name, name.includes('parallel') ? 'all' : 'one');
            }

            if (name === 'hunt-and-kill' || name === 'parallel-hunt-and-kill') {
                return this._hak.maze(source, rows, cols, name.includes('parallel') ? 'all' : 'one');
            }

            if (name === 'randomized-kruskal') {
                return this._kruskal.maze(source, rows, cols);
            }

            if (name === 'randomized-prim' || name === 'parallel-randomized-prim') {
                return this._prim.maze(source, rows, cols, name.includes('parallel') ? 'all' : 'one');
            }
            
            if (name === 'sidewinder') {
                return this._sidewinder.maze(source, rows, cols);
            }
            
            if (name === 'wilson') {
                return this._wilson.maze(source, rows, cols);
            }
        }

        if (type === 'path-finder') {

        }

        return of(null);
    }

}
