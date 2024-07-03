export type ThemeType = 'dark' | 'light';
export type ColorType = 'amber' | 'blue' | 'indigo' | 'pink' | 'purple' | 'teal';

export interface AppStyleModel {

    mode: boolean;
    name: string;
    theme: ThemeType;
    color: ColorType;

}

export interface AppReducerState<T = any> {

    action: string;
    result: T | null;
    message: string;

}
