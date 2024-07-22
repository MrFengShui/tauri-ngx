import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { random } from "lodash";

import { MazeToolsService } from "../ngrx-store/maze.service";
import { MazeCellModel } from "../ngrx-store/maze.state";
import { delay, MAZE_DELAY_DURATION } from "../maze.utils";
import { MazeGridXY } from "../ngrx-store/maze.state";
import { ACCENT_COLOR, EMPTY_COLOR, PRIMARY_COLOR, SECONDARY_COLOR } from "../../../public/values.utils";

/**
 * Eller算法
 */
@Injectable()
export class MazeGenerationEllerService {

    private cache: { [key: string | number]: { index: number, count: number, total: number } } = {};

    constructor(private _service: MazeToolsService) {}

    public maze(source: MazeCellModel[][], rows: number, cols: number): Observable<MazeCellModel[][]> {
        return new Observable(subscriber => {
            this.run(source, rows, cols, param => subscriber.next(param)).then(() => subscriber.complete());
        });
    }

    private async run(source: MazeCellModel[][], rows: number, cols: number, callback: (param: MazeCellModel[][]) => void): Promise<void> {
        for (let row = 0; row < rows; row++) {
            if (row === 0) {
                await this.taskFirstRow(source, cols, row, callback);
                await this.mergeGridY(source, cols, row, callback);
            } else if (row === rows - 1) {
                await this.taskLastRow(source, cols, row, callback);
            } else {
                await this.mergeGridX(source, cols, row, callback);
                await this.mergeGridY(source, cols, row, callback);
            }
        }

        Object.keys(this.cache).forEach(key => delete this.cache[key]);
    }

    private async taskFirstRow(source: MazeCellModel[][], cols: number, row: number, callback: (param: MazeCellModel[][]) => void): Promise<void> {
        let currPoint: MazeGridXY = { row: -1, col: -1 }, nextPoint: MazeGridXY = { row: -1, col: -1 };
        let lhs: number = 0, rhs: number = 0, weight: number

        for (let col = 0; col < cols; col++) {
            this.cache[source[row][lhs].weight] = { index: 0, count: 1, total: 1 };
            
            if (random(0, 1, true) < 0.5) {
                rhs = col;
                
                for (let i = lhs; i <= rhs; i++) {
                    currPoint = { row, col: i };
                    nextPoint = { row, col: Math.min(i + 1, rhs) };

                    source = await this._service.mergeWall(source, currPoint, nextPoint);

                    if (i > lhs) {
                        source[row][i].weight = source[row][lhs].weight;
                    }

                    source[currPoint.row][currPoint.col].color = PRIMARY_COLOR;
                    source[nextPoint.row][nextPoint.col].color = SECONDARY_COLOR;
                    callback(source);
        
                    await delay(MAZE_DELAY_DURATION);
        
                    source[currPoint.row][currPoint.col].color = EMPTY_COLOR;
                    source[nextPoint.row][nextPoint.col].color = EMPTY_COLOR;
                    callback(source);
                }

                lhs = rhs + 1;
            } else {
                source[row][col].color = ACCENT_COLOR;
                callback(source);
    
                await delay(MAZE_DELAY_DURATION);
    
                source[row][col].color = EMPTY_COLOR;
                callback(source);
            }

            weight = source[row][col].weight;

            if (!this.cache[weight]) {
                this.cache[weight] = { index: 0, count: 1, total: 1 };
            } else {
                this.cache[weight].index += 1;
                this.cache[weight].count += 1;
                this.cache[weight].total += 1;
            }
        }
    }

    private async taskLastRow(source: MazeCellModel[][], cols: number, row: number, callback: (param: MazeCellModel[][]) => void): Promise<void> {
        let currPoint: MazeGridXY = { row: -1, col: -1 }, nextPoint: MazeGridXY = { row: -1, col: -1 };
        let currWeight: number, nextWeight: number;

        for (let col = 0; col < cols; col++) {
            currPoint = { row, col };
            nextPoint = { row, col: Math.min(col + 1, cols - 1) };

            currWeight = source[currPoint.row][currPoint.col].weight;
            nextWeight = source[nextPoint.row][nextPoint.col].weight;

            if (nextWeight !== currWeight) {
                source = await this._service.mergeWall(source, currPoint, nextPoint);

                for (let i = col; i < cols; i++) {
                    if (source[row][i].weight === nextWeight) {
                        source[row][i].weight = currWeight;
                    }
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

    private async mergeGridX(source: MazeCellModel[][], cols: number, row: number, callback: (param: MazeCellModel[][]) => void): Promise<void> {
        let currPoint: MazeGridXY = { row: -1, col: -1 }, nextPoint: MazeGridXY = { row: -1, col: -1 };
        let currWeight: number, nextWeight: number, flag: boolean = false;
        // console.info('+++', JSON.parse(JSON.stringify(source[row])), JSON.parse(JSON.stringify(this.cache)));
        for (let col = 0; col < cols; col++) {
            currPoint = { row, col };
            nextPoint = { row, col: Math.min(col + 1, cols - 1) };

            currWeight = source[currPoint.row][currPoint.col].weight;
            nextWeight = source[nextPoint.row][nextPoint.col].weight;

            flag = nextWeight !== currWeight && random(0, 1, true) < 0.5;

            if (flag) {
                source = await this._service.mergeWall(source, currPoint, nextPoint);

                for (let i = 0; i < cols; i++) {
                    if (source[row][i].weight === nextWeight) {
                        source[row][i].weight = currWeight;

                        if (this.cache[nextWeight]) {
                            this.cache[nextWeight].index = Math.max(this.cache[nextWeight].index - 1, 0);
                            this.cache[nextWeight].count = Math.max(this.cache[nextWeight].count - 1, 0);
                        }
                    }
                }
            }

            source[currPoint.row][currPoint.col].color = flag ? PRIMARY_COLOR : ACCENT_COLOR;
            source[nextPoint.row][nextPoint.col].color = flag ? SECONDARY_COLOR : EMPTY_COLOR;
            callback(source);

            await delay(MAZE_DELAY_DURATION);

            source[currPoint.row][currPoint.col].color = EMPTY_COLOR;
            source[nextPoint.row][nextPoint.col].color = EMPTY_COLOR;
            callback(source);

            if (!this.cache[currWeight]) {
                this.cache[currWeight] = { index: 0, count: 1, total: 1 };
            } else {
                this.cache[currWeight].index += 1;
                this.cache[currWeight].count += 1;
                this.cache[currWeight].total += 1;
            }
        }
        // console.info('---', JSON.parse(JSON.stringify(source[row])), JSON.parse(JSON.stringify(this.cache)));
    }

    private async mergeGridY(source: MazeCellModel[][], cols: number, row: number, callback: (param: MazeCellModel[][]) => void): Promise<void> {
        let currPoint: MazeGridXY = { row: -1, col: -1 }, nextPoint: MazeGridXY = { row: -1, col: -1 }, weight: number, flag: boolean;
        // console.info('+++', JSON.parse(JSON.stringify(source[row])), JSON.parse(JSON.stringify(this.cache)));
        for (let col = cols - 1; col >= 0; col--) {
            weight = source[row][col].weight;
            this.cache[weight].index = Math.max(this.cache[weight].index - 1, 0);

            currPoint = { row, col };
            nextPoint = { row: row + 1, col };

            flag = (this.cache[weight].index === 0 && this.cache[weight].count === this.cache[weight].total) || random(0, 1, true) < 0.5;

            if (flag) {
                this.cache[weight].count -= 1;

                source[nextPoint.row][nextPoint.col].weight = weight;

                source = await this._service.mergeWall(source, currPoint, nextPoint);
            }
            
            source[currPoint.row][currPoint.col].color = flag ? PRIMARY_COLOR : ACCENT_COLOR;
            source[nextPoint.row][nextPoint.col].color = flag ? SECONDARY_COLOR : EMPTY_COLOR;
            callback(source);

            await delay(MAZE_DELAY_DURATION);

            source[currPoint.row][currPoint.col].color = EMPTY_COLOR;
            source[nextPoint.row][nextPoint.col].color = EMPTY_COLOR;
            callback(source);
        }
        // console.info('***', JSON.parse(JSON.stringify(source[row])), JSON.parse(JSON.stringify(this.cache)));
        Object.keys(this.cache).forEach(key => delete this.cache[key]);
    }

}
