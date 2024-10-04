import { HmacSHA256, PBKDF2 } from "crypto-js";

export type ShearMode = 'insertion' | 'selection';
export type SortOrder = 'ascent' | 'descent';
export type SortRadix = 2 | 8 | 10 | 16;
export type SortMergeWay = 3 | 4 | 6 | 8;
export type SortHeapNode = 3 | 4 | 6 | 8;

export type SortStateModel = { times: number, datalist: SortDataModel[] };
export type SortIndexRange = { start: number, final: number };
export type SortMetaInfo = { count: number; minValue: number; maxValue: number; };
export type SortOption = { radix: SortRadix, mergeWay: SortMergeWay, heapNode: SortHeapNode };

export type SortType = 1 | 2 | 3 | 4 | 5 | undefined;
export type SortName = 'exchange-sort' | 'bubble-sort' | 'shaker-bubble-sort' | 'dual-bubble-sort' | 'comb-sort' | 'shell-bubble-sort' | 'odd-even-sort' | 'shaker-odd-even-sort' | 'gnome-sort' | 'bin-gnome-sort' | 'insert-sort' | 'shaker-insert-sort' | 'bin-insert-sort' | 'shell-sort' | 'select-sort' | 'shaker-select-sort' | 'dual-select-sort' | 'heap-sort' |'mult-heap-sort' | 'recu-quick-sort' | 'iter-quick-sort' | 'recu-2way-quick-sort' | 'iter-2way-quick-sort' | 'recu-3way-quick-sort' | 'iter-3way-quick-sort' | 'recu-mean-quick-sort' | 'iter-mean-quick-sort' | 'recu-log-quick-sort' | 'iter-log-quick-sort' | 'recu-dual-pivot-quick-sort' | 'iter-dual-pivot-quick-sort' | 'recu-circle-sort' | 'iter-circle-sort' | 'pigeon-hole-sort' | 'inter-pole-sort' | 'bucket-sort' | 'ipbucket-sort' | 'recu-3slot-bucket-sort' | 'iter-3slot-bucket-sort' | 'flash-sort' | 'lsd-radix-sort' | 'recu-msd-radix-sort' | 'iter-msd-radix-sort' | 'lsd-ipradix-sort' | 'msd-ipradix-sort' | 'recu-merge-sort' | 'iter-merge-sort' | 'recu-ipmerge-sort' | 'iter-ipmerge-sort' | 'recu-weave-merge-sort' | 'iter-weave-merge-sort' | 'recu-weave-ipmerge-sort' | 'iter-weave-ipmerge-sort' | 'recu-bubble-merge-sort' | 'iter-bubble-merge-sort' | 'recu-comb-merge-sort' | 'iter-comb-merge-sort' | 'mult-merge-sort' | 'recu-log-sort' | 'iter-log-sort' | 'iplog-sort' | 'count-sort' | 'recu-batcher-merge-sort' | 'iter-batcher-merge-sort' | 'recu-bitonic-merge-sort' | 'iter-bitonic-merge-sort' | 'recu-pairwise-network-sort' | 'iter-pairwise-network-sort' | 'shear-sort' | 'insert-shear-sort' | 'select-shear-sort' | 'recu-intro-sort' | 'iter-intro-sort' | 'block-sort' | 'library-sort' | 'smooth-sort' | 'tim-sort' | 'iptim-sort' | 'tim-weave-sort' | 'bogo-sort' | 'block-bogo-sort' | 'bpbogo-sort' | 'shaker-bpbogo-sort' | 'bubble-bogo-sort' | 'shaker-bubble-bogo-sort' | 'insert-bogo-sort' | 'select-bogo-sort' | 'merge-bogo-sort' | 'bst-sort' | 'recu-cycle-sort' | 'iter-cycle-sort' | 'gravity-sort' | 'simple-gravity-sort' | 'guess-sort' | 'noodle-sort' | 'pancake-sort' | 'shaker-pancake-sort' | 'patience-sort' | 'block-sleep-sort' | 'async-sleep-sort' | 'slow-sort' | 'stalin-sort' | 'ipstalin-sort' | 'recu-strand-sort' | 'iter-strand-sort' | 'ipstrand-sort' | 'recu-stooge-sort' | 'iter-stooge-sort' | 'tournament-sort' | undefined;

export const GENERATE_SORTDATA_SECRETKEY = (timestamp: number): string => {
    const text: string = `tauri-ngx-sort-${timestamp}`;
    const salt: string = window.btoa(text);
    const password: string = HmacSHA256(text, salt).toString();
    return PBKDF2(password, salt, { keySize: 256, iterations: 1024 }).toString();
};

export interface SortDataExportModel {

    unique: boolean;
    metainfo: SortMetaInfo;
    timestamp: number;
    data: string;

}

export interface SortDataImportModel {

    unique: boolean;
    source: SortDataModel[];

}

export interface SortOptionModel {

    label: string;
    value: SortHeapNode | SortMergeWay | SortOrder | SortRadix;

}

export interface SortDataModel {

    value: number;
    color: string;
    radix?: string | number;

}

export interface SortResultState<T = any> {

    action: string;
    result: Array<T> | T;
    message: string;

}

