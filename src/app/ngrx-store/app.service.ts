import { Injectable } from "@angular/core";
import { Observable, map, of } from "rxjs";
import { DES, HmacSHA256, enc } from 'crypto-js';

import { AppStyleModel, ColorType, ThemeType } from "./app.state";

const STYLE_SECRET_KEY: string = HmacSHA256('style_secret_key', 'style_secret_key').toString();

@Injectable()
export class AppStyleService {

    public loadStyle(): Observable<AppStyleModel> {
        return new Observable(subscriber => {
            const message: string = window.localStorage.getItem('style') as string;
            const style: string = DES.decrypt(message, STYLE_SECRET_KEY).toString(enc.Utf8);
            subscriber.next(JSON.parse(style) as AppStyleModel);
            subscriber.complete();
        });
    }

    public loadStyleMode(): Observable<boolean> {
        return this.loadStyle().pipe(map(value => value.mode));
    }

    public loadStyleName(): Observable<string> {
        return this.loadStyle().pipe(map(value => value.name));
    }

    public loadStyleTheme(): Observable<ThemeType> {
        return this.loadStyle().pipe(map(value => value.theme));
    }

    public loadStyleColor(): Observable<ColorType> {
        return this.loadStyle().pipe(map(value => value.color));
    }

    public saveStyle(model: AppStyleModel): Observable<AppStyleModel> {
        return new Observable(subscriber => {
            const style: string = JSON.stringify(model);
            const message: string = DES.encrypt(style, STYLE_SECRET_KEY).toString()
            window.localStorage.setItem('style', message);

            const storage: string | null = window.localStorage.getItem('style');

            if (storage) {
                subscriber.next(model);
            } else {
                subscriber.error();
            }
            
            subscriber.complete();
        });
    }

    public hasStyle(): Observable<boolean> {
        const style: string | null = window.localStorage.getItem('style');
        return of(style !== null);
    }

}
