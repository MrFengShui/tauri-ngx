import { Injectable } from "@angular/core";
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { exhaustMap, map } from "rxjs";

import { AppConfigService, AppNavlistService, AppStyleService } from "../app.service";

import { APP_NAVLIST_LOAD_ACTION, APP_NAVLIST_LOAD_DONE_ACTION, APP_CONFIG_STYLE_COLOR_LOAD_ACTION, APP_CONFIG_STYLE_COLOR_LOAD_DONE_ACTION, APP_CONFIG_STYLE_NAME_LOAD_ACTION, APP_CONFIG_STYLE_NAME_LOAD_DONE_ACTION, APP_STYLE_CHANGE_ACTION, APP_STYLE_CHANGE_DONE_ACTION, APP_STYLE_CHECK_ACTION, APP_STYLE_CHECK_DONE_ACTION, APP_STYLE_FETCH_ACTION, APP_STYLE_FETCH_DONE_ACTION, APP_STYLE_THEME_FETCH_ACTION } from "./app.action";

@Injectable()
export class AppStyleEffect {

    check$ = createEffect(() => this._actions
        .pipe(
            ofType(APP_STYLE_CHECK_ACTION),
            exhaustMap(action => this._service.hasStyle()
                .pipe(map(value => APP_STYLE_CHECK_DONE_ACTION({ action: action.type, value }))))
        ));

    fetch$ = createEffect(() => this._actions
        .pipe(
            ofType(APP_STYLE_FETCH_ACTION),
            exhaustMap(action => this._service.fetchStyle()
                .pipe(map(value => APP_STYLE_FETCH_DONE_ACTION({ action: action.type, value }))))
        ));

    fetchStyleTheme$ = createEffect(() => this._actions
        .pipe(
            ofType(APP_STYLE_THEME_FETCH_ACTION),
            exhaustMap(action => this._service.fetchStyleTheme()
                .pipe(map(value => APP_STYLE_FETCH_DONE_ACTION({ action: action.type, value }))))
        ));

    change$ = createEffect(() => this._actions
        .pipe(
            ofType(APP_STYLE_CHANGE_ACTION),
            exhaustMap(action => this._service
                .storeStyle({ name: action.name, theme: action.theme, color: action.color })
                .pipe(map(value => APP_STYLE_CHANGE_DONE_ACTION({ action: action.type, value }))))
        ));

    constructor(
        private _actions: Actions,
        private _service: AppStyleService
    ) { }

}

@Injectable()
export class AppConfigEffect {

    loadStyleName$ = createEffect(() => this._actions
        .pipe(
            ofType(APP_CONFIG_STYLE_NAME_LOAD_ACTION),
            exhaustMap(action => this._service.loadStyleNameConfigFile()
                .pipe(map(value => APP_CONFIG_STYLE_NAME_LOAD_DONE_ACTION({ action: action.type, value }))))
        ));

    loadStyleColor$ = createEffect(() => this._actions
        .pipe(
            ofType(APP_CONFIG_STYLE_COLOR_LOAD_ACTION),
            exhaustMap(action => this._service.loadStyleColorConfigFile()
                .pipe(map(value => APP_CONFIG_STYLE_COLOR_LOAD_DONE_ACTION({ action: action.type, value }))))
        ));

    constructor(
        private _actions: Actions,
        private _service: AppConfigService
    ) { }

}

@Injectable()
export class AppNavlistEffect {

    load$ = createEffect(() => this._actions
        .pipe(
            ofType(APP_NAVLIST_LOAD_ACTION),
            exhaustMap(action => this._service.loadNavlistFile()
                .pipe(map(value => APP_NAVLIST_LOAD_DONE_ACTION({ action: action.type, value }))))
        ));

    constructor(
        private _actions: Actions,
        private _service: AppNavlistService
    ) { }

}