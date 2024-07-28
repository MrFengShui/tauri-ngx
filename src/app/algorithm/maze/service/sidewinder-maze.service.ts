import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { floor, random } from "lodash";

import { MazeToolsService } from "../ngrx-store/maze.service";
import { MazeDataModel, MazeGridCell, MazeGridPoint, MazeGridRange, MazeRunType } from "../ngrx-store/maze.state";
import { delay, MAZE_DELAY_DURATION } from "../maze.utils";
import { ACCENT_COLOR, ACCENT_ONE_COLOR, ACCENT_TWO_COLOR, EMPTY_COLOR, PRIMARY_COLOR, SECONDARY_COLOR } from "../../../public/values.utils";

/**
 * 绕线机算法
 */
@Injectable()
export class MazeGenerationSidewinderService {

    private group: { [key: string | number]: { index: number, array: MazeGridCell[] } } = {};
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
        let weight: number, length: number, index: number, flag: boolean;

        for (let row = 0; row < rows; row++) {
            if (row === 0) {
                for (let col = 0; col < cols; col++) {
                    point.currCell = { row, col };
                    point.nextCell = { row, col: Math.min(col + 1, cols - 1) };

                    source = await this._service.mergeWall(source, point.currCell, point.nextCell);

                    source[point.currCell.row][point.currCell.col].color = ACCENT_COLOR;
                    callback(source);

                    await delay(MAZE_DELAY_DURATION);

                    source[point.currCell.row][point.currCell.col].color = EMPTY_COLOR;
                    callback(source);
                }
            } else {
                for (let col = 0; col <= cols - 1; col++) {
                    point.currCell = { row, col };
                    weight = source[point.currCell.row][point.currCell.col].weight;

                    if (!this.group[weight]) {
                        this.group[weight] = { index: -1, array: Array.from([]) };
                    }
        
                    if (!this._service.existed(this.group[weight].array, point.currCell)) {
                        this.group[weight].array.push(point.currCell);
                    }
        
                    if (random(0, 1, true) < 0.5) {
                        point.nextCell = { row, col: Math.min(col + 1, cols - 1) };
        
                        source[point.nextCell.row][point.nextCell.col].weight = weight;
                        source = await this._service.mergeWall(source, point.currCell, point.nextCell);
                    }

                    length = this.group[weight].array.length;
                    this.group[weight].index = length === 1 ? 0 : random(0, length - 1, false);
        
                    source[point.currCell.row][point.currCell.col].color = ACCENT_COLOR;
                    callback(source);
        
                    await delay(MAZE_DELAY_DURATION);
        
                    source[point.currCell.row][point.currCell.col].color = EMPTY_COLOR;
                    callback(source);
                }
                
                for (let col = cols - 1; col >= 0; col--) {
                    point.currCell = { row, col };        
                    weight = source[point.currCell.row][point.currCell.col].weight;
                    index = this.group[weight].index;
                    flag = this.group[weight] && point.currCell.row === this.group[weight].array[index].row && point.currCell.col === this.group[weight].array[index].col;
                    
                    if (flag) {
                        point.currCell = { row: this.group[weight].array[index].row, col: this.group[weight].array[index].col };
                        point.nextCell = { row: this.group[weight].array[index].row - 1, col: this.group[weight].array[index].col };
        
                        source = await this._service.mergeWall(source, point.currCell, point.nextCell);
                    }
        
                    source[point.currCell.row][point.currCell.col].color = flag ? PRIMARY_COLOR : ACCENT_COLOR;
                    source[point.nextCell.row][point.nextCell.col].color = flag ? SECONDARY_COLOR : EMPTY_COLOR;
                    callback(source);
        
                    await delay(MAZE_DELAY_DURATION);
        
                    source[point.currCell.row][point.currCell.col].color = EMPTY_COLOR;
                    source[point.nextCell.row][point.nextCell.col].color = EMPTY_COLOR;
                    callback(source);
                }

                Object.keys(this.group).forEach(key => {
                    this.group[key].array.splice(0);
                    delete this.group[key];
                });
            }
        }
    }

    private async runByAll(source: MazeDataModel[][], rows: number, cols: number, callback: (param: MazeDataModel[][]) => void): Promise<void> {
        let threshold: number;

        for (let row = 0; row < rows; row++) {
            this.ranges = await this.createBreakPoints(cols, this.ranges);
            threshold = this.ranges.length;

            await this.mergeRow(source, row, cols, threshold, callback);

            if (row > 0) {
                await this.mergeCol(source, row, threshold, callback);
            }
        }

        this.flags.splice(0);
        this.stack.splice(0);
        this.ranges.splice(0);
        this.points.splice(0);
    }

    private async mergeRow(source: MazeDataModel[][], row: number, cols: number, threshold: number, callback: (param: MazeDataModel[][]) => void): Promise<void> {
        const point: MazeGridPoint = { currCell: { row: -1, col: -1 }, nextCell: { row: -1, col: -1 } };
        let weight: number, length: number = 0;
        
        while (!this.ranges.every(range => range.index === range.final) || (row > 0 && length < cols)) {
            for (let i = 0; i < threshold; i++) {
                point.currCell = { row, col: Math.min(this.ranges[i].index, this.ranges[i].final) };

                if (row === 0) {
                    point.nextCell = { row, col: Math.min(this.ranges[i].index + 1, this.ranges[i].final) };
    
                    this.flags[i] = false;
    
                    source = await this._service.mergeWall(source, point.currCell, point.nextCell);
                } else {
                    weight = source[point.currCell.row][point.currCell.col].weight;

                    if (!this.group[weight]) {
                        this.group[weight] = { index: -1, array: Array.from([]) };
                    }
                    
                    if (!this._service.existed(this.group[weight].array, point.currCell)) {
                        this.group[weight].array.push(point.currCell);
                    }
        
                    this.flags[i] = random(0, 1, true) < 0.5;
        
                    if (this.flags[i]) {
                        point.nextCell = { row, col: Math.min(this.ranges[i].index + 1, this.ranges[i].final) };
        
                        source[point.nextCell.row][point.nextCell.col].weight = weight;
                        source = await this._service.mergeWall(source, point.currCell, point.nextCell);
                    }

                    length = this.group[weight].array.length;
                    this.group[weight].index = random(0, length - 1, false);
                }

                this.points[i] = { currCell: point.currCell, nextCell: point.nextCell };
            }

            await this._service.colorCells(source, this.points, this.flags, threshold, callback);
            await delay(MAZE_DELAY_DURATION);
            await this._service.clearCells(source, this.points, this.flags, threshold, callback);

            for (let i = 0; i < threshold; i++) {
                this.ranges[i].index = Math.min(this.ranges[i].index + 1, this.ranges[i].final);

                if (row === 0 && this.ranges[i].final < cols - 1) {
                    point.currCell = { row, col: this.ranges[i].final };
                    point.nextCell = { row, col: this.ranges[i].final + 1 };
                    source = await this._service.mergeWall(source, point.currCell, point.nextCell);
                }
            }

            if (row > 0) {
                length = 0;
                Object.keys(this.group).forEach(key => length += this.group[key].array.length);
            }
        }
    }

    private async mergeCol(source: MazeDataModel[][], row: number, threshold: number, callback: (param: MazeDataModel[][]) => void): Promise<void> {
        const point: MazeGridPoint = { currCell: { row: -1, col: -1 }, nextCell: { row: -1, col: -1 } };
        let weight: number, index: number;
        
        while (Object.keys(this.group).length > 0) {
            for (let i = threshold - 1; i >= 0; i--) {
                point.currCell = { row, col: Math.max(this.ranges[i].index, this.ranges[i].start) };
                weight = source[point.currCell.row][point.currCell.col].weight;

                if (this.group[weight]) {
                    index = this.group[weight].index;

                    this.flags[i] = point.currCell.row === this.group[weight].array[index].row && point.currCell.col === this.group[weight].array[index].col;
                
                    if (this.flags[i]) {
                        point.currCell = { row: this.group[weight].array[index].row, col: this.group[weight].array[index].col };
                        point.nextCell = { row: this.group[weight].array[index].row - 1, col: this.group[weight].array[index].col };
    
                        this.group[weight].array.splice(0);
                        delete this.group[weight];
    
                        source = await this._service.mergeWall(source, point.currCell, point.nextCell);
                    }
                }
                
                this.points[i] = { currCell: point.currCell, nextCell: point.nextCell };
            }

            await this._service.colorCells(source, this.points, this.flags, threshold, callback);
            await delay(MAZE_DELAY_DURATION);
            await this._service.clearCells(source, this.points, this.flags, threshold, callback);

            for (let i = 0; i < threshold; i++) {
                this.ranges[i].index = Math.max(this.ranges[i].index - 1, this.ranges[i].start);
            }
        }
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

}
