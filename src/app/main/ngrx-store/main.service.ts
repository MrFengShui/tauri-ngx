import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { TreeNode } from "primeng/api";
import { Observable, map } from "rxjs";

import { LocaleIDType, LocaleOptionModel, RouteUrlParam, StyleColorOptionModel, StyleNameOptionModel } from "./main.state";

@Injectable()
export class HomeOptionLoadService {

    constructor(private _http: HttpClient) {}

    public loadStyleNameOption(localeID: LocaleIDType | string): Observable<StyleNameOptionModel[]> {
        return this._http.get<{ list: StyleNameOptionModel[] }>(`config/style/name/style.name.${localeID}.json`, 
            { responseType: 'json' }).pipe(map(value => value.list));
    }

    public loadStyleColorOption(localeID: LocaleIDType | string): Observable<StyleColorOptionModel[]> {
        return this._http.get<{ list: StyleColorOptionModel[] }>(`config/style/color/style.color.${localeID}.json`, 
            { responseType: 'json' }).pipe(map(value => value.list));
    }

    public loadLocaleOption(localeID: LocaleIDType | string): Observable<LocaleOptionModel[]> {
        return this._http.get<{ list: LocaleOptionModel[] }>(`config/locale/locale.${localeID}.json`, 
            { responseType: 'json' }).pipe(map(value => value.list));
    }

}

@Injectable()
export class HomeNavListLoadService {

    constructor(private _http: HttpClient) { }

    public loadNavList(localeID: string): Observable<TreeNode<RouteUrlParam>[]> {
        return this._http.get<{ list: TreeNode<RouteUrlParam>[]; }>(`config/navlist/navlist.${localeID}.json`, { responseType: 'json' }).pipe(map(value => value.list));
    }

}

