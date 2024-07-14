import { Injectable } from "@angular/core";
import { Observable } from "rxjs";

import { SortDataModel, SortStateModel, SortOrder } from "../ngrx-store/sort.state";
import { SORT_DELAY_DURATION, complete, delay } from "../sort.utils";
import { SortToolsService } from "../ngrx-store/sort.service";
import { ACCENT_ONE_COLOR, CLEAR_COLOR, ACCENT_TWO_COLOR, ACCENT_COLOR } from "../../../public/values.utils";

const matchRunLength = (length: number): number => {
    if (length > 1024) {
        return 32;
    } else if (length > 256 && length <= 1024) {
        return 16;
    } else if (length > 64 && length <= 256) {
        return 8;
    } else {
        return 4;
    }
}

/**
 * 剪切排序
 */
@Injectable()
export class ShearSortService {

    private matrix: number[][] = Array.from([]);

    public sort(array: SortDataModel[], order: SortOrder): Observable<SortStateModel> {
        return new Observable(subscriber => {
            if (order === 'ascent') {
                this.sortByAscent(array, 0, param => subscriber.next(param)).then(() => subscriber.complete());
            }
    
            if (order === 'descent') {
                this.sortByDescent(array, 0, param => subscriber.next(param)).then(() => subscriber.complete());
            }
        });
    }

    private async sortByAscent(source: SortDataModel[], times: number, callback: (param: SortStateModel) => void): Promise<void> {
        const length = source.length, cols: number = matchRunLength(length), rows: number = Math.floor(length / cols);
        let flag: boolean = false;
        times = await this.save(source, rows, cols, times, callback);
        
        while (!flag) {
            flag = true;

            for (let row = 0; row < rows; row++) {
                if (row % 2 === 0) {
                    flag = await this.rowSortByAscent(row, cols, flag);
                } else {
                    flag = await this.rowSortByDescent(row, cols, flag);
                }
            }

            for (let col = 0; col < cols; col++) {
                flag = await this.colSortByAscent(col, rows, flag);
            }
            
            times = await this.load(source, rows, cols, times, callback);
        }

        times = await this.walk(source, rows, times, callback);

        await delay(SORT_DELAY_DURATION);
        await complete(source, times, callback);
        this.matrix.forEach(array => array.splice(0));
        this.matrix.splice(0);
    }

    private async sortByDescent(source: SortDataModel[], times: number, callback: (param: SortStateModel) => void): Promise<void> {
        const length = source.length, cols: number = matchRunLength(length), rows: number = Math.floor(length / cols);
        let flag: boolean = false;
        times = await this.save(source, rows, cols, times, callback);
        
        while (!flag) {
            flag = true;

            for (let row = 0; row < rows; row++) {
                if (row % 2 === 0) {
                    flag = await this.rowSortByDescent(row, cols, flag);
                } else {
                    flag = await this.rowSortByAscent(row, cols, flag);
                }
            }

            for (let col = 0; col < cols; col++) {
                flag = await this.colSortByDescent(col, rows, flag);
            }
            
            times = await this.load(source, rows, cols, times, callback);
        }

        times = await this.walk(source, rows, times, callback);

        await delay(SORT_DELAY_DURATION);
        await complete(source, times, callback);
        this.matrix.forEach(array => array.splice(0));
        this.matrix.splice(0);
    }

    private async rowSortByAscent(row: number, length: number, flag: boolean, temp: number = -1): Promise<boolean> {
        for (let i = 1; i < length; i++) {
            for (let j = i; j > 0 && this.matrix[row][j - 1] > this.matrix[row][j]; j--) {
                flag = false;

                temp = this.matrix[row][j - 1];
                this.matrix[row][j - 1] = this.matrix[row][j];
                this.matrix[row][j] = temp;
            }
        }
        
        return flag;
    }

    private async rowSortByDescent(row: number, length: number, flag: boolean, temp: number = -1): Promise<boolean> {
        for (let i = 1; i < length; i++) {
            for (let j = i; j > 0 && this.matrix[row][j - 1] < this.matrix[row][j]; j--) {
                flag = false;

                temp = this.matrix[row][j - 1];
                this.matrix[row][j - 1] = this.matrix[row][j];
                this.matrix[row][j] = temp;
            }
        }
        
        return flag;
    }

    private async colSortByAscent(col: number, length: number, flag: boolean, temp: number = -1): Promise<boolean> {
        for (let i = 1; i < length; i++) {
            for (let j = i; j > 0 && this.matrix[i - 1][col] > this.matrix[i][col]; j--) {
                flag = false;

                temp = this.matrix[i - 1][col];
                this.matrix[i - 1][col] = this.matrix[i][col];
                this.matrix[i][col] = temp;
            }
        }
        
        return flag;
    }

    private async colSortByDescent(col: number, length: number, flag: boolean, temp: number = -1): Promise<boolean> {
        for (let i = 1; i < length; i++) {
            for (let j = i; j > 0 && this.matrix[i - 1][col] < this.matrix[i][col]; j--) {
                flag = false;

                temp = this.matrix[i - 1][col];
                this.matrix[i - 1][col] = this.matrix[i][col];
                this.matrix[i][col] = temp;
            }
        }
        
        return flag;
    }

    private async save(source: SortDataModel[], rows: number, cols: number, times: number, callback: (param: SortStateModel) => void): Promise<number> {
        let index: number = 0;
        
        for (let i = 0; i < rows; i++) {
            let array: number[] = Array.from([]);

            for (let j = 0; j < cols; j++) {
                times += 1;
    
                source[index].color = ACCENT_ONE_COLOR;
                callback({ times, datalist: source });
    
                await delay(SORT_DELAY_DURATION);
    
                source[index].color = CLEAR_COLOR;
                callback({ times, datalist: source });

                array.push(source[index].value);
                index += 1;
            }

            this.matrix.push(array);
        }
        
        return times;
    }

    private async load(source: SortDataModel[], rows: number, cols: number, times: number, callback: (param: SortStateModel) => void): Promise<number> {
        let index: number = 0;
        
        for (let i = 0; i < rows; i++) {
            for (let j = 0; j < cols; j++) {
                times += 1;
    
                source[index].value = this.matrix[i][j];
                source[index].color = ACCENT_TWO_COLOR;
                callback({ times, datalist: source });
    
                await delay(SORT_DELAY_DURATION);
    
                source[index].color = CLEAR_COLOR;
                callback({ times, datalist: source });

                index += 1;
            }
        }
        
        return times;
    }

    private async walk(source: SortDataModel[], rows: number, times: number, callback: (param: SortStateModel) => void): Promise<number> {
        let index: number = 0;
        
        for (let i = 0; i < rows; i++) {
            if (i % 2 === 0) {
                for (let j = 0, cols = this.matrix[i].length; j < cols; j++) {
                    times += 1;
        
                    source[index].value = this.matrix[i][j];
                    source[index].color = ACCENT_COLOR;
                    callback({ times, datalist: source });
        
                    await delay(SORT_DELAY_DURATION);
        
                    source[index].color = CLEAR_COLOR;
                    callback({ times, datalist: source });
    
                    index += 1;
                }
            } else {
                for (let j = this.matrix[i].length - 1; j >= 0; j--) {
                    times += 1;
        
                    source[index].value = this.matrix[i][j];
                    source[index].color = ACCENT_COLOR;
                    callback({ times, datalist: source });
        
                    await delay(SORT_DELAY_DURATION);
        
                    source[index].color = CLEAR_COLOR;
                    callback({ times, datalist: source });
    
                    index += 1;
                }
            }
        }
        
        return times;
    }

}

/**
 * 剪切排序（优化）
 */
@Injectable()
export class OptimalShearSortService {

    constructor(private _service: SortToolsService) {}

    public sort(array: SortDataModel[], order: SortOrder): Observable<SortStateModel> {
        return new Observable(subscriber => {
            let temp: SortDataModel = { color: '', value: Number.NaN };

            if (order === 'ascent') {
                this.sortByAscent(array, temp, 0, param => subscriber.next(param)).then(() => subscriber.complete());
            }
    
            if (order === 'descent') {
                this.sortByDescent(array, temp, 0, param => subscriber.next(param)).then(() => subscriber.complete());
            }
        });
    }

    private async sortByAscent(source: SortDataModel[], temp: SortDataModel, times: number, callback: (param: SortStateModel) => void): Promise<void> {
        const length = source.length, cols: number = matchRunLength(length), rows: number = Math.floor(length / cols);
        let lhs: number, rhs: number;
        
        for (let i = 0; i < Math.floor(Math.log2(length)); i++) {
            for (let row = 0; row < rows; row++) {
                lhs = row * cols;
                rhs = lhs + cols - 1;

                if (row % 2 === 0) {
                    times = await this._service.stableSortByAscent(source, lhs, rhs, temp, times, callback);
                } else {
                    times = await this._service.stableSortByDescent(source, lhs, rhs, temp, times, callback);
                }
            }

            for (let col = 0; col < cols; col++) {
                lhs = col;
                rhs = lhs + cols * rows - cols;
                times = await this._service.stableGapSortByAscent(source, lhs, rhs, cols, temp, times, callback);
            }
        }

        for (let row = 0; row < rows; row++) {
            lhs = row * cols;
            rhs = lhs + cols - 1;
            times = await this._service.stableSortByAscent(source, lhs, rhs, temp, times, callback);
        }

        await delay(SORT_DELAY_DURATION);
        await complete(source, times, callback);
    }

    private async sortByDescent(source: SortDataModel[], temp: SortDataModel, times: number, callback: (param: SortStateModel) => void): Promise<void> {
        const length = source.length, cols: number = matchRunLength(length), rows: number = Math.floor(length / cols);
        let lhs: number, rhs: number;

        for (let i = 0; i < Math.floor(Math.log2(length)); i++) {
            for (let row = 0; row < rows; row++) {
                lhs = row * cols;
                rhs = lhs + cols - 1;

                if (row % 2 === 0) {
                    times = await this._service.stableSortByDescent(source, lhs, rhs, temp, times, callback);
                } else {
                    times = await this._service.stableSortByAscent(source, lhs, rhs, temp, times, callback);
                }
            }

            for (let col = 0; col < cols; col++) {
                lhs = col;
                rhs = lhs + cols * rows - cols;
                times = await this._service.stableGapSortByDescent(source, lhs, rhs, cols, temp, times, callback);
            }
        }

        for (let row = 0; row < rows; row++) {
            lhs = row * cols;
            rhs = lhs + cols - 1;
            times = await this._service.stableSortByDescent(source, lhs, rhs, temp, times, callback);
        }

        await delay(SORT_DELAY_DURATION);
        await complete(source, times, callback);
    }

}
