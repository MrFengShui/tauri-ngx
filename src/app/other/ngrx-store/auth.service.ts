import { Injectable } from "@angular/core";
import { map, Observable } from "rxjs";
import { now } from "lodash";
import { AES, enc, HmacSHA256 } from "crypto-js";

import { AuthAccountProfileModel, AuthAccountModel, AuthUserTokenModel, AuthTokenPublicModel, AuthTokenPrivateModel, AuthTokenTimeRange, CRYPTO_SECRET_KEY, AuthTokenIssuer, AuthTokenID } from "./auth.state";
import { IDBPersistService } from "../../public/indexeddb/indexeddb.service";

@Injectable()
export class AuthRegisterService {

    public readonly AUTH_DATABASE_NAME: string = 'auth_database';
    public readonly AUTH_OBJECT_STORE_NAME: string = 'auth_object_store';

    constructor(private _service: IDBPersistService) {}

    /**
     * 向IndexedDB中插入一条用户记录。
     * @param dbName 
     * @param dbVersion 
     * @param osName 
     * @param data
     * @returns
     */
    public insertUser(dbName: string, dbVersion: number, osName: string, data: AuthAccountProfileModel): Observable<AuthAccountProfileModel[]> {
        return this._service.insert(dbName, dbVersion, osName, data);
    }

    /**
     * 从IndexedDB中删除全部用户记录。
     * @param dbName 
     * @param dbVersion 
     * @param osName 
     * @returns
     */
    public deleteAllUsers(dbName: string, dbVersion: number, osName: string): Observable<AuthAccountProfileModel[]> {
        return this._service.deleteAll(dbName, dbVersion, osName);
    }

    /**
     * 从IndexedDB中删除一条用户记录。
     * @param dbName
     * @param dbVersion
     * @param osName
     * @param key
     * @returns
     */
    public deleteUser(dbName: string, dbVersion: number, osName: string, key: IDBValidKey | IDBKeyRange): Observable<AuthAccountProfileModel[]> {
        return this._service.delete(dbName, dbVersion, osName, key);
    }

    /**
     * 执行IndexedDB更新操作。
     * @param dbName
     * @param dbVersion
     * @param osName
     * @param data 
     * @returns
     */
    public updateUser(dbName: string, dbVersion: number, osName: string, data: AuthAccountProfileModel): Observable<AuthAccountProfileModel[]> {
        return this._service.update<AuthAccountProfileModel>(dbName, dbVersion, osName, data);
    }

    /**
     * 从IndexedDB中查询全部用户记录。
     * @returns
     */
    public selectAllUsers(dbName: string, dbVersion: number, osName: string): Observable<AuthAccountProfileModel[]> {
        return this._service.selectAll(dbName, dbVersion, osName);
    }

    /**
     * 从IndexedDB中查询一条用户记录。
     * @returns
     */
    public selectUser(dbName: string, dbVersion: number, osName: string, key: IDBValidKey | IDBKeyRange): Observable<AuthAccountProfileModel> {
        return this._service.select(dbName, dbVersion, osName, key);
    }

}

class UserTokenBuilder {

    private publicInfo: AuthTokenPublicModel | null = null;
    private privateInfo: AuthTokenPrivateModel | null = null;
    private model: AuthUserTokenModel | null = null;

    constructor() {
        if (!this.publicInfo) {
            this.publicInfo = { id: '', issuer: '', subject: '', timestamp: -1 };
        }

        if (!this.privateInfo) {
            this.privateInfo = { username: '', password: '', timerange: { startTime: -1, finalTime: -1 } };
        }

        if (!this.model) {
            this.model = { publicInfo: null, privateInfo: null };
        }
    }

    addID(id: string): UserTokenBuilder {
        if (this.publicInfo) {
            this.publicInfo.id = id;
        }

        return this;
    }

    addIssuer(issuer: string): UserTokenBuilder {
        if (this.publicInfo) {
            this.publicInfo.issuer = issuer;
        }

        return this;
    }

    addSubject(subject: string): UserTokenBuilder {
        if (this.publicInfo) {
            this.publicInfo.subject = subject;
        }

        return this;
    }

    addTimestamp(timestamp: number): UserTokenBuilder {
        if (this.publicInfo) {
            this.publicInfo.timestamp = timestamp;
        }

        return this;
    }

    addUsername(username: string): UserTokenBuilder {
        if (this.privateInfo) {
            this.privateInfo.username = username;
        }

        return this;
    }

    addPassword(password: string): UserTokenBuilder {
        if (this.privateInfo) {
            this.privateInfo.password = password;
        }

        return this;
    }

    addTimeRange(timerange: AuthTokenTimeRange): UserTokenBuilder {
        if (this.privateInfo) {
            this.privateInfo.timerange = timerange;
        }

        return this;
    }

    buildPublicInfo(): AuthTokenPublicModel | null {
        return this.publicInfo;
    }

    buildgetPrivateInfo(): AuthTokenPrivateModel | null {
        return this.privateInfo;
    }

    build(): AuthUserTokenModel {
        return { ...this.model, publicInfo: this.publicInfo, privateInfo: this.privateInfo };
    }

}

@Injectable()
export class AuthUserTokenService {
    
    private builder: UserTokenBuilder | null = null;
    private model: AuthUserTokenModel | null = null;

    constructor() {
        if (!this.builder) {
            this.builder = new UserTokenBuilder();
        }
    }

    public createUserToken(subject: string, account: AuthAccountModel): Observable<string> {
        return new Observable(subscriber => {
            if (this.builder) {
                const startTime: number = now(), finalTime: number = startTime + 3600 * 24 * 7;
                this.builder = this.builder
                    .addID(AuthTokenID).addIssuer(AuthTokenIssuer).addSubject(subject).addTimestamp(startTime)
                    .addUsername(account.username).addPassword(account.password)
                    .addTimeRange({ startTime, finalTime });
                this.model = this.builder.build();

                const publicInfo: string = AES.encrypt(JSON.stringify(this.model?.publicInfo), CRYPTO_SECRET_KEY).toString();
                const privateInfo: string = AES.encrypt(JSON.stringify(this.model?.privateInfo), CRYPTO_SECRET_KEY).toString();
                const signature: string = HmacSHA256(`${publicInfo}_${privateInfo}`, CRYPTO_SECRET_KEY).toString();
                subscriber.next(`${publicInfo}.${privateInfo}.${signature}`);
                subscriber.complete();
            } else {
                subscriber.error();
            }
        });
    }

    public parserUserToken(token: string): Observable<AuthUserTokenModel> {
        return new Observable(subscriber => {
            const split: string[] = token.split('.');

            if (split.length === 3) {
                this.model = { 
                    ...this.model, 
                    publicInfo: JSON.parse(AES.decrypt(split[0], CRYPTO_SECRET_KEY).toString(enc.Utf8)), 
                    privateInfo: JSON.parse(AES.decrypt(split[1], CRYPTO_SECRET_KEY).toString(enc.Utf8))
                };
                subscriber.next(this.model);
                subscriber.complete();
            } else {
                subscriber.error();
            }
        });
    }

    public authenticate(token: string): Observable<boolean> {
        return this.parserUserToken(token).pipe(map(model => {
            const timestamp: number = now(), startTime: number = model.privateInfo?.timerange.startTime as number, finalTime: number = model.privateInfo?.timerange.finalTime as number;
            const split: string[] = token.split('.');
            const signature: string = split.length === 3 ? HmacSHA256(`${split[0]}_${split[1]}`, CRYPTO_SECRET_KEY).toString() : '';
            const flag: boolean = split.length === 3 && signature === split[3];
            return model.publicInfo?.issuer === AuthTokenIssuer && timestamp >= startTime && timestamp <= finalTime && flag;
        }));
    }

}



