import { Injectable } from "@angular/core";
import { Observable } from "rxjs";

import { SortDataModel, SortStateModel, SortOrder } from "../ngrx-store/sort.state";
import { ACCENT_COLOR, ACCENT_ONE_COLOR, ACCENT_TWO_COLOR, CLEAR_COLOR, PRIMARY_COLOR, SECONDARY_COLOR, SORT_DELAY_DURATION, complete, delay } from "../sort.utils";

type Node = { index: number, value: number, parent?: Node };
type BSTNode = { value: number; left?: BSTNode; right?: BSTNode; };

/**
 * 二叉树排序
 */
@Injectable()
export class BinarySearchTreeSortService {

    private target: number[] = Array.from([]);

    public sort(array: SortDataModel[], order: SortOrder): Observable<SortStateModel> {
        return new Observable(subscriber => {
            if (order === 'ascent') {
                this.sortByAscent(array, false, 0, param => subscriber.next(param)).then(() => subscriber.complete());
            }

            if (order === 'descent') {
                this.sortByDescent(array, false, 0, param => subscriber.next(param)).then(() => subscriber.complete());
            }
        });
    }

    private async sortByAscent(source: SortDataModel[], flag: boolean, times: number, callback: (param: SortStateModel) => void): Promise<void> {
        let root: BSTNode | undefined;

        for (let i = 0; i < source.length; i++) {
            times += 1;

            source[i].color = ACCENT_ONE_COLOR;
            callback({ times, datalist: source });

            await delay(SORT_DELAY_DURATION);

            source[i].color = CLEAR_COLOR;
            callback({ times, datalist: source });

            root = await this.insertByAscent(root, source[i]);
        }

        this.target = await this.traverse(root, []);

        for (let i = 0, length = this.target.length; i < length; i++) {
            times += 1;

            source[i].value = this.target[i];
            source[i].color = ACCENT_TWO_COLOR;
            callback({ times, datalist: source });

            await delay(SORT_DELAY_DURATION);

            source[i].color = CLEAR_COLOR;
            callback({ times, datalist: source });
        }

        await delay(SORT_DELAY_DURATION);
        await complete(source, times, callback);
        this.target.splice(0);
    }

    private async sortByDescent(source: SortDataModel[], flag: boolean, times: number, callback: (parram: SortStateModel) => void): Promise<void> {
        let root: BSTNode | undefined;

        for (let i = 0; i < source.length; i++) {
            times += 1;

            source[i].color = ACCENT_ONE_COLOR;
            callback({ times, datalist: source });

            await delay(SORT_DELAY_DURATION);

            source[i].color = CLEAR_COLOR;
            callback({ times, datalist: source });

            root = await this.insertByDescent(root, source[i]);
        }

        this.target = await this.traverse(root, []);

        for (let i = 0, length = this.target.length; i < length; i++) {
            times += 1;

            source[i].value = this.target[i];
            source[i].color = ACCENT_TWO_COLOR;
            callback({ times, datalist: source });

            await delay(SORT_DELAY_DURATION);

            source[i].color = CLEAR_COLOR;
            callback({ times, datalist: source });
        }

        await delay(SORT_DELAY_DURATION);
        await complete(source, times, callback);
        this.target.splice(0);
    }

    private async insertByAscent(root: BSTNode | undefined, data: SortDataModel): Promise<BSTNode | undefined> {
        let node: BSTNode | undefined = root, temp: BSTNode | undefined;

        while (node) {
            temp = node;

            if (data.value < node.value) {
                node = node.left;
            } else {
                node = node.right;
            }
        }

        if (temp) {
            if (data.value < temp.value) {
                temp.left = { value: data.value };
            } else {
                temp.right = { value: data.value };
            }
        } else {
            root = { value: data.value };
        }

        return root;
    }

    private async insertByDescent(root: BSTNode | undefined, data: SortDataModel): Promise<BSTNode | undefined> {
        let node: BSTNode | undefined = root, temp: BSTNode | undefined;

        while (node) {
            temp = node;

            if (data.value > node.value) {
                node = node.left;
            } else {
                node = node.right;
            }
        }

        if (temp) {
            if (data.value > temp.value) {
                temp.left = { value: data.value };
            } else {
                temp.right = { value: data.value };
            }
        } else {
            root = { value: data.value };
        }

        return root;
    }

    private async traverse(root: BSTNode | undefined, target: number[]): Promise<number[]> {
        if (root) {
            target = await this.traverse(root.left, target);
            target.push(root.value);
            target = await this.traverse(root.right, target);
        }

        return target;
    }

}

/**
 * 锦标赛排序
 */
@Injectable()
export class TournamentSortService {

    private tree: { [key: string | number]: Node[] } = {};

    public sort(array: SortDataModel[], order: SortOrder): Observable<SortStateModel> {
        return new Observable(subscriber => {
            if (order === 'ascent') {
                this.sortByAscent(array, 0, param => subscriber.next(param)).then(() => subscriber.complete());
            }

            if (order === 'descent') {
                this.sortByDescent(array, 0, param => subscriber.next(param)).then(() => subscriber.complete());
            }
        });
    }

    private async sortByAscent(source: SortDataModel[], times: number, callback: (param: SortStateModel) => void): Promise<void> {
        const depth: number = Math.ceil(Math.log2(source.length) + 1);
        let index: number;

        times = await this.createTree(source, depth, times, callback);

        for (let i = 0; i < source.length; i++) {
            await this.buildMinTree(depth);
            
            index = this.tree[0][0].index;
            times += 1;

            source[i].value = this.tree[0][0].value;
            source[i].color = PRIMARY_COLOR;
            source[index].color = SECONDARY_COLOR;
            callback({ times, datalist: source });

            await delay(SORT_DELAY_DURATION);

            source[i].color = CLEAR_COLOR;
            source[index].color = CLEAR_COLOR;
            callback({ times, datalist: source });

            this.tree[depth - 1][index].value = Number.MAX_SAFE_INTEGER;
        }

        await delay(SORT_DELAY_DURATION);
        await complete(source, times, callback);
        await this.clear();
    }

    private async sortByDescent(source: SortDataModel[], times: number, callback: (param: SortStateModel) => void): Promise<void> {
        const depth: number = Math.ceil(Math.log2(source.length) + 1);
        let index: number;

        times = await this.createTree(source, depth, times, callback);

        for (let i = 0; i < source.length; i++) {
            await this.buildMaxTree(depth);
            
            index = this.tree[0][0].index;
            times += 1;

            source[i].value = this.tree[0][0].value;
            source[i].color = PRIMARY_COLOR;
            source[index].color = SECONDARY_COLOR;
            callback({ times, datalist: source });

            await delay(SORT_DELAY_DURATION);

            source[i].color = CLEAR_COLOR;
            source[index].color = CLEAR_COLOR;
            callback({ times, datalist: source });

            this.tree[depth - 1][index].value = Number.MIN_SAFE_INTEGER;
        }

        await delay(SORT_DELAY_DURATION);
        await complete(source, times, callback);
    }

    private async createTree(source: SortDataModel[], depth: number, times: number, callback: (param: SortStateModel) => void): Promise<number> {
        for (let i = 0; i < depth; i++) {
            this.tree[i] = Array.from([]);

            if (i === depth - 1) {
                for (let j = 0; j < source.length; j++) {
                    times += 1;

                    source[j].color = ACCENT_COLOR;
                    callback({ times, datalist: source });

                    await delay(SORT_DELAY_DURATION);

                    source[j].color = CLEAR_COLOR;
                    callback({ times, datalist: source });

                    this.tree[i].push({ index: j, value: source[j].value });
                }
            }
        }
        
        return times;
    }

    private async buildMaxTree(depth: number): Promise<void> {
        let k: number, temp: Node;

        for (let i = depth - 1; i > 0 ;i--) {
            for (let j = 0, length = this.tree[i].length; j < length; j += 2) {
                k = Math.min(j + 1, this.tree[i].length - 1);

                if (j === k) {
                    temp = this.tree[i][k];

                    if (temp.parent) {
                        temp.parent.index = temp.index;
                        temp.parent.value = temp.value;
                    } else {
                        const node: Node = { index: temp.index, value: temp.value };
                        temp.parent = node;
                        this.tree[i - 1].push(node);
                    }
                } else {
                    temp = this.tree[i][j].value > this.tree[i][k].value ? this.tree[i][j] : this.tree[i][k];

                    if (temp.parent) {
                        temp.parent.index = temp.index;
                        temp.parent.value = temp.value;
                    } else {
                        const node: Node = { index: temp.index, value: temp.value };
                        this.tree[i][j].parent = node;
                        this.tree[i][k].parent = node;
                        this.tree[i - 1].push(node);
                    }
                }
            }
        }
    }

    private async buildMinTree(depth: number): Promise<void> {
        let k: number, temp: Node;

        for (let i = depth - 1; i > 0 ;i--) {
            for (let j = 0, length = this.tree[i].length; j < length; j += 2) {
                k = Math.min(j + 1, length - 1);
                
                if (j === k) {
                    temp = this.tree[i][k];
                    
                    if (temp.parent) {
                        temp.parent.index = temp.index;
                        temp.parent.value = temp.value;
                    } else {
                        const node: Node = { index: temp.index, value: temp.value };
                        temp.parent = node;
                        this.tree[i - 1].push(node);
                    }
                } else {
                    temp = this.tree[i][j].value < this.tree[i][k].value ? this.tree[i][j] : this.tree[i][k];
                    
                    if (temp.parent) {
                        temp.parent.index = temp.index;
                        temp.parent.value = temp.value;
                    } else {
                        const node: Node = { index: temp.index, value: temp.value };
                        this.tree[i][j].parent = node;
                        this.tree[i][k].parent = node;
                        this.tree[i - 1].push(node);
                    }
                }
            }
        }
    }

    private clear(): Promise<void> {
        return new Promise(resolve => {
            for (const key of Object.keys(this.tree)) {
                this.tree[key].splice(0);
                delete this.tree[key];
            }

            resolve();
        });
    }

}

