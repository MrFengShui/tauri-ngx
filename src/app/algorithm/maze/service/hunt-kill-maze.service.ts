import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { floor, random } from "lodash";

import { MazeToolsService } from "../ngrx-store/maze.service";
import { MazeDataModel, MazeGridPoint, MazeRunType } from "../ngrx-store/maze.state";
import { delay, MAZE_DELAY_DURATION } from "../maze.utils";
import { MazeGridCell } from "../ngrx-store/maze.state";
import { ACCENT_COLOR, EMPTY_COLOR, PRIMARY_COLOR, SECONDARY_COLOR } from "../../../public/global.utils";

/**
 * 猎杀算法
 */
@Injectable()
export class MazeGenerationHuntAndKillService {

    private flags: boolean[] = Array.from([]);
    private points: MazeGridPoint[] = Array.from([]);
    private origins: MazeGridCell[] = Array.from([]);
    private neighbors: MazeGridCell[] = Array.from([]);

    constructor(private _service: MazeToolsService) {}

    public maze(source: MazeDataModel[][], rows: number, cols: number, type: MazeRunType): Observable<MazeDataModel[][]> {
        return new Observable(subscriber => {
            if (type === 'one') {
                this.runByOne(source, rows, cols, param => subscriber.next(param)).then(() => subscriber.complete());
            }
            
            if (type === 'all') {
                this.runByAll(source, rows, cols, param => subscriber.next(param)).then(() => subscriber.complete());
            }
        });
    }

    private async runByOne(source: MazeDataModel[][], rows: number, cols: number, callback: (param: MazeDataModel[][]) => void): Promise<void> {
        const total: number = rows * cols;
        let point: MazeGridPoint = { currCell: { row: -1, col: -1 }, nextCell: { row: -1, col: -1 } }, count: number = 0;

        while (count < total) {
            if (count === 0) {
                count += 1;

                point.currCell = { row: random(0, rows - 1, false), col: random(0, cols - 1, false) };
                source[point.currCell.row][point.currCell.col].visited = true;
            }

            this.neighbors = await this._service.findFitNeighbors(source, rows, cols, point.currCell, this.neighbors);

            if (this.neighbors.length > 0) {
                count += 1;

                point.nextCell = this.neighbors[this.neighbors.length === 1 ? 0 : random(0, this.neighbors.length - 1, false)];

                source[point.nextCell.row][point.nextCell.col].visited = true;
                source = await this._service.mergeWall(source, point.currCell, point.nextCell);

                source[point.currCell.row][point.currCell.col].color = PRIMARY_COLOR;
                source[point.nextCell.row][point.nextCell.col].color = SECONDARY_COLOR;
                callback(source);

                await delay(MAZE_DELAY_DURATION);

                source[point.currCell.row][point.currCell.col].color = EMPTY_COLOR;
                source[point.nextCell.row][point.nextCell.col].color = EMPTY_COLOR;
                callback(source);

                point.currCell = point.nextCell;
            } else {
                point.currCell = await this.scan(source, rows, cols, callback);
                source[point.currCell.row][point.currCell.col].visited = true;

                this.neighbors = await this._service.findAnyNeighbors(source, rows, cols, point.currCell, this.neighbors);
                this.neighbors = this.neighbors.filter(neighbor => source[neighbor.row][neighbor.col].visited);

                if (this.neighbors.length > 0) {
                    count += 1;

                    point.nextCell = this.neighbors[this.neighbors.length === 1 ? 0 : random(0, this.neighbors.length - 1, false)];         
                    
                    source[point.nextCell.row][point.nextCell.col].visited = true;
                    await this._service.mergeWall(source, point.currCell, point.nextCell);

                    source[point.currCell.row][point.currCell.col].color = PRIMARY_COLOR;
                    source[point.nextCell.row][point.nextCell.col].color = SECONDARY_COLOR;
                    callback(source);

                    await delay(MAZE_DELAY_DURATION);

                    source[point.currCell.row][point.currCell.col].color = EMPTY_COLOR;
                    source[point.nextCell.row][point.nextCell.col].color = EMPTY_COLOR;
                    callback(source);
                }
            }
        }

        this.neighbors.splice(0);
    }

    private async runByAll(source: MazeDataModel[][], rows: number, cols: number, callback: (param: MazeDataModel[][]) => void): Promise<void> {
        const total: number = rows * cols, scale: number = this._service.calcLCM(floor(Math.log2(total), 0), 3);
        let cell: MazeGridCell, threshold: number = 1, count: number = 0;

        for (let i = 0; i < scale; i++) {
            this.points.push({ currCell: { row: -1, col: -1 }, nextCell: { row: -1, col: -1 } });
            this.flags.push(false);
        }

        while (count < total) {
            if (count === 0) {
                count += 1;

                cell = { row: random(0, rows - 1, false), col: random(0, cols - 1, false) };
                source[cell.row][cell.col].visited = true;

                this.points[0].currCell = cell;
            }

            for (let i = 0; i < threshold; i++) {
                if (this.points[i].currCell.row !== -1 && this.points[i].currCell.col !== -1) {
                    this.neighbors = await this._service.findFitNeighbors(source, rows, cols, this.points[i].currCell, this.neighbors);
                    this.flags[i] = this.neighbors.length > 0;
    
                    if (this.flags[i]) {
                        count += 1;
    
                        this.points[i].nextCell = this.neighbors[this.neighbors.length === 1 ? 0 : random(0, this.neighbors.length - 1, false)];
    
                        source[this.points[i].nextCell.row][this.points[i].nextCell.col].visited = true;    
                        source = await this._service.mergeWall(source, this.points[i].currCell, this.points[i].nextCell);
                    }
                }
            }
            
            await this._service.colorCells(source, this.points, this.flags, threshold, callback);    
            await delay(MAZE_DELAY_DURATION);
            await this._service.clearCells(source, this.points, this.flags, threshold, callback);

            for (let i = 0; i < threshold; i++) {
                if (this.flags[i]) {
                    this.points[i].currCell = this.points[i].nextCell;
                }
            }

            if (this.flags.every(flag => !flag)) {
                this.origins = await this.scanAll(source, rows, cols, callback);

                for (let i = 0, length = Math.min(threshold, this.origins.length); i < length; i++) {
                    this.points[i].currCell = this.origins[i];
                    source[this.points[i].currCell.row][this.points[i].currCell.col].visited = true;

                    this.neighbors = await this._service.findAnyNeighbors(source, rows, cols, this.points[i].currCell, this.neighbors);
                    this.neighbors = this.neighbors.filter(neighbor => source[neighbor.row][neighbor.col].visited);

                    if (this.neighbors.length > 0) {
                        count += 1;

                        this.points[i].nextCell = this.neighbors[this.neighbors.length === 1 ? 0 : random(0, this.neighbors.length - 1, false)];         

                        source[this.points[i].nextCell.row][this.points[i].nextCell.col].visited = true;
                        await this._service.mergeWall(source, this.points[i].currCell, this.points[i].nextCell);

                        source[this.points[i].currCell.row][this.points[i].currCell.col].color = PRIMARY_COLOR;
                        source[this.points[i].nextCell.row][this.points[i].nextCell.col].color = SECONDARY_COLOR;
                        callback(source);

                        await delay(MAZE_DELAY_DURATION);

                        source[this.points[i].currCell.row][this.points[i].currCell.col].color = EMPTY_COLOR;
                        source[this.points[i].nextCell.row][this.points[i].nextCell.col].color = EMPTY_COLOR;
                        callback(source);
                    }
                }
            }

            threshold = Math.min(threshold + 1, scale);
        }

        this.flags.splice(0);
        this.points.splice(0);
        this.origins.splice(0);
        this.neighbors.splice(0);
    }

    private async scan(source: MazeDataModel[][], rows: number, cols: number, callback: (param: MazeDataModel[][]) => void): Promise<MazeGridCell> {
        const cells: MazeGridCell[] = await this.scanAll(source, rows, cols, callback);
        return cells[cells.length === 1 ? 0 : random(0, cells.length - 1, false)];
    }

    private async scanAll(source: MazeDataModel[][], rows: number, cols: number, callback: (param: MazeDataModel[][]) => void): Promise<MazeGridCell[]> {
        let cells: MazeGridCell[] = Array.from([]), cell: MazeGridCell;

        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                cell = { row, col };

                if (!source[cell.row][cell.col].visited) {
                    this.neighbors = await this._service.findAnyNeighbors(source, rows, cols, cell, this.neighbors);
                    this.neighbors = this.neighbors.filter(neighbor => source[neighbor.row][neighbor.col].visited);

                    if (this.neighbors.length > 0) {
                        cells.push(cell);
                    }
                }
            }

            if (cells.length > 0) {
                return cells;
            }

            source[row].forEach(col => col.color = ACCENT_COLOR);
            callback(source);

            await delay(MAZE_DELAY_DURATION);

            source[row].forEach(col => col.color = EMPTY_COLOR);
            callback(source);
        }
        
        return cells;
    }

}

