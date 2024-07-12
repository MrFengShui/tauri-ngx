export type SortOrder = 'ascent' | 'descent';
export type SortRadix = 2 | 8 | 10 | 16;
export type SortMergeWay = 3 | 4 | 6 | 8;
export type SortHeapNode = 3 | 4 | 6 | 8;
export type SortStateModel = { times: number, datalist: SortDataModel[] };

export interface SortDataRadixModel {

    bin: string;
    oct: string;
    dec: string;
    hex: string;

}

export interface SortRadixOptionModel {

    label: string;
    value: SortRadix;
    
}

export interface SortOrderOptionModel {

    label: string;
    value: SortOrder;

}

export interface SortMergeWayOptionModel {

    label: string;
    value: SortMergeWay;

}

export interface SortHeapNodeOptionModel {

    label: string;
    value: SortHeapNode;

}

export interface SortDataModel {

    value: number;
    color: string;
    radix?: SortDataRadixModel;

}

export interface SortOptionLoadState<T = any> {

    action: string;
    result: Array<T>;
    message: string;

}
