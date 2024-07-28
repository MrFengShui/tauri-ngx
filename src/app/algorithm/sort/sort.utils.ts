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

export class SortDataVisualBuilder {

    private context: CanvasRenderingContext2D | null = null;
    private maxValue: number = -1;
    private width: number = -1;
    private height: number = -1;

    public setContext(canvas: HTMLCanvasElement): SortDataVisualBuilder {
        if (!this.context) {
            this.context = canvas.getContext('2d');
        }
        
        return this;
    }

    public getContext(): CanvasRenderingContext2D | null {
        return this.context;
    }

    public setMaxValue(maxValue: number): SortDataVisualBuilder {
        if (this.maxValue !== maxValue) {
            this.maxValue = maxValue;
        }

        return this;
    }

    public getMaxValue(): number {
        return this.maxValue;
    }

    public setDimension(width: number, height: number): SortDataVisualBuilder {
        this.width = width;
        this.height = height;

        return this;
    }

    public getDimension(): { width: number, height: number } {
        return { width: this.width, height: this.height };
    }

    public build(): SortDataVisualFactory {
        return new SortDataVisualFactory(this.context, this.maxValue, this.width, this.height);
    }

}

export class SortDataVisualFactory {

    private context: CanvasRenderingContext2D | null = null;
    private maxValue: number = -1;
    private width: number = 0;
    private height: number = 0;

    constructor(context: CanvasRenderingContext2D | null, maxValue: number, width: number, height: number) {
        this.context = context;
        this.update(maxValue, width, height);
    }

    public update(maxValue: number, width: number, height: number): void {
        this.maxValue = maxValue;
        this.width = width;
        this.height = height;
    }

    public erase(): void {
        this.context?.clearRect(0, 0, this.width, this.height);
        this.context?.reset();
    }

    public draw(source: SortDataModel[], length: number): void {
        if (this.context) {
            const delta: number = this.width / length, scale: number = this.height / this.maxValue;
            let model: SortDataModel, x: number = 0, y: number = 0, width: number = 0, height: number = 0;
            
            this.context.clearRect(0, 0, this.width, this.height);
            
            for(let i = 0; i < length; i++) {
                model = source[i];

                width = delta;
                height = (model.value === 0 || model.value === Number.MAX_SAFE_INTEGER || model.value === Number.MIN_SAFE_INTEGER) ? 0 : model.value * scale;

                x = i === 0 ? 0 : x + delta;
                y = this.height - height;

                this.context.fillStyle = model.color;
                this.context.fillRect(x, y, width, height);
            }
        }
    }

}

