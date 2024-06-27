import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { TreeNode } from "primeng/api";
import { Observable, map, of } from "rxjs";

import { AppStyleColorModel, AppStyleModel, AppStyleNameModel, AppStyleStructModel, ThemeType } from "./app.state";

@Injectable()
export class AppStyleService {

    public fetchStyle(): Observable<AppStyleModel> {
        return new Observable(subscriber => {
            const style: string = window.localStorage.getItem('style') as string;
            const model: AppStyleStructModel = JSON.parse(style) as AppStyleStructModel;
            subscriber.next({
                mode: model.theme === 'dark',
                name: `${model.name}-${model.theme}-${model.color}`,
                struct: model
            });
            subscriber.complete();
        });
    }

    public fetchStyleTheme(): Observable<ThemeType | null> {
        return this.fetchStyle().pipe(map(value => value.struct.theme));
    }

    public storeStyle(model: AppStyleStructModel): Observable<AppStyleModel> {
        return new Observable(subscriber => {
            const style: AppStyleModel = { 
                mode: model?.theme === 'dark', 
                name: `${model.name}-${model.theme}-${model.color}`,
                struct: model
            };
            window.localStorage.setItem('style', JSON.stringify(model));
            subscriber.next(style);
            subscriber.complete();
        });
    }

    public hasStyle(): Observable<boolean> {
        const style: string | null = window.localStorage.getItem('style');

        if (style !== null) {
            const styleState: AppStyleStructModel = JSON.parse(style) as AppStyleStructModel;
            return of(styleState.name !== undefined && styleState.theme !== undefined 
                && styleState.color !== undefined);
        }

        return of(false);
    }

}

@Injectable()
export class AppConfigService {

    constructor(private _http: HttpClient) {}

    public loadStyleNameConfigFile(): Observable<AppStyleNameModel[]> {
        return this._http.get<{ list: AppStyleNameModel[] }>('config/app.style.name.json', { responseType: 'json' }).pipe(map(value => value.list));
    }

    public loadStyleColorConfigFile(): Observable<AppStyleColorModel[]> {
        return this._http.get<{ list: AppStyleColorModel[] }>('config/app.style.color.json', { responseType: 'json' }).pipe(map(value => value.list));
    }

}

@Injectable()
export class AppNavlistService {

    constructor(private _http: HttpClient) {}

    public loadNavlistFile(): Observable<TreeNode[]> {
        return this._http.get<{ list: TreeNode[] }>('config/app.navlist.json', { responseType: 'json' }).pipe(map(value => value.list));
    }

}