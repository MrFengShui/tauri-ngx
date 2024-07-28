import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { floor, random } from "lodash";

import { MazeToolsService } from "../ngrx-store/maze.service";
import { MazeDataModel, MazeGridPoint, MazeRunType } from "../ngrx-store/maze.state";
import { delay, MAZE_DELAY_DURATION } from "../maze.utils";
import { MazeGridCell } from "../ngrx-store/maze.state";
import { ACCENT_COLOR, EMPTY_COLOR, FINAL_COLOR, PRIMARY_COLOR, SECONDARY_COLOR, START_COLOR } from "../../../public/values.utils";

/**
 * 随机Wilson算法
 */
@Injectable()
export class MazeGenerationWilsonService {

    private cache: MazeGridCell[] = Array.from([]);
    private visited: MazeGridCell[] = Array.from([]);
    private unvisited: MazeGridCell[] = Array.from([]);
    private neighbors: MazeGridCell[] = Array.from([]);

    constructor(private _service: MazeToolsService) {}

    public maze(source: MazeDataModel[][], rows: number, cols: number, type: MazeRunType): Observable<MazeDataModel[][]> {
        return new Observable(subscriber => {
            if (type === null) {
                this.run(source, rows, cols, param => subscriber.next(param)).then(() => subscriber.complete());
            }

            if (type === 'opt') {
                this.runByOptimal(source, rows, cols, param => subscriber.next(param)).then(() => subscriber.complete());
            }
        });
    }

    private async run(source: MazeDataModel[][], rows: number, cols: number, callback: (param: MazeDataModel[][]) => void): Promise<void> {
        let origin: MazeGridCell, index: number;

        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                this.unvisited.push({ row, col });
            }
        }

        index = random(0, this.unvisited.length - 1, false);
        origin = this.unvisited.splice(index, 1)[0];
        this.visited.push(origin);

        source[origin.row][origin.col].visited = true;

        while (this.unvisited.length > 0) {
            origin = this.unvisited[this.unvisited.length === 1 ? 0 : random(0, this.unvisited.length - 1, false)];

            await this.seekPath(source, rows, cols, origin, callback);
            await this.markPath(source, origin, callback);
            await this.rebalance(source);

            if (this.unvisited.length === 0) {
                for (let i = 0, length = this.visited.length; i < length; i++) {
                    source[this.visited[i].row][this.visited[i].col].color = EMPTY_COLOR;
                }
        
                callback(source);
            }
        }

        this.cache.splice(0);
        this.visited.splice(0);
        this.unvisited.splice(0);
        this.neighbors.splice(0);
    }

    private async runByOptimal(source: MazeDataModel[][], rows: number, cols: number, callback: (param: MazeDataModel[][]) => void): Promise<void> {
        const length: number = rows * cols;
        let origin: MazeGridCell;

        this.visited.push({ row: random(0, rows - 1, false), col: random(0, cols - 1, false) });

        while (this.visited.length < floor(length * 0.05, 0)) {
            origin = this.visited[this.visited.length === 1 ? 0 : random(0, this.visited.length - 1, false)];
            await this.initPath(source, rows, cols, origin, callback);
        }

        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                if (!source[row][col].visited) {
                    this.unvisited.push({ row, col });
                }
            }
        }

        while (this.unvisited.length > 0) {
            origin = this.unvisited[this.unvisited.length === 1 ? 0 : random(0, this.unvisited.length - 1, false)];

            await this.seekPathByOptimal(source, rows, cols, origin, callback);
            await this.markPath(source, origin, callback);
            await this.rebalance(source);

            if (this.unvisited.length === 0) {
                for (let i = 0, length = this.visited.length; i < length; i++) {
                    source[this.visited[i].row][this.visited[i].col].color = EMPTY_COLOR;
                }
        
                callback(source);
            }
        }

        this.cache.splice(0);
        this.visited.splice(0);
        this.unvisited.splice(0);
        this.neighbors.splice(0);
    }

    private async initPath(source: MazeDataModel[][], rows: number, cols: number, origin: MazeGridCell, callback: (param: MazeDataModel[][]) => void): Promise<void> {
        let point: MazeGridPoint = { currCell: origin, nextCell: { row: -1, col: -1 } };

        source[point.currCell.row][point.currCell.col].visited = true;

        this.visited.push(point.currCell);

        while (true) {
            this.neighbors = await this._service.findFitNeighbors(source, rows, cols, point.currCell, this.neighbors);

            if (this.neighbors.length > 0) {
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
                break;
            }
        }
    }

    private async seekPath(source: MazeDataModel[][], rows: number, cols: number, origin: MazeGridCell, callback: (param: MazeDataModel[][]) => void): Promise<void> {
        let currPoint: MazeGridCell = origin, nextPoint: MazeGridCell = { row: -1, col: -1 };

        while (true) {
            this.neighbors = await this._service.findAnyNeighbors(source, rows, cols, currPoint, this.neighbors);

            if (this.neighbors.length > 0) {
                nextPoint = this.neighbors[this.neighbors.length === 1 ? 0 : random(0, this.neighbors.length - 1, false)];

                source = await this._service.direct(source, currPoint, nextPoint);
            }
            
            if (source[nextPoint.row][nextPoint.col].visited) break;

            for (let i = 0, length = this.visited.length; i < length; i++) {
                source[this.visited[i].row][this.visited[i].col].color = FINAL_COLOR;
            }
            
            source[origin.row][origin.col].color = START_COLOR;
            source[currPoint.row][currPoint.col].color = PRIMARY_COLOR;
            source[nextPoint.row][nextPoint.col].color = SECONDARY_COLOR;
            callback(source);

            await delay(MAZE_DELAY_DURATION);

            for (let i = 0, length = this.visited.length; i < length; i++) {
                source[this.visited[i].row][this.visited[i].col].color = FINAL_COLOR;
            }
            
            source[origin.row][origin.col].color = START_COLOR;
            source[currPoint.row][currPoint.col].color = PRIMARY_COLOR;
            source[nextPoint.row][nextPoint.col].color = EMPTY_COLOR;
            callback(source);

            currPoint = nextPoint;
        }
    }

    private async seekPathByOptimal(source: MazeDataModel[][], rows: number, cols: number, origin: MazeGridCell, callback: (param: MazeDataModel[][]) => void): Promise<void> {
        let currPoint: MazeGridCell = origin, nextPoint: MazeGridCell = { row: -1, col: -1 };

        while (true) {
            this.neighbors = await this._service.findAnyNeighbors(source, rows, cols, currPoint, this.neighbors);
            this.cache = this.neighbors.filter(neighbor => source[neighbor.row][neighbor.col].visited);

            nextPoint = this.cache.length > 0 
                    ? this.cache[this.cache.length === 1 ? 0 : random(0, this.cache.length - 1, false)]
                    : this.neighbors[this.neighbors.length === 1 ? 0 : random(0, this.neighbors.length - 1, false)];

            source = await this._service.direct(source, currPoint, nextPoint);
            
            if (source[nextPoint.row][nextPoint.col].visited) break;

            for (let i = 0, length = this.visited.length; i < length; i++) {
                source[this.visited[i].row][this.visited[i].col].color = FINAL_COLOR;
            }
            
            source[origin.row][origin.col].color = START_COLOR;
            source[currPoint.row][currPoint.col].color = PRIMARY_COLOR;
            source[nextPoint.row][nextPoint.col].color = SECONDARY_COLOR;
            callback(source);

            await delay(MAZE_DELAY_DURATION);

            for (let i = 0, length = this.visited.length; i < length; i++) {
                source[this.visited[i].row][this.visited[i].col].color = FINAL_COLOR;
            }
            
            source[origin.row][origin.col].color = START_COLOR;
            source[currPoint.row][currPoint.col].color = PRIMARY_COLOR;
            source[nextPoint.row][nextPoint.col].color = EMPTY_COLOR;
            callback(source);

            currPoint = nextPoint;
        }
    }

    private async markPath(source: MazeDataModel[][], origin: MazeGridCell, callback: (param: MazeDataModel[][]) => void): Promise<void> {
        let currPoint: MazeGridCell = origin, nextPoint: MazeGridCell = { row: -1, col: -1 };

        while (source[currPoint.row][currPoint.col].direction) {
            if (source[currPoint.row][currPoint.col].direction === 'u') {
                nextPoint = { row: currPoint.row - 1, col: currPoint.col };
            }

            if (source[currPoint.row][currPoint.col].direction === 'r') {
                nextPoint = { row: currPoint.row, col: currPoint.col + 1 };
            }

            if (source[currPoint.row][currPoint.col].direction === 'd') {
                nextPoint = { row: currPoint.row + 1, col: currPoint.col };
            }
            
            if (source[currPoint.row][currPoint.col].direction === 'l') {
                nextPoint = { row: currPoint.row, col: currPoint.col - 1 };
            }

            source = await this._service.mergeWall(source, currPoint, nextPoint);

            source[currPoint.row][currPoint.col].direction = null;
            source[currPoint.row][currPoint.col].visited = true;

            source[currPoint.row][currPoint.col].color = PRIMARY_COLOR;
            source[nextPoint.row][nextPoint.col].color = SECONDARY_COLOR;
            callback(source);

            await delay(MAZE_DELAY_DURATION);

            source[currPoint.row][currPoint.col].color = ACCENT_COLOR;
            source[nextPoint.row][nextPoint.col].color = EMPTY_COLOR;
            callback(source);

            currPoint = nextPoint;
        }
    }

    private async rebalance(source: MazeDataModel[][]): Promise<void> {
        let point: MazeGridCell, index: number;

        this.cache.splice(0);

        for (let i = 0, length = this.unvisited.length; i < length; i++) {
            point = this.unvisited[i];
            source[point.row][point.col].direction = null;
            source[point.row][point.col].color = EMPTY_COLOR;

            if (source[point.row][point.col].visited) {
                this.visited.push(point);
                this.cache.push(point);
            }
        }

        while (true) {
            point = this.cache.pop() as MazeGridCell;
            index = this._service.indexOf(this.unvisited, point);

            if (index > -1) {
                this.unvisited.splice(index, 1);
            } else {
                break;
            }
        }
    }

}
