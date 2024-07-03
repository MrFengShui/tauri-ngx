import { TreeNode } from "primeng/api";

export interface IDBMetaDataModel { 

    dbName?: string;
    dbNames?: string[];
    dbVersion?: number;
    osName?: string;
    osNames?: string[];

};

export interface IDBObjectStoreOptionModel {

    keyPath: string;
    autoIncrement: boolean;
    unique: boolean;
    multiEntry: boolean

}

export interface IDBObjectStoreParamModel {

    metadata: IDBMetaDataModel;
    options: IDBObjectStoreOptionModel;

}

export interface IDBObjectStoreResultModel {

    name: string;
    list: TreeNode<IDBMetaDataModel>[];

}

export interface IDBState<T = any> {

    action: string;
    result: T | null;
    message: string;

}

