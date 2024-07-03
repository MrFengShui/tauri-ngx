import { Injectable } from "@angular/core";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { catchError, exhaustMap, map } from "rxjs";

import { HomeNavListLoadService, HomeOptionLoadService } from "./main.service";
import { 
    HOME_LOCALE_OPTION_LOAD_ACTION, HOME_LOCALE_OPTION_LOAD_DONE_ACTION,
    HOME_STYLE_COLOR_OPTION_LOAD_ACTION, HOME_STYLE_COLOR_OPTION_LOAD_DONE_ACTION, 
    HOME_STYLE_NAME_OPTION_LOAD_ACTION, HOME_STYLE_NAME_OPTION_LOAD_DONE_ACTION, 
    HONE_NAVLIST_LOAD_ACTION,
    Home_NAVLIST_LOAD_DONE_ACTION
} from "./main.action";

@Injectable()
export class HomeLoadStyleOptionEffect {

    loadStyleNameOption$ = createEffect(() => 
        this._actions.pipe(
            ofType(HOME_STYLE_NAME_OPTION_LOAD_ACTION),
            exhaustMap(action => this._service.loadStyleNameOption(action.localeID)
                .pipe(
                    map(value => 
                        HOME_STYLE_NAME_OPTION_LOAD_DONE_ACTION({ action: action.type, result: value, message: '' })),
                    catchError(async () => 
                        HOME_STYLE_NAME_OPTION_LOAD_DONE_ACTION({ action: action.type, result: [], message: '' }))
                ))
        ));

    loadStyleColorOption$ = createEffect(() => 
        this._actions.pipe(
            ofType(HOME_STYLE_COLOR_OPTION_LOAD_ACTION),
            exhaustMap(action => this._service.loadStyleColorOption(action.localeID)
                .pipe(
                    map(value => 
                        HOME_STYLE_COLOR_OPTION_LOAD_DONE_ACTION({ action: action.type, result: value, message: '' })),
                    catchError(async () => 
                        HOME_STYLE_COLOR_OPTION_LOAD_DONE_ACTION({ action: action.type, result: [], message: '' }))
                ))
        ));

    loadLocaleOption$ = createEffect(() => 
        this._actions.pipe(
            ofType(HOME_LOCALE_OPTION_LOAD_ACTION),
            exhaustMap(action => this._service.loadLocaleOption(action.localeID)
                .pipe(
                    map(value => 
                        HOME_LOCALE_OPTION_LOAD_DONE_ACTION({ action: action.type, result: value, message: '' })),
                    catchError(async () => 
                        HOME_LOCALE_OPTION_LOAD_DONE_ACTION({ action: action.type, result: [], message: '' }))
                ))
        ));

    constructor(
        private _actions: Actions,
        private _service: HomeOptionLoadService
    ) {}

}

@Injectable()
export class HomeLoadNavListEffect {

    load$ = createEffect(() => this._actions
        .pipe(
            ofType(HONE_NAVLIST_LOAD_ACTION),
            exhaustMap(action => this._service.loadNavList(action.localeID)
                .pipe(
                    map(value => 
                        Home_NAVLIST_LOAD_DONE_ACTION({ action: action.type, result: value, message: '' })),
                    catchError(async () => 
                        Home_NAVLIST_LOAD_DONE_ACTION({ action: action.type, result: [], message: '' }))
                ))
        ));

    constructor(
        private _actions: Actions,
        private _service: HomeNavListLoadService
    ) { }

}
