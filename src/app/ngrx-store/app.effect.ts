import { Injectable } from "@angular/core";
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, exhaustMap, map } from "rxjs";

import { AppStyleService } from "./app.service";

import { APP_STYLE_SAVE_ACTION, APP_STYLE_SAVE_DONE_ACTION, APP_STYLE_CHECK_ACTION, APP_STYLE_CHECK_DONE_ACTION, APP_STYLE_LOAD_ACTION, APP_STYLE_LOAD_DONE_ACTION, APP_STYLE_THEME_LOAD_ACTION, APP_STYLE_THEME_LOAD_DONE_ACTION, APP_STYLE_MODE_LOAD_ACTION, APP_STYLE_MODE_LOAD_DONE_ACTION, APP_STYLE_NAME_LOAD_ACTION, APP_STYLE_NAME_LOAD_DONE_ACTION, APP_STYLE_COLOR_LOAD_ACTION, APP_STYLE_COLOR_LOAD_DONE_ACTION } from "./app.action";

@Injectable()
export class AppStyleEffect {

    load$ = createEffect(() => this._actions
        .pipe(
            ofType(APP_STYLE_LOAD_ACTION),
            exhaustMap(action => this._service.loadStyle()
                .pipe(
                    map(value => 
                        APP_STYLE_LOAD_DONE_ACTION({ action: action.type, result: value, message: '' })),
                    catchError(async () => 
                        APP_STYLE_LOAD_DONE_ACTION({ action: action.type, result: null, message: '' }))
                ))
        ));

    loadStyleMode$ = createEffect(() => this._actions
        .pipe(
            ofType(APP_STYLE_MODE_LOAD_ACTION),
            exhaustMap(action => this._service.loadStyleMode()
                .pipe(
                    map(value => 
                        APP_STYLE_MODE_LOAD_DONE_ACTION({ action: action.type, result: value, message: '' })),
                    catchError(async () => 
                        APP_STYLE_MODE_LOAD_DONE_ACTION({ action: action.type, result: null, message: '' }))
                ))
        ));

    loadStyleName$ = createEffect(() => this._actions
        .pipe(
            ofType(APP_STYLE_NAME_LOAD_ACTION),
            exhaustMap(action => this._service.loadStyleName()
                .pipe(
                    map(value => 
                        APP_STYLE_NAME_LOAD_DONE_ACTION({ action: action.type, result: value, message: '' })),
                    catchError(async () => 
                        APP_STYLE_NAME_LOAD_DONE_ACTION({ action: action.type, result: null, message: '' }))
                ))
        ));

    loadStyleTheme$ = createEffect(() => this._actions
        .pipe(
            ofType(APP_STYLE_THEME_LOAD_ACTION),
            exhaustMap(action => this._service.loadStyleTheme()
                .pipe(
                    map(value => 
                        APP_STYLE_THEME_LOAD_DONE_ACTION({ action: action.type, result: value, message: '' })),
                    catchError(async () => 
                        APP_STYLE_THEME_LOAD_DONE_ACTION({ action: action.type, result: null, message: '' }))
                ))
        ));

    loadStyleColor$ = createEffect(() => this._actions
        .pipe(
            ofType(APP_STYLE_COLOR_LOAD_ACTION),
            exhaustMap(action => this._service.loadStyleColor()
                .pipe(
                    map(value => 
                        APP_STYLE_COLOR_LOAD_DONE_ACTION({ action: action.type, result: value, message: '' })),
                    catchError(async () => 
                        APP_STYLE_COLOR_LOAD_DONE_ACTION({ action: action.type, result: null, message: '' }))
                ))
        ));

    check$ = createEffect(() => this._actions
        .pipe(
            ofType(APP_STYLE_CHECK_ACTION),
            exhaustMap(action => this._service.hasStyle()
                .pipe(
                    map(value => 
                        APP_STYLE_CHECK_DONE_ACTION({ action: action.type, result: value, message: '' })),
                    catchError(async () => 
                        APP_STYLE_CHECK_DONE_ACTION({ action: action.type, result: null, message: '' }))
                ))
        ));

    save$ = createEffect(() => this._actions
        .pipe(
            ofType(APP_STYLE_SAVE_ACTION),
            exhaustMap(action => this._service.saveStyle({ 
                name: action.name, mode: action.theme === 'dark', 
                theme: action.theme, color: action.color 
            }).pipe(
                map(value => 
                    APP_STYLE_SAVE_DONE_ACTION({ action: action.type, result: value, message: '' })),
                catchError(async () => 
                    APP_STYLE_SAVE_DONE_ACTION({ action: action.type, result: null, message: '' }))
            ))
        ));

    constructor(
        private _actions: Actions,
        private _service: AppStyleService
    ) { }

}

