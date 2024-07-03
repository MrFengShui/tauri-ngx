import { Injectable } from "@angular/core";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { exhaustMap, map, catchError } from "rxjs";

import { IDBDatabaseService, IDBObjectStoreService } from "./indexeddb.service";
import { GLOBAL_INDEXEDDB_CREATE_DATABASE_ACTION, GLOBAL_INDEXEDDB_CREATE_DATABASE_DONE_ACTION, GLOBAL_INDEXEDDB_FIND_ALL_DATABASES_ACTION, GLOBAL_INDEXEDDB_FIND_ALL_DATABASES_DONE_ACTION, GLOBAL_INDEXEDDB_CREATE_OBJECT_STORE_ACTION, GLOBAL_INDEXEDDB_CREATE_OBJECT_STORE_DONE_ACTION, GLOBAL_INDEXEDDB_FIND_ALL_OBJECT_STORES_ACTION, GLOBAL_INDEXEDDB_FIND_ALL_OBJECT_STORES_DONE_ACTION, GLOBAL_INDEXEDDB_DELETE_DATABASE_ACTION, GLOBAL_INDEXEDDB_DELETE_DATABASE_DONE_ACTION, GLOBAL_INDEXEDDB_DELETE_ALL_DATABASES_ACTION, GLOBAL_INDEXEDDB_DELETE_ALL_DATABASES_DONE_ACTION, GLOBAL_INDEXEDDB_UPGRADE_DATABASE_ACTION, GLOBAL_INDEXEDDB_UPGRADE_DATABASE_DONE_ACTION, GLOBAL_INDEXEDDB_DELETE_OBJECT_STORE_ACTION, GLOBAL_INDEXEDDB_DELETE_OBJECT_STORE_DONE_ACTION, GLOBAL_INDEXEDDB_DELETE_ALL_OBJECT_STORES_ACTION, GLOBAL_INDEXEDDB_DELETE_ALL_OBJECT_STORES_DONE_ACTION, GLOBAL_INDEXEDDB_FIND_ALL_ACTION, GLOBAL_INDEXEDDB_FIND_ALL_DONE_ACTION } from "./indexeddb.action";

@Injectable()
export class IDBDatabaseEffect {

    createDatabase$ = createEffect(() => this._actions
        .pipe(
            ofType(GLOBAL_INDEXEDDB_CREATE_DATABASE_ACTION),
            exhaustMap(action => this._service.createDatabase(action.dbName as string)
                .pipe(
                    map(value =>
                        GLOBAL_INDEXEDDB_CREATE_DATABASE_DONE_ACTION({ action: action.type, result: value, message: '创建数据库成功' })),
                    catchError(async () =>
                        GLOBAL_INDEXEDDB_CREATE_DATABASE_DONE_ACTION({ action: action.type, result: false, message: '创建数据库失败' }))
                ))
        ));

    deleteDatabase$ = createEffect(() => this._actions
        .pipe(
            ofType(GLOBAL_INDEXEDDB_DELETE_DATABASE_ACTION),
            exhaustMap(action => this._service.deleteDatabase(action.dbName as string)
                .pipe(
                    map(value =>
                        GLOBAL_INDEXEDDB_DELETE_DATABASE_DONE_ACTION({ action: action.type, result: value, message: '删除数据库成功' })),
                    catchError(async () =>
                        GLOBAL_INDEXEDDB_DELETE_DATABASE_DONE_ACTION({ action: action.type, result: false, message: '删除数据库失败' }))
                ))
        ));

    deleteAllDatabases$ = createEffect(() => this._actions
        .pipe(
            ofType(GLOBAL_INDEXEDDB_DELETE_ALL_DATABASES_ACTION),
            exhaustMap(action => this._service.deleteAllDatabases(action.dbNames as string[])
                .pipe(
                    map(value =>
                        GLOBAL_INDEXEDDB_DELETE_ALL_DATABASES_DONE_ACTION({ action: action.type, result: value, message: '删除数据库成功' })),
                    catchError(async () =>
                        GLOBAL_INDEXEDDB_DELETE_ALL_DATABASES_DONE_ACTION({ action: action.type, result: false, message: '删除数据库失败' }))
                ))
        ));

    upgradeDatabase$ = createEffect(() => this._actions
        .pipe(
            ofType(GLOBAL_INDEXEDDB_UPGRADE_DATABASE_ACTION),
            exhaustMap(action => this._service.upgradeDatabase(action.dbName as string, action.dbVersion as number)
                .pipe(
                    map(value =>
                        GLOBAL_INDEXEDDB_UPGRADE_DATABASE_DONE_ACTION({ action: action.type, result: value, message: '升级数据库成功' })),
                    catchError(async () =>
                        GLOBAL_INDEXEDDB_UPGRADE_DATABASE_DONE_ACTION({ action: action.type, result: false, message: '升级数据库失败' }))
                ))
        ));

    selectAllDatabases$ = createEffect(() => this._actions
        .pipe(
            ofType(GLOBAL_INDEXEDDB_FIND_ALL_DATABASES_ACTION),
            exhaustMap(action => this._service.selectAllDatabases()
                .pipe(
                    map(value =>
                        GLOBAL_INDEXEDDB_FIND_ALL_DATABASES_DONE_ACTION({ action: action.type, result: value, message: '查询所有数据库成功' })),
                    catchError(async () =>
                        GLOBAL_INDEXEDDB_FIND_ALL_DATABASES_DONE_ACTION({ action: action.type, result: [], message: '查询所有数据库失败' }))
                ))
        ));

    selectAll$ = createEffect(() => this._actions
        .pipe(
            ofType(GLOBAL_INDEXEDDB_FIND_ALL_ACTION),
            exhaustMap(action => this._service.selectAll()
                .pipe(
                    map(value =>
                        GLOBAL_INDEXEDDB_FIND_ALL_DONE_ACTION({ action: action.type, result: value, message: '查询所有成功' })),
                    catchError(async () =>
                        GLOBAL_INDEXEDDB_FIND_ALL_DONE_ACTION({ action: action.type, result: [], message: '查询所失败' }))
                ))
        ));

    constructor(
        private _actions: Actions,
        private _service: IDBDatabaseService
    ) {}

}

@Injectable()
export class IDBObjectStoreEffect {

    createObjectStore$ = createEffect(() => this._actions
        .pipe(
            ofType(GLOBAL_INDEXEDDB_CREATE_OBJECT_STORE_ACTION),
            exhaustMap(action => this._service.createObjectStore(action)
                .pipe(
                    map(value =>
                        GLOBAL_INDEXEDDB_CREATE_OBJECT_STORE_DONE_ACTION({ action: action.type, result: value, message: '创建存储表成功' })),
                    catchError(async () =>
                        GLOBAL_INDEXEDDB_CREATE_OBJECT_STORE_DONE_ACTION({ action: action.type, result: null, message: '创建存储表失败' }))
                ))
        ));

    deleteObjectStore$ = createEffect(() => this._actions
        .pipe(
            ofType(GLOBAL_INDEXEDDB_DELETE_OBJECT_STORE_ACTION),
            exhaustMap(action => this._service.deleteObjectStore(action.dbName as string, (action.dbVersion as number) + 1, action.osName as string)
                .pipe(
                    map(value =>
                        GLOBAL_INDEXEDDB_DELETE_OBJECT_STORE_DONE_ACTION({ action: action.type, result: value, message: '删除存储表成功' })),
                    catchError(async () =>
                        GLOBAL_INDEXEDDB_DELETE_OBJECT_STORE_DONE_ACTION({ action: action.type, result: null, message: '删除存储表失败' }))
                ))
        ));

    deleteAllObjectStores$ = createEffect(() => this._actions
        .pipe(
            ofType(GLOBAL_INDEXEDDB_DELETE_ALL_OBJECT_STORES_ACTION),
            exhaustMap(action => this._service.deleteAllObjectStores(action.dbName as string, (action.dbVersion as number) + 1, action.osNames as string[])
                .pipe(
                    map(value =>
                        GLOBAL_INDEXEDDB_DELETE_ALL_OBJECT_STORES_DONE_ACTION({ action: action.type, result: value, message: '删除存储表成功' })),
                    catchError(async () =>
                        GLOBAL_INDEXEDDB_DELETE_ALL_OBJECT_STORES_DONE_ACTION({ action: action.type, result: null, message: '删除存储表失败' }))
                ))
        ));

    selectAllObjectStores$ = createEffect(() => this._actions
        .pipe(
            ofType(GLOBAL_INDEXEDDB_FIND_ALL_OBJECT_STORES_ACTION),
            exhaustMap(action => this._service.selectAllObjectStores(action.dbName as string)
                .pipe(
                    map(value =>
                        GLOBAL_INDEXEDDB_FIND_ALL_OBJECT_STORES_DONE_ACTION({ action: action.type, result: value, message: '查询所有存储表成功' })),
                    catchError(async () =>
                        GLOBAL_INDEXEDDB_FIND_ALL_OBJECT_STORES_DONE_ACTION({ action: action.type, result: { name: action.dbName as string, list: [] }, message: '查询所有存储表失败' }))
                ))
        ));

        constructor(
            private _actions: Actions,
            private _service: IDBObjectStoreService
        ) {}
  
}