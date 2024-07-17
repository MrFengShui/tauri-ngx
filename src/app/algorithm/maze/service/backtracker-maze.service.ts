import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { floor, random } from "lodash";

import { MazeToolsService } from "../ngrx-store/maze.service";
import { MazeCellModel } from "../ngrx-store/maze.state";
import { delay, MAZE_DELAY_DURATION } from "../maze.utils";
import { MazeGridXY } from "../ngrx-store/maze.state";
import { ACCENT_COLOR, ACCENT_ONE_COLOR, ACCENT_TWO_COLOR, EMPTY_COLOR, PRIMARY_COLOR, PRIMARY_ONE_COLOR, PRIMARY_TWO_COLOR, SECONDARY_COLOR, SECONDARY_ONE_COLOR, SECONDARY_TWO_COLOR } from "../../../public/values.utils";


/**
 * 随机回溯算法
 */
@Injectable()
export class MazeGenerationRandomizedBacktrackerService {

    constructor(private _service: MazeToolsService) {}

    public maze(source: MazeCellModel[][], rows: number, cols: number): Observable<MazeCellModel[][]> {
        return new Observable(subscriber => {
            this.run(source, rows, cols, param => subscriber.next(param)).then(() => subscriber.complete());
        });
    }

    private async run(source: MazeCellModel[][], rows: number, cols: number, callback: (param: MazeCellModel[][]) => void): Promise<void> {
        const stack: MazeGridXY[] = Array.from([]);
        let currPoint: MazeGridXY = { row: random(0, rows - 1, false), col: random(0, cols - 1, false) }, nextPoint: MazeGridXY = { row: -1, col: -1 }, neighbors: MazeGridXY[] = Array.from([]);

        stack.push(currPoint);
        
        while (stack.length > 0) {
            currPoint = stack.pop() as MazeGridXY;
            source[currPoint.row][currPoint.col].visited = true;
            
            neighbors = await this._service.findNeighbors(source, rows, cols, currPoint, neighbors);
            
            if (neighbors.length > 0) {
                stack.push(currPoint);

                nextPoint = neighbors[neighbors.length === 1 ? 0 : random(0, neighbors.length - 1)];
                stack.push(nextPoint);

                source[nextPoint.row][nextPoint.col].visited = true;
                source = await this._service.mergeWall(source, currPoint, nextPoint);
            }
            
            for (let i = 0, length = stack.length; i < length; i++) {
                if (source[stack[i].row][stack[i].col].visited) {
                    source[stack[i].row][stack[i].col].color = ACCENT_COLOR;
                } else {
                    source[stack[i].row][stack[i].col].color = EMPTY_COLOR;
                }
            }

            source[currPoint.row][currPoint.col].color = PRIMARY_COLOR;
            source[nextPoint.row][nextPoint.col].color = SECONDARY_COLOR;
            callback(source);

            await delay(MAZE_DELAY_DURATION);

            source[currPoint.row][currPoint.col].color = EMPTY_COLOR;
            source[nextPoint.row][nextPoint.col].color = EMPTY_COLOR;
            callback(source);
        }
    }

}

/**
 * 并行随机回溯算法
 */
@Injectable()
export class MazeGenerationParallelRandomizedBacktrackerService {

    constructor(private _service: MazeToolsService) {}

    public maze(source: MazeCellModel[][], rows: number, cols: number): Observable<MazeCellModel[][]> {
        return new Observable(subscriber => {
            this.run(source, rows, cols, param => subscriber.next(param)).then(() => subscriber.complete());
        });
    }

    private async run(source: MazeCellModel[][], rows: number, cols: number, callback: (param: MazeCellModel[][]) => void): Promise<void> {
        const fstStack: MazeGridXY[] = Array.from([]), sndStack: MazeGridXY[] = Array.from([]);
        let fstCurrPoint: MazeGridXY | undefined, fstNextPoint: MazeGridXY | undefined;
        let sndCurrPoint: MazeGridXY | undefined, sndNextPoint: MazeGridXY | undefined;
        let neighbors: MazeGridXY[] = Array.from([]);
        
        fstCurrPoint = { row: random(floor(rows * 0.25, 0), floor(rows * 0.75, 0)), col: random(floor(rows * 0.25, 0), floor(rows * 0.75, 0)) };
        source[fstCurrPoint.row][fstCurrPoint.col].visited = true;

        neighbors = await this._service.findNeighbors(source, rows, cols, fstCurrPoint, neighbors);

        if (neighbors.length > 0) {
            sndCurrPoint = neighbors[random(0, neighbors.length - 1)];
            source[sndCurrPoint.row][sndCurrPoint.col].visited = true;

            source = await this._service.mergeWall(source, fstCurrPoint, sndCurrPoint);

            fstStack.push(fstCurrPoint);
            sndStack.push(sndCurrPoint);
        }

        while (fstStack.length > 0 || sndStack.length > 0) {
            if (fstStack.length > 0) {
                fstCurrPoint = fstStack.pop() as MazeGridXY;
                source[fstCurrPoint.row][fstCurrPoint.col].visited = true;

                neighbors = await this._service.findNeighbors(source, rows, cols, fstCurrPoint, neighbors);

                if (neighbors.length > 0) {
                    fstStack.push(fstCurrPoint);
    
                    fstNextPoint = neighbors[neighbors.length === 1 ? 0 : random(0, neighbors.length - 1)];
                    fstStack.push(fstNextPoint);
    
                    source[fstNextPoint.row][fstNextPoint.col].visited = true;
                    source = await this._service.mergeWall(source, fstCurrPoint, fstNextPoint);
                }
            } else {
                if (fstCurrPoint && sndCurrPoint) {
                    neighbors = await this._service.findNeighbors(source, rows, cols, sndCurrPoint, neighbors);

                    if (neighbors.length > 0) {
                        source[fstCurrPoint.row][fstCurrPoint.col].color = EMPTY_COLOR;

                        fstCurrPoint = neighbors[neighbors.length === 1 ? 0 : random(0, neighbors.length - 1)];
                        source[fstCurrPoint.row][fstCurrPoint.col].visited = true;

                        source = await this._service.mergeWall(source, fstCurrPoint, sndCurrPoint);

                        fstStack.push(fstCurrPoint);
                    }
                }
            }

            if (sndStack.length > 0) {
                sndCurrPoint = sndStack.pop() as MazeGridXY;
                source[sndCurrPoint.row][sndCurrPoint.col].visited = true;

                neighbors = await this._service.findNeighbors(source, rows, cols, sndCurrPoint, neighbors);

                if (neighbors.length > 0) {
                    sndStack.push(sndCurrPoint);
    
                    sndNextPoint = neighbors[neighbors.length === 1 ? 0 : random(0, neighbors.length - 1)];
                    sndStack.push(sndNextPoint);
    
                    source[sndNextPoint.row][sndNextPoint.col].visited = true;
                    source = await this._service.mergeWall(source, sndCurrPoint, sndNextPoint);
                }
            } else {
                if (fstCurrPoint && sndCurrPoint) {
                    neighbors = await this._service.findNeighbors(source, rows, cols, fstCurrPoint, neighbors);
                    
                    if (neighbors.length > 0) {
                        source[sndCurrPoint.row][sndCurrPoint.col].color = EMPTY_COLOR;

                        sndCurrPoint = neighbors[neighbors.length === 1 ? 0 : random(0, neighbors.length - 1)];
                        source[sndCurrPoint.row][sndCurrPoint.col].visited = true;

                        source = await this._service.mergeWall(source, sndCurrPoint, fstCurrPoint);

                        sndStack.push(sndCurrPoint);
                    }
                }
            }

            if (fstCurrPoint && fstNextPoint && sndCurrPoint && sndNextPoint) {
                for (let i = 0, length = fstStack.length; i < length; i++) {
                    if (source[fstStack[i].row][fstStack[i].col].visited) {
                        source[fstStack[i].row][fstStack[i].col].color = ACCENT_ONE_COLOR;
                    } else {
                        source[fstStack[i].row][fstStack[i].col].color = EMPTY_COLOR;
                    }
                }

                for (let i = 0, length = sndStack.length; i < length; i++) {
                    if (source[sndStack[i].row][sndStack[i].col].visited) {
                        source[sndStack[i].row][sndStack[i].col].color = ACCENT_TWO_COLOR;
                    } else {
                        source[sndStack[i].row][sndStack[i].col].color = EMPTY_COLOR;
                    }
                }

                source[fstCurrPoint.row][fstCurrPoint.col].color = PRIMARY_ONE_COLOR;
                source[fstNextPoint.row][fstNextPoint.col].color = SECONDARY_ONE_COLOR;
                source[sndCurrPoint.row][sndCurrPoint.col].color = PRIMARY_TWO_COLOR;
                source[sndNextPoint.row][sndNextPoint.col].color = SECONDARY_TWO_COLOR;
                callback(source);

                await delay(MAZE_DELAY_DURATION);

                source[fstCurrPoint.row][fstCurrPoint.col].color = EMPTY_COLOR;
                source[fstNextPoint.row][fstNextPoint.col].color = EMPTY_COLOR;
                source[sndCurrPoint.row][sndCurrPoint.col].color = EMPTY_COLOR;
                source[sndNextPoint.row][sndNextPoint.col].color = EMPTY_COLOR;
                callback(source);
            }
        }
    }

}