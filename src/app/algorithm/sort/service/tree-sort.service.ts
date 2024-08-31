import { Injectable } from "@angular/core";
import { Observable } from "rxjs";

import { SortDataModel, SortStateModel, SortOrder } from "../ngrx-store/sort.state";
import { delay } from "../../../public/global.utils";
import { ACCENT_ONE_COLOR, CLEAR_COLOR, ACCENT_TWO_COLOR } from "../../../public/global.utils";

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

            await delay();

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

            await delay();

            source[i].color = CLEAR_COLOR;
            callback({ times, datalist: source });
        }

        await delay();
        // await complete(source, times, callback);
        this.target.splice(0);
    }

    private async sortByDescent(source: SortDataModel[], flag: boolean, times: number, callback: (parram: SortStateModel) => void): Promise<void> {
        let root: BSTNode | undefined;

        for (let i = 0; i < source.length; i++) {
            times += 1;

            source[i].color = ACCENT_ONE_COLOR;
            callback({ times, datalist: source });

            await delay();

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

            await delay();

            source[i].color = CLEAR_COLOR;
            callback({ times, datalist: source });
        }

        await delay();
        // await complete(source, times, callback);
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

