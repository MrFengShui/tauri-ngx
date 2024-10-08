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
                    data: { url: ['/playground', 'algorithm', 'sort'], param: 'cocktail-sort' },
                    leaf: true
                },
                {
                    key: '2-1-12',
                    label: '梳排序',
                    data: { url: ['/playground', 'algorithm', 'sort'], param: 'comb-sort' },
                    leaf: true
                },
                {
                    key: '2-1-13',
                    label: '奇偶排序',
                    data: { url: ['/playground', 'algorithm', 'sort'], param: 'odd-even-sort' },
                    leaf: true
                },
                {
                    key: '2-1-20',
                    label: '插入排序',
                    data: { url: ['/playground', 'algorithm', 'sort'], param: 'insertion-sort' },
                    leaf: true
                },
                {
                    key: '2-1-21',
                    label: '二分插入排序',
                    data: { url: ['/playground', 'algorithm', 'sort'], param: 'bs-insertion-sort' },
                    leaf: true
                },
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
                },
                {
                    key: '2-1-61',
                    label: '堆排序（多节点）',
                    data: { url: ['/playground', 'algorithm', 'sort'], param: 'k-node-heap-sort' },
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
                    label: '鸽巢排序',
                    data: { url: ['/playground', 'algorithm', 'sort'], param: 'pigeonhole-sort' },
                    leaf: true
                },
                {
                    key: '2-2-40',
                    label: '基数排序（低位）',
                    data: { url: ['/playground', 'algorithm', 'sort'], param: 'lsd-radix-sort' },
                    leaf: true
                },
                {
                    key: '2-2-41',
                    label: '基数排序（高位）',
                    data: { url: ['/playground', 'algorithm', 'sort'], param: 'msd-radix-sort' },
                    leaf: true
                },
                {
                    key: '2-2-50',
                    label: '归并排序（至顶向下）',
                    data: { url: ['/playground', 'algorithm', 'sort'], param: 'td-merge-sort' },
                    leaf: true
                },
                {
                    key: '2-2-51',
                    label: '归并排序（至底向上）',
                    data: { url: ['/playground', 'algorithm', 'sort'], param: 'bu-merge-sort' },
                    leaf: true
                },
                {
                    key: '2-2-52',
                    label: '归并排序（四路）',
                    data: { url: ['/playground', 'algorithm', 'sort'], param: '4w-merge-sort' },
                    leaf: true
                },
                {
                    key: '2-2-53',
                    label: '归并排序（原地）',
                    data: { url: ['/playground', 'algorithm', 'sort'], param: 'ip-merge-sort' },
                    leaf: true
                }
            ]
        },
        {
            key: '2-3',
            label: '并行排序',
            leaf: false,
            children: [
                {
                    key: '2-3-10',
                    label: '奇偶归并排序（自顶向下）',
                    data: { url: ['/playground', 'algorithm', 'sort'], param: 'td-odd-even-merge-sort' },
                    leaf: true
                },
                {
                    key: '2-3-11',
                    label: '奇偶归并排序（自底向上）',
                    data: { url: ['/playground', 'algorithm', 'sort'], param: 'bu-odd-even-merge-sort' },
                    leaf: true
                },
                {
                    key: '2-3-20',
                    label: '双调归并排序（自顶向下）',
                    data: { url: ['/playground', 'algorithm', 'sort'], param: 'td-bitonic-merge-sort' },
                    leaf: true
                },
                {
                    key: '2-3-21',
                    label: '双调归并排序（自底向上）',
                    data: { url: ['/playground', 'algorithm', 'sort'], param: 'bu-bitonic-merge-sort' },
                    leaf: true
                }
            ]
        },
        {
            key: '2-4',
            label: '奇异排序',
            leaf: false,
            children: [
                {
                    key: '2-4-10',
                    label: '猴子排序',
                    data: { url: ['/playground', 'algorithm', 'sort'], param: 'bogo-sort' },
                    leaf: true
                },
                {
                    key: '2-4-11',
                    label: '猴子冒泡排序（单向）',
                    data: { url: ['/playground', 'algorithm', 'sort'], param: 'bogo-bubble-sort' },
                    leaf: true
                },
                {
                    key: '2-4-12',
                    label: '猴子冒泡排序（双向）',
                    data: { url: ['/playground', 'algorithm', 'sort'], param: 'bogo-cocktail-sort' },
                    leaf: true
                },
                {
                    key: '2-4-20',
                    label: '循环排序',
                    data: { url: ['/playground', 'algorithm', 'sort'], param: 'cycle-sort' },
                    leaf: true
                },
                {
                    key: '2-4-30',
                    label: '引力排序',
                    data: { url: ['/playground', 'algorithm', 'sort'], param: 'gravity-sort' },
                    leaf: true
                },
                {
                    key: '2-4-40',
                    label: '侏儒排序',
                    data: { url: ['/playground', 'algorithm', 'sort'], param: 'gnome-sort' },
                    leaf: true
                },
                {
                    key: '2-4-50',
                    label: '睡眠排序',
                    data: { url: ['/playground', 'algorithm', 'sort'], param: 'sleep-sort' },
                    leaf: true
                },
                {
                    key: '2-4-60',
                    label: '臭皮匠排序',
                    data: { url: ['/playground', 'algorithm', 'sort'], param: 'stooge-sort' },
                    leaf: true
                },
                {
                    key: '2-4-70',
                    label: '慢速排序',
                    data: { url: ['/playground', 'algorithm', 'sort'], param: 'slow-sort' },
                    leaf: true
                },
                {
                    key: '2-4-80',
                    label: '锦标赛排序',
                    data: { url: ['/playground', 'algorithm', 'sort'], param: 'tournament-sort' },
                    leaf: true
                },
                {
                    key: '2-4-90',
                    label: '煎饼排序',
                    data: { url: ['/playground', 'algorithm', 'sort'], param: 'pancake-sort' },
                    leaf: true
                },
                {
                    key: '2-4-100',
                    label: '耐心排序',
                    data: { url: ['/playground', 'algorithm', 'sort'], param: 'patience-sort' },
                    leaf: true
                },
                {
                    key: '2-4-110',
                    label: '图书馆排序',
                    data: { url: ['/playground', 'algorithm', 'sort'], param: 'library-sort' },
                    leaf: true
                },
            ]
        }
    ]
}

export const APP_NAVLIST: Observable<TreeNode<{ url: string[], param?: string }>[]> = new Observable(subscriber => {
    const list: TreeNode<{ url: string[], param?: string }>[] = Array.from([]);
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