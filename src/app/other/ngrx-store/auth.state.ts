export const CRYPTO_SECRET_KEY: string = window.btoa('tauri-app');

export interface AuthResponseModel {

    status: 'success' | 'failure';
    subject: string;
    message: string;

}

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

    id: string;
    avatar: AuthProfileAvatarModel;
    nickname: string;
    createTime: number;
    updateTime: number;

}

export interface AuthAccountProfileModel {

    account: AuthAccountModel;
    profile: AuthProfileModel;

}

export interface AuthDialogDataPassModel {

    action: 'create' | 'update' | null;
    account: AuthAccountModel;
    profile: AuthProfileModel;

}

export interface AuthReducerState {

    action: string;
    value?: AuthAccountProfileModel[] | AuthAccountProfileModel;
    response?: AuthResponseModel;

}