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

    private readonly THRESHOLD: number = 128;

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
            const width: number = this.width / this.source.length;
            let height: number = 0;
            
            this.context.clearRect(0, 0, this.width, this.height);

            for(let i = 0; i < length; i++) {
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

