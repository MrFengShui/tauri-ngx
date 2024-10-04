
import { SortDataModel, SortStateModel, SortOption, SortOrder } from "../ngrx-store/sort.state";

import { ACCENT_TWO_COLOR, delay } from "../../../public/global.utils";
import { ACCENT_ONE_COLOR } from "../../../public/global.utils";

import { AbstractDistributionSortAlgorithm } from "../pattern/sort-temp.pattern";

type BSTNode = { value: number; left: BSTNode | null; right: BSTNode | null; };

/**
 * 二叉树排序
 */
export class BinarySearchTreeSortAlgorithm extends AbstractDistributionSortAlgorithm {

    private root: BSTNode | null = null;

    protected override async sortByAscent(source: SortDataModel[], lhs: number, rhs: number, option: SortOption, callback: (param: SortStateModel) => void): Promise<void> {
        let times: number = 0;

        times = await this.saveByOrder(source, lhs, rhs, 'ascent', times, callback);
        times = await this.loadByOrder(source, lhs, rhs, 'ascent', times, callback);   
        
        this.freeTree(this.root);
        this.root = null;

        await delay();
        await this.complete(source, times, callback);
    }

    protected override async sortByDescent(source: SortDataModel[], lhs: number, rhs: number, option: SortOption, callback: (parram: SortStateModel) => void): Promise<void> {
        let times: number = 0;

        times = await this.saveByOrder(source, lhs, rhs, 'descent', times, callback);
        times = await this.loadByOrder(source, lhs, rhs, 'descent', times, callback);        

        this.freeTree(this.root);
        this.root = null;

        await delay();
        await this.complete(source, times, callback);
    }

    protected override async saveByOrder(source: SortDataModel[], lhs: number, rhs: number, order: SortOrder, times: number, callback: (param: SortStateModel) => void): Promise<number> {
        let index: number = -1;

        for (let i = lhs; i <= rhs; i++) {
            if (order === 'ascent') index = i;

            if (order === 'descent') index = rhs - i;

            this.root = await this.buildTree(this.root, source[index].value);

            times = await this.sweep(source, index, ACCENT_ONE_COLOR, times, callback);
            times += 1;
        }

        return times;
    }

    protected override async loadByOrder(source: SortDataModel[], lhs: number, rhs: number, order: SortOrder, times: number, callback: (param: SortStateModel) => void): Promise<number> {
        let index: number = -1;

        this.array = this.traverse(this.root, this.array);
        
        for (let i = lhs; this.array.length > 0; i++) {
            if (order === 'ascent') index = i;

            if (order === 'descent') index = rhs - i;

            source[index].value = this.array.shift() as number;

            times = await this.sweep(source, index, ACCENT_TWO_COLOR, times, callback);
            times += 1;
        }     
        
        return times;
    }

    protected async buildTree(root: BSTNode | null, value: number): Promise<BSTNode | null> {
        let node: BSTNode | null = root, temp: BSTNode | null = null;

        while (node) {
            temp = node;

            if (value < node.value) {
                node = node.left;
            } else {
                node = node.right;
            }
        }

        if (temp) {
            if (value < temp.value) {
                temp.left = { value, left: null, right: null };
            } else {
                temp.right = { value, left: null, right: null };
            }

            temp = null;
        } else {
            root = { value, left: null, right: null };
        }

        return root;
    }

    protected traverse(root: BSTNode | null, target: number[]): number[] {
        if (root) {
            target = this.traverse(root.left, target);
            target.push(root.value);
            target = this.traverse(root.right, target);
        }

        return target;
    }

    private freeTree(root: BSTNode | null): void {
        if (root) {
            this.freeTree(root.left);
            this.freeTree(root.right);    
            root.left = null;
            root.right = null;
            root = null;
        }
    }

}

