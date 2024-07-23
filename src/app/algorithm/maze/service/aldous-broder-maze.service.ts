import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { floor, random } from "lodash";

import { MazeToolsService } from "../ngrx-store/maze.service";
import { MazeCellModel, MazeGridPoint, MazeRunType } from "../ngrx-store/maze.state";
import { delay, MAZE_DELAY_DURATION } from "../maze.utils";
import { MazeGridCell } from "../ngrx-store/maze.state";
import { ACCENT_COLOR, EMPTY_COLOR, PRIMARY_COLOR, SECONDARY_COLOR } from "../../../public/values.utils";

/**
 * Aldous-Broder算法
 */
@Injectable()
export class MazeGenerationAldousBroderService {

    private unvisited: MazeGridCell[] = Array.from([]);
    private flags: boolean[] = Array.from([]);
    private points: MazeGridPoint[] = Array.from([]);    
    private neighbors: MazeGridCell[] = Array.from([]);

    constructor(private _service: MazeToolsService) { }

    public maze(source: MazeCellModel[][], rows: number, cols: number, type: MazeRunType): Observable<MazeCellModel[][]> {
        return new Observable(subscriber => {
            if (type === 'one') {
                this.runByOne(source, rows, cols, param => subscriber.next(param)).then(() => subscriber.complete());
            }

            if (type === 'opt') {
                this.runByOptimal(source, rows, cols, param => subscriber.next(param)).then(() => subscriber.complete());
            }
            
            if (type === 'all') {
                this.runByAll(source, rows, cols, param => subscriber.next(param)).then(() => subscriber.complete());
            }
        });
    }

    private async runByOne(source: MazeCellModel[][], rows: number, cols: number, callback: (param: MazeCellModel[][]) => void): Promise<void> {
        const total: number = rows * cols;
        let point: MazeGridPoint = { currCell: { row: random(0, rows - 1, false), col: random(0, cols - 1, false) }, nextCell: { row: -1, col: -1 } }, count: number = 0, flag: boolean;

        while (count < total) {
            flag = false;

            this.neighbors = await this._service.findAnyNeighbors(source, rows, cols, point.currCell, this.neighbors);

            if (this.neighbors.length > 0) {
                point.nextCell = this.neighbors[this.neighbors.length === 1 ? 0 : random(0, this.neighbors.length - 1, false)];

                if (!source[point.nextCell.row][point.nextCell.col].visited) {
                    flag = true;

                    count += 1;                    

                    source[point.nextCell.row][point.nextCell.col].visited = true;
                    source = await this._service.mergeWall(source, point.currCell, point.nextCell);
                }
            }

            if (!flag) {
                source[point.currCell.row][point.currCell.col].color = ACCENT_COLOR;
            } else {
                source[point.currCell.row][point.currCell.col].color = PRIMARY_COLOR;
                source[point.nextCell.row][point.nextCell.col].color = SECONDARY_COLOR;
            }
            
            callback(source);

            await delay(MAZE_DELAY_DURATION);

            if (!flag) {
                source[point.currCell.row][point.currCell.col].color = EMPTY_COLOR;
            } else {
                source[point.currCell.row][point.currCell.col].color = EMPTY_COLOR;
                source[point.nextCell.row][point.nextCell.col].color = EMPTY_COLOR;
            }
            
            callback(source);

            point.currCell = point.nextCell;
        }

        this.neighbors.splice(0);
    }

    private async runByOptimal(source: MazeCellModel[][], rows: number, cols: number, callback: (param: MazeCellModel[][]) => void): Promise<void> {
        const total: number = rows * cols;
        let point: MazeGridPoint = { currCell: { row: random(0, rows - 1, false), col: random(0, cols - 1, false) }, nextCell: { row: -1, col: -1 } }, count: number = 0, flag: boolean;

        while (count < total) {
            flag = false;

            this.neighbors = await this._service.findAnyNeighbors(source, rows, cols, point.currCell, this.neighbors);

            if (this.neighbors.length > 0) {
                this.unvisited = this.neighbors.filter(neighbor => !source[neighbor.row][neighbor.col].visited);
                point.nextCell = this.unvisited.length > 0 
                    ? this.unvisited[this.unvisited.length === 1 ? 0 : random(0, this.unvisited.length - 1, false)]
                    : this.neighbors[this.neighbors.length === 1 ? 0 : random(0, this.neighbors.length - 1, false)];

                if (!source[point.nextCell.row][point.nextCell.col].visited) {
                    flag = true;

                    count += 1;                    

                    source[point.nextCell.row][point.nextCell.col].visited = true;
                    source = await this._service.mergeWall(source, point.currCell, point.nextCell);
                }
            }

            if (!flag) {
                source[point.currCell.row][point.currCell.col].color = ACCENT_COLOR;
            } else {
                source[point.currCell.row][point.currCell.col].color = PRIMARY_COLOR;
                source[point.nextCell.row][point.nextCell.col].color = SECONDARY_COLOR;
            }
            
            callback(source);

            await delay(MAZE_DELAY_DURATION);

            if (!flag) {
                source[point.currCell.row][point.currCell.col].color = EMPTY_COLOR;
            } else {
                source[point.currCell.row][point.currCell.col].color = EMPTY_COLOR;
                source[point.nextCell.row][point.nextCell.col].color = EMPTY_COLOR;
            }
            
            callback(source);

            point.currCell = point.nextCell;
        }

        this.unvisited.splice(0);
        this.neighbors.splice(0);
    }

    private async runByAll(source: MazeCellModel[][], rows: number, cols: number, callback: (param: MazeCellModel[][]) => void): Promise<void> {
        const origin: MazeGridCell = { row: random(0, rows - 1, false), col: random(0, cols - 1, false) }, total: number = rows * cols, scale: number = floor(Math.log2(total)) * 3;
        let count: number = 0, threshold: number = 1;

        for (let i = 0; i < scale; i++) {
            this.points.push({ currCell: { row: -1, col: -1 }, nextCell: { row: -1, col: -1 } });
            this.flags.push(false);
        }

        while (count < total) {
            for (let i = 0; i < threshold; i++) {
                this.flags[i] = false;

                if (this.points[i].currCell.row === -1 && this.points[i].currCell.col === -1) {
                    this.points[i].currCell = origin;
                }

                this.neighbors = await this._service.findAnyNeighbors(source, rows, cols, this.points[i].currCell, this.neighbors);
                
                if (this.neighbors.length > 0) {
                    this.unvisited = this.neighbors.filter(neighbor => !source[neighbor.row][neighbor.col].visited);
                    this.points[i].nextCell = this.unvisited.length > 0 
                    ? this.unvisited[this.unvisited.length === 1 ? 0 : random(0, this.unvisited.length - 1, false)]
                    : this.neighbors[this.neighbors.length === 1 ? 0 : random(0, this.neighbors.length - 1, false)];
                    
                    if (!source[this.points[i].nextCell.row][this.points[i].nextCell.col].visited) {
                        this.flags[i] = true;

                        count += 1;
                        
                        source[this.points[i].nextCell.row][this.points[i].nextCell.col].visited = true;
                        source = await this._service.mergeWall(source, this.points[i].currCell, this.points[i].nextCell);
                    }
                }
            }
            
            await this._service.colorCells(source, this.points, this.flags, threshold, callback);
            await delay(MAZE_DELAY_DURATION);
            await this._service.clearCells(source, this.points, this.flags, threshold, callback);

            for (let i = 0; i < threshold; i++) {
                this.points[i].currCell = this.points[i].nextCell;
            }
            
            threshold = Math.min(threshold + 1, scale);
        }

        this.flags.splice(0);
        this.points.splice(0);
        this.neighbors.splice(0);
    }

}
