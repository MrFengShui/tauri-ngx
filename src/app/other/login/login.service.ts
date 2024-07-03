import { Injectable, inject } from "@angular/core";
import { CanActivateFn, ActivatedRouteSnapshot, RouterStateSnapshot } from "@angular/router";
import { DES, HmacSHA256, enc } from 'crypto-js';

import { AuthAccountModel } from "../ngrx-store/auth.state";

export const AUTH_SECRET_KEY: string = HmacSHA256('AUTH_SECRET_KEY', 'AUTH_SECRET_KEY').toString();

@Injectable()
export class AuthPermitionForRegisterPageService {

    validate(model: AuthAccountModel): boolean {
        return model.username === 'Tauri-App' && model.password === 'Angular-Web';
    }

}

export const permitToRegisterPage: CanActivateFn = (route: ActivatedRouteSnapshot) => {
    const message: string = DES.decrypt(route.queryParams['auth_info'], AUTH_SECRET_KEY).toString(enc.Utf8);
    return inject(AuthPermitionForRegisterPageService).validate(JSON.parse(message));
};
