import { Injectable } from "@angular/core";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { catchError, exhaustMap, map } from "rxjs";

import { AuthRegisterService } from "./auth.service";
import { 
    AUTH_ADD_USER_ACTION, AUTH_ADD_USER_DONE_ACTION, 
    AUTH_FIND_ALL_USERS_ACTION, AUTH_FIND_ALL_USERS_DONE_ACTION, 
    AUTH_FIND_USER_ACTION, AUTH_FIND_USER_DONE_ACTION, 
    AUTH_MODIFY_USER_ACTION, AUTH_MODIFY_USER_DONE_ACTION, 
    AUTH_REMOVE_ALL_USERS_ACTION, AUTH_REMOVE_ALL_USERS_DONE_ACTION, 
    AUTH_REMOVE_USER_ACTION, AUTH_REMOVE_USER_DONE_ACTION
} from "./auth.action";

@Injectable()
export class AuthRegisterEffect {

    insert$ = createEffect(() => this._actions
        .pipe(
            ofType(AUTH_ADD_USER_ACTION),
            exhaustMap(action => this._service.insertUser(action.dbName, action.dbVersion, action.osName, action.data)
                .pipe(
                    map(value => 
                        AUTH_ADD_USER_DONE_ACTION({ action: AUTH_ADD_USER_ACTION.type, result: value, message: '添加用户成功' })),
                    catchError(async () => 
                        AUTH_ADD_USER_DONE_ACTION({ action: AUTH_ADD_USER_ACTION.type, result: [], message: '添加用户失败' }))
                ))
        ));

    deleteAll$ = createEffect(() => this._actions
        .pipe(
            ofType(AUTH_REMOVE_ALL_USERS_ACTION),
            exhaustMap(action => this._service.deleteAllUsers(action.dbName, action.dbVersion, action.osName)
                .pipe(
                    map(value => 
                        AUTH_REMOVE_ALL_USERS_DONE_ACTION({ action: AUTH_REMOVE_ALL_USERS_ACTION.type, result: value, message: '删除全部用户成功' })),
                    catchError(async () => 
                        AUTH_REMOVE_ALL_USERS_DONE_ACTION({ action: AUTH_REMOVE_ALL_USERS_ACTION.type, result: [], message: '删除全部用户失败' }))
                ))
        ));

    delete$ = createEffect(() => this._actions
        .pipe(
            ofType(AUTH_REMOVE_USER_ACTION),
            exhaustMap(action => this._service.deleteUser(action.dbName, action.dbVersion, action.osName, action.key)
                .pipe(
                    map(value => 
                        AUTH_REMOVE_USER_DONE_ACTION({ action: AUTH_REMOVE_USER_ACTION.type, result: value, message: '删除用户成功' })),
                    catchError(async () => 
                        AUTH_REMOVE_USER_DONE_ACTION({ action: AUTH_REMOVE_USER_ACTION.type, result: [], message: '删除用户失败' }))
                ))
        ));

    update$ = createEffect(() => this._actions
        .pipe(
            ofType(AUTH_MODIFY_USER_ACTION),
            exhaustMap(action => this._service.updateUser(action.dbName, action.dbVersion, action.osName, action.data)
                .pipe(
                    map(value => 
                        AUTH_MODIFY_USER_DONE_ACTION({ action: AUTH_MODIFY_USER_ACTION.type, result: value, message: '修改用户成功' })),
                    catchError(async () => 
                        AUTH_MODIFY_USER_DONE_ACTION({ action: AUTH_MODIFY_USER_ACTION.type, result: [], message: '修改用户失败' }))
                ))
        ));

    selectAll$ = createEffect(() => this._actions
        .pipe(
            ofType(AUTH_FIND_ALL_USERS_ACTION),
            exhaustMap(action => this._service.selectAllUsers(action.dbName, action.dbVersion, action.osName)
                .pipe(
                    map(value => 
                        AUTH_FIND_ALL_USERS_DONE_ACTION({ action: AUTH_FIND_ALL_USERS_ACTION.type, result: value, message: '查询全部用户成功' })),
                    catchError(async () => 
                        AUTH_FIND_ALL_USERS_DONE_ACTION({ action: AUTH_FIND_ALL_USERS_ACTION.type, result: [], message: '查询全部用户失败' }))
                ))
        ));

    select$ = createEffect(() => this._actions
        .pipe(
            ofType(AUTH_FIND_USER_ACTION),
            exhaustMap(action => this._service.selectUser(action.dbName, action.dbVersion, action.osName, action.key)
                .pipe(
                    map(value => 
                        AUTH_FIND_USER_DONE_ACTION({ action: AUTH_FIND_USER_ACTION.type, result: value, message: '查询用户成功' })),
                    catchError(async () => 
                        AUTH_FIND_USER_DONE_ACTION({ action: AUTH_FIND_USER_ACTION.type, result: null, message: '查询用户失败' }))
                ))
        ));

    constructor(
        private _actions: Actions,
        private _service: AuthRegisterService
    ) {}

}