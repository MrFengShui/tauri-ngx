import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { floor, random } from "lodash";

import { MazeToolsService } from "../ngrx-store/maze.service";
import { MazeCellModel, MazeGridPoint, MazeRunType } from "../ngrx-store/maze.state";
import { delay, MAZE_DELAY_DURATION } from "../maze.utils";
import { MazeGridXY } from "../ngrx-store/maze.state";
import { EMPTY_COLOR, PRIMARY_COLOR, PRIMARY_ONE_COLOR, PRIMARY_TWO_COLOR, SECONDARY_COLOR, SECONDARY_ONE_COLOR, SECONDARY_TWO_COLOR } from "../../../public/values.utils";

/**
 * Aldous-Broder算法
 */
@Injectable()
export class MazeGenerationAldousBroderService {

    private cache: MazeGridXY[] = Array.from([]);
    private point: MazeGridPoint[] = Array.from([]);
    private neighbors: MazeGridXY[] = Array.from([]);

    constructor(private _service: MazeToolsService) { }

    public maze(source: MazeCellModel[][], rows: number, cols: number, type: MazeRunType): Observable<MazeCellModel[][]> {
        return new Observable(subscriber => {
            if (type === 'one') {
                this.runByOne(source, rows, cols, param => subscriber.next(param)).then(() => subscriber.complete());
            }
            
            if (type === 'all') {
                this.runByAll(source, rows, cols, param => subscriber.next(param)).then(() => subscriber.complete());
            }
        });
    }

    private async runByOne(source: MazeCellModel[][], rows: number, cols: number, callback: (param: MazeCellModel[][]) => void): Promise<void> {
        const length: number = rows * cols;
        let currPoint: MazeGridXY = { row: random(0, rows - 1, false), col: random(0, cols - 1, false) }, nextPoint: MazeGridXY = { row: -1, col: -1 };

        while (this.cache.length < length) {
            this.neighbors = await this._service.findAnyNeighbors(source, rows, cols, currPoint, this.neighbors);

            if (this.neighbors.length > 0) {
                nextPoint = this.neighbors[this.neighbors.length === 1 ? 0 : random(0, this.neighbors.length - 1, false)];

                if (!source[nextPoint.row][nextPoint.col].visited) {
                    if (!this._service.existed(this.cache, nextPoint)) {
                        this.cache.push(nextPoint);
                    }

                    source[nextPoint.row][nextPoint.col].visited = true;
                    source = await this._service.mergeWall(source, currPoint, nextPoint);
                }
            }

            source[currPoint.row][currPoint.col].color = PRIMARY_COLOR;
            source[nextPoint.row][nextPoint.col].color = SECONDARY_COLOR;
            callback(source);

            await delay(MAZE_DELAY_DURATION);

            source[currPoint.row][currPoint.col].color = EMPTY_COLOR;
            source[nextPoint.row][nextPoint.col].color = EMPTY_COLOR;
            callback(source);

            currPoint = nextPoint;
        }

        this.cache.splice(0);
        this.neighbors.splice(0);
    }

    private async runByAll(source: MazeCellModel[][], rows: number, cols: number, callback: (param: MazeCellModel[][]) => void): Promise<void> {
        const length: number = rows * cols, scale: number = floor(Math.log2(length)) * 3, count: number = Math.max(scale, 3);
        let origin: MazeGridXY = { row: random(floor(rows * 0.25, 0), floor(rows * 0.75, 0), false), col: random(floor(cols * 0.25, 0), floor(cols * 0.75, 0), false) }, threshold: number;

        for (let i = 0; i < count; i++) {
            this.point.push({ currPoint: origin, nextPoint: { row: -1, col: -1 } });
        }

        threshold = Math.min(count, 1);

        while (this.cache.length < length) {
            for (let i = 0; i < threshold; i++) {
                this.neighbors = await this._service.findAnyNeighbors(source, rows, cols, this.point[i].currPoint, this.neighbors);
                
                if (this.neighbors.length > 0) {
                    this.point[i].nextPoint = this.neighbors[this.neighbors.length === 1 ? 0 : random(0, this.neighbors.length - 1, false)];
                    
                    if (!source[this.point[i].nextPoint.row][this.point[i].nextPoint.col].visited) {
                        if (!this._service.existed(this.cache, this.point[i].nextPoint)) {
                            this.cache.push(this.point[i].nextPoint);
                        }
                        
                        source[this.point[i].nextPoint.row][this.point[i].nextPoint.col].visited = true;
                        source = await this._service.mergeWall(source, this.point[i].currPoint, this.point[i].nextPoint);
                    }
                }
            }
            
            for (let i = 0; i < threshold; i++) {
                if (i % 3 === 1) {
                    source[this.point[i].currPoint.row][this.point[i].currPoint.col].color = PRIMARY_ONE_COLOR;
                    source[this.point[i].nextPoint.row][this.point[i].nextPoint.col].color = SECONDARY_ONE_COLOR;
                } else if (i % 3 === 2) {
                    source[this.point[i].currPoint.row][this.point[i].currPoint.col].color = PRIMARY_TWO_COLOR;
                    source[this.point[i].nextPoint.row][this.point[i].nextPoint.col].color = SECONDARY_TWO_COLOR;
                } else {
                    source[this.point[i].currPoint.row][this.point[i].currPoint.col].color = PRIMARY_COLOR;
                    source[this.point[i].nextPoint.row][this.point[i].nextPoint.col].color = SECONDARY_COLOR;
                }
            }

            callback(source);

            await delay(MAZE_DELAY_DURATION);

            for (let i = 0; i < threshold; i++) {
                source[this.point[i].currPoint.row][this.point[i].currPoint.col].color = EMPTY_COLOR;
                source[this.point[i].nextPoint.row][this.point[i].nextPoint.col].color = EMPTY_COLOR;
            }

            callback(source);

            for (let i = 0; i < threshold; i++) {
                this.point[i].currPoint = this.point[i].nextPoint;
            }
            
            threshold = Math.min(count, this.cache.length);
        }

        this.cache.splice(0);
        this.point.splice(0);
        this.neighbors.splice(0);
    }

}
