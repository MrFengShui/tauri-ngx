import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { floor, random } from "lodash";

import { MazeToolsService } from "../ngrx-store/maze.service";
import { MazeCellModel, MazeGridPoint, MazeRunType } from "../ngrx-store/maze.state";
import { delay, MAZE_DELAY_DURATION } from "../maze.utils";
import { MazeGridCell } from "../ngrx-store/maze.state";
import { ACCENT_COLOR, ACCENT_ONE_COLOR, ACCENT_TWO_COLOR, EMPTY_COLOR, FINAL_COLOR, PRIMARY_COLOR, PRIMARY_ONE_COLOR, PRIMARY_TWO_COLOR, SECONDARY_COLOR, SECONDARY_ONE_COLOR, SECONDARY_TWO_COLOR } from "../../../public/values.utils";

/**
 * 猎杀算法
 */
@Injectable()
export class MazeGenerationHuntAndKillService {

    private points: MazeGridPoint[] = Array.from([]);
    private origins: MazeGridCell[] = Array.from([]);
    private neighbors: MazeGridCell[] = Array.from([]);

    constructor(private _service: MazeToolsService) {}

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
        const total: number = rows * cols;
        let currPoint: MazeGridCell = { row: random(0, rows - 1, false), col: random(0, cols - 1, false) }, nextPoint: MazeGridCell = { row: -1, col: -1 }, count: number = 1;

        source[currPoint.row][currPoint.col].visited = true;

        while (count < total) {
            this.neighbors = await this._service.findFitNeighbors(source, rows, cols, currPoint, this.neighbors);

            if (this.neighbors.length > 0) {
                count += 1;

                nextPoint = this.neighbors[this.neighbors.length === 1 ? 0 : random(0, this.neighbors.length - 1, false)];
                source[nextPoint.row][nextPoint.col].visited = true;

                source = await this._service.mergeWall(source, currPoint, nextPoint);

                source[currPoint.row][currPoint.col].color = PRIMARY_COLOR;
                source[nextPoint.row][nextPoint.col].color = SECONDARY_COLOR;
                callback(source);

                await delay(MAZE_DELAY_DURATION);

                source[currPoint.row][currPoint.col].color = EMPTY_COLOR;
                source[nextPoint.row][nextPoint.col].color = EMPTY_COLOR;
                callback(source);

                currPoint = nextPoint;
            } else {
                count = await this.scan(source, rows, cols, currPoint, nextPoint, count, callback);
            }
        }

        this.neighbors.splice(0);
    }

    private async runByAll(source: MazeCellModel[][], rows: number, cols: number, callback: (param: MazeCellModel[][]) => void): Promise<void> {
        const total: number = rows * cols, threshold: number = floor(Math.log2(total));
        let count: number = 0;

        for (let i = 0; i < threshold; i++) {
            this.points.push({ currCell: { row: random(0, rows - 1, false), col: random(0, cols - 1, false) }, nextCell: { row: -1, col: -1 } });
            this.origins.push({ row: -1, col: -1 });
        }

        while (count < total) {
            for (let i = 0; i < threshold; i++) {
                this.neighbors = await this._service.findFitNeighbors(source, rows, cols, this.points[i].currCell, this.neighbors);

                if (this.neighbors.length > 0) {
                    count += 1;

                    this.points[i].nextCell = this.neighbors[this.neighbors.length === 1 ? 0 : random(0, this.neighbors.length - 1, false)];
                    source[this.points[i].nextCell.row][this.points[i].nextCell.col].visited = true;
    
                    source = await this._service.mergeWall(source, this.points[i].currCell, this.points[i].nextCell);
    
                    this.points[i].currCell = this.points[i].nextCell;
                } else {
                    this.origins.forEach((origin, index) => {
                        origin.row = this.points[index].currCell.row;
                        origin.col = this.points[index].currCell.col;
                    });
                    count = await this.scan(source, rows, cols, this.points[i].currCell, this.points[i].nextCell, count, callback);
                    this.points.forEach((point, index) => {
                        if (index !== i) {
                            point.currCell.row = this.origins[index].row;
                            point.currCell.col = this.origins[index].col;
                        }
                    });
                }
            }
            // console.info('count:', count, 'total:', total);
            for (let i = 0; i < threshold; i++) {
                if (i % 3 === 1) {
                    source[this.points[i].currCell.row][this.points[i].currCell.col].color = ACCENT_ONE_COLOR;
                } else if (i % 3 === 2) {
                    source[this.points[i].currCell.row][this.points[i].currCell.col].color = ACCENT_TWO_COLOR;
                } else {
                    source[this.points[i].currCell.row][this.points[i].currCell.col].color = ACCENT_COLOR;
                }
            }
            
            callback(source);
    
            await delay(MAZE_DELAY_DURATION);

            for (let i = 0; i < threshold; i++) {
                source[this.points[i].currCell.row][this.points[i].currCell.col].color = EMPTY_COLOR;
            }

            callback(source);
        }

        this.points.splice(0);
        this.origins.splice(0);
        this.neighbors.splice(0);
    }

    private async scan(source: MazeCellModel[][], rows: number, cols: number, currPoint: MazeGridCell, nextPoint: MazeGridCell,  count: number, callback: (param: MazeCellModel[][]) => void): Promise<number> {
        let flag = true;

        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                currPoint.row = row;
                currPoint.col = col;

                if (!source[row][col].visited) {
                    this.neighbors = await this._service.findAnyNeighbors(source, rows, cols, currPoint, this.neighbors);
                    this.neighbors = this.neighbors.filter(neighbor => source[neighbor.row][neighbor.col].visited);

                    if (this.neighbors.length > 0) {
                        flag = false;
                        break;
                    }
                }
            }

            if (!flag) break;

            source[row].forEach(col => col.color = ACCENT_COLOR);
            callback(source);

            await delay(MAZE_DELAY_DURATION);

            source[row].forEach(col => col.color = EMPTY_COLOR);
            callback(source);

            flag = true;
        }

        if (!flag) {
            count += 1;

            nextPoint = this.neighbors[this.neighbors.length === 1 ? 0 : random(0, this.neighbors.length - 1, false)];

            source[nextPoint.row][nextPoint.col].visited = true;
            source[currPoint.row][currPoint.col].visited = true;

            await this._service.mergeWall(source, currPoint, nextPoint);

            source[currPoint.row][currPoint.col].color = PRIMARY_COLOR;
            source[nextPoint.row][nextPoint.col].color = SECONDARY_COLOR;
            callback(source);

            await delay(MAZE_DELAY_DURATION);

            source[currPoint.row][currPoint.col].color = EMPTY_COLOR;
            source[nextPoint.row][nextPoint.col].color = EMPTY_COLOR;
            callback(source);
        }

        return count;
    }

}

