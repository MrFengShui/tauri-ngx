export type SortOrder = 'ascent' | 'descent';
export type SortRadix = 2 | 8 | 10 | 16;
export type SortStateModel = { completed: boolean, times?: number, datalist: SortDataModel[] };

export interface SortRadixBaseModel {

    label: string;
    value: SortRadix;
    
}

export interface SortDataRadixModel {

    bin: string;
    oct: string;
    dec: string;
    hex: string;

}

export interface SortDataModel {

    value: number;
    color: string;
    radix?: SortDataRadixModel;

}

export interface SortReducerState {

    completed: boolean;
    datalist: SortDataModel[];

}