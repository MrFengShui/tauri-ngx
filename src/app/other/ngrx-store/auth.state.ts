export const CRYPTO_SECRET_KEY: string = window.btoa('tauri-app');

export interface AuthAccountModel {

    username: string;
    password: string;

}

export interface AuthProfileAvatarModel {

    source: string;
    name: string;
    size: number;
    timestamp: number;

}

export interface AuthProfileModel {

    avatar: AuthProfileAvatarModel;
    nickname: string;
    createTime: number;
    updateTime: number;

}

export interface AuthAccountProfileModel {

    id: string;
    account: AuthAccountModel;
    profile: AuthProfileModel;

}

export interface AuthAccountProfileFormModel {

    state: 'create' | 'update' | null;
    value: AuthAccountProfileModel;

}

export interface AuthReducerState<T = any> {

    action: string;
    result: T | null;
    message: string;

}