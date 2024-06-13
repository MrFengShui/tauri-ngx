import { Injectable, inject } from "@angular/core";
import { ActivatedRouteSnapshot, CanActivateFn, RouterStateSnapshot } from '@angular/router';
import { Observable, map, merge, zip } from "rxjs";
import { cloneDeep } from 'lodash';

import { AuthAccountModel, AuthAccountProfileModel, AuthProfileModel } from "./auth.state";

@Injectable()
export class AuthIndexedDBService {

    private readonly AUTH_DATABASE_NAME: string = 'auth_db';
    private readonly AUTH_ACCOUNT_STORE_NAME: string = 'auth_account_tb';
    private readonly AUTH_PROFILE_STORE_NAME: string = 'auth_profile_tb';

    private version: number = 1;

    /**
     * 向IndexedDB创建一个数据库并创建两个数据表，两个表分别用来存储账号信息和用户信息。
     * @param version 
     * @returns 
     */
    public createDatabaseAndStores(version: number): Observable<void> {
        return new Observable(subscriber => {
            if (window.indexedDB) {
                this.version = version;

                const request: IDBOpenDBRequest = window.indexedDB.open(this.AUTH_DATABASE_NAME, version);
                request.onupgradeneeded = event => {
                    const db = (event.target as IDBOpenDBRequest).result;
        
                    const accountStore = db.createObjectStore(this.AUTH_ACCOUNT_STORE_NAME, { keyPath: 'username', autoIncrement: true });
                    accountStore.createIndex('username', 'username', { unique: true });
        
                    const profileStore = db.createObjectStore(this.AUTH_PROFILE_STORE_NAME, { keyPath: 'id', autoIncrement: true });
                    profileStore.createIndex('id', 'id', { unique: true });
        
                    db.close();
                    subscriber.next();
                    subscriber.complete();
                }
            } else {
                subscriber.error();
                subscriber.complete();
            }
        });
    }

    /**
     * 向IndexedDB中插入一条用户记录。
     * @param data 
     * @returns 
     */
    public insertUser(data: AuthAccountProfileModel): Observable<void> {
        const account$: Observable<void> = this.insert(data.account, window.indexedDB.open(this.AUTH_DATABASE_NAME, this.version), this.AUTH_ACCOUNT_STORE_NAME);
        const profile$: Observable<void> = this.insert(data.profile, window.indexedDB.open(this.AUTH_DATABASE_NAME, this.version), this.AUTH_PROFILE_STORE_NAME);
        return merge(account$, profile$);
    }

    /**
     * 执行IndexedDB插入操作。
     * @param data 
     * @param request 
     * @param name 
     * @returns 
     */
    private insert(data: AuthAccountModel | AuthProfileModel, request: IDBOpenDBRequest, name: string): Observable<void> {
        return new Observable(subscriber => {
            request.onsuccess = event => {
                const database = (event.target as IDBOpenDBRequest).result;
                const store = database.transaction(name, 'readwrite').objectStore(name);
                const storeRequest = store.add(data);
                storeRequest.onsuccess = () => {
                    subscriber.next();
                    subscriber.complete();
                    database.close();
                }
                storeRequest.onerror = () => {
                    subscriber.error();
                    subscriber.complete();
                    database.close();
                }
            }
            request.onerror = () => {
                subscriber.error();
                subscriber.complete();
            }
        });
    }

    /**
     * 从IndexedDB中删除全部用户记录。
     * @returns 
     */
    public deleteAllUsers(): Observable<void> {
        const account$: Observable<void> = this.deleteAll(window.indexedDB.open(this.AUTH_DATABASE_NAME), this.AUTH_ACCOUNT_STORE_NAME);
        const profile$: Observable<void> = this.deleteAll(window.indexedDB.open(this.AUTH_DATABASE_NAME), this.AUTH_PROFILE_STORE_NAME);
        return merge(account$, profile$);
    }

    /**
     * 执行IndexedDB清空操作。
     * @param request 
     * @param name 
     * @returns 
     */
    private deleteAll(request: IDBRequest, name: string): Observable<void> {
        return new Observable(subscriber => {
            request.onsuccess = event => {
                const database = (event.target as IDBOpenDBRequest).result;
                const store = database.transaction(name, 'readwrite').objectStore(name);
                const storeRequest = store.clear();
                storeRequest.onsuccess = () => {
                    subscriber.next();
                    subscriber.complete();
                    database.close();
                }
                storeRequest.onerror = () => {
                    subscriber.error();
                    subscriber.complete();
                    database.close();
                }
            }
            request.onerror = () => {
                subscriber.error();
                subscriber.complete();
            }
        });
    }

    /**
     * 从IndexedDB中删除一条用户记录。
     * @param accountKey 
     * @param profileKey 
     * @returns 
     */
    public deleteUser(accountKey: IDBValidKey | IDBKeyRange, profileKey: IDBValidKey | IDBKeyRange): Observable<void> {
        const account$: Observable<void> = this.delete(accountKey, window.indexedDB.open(this.AUTH_DATABASE_NAME), this.AUTH_ACCOUNT_STORE_NAME);
        const profile$: Observable<void> = this.delete(profileKey, window.indexedDB.open(this.AUTH_DATABASE_NAME), this.AUTH_PROFILE_STORE_NAME);
        return merge(account$, profile$);
    }

    /**
     * 执行IndexedDB删除操作。
     * @param key 
     * @param request 
     * @param name 
     * @returns 
     */
    private delete(key: IDBValidKey | IDBKeyRange, request: IDBOpenDBRequest, name: string): Observable<void> {
        return new Observable(subscriber => {
            request.onsuccess = event => {
                const database = (event.target as IDBOpenDBRequest).result;
                const store = database.transaction(name, 'readwrite').objectStore(name);
                const storeRequest = store.delete(key);
                storeRequest.onsuccess = () => {
                    subscriber.next();
                    subscriber.complete();
                    database.close();
                }
                storeRequest.onerror = () => {
                    subscriber.error();
                    subscriber.complete();
                    database.close();
                }
            }
            request.onerror = () => {
                subscriber.error();
                subscriber.complete();
            }
        });
    }

    /**
     * 从IndexedDB中更新一条用户记录。
     * @param data 
     * @returns 
     */
    public updateUser(data: AuthAccountProfileModel): Observable<void> {
        const account$: Observable<void> = this.update(data.account, window.indexedDB.open(this.AUTH_DATABASE_NAME, this.version), this.AUTH_ACCOUNT_STORE_NAME);
        const profile$: Observable<void> = this.update(data.profile, window.indexedDB.open(this.AUTH_DATABASE_NAME, this.version), this.AUTH_PROFILE_STORE_NAME);
        return merge(account$, profile$);
    }

    /**
     * 执行IndexedDB更新操作。
     * @param data 
     * @param request 
     * @param name 
     * @returns 
     */
    public update(data: AuthAccountModel | AuthProfileModel, request: IDBOpenDBRequest, name: string): Observable<void> {
        return new Observable(subscriber => {
            request.onsuccess = event => {
                const database = (event.target as IDBOpenDBRequest).result;
                const store = database.transaction(name, 'readwrite').objectStore(name);
                const storeRequest = store.put(data);
                storeRequest.onsuccess = () => {
                    subscriber.next();
                    subscriber.complete();
                    database.close();
                }
                storeRequest.onerror = () => {
                    subscriber.error();
                    subscriber.complete();
                    database.close();
                }
            }
            request.onerror = () => {
                subscriber.error();
                subscriber.complete();
            }
        });
    }

    /**
     * 从IndexedDB中查询一条用户记录。
     * @returns 
     */
    public selectUser(accountKey: IDBValidKey | IDBKeyRange, profileKey: IDBValidKey | IDBKeyRange): Observable<AuthAccountProfileModel> {
        const account$: Observable<AuthAccountModel> = this.select(accountKey, window.indexedDB.open(this.AUTH_DATABASE_NAME, this.version), this.AUTH_ACCOUNT_STORE_NAME)
            .pipe(map(item => item as AuthAccountModel));
        const profile$: Observable<AuthProfileModel> = this.select(profileKey, window.indexedDB.open(this.AUTH_DATABASE_NAME, this.version), this.AUTH_PROFILE_STORE_NAME)
            .pipe(map(item => item as AuthProfileModel));
        return zip(account$, profile$).pipe(map(values => ({ account: values[0], profile: values[1] })));
    }

    /**
     * 执行IndexedDB查询操作。
     * @param request 
     * @param name 
     * @returns 
     */
    private select(key: IDBValidKey | IDBKeyRange, request: IDBOpenDBRequest, name: string): Observable<AuthAccountModel | AuthProfileModel> {
        return new Observable(subscriber => {
            request.onsuccess = event => {
                const database = (event.target as IDBOpenDBRequest).result;
                const store = database.transaction(name, 'readonly').objectStore(name);
                const storeRequest = store.get(key);
                storeRequest.onsuccess = () => {
                    subscriber.next(cloneDeep(storeRequest.result));
                    subscriber.complete();
                    database.close();
                }
                storeRequest.onerror = () => {
                    subscriber.error();
                    subscriber.complete();
                    database.close();
                }
            }
        });
    }

    /**
     * 从IndexedDB中查询全部用户记录。
     * @returns 
     */
    public selectAllUsers(): Observable<AuthAccountProfileModel[]> {
        const account$: Observable<AuthAccountModel[]> = this.selectAll(window.indexedDB.open(this.AUTH_DATABASE_NAME, this.version), this.AUTH_ACCOUNT_STORE_NAME)
            .pipe(map(item => item as AuthAccountModel[]));
        const profile$: Observable<AuthProfileModel[]> = this.selectAll(window.indexedDB.open(this.AUTH_DATABASE_NAME, this.version), this.AUTH_PROFILE_STORE_NAME)
            .pipe(map(item => item as AuthProfileModel[]));
        return zip(account$, profile$).pipe(map(values => {
            const array: AuthAccountProfileModel[] = Array.from([]);
            
            for (let i = 0; i < values[0].length; i++) {
                array.push({ account: values[0][i], profile: values[1][i] });
            }
            
            return array.sort((a, b) => b.profile.createTime - a.profile.createTime);
        }));
    }

    /**
     * 执行IndexedDB查询操作。
     * @param request 
     * @param name 
     * @returns 
     */
    private selectAll(request: IDBOpenDBRequest, name: string): Observable<AuthAccountModel[] | AuthProfileModel[]> {
        return new Observable(subscriber => {
            request.onsuccess = event => {
                const database = (event.target as IDBOpenDBRequest).result;
                const store = database.transaction(name, 'readonly').objectStore(name);
                const storeRequest = store.getAll();
                storeRequest.onsuccess = () => {
                    subscriber.next(cloneDeep(storeRequest.result));
                    subscriber.complete();
                    database.close();
                }
                storeRequest.onerror = () => {
                    subscriber.error();
                    subscriber.complete();
                    database.close();
                }
            }
        });
    }

}

@Injectable()
export class AuthJWTService {}

@Injectable()
export class AuthValidationService {}

@Injectable()
export class AuthPermitionForRegisterPageService {

    validate(username: string | null, password: string | null): boolean {
        return (username !== null && password !== null) && (username === 'Tauri-App' && password === 'Angular-Web');
    }

}

export const permissionForRegisterPage: CanActivateFn = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
    const username: string | null = window.prompt('请输入授权账号');
    const password: string | null = window.prompt('请输入授权密码');
    return inject(AuthPermitionForRegisterPageService).validate(username, password);
}