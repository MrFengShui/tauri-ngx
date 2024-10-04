import { CanvasDimension } from "../../../public/global.utils";
import { SortDataModel } from "../ngrx-store/sort.state";

export type SortCanvasReferenceInfo = { total: number, pivot: number };

export interface AbstractSortDataPublisher {

    subscribe(observer: AbstractSortDataSubscriber): void;
    unsubscribe(observer: AbstractSortDataSubscriber): void;
    notify(source: SortDataModel[], info: SortCanvasReferenceInfo, size: CanvasDimension): void;

}

export interface AbstractSortDataSubscriber {

    readonly ID: string;

    update(source: SortDataModel[], info: SortCanvasReferenceInfo, size: CanvasDimension): void;
    erase(size: CanvasDimension): void;

}

export class ConcreteSortDataPublisher implements AbstractSortDataPublisher {

    private subscribers: AbstractSortDataSubscriber[] | null = null;

    constructor() {
        if (!this.subscribers) this.subscribers = Array.from([]);
    }

    public subscribe(subscriber: AbstractSortDataSubscriber): void {
        const index: number = this.indexOf(subscriber);

        if (this.subscribers && index === -1) this.subscribers.push(subscriber);
    }

    public unsubscribe(subscriber: AbstractSortDataSubscriber): void {
        const index: number = this.indexOf(subscriber);

        if (this.subscribers && index !== -1) this.subscribers.splice(index, 1);
    }

    public notify(source: SortDataModel[], info: SortCanvasReferenceInfo, size: CanvasDimension): void {
        if (this.subscribers) {
            this.subscribers?.forEach(observer => 
                observer.update(source, info, size));
        }
    }

    private indexOf<T extends AbstractSortDataSubscriber>(target: T): number {
        if (this.subscribers) {
            return this.subscribers.findIndex(source => source.ID === target.ID);
        }
        
        return -1;
    }

}

export class ConcreteSortDataSubscriber implements AbstractSortDataSubscriber {

    readonly ID: string = window.crypto.randomUUID();

    constructor(protected _context: CanvasRenderingContext2D | null) {}

    public update(source: SortDataModel[], info: SortCanvasReferenceInfo, size: CanvasDimension): void {
        if (this._context) {
            const delta: number = size.width / info.total, scale: number = size.height / info.pivot;
            let model: SortDataModel, x: number = 0, y: number = 0, width: number = 0, height: number = 0;
            
            this.erase(size);
            
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

    public erase(size: CanvasDimension): void {
        if (this._context) {
            this._context.clearRect(0, 0, size.width, size.height);
            this._context.reset();
        }
    }

}