import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { floor, random } from "lodash";

import { MazeToolsService } from "../ngrx-store/maze.service";
import { MazeCellModel, MazeGridPoint, MazeRunType } from "../ngrx-store/maze.state";
import { delay, MAZE_DELAY_DURATION } from "../maze.utils";
import { MazeGridCell } from "../ngrx-store/maze.state";
import { ACCENT_COLOR, EMPTY_COLOR, PRIMARY_COLOR, PRIMARY_ONE_COLOR, PRIMARY_TWO_COLOR, SECONDARY_COLOR, SECONDARY_ONE_COLOR, SECONDARY_TWO_COLOR } from "../../../public/values.utils";

/**
 * 随机普里姆算法
 */
@Injectable()
export class MazeGenerationRandomizedPrimService {

    private graph: MazeGridCell[] = Array.from([]);
    private vertex: MazeGridCell[] = Array.from([]);
    private point: MazeGridPoint[] = Array.from([]);
    private neighbors: MazeGridCell[] = Array.from([]);
    private newNeighbors: MazeGridCell[] = Array.from([]);
    private oldNeighbors: MazeGridCell[] = Array.from([]);

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
        const length: number = rows * cols;
        let currPoint: MazeGridCell = { row: random(0, rows - 1, false), col: random(0, cols - 1, false) }, nextPoint: MazeGridCell = { row: -1, col: -1 };
        let neighbors: MazeGridCell[] = Array.from([]), newNeighbors: MazeGridCell[] = Array.from([]), oldNeighbors: MazeGridCell[] = Array.from([]), index: number;

        neighbors = await this._service.findFitNeighbors(source, rows, cols, currPoint, neighbors);
        this.vertex.push(...neighbors);
        this.graph.push(currPoint);
        
        while (this.graph.length < length) {
            index = this.vertex.length === 1 ? 0 : random(0, this.vertex.length - 1, false);
            currPoint = this.vertex.splice(index, 1)[0];

            if (!this._service.existed(this.graph, currPoint)) {
                this.graph.push(currPoint);
            }
            
            neighbors = await this._service.findFitNeighbors(source, rows, cols, currPoint, neighbors);
            oldNeighbors = neighbors.filter(neighbor => this._service.existed(this.graph, neighbor));
            newNeighbors = neighbors.filter(neighbor => !this._service.existed(this.graph, neighbor) && !this._service.existed(this.vertex, neighbor));

            if (newNeighbors.length > 0) {
                this.vertex.push(...newNeighbors);
            }
            
            nextPoint = oldNeighbors[oldNeighbors.length === 1 ? 0 : random(0, oldNeighbors.length - 1, false)];

            if (!this._service.existed(this.graph, nextPoint)) {
                this.graph.push(nextPoint);
            }
            
            source = await this._service.mergeWall(source, currPoint, nextPoint);

            for (let i = 0, length = this.vertex.length; i < length; i++){
                source[this.vertex[i].row][this.vertex[i].col].color = ACCENT_COLOR;
            }
            
            source[currPoint.row][currPoint.col].color = PRIMARY_COLOR;
            source[nextPoint.row][nextPoint.col].color = SECONDARY_COLOR;
            callback(source);

            await delay(MAZE_DELAY_DURATION);

            for (let i = 0, length = this.vertex.length; i < length; i++){
                source[this.vertex[i].row][this.vertex[i].col].color = EMPTY_COLOR;
            }
            
            source[currPoint.row][currPoint.col].color = EMPTY_COLOR;
            source[nextPoint.row][nextPoint.col].color = EMPTY_COLOR;
            callback(source);
        }

        this.graph.splice(0);
        this.vertex.splice(0);
    }

    private async runByAll(source: MazeCellModel[][], rows: number, cols: number, callback: (param: MazeCellModel[][]) => void): Promise<void> {
        const length: number = rows * cols, scale: number = floor(Math.log2(length)) * 3, count: number = Math.max(scale, 3);
        const origin: MazeGridCell = { row: random(floor(rows * 0.25), floor(rows * 0.75), false), col: random(floor(cols * 0.25), floor(cols * 0.75), false) };
        let threshold: number, index: number;

        for (let i = 0; i < count; i++) {
            this.point.push({ currCell: { row: -1, col: -1 }, nextCell: { row: -1, col: -1 } });
        }

        this.neighbors = await this._service.findAnyNeighbors(source, rows, cols, origin, this.neighbors);
        this.vertex.push(...this.neighbors);
        this.graph.push(origin);

        threshold = Math.min(count, 1);

        while (this.graph.length < length) {
            for (let i = 0; i < threshold; i++) {
                index = this.vertex.length === 1 ? 0 : random(0, this.vertex.length - 1, false);
                this.point[i].currCell = this.vertex.splice(index, 1)[0];

                if (!this._service.existed(this.graph, this.point[i].currCell)) {
                    this.graph.push(this.point[i].currCell);
                }
                
                this.neighbors = await this._service.findAnyNeighbors(source, rows, cols, this.point[i].currCell, this.neighbors);
                this.oldNeighbors = this.neighbors.filter(neighbor => this._service.existed(this.graph, neighbor));
                this.newNeighbors = this.neighbors.filter(neighbor => !this._service.existed(this.graph, neighbor) && !this._service.existed(this.vertex, neighbor));

                if (this.newNeighbors.length > 0) {
                    this.vertex.push(...this.newNeighbors);
                }
                
                this.point[i].nextCell = this.oldNeighbors[this.oldNeighbors.length === 1 ? 0 : random(0, this.oldNeighbors.length - 1, false)];
                
                source = await this._service.mergeWall(source, this.point[i].currCell, this.point[i].nextCell);
            }

            for (let i = 0, length = this.vertex.length; i < length; i++){
                source[this.vertex[i].row][this.vertex[i].col].color = ACCENT_COLOR;
            }
            
            for (let i = 0; i < threshold; i++) {
                if (i % 3 === 1) {
                    source[this.point[i].currCell.row][this.point[i].currCell.col].color = PRIMARY_ONE_COLOR;
                    source[this.point[i].nextCell.row][this.point[i].nextCell.col].color = SECONDARY_ONE_COLOR;
                } else if (i % 3 === 2) {
                    source[this.point[i].currCell.row][this.point[i].currCell.col].color = PRIMARY_TWO_COLOR;
                    source[this.point[i].nextCell.row][this.point[i].nextCell.col].color = SECONDARY_TWO_COLOR;
                } else {
                    source[this.point[i].currCell.row][this.point[i].currCell.col].color = PRIMARY_COLOR;
                    source[this.point[i].nextCell.row][this.point[i].nextCell.col].color = SECONDARY_COLOR;
                }
            }
            
            callback(source);

            await delay(MAZE_DELAY_DURATION);

            for (let i = 0, length = this.vertex.length; i < length; i++){
                source[this.vertex[i].row][this.vertex[i].col].color = EMPTY_COLOR;
            }
            
            for (let i = 0; i < threshold; i++) {
                source[this.point[i].currCell.row][this.point[i].currCell.col].color = EMPTY_COLOR;
                source[this.point[i].nextCell.row][this.point[i].nextCell.col].color = EMPTY_COLOR;
            }

            callback(source);

            threshold = Math.min(count, this.vertex.length);
        }

        this.graph.splice(0);
        this.vertex.splice(0);
        this.point.splice(0);
        this.neighbors.splice(0);
        this.newNeighbors.splice(0);
        this.oldNeighbors.splice(0);
    }

}
