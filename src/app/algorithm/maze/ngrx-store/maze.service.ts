import { Injectable } from "@angular/core";
import { Observable, of } from "rxjs";

import { MazeDataModel, MazeGridPoint } from "./maze.state";
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

    public createDataGrid(rows: number, cols: number): Observable<MazeDataModel[][]> {
        return new Observable(subscriber => {
            const grid: MazeDataModel[][] = Array.from([]);
            let index: number = 0;

            for (let row = 0; row < rows; row++) {
                let array: MazeDataModel[] = Array.from([]);

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

    public resetDataGrid(source: MazeDataModel[][], rows: number, cols: number): Observable<MazeDataModel[][]> {
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

    public async findFitNeighbors(source: MazeDataModel[][], rows: number, cols: number, currCell: MazeGridCell, neighbors: MazeGridCell[]): Promise<MazeGridCell[]> {
        if (neighbors.length > 0) {
            neighbors.splice(0);
        }

        if (currCell) {
            /* 添加上边 */
            if (currCell.col > 0 && !source[currCell.row][currCell.col - 1].visited) {
                neighbors.push({ row: currCell.row, col: currCell.col - 1 });
            }
            /* 添加右边 */
            if (currCell.row < rows - 1 && !source[currCell.row + 1][currCell.col].visited) {
                neighbors.push({ row: currCell.row + 1, col: currCell.col });
            }
            /* 添加下边 */
            if (currCell.col < cols - 1 && !source[currCell.row][currCell.col + 1].visited) {
                neighbors.push({ row: currCell.row, col: currCell.col + 1 });
            }
            /* 添加左边 */
            if (currCell.row > 0 && !source[currCell.row - 1][currCell.col].visited) {
                neighbors.push({ row: currCell.row - 1, col: currCell.col });
            }
        }

        return neighbors;
    }

    public async findAnyNeighbors(source: MazeDataModel[][], rows: number, cols: number, currCell: MazeGridCell, neighbors: MazeGridCell[]): Promise<MazeGridCell[]> {
        if (neighbors.length > 0) {
            neighbors.splice(0);
        }

        if (currCell) {
            /* 添加上边 */
            if (currCell.col > 0) {
                neighbors.push({ row: currCell.row, col: currCell.col - 1 });
            }
            /* 添加右边 */
            if (currCell.row < rows - 1) {
                neighbors.push({ row: currCell.row + 1, col: currCell.col });
            }
            /* 添加下边 */
            if (currCell.col < cols - 1) {
                neighbors.push({ row: currCell.row, col: currCell.col + 1 });
            }
            /* 添加左边 */
            if (currCell.row > 0) {
                neighbors.push({ row: currCell.row - 1, col: currCell.col });
            }
        }

        return neighbors;
    }

    public async mergeWall(source: MazeDataModel[][], currCell: MazeGridCell, nextCell: MazeGridCell): Promise<MazeDataModel[][]> {
        if (currCell && nextCell) {
            /* 拆上边 */
            if (currCell.row - 1 === nextCell.row && currCell.col === nextCell.col) {
                source[currCell.row][currCell.col].walls.top = false;
                source[nextCell.row][nextCell.col].walls.bottom = false;
            }
            /* 拆右边 */
            if (currCell.row === nextCell.row && currCell.col + 1 === nextCell.col) {
                source[currCell.row][currCell.col].walls.right = false;
                source[nextCell.row][nextCell.col].walls.left = false;
            }
            /* 拆下边 */
            if (currCell.row + 1 === nextCell.row && currCell.col === nextCell.col) {
                source[currCell.row][currCell.col].walls.bottom = false;
                source[nextCell.row][nextCell.col].walls.top = false;
            }
            /* 拆左边 */
            if (currCell.row === nextCell.row && currCell.col - 1 === nextCell.col) {
                source[currCell.row][currCell.col].walls.left = false;
                source[nextCell.row][nextCell.col].walls.right = false;
            }
        }

        return source;
    }

    public async buildWall(source: MazeDataModel[][], currCell: MazeGridCell, nextCell: MazeGridCell): Promise<MazeDataModel[][]> {
        if (currCell && nextCell) {
            /* 建上边 */
            if (currCell.row - 1 === nextCell.row && currCell.col === nextCell.col) {
                source[currCell.row][currCell.col].walls.top = true;
                source[nextCell.row][nextCell.col].walls.bottom = true;
            }
            /* 建右边 */
            if (currCell.row === nextCell.row && currCell.col + 1 === nextCell.col) {
                source[currCell.row][currCell.col].walls.right = true;
                source[nextCell.row][nextCell.col].walls.left = true;
            }
            /* 建下边 */
            if (currCell.row + 1 === nextCell.row && currCell.col === nextCell.col) {
                source[currCell.row][currCell.col].walls.bottom = true;
                source[nextCell.row][nextCell.col].walls.top = true;
            }
            /* 建左边 */
            if (currCell.row === nextCell.row && currCell.col - 1 === nextCell.col) {
                source[currCell.row][currCell.col].walls.left = true;
                source[nextCell.row][nextCell.col].walls.right = true;
            }
        }

        return source;
    }

    public async direct(source: MazeDataModel[][], currCell: MazeGridCell, nextCell: MazeGridCell): Promise<MazeDataModel[][]> {
        if (currCell && nextCell) {
            /* 在上边 */
            if (currCell.row - 1 === nextCell.row && currCell.col === nextCell.col) {
                source[currCell.row][currCell.col].direction = 'u';
            }
            /* 在右边 */
            if (currCell.row === nextCell.row && currCell.col + 1 === nextCell.col) {
                source[currCell.row][currCell.col].direction = 'r';
            }
            /* 在下边 */
            if (currCell.row + 1 === nextCell.row && currCell.col === nextCell.col) {
                source[currCell.row][currCell.col].direction = 'd';
            }
            /* 在左边 */
            if (currCell.row === nextCell.row && currCell.col - 1 === nextCell.col) {
                source[currCell.row][currCell.col].direction = 'l';
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

    public calcGCD(fst: number, snd: number): number {
        while (true) {
            if (fst > snd) {
                fst -= snd;
            } else if (fst < snd) {
                snd -= fst;
            } else {
                break;
            }
        }
        
        return fst;
    }

    public calcLCM(fst: number, snd: number): number {
        let mult: number = 0, gcd: number = this.calcGCD(fst, snd);
        
        for (let i = 0; i < snd; i++) {
            mult += fst;
        }
        
        return Math.floor(mult / gcd);
    }

    public async colorCells(source: MazeDataModel[][], points: MazeGridPoint[], flags: boolean[], threshold: number, callback: (param: MazeDataModel[][]) => void): Promise<void> {
        let point: MazeGridPoint, flag: boolean;

        for (let i = 0; i < threshold; i++) {
            point = points[i];
            flag = flags[i];

            if (!point || !point.currCell || (point.currCell.row === -1 && point.currCell.col === -1)) continue;

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

    public async clearCells(source: MazeDataModel[][], points: MazeGridPoint[], flags: boolean[], threshold: number, callback: (param: MazeDataModel[][]) => void): Promise<void> {
        let point: MazeGridPoint;

        for (let i = 0; i < threshold; i++) {
            point = points[i];

            if (!point.currCell || (point.currCell.row === -1 && point.currCell.col === -1)) continue;

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

    public match(type: MazeActionType, name: MazeActionmName, source: MazeDataModel[][], rows: number, cols: number): Observable<MazeDataModel[][] | null> {
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

            if (name === 'randomized-kruskal' || name === 'optimal-randomized-kruskal' || name === 'parallel-randomized-kruskal') {
                return this._kruskal.maze(source, rows, cols, name.includes('parallel') ? 'all' : (name.includes('optimal') ? 'opt' : 'one'));
            }

            if (name === 'randomized-prim' || name === 'parallel-randomized-prim') {
                return this._prim.maze(source, rows, cols, name.includes('parallel') ? 'all' : 'one');
            }
            
            if (name === 'sidewinder' || name === 'parallel-sidewinder') {
                return this._sidewinder.maze(source, rows, cols, name.includes('parallel') ? 'all' : 'one');
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
