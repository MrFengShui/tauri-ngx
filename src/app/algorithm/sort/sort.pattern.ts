import { CanvasDimension } from "../../public/global.utils";
import { SortDataModel } from "./ngrx-store/sort.state";

export type SortCanvasReferenceInfo = { total: number, pivot: number };

export interface SortDataSubject {

    addObserver(observer: SortDataObserver): void;
    removeObserver(observer: SortDataObserver): void;
    notify(source: SortDataModel[], info: SortCanvasReferenceInfo, size: CanvasDimension): void;

}

export interface SortDataObserver {

    update(source: SortDataModel[], info: SortCanvasReferenceInfo, size: CanvasDimension): void;

}

export class SortDataAsyncSubject implements SortDataSubject {

    private observers: SortDataObserver[] | null = null;

    constructor() {
        if (this.observers === null) {
            this.observers = Array.from([]);
        }
    }

    public addObserver(observer: SortDataObserver): void {
        const index: number | undefined = this.observers?.indexOf(observer);

        if (!index || index === -1) {
            this.observers?.push(observer);
        }
    }

    public removeObserver(observer: SortDataObserver): void {
        const index: number | undefined = this.observers?.indexOf(observer);

        if (index && index !== -1) {
            this.observers?.splice(index, 1);
        }
    }

    public notify(source: SortDataModel[], info: SortCanvasReferenceInfo, size: CanvasDimension): void {
        this.observers?.forEach(observer => observer.update(source, info, size));
    }

}

export class SortDataAsyncObserver implements SortDataObserver {

    constructor(
        private _subject: SortDataSubject,
        private _context: CanvasRenderingContext2D | null
    ) {
        this._subject.addObserver(this);
    }

    public update(source: SortDataModel[], info: SortCanvasReferenceInfo, size: CanvasDimension): void {
        if (this._context) {
            const delta: number = size.width / info.total, scale: number = size.height / info.pivot;
            let model: SortDataModel, x: number = 0, y: number = 0, width: number = 0, height: number = 0;
            
            this.erase(size.width, size.height);
            
            for(let i = 0; i < info.total; i++) {
                model = source[i];
                
                width = delta;
                height = (model.value === 0 || model.value === Number.MAX_SAFE_INTEGER || model.value === Number.MIN_SAFE_INTEGER) ? 0 : model.value * scale;
                
                x = i === 0 ? 0 : x + delta;
                y = size.height - height;
                
                this._context.fillStyle = model.color;
                this._context.fillRect(x, y, width, height);
            }
        }
    }

    private erase(width: number, height: number): void {
        this._context?.clearRect(0, 0, width, height);
        this._context?.reset();
    }

}