import { Injectable } from "@angular/core";
import { Observable, merge, map, zip } from "rxjs";
import { cloneDeep } from "lodash";

import { AuthAccountProfileModel, AuthAccountModel, AuthProfileModel } from "./auth.state";
import { IDBPersistService } from "../../public/indexeddb/indexeddb.service";

@Injectable()
export class AuthRegisterService {

    public readonly AUTH_DATABASE_NAME: string = 'auth_database';
    public readonly AUTH_OBJECT_STORE_NAME: string = 'auth_object_store';

    constructor(private _service: IDBPersistService) {}

    /**
     * 向IndexedDB中插入一条用户记录。
     * @param dbName 
     * @param dbVersion 
     * @param osName 
     * @param data
     * @returns
     */
    public insertUser(dbName: string, dbVersion: number, osName: string, data: AuthAccountProfileModel): Observable<AuthAccountProfileModel[]> {
        return this._service.insert(dbName, dbVersion, osName, data);
    }

    /**
     * 从IndexedDB中删除全部用户记录。
     * @param dbName 
     * @param dbVersion 
     * @param osName 
     * @returns
     */
    public deleteAllUsers(dbName: string, dbVersion: number, osName: string): Observable<AuthAccountProfileModel[]> {
        return this._service.deleteAll(dbName, dbVersion, osName);
    }

    /**
     * 从IndexedDB中删除一条用户记录。
     * @param dbName
     * @param dbVersion
     * @param osName
     * @param key
     * @returns
     */
    public deleteUser(dbName: string, dbVersion: number, osName: string, key: IDBValidKey | IDBKeyRange): Observable<AuthAccountProfileModel[]> {
        return this._service.delete(dbName, dbVersion, osName, key);
    }

    /**
     * 执行IndexedDB更新操作。
     * @param dbName
     * @param dbVersion
     * @param osName
     * @param data 
     * @returns
     */
    public updateUser(dbName: string, dbVersion: number, osName: string, data: AuthAccountProfileModel): Observable<AuthAccountProfileModel[]> {
        return this._service.update<AuthAccountProfileModel>(dbName, dbVersion, osName, data);
    }

    /**
     * 从IndexedDB中查询全部用户记录。
     * @returns
     */
    public selectAllUsers(dbName: string, dbVersion: number, osName: string): Observable<AuthAccountProfileModel[]> {
        return this._service.selectAll(dbName, dbVersion, osName);
    }

    /**
     * 从IndexedDB中查询一条用户记录。
     * @returns
     */
    public selectUser(dbName: string, dbVersion: number, osName: string, key: IDBValidKey | IDBKeyRange): Observable<AuthAccountProfileModel> {
        return this._service.select(dbName, dbVersion, osName, key);
    }

}

@Injectable()
export class AuthJWTService {}

@Injectable()
export class AuthValidationService {}


