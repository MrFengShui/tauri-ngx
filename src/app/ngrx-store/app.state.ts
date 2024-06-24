import { TreeNode } from "primeng/api";

export type ThemeType = 'dark' | 'light';
export type ColorType = 'amber' | 'blue' | 'indigo' | 'pink' | 'purple' | 'teal';

export interface AppStyleColorModel {

    name: ColorType;
    text: string;
    code: string;

}

export interface AppStyleNameModel {

    name: string;
    text: string;

}

export interface AppStyleStructModel {

    name: string;
    theme: ThemeType;
    color: ColorType;

}

export interface AppStyleModel {

    mode: boolean;
    name: string;
    struct: AppStyleStructModel;

}

export interface AppStyleReducerState {

    action: string;
    value: AppStyleModel | ThemeType | boolean | null;

}

export interface AppConfigReducerState {

    action: string;
    value: AppStyleNameModel[] | AppStyleColorModel[] | TreeNode[];

}

export interface AppNavlistReducerState {

    action: string;
    value: TreeNode[];

}