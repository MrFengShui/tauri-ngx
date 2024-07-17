import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { floor, random } from "lodash";

import { MazeToolsService } from "../ngrx-store/maze.service";
import { MazeCellModel } from "../ngrx-store/maze.state";
import { delay, MAZE_DELAY_DURATION } from "../maze.utils";
import { MazeGridXY } from "../ngrx-store/maze.state";
import { ACCENT_COLOR, ACCENT_ONE_COLOR, ACCENT_TWO_COLOR, EMPTY_COLOR, PRIMARY_COLOR, PRIMARY_ONE_COLOR, PRIMARY_TWO_COLOR, SECONDARY_COLOR, SECONDARY_ONE_COLOR, SECONDARY_TWO_COLOR } from "../../../public/values.utils";

/**
 * 随机普里姆算法
 */
@Injectable()
export class MazeGenerationRandomizedPrimService {

    private graph: MazeGridXY[] = Array.from([]);
    private vertex: MazeGridXY[] = Array.from([]);

    constructor(private _service: MazeToolsService) {}

    public maze(source: MazeCellModel[][], rows: number, cols: number): Observable<MazeCellModel[][]> {
        return new Observable(subscriber => {
            this.run(source, rows, cols, param => subscriber.next(param)).then(() => subscriber.complete());
        });
    }

    private async run(source: MazeCellModel[][], rows: number, cols: number, callback: (param: MazeCellModel[][]) => void): Promise<void> {
        const length: number = rows * cols;
        let currPoint: MazeGridXY = { row: random(0, rows - 1), col: random(0, cols - 1) }, nextPoint: MazeGridXY = { row: -1, col: -1 };
        let neighbors: MazeGridXY[] = Array.from([]), newNeighbors: MazeGridXY[] = Array.from([]), oldNeighbors: MazeGridXY[] = Array.from([]), index: number;

        neighbors = await this._service.findNeighbors(source, rows, cols, currPoint, neighbors);
        this.vertex.push(...neighbors);
        this.graph.push(currPoint);
        
        while (this.graph.length < length) {
            index = this.vertex.length === 1 ? 0 : random(0, this.vertex.length - 1);
            currPoint = this.vertex.splice(index, 1)[0];

            if (!this._service.existed(this.graph, currPoint)) {
                this.graph.push(currPoint);
            }
            
            neighbors = await this._service.findNeighbors(source, rows, cols, currPoint, neighbors);
            oldNeighbors = neighbors.filter(neighbor => this._service.existed(this.graph, neighbor));
            newNeighbors = neighbors.filter(neighbor => !this._service.existed(this.graph, neighbor) && !this._service.existed(this.vertex, neighbor));

            if (newNeighbors.length > 0) {
                this.vertex.push(...newNeighbors);
            }
            
            nextPoint = oldNeighbors[oldNeighbors.length === 1 ? 0 : random(0, oldNeighbors.length - 1)];

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

}

/**
 * 并行随机普里姆算法
 */
@Injectable()
export class MazeGenerationParallelPrimService {

    private fstGraph: MazeGridXY[] = Array.from([]);
    private fstVertex: MazeGridXY[] = Array.from([]);
    private sndGraph: MazeGridXY[] = Array.from([]);
    private sndVertex: MazeGridXY[] = Array.from([]);

    constructor(private _service: MazeToolsService) {}

    public maze(source: MazeCellModel[][], rows: number, cols: number): Observable<MazeCellModel[][]> {
        return new Observable(subscriber => {
            this.run(source, rows, cols, param => subscriber.next(param)).then(() => subscriber.complete());
        });
    }

    private async run(source: MazeCellModel[][], rows: number, cols: number, callback: (param: MazeCellModel[][]) => void): Promise<void> {
        const length: number = rows * cols;
        let fstCurrPoint: MazeGridXY = { row: -1, col: -1 }, fstNextPoint: MazeGridXY = { row: -1, col: -1 };
        let sndCurrPoint: MazeGridXY = { row: -1, col: -1 }, sndNextPoint: MazeGridXY = { row: -1, col: -1 };
        let fstNeighbors: MazeGridXY[] = Array.from([]), fstNewNeighbors: MazeGridXY[] = Array.from([]), fstOldNeighbors: MazeGridXY[] = Array.from([]);
        let sndNeighbors: MazeGridXY[] = Array.from([]), sndNewNeighbors: MazeGridXY[] = Array.from([]), sndOldNeighbors: MazeGridXY[] = Array.from([]);

        fstCurrPoint.row = random(floor(rows * 0.25, 0), floor(rows * 0.75), false);
        fstCurrPoint.col = random(floor(rows * 0.25, 0), floor(rows * 0.75), false);
        
        fstNeighbors = await this._service.findNeighbors(source, rows, cols, fstCurrPoint, fstNeighbors);
        sndCurrPoint = fstNeighbors[random(0, fstNeighbors.length - 1)];
        
        source = await this._service.mergeWall(source, fstCurrPoint, sndCurrPoint);

        fstNeighbors = fstNeighbors.filter(neighbor => neighbor.col !== sndCurrPoint.col && neighbor.row !== sndCurrPoint.row);
        this.fstVertex.push(...fstNeighbors);
        this.fstGraph.push(fstCurrPoint);

        sndNeighbors = await this._service.findNeighbors(source, rows, cols, sndCurrPoint, sndNeighbors);
        sndNeighbors = sndNeighbors.filter(neighbor => neighbor.col !== fstCurrPoint.col && neighbor.row !== fstCurrPoint.row);
        this.sndVertex.push(...sndNeighbors);
        this.sndGraph.push(sndCurrPoint);
        
        while (this.fstGraph.length + this.sndGraph.length < length) {
            if (this.fstVertex.length > 0) {
                [source, fstCurrPoint, fstNextPoint] = await this.task(source, rows, cols, this.fstGraph, this.sndGraph, this.fstVertex, this.sndVertex, fstCurrPoint, fstNextPoint, fstNeighbors, fstOldNeighbors, fstNewNeighbors);
            }
            
            if (this.sndVertex.length > 0) {
                [source, sndCurrPoint, sndNextPoint] = await this.task(source, rows, cols, this.sndGraph, this.fstGraph, this.sndVertex, this.fstVertex, sndCurrPoint, sndNextPoint, sndNeighbors, sndOldNeighbors, sndNewNeighbors);
            }
            
            if (fstCurrPoint && fstNextPoint && sndCurrPoint && sndNextPoint) {
                for (let i = 0, length = this.fstVertex.length; i < length; i++){
                    source[this.fstVertex[i].row][this.fstVertex[i].col].color = ACCENT_ONE_COLOR;
                }
                
                for (let i = 0, length = this.sndVertex.length; i < length; i++){
                    source[this.sndVertex[i].row][this.sndVertex[i].col].color = ACCENT_TWO_COLOR;
                }
                
                source[fstCurrPoint.row][fstCurrPoint.col].color = PRIMARY_ONE_COLOR;
                source[fstNextPoint.row][fstNextPoint.col].color = SECONDARY_ONE_COLOR;
                source[sndCurrPoint.row][sndCurrPoint.col].color = PRIMARY_TWO_COLOR;
                source[sndNextPoint.row][sndNextPoint.col].color = SECONDARY_TWO_COLOR;
                callback(source);
    
                await delay(MAZE_DELAY_DURATION);
    
                for (let i = 0, length = this.fstVertex.length; i < length; i++){
                    source[this.fstVertex[i].row][this.fstVertex[i].col].color = EMPTY_COLOR
                }
                
                for (let i = 0, length = this.sndVertex.length; i < length; i++){
                    source[this.sndVertex[i].row][this.sndVertex[i].col].color = EMPTY_COLOR;
                }
                
                source[fstCurrPoint.row][fstCurrPoint.col].color = EMPTY_COLOR;
                source[fstNextPoint.row][fstNextPoint.col].color = EMPTY_COLOR;
                source[sndCurrPoint.row][sndCurrPoint.col].color = EMPTY_COLOR;
                source[sndNextPoint.row][sndNextPoint.col].color = EMPTY_COLOR;
                callback(source);
            }
        }

        this.fstGraph.splice(0);
        this.fstVertex.splice(0);
        this.sndGraph.splice(0);
        this.sndVertex.splice(0);
    }

    private async task(source: MazeCellModel[][], rows: number, cols: number, fstGraph: MazeGridXY[], sndGraph: MazeGridXY[], fstVertex: MazeGridXY[], sndVertex: MazeGridXY[], currPoint: MazeGridXY, nextPoint: MazeGridXY, neighbors: MazeGridXY[], oldNeighbors: MazeGridXY[], newNeighbors: MazeGridXY[]): Promise<[MazeCellModel[][], MazeGridXY, MazeGridXY]> {
        const index = fstVertex.length === 1 ? 0 : random(0, fstVertex.length - 1);
        currPoint = fstVertex.splice(index, 1)[0];

        if (!this._service.existed(fstGraph, currPoint)) {
            fstGraph.push(currPoint);
        }
        
        neighbors = await this._service.findNeighbors(source, rows, cols, currPoint, neighbors);
        oldNeighbors = neighbors.filter(neighbor => this._service.existed(fstGraph, neighbor));
        newNeighbors = neighbors.filter(neighbor => !this._service.existed(fstGraph, neighbor) && !this._service.existed(fstVertex, neighbor) && !this._service.existed(sndGraph, neighbor) && !this._service.existed(sndVertex, neighbor));

        if (newNeighbors.length > 0) {
            fstVertex.push(...newNeighbors);
        }
        
        nextPoint = oldNeighbors[oldNeighbors.length === 1 ? 0 : random(0, oldNeighbors.length - 1)];

        if (!this._service.existed(fstGraph, nextPoint)) {
            fstGraph.push(nextPoint);
        }
        
        source = await this._service.mergeWall(source, currPoint, nextPoint);
        return [source, currPoint, nextPoint];
    }

}