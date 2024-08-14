import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { floor, random } from "lodash";

import { MazeToolsService } from "../ngrx-store/maze.service";
import { MazeDataModel, MazeGridPoint, MazeRunType } from "../ngrx-store/maze.state";
import { delay, MAZE_DELAY_DURATION } from "../maze.utils";
import { MazeGridCell } from "../ngrx-store/maze.state";
import { ACCENT_COLOR, EMPTY_COLOR, PRIMARY_COLOR, SECONDARY_COLOR } from "../../../public/global.utils";

/**
 * 增长树算法
 */
@Injectable()
export class MazeGenerationGrowTreeService {

    private visited: MazeGridCell[] = Array.from([]);
    private unvisited: MazeGridCell[] = Array.from([]);
    private flags: boolean[] = Array.from([]);
    private points: MazeGridPoint[] = Array.from([]);
    private neighbors: MazeGridCell[] = Array.from([]);

    constructor(private _service: MazeToolsService) {}

    public maze(source: MazeDataModel[][], rows: number, cols: number, name: 'depth-first-growing-tree' | 'parallel-depth-first-growing-tree' | 'breadth-first-growing-tree' | 'parallel-breadth-first-growing-tree', type: MazeRunType): Observable<MazeDataModel[][]> {
        return new Observable(subscriber => {
            if (name === 'breadth-first-growing-tree' || name === 'parallel-breadth-first-growing-tree') {
                if (type === 'one') {
                    this.runByBreadthFirst(source, rows, cols, param => subscriber.next(param)).then(() => subscriber.complete());
                }
                
                if (type === 'all') {
                    this.runAllByBreadthFirst(source, rows, cols, param => subscriber.next(param)).then(() => subscriber.complete());
                }
            }

            if (name === 'depth-first-growing-tree' || name === 'parallel-depth-first-growing-tree') {
                if (type === 'one') {
                    this.runOneByDepthFirst(source, rows, cols, param => subscriber.next(param)).then(() => subscriber.complete());
                }

                if (type === 'all') {
                    this.runAllByDepthFirst(source, rows, cols, param => subscriber.next(param)).then(() => subscriber.complete());
                }
            }
        });
    }

    private async runByBreadthFirst(source: MazeDataModel[][], rows: number, cols: number, callback: (param: MazeDataModel[][]) => void): Promise<void> {
        const total: number = rows * cols;
        let point: MazeGridPoint = { currCell: { row: random(0, rows - 1, false), col: random(0, cols - 1, false) }, nextCell: { row: -1, col: -1 } }, index: number, count: number = 1;

        while (count < total) {
            this.neighbors = await this._service.findFitNeighbors(source, rows, cols, point.currCell, this.neighbors);

            if (this.neighbors.length > 0) {
                count += 1;

                this.neighbors.forEach(neighbor => {
                    if (!this._service.existed(this.unvisited, neighbor)) {
                        this.unvisited.push(neighbor);
                    }
                });

                point.nextCell = this.neighbors[this.neighbors.length === 1 ? 0 : random(0, this.neighbors.length - 1, false)];

                source[point.nextCell.row][point.nextCell.col].visited = true;
                source = await this._service.mergeWall(source, point.currCell, point.nextCell);

                for (let i = 0, length = this.unvisited.length; i < length; i++) {
                    source[this.unvisited[i].row][this.unvisited[i].col].color = ACCENT_COLOR;
                }

                source[point.currCell.row][point.currCell.col].color = PRIMARY_COLOR;
                source[point.nextCell.row][point.nextCell.col].color = SECONDARY_COLOR;
                callback(source);

                await delay(MAZE_DELAY_DURATION);

                for (let i = 0, length = this.unvisited.length; i < length; i++) {
                    source[this.unvisited[i].row][this.unvisited[i].col].color = EMPTY_COLOR;
                }

                source[point.currCell.row][point.currCell.col].color = EMPTY_COLOR;
                source[point.nextCell.row][point.nextCell.col].color = EMPTY_COLOR;
                callback(source);
            } else {
                index = this.unvisited.length === 1 ? 0 : random(0, this.unvisited.length - 1, false);
                point.currCell = this.unvisited.splice(index, 1)[0];
            }
        }

        this.unvisited.splice(0);
        this.neighbors.splice(0);
    }

    private async runOneByDepthFirst(source: MazeDataModel[][], rows: number, cols: number, callback: (param: MazeDataModel[][]) => void): Promise<void> {
        const total: number = rows * cols;
        let point: MazeGridPoint = { currCell: { row: random(0, rows - 1, false), col: random(0, cols - 1, false) }, nextCell: { row: -1, col: -1 } }, index: number, count: number = 0;

        while (count < total) {
            this.neighbors = await this._service.findFitNeighbors(source, rows, cols, point.currCell, this.neighbors);

            if (this.neighbors.length > 0) {
                count += 1;

                point.nextCell = this.neighbors[this.neighbors.length === 1 ? 0 : random(0, this.neighbors.length - 1, false)];

                if (!this._service.existed(this.visited, point.nextCell)) {
                    this.visited.push(point.nextCell);
                }

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
                index = this.visited.length === 1 ? 0 : random(0, this.visited.length - 1, false);
                point.currCell = this.visited.splice(index, 1)[0];
            }
        }    

        this.visited.splice(0);
        this.neighbors.splice(0);
    }

    private async runAllByBreadthFirst(source: MazeDataModel[][], rows: number, cols: number, callback: (param: MazeDataModel[][]) => void): Promise<void> {
        const total: number = rows * cols, scale: number = this._service.calcLCM(floor(Math.log2(total), 0), 3);
        let index: number = 0, threshold: number = 1, count: number = 0;

        for (let i = 0; i < scale; i++) {
            this.points.push({ currCell: { row: -1, col: -1 }, nextCell: { row: -1, col: -1 } });
            this.flags.push(false);
        }

        this.points[0].currCell = { row: random(0, rows - 1, false), col: random(0, cols - 1, false) };
        
        while (count < total) {
            for (let i = 0; i < threshold; i++) {
                if (this.points[i].currCell && this.points[i].currCell.row === -1 && this.points[i].currCell.col === -1) {
                    index = this.unvisited.length === 1 ? 0 : random(0, this.unvisited.length - 1, false);
                    this.points[i].currCell = this.unvisited.splice(index, 1)[0];
                }

                this.neighbors = await this._service.findFitNeighbors(source, rows, cols, this.points[i].currCell, this.neighbors);

                if (this.neighbors.length > 0) {
                    this.flags[i] = true;
                    count += 1;

                    this.neighbors.forEach(neighbor => {
                        if (!this._service.existed(this.unvisited, neighbor)) {
                            this.unvisited.push(neighbor);
                        }
                    });

                    this.points[i].nextCell = this.neighbors[this.neighbors.length === 1 ? 0 : random(0, this.neighbors.length - 1, false)];

                    source[this.points[i].nextCell.row][this.points[i].nextCell.col].visited = true;
                    source = await this._service.mergeWall(source, this.points[i].currCell, this.points[i].nextCell);
                } else {
                    this.flags[i] = false;

                    index = this.unvisited.length === 1 ? 0 : random(0, this.unvisited.length - 1, false);
                    this.points[i].currCell = this.unvisited.splice(index, 1)[0];
                }
            }

            for (let i = 0, length = this.unvisited.length; i < length; i++) {
                source[this.unvisited[i].row][this.unvisited[i].col].color = ACCENT_COLOR;
            }

            await this._service.colorCells(source, this.points, this.flags, threshold, callback);

            await delay(MAZE_DELAY_DURATION);

            for (let i = 0, length = this.unvisited.length; i < length; i++) {
                source[this.unvisited[i].row][this.unvisited[i].col].color = EMPTY_COLOR;
            }

            await this._service.clearCells(source, this.points, this.flags, threshold, callback);

            threshold = Math.min(threshold + 1, scale);
        }

        this.unvisited.splice(0);
        this.flags.splice(0);
        this.points.splice(0);
        this.neighbors.splice(0);
    }

    private async runAllByDepthFirst(source: MazeDataModel[][], rows: number, cols: number, callback: (param: MazeDataModel[][]) => void): Promise<void> {
        const total: number = rows * cols, scale: number = this._service.calcLCM(floor(Math.log2(total), 0), 3);
        let index: number = 0, threshold: number = 1, count: number = 0;

        for (let i = 0; i < scale; i++) {
            this.points.push({ currCell: { row: -1, col: -1 }, nextCell: { row: -1, col: -1 } });
            this.flags.push(false);
        }

        this.points[0].currCell = { row: random(0, rows - 1, false), col: random(0, cols - 1, false) };

        while (count < total) {
            for (let i = 0; i < threshold; i++) {
                if (this.points[i].currCell) {
                    if (this.points[i].currCell.row === -1 && this.points[i].currCell.col === -1) {
                        index = this.visited.length === 1 ? 0 : random(0, this.visited.length - 1, false);
                        this.points[i].currCell = this.visited.splice(index, 1)[0];
                    }

                    if (!source[this.points[i].currCell.row][this.points[i].currCell.col].visited) {
                        count += 1;

                        source[this.points[i].currCell.row][this.points[i].currCell.col].visited = true;
    
                        if (!this._service.existed(this.visited, this.points[i].currCell)) {
                            this.visited.push(this.points[i].currCell);
                        }
                    }
                }
                
                this.neighbors = await this._service.findFitNeighbors(source, rows, cols, this.points[i].currCell, this.neighbors);
                
                if (this.neighbors.length > 0) {
                    this.flags[i] = true;
                    count += 1;
    
                    this.points[i].nextCell = this.neighbors[this.neighbors.length === 1 ? 0 : random(0, this.neighbors.length - 1, false)];
    
                    if (!this._service.existed(this.visited, this.points[i].nextCell)) {
                        this.visited.push(this.points[i].nextCell);
                    }
    
                    source[this.points[i].nextCell.row][this.points[i].nextCell.col].visited = true;
                    source = await this._service.mergeWall(source, this.points[i].currCell, this.points[i].nextCell);
                } else {
                    this.flags[i] = false;

                    index = this.visited.length === 1 ? 0 : random(0, this.visited.length - 1, false);
                    this.points[i].currCell = this.visited.splice(index, 1)[0];
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
            
            threshold = Math.min(threshold + 1, scale);
        }    

        this.visited.splice(0);
        this.flags.splice(0);
        this.points.splice(0);
        this.neighbors.splice(0);
    }

}
