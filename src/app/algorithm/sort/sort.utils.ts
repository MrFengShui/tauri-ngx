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
        item.color = FINAL_COLOR;
        await delay(SORT_DELAY_DURATION);
        callback({ times, datalist: source });
    }

    callback({ times, datalist: source });
    resolve();
});

export const SORT_DELAY_DURATION: number = 1;

export const PRIMARY_COLOR = 'darkorchid';
export const SECONDARY_COLOR = 'darkorange';
export const ACCENT_COLOR = 'deeppink';

export const PRIMARY_ONE_COLOR = 'limegreen';
export const SECONDARY_ONE_COLOR = 'orangered';
export const ACCENT_ONE_COLOR = 'dodgerblue';

export const PRIMARY_TWO_COLOR = 'seagreen';
export const SECONDARY_TWO_COLOR = 'indianred';
export const ACCENT_TWO_COLOR = 'skyblue';

export const FINAL_COLOR = 'navy';
export const CLEAR_COLOR = 'snow';

export class SortCanvasUtils {

    private canvas: HTMLCanvasElement;
    private context: CanvasRenderingContext2D | null = null;
    private source: SortDataModel[] = [];
    private width: number = 0;
    private height: number = 0;

    constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas;
    }

    public create(width: number, height: number): void {
        this.context = this.canvas.getContext('2d');
        this.width = width;
        this.height = height;
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

    public draw(length: number): void {
        if (this.context) {
            let width: number = this.width / this.source.length, height: number = 0;
            
            this.context.clearRect(0, 0, this.width, this.height);
    
            for(let i = 0; i < this.source.length; i++) {
                height = (this.source[i].value === 0 || this.source[i].value === Number.MAX_SAFE_INTEGER || this.source[i].value === Number.MIN_SAFE_INTEGER) ? 0 : this.source[i].value * this.height / length;
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
