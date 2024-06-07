import { fabric } from 'fabric';

import { SortDataModel, SortStateModel } from "./ngrx-store/sort.state";

export const delay = (duration: number = 10): Promise<void> => new Promise<void>(resolve => setTimeout(resolve, duration));

export const swap = (source: SortDataModel[], fst: number, snd: number, temp: SortDataModel) => new Promise<void>(resolve => {
    let task = setTimeout(() => {
        clearTimeout(task);
        temp = source[fst];
        source[fst] = source[snd];
        source[snd] = temp;
        resolve();
    });
});

export const complete = (source: SortDataModel[], times: number, callback: (parram: SortStateModel) => void) => new Promise<void>(async (resolve) => {
    for (let item of source) {
        item.color = 'royalblue';
        await delay(SORT_DELAY_DURATION);
        callback({ completed: false, times, datalist: source });
    }

    callback({ completed: true, times, datalist: source });
    resolve();
});

export const binarySearchByAscent = (source: SortDataModel[], target: SortDataModel, threshold: number) => new Promise<number>(resolve => {
    let lhs: number = 0, rhs: number = threshold - 1, mid: number = -1;

    let task = setTimeout(() => {
        clearTimeout(task);

        while (lhs <= rhs) {
            mid = Math.floor((rhs - lhs) * 0.5 + lhs);

            if (target.value > source[mid].value) {
                lhs = mid + 1;
            } else if (target.value < source[mid].value) {
                rhs = mid - 1;
            } else {
                break;
            }
        }

        mid = lhs;
        resolve(mid);
    });
});

export const binarySearchByDscent = (source: SortDataModel[], target: SortDataModel, threshold: number) => new Promise<number>(resolve => {
    let lhs: number = 0, rhs: number = threshold - 1, mid: number = -1;

    let task = setTimeout(() => {
        clearTimeout(task);

        while (lhs <= rhs) {
            mid = Math.floor((rhs - lhs) * 0.5 + lhs);

            if (target.value < source[mid].value) {
                lhs = mid + 1;
            } else if (target.value > source[mid].value) {
                rhs = mid - 1;
            } else {
                break;
            }
        }

        mid = lhs;
        resolve(mid);
    });
});

export const stableSortByAscent = (source: SortDataModel[], times: number, temp: SortDataModel = { value: -1, color: '' }) => new Promise<number>(resolve => {
    for (let i = 1; i < source.length; i++) {
        for (let j = i; j > 0; j--) {
            if (source[j - 1].value > source[j].value) {
                temp = source[j - 1];
                source[j - 1] = source[j];
                source[j] = temp;
                times += 1;
            }
        }
    }

    resolve(times);
});

export const stableSortByDescent = (source: SortDataModel[], times: number, temp: SortDataModel = { value: -1, color: '' }) => new Promise<number>(resolve => {
    for (let i = 1; i < source.length; i++) {
        for (let j = i; j > 0; j--) {
            if (source[j - 1].value < source[j].value) {
                temp = source[j - 1];
                source[j - 1] = source[j];
                source[j] = temp;
                times += 1;
            }
        }
    }

    resolve(times);
});

export const SORT_DELAY_DURATION: number = 1;
// export const SORT_DELAY_DURATION: number = 500;
// export const SORT_DELAY_DURATION: number = 5;

export class SortCanvasUtils {

    private canvas: HTMLCanvasElement;
    private context: CanvasRenderingContext2D | null = null;
    private source: SortDataModel[] = [];
    private width: number = 0;
    private height: number = 0;

    constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas;
        this.initialize();
    }

    private initialize(): void {
        this.context = this.canvas.getContext('2d');

        if (this.context) {
            this.width = this.canvas.width;
            this.height = this.canvas.height;
        }
    }

    public loadData(source: SortDataModel[]): void {
        this.source = source;
    }

    public clear(): void {
        if (this.context) {
            this.context.clearRect(0, 0, this.width, this.height);
            this.context.reset();
        }
    }

    public draw(): void {
        if (this.context) {
            let width: number = this.width / this.source.length, height: number = 0;
            
            this.context.clearRect(0, 0, this.width, this.height);
    
            for(let i = 0; i < this.source.length; i++) {
                height = this.source[i].value * this.height / this.source.length;
                this.drawColumn(this.source[i], i, width, height);
            }
        }
    }

    private drawColumn(model: SortDataModel, index: number, width: number, height: number): void {
        if (this.context) {
            this.context.fillStyle = model.color;
            this.context.fillRect(index * width, this.height - height, width, height);
        }
    }

}

export class SortFabricCanvasUtils {

    private canvas: fabric.Canvas | null = null;
    private source: SortDataModel[] = [];

    constructor(canvas: HTMLCanvasElement) {
        this.canvas = new fabric.Canvas(canvas, { width: 1580, height: 1068, backgroundColor: '#646464' });
    }

    public loadData(source: SortDataModel[]): void {
        this.source = source;
    }

    public draw(): void {
        if (this.canvas) {
            let width: number = (this.canvas.width as number) / this.source.length, height: number = 0;

            this.canvas.remove(...this.canvas.getObjects());
            
            for(let i = 0; i < this.source.length; i++) {
                height = this.source[i].value * (this.canvas.height as number) / this.source.length;
                this.canvas.add(new fabric.Rect({
                    fill: this.source[i].color,
                    top: (this.canvas.height as number) - height, left: i * width,
                    width, height
                }));
            }
        }
    }

}
