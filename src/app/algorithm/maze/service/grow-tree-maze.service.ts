import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { floor, random } from "lodash";

import { MazeToolsService } from "../ngrx-store/maze.service";
import { MazeCellModel, MazeGridPoint, MazeRunType } from "../ngrx-store/maze.state";
import { delay, MAZE_DELAY_DURATION } from "../maze.utils";
import { MazeGridXY } from "../ngrx-store/maze.state";
import { ACCENT_COLOR, ACCENT_ONE_COLOR, ACCENT_TWO_COLOR, EMPTY_COLOR, PRIMARY_COLOR, PRIMARY_ONE_COLOR, PRIMARY_TWO_COLOR, SECONDARY_COLOR, SECONDARY_ONE_COLOR, SECONDARY_TWO_COLOR } from "../../../public/values.utils";

/**
 * 增长树算法
 */
@Injectable()
export class MazeGenerationGrowTreeService {

    private caches: MazeGridXY[][] = Array.from([]);
    private cache: MazeGridXY[] = Array.from([]);
    private point: MazeGridPoint[] = Array.from([]);
    private neighbors: MazeGridXY[] = Array.from([]);

    constructor(private _service: MazeToolsService) {}

    public maze(source: MazeCellModel[][], rows: number, cols: number, name: 'depth-first-growing-tree' | 'parallel-depth-first-growing-tree' | 'breadth-first-growing-tree' | 'parallel-breadth-first-growing-tree', type: MazeRunType): Observable<MazeCellModel[][]> {
        return new Observable(subscriber => {
            if (name === 'breadth-first-growing-tree') {
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

    private async runByBreadthFirst(source: MazeCellModel[][], rows: number, cols: number, callback: (param: MazeCellModel[][]) => void): Promise<void> {
        let currPoint: MazeGridXY = { row: random(0, rows - 1, false), col: random(0, cols - 1, false) }, nextPoint: MazeGridXY = { row: -1, col: -1 }, index: number;

        this.cache.push(currPoint);

        while (this.cache.length > 0) {
            this.neighbors = await this._service.findFitNeighbors(source, rows, cols, currPoint, this.neighbors);

            if (this.neighbors.length > 0) {
                this.neighbors.forEach(neighbor => {
                    if (!this._service.existed(this.cache, neighbor)) {
                        this.cache.push(neighbor);
                    }
                });

                nextPoint = this.neighbors[this.neighbors.length === 1 ? 0 : random(0, this.neighbors.length - 1, false)];

                source[nextPoint.row][nextPoint.col].visited = true;

                source = await this._service.mergeWall(source, currPoint, nextPoint);

                this.cache.forEach(item => source[item.row][item.col].color = ACCENT_COLOR);
                source[currPoint.row][currPoint.col].color = PRIMARY_COLOR;
                source[nextPoint.row][nextPoint.col].color = SECONDARY_COLOR;
                callback(source);

                await delay(MAZE_DELAY_DURATION);

                this.cache.forEach(item => source[item.row][item.col].color = EMPTY_COLOR);
                source[currPoint.row][currPoint.col].color = EMPTY_COLOR;
                source[nextPoint.row][nextPoint.col].color = EMPTY_COLOR;
                callback(source);
            } else {
                index = this.cache.length === 1 ? 0 : random(0, this.cache.length - 1, false);
                currPoint = this.cache.splice(index, 1)[0];
            }
        }

        this.cache.splice(0);
        this.neighbors.splice(0);
    }

    private async runOneByDepthFirst(source: MazeCellModel[][], rows: number, cols: number, callback: (param: MazeCellModel[][]) => void): Promise<void> {
        let currPoint: MazeGridXY = { row: random(0, rows - 1, false), col: random(0, cols - 1, false) }, nextPoint: MazeGridXY = { row: -1, col: -1 }, index: number;

        this.cache.push(currPoint);

        while (this.cache.length > 0) {
            this.neighbors = await this._service.findFitNeighbors(source, rows, cols, currPoint, this.neighbors);

            if (this.neighbors.length > 0) {
                nextPoint = this.neighbors[this.neighbors.length === 1 ? 0 : random(0, this.neighbors.length - 1, false)];

                if (!this._service.existed(this.cache, nextPoint)) {
                    this.cache.push(nextPoint);

                    source[nextPoint.row][nextPoint.col].visited = true;

                    source = await this._service.mergeWall(source, currPoint, nextPoint);
                }

                this.cache.forEach(item => source[item.row][item.col].color = ACCENT_COLOR);
                source[currPoint.row][currPoint.col].color = PRIMARY_COLOR;
                source[nextPoint.row][nextPoint.col].color = SECONDARY_COLOR;
                callback(source);

                await delay(MAZE_DELAY_DURATION);

                this.cache.forEach(item => source[item.row][item.col].color = EMPTY_COLOR);
                source[currPoint.row][currPoint.col].color = EMPTY_COLOR;
                source[nextPoint.row][nextPoint.col].color = EMPTY_COLOR;
                callback(source);

                currPoint = nextPoint;
            } else {
                index = this.cache.length === 1 ? 0 : random(0, this.cache.length - 1, false);
                currPoint = this.cache.splice(index, 1)[0];
            }
        }    

        this.cache.splice(0);
        this.neighbors.splice(0);
    }

    private async runAllByBreadthFirst(source: MazeCellModel[][], rows: number, cols: number, callback: (param: MazeCellModel[][]) => void): Promise<void> {
        const origin: MazeGridXY = { row: random(0, rows - 1, false), col: random(0, cols - 1, false) }, scale: number = floor(Math.log2(rows * cols)) * 3, count: number = Math.max(scale, 3);
        let index: number = 0, threshold: number, flag: boolean = false;

                

        this.cache.splice(0);
        this.point.splice(0);
        this.neighbors.splice(0);
    }

    private async runAllByDepthFirst(source: MazeCellModel[][], rows: number, cols: number, callback: (param: MazeCellModel[][]) => void): Promise<void> {
        const origin: MazeGridXY = { row: random(0, rows - 1, false), col: random(0, cols - 1, false) }, scale: number = floor(Math.log2(rows * cols)) * 3, count: number = Math.max(scale, 3);
        let index: number = 0, threshold: number, flag: boolean = false;

                

        this.cache.splice(0);
        this.point.splice(0);
        this.neighbors.splice(0);
    }

}
