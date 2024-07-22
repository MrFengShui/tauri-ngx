import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { random } from "lodash";

import { MazeToolsService } from "../ngrx-store/maze.service";
import { MazeCellModel } from "../ngrx-store/maze.state";
import { delay, MAZE_DELAY_DURATION } from "../maze.utils";
import { MazeGridXY } from "../ngrx-store/maze.state";
import { ACCENT_COLOR, EMPTY_COLOR, PRIMARY_COLOR, SECONDARY_COLOR } from "../../../public/values.utils";

/**
 * 随机Wilson算法
 */
@Injectable()
export class MazeGenerationWilsonService {

    private cache: MazeGridXY[] = Array.from([]);
    private visited: MazeGridXY[] = Array.from([]);
    private unvisited: MazeGridXY[] = Array.from([]);
    private neighbors: MazeGridXY[] = Array.from([]);

    constructor(private _service: MazeToolsService) {}

    public maze(source: MazeCellModel[][], rows: number, cols: number): Observable<MazeCellModel[][]> {
        return new Observable(subscriber => {
            this.run(source, rows, cols, param => subscriber.next(param)).then(() => subscriber.complete());
        });
    }

    private async run(source: MazeCellModel[][], rows: number, cols: number, callback: (param: MazeCellModel[][]) => void): Promise<void> {
        let origin: MazeGridXY, index: number;

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

    private async seekPath(source: MazeCellModel[][], rows: number, cols: number, origin: MazeGridXY, callback: (param: MazeCellModel[][]) => void): Promise<void> {
        let currPoint: MazeGridXY = origin, nextPoint: MazeGridXY = { row: -1, col: -1 };

        while (true) {
            this.neighbors = await this._service.findAnyNeighbors(source, rows, cols, currPoint, this.neighbors);

            if (this.neighbors.length > 0) {
                nextPoint = this.neighbors[this.neighbors.length === 1 ? 0 : random(0, this.neighbors.length - 1, false)];

                source = await this._service.direct(source, currPoint, nextPoint);
            }
            
            if (source[nextPoint.row][nextPoint.col].visited) break;

            for (let i = 0, length = this.visited.length; i < length; i++) {
                source[this.visited[i].row][this.visited[i].col].color = PRIMARY_COLOR;
            }
            
            source[origin.row][origin.col].color = SECONDARY_COLOR;
            source[currPoint.row][currPoint.col].color = ACCENT_COLOR;
            callback(source);

            await delay(MAZE_DELAY_DURATION);

            for (let i = 0, length = this.visited.length; i < length; i++) {
                source[this.visited[i].row][this.visited[i].col].color = PRIMARY_COLOR;
            }
            
            source[origin.row][origin.col].color = SECONDARY_COLOR;
            source[currPoint.row][currPoint.col].color = EMPTY_COLOR;
            callback(source);

            currPoint = nextPoint;
        }
    }

    private async markPath(source: MazeCellModel[][], origin: MazeGridXY, callback: (param: MazeCellModel[][]) => void): Promise<void> {
        let currPoint: MazeGridXY = origin, nextPoint: MazeGridXY = { row: -1, col: -1 };

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

    private async rebalance(source: MazeCellModel[][]): Promise<void> {
        let point: MazeGridXY, index: number;

        this.cache.splice(0);

        for (let i = 0, length = this.unvisited.length; i < length; i++) {
            point = this.unvisited[i];
            source[point.row][point.col].direction = null;

            if (source[point.row][point.col].visited) {
                this.visited.push(point);
                this.cache.push(point);
            }
        }

        while (true) {
            point = this.cache.pop() as MazeGridXY;
            index = this._service.indexOf(this.unvisited, point);

            if (index > -1) {
                this.unvisited.splice(index, 1);
            } else {
                break;
            }
        }
    }

}
