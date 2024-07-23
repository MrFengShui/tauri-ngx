import { FINAL_COLOR } from "../../public/values.utils";
import { SortDataModel, SortStateModel } from "./ngrx-store/sort.state";

export const delay = (duration: number = 10): Promise<void> => new Promise<void>(resolve => setTimeout(resolve, duration));

export const swap = (source: SortDataModel[], fst: number, snd: number, temp: SortDataModel) => new Promise<void>(resolve => {
    const task = setTimeout(() => {
        clearTimeout(task);
        temp = source[fst];
        source[fst] = source[snd];
        source[snd] = temp;
        resolve();
    });
});

export const complete = (source: SortDataModel[], times: number, callback: (parram: SortStateModel) => void) => new Promise<void>(async (resolve) => {
    for (let i = 0; i < source.length; i++) {
        source[i].color = FINAL_COLOR;
        callback({ times, datalist: source });
        
        await delay(SORT_DELAY_DURATION);
    }

    callback({ times, datalist: source });

    if (source.length > 0) {
        source.splice(0);
        resolve();
    }
});

export const SORT_DELAY_DURATION: number = 1;

export class SortCanvasUtils {

    private readonly THRESHOLD: number = 128;

    private canvas: HTMLCanvasElement;
    private context: CanvasRenderingContext2D | null = null;
    private source: SortDataModel[] = [];
    private maxValue: number = -1;
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

    public setMaxValue(value: number): void {
        if (this.maxValue !== value) {
            this.maxValue = value;
        }
    }

    public clear(): void {
        if (this.context) {
            this.context.clearRect(0, 0, this.width, this.height);
            this.context.reset();
        }
    }

    public draw(length: number): void {
        if (this.context) {
            const width: number = this.width / length;
            let height: number = 0;
            
            this.context.clearRect(0, 0, this.width, this.height);
            
            for(let i = 0; i < length; i++) {
                height = (this.source[i].value === 0 || this.source[i].value === Number.MAX_SAFE_INTEGER || this.source[i].value === Number.MIN_SAFE_INTEGER) ? 0 : this.source[i].value * this.height / this.maxValue;
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

