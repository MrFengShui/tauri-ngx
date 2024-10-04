import { SortName, SortType } from "../../algorithm/sort/ngrx-store/sort.state";
import { ColorType } from "../../ngrx-store/app.state";

export type LocaleFlagType = 'usa' | 'china';
export type LocaleIDType = 'en-US' | 'zh-Hans' | 'zh-Hant';
export type RouteUrlParam = { url?: string[], param?: SortName, mark?: boolean, i18n?: string, type?: SortType };

export interface StyleNameOptionModel {

    name: string;
    text: string;

}

export interface StyleColorOptionModel {

    name: ColorType;
    text: string;
    code: string;

}

export interface LocaleOptionModel {

    name: LocaleIDType;
    text: string;
    flag: LocaleFlagType;

}

export interface HomeReducerState<T = any> {

    action: string;
    result: Array<T>;
    message: string;

}

