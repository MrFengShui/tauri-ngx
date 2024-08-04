import { Observable } from "rxjs";

import { SortDataModel, SortOrder, SortStateModel } from "../ngrx-store/sort.state";

export abstract class BaseSortService {

    protected readonly THRESHOLD: number = 24;

    protected stack: number[] = Array.from([]);

    public sort(array: SortDataModel[], order: SortOrder, option?: string | number): Observable<SortStateModel> {
        return new Observable(subscriber => {
            if (order === 'ascent') {
                this.sortByAscent(array, 0, array.length - 1, option, param => subscriber.next(param))
                    .then(() => subscriber.complete())
                    .catch(error => subscriber.error(error));
            }
    
            if (order === 'descent') {
                this.sortByDescent(array, 0, array.length - 1, option, param => subscriber.next(param))
                    .then(() => subscriber.complete())
                    .catch(error => subscriber.error(error));
            }
        });
    }

    protected abstract sortByAscent(source: SortDataModel[], lhs: number, rhs: number, option: string | number | undefined, callback: (param: SortStateModel) => void): Promise<void>;

    protected abstract sortByDescent(source: SortDataModel[], lhs: number, rhs: number, option: string | number | undefined, callback: (param: SortStateModel) => void): Promise<void>;

}