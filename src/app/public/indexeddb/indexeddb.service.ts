import { Injectable } from "@angular/core";
import { TreeNode } from "primeng/api";
import { Observable, concatMap, map, merge, pipe } from "rxjs";

import { IDBObjectStoreResultModel, IDBMetaDataModel, IDBObjectStoreParamModel } from "./indexeddb.state";

const factory: IDBFactory = window.indexedDB;

@Injectable()
export class IDBDatabaseService {

    constructor(private _service: IDBObjectStoreService) {}

    /**
     * 创建一个指定名称的数据库。
     * @param name
     * @returns 若成功创建，则返回true，否则返回false。
     */
    public createDatabase(name: string): Observable<boolean> {
        return this.upgradeDatabase(name, 1);
    }

    /**
     * 
     * @param name 
     * @returns 
     */
    public deleteDatabase(name: string): Observable<boolean> {
        return new Observable(subscriber => {
            if (factory) {
                const request = factory.deleteDatabase(name);
                request.onsuccess = () => {
                    subscriber.next(true);
                    subscriber.complete();
                }
                request.onerror = () => {
                    subscriber.next(false);
                    subscriber.complete();
                }
            } else {
                subscriber.error();
                subscriber.complete();
            }
        });
    }

    /**
     * 
     * @param names 
     * @returns 
     */
    public deleteAllDatabases(names: string[]): Observable<boolean> {
        const array: Array<Observable<boolean>> = Array.from([]);

        for (let name of names) {
            array.push(this.deleteDatabase(name));
        }

        return merge(...array);
    }

    /**
     *
     * @param name
     * @param version
     * @returns
     */
    public upgradeDatabase(name: string, version: number): Observable<boolean> {
        return new Observable(subscriber => {
            if (factory) {
                const request = factory.open(name, version);
                request.onupgradeneeded = () => {
                    subscriber.next(true);
                    subscriber.complete();
                };
                request.onerror = () => {
                    subscriber.next(false);
                    subscriber.complete();
                };
            } else {
                subscriber.error();
                subscriber.complete();
            }
        });
    }

    /**
     * 从IndexedDB中查找所有数据库的信息。
     * @returns
     */
    public selectAllDatabases(): Observable<TreeNode<IDBMetaDataModel>[]> {
        return new Observable(subscriber => {
            if (factory) {
                const task = setTimeout(() => {
                    clearTimeout(task);
                    factory.databases().then(list => {
                        const nodes: TreeNode<IDBMetaDataModel>[] = Array.from([]);
    
                        for (let item of list) {
                            nodes.push({
                                icon: 'pi pi-database', label: item.name, type: 'node', children: [],
                                data: { dbName: item.name, dbVersion: item.version }
                            });
                        }
    
                        subscriber.next(nodes);
                        subscriber.complete();
                    });
                });
            } else {
                subscriber.error();
                subscriber.complete();
            }
        });
    }

    public selectAll(): Observable<TreeNode<IDBMetaDataModel>[]> {
        return this.selectAllDatabases().pipe(concatMap(list => {
            const array: Observable<TreeNode<IDBMetaDataModel>[]>[] = Array.from([]);

            for (let i = 0; i < list.length; i++) {
                const value = this._service.selectAllObjectStores(list[i].data?.dbName as string)
                    .pipe(map(value => {
                        list[i].children = value.list;
                        return list;
                    }));
                array.push(value);
            }

            return merge(...array);
        }));
    }

}

@Injectable()
export class IDBObjectStoreService {

    /**
     *
     * @param dbName
     * @param osName
     * @param keyPath
     * @param osParams
     * @param indexParams
     * @returns
     */
    public createObjectStore(model: IDBObjectStoreParamModel): Observable<string | null> {
        return new Observable(subscriber => {
            if (factory) {
                const request = factory.open(model.metadata.dbName as string, (model.metadata.dbVersion as number) + 1);
                request.onupgradeneeded = event => {
                    const db = (event.target as IDBOpenDBRequest).result;
                    const accountStore = db.createObjectStore(model.metadata.osName as string,
                        { autoIncrement: model.options.autoIncrement, keyPath: model.options.keyPath });
                    accountStore.createIndex(model.options.keyPath, model.options.keyPath,
                        { unique: model.options.unique, multiEntry: model.options.multiEntry });

                    db.close();
                    subscriber.next(db.name);
                    subscriber.complete();
                };
                request.onerror = () => {
                    subscriber.next(null);
                    subscriber.complete();
                };
            } else {
                subscriber.error();
                subscriber.complete();
            }
        });
    }

    public deleteObjectStore(dbName: string, dbVersion: number, osName: string): Observable<string | null> {
        return new Observable(subscriber => {
            if (factory) {
                const request = factory.open(dbName, dbVersion);
                request.onupgradeneeded = event => {
                    const db = (event.target as IDBOpenDBRequest).result;
                    db.deleteObjectStore(osName);

                    db.close();
                    subscriber.next(db.name);
                    subscriber.complete();
                }
                request.onerror = () => {
                    subscriber.next(null);
                    subscriber.complete();
                };
            } else {
                subscriber.error();
                subscriber.complete();
            }
        });
    }

    public deleteAllObjectStores(dbName: string, dbVersion: number, osNames: string[]): Observable<string | null> {
        const array: Array<Observable<string | null>> = Array.from([]);

        for (let osName of osNames) {
            array.push(this.deleteObjectStore(dbName, dbVersion, osName));
            dbVersion += 1;
        }

        return merge(...array);
    }

    /**
     *
     * @param name
     * @returns
     */
    public selectAllObjectStores(dbName: string): Observable<IDBObjectStoreResultModel> {
        return new Observable(subscriber => {
            if (factory) {
                const task = setTimeout(() => {
                    clearTimeout(task);
                    const request = factory.open(dbName);
                    request.onsuccess = event => {
                        const db = (event.target as IDBOpenDBRequest).result;
                        const names = db.objectStoreNames, nodes: TreeNode<IDBMetaDataModel>[] = Array.from([]);
                        let name: string = '';

                        for (let i = 0; i < names.length; i++) {
                            name = names.item(i) as string;
                            nodes.push({
                                icon: 'pi pi-table', label: name, type: 'leaf',
                                data: { dbName: db.name, dbVersion: db.version, osName: name }
                            });
                        }

                        subscriber.next({ name: db.name, list: nodes });
                        subscriber.complete();
                    };
                    request.onerror = () => {
                        subscriber.next({ name: dbName, list: [] });
                        subscriber.complete();
                    };
                });
            } else {
                subscriber.error();
                subscriber.complete();
            }
        });
    }

}

@Injectable()
export class IDBPersistService {

    public insert<T = any>(dbName: string, dbVersion: number, osName: string, data: T): Observable<Array<T>> {
        return new Observable<void>(subscriber => {
            if (factory) {
                const request = factory.open(dbName, dbVersion);
                request.onsuccess = event => {
                    const database = (event.target as IDBOpenDBRequest).result;
                    const store = database.transaction(osName, 'readwrite').objectStore(osName);
                    const storeRequest = store.add(data);
                    storeRequest.onsuccess = () => {
                        database.close();
                        subscriber.next();
                        subscriber.complete();
                    };
                    storeRequest.onerror = () => {
                        database.close();
                        subscriber.error();
                        subscriber.complete();
                    };
                };
                request.onerror = () => {
                    subscriber.error();
                    subscriber.complete();
                };
            } else {
                subscriber.error();
                subscriber.complete();
            }
        }).pipe(concatMap(() => this.selectAll<T>(dbName, dbVersion, osName)));
    }

    public delete<T>(dbName: string, dbVersion: number, osName: string, key: IDBValidKey | IDBKeyRange): Observable<Array<T>> {
        return new Observable(subscriber => {
            if (factory) {
                const request = factory.open(dbName, dbVersion);
                request.onsuccess = event => {
                    const database = (event.target as IDBOpenDBRequest).result;
                    const store = database.transaction(osName, 'readwrite').objectStore(osName);
                    const storeRequest = store.delete(key);
                    storeRequest.onsuccess = () => {
                        subscriber.next();
                        subscriber.complete();
                        database.close();
                    };
                    storeRequest.onerror = () => {
                        subscriber.error();
                        subscriber.complete();
                        database.close();
                    };
                };
                request.onerror = () => {
                    subscriber.error();
                    subscriber.complete();
                };
            } else {
                subscriber.error();
                subscriber.complete();
            }
        }).pipe(concatMap(() => this.selectAll<T>(dbName, dbVersion, osName)));
    }

    public deleteAll<T>(dbName: string, dbVersion: number, osName: string): Observable<Array<T>> {
        return new Observable(subscriber => {
            if (factory) {
                const request = factory.open(dbName, dbVersion);
                request.onsuccess = event => {
                    const database = (event.target as IDBOpenDBRequest).result;
                    const store = database.transaction(osName, 'readwrite').objectStore(osName);
                    const storeRequest = store.clear();
                    storeRequest.onsuccess = () => {
                        subscriber.next();
                        subscriber.complete();
                        database.close();
                    };
                    storeRequest.onerror = () => {
                        subscriber.error();
                        subscriber.complete();
                        database.close();
                    };
                };
                request.onerror = () => {
                    subscriber.error();
                    subscriber.complete();
                };
            } else {
                subscriber.error();
                subscriber.complete();
            }
        }).pipe(concatMap(() => this.selectAll<T>(dbName, dbVersion, osName)));
    }

    public update<T = any>(dbName: string, dbVersion: number, osName: string, data: T): Observable<Array<T>> {
        return new Observable(subscriber => {
            if (factory) {
                const request = factory.open(dbName, dbVersion);
                request.onsuccess = event => {
                    const database = (event.target as IDBOpenDBRequest).result;
                    const store = database.transaction(osName, 'readwrite').objectStore(osName);
                    const storeRequest = store.put(data);
                    storeRequest.onsuccess = () => {
                        subscriber.next();
                        subscriber.complete();
                        database.close();
                    };
                    storeRequest.onerror = () => {
                        subscriber.error();
                        subscriber.complete();
                        database.close();
                    };
                };
                request.onerror = () => {
                    subscriber.error();
                    subscriber.complete();
                };
            } else {
                subscriber.error();
                subscriber.complete();
            }
        }).pipe(concatMap(() => this.selectAll<T>(dbName, dbVersion, osName)));
    }

    public select<T = any>(dbName: string, dbVersion: number, osName: string, key: IDBValidKey | IDBKeyRange): Observable<T> {
        return new Observable(subscriber => {
            if (factory) {
                const request = factory.open(dbName, dbVersion);
                request.onsuccess = event => {
                    const database = (event.target as IDBOpenDBRequest).result;
                    const store = database.transaction(osName, 'readonly').objectStore(osName);
                    const storeRequest = store.get(key);
                    storeRequest.onsuccess = () => {
                        database.close();
                        subscriber.next(storeRequest.result);
                        subscriber.complete();
                    };
                    storeRequest.onerror = () => {
                        database.close();
                        subscriber.error();
                        subscriber.complete();
                    };
                };
            } else {
                subscriber.error();
                subscriber.complete();
            }
        });
    }

    public selectAll<T = any>(dbName: string, dbVersion: number, osName: string): Observable<Array<T>> {
        return new Observable(subscriber => {
            if (factory) {
                const request = factory.open(dbName, dbVersion);
                request.onsuccess = event => {
                    const database = (event.target as IDBOpenDBRequest).result;
                    const store = database.transaction(osName, 'readonly').objectStore(osName);
                    const storeRequest = store.getAll();
                    storeRequest.onsuccess = () => {
                        database.close();
                        subscriber.next(storeRequest.result);
                        subscriber.complete();
                    };
                    storeRequest.onerror = () => {
                        database.close();
                        subscriber.error();
                        subscriber.complete();
                    };
                };
            } else {
                subscriber.error();
                subscriber.complete();
            }
        });
    }

}
