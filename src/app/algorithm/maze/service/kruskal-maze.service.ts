import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { floor, random } from "lodash";

import { MazeToolsService } from "../ngrx-store/maze.service";
import { MazeDataModel, MazeGridPoint, MazeRunType } from "../ngrx-store/maze.state";
import { delay, MAZE_DELAY_DURATION } from "../maze.utils";
import { MazeGridCell } from "../ngrx-store/maze.state";
import { ACCENT_COLOR, EMPTY_COLOR, PRIMARY_COLOR, SECONDARY_COLOR } from "../../../public/global.utils";

/**
 * 随机克鲁斯卡尔算法
 */
@Injectable()
export class MazeGenerationRandomizedKruskalService {

    private weights: { [key: string | number]: MazeGridCell[] } = {};
    private flags: boolean[] = Array.from([]);
    private keys: string[] = Array.from([]);
    private cells: MazeGridCell[] = Array.from([]);
    private points: MazeGridPoint[] = Array.from([]);
    private neighbors: MazeGridCell[] = Array.from([]);

    constructor(private _service: MazeToolsService) {}

    public maze(source: MazeDataModel[][], rows: number, cols: number, type: MazeRunType): Observable<MazeDataModel[][]> {
        return new Observable(subscriber => {
            if (type === 'one') {
                this.runByOne(source, rows, cols, param => subscriber.next(param))
                    .then(() => subscriber.complete())
                    .catch(error => subscriber.error(error));
            }

            if (type === 'opt') {
                this.runByOptimal(source, rows, cols, param => subscriber.next(param))
                    .then(() => subscriber.complete())
                    .catch(error => subscriber.error(error));
            }
            
            if (type === 'all') {
                this.runByAll(source, rows, cols, param => subscriber.next(param))
                    .then(() => subscriber.complete())
                    .catch(error => subscriber.error(error));
            }
        });
    }

    private async runByOne(source: MazeDataModel[][], rows: number, cols: number, callback: (param: MazeDataModel[][]) => void): Promise<void> {
        const total: number = rows * cols;
        let point: MazeGridPoint = { currCell: { row: -1, col: -1 }, nextCell: { row: -1, col: -1 } }, cell: MazeGridCell, currWeight: number, nextWeight: number, count: number = 1, flag: boolean;

        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                currWeight = source[row][col].weight;

                if (!this.weights[currWeight]) {
                    this.weights[currWeight] = Array.from([]);
                }

                this.weights[currWeight].push({ row, col });
            }
        }

        while (count < total) {
            flag = false;

            point.currCell = { row: random(0, rows - 1, false), col: random(0, cols - 1, false) };
            currWeight = source[point.currCell.row][point.currCell.col].weight;

            this.neighbors = await this._service.findAnyNeighbors(source, rows, cols, point.currCell, this.neighbors);

            if (this.neighbors.length > 0) {
                point.nextCell = this.neighbors[this.neighbors.length === 1 ? 0 : random(0, this.neighbors.length - 1, false)];
                nextWeight = source[point.nextCell.row][point.nextCell.col].weight;

                if (nextWeight !== currWeight) {
                    flag = true;
                    count += 1;

                    for (let i = 0, length = this.weights[nextWeight].length; i < length; i++) {
                        cell = this.weights[nextWeight][i];
                        this.weights[currWeight].push(cell);
                        source[cell.row][cell.col].weight = currWeight;
                    }
    
                    this.weights[nextWeight].splice(0);
                    delete this.weights[nextWeight];
    
                    source = await this._service.mergeWall(source, point.currCell, point.nextCell);
                }
            }
            
            source[point.currCell.row][point.currCell.col].color = flag ? PRIMARY_COLOR : ACCENT_COLOR;
            source[point.nextCell.row][point.nextCell.col].color = flag ? SECONDARY_COLOR : EMPTY_COLOR;
            callback(source);

            await delay(MAZE_DELAY_DURATION);

            source[point.currCell.row][point.currCell.col].color = EMPTY_COLOR;
            source[point.nextCell.row][point.nextCell.col].color = EMPTY_COLOR;
            callback(source);
        }
        
        Object.keys(this.weights).forEach(key => {
            this.weights[key].splice(0);
            delete this.weights[key];
        });
        this.neighbors.splice(0);
    }

    private async runByOptimal(source: MazeDataModel[][], rows: number, cols: number, callback: (param: MazeDataModel[][]) => void): Promise<void> {
        const total: number = rows * cols;
        let point: MazeGridPoint = { currCell: { row: -1, col: -1 }, nextCell: { row: -1, col: -1 } }, cell: MazeGridCell, currWeight: number, nextWeight: number, count: number = 1, flag: boolean;

        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                currWeight = source[row][col].weight;

                if (!this.weights[currWeight]) {
                    this.weights[currWeight] = Array.from([]);
                }

                this.weights[currWeight].push({ row, col });
            }
        }
        
        while (count < total) {
            this.keys = Object.keys(this.weights);
            this.cells = this.weights[this.keys[random(0, this.keys.length - 1, false)]];
            point.currCell = this.cells[random(0, this.cells.length - 1, false)];
            currWeight = source[point.currCell.row][point.currCell.col].weight;

            this.neighbors = await this._service.findAnyNeighbors(source, rows, cols, point.currCell, this.neighbors);
            this.neighbors = this.neighbors.filter(neighbor => source[neighbor.row][neighbor.col].weight !== currWeight);

            flag = this.neighbors.length > 0;

            if (flag) {
                flag = true;
                count += 1;

                point.nextCell = this.neighbors[this.neighbors.length === 1 ? 0 : random(0, this.neighbors.length - 1, false)];
                nextWeight = source[point.nextCell.row][point.nextCell.col].weight;

                for (let i = 0, length = this.weights[nextWeight].length; i < length; i++) {
                    cell = this.weights[nextWeight][i];
                    this.weights[currWeight].push(cell);
                    source[cell.row][cell.col].weight = currWeight;
                }

                this.weights[nextWeight].splice(0);
                delete this.weights[nextWeight];

                source = await this._service.mergeWall(source, point.currCell, point.nextCell);
            }
            
            source[point.currCell.row][point.currCell.col].color = flag ? PRIMARY_COLOR : ACCENT_COLOR;
            source[point.nextCell.row][point.nextCell.col].color = flag ? SECONDARY_COLOR : EMPTY_COLOR;
            callback(source);

            await delay(MAZE_DELAY_DURATION);

            source[point.currCell.row][point.currCell.col].color = EMPTY_COLOR;
            source[point.nextCell.row][point.nextCell.col].color = EMPTY_COLOR;
            callback(source);
        }
        
        Object.keys(this.weights).forEach(key => {
            this.weights[key].splice(0);
            delete this.weights[key];
        });
        this.keys.splice(0);
        this.cells.splice(0);
        this.neighbors.splice(0);
    }

    private async runByAll(source: MazeDataModel[][], rows: number, cols: number, callback: (param: MazeDataModel[][]) => void): Promise<void> {
        const total: number = rows * cols, scale: number = this._service.calcLCM(floor(Math.log2(total), 0), 3);
        let point: MazeGridPoint, cell: MazeGridCell, currWeight: number, nextWeight: number, threshold: number= 1, count: number = 1;

        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                currWeight = source[row][col].weight;

                if (!this.weights[currWeight]) {
                    this.weights[currWeight] = Array.from([]);
                }

                this.weights[currWeight].push({ row, col });
            }
        }

        for (let i = 0; i < scale; i++) {
            this.points.push({ currCell: { row: -1, col: -1 }, nextCell: { row: -1, col: -1 } });
            this.flags[i] = false;
        }

        while (count < total) {
            for (let i = 0; i < threshold; i++) {
                this.keys = Object.keys(this.weights);
                this.cells = this.weights[this.keys[random(0, this.keys.length - 1, false)]];
                this.points[i].currCell = this.cells[random(0, this.cells.length - 1, false)];

                point = this.points[i];
                currWeight = source[point.currCell.row][point.currCell.col].weight;
    
                this.neighbors = await this._service.findAnyNeighbors(source, rows, cols, point.currCell, this.neighbors);
                this.neighbors = this.neighbors.filter(neighbor => source[neighbor.row][neighbor.col].weight !== currWeight);

                this.flags[i] = this.neighbors.length > 0;

                if (this.flags[i]) {
                    count += 1;
    
                    point.nextCell = this.neighbors[this.neighbors.length === 1 ? 0 : random(0, this.neighbors.length - 1, false)];
                    nextWeight = source[point.nextCell.row][point.nextCell.col].weight;
    
                    for (let i = 0, length = this.weights[nextWeight].length; i < length; i++) {
                        cell = this.weights[nextWeight][i];
                        this.weights[currWeight].push(cell);
                        source[cell.row][cell.col].weight = currWeight;
                    }
    
                    this.weights[nextWeight].splice(0);
                    delete this.weights[nextWeight];
    
                    source = await this._service.mergeWall(source, point.currCell, point.nextCell);
                }
            }
            
            await this._service.colorCells(source, this.points, this.flags, threshold, callback);
            await delay(MAZE_DELAY_DURATION);
            await this._service.clearCells(source, this.points, this.flags, threshold, callback);
            
            threshold = Math.min(threshold + 1, scale);
        }
        
        Object.keys(this.weights).forEach(key => {
            this.weights[key].splice(0);
            delete this.weights[key];
        });
        this.flags.splice(0);
        this.keys.splice(0);
        this.cells.splice(0);
        this.points.splice(0);
        this.neighbors.splice(0);
    }

}
