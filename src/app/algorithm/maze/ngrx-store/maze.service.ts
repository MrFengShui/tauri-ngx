import { Injectable } from "@angular/core";
import { Observable, of } from "rxjs";

import { MazeCellModel, MazeGridPoint } from "./maze.state";
import { ACCENT_COLOR, ACCENT_ONE_COLOR, ACCENT_TWO_COLOR, EMPTY_COLOR, PRIMARY_COLOR, PRIMARY_ONE_COLOR, PRIMARY_TWO_COLOR, SECONDARY_COLOR, SECONDARY_ONE_COLOR, SECONDARY_TWO_COLOR } from "../../../public/values.utils";
import { MazeActionType, MazeActionmName, MazeGridCell } from "./maze.state";

import { MazeGenerationRandomizedBacktrackerService } from "../service/backtracker-maze.service";
import { MazeGenerationRandomizedPrimService } from "../service/prim-maze.service";
import { MazeGenerationRandomizedKruskalService } from "../service/kruskal-maze.service";
import { MazeGenerationAldousBroderService } from "../service/aldous-broder-maze.service";
import { MazeGenerationHuntAndKillService } from "../service/hunt-kill-maze.service";
import { MazeGenerationRandomizedDivisionService } from "../service/division-maze.service";
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

    public async findFitNeighbors(source: MazeCellModel[][], rows: number, cols: number, currPoint: MazeGridCell, neighbors: MazeGridCell[]): Promise<MazeGridCell[]> {
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

    public async findAnyNeighbors(source: MazeCellModel[][], rows: number, cols: number, currPoint: MazeGridCell, neighbors: MazeGridCell[]): Promise<MazeGridCell[]> {
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

    public async mergeWall(source: MazeCellModel[][], currPoint: MazeGridCell, nextPoint: MazeGridCell): Promise<MazeCellModel[][]> {
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

    public async buildWall(source: MazeCellModel[][], currPoint: MazeGridCell, nextPoint: MazeGridCell): Promise<MazeCellModel[][]> {
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

    public async direct(source: MazeCellModel[][], currPoint: MazeGridCell, nextPoint: MazeGridCell): Promise<MazeCellModel[][]> {
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

    public existed(array: MazeGridCell[], target: MazeGridCell): boolean {
        return this.indexOf(array, target) > -1;
    }

    public indexOf(array: MazeGridCell[], target: MazeGridCell): number {
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

    public async colorCells(source: MazeCellModel[][], points: MazeGridPoint[], flags: boolean[], threshold: number, callback: (param: MazeCellModel[][]) => void): Promise<void> {
        let point: MazeGridPoint, flag: boolean;

        for (let i = 0; i < threshold; i++) {
            point = points[i];
            flag = flags[i];

            if (!point.currCell) continue;

            if (i % 3 === 1) {
                if (!flag) {
                    source[point.currCell.row][point.currCell.col].color = ACCENT_ONE_COLOR;
                } else {
                    source[point.currCell.row][point.currCell.col].color = PRIMARY_ONE_COLOR;
                    source[point.nextCell.row][point.nextCell.col].color = SECONDARY_ONE_COLOR;
                }
            } else if (i % 3 === 2) {
                if (!flag) {
                    source[point.currCell.row][point.currCell.col].color = ACCENT_TWO_COLOR;
                } else {
                    source[point.currCell.row][point.currCell.col].color = PRIMARY_TWO_COLOR;
                    source[point.nextCell.row][point.nextCell.col].color = SECONDARY_TWO_COLOR;
                }
            } else {
                if (!flag) {
                    source[point.currCell.row][point.currCell.col].color = ACCENT_COLOR;
                } else {
                    source[point.currCell.row][point.currCell.col].color = PRIMARY_COLOR;
                    source[point.nextCell.row][point.nextCell.col].color = SECONDARY_COLOR;
                }
            }
        }
        
        callback(source);
    }

    public async clearCells(source: MazeCellModel[][], points: MazeGridPoint[], flags: boolean[], threshold: number, callback: (param: MazeCellModel[][]) => void): Promise<void> {
        let point: MazeGridPoint;

        for (let i = 0; i < threshold; i++) {
            point = points[i];

            if (!point.currCell) continue;

            if (!flags[i]) {
                source[point.currCell.row][point.currCell.col].color = EMPTY_COLOR;
            } else {
                source[point.currCell.row][point.currCell.col].color = EMPTY_COLOR;
                source[point.nextCell.row][point.nextCell.col].color = EMPTY_COLOR;
            }
        }
        
        callback(source);
    }

}

@Injectable()
export class MazeMatchService {

    constructor(
        private _ab: MazeGenerationAldousBroderService,
        private divide: MazeGenerationRandomizedDivisionService,
        private _rbt: MazeGenerationRandomizedBacktrackerService,
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
            if (name === 'aldous-broder' || name === 'optimal-aldous-broder' || name === 'parallel-aldous-broder') {
                return this._ab.maze(source, rows, cols, name.includes('parallel') ? 'all' : (name.includes('optimal') ? 'opt' : 'one'));
            }

            if (name === 'randomized-backtracker' || name === 'parallel-randomized-backtracker') {
                return this._rbt.maze(source, rows, cols, name.includes('parallel') ? 'all' : 'one');
            }

            if (name === 'randomized-division-build' || name === 'randomized-division-merge') {
                return this.divide.maze(source, rows, cols, name.endsWith('merge') ? 'merge' : 'build');
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
            
            if (name === 'wilson' || name === 'optimal-wilson') {
                return this._wilson.maze(source, rows, cols, name.includes('optimal') ? 'opt' : null);
            }
        }

        if (type === 'path-finder') {

        }

        return of(null);
    }

}
