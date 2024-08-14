import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { random } from "lodash";

import { MazeToolsService } from "../ngrx-store/maze.service";
import { MazeDataModel, MazeGridCell, MazeGridPoint, MazeGridRange, MazeRunType } from "../ngrx-store/maze.state";
import { delay, MAZE_DELAY_DURATION } from "../maze.utils";
import { ACCENT_COLOR, EMPTY_COLOR, PRIMARY_COLOR, SECONDARY_COLOR } from "../../../public/global.utils";

/**
 * 绕线机算法
 */
@Injectable()
export class MazeGenerationSidewinderService {

    private cache: MazeGridCell[] = Array.from([]);
    private caches: MazeGridCell[][] = Array.from([]);
    private group: { [key: string | number]: MazeGridCell } = {};
    private stack: number[] = Array.from([]);
    private flags: boolean[] = Array.from([]);
    private ranges: MazeGridRange[] = Array.from([]);
    private points: MazeGridPoint[] = Array.from([]);

    constructor(private _service: MazeToolsService) {}

    public maze(source: MazeDataModel[][], rows: number, cols: number, type: MazeRunType): Observable<MazeDataModel[][]> {
        return new Observable(subscriber => {
            if (type === 'one') {
                this.runByOne(source, rows, cols, param => subscriber.next(param))
                .then(() => subscriber.complete())
                .catch(error => subscriber.error(error));
            }

            if (type === 'all') {
                this.runByAll(source, rows, cols, param => subscriber.next(param))
                .then(() => subscriber.complete())
                .catch(error => subscriber.error(error));
            }
        });
    }

    private async runByOne(source: MazeDataModel[][], rows: number, cols: number, callback: (param: MazeDataModel[][]) => void): Promise<void> {
        const point: MazeGridPoint = { currCell: { row: -1, col: -1 }, nextCell: { row: -1, col: -1 } };
        let flag: boolean;

        for (let row = 0; row < rows; row++) {
            for (let col = 0; col <= cols - 1; col++) {
                if (row === 0) {
                    point.currCell = { row, col };
                    point.nextCell = { row, col: Math.min(col + 1, cols - 1) };

                    source = await this._service.mergeWall(source, point.currCell, point.nextCell);
                } else {
                    point.currCell = await this.dispatch(source, cols - 1, row, col, this.cache);
                }
                
                source[point.currCell.row][point.currCell.col].color = ACCENT_COLOR;
                callback(source);
    
                await delay(MAZE_DELAY_DURATION);
    
                source[point.currCell.row][point.currCell.col].color = EMPTY_COLOR;
                callback(source);
            }

            for (let col = cols - 1; col >= 0; col--) {
                [point.currCell, point.nextCell, flag] = await this.eliminate(source, row, col);
    
                if (flag) {
                    source[point.currCell.row][point.currCell.col].color = PRIMARY_COLOR;
                    source[point.nextCell.row][point.nextCell.col].color = SECONDARY_COLOR;
                } else {
                    source[point.currCell.row][point.currCell.col].color = ACCENT_COLOR;
                }
                
                callback(source);
    
                await delay(MAZE_DELAY_DURATION);
    
                if (flag) {
                    source[point.currCell.row][point.currCell.col].color = EMPTY_COLOR;
                    source[point.nextCell.row][point.nextCell.col].color = EMPTY_COLOR;
                } else {
                    source[point.currCell.row][point.currCell.col].color = EMPTY_COLOR;
                }

                callback(source);
            }
        }
    }

    private async runByAll(source: MazeDataModel[][], rows: number, cols: number, callback: (param: MazeDataModel[][]) => void): Promise<void> {
        const point: MazeGridPoint = { currCell: { row: -1, col: -1 }, nextCell: { row: -1, col: -1 } };
        let flag: boolean, threshold: number;

        for (let row = 0; row < rows; row++) {
            this.ranges = await this.createBreakPoints(cols, this.ranges);
            threshold = this.ranges.length;

            for (let i = 0; i < threshold; i++) {
                this.caches.push([]);
            }
    
            flag = false;

            while (!flag) {
                for (let i = 0; i < threshold; i++) {
                    point.currCell = { row, col: Math.min(this.ranges[i].index, this.ranges[i].final) };
                    this.flags[i] = false;
    
                    if (row === 0) {
                        point.nextCell = { row, col: Math.min(this.ranges[i].index + 1, this.ranges[i].final) };
        
                        source = await this._service.mergeWall(source, point.currCell, point.nextCell);
                    } else {
                        point.currCell = await this.dispatch(source, this.ranges[i].final, point.currCell.row, point.currCell.col, this.caches[i]);
                    }
    
                    this.points[i] = { currCell: point.currCell, nextCell: point.nextCell };
                }
                
                await this._service.colorCells(source, this.points, this.flags, threshold, callback);
                await delay(MAZE_DELAY_DURATION);
                await this._service.clearCells(source, this.points, this.flags, threshold, callback);
                
                flag = this.ranges.every(range => range.index === range.final);
    
                for (let i = 0; i < threshold; i++) {
                    this.ranges[i].index = Math.min(this.ranges[i].index + 1, this.ranges[i].final);
    
                    if (row === 0 && this.ranges[i].final < cols - 1) {
                        point.currCell = { row, col: this.ranges[i].final };
                        point.nextCell = { row, col: this.ranges[i].final + 1 };
                        source = await this._service.mergeWall(source, point.currCell, point.nextCell);
                    }
                }
            }
            
            if (row > 0) {
                flag = false;
                
                while (!flag) {
                    for (let i = threshold - 1; i >= 0; i--) {
                        point.currCell = { row, col: Math.max(this.ranges[i].index, this.ranges[i].start) };
        
                        [point.currCell, point.nextCell, this.flags[i]] = await this.eliminate(source, point.currCell.row, point.currCell.col);
                        
                        this.points[i] = { currCell: point.currCell, nextCell: point.nextCell };
                    }
        
                    await this._service.colorCells(source, this.points, this.flags, threshold, callback);
                    await delay(MAZE_DELAY_DURATION);
                    await this._service.clearCells(source, this.points, this.flags, threshold, callback);
        
                    flag = this.ranges.every(range => range.index === range.start);
        
                    for (let i = 0; i < threshold; i++) {
                        this.ranges[i].index = Math.max(this.ranges[i].index - 1, this.ranges[i].start);
                    }
                }
            }
            
            this.caches.splice(0);
        }

        this.flags.splice(0);
        this.stack.splice(0);
        this.ranges.splice(0);
        this.points.splice(0);
    }

    private async createBreakPoints(cols: number, ranges: MazeGridRange[]): Promise<MazeGridRange[]> {
        const threshold: number = Math.floor(Math.log2(cols) * 3);
        let lhs: number, rhs: number, mid: number;

        if (ranges.length > 0) {
            ranges.splice(0);
        }

        this.stack.push(cols - 1);
        this.stack.push(0);

        while (this.stack.length > 0) {
            lhs = this.stack.pop() as number;
            rhs = this.stack.pop() as number;

            if (lhs < rhs) {
                if (rhs - lhs < threshold) {
                    ranges.push({ start: lhs, final: rhs, index: lhs });
                } else {
                    mid = Math.floor((rhs - lhs) * random(0.15, 0.85, true) + lhs);

                    if (mid + 1 < rhs) {
                        this.stack.push(rhs);
                        this.stack.push(mid + 1);
                    }

                    if (lhs < mid) {
                        this.stack.push(mid);
                        this.stack.push(lhs);
                    }
                }
            }
        }

        return ranges;
    }

    private async dispatch(source: MazeDataModel[][], threshold: number, row: number, col: number, cache: MazeGridCell[]): Promise<MazeGridCell> {
        const weight: number = source[row][col].weight;
        const point: MazeGridPoint = { currCell: { row, col }, nextCell: { row: -1, col: -1 } };

        if (!this._service.existed(cache, point.currCell)) {
            cache.push(point.currCell);
        }
        
        if (col === threshold) {
            this.group[weight] = cache[cache.length === 1 ? 0 : random(0, cache.length - 1, false)];
            cache.splice(0);
        } else {
            if (random(0, 1, true) < 0.5) {
                point.nextCell = { row, col: Math.min(col + 1, threshold) };

                source[point.nextCell.row][point.nextCell.col].weight = weight;
                source = await this._service.mergeWall(source, point.currCell, point.nextCell);
            } else {
                this.group[weight] = cache[cache.length === 1 ? 0 : random(0, cache.length - 1, false)];
                cache.splice(0);
            }
        }

        return point.currCell;
    }

    private async eliminate(source: MazeDataModel[][], row: number, col: number): Promise<[MazeGridCell, MazeGridCell, boolean]> {
        const weight: number = source[row][col].weight;
        const point: MazeGridPoint = { currCell: { row, col }, nextCell: { row: -1, col: -1 } };        
        const flag = this.group[weight] && point.currCell.row === this.group[weight].row && point.currCell.col === this.group[weight].col;
        
        if (flag) {
            point.currCell = { row: this.group[weight].row, col: this.group[weight].col };
            point.nextCell = { row: this.group[weight].row - 1, col: this.group[weight].col };

            delete this.group[weight];

            source = await this._service.mergeWall(source, point.currCell, point.nextCell);
        }

        return [point.currCell, point.nextCell, flag];
    }

}
