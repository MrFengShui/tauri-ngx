export type ShearMode = 'insertion' | 'selection';
export type SortOrder = 'ascent' | 'descent';
export type SortRadix = 2 | 8 | 10 | 16 | number;
export type SortMergeWay = 3 | 4 | 6 | 8;
export type SortHeapNode = 3 | 4 | 6 | 8;
export type SortStateModel = { times: number, datalist: SortDataModel[] };
export type SortDataRange = { min: number, max: number };
export type SortIndexRange = { start: number, final: number };

export interface SortMetadataModel {

    unique: boolean;
    length: number;
    range: SortDataRange;
    timestamp: number;
    data: string;

}

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
    radix?: string;

}

export interface SortOptionLoadState<T = any> {

    action: string;
    result: Array<T>;
    message: string;

}
