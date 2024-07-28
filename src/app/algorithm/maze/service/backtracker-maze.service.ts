import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { floor, random } from "lodash";

import { MazeToolsService } from "../ngrx-store/maze.service";
import { MazeDataModel, MazeGridPoint, MazeRunType } from "../ngrx-store/maze.state";
import { delay, MAZE_DELAY_DURATION } from "../maze.utils";
import { MazeGridCell } from "../ngrx-store/maze.state";
import { ACCENT_COLOR, EMPTY_COLOR, PRIMARY_COLOR, SECONDARY_COLOR } from "../../../public/values.utils";

/**
 * 随机回溯算法
 */
@Injectable()
export class MazeGenerationRandomizedBacktrackerService {

    private flags: boolean[] = Array.from([]);
    private points: MazeGridPoint[] = Array.from([]);
    private stacks: MazeGridCell[][] = Array.from([]);
    private cacheStacks: MazeGridCell[][] = Array.from([]);
    private cacheStack: MazeGridCell[] = Array.from([]);
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
        const stack: MazeGridCell[] = Array.from([]);
        let point: MazeGridPoint = { currCell: { row: -1, col: -1 }, nextCell: { row: -1, col: -1 } }, cell: MazeGridCell;

        stack.push({ row: random(0, rows - 1, false), col: random(0, cols - 1, false) });
        
        while (stack.length > 0) {
            point.currCell = stack.pop() as MazeGridCell;
            source[point.currCell.row][point.currCell.col].visited = true;
            
            this.neighbors = await this._service.findFitNeighbors(source, rows, cols, point.currCell, this.neighbors);
            
            if (this.neighbors.length > 0) {
                stack.push(point.currCell);

                point.nextCell = this.neighbors[this.neighbors.length === 1 ? 0 : random(0, this.neighbors.length - 1)];
                stack.push(point.nextCell);

                source[point.nextCell.row][point.nextCell.col].visited = true;
                source = await this._service.mergeWall(source, point.currCell, point.nextCell);
            }
            
            for (let i = 0, length = stack.length; i < length; i++) {
                cell = stack[i];

                if (source[cell.row][cell.col].visited) {
                    source[cell.row][cell.col].color = ACCENT_COLOR;
                } else {
                    source[cell.row][cell.col].color = EMPTY_COLOR;
                }
            }

            source[point.currCell.row][point.currCell.col].color = PRIMARY_COLOR;
            source[point.nextCell.row][point.nextCell.col].color = SECONDARY_COLOR;
            callback(source);

            await delay(MAZE_DELAY_DURATION);

            source[point.currCell.row][point.currCell.col].color = EMPTY_COLOR;
            source[point.nextCell.row][point.nextCell.col].color = EMPTY_COLOR;
            callback(source);
        }

        this.neighbors.splice(0);
    }

    private async runByAll(source: MazeDataModel[][], rows: number, cols: number, callback: (param: MazeDataModel[][]) => void): Promise<void> {
        const total: number = rows * cols, scale: number = this._service.calcLCM(floor(Math.log2(total), 0), 3);
        let threshold: number = 1, count: number = 1;

        for (let i = 0; i < scale; i++) {
            this.points.push({ currCell: { row: -1, col: -1 }, nextCell: { row: -1, col: -1 } });
            this.stacks.push(Array.from([]));
            this.flags.push(false);
        }

        this.stacks[0].push({ row: random(0, rows - 1, false), col: random(0, cols - 1, false) });

        while (count < total) {
            for (let i = 0; i < threshold; i++) {
                if (this.stacks[i].length === 0) {
                    this.cacheStacks = this.stacks.filter(stack => stack.length > 0);
                    this.cacheStack = this.cacheStacks[random(0, this.cacheStacks.length - 1, false)];

                    if (this.cacheStack && this.cacheStack.length > 0) {
                        this.stacks[i].push(this.cacheStack[random(0, this.cacheStack.length - 1, false)]);
                    }
                }

                this.points[i].currCell = this.stacks[i].pop() as MazeGridCell;
                this.flags[i] = false;

                if (this.points[i].currCell) {
                    source[this.points[i].currCell.row][this.points[i].currCell.col].visited = true;
                
                    this.neighbors = await this._service.findFitNeighbors(source, rows, cols, this.points[i].currCell, this.neighbors);
    
                    if (this.neighbors.length > 0) {
                        this.flags[i] = true;

                        count+= 1;
    
                        this.stacks[i].push(this.points[i].currCell);
                        
                        this.points[i].nextCell = this.neighbors[this.neighbors.length === 1 ? 0 : random(0, this.neighbors.length - 1)];
                        this.stacks[i].push(this.points[i].nextCell);
                        
                        source[this.points[i].nextCell.row][this.points[i].nextCell.col].visited = true;
                        source = await this._service.mergeWall(source, this.points[i].currCell, this.points[i].nextCell);
                    }
                }
            }

            await this._service.colorCells(source, this.points, this.flags, threshold, callback);
            await delay(MAZE_DELAY_DURATION);
            await this._service.clearCells(source, this.points, this.flags, threshold, callback);

            threshold = Math.min(threshold + 1, scale);
        }

        this.flags.splice(0);
        this.points.splice(0);
        this.stacks.splice(0);
        this.cacheStacks.forEach(stack => stack.splice(0));
        this.cacheStacks.splice(0);
        this.cacheStack.splice(0);
        this.neighbors.splice(0);
    }

}
