import { Injectable } from "@angular/core";
import { Observable } from "rxjs";

import { SortDataModel, SortStateModel, SortOrder } from "../ngrx-store/sort.state";
import { swap } from "../sort.utils";
import { delay } from "../../../public/global.utils";
import { SortToolsService } from "../ngrx-store/sort.service";
import { ACCENT_ONE_COLOR, CLEAR_COLOR, ACCENT_TWO_COLOR, ACCENT_COLOR, PRIMARY_COLOR, SECONDARY_COLOR } from "../../../public/global.utils";

type ShearMode = 'insertion' | 'selection';

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
 * 刀鞘排序
 */
@Injectable()
export class ShearSortService {

    private matrix: number[][] = Array.from([]);
    private counter: { [key: string | number]: number } = {};

    public sort(array: SortDataModel[], order: SortOrder): Observable<SortStateModel> {
        return new Observable(subscriber => {
            if (order === 'ascent') {
                this.sortByAscent(array, 0, param => subscriber.next(param))
                    .then(() => subscriber.complete())
                    .catch(error => subscriber.error(error));
            }
    
            if (order === 'descent') {
                this.sortByDescent(array, 0, param => subscriber.next(param))
                    .then(() => subscriber.complete())
                    .catch(error => subscriber.error(error));
            }
        });
    }

    private async sortByAscent(source: SortDataModel[], times: number, callback: (param: SortStateModel) => void): Promise<void> {
        const length = source.length, cols: number = matchRunLength(length), rows: number = Math.floor(length / cols);

        times = await this.save(source, rows, cols, times, callback);
        
        for (let i = 0, threshold = Math.floor(Math.log2(length)); i < threshold; i++) {
            for (let row = 0; row <= rows - 1; row++) {
                times = row % 2 === 0 ? this.rowSortByAscent(row, times) : this.rowSortByDescent(row, times);
            }

            for (let col = 0; col <= cols - 1; col++) {
                times = this.colSortByAscent(col, times);
            }
            
            times = await this.load(source, rows, cols, times, callback);
        }

        times = await this.walk(source, rows, times, callback);

        await delay();
        // await this.complete(source, times, callback);
        this.matrix.forEach(array => array.splice(0));
        this.matrix.splice(0);
    }

    private async sortByDescent(source: SortDataModel[], times: number, callback: (param: SortStateModel) => void): Promise<void> {
        const length = source.length, cols: number = matchRunLength(length), rows: number = Math.floor(length / cols);

        times = await this.save(source, rows, cols, times, callback);
        
        for (let i = 0, threshold = Math.floor(Math.log2(length)); i < threshold; i++) {
            for (let row = 0; row < rows; row++) {
                times = row % 2 === 0 ? this.rowSortByDescent(row, times) : this.rowSortByAscent(row, times);
            }

            for (let col = 0; col < cols; col++) {
                times = await this.colSortByDescent(col, times);
            }
            
            times = await this.load(source, rows, cols, times, callback);
        }

        times = await this.walk(source, rows, times, callback);

        await delay();
        // await this.complete(source, times, callback);
        this.matrix.forEach(array => array.splice(0));
        this.matrix.splice(0);
    }

    private rowSortByAscent(row: number, times: number): number {
        let index: number, keys: string[], key: string;

        for (let col = 0, length = this.matrix[row].length; col <= length - 1; col++) {
            times += 1;

            index = this.matrix[row][col];
            this.counter[index] = !this.counter[index] ? 1 : this.counter[index] + 1;
        }

        keys = Object.keys(this.counter);
        index = 0;

        for (let i = 0, length = keys.length; i <= length - 1; i++) {
            key = keys[i];

            for (let j = 0, value = Number.parseInt(key); j < this.counter[key]; j++) {
                this.matrix[row][index] = value;
                index += 1;
                times += 1;
            }

            delete this.counter[key];
        }
        
        return times;
    }

    private rowSortByDescent(row: number, times: number): number {
        let index: number, keys: string[], key: string;

        for (let col = 0, length = this.matrix[row].length; col <= length - 1; col++) {
            times += 1;

            index = this.matrix[row][col];
            this.counter[index] = !this.counter[index] ? 1 : this.counter[index] + 1;
        }

        keys = Object.keys(this.counter);
        index = 0;

        for (let length = keys.length, i = length - 1; i >= 0; i--) {
            key = keys[i];

            for (let j = 0, value = Number.parseInt(key); j < this.counter[key]; j++) {
                this.matrix[row][index] = value;
                index += 1;
                times += 1;
            }

            delete this.counter[key];
        }
        
        return times;
    }

    private colSortByAscent(col: number, times: number): number {
        let index: number, keys: string[], key: string;

        for (let row = 0, length = this.matrix.length; row <= length - 1; row++) {
            times += 1;

            index = this.matrix[row][col];
            this.counter[index] = !this.counter[index] ? 1 : this.counter[index] + 1;
        }

        keys = Object.keys(this.counter);
        index = 0;

        for (let i = 0, length = keys.length; i <= length - 1; i++) {
            key = keys[i];

            for (let j = 0, value = Number.parseInt(key); j < this.counter[key]; j++) {
                this.matrix[index][col] = value;
                index += 1;
                times += 1;
            }

            delete this.counter[key];
        }
        
        return times;
    }

    private colSortByDescent(col: number, times: number): number {
        let index: number, keys: string[], key: string;

        for (let row = 0, length = this.matrix.length; row <= length - 1; row++) {
            times += 1;

            index = this.matrix[row][col];
            this.counter[index] = !this.counter[index] ? 1 : this.counter[index] + 1;
        }

        keys = Object.keys(this.counter);
        index = 0;

        for (let length = keys.length, i = length - 1; i >= 0; i--) {
            key = keys[i];

            for (let j = 0, value = Number.parseInt(key); j < this.counter[key]; j++) {
                this.matrix[index][col] = value;
                index += 1;
                times += 1;
            }

            delete this.counter[key];
        }
        
        return times;
    }

    private async save(source: SortDataModel[], rows: number, cols: number, times: number, callback: (param: SortStateModel) => void): Promise<number> {
        let index: number = 0;
        
        for (let row = 0; row <= rows - 1; row++) {
            let array: number[] = Array.from([]);

            for (let col = 0; col <= cols - 1; col++) {
                times += 1;
    
                source[index].color = ACCENT_ONE_COLOR;
                callback({ times, datalist: source });
    
                await delay();
    
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
        
        for (let row = 0; row <= rows - 1; row++) {
            for (let col = 0; col <= cols - 1; col++) {
                times += 1;
    
                source[index].value = this.matrix[row][col];
                source[index].color = ACCENT_TWO_COLOR;
                callback({ times, datalist: source });
    
                await delay();
    
                source[index].color = CLEAR_COLOR;
                callback({ times, datalist: source });

                index += 1;
            }
        }
        
        return times;
    }

    private async walk(source: SortDataModel[], rows: number, times: number, callback: (param: SortStateModel) => void): Promise<number> {
        let index: number = 0;
        
        for (let row = 0, cols = this.matrix[row].length; row < rows; row++) {
            if (row % 2 === 0) {
                for (let col = 0; col <= cols - 1; col++) {
                    times += 1;
        
                    source[index].value = this.matrix[row][col];
                    source[index].color = ACCENT_COLOR;
                    callback({ times, datalist: source });
        
                    await delay();
        
                    source[index].color = CLEAR_COLOR;
                    callback({ times, datalist: source });
    
                    index += 1;
                }
            } else {
                for (let col = cols - 1; col >= 0; col--) {
                    times += 1;
        
                    source[index].value = this.matrix[row][col];
                    source[index].color = ACCENT_COLOR;
                    callback({ times, datalist: source });
        
                    await delay();
        
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
 * 刀鞘排序（优化）
 */
@Injectable()
export class OptimalShearSortService {

    constructor(private _service: SortToolsService) {}

    public sort(array: SortDataModel[], order: SortOrder, mode: ShearMode): Observable<SortStateModel> {
        return new Observable(subscriber => {
            let temp: SortDataModel = { color: '', value: Number.NaN };

            if (order === 'ascent') {
                this.sortByAscent(array, mode, temp, 0, param => subscriber.next(param))
                    .then(() => subscriber.complete())
                    .catch(error => subscriber.error(error));
            }
    
            if (order === 'descent') {
                this.sortByDescent(array, mode, temp, 0, param => subscriber.next(param))
                    .then(() => subscriber.complete())
                    .catch(error => subscriber.error(error));
            }
        });
    }

    private async sortByAscent(source: SortDataModel[], mode: ShearMode, temp: SortDataModel, times: number, callback: (param: SortStateModel) => void): Promise<void> {
        const length = source.length, cols: number = matchRunLength(length), rows: number = Math.floor(length / cols);
        let lhs: number = 0, rhs: number = 0, completed: boolean = false, flag: boolean = false;
        
        for (let i = 0, threshold = Math.floor(Math.log2(length)); i < threshold; i++) {
            completed = true;

            for (let row = 0; row <= rows - 1; row++) {
                lhs = row === 0 ? 0 : rhs + 1;
                rhs = lhs + cols - 1;

                if (mode === 'insertion') {
                    [flag, times] = row % 2 === 0 
                        ? await this.insertionSortByAscent(source, lhs, rhs, 1, temp, times, callback)
                        : await this.insertionSortByDescent(source, lhs, rhs, 1, temp, times, callback);
                }
                
                if (mode === 'selection') {
                    [flag, times] = row % 2 === 0
                        ? await this.selectionSortByAscent(source, lhs, rhs, 1, temp, times, callback)
                        : await this.selectionSortByDescent(source, lhs, rhs, 1, temp, times, callback);
                }

                completed &&= flag;
            }

            if (completed) break;

            for (let col = 0; col <= cols - 1; col++) {
                lhs = col;
                rhs = length - cols + col;
                
                if (mode === 'insertion') {
                    [flag, times] = await this.insertionSortByAscent(source, lhs, rhs, cols, temp, times, callback);
                }

                if (mode === 'selection') {
                    [flag, times] = await this.selectionSortByAscent(source, lhs, rhs, cols, temp, times, callback);
                }

                completed &&= flag;
            }
            
            if (completed) break;
        }

        for (let row = 0; row <= rows - 1; row++) {
            lhs = row === 0 ? 0 : rhs + 1;
            rhs = lhs + cols - 1;

            if (mode === 'insertion') {
                [flag, times] = await this.insertionSortByAscent(source, lhs, rhs, 1, temp, times, callback);
            }

            if (mode === 'selection') {
                [flag, times] = await this.selectionSortByAscent(source, lhs, rhs, 1, temp, times, callback);
            }
        } 

        await delay();
        // await this.complete(source, times, callback);
    }

    private async sortByDescent(source: SortDataModel[], mode: ShearMode, temp: SortDataModel, times: number, callback: (param: SortStateModel) => void): Promise<void> {
        const length = source.length, cols: number = matchRunLength(length), rows: number = Math.floor(length / cols);
        let lhs: number = 0, rhs: number = 0, completed: boolean = false, flag: boolean = false;

        for (let i = 0, threshold = Math.floor(Math.log2(length)); i < threshold; i++) {
            completed = true;

            for (let row = rows - 1; row >= 0; row--) {
                rhs = row === rows - 1 ? length - 1 : lhs - 1;
                lhs = rhs - cols + 1;

                if (mode === 'insertion') {
                    [flag, times] = row % 2 === 0 
                        ? await this.insertionSortByAscent(source, lhs, rhs, 1, temp, times, callback)
                        : await this.insertionSortByDescent(source, lhs, rhs, 1, temp, times, callback);
                }

                if (mode === 'selection') {
                    [flag, times] = row % 2 === 0
                        ? await this.selectionSortByAscent(source, lhs, rhs, 1, temp, times, callback)
                        : await this.selectionSortByDescent(source, lhs, rhs, 1, temp, times, callback);
                }

                completed &&= flag;
            }

            if (completed) break;

            for (let col = cols - 1; col >= 0; col--) {
                lhs = col;
                rhs = length - cols + col;

                if (mode === 'insertion') {
                    [flag, times] = await this.insertionSortByDescent(source, lhs, rhs, cols, temp, times, callback);
                }
                
                if (mode === 'selection') {
                    [flag, times] = await this.selectionSortByDescent(source, lhs, rhs, cols, temp, times, callback);
                }

                completed &&= flag;
            }
            
            if (completed) break;
        }

        for (let row = rows - 1; row >= 0; row--) {
            rhs = row === rows - 1 ? length - 1 : lhs - 1;
            lhs = rhs - cols + 1;

            if (mode === 'insertion') {
                [flag, times] = await this.insertionSortByDescent(source, lhs, rhs, 1, temp, times, callback);
            }
            
            if (mode === 'selection') {
                [flag, times] = await this.selectionSortByDescent(source, lhs, rhs, 1, temp, times, callback);
            }
        }

        await delay();
        // await this.complete(source, times, callback);
    }

    private async insertionSortByAscent(source: SortDataModel[], lhs: number, rhs: number, gap: number, temp: SortDataModel, times: number, callback: (param: SortStateModel) => void): Promise<[boolean, number]> {
        let flag: boolean = true;

        for (let i = lhs + gap; i <= rhs; i += gap) {
            for (let j = i - gap; j >= lhs && source[j].value > source[j + gap].value; j -= gap) {
                flag = false;
                times += 1;
                
                source[i].color = ACCENT_COLOR;
                source[j].color = PRIMARY_COLOR;
                source[j + gap].color = SECONDARY_COLOR;
                callback({ times, datalist: source });

                await swap(source, j + gap, j);
                await delay();

                source[i].color = ACCENT_COLOR;
                source[j].color = CLEAR_COLOR;
                source[j + gap].color = CLEAR_COLOR;
                callback({ times, datalist: source });
            }

            source[i].color = CLEAR_COLOR;
            callback({ times, datalist: source });
        }
        
        return [flag, times];
    }

    private async insertionSortByDescent(source: SortDataModel[], lhs: number, rhs: number, gap: number, temp: SortDataModel, times: number, callback: (param: SortStateModel) => void): Promise<[boolean, number]> {
        let flag: boolean = true;

        for (let i = rhs - gap; i >= lhs; i -= gap) {
            for (let j = i + gap; j <= rhs && source[j].value > source[j - gap].value; j += gap) {
                flag = false;
                times += 1;

                callback({ times, datalist: source});
                source[j].color = PRIMARY_COLOR;
                source[j - gap].color = SECONDARY_COLOR;
                callback({ times, datalist: source});
                
                await swap(source, j, j - gap);
                await delay();

                callback({ times, datalist: source});
                source[j].color = CLEAR_COLOR;
                source[j - gap].color = CLEAR_COLOR;
                callback({ times, datalist: source});
            }

            source[i].color = CLEAR_COLOR;
            callback({ times, datalist: source});
        }
        
        return [flag, times];
    }

    private async selectionSortByAscent(source: SortDataModel[], lhs: number, rhs: number, gap: number, temp: SortDataModel, times: number, callback: (param: SortStateModel) => void): Promise<[boolean, number]> {
        let k: number, value: number, flag: boolean = true;

        for (let i = lhs; i <= rhs; i += gap) {
            value = source[i].value;
            k = i;

            for (let j = i + gap; j <= rhs; j += gap) {
                source[i].color = PRIMARY_COLOR;
                source[j].color = SECONDARY_COLOR;
                source[k].color = ACCENT_COLOR;
                callback({ times, datalist: source });

                await delay();

                if (source[j].value < value) {
                    source[k].color = CLEAR_COLOR;

                    flag = false;
                    k = j;
                    value = source[j].value;
                }

                source[i].color = PRIMARY_COLOR;
                source[j].color = CLEAR_COLOR;
                source[k].color = ACCENT_COLOR;
                callback({ times, datalist: source });
            }

            await this._service.swapAndRender(source, false, k !== i, k, i, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, times, callback);

            times += 1;
        }

        return [flag, times];
    }

    private async selectionSortByDescent(source: SortDataModel[], lhs: number, rhs: number, gap: number, temp: SortDataModel, times: number, callback: (param: SortStateModel) => void): Promise<[boolean, number]> {
        let k: number, value: number, flag: boolean = true;

        for (let i = rhs; i >= lhs; i -= gap) {
            value = source[i].value;
            k = i;

            for (let j = i - gap; j >= lhs; j -= gap) {
                source[i].color = PRIMARY_COLOR;
                source[j].color = SECONDARY_COLOR;
                source[k].color = ACCENT_COLOR;
                callback({ times, datalist: source });

                await delay();

                if (source[j].value < value) {
                    source[k].color = CLEAR_COLOR;

                    flag = false;
                    k = j;
                    value = source[j].value;
                }

                source[i].color = PRIMARY_COLOR;
                source[j].color = CLEAR_COLOR;
                source[k].color = ACCENT_COLOR;
                callback({ times, datalist: source });
            }

            await this._service.swapAndRender(source, false, k !== i, k, i, PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, times, callback);

            times += 1;
        }

        return [flag, times];
    }

}
