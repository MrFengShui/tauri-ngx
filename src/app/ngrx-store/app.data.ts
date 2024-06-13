import { TreeNode } from 'primeng/api';
import { Observable } from 'rxjs';

const ALGORITHM_SORT_NAVLIST: TreeNode<{ url: string[], param?: string }> = {
    key: '2',
    label: '排序算法',
    leaf: false,
    children: [
        {
            key: '2-1',
            label: '交换排序',
            leaf: false,
            children: [
                {
                    key: '2-1-10',
                    label: '冒泡排序（单向）',
                    data: { url: ['/playground', 'algorithm', 'sort'], param: 'bubble-sort' },
                    leaf: true
                },
                {
                    key: '2-1-11',
                    label: '冒泡排序（双向）',
                    data: { url: ['/playground', 'algorithm', 'sort'], param: 'bi-bubble-sort' },
                    leaf: true
                },
                {
                    key: '2-1-20',
                    label: '插入排序',
                    data: { url: ['/playground', 'algorithm', 'sort'], param: 'insertion-sort' },
                    leaf: true
                },
                // {
                //     key: '2-1-21',
                //     label: '插入排序（二分）',
                //     data: { url: ['/playground', 'algorithm', 'sort'], param: 'bs-insertion-sort' },
                //     leaf: true
                // },
                {
                    key: '2-1-22',
                    label: '希尔排序',
                    data: { url: ['/playground', 'algorithm', 'sort'], param: 'shell-sort' },
                    leaf: true
                },
                {
                    key: '2-1-30',
                    label: '选择排序（单向）',
                    data: { url: ['/playground', 'algorithm', 'sort'], param: 'selection-sort' },
                    leaf: true
                },
                {
                    key: '2-1-31',
                    label: '选择排序（双向）',
                    data: { url: ['/playground', 'algorithm', 'sort'], param: 'bi-selection-sort' },
                    leaf: true
                },
                // {
                //     key: '2-1-32',
                //     label: '选择排序（两端）',
                //     data: { url: ['/playground', 'algorithm', 'sort'], param: 'bo-selection-sort' },
                //     leaf: true
                // },
                {
                    key: '2-1-50',
                    label: '快速排序（单路）',
                    data: { url: ['/playground', 'algorithm', 'sort'], param: 'quick-sort' },
                    leaf: true
                },
                {
                    key: '2-1-51',
                    label: '快速排序（二路）',
                    data: { url: ['/playground', 'algorithm', 'sort'], param: '2w-quick-sort' },
                    leaf: true
                },
                {
                    key: '2-1-52',
                    label: '快速排序（三路）',
                    data: { url: ['/playground', 'algorithm', 'sort'], param: '3w-quick-sort' },
                    leaf: true
                },
                {
                    key: '2-1-60',
                    label: '堆排序',
                    data: { url: ['/playground', 'algorithm', 'sort'], param: 'heap-sort' },
                    leaf: true
                }
            ]
        },
        {
            key: '2-2',
            label: '空间排序',
            leaf: false,
            children: [
                {
                    key: '2-2-10',
                    label: '计数排序',
                    data: { url: ['/playground', 'algorithm', 'sort'], param: 'count-sort' },
                    leaf: true
                },
                {
                    key: '2-2-20',
                    label: '桶排序',
                    data: { url: ['/playground', 'algorithm', 'sort'], param: 'bucket-sort' },
                    leaf: true
                },
                {
                    key: '2-2-30',
                    label: '基数排序（LSD）',
                    data: { url: ['/playground', 'algorithm', 'sort'], param: 'lsd-radix-sort' },
                    leaf: true
                },
                {
                    key: '2-2-31',
                    label: '基数排序（MSD）',
                    data: { url: ['/playground', 'algorithm', 'sort'], param: 'msd-radix-sort' },
                    leaf: true
                },
                {
                    key: '2-2-40',
                    label: '归并排序',
                    data: { url: ['/playground', 'algorithm', 'sort'], param: 'merge-sort' },
                    leaf: true
                }
            ]
        },
        {
            key: '2-3',
            label: '奇异排序',
            leaf: false,
            children: [
                {
                    key: '2-3-10',
                    label: '猴子排序',
                    data: { url: ['/playground', 'algorithm', 'sort'], param: 'bogo-sort' },
                    leaf: true
                },
                {
                    key: '2-3-11',
                    label: '猴子排序（冒泡）',
                    data: { url: ['/playground', 'algorithm', 'sort'], param: 'bogo-bubble-sort' },
                    leaf: true
                },
                {
                    key: '2-3-20',
                    label: '循环排序',
                    data: { url: ['/playground', 'algorithm', 'sort'], param: 'cycle-sort' },
                    leaf: true
                },
                {
                    key: '2-3-30',
                    label: '重力排序',
                    data: { url: ['/playground', 'algorithm', 'sort'], param: 'gravity-sort' },
                    leaf: true
                },
                {
                    key: '2-3-40',
                    label: '侏儒排序',
                    data: { url: ['/playground', 'algorithm', 'sort'], param: 'gnome-sort' },
                    leaf: true
                },
                {
                    key: '2-3-50',
                    label: '睡眠排序',
                    data: { url: ['/playground', 'algorithm', 'sort'], param: 'sleep-sort' },
                    leaf: true
                },
                {
                    key: '2-3-60',
                    label: '臭皮匠排序',
                    data: { url: ['/playground', 'algorithm', 'sort'], param: 'stooge-sort' },
                    leaf: true
                },
                {
                    key: '2-3-70',
                    label: '慢速排序',
                    data: { url: ['/playground', 'algorithm', 'sort'], param: 'slow-sort' },
                    leaf: true
                },
                {
                    key: '2-3-80',
                    label: '锦标赛排序',
                    data: { url: ['/playground', 'algorithm', 'sort'], param: 'tournament-sort' },
                    leaf: true
                }
            ]
        }
    ]
}

export const APP_NAVLIST: Observable<TreeNode<{ url: string[], param?: string }>[]> = new Observable(subscriber => {
    let list: TreeNode<{ url: string[], param?: string }>[] = Array.from([]);
    list.push({
        key: '1',
        label: '项目导航',
        data: { url: ['/playground'] },
        leaf: true
    });
    list.push(ALGORITHM_SORT_NAVLIST);
    list.push({
        key: '10',
        label: '关于本站',
        data: { url: ['/authorization', 'register'] },
        leaf: true
    });
    subscriber.next(list);
    subscriber.complete();
});