import { Injectable } from "@angular/core";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { catchError, exhaustMap, map } from "rxjs";

import { AuthIndexedDBService } from "./auth.service";
import { 
    AUTH_ADD_USER_ACTION, AUTH_ADD_USER_DONE_ACTION, 
    AUTH_CREATE_DATABASE_AND_STORE_ACTION, AUTH_CREATE_DATABASE_AND_STORE_DONE_ACTION, 
    AUTH_FIND_ALL_USERS_ACTION, AUTH_FIND_ALL_USERS_DONE_ACTION, 
    AUTH_FIND_USER_ACTION, AUTH_FIND_USER_DONE_ACTION, 
    AUTH_MODIFY_USER_ACTION, AUTH_MODIFY_USER_DONE_ACTION, 
    AUTH_REMOVE_ALL_USERS_ACTION, AUTH_REMOVE_ALL_USERS_DONE_ACTION, 
    AUTH_REMOVE_USER_ACTION, AUTH_REMOVE_USER_DONE_ACTION
} from "./auth.action";

@Injectable()
export class AuthEffect {

    create$ = createEffect(() => this._actions
        .pipe(
            ofType(AUTH_CREATE_DATABASE_AND_STORE_ACTION),
            exhaustMap(action => this._service.createDatabaseAndStores(action.version)
                .pipe(
                    map(() => 
                        AUTH_CREATE_DATABASE_AND_STORE_DONE_ACTION({ action: AUTH_CREATE_DATABASE_AND_STORE_ACTION.type, response: { status: 'success', subject: '成功', message: '创建数据库和数据表成功' } })),
                    catchError(async () => 
                        AUTH_CREATE_DATABASE_AND_STORE_DONE_ACTION({ action: AUTH_CREATE_DATABASE_AND_STORE_ACTION.type, response: { status: 'failure', subject: '失败', message: '创建数据库和数据表失败' } }))
                ))
        ));

    insert$ = createEffect(() => this._actions
        .pipe(
            ofType(AUTH_ADD_USER_ACTION),
            exhaustMap(action => this._service.insertUser(action)
                .pipe(
                    map(() => 
                        AUTH_ADD_USER_DONE_ACTION({ action: AUTH_ADD_USER_ACTION.type, response: { status: 'success', subject: '成功', message: '添加用户成功' } })),
                    catchError(async () => 
                        AUTH_ADD_USER_DONE_ACTION({ action: AUTH_ADD_USER_ACTION.type, response: { status: 'failure', subject: '失败', message: '添加用户失败' } }))
                ))
        ));

    delete$ = createEffect(() => this._actions
        .pipe(
            ofType(AUTH_REMOVE_USER_ACTION),
            exhaustMap(action => this._service.deleteUser(action.accountKey, action.profileKey)
                .pipe(
                    map(() => 
                        AUTH_REMOVE_USER_DONE_ACTION({ action: AUTH_REMOVE_USER_ACTION.type, response: { status: 'success', subject: '成功', message: '删除用户成功' } })),
                    catchError(async () => 
                        AUTH_REMOVE_USER_DONE_ACTION({ action: AUTH_REMOVE_USER_ACTION.type, response: { status: 'failure', subject: '失败', message: '删除用户失败' } }))
                ))
        ));

    deleteAll$ = createEffect(() => this._actions
        .pipe(
            ofType(AUTH_REMOVE_ALL_USERS_ACTION),
            exhaustMap(() => this._service.deleteAllUsers()
                .pipe(
                    map(() => 
                        AUTH_REMOVE_ALL_USERS_DONE_ACTION({ action: AUTH_REMOVE_ALL_USERS_ACTION.type, response: { status: 'success', subject: '成功', message: '删除全部用户成功' } })),
                    catchError(async () => 
                        AUTH_REMOVE_ALL_USERS_DONE_ACTION({ action: AUTH_REMOVE_ALL_USERS_ACTION.type, response: { status: 'failure', subject: '失败', message: '删除全部用户失败' } }))
                ))
        ));

    update$ = createEffect(() => this._actions
        .pipe(
            ofType(AUTH_MODIFY_USER_ACTION),
            exhaustMap(action => this._service.updateUser(action)
                .pipe(
                    map(() => 
                        AUTH_MODIFY_USER_DONE_ACTION({ action: AUTH_MODIFY_USER_ACTION.type, response: { status: 'success', subject: '成功', message: '修改用户成功' } })),
                    catchError(async () => 
                        AUTH_MODIFY_USER_DONE_ACTION({ action: AUTH_MODIFY_USER_ACTION.type, response: { status: 'failure', subject: '失败', message: '修改用户失败' } }))
                ))
        ));

    select$ = createEffect(() => this._actions
        .pipe(
            ofType(AUTH_FIND_USER_ACTION),
            exhaustMap(action => this._service.deleteUser(action.accountKey, action.profileKey)
                .pipe(
                    map(() => 
                        AUTH_FIND_USER_DONE_ACTION({ action: AUTH_FIND_USER_ACTION.type, response: { status: 'success', subject: '成功', message: '查询用户成功' } })),
                    catchError(async () => 
                        AUTH_FIND_USER_DONE_ACTION({ action: AUTH_FIND_USER_ACTION.type, response: { status: 'failure', subject: '失败', message: '查询用户失败' } }))
                ))
        ));

    selectAll$ = createEffect(() => this._actions
        .pipe(
            ofType(AUTH_FIND_ALL_USERS_ACTION),
            exhaustMap(() => this._service.selectAllUsers()
                .pipe(
                    map(value => 
                        AUTH_FIND_ALL_USERS_DONE_ACTION({ action: AUTH_FIND_ALL_USERS_ACTION.type, value, response: { status: 'success', subject: '成功', message: '查询全部用户成功' } })),
                    catchError(async () => 
                        AUTH_FIND_ALL_USERS_DONE_ACTION({ action: AUTH_FIND_ALL_USERS_ACTION.type, response: { status: 'failure', subject: '失败', message: '查询全部用户失败' } }))
                ))
        ));

    constructor(
        private _actions: Actions,
        private _service: AuthIndexedDBService
    ) {}

}