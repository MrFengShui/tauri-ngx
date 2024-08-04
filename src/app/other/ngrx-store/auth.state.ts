import { HmacSHA256, PBKDF2 } from "crypto-js";

const salt: string = window.btoa('tauri-ngx');
const password: string = HmacSHA256('tauri-ngx', salt).toString();
export const CRYPTO_SECRET_KEY: string = PBKDF2(password, salt, { keySize: 256, iterations: 1024 }).toString();

export const AuthTokenIssuer: string = window.btoa('tauri-ngx-admin');
export const AuthTokenID: string = HmacSHA256(window.crypto.randomUUID(), AuthTokenIssuer).toString();

export type AuthTokenTimeRange = { startTime: number, finalTime: number };

export interface AuthTokenPublicModel {

    id: string;
    issuer: string;
    subject: string;
    timestamp: number;

}

export interface AuthTokenPrivateModel {

    username: string;
    password: string;
    timerange: AuthTokenTimeRange;

}

export interface AuthUserTokenModel {

    publicInfo: AuthTokenPublicModel | null;
    privateInfo: AuthTokenPrivateModel | null;

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