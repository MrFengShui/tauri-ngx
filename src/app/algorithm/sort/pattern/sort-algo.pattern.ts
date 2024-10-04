import { SortName, SortType } from "../ngrx-store/sort.state";

import { AbstractComparisonSortAlgorithm, AbstractDistributionSortAlgorithm, AbstractSortAlgorithm } from "./sort-temp.pattern";

import { SortToolsService } from "../ngrx-store/sort.service";
import { BubbleSortAlgorithm, CombSortAlgorithm, DualBubbleSortAlgorithm, ExchangeSortAlgorithm, OddEvenSortAlgorithm, ShakerBubbleSortAlgorithm, ShakerOddEvenSortAlgorithm, ShellBubbleSortAlgorithm } from "../algo/exchange-sort.algorithm";
import { BinarySearchTreeSortAlgorithm } from "../algo/tree-sort.algorithm";
import { InsertionShearSortAlgorithm, SelectionShearSortAlgorithm, ShearSortAlgorithm } from "../algo/shear-sort.algorithm";
import { DualSelectionSortAlgorithm, HeapSortAlgorithm, PancakeSortAlgorithm, SelectionSortAlgorithm, ShakerPancakeSortAlgorithm, ShakerSelectionSortAlgorithm, SmoothSortAlgorithm, TernaryHeapSortAlgorithm, TournamentSortAlgorithm } from "../algo/selection-sort.algorithm";
import { RecursiveBatcherMergeSortAlgorithm, IterativeBatcherMergeSortAlgorithm } from "../algo/batcher-merge-sort.algorithm";
import { RecursiveBitonicMergeSortAlgorithm, IterativeBitonicMergeSortAlgorithm } from "../algo/bitonic-merge-sort.algorithm";
import { RecursivePairwiseNetworkSortAlgorithm, IterativePairwiseNetworkSortAlgorithm } from "../algo/pairwise-sort.algorithm";
import { RecursiveIntrospectiveSortAlgorithm, IterativeIntrospectiveSortAlgorithm } from "../algo/intro-sort.algorithm";
import { BinaryGnomeSortAlgorithm, BinaryInsertionSortAlgorithm, GnomeSortAlgorithm, InsertionSortAlgorithm, LibrarySortAlgorithm, ShakerInsertionSortAlgorithm, ShellSortAlgorithm } from "../algo/insertion-sort.algorithm";
import { BlockSortAlgorithm } from "../algo/block-sort.algorithm";
import { RecursiveStoogeSortAlgorithm, IterativeStoogeSortAlgorithm } from "../algo/stooge-sort.algorithm";
import { SlowSortAlgorithm } from "../algo/slow-sort.algorithm";
import { AsyncSleepSortAlgorithm, BlockSleepSortAlgorithm } from "../algo/sleep-sort.algorithm";
import { PatienceSortAlgorithm } from "../algo/patience-sort.algorithm";
import { RecursiveCycleSortAlgorithm, IterativeCycleSortAlgorithm, GuessSortAlgorithm } from "../algo/cycle-sort.algorithm";
import { GravitySortAlgorithm, SimpleGravitySortAlgorithm } from "../algo/gravity-sort.algorithm";
import { RecursiveCircleSortAlgorithm, IterativeCircleSortAlgorithm } from "../algo/circle-sort.algorithm";
import { IterativeAverageQuickSortAlgorithm, IterativeDualPivotQuickSortAlgorithm, IterativeLogarithmQuickSortAlgorithm, IterativeQuickSortAlgorithm, IterativeThreeWayQuickSortAlgorithm, IterativeTwoWayQuickSortAlgorithm, RecursiveAverageQuickSortAlgorithm, RecursiveDualPivotQuickSortAlgorithm, RecursiveLogarithmQuickSortAlgorithm, RecursiveQuickSortAlgorithm, RecursiveThreeWayQuickSortAlgorithm, RecursiveTwoWayQuickSortAlgorithm } from "../algo/quick-sort.algorithm";
import { RecursiveMergeSortAlgorithm, IterativeMergeSortAlgorithm, IterativeInPlaceMergeSortAlgorithm, RecursiveInPlaceMergeSortAlgorithm, RecursiveWeaveMergeSortAlgorithm, IterativeWeaveMergeSortAlgorithm, IterativeInPlaceWeaveMergeSortAlgorithm, RecursiveInPlaceWeaveMergeSortAlgorithm, MultiWayMergeSortAlgorithm, TimSortAlgorithm, TimWeaveSortAlgorithm, InPlaceTimSortAlgorithm, IterativeBubbleMergeSortAlgorithm, IterativeCombMergeSortAlgorithm, RecursiveBubbleMergeSortAlgorithm, RecursiveCombMergeSortAlgorithm, RecursiveStrandSortAlgorithm, IterativeStrandSortAlgorithm, InPlaceStrandSortAlgorithm } from "../algo/merge-sort.algorithm";
import { InPlaceStalinSortAlgorithm, StalinSortAlgorithm } from "../algo/stalin-sort.algorithm";
import { RecursiveLogSortAlgorithm, IterativeLogSortAlgorithm, InPlaceLogSortAlgorithm } from "../algo/log-sort.algorithm";
import { InPlaceLSDRadixSortAlgorithm, InPlaceMSDRadixSortAlgorithm, IterativeMSDRadixSortAlgorithm, LSDRadixSortAlgorithm, RecursiveMSDRadixSortAlgorithm } from "../algo/radix-sort.algorithm";
import { BucketSortAlgorithm, FlashSortAlgorithm, InPlaceBucketSortAlgorithm, InterpolationSortAlgorithm, IterativeThreeSlotBucketSortAlgorithm, PigeonholeSortAlgorithm, RecursiveThreeSlotBucketSortAlgorithm } from "../algo/bucket-sort.algorithm";
import { SpaghettiSortAlgorithm } from "../algo/spaghetti-sort.algorithm";
import { CountSortAlgorithm } from "../algo/count-sort.algorithm";
import { BlockBogoSortAlgorithm, BogoSortAlgorithm, BreakPointBogoSortAlgorithm, BubbleBogoSortAlgorithm, InsertionBogoSortAlgorithm, MergeBogoSortAlgorithm, SelectionBogoSortAlgorithm, ShakerBreakPointBogoSortAlgorithm, ShakerBubbleBogoSortAlgorithm } from "../algo/bogo-sort.algorithm";

export abstract class AbstractSortAlgorithmFlyWeightFactory {

    protected service: SortToolsService;

    protected cache: { [key: string]: AbstractSortAlgorithm } = {};
    protected keys: string[] = [];

    constructor(private _service: SortToolsService) {
        this.service = this._service;
    }

    public abstract produce(name: SortName): AbstractSortAlgorithm | null;

    public clear(): void {
        let key: string | null;

        while (this.keys.length > 0) {
            key = this.keys.pop() as string;
            delete this.cache[key];
        }

        key = null;
    }

    public lookup(): void {
        console.debug('algorith:', JSON.parse(JSON.stringify(this.cache)));
    }

}

export class ComparisonSortAlgorithmFlyWeightFactory extends AbstractSortAlgorithmFlyWeightFactory {

    public override produce(name: SortName): AbstractComparisonSortAlgorithm | null {
        if (name) {
            if (!this.keys.includes(name)) {
                if (name === 'exchange-sort') {
                    this.cache[name] = new ExchangeSortAlgorithm(this.service);
                }
        
                if (name === 'bubble-sort') {
                    this.cache[name] = new BubbleSortAlgorithm(this.service);
                }
        
                if (name === 'shaker-bubble-sort') {
                    this.cache[name] = new ShakerBubbleSortAlgorithm(this.service);
                }
        
                if (name === 'dual-bubble-sort') {
                    this.cache[name] = new DualBubbleSortAlgorithm(this.service);
                }

                if (name === 'comb-sort') {
                    this.cache[name] = new CombSortAlgorithm(this.service);
                }
        
                if (name === 'shell-bubble-sort') {
                    this.cache[name] = new ShellBubbleSortAlgorithm(this.service);
                }
        
                if (name === 'odd-even-sort') {
                    this.cache[name] = new OddEvenSortAlgorithm(this.service);
                }
        
                if (name === 'shaker-odd-even-sort') {
                    this.cache[name] = new ShakerOddEvenSortAlgorithm(this.service);
                }
        
                if (name === 'gnome-sort') {
                    this.cache[name] = new GnomeSortAlgorithm(this.service);
                }
        
                if (name === 'bin-gnome-sort') {
                    this.cache[name] = new BinaryGnomeSortAlgorithm(this.service);
                }        
        
                if (name === 'insert-sort') {
                    this.cache[name] = new InsertionSortAlgorithm(this.service);
                }        
        
                if (name === 'shaker-insert-sort') {
                    this.cache[name] = new ShakerInsertionSortAlgorithm(this.service);
                }        
                
                if (name === 'bin-insert-sort') {
                    this.cache[name] = new BinaryInsertionSortAlgorithm(this.service);
                }        
        
                if (name === 'shell-sort') {
                    this.cache[name] = new ShellSortAlgorithm(this.service);
                }        
        
                if (name === 'select-sort') {
                    this.cache[name] = new SelectionSortAlgorithm(this.service);
                }
        
                if (name === 'shaker-select-sort') {
                    this.cache[name] = new ShakerSelectionSortAlgorithm(this.service);
                }
        
                if (name === 'dual-select-sort') {
                    this.cache[name] = new DualSelectionSortAlgorithm(this.service);
                }
        
                if (name === 'heap-sort') {
                    this.cache[name] = new HeapSortAlgorithm(this.service);
                }
        
                if (name === 'mult-heap-sort') {
                    this.cache[name] = new TernaryHeapSortAlgorithm(this.service);
                }
        
                if (name === 'recu-quick-sort') {
                    this.cache[name] = new RecursiveQuickSortAlgorithm(this.service);
                }
        
                if (name === 'iter-quick-sort') {
                    this.cache[name] = new IterativeQuickSortAlgorithm(this.service);
                }
        
                if (name === 'recu-2way-quick-sort') {
                    this.cache[name] = new RecursiveTwoWayQuickSortAlgorithm(this.service);
                }
        
                if (name === 'iter-2way-quick-sort') {
                    this.cache[name] = new IterativeTwoWayQuickSortAlgorithm(this.service);
                }
        
                if (name === 'recu-log-quick-sort') {
                    this.cache[name] = new RecursiveLogarithmQuickSortAlgorithm(this.service);
                }
        
                if (name === 'iter-log-quick-sort') {
                    this.cache[name] = new IterativeLogarithmQuickSortAlgorithm(this.service);
                }
        
                if (name === 'recu-mean-quick-sort') {
                    this.cache[name] = new RecursiveAverageQuickSortAlgorithm(this.service);
                }
        
                if (name === 'iter-mean-quick-sort') {
                    this.cache[name] = new IterativeAverageQuickSortAlgorithm(this.service);
                }
        
                if (name === 'recu-3way-quick-sort') {
                    this.cache[name] = new RecursiveThreeWayQuickSortAlgorithm(this.service);
                }
        
                if (name === 'iter-3way-quick-sort') {
                    this.cache[name] = new IterativeThreeWayQuickSortAlgorithm(this.service);
                }
        
                if (name === 'recu-dual-pivot-quick-sort') {
                    this.cache[name] = new RecursiveDualPivotQuickSortAlgorithm(this.service);
                }
        
                if (name === 'iter-dual-pivot-quick-sort') {
                    this.cache[name] = new IterativeDualPivotQuickSortAlgorithm(this.service);
                }
        
                if (name === 'recu-circle-sort') {
                    this.cache[name] = new RecursiveCircleSortAlgorithm(this.service);
                }
        
                if (name === 'iter-circle-sort') {
                    this.cache[name] = new IterativeCircleSortAlgorithm(this.service);
                }

                this.keys.push(name);
            }
         
            return this.cache[name] as AbstractComparisonSortAlgorithm;
        }

        return null;
    }

}

export class DistributionSortAlgorithmFlyWeightFactory extends AbstractSortAlgorithmFlyWeightFactory {

    public override produce(name: SortName): AbstractDistributionSortAlgorithm | null {
        if (name) {
            if (!this.keys.includes(name)) {
                if (name === 'bucket-sort') {
                    this.cache[name] = new BucketSortAlgorithm(this.service);
                }

                if (name === 'ipbucket-sort') {
                    this.cache[name] = new InPlaceBucketSortAlgorithm(this.service);
                }

                if (name === 'recu-3slot-bucket-sort') {
                    this.cache[name] = new RecursiveThreeSlotBucketSortAlgorithm(this.service);
                }

                if (name === 'iter-3slot-bucket-sort') {
                    this.cache[name] = new IterativeThreeSlotBucketSortAlgorithm(this.service);
                }

                if (name === 'lsd-radix-sort') {
                    this.cache[name] = new LSDRadixSortAlgorithm(this.service);
                }

                if (name === 'lsd-ipradix-sort') {
                    this.cache[name] = new InPlaceLSDRadixSortAlgorithm(this.service);
                }

                if (name === 'recu-msd-radix-sort') {
                    this.cache[name] = new RecursiveMSDRadixSortAlgorithm(this.service);
                }

                if (name === 'iter-msd-radix-sort') {
                    this.cache[name] = new IterativeMSDRadixSortAlgorithm(this.service);
                }

                if (name === 'msd-ipradix-sort') {
                    this.cache[name] = new InPlaceMSDRadixSortAlgorithm(this.service);
                }

                if (name === 'recu-merge-sort') {
                    this.cache[name] = new RecursiveMergeSortAlgorithm(this.service);
                }

                if (name === 'iter-merge-sort') {
                    this.cache[name] = new IterativeMergeSortAlgorithm(this.service);
                }

                if (name === 'recu-ipmerge-sort') {
                    this.cache[name] = new RecursiveInPlaceMergeSortAlgorithm(this.service);
                }

                if (name === 'iter-ipmerge-sort') {
                    this.cache[name] = new IterativeInPlaceMergeSortAlgorithm(this.service);
                }

                if (name === 'recu-weave-merge-sort') {
                    this.cache[name] = new RecursiveWeaveMergeSortAlgorithm(this.service);
                }

                if (name === 'iter-weave-merge-sort') {
                    this.cache[name] = new IterativeWeaveMergeSortAlgorithm(this.service);
                }

                if (name === 'recu-weave-ipmerge-sort') {
                    this.cache[name] = new RecursiveInPlaceWeaveMergeSortAlgorithm(this.service);
                }
        
                if (name === 'iter-weave-ipmerge-sort') {
                    this.cache[name] = new IterativeInPlaceWeaveMergeSortAlgorithm(this.service);
                }
        
                if (name === 'recu-bubble-merge-sort') {
                    this.cache[name] = new RecursiveBubbleMergeSortAlgorithm(this.service);
                }

                if (name === 'iter-bubble-merge-sort') {
                    this.cache[name] = new IterativeBubbleMergeSortAlgorithm(this.service);
                }

                if (name === 'recu-comb-merge-sort') {
                    this.cache[name] = new RecursiveCombMergeSortAlgorithm(this.service);
                }
        
                if (name === 'iter-comb-merge-sort') {
                    this.cache[name] = new IterativeCombMergeSortAlgorithm(this.service);
                }
        
                if (name === 'mult-merge-sort') {
                    this.cache[name] = new MultiWayMergeSortAlgorithm(this.service);
                }
        
                if (name === 'recu-log-sort') {
                    this.cache[name] = new RecursiveLogSortAlgorithm(this.service);
                }
        
                if (name === 'iter-log-sort') {
                    this.cache[name] = new IterativeLogSortAlgorithm(this.service);
                }
        
                if (name === 'iplog-sort') {
                    this.cache[name] = new InPlaceLogSortAlgorithm(this.service);
                }
        
                if (name === 'count-sort') {
                    this.cache[name] = new CountSortAlgorithm(this.service);
                }        
        
                if (name === 'flash-sort') {
                    this.cache[name] = new FlashSortAlgorithm(this.service);
                }
        
                if (name === 'inter-pole-sort') {
                    this.cache[name] = new InterpolationSortAlgorithm(this.service);
                }
        
                if (name === 'pigeon-hole-sort') {
                    this.cache[name] = new PigeonholeSortAlgorithm(this.service);
                }
        
                this.keys.push(name);
            }
         
            return this.cache[name] as AbstractDistributionSortAlgorithm;
        }

        return null;
    }

}

export class ParallelSortAlgorithmFlyWeightFactory extends AbstractSortAlgorithmFlyWeightFactory {

    public override produce(name: SortName): AbstractSortAlgorithm | null {
        if (name) {
            if (!this.keys.includes(name)) {
                if (name === 'recu-batcher-merge-sort') {
                    this.cache[name] = new RecursiveBatcherMergeSortAlgorithm(this.service);
                }

                if (name === 'iter-batcher-merge-sort') {
                    this.cache[name] = new IterativeBatcherMergeSortAlgorithm(this.service);
                }

                if (name === 'recu-bitonic-merge-sort') {
                    this.cache[name] = new RecursiveBitonicMergeSortAlgorithm(this.service);
                }

                if (name === 'iter-bitonic-merge-sort') {
                    this.cache[name] = new IterativeBitonicMergeSortAlgorithm(this.service);
                }

                if (name === 'recu-pairwise-network-sort') {
                    this.cache[name] = new RecursivePairwiseNetworkSortAlgorithm(this.service);
                }

                if (name === 'iter-pairwise-network-sort') {
                    this.cache[name] = new IterativePairwiseNetworkSortAlgorithm(this.service);
                }

                if (name === 'shear-sort') {
                    this.cache[name] = new ShearSortAlgorithm(this.service);
                }
        
                if (name === 'insert-shear-sort') {
                    this.cache[name] = new InsertionShearSortAlgorithm(this.service);
                }
        
                if (name === 'select-shear-sort') {
                    this.cache[name] = new SelectionShearSortAlgorithm(this.service);
                }
        
                this.keys.push(name);
            }
         
            return this.cache[name] as AbstractComparisonSortAlgorithm;
        }

        return null;
    }

}

export class HybridSortAlgorithmFlyWeightFactory extends AbstractSortAlgorithmFlyWeightFactory {

    public override produce(name: SortName): AbstractSortAlgorithm | null {
        if (name) {
            if (!this.keys.includes(name)) {
                if (name === 'block-sort') {
                    this.cache[name] = new BlockSortAlgorithm(this.service);
                }

                if (name === 'recu-intro-sort') {
                    this.cache[name] = new RecursiveIntrospectiveSortAlgorithm(this.service);
                }

                if (name === 'iter-intro-sort') {
                    this.cache[name] = new IterativeIntrospectiveSortAlgorithm(this.service);
                }

                if (name === 'library-sort') {
                    this.cache[name] = new LibrarySortAlgorithm(this.service);
                }
        
                if (name === 'smooth-sort') {
                    this.cache[name] = new SmoothSortAlgorithm(this.service);
                }
        
                if (name === 'tim-sort') {
                    this.cache[name] = new TimSortAlgorithm(this.service);
                }
        
                if (name === 'iptim-sort') {
                    this.cache[name] = new InPlaceTimSortAlgorithm(this.service);
                }
        
                if (name === 'tim-weave-sort') {
                    this.cache[name] = new TimWeaveSortAlgorithm(this.service);
                }

                this.keys.push(name);
            }
         
            return this.cache[name] as AbstractComparisonSortAlgorithm;
        }

        return null;
    }

}

export class CuriousSortAlgorithmFlyWeightFactory extends AbstractSortAlgorithmFlyWeightFactory {

    public override produce(name: SortName): AbstractSortAlgorithm | null {
        if (name) {
            if (!this.keys.includes(name)) {
                if (name === 'bogo-sort') {
                    this.cache[name] = new BogoSortAlgorithm(this.service);
                }

                if (name === 'block-bogo-sort') {
                    this.cache[name] = new BlockBogoSortAlgorithm(this.service);
                }

                if (name === 'bpbogo-sort') {
                    this.cache[name] = new BreakPointBogoSortAlgorithm(this.service);
                }

                if (name === 'shaker-bpbogo-sort') {
                    this.cache[name] = new ShakerBreakPointBogoSortAlgorithm(this.service);
                }

                if (name === 'bubble-bogo-sort') {
                    this.cache[name] = new BubbleBogoSortAlgorithm(this.service);
                }

                if (name === 'shaker-bubble-bogo-sort') {
                    this.cache[name] = new ShakerBubbleBogoSortAlgorithm(this.service);
                }

                if (name === 'insert-bogo-sort') {
                    this.cache[name] = new InsertionBogoSortAlgorithm(this.service);
                }

                if (name === 'select-bogo-sort') {
                    this.cache[name] = new SelectionBogoSortAlgorithm(this.service);
                }

                if (name === 'merge-bogo-sort') {
                    this.cache[name] = new MergeBogoSortAlgorithm(this.service);
                }

                if (name === 'bst-sort') {
                    this.cache[name] = new BinarySearchTreeSortAlgorithm(this.service);
                }

                if (name === 'recu-cycle-sort') {
                    this.cache[name] = new RecursiveCycleSortAlgorithm(this.service);
                }

                if (name === 'iter-cycle-sort') {
                    this.cache[name] = new IterativeCycleSortAlgorithm(this.service);
                }

                if (name === 'gravity-sort') {
                    this.cache[name] = new GravitySortAlgorithm(this.service);
                }

                if (name === 'simple-gravity-sort') {
                    this.cache[name] = new SimpleGravitySortAlgorithm(this.service);
                }

                if (name === 'guess-sort') {
                    this.cache[name] = new GuessSortAlgorithm(this.service);
                }

                if (name === 'noodle-sort') {
                    this.cache[name] = new SpaghettiSortAlgorithm(this.service);
                }

                if (name === 'pancake-sort') {
                    this.cache[name] = new PancakeSortAlgorithm(this.service);
                }

                if (name === 'shaker-pancake-sort') {
                    this.cache[name] = new ShakerPancakeSortAlgorithm(this.service);
                }

                if (name === 'patience-sort') {
                    this.cache[name] = new PatienceSortAlgorithm(this.service);
                }

                if (name === 'block-sleep-sort') {
                    this.cache[name] = new BlockSleepSortAlgorithm(this.service);
                }

                if (name === 'async-sleep-sort') {
                    this.cache[name] = new AsyncSleepSortAlgorithm(this.service);
                }

                if (name === 'slow-sort') {
                    this.cache[name] = new SlowSortAlgorithm(this.service);
                }

                if (name === 'stalin-sort') {
                    this.cache[name] = new StalinSortAlgorithm(this.service);
                }

                if (name === 'ipstalin-sort') {
                    this.cache[name] = new InPlaceStalinSortAlgorithm(this.service);
                }

                if (name === 'recu-strand-sort') {
                    this.cache[name] = new RecursiveStrandSortAlgorithm(this.service);
                }
        
                if (name === 'iter-strand-sort') {
                    this.cache[name] = new IterativeStrandSortAlgorithm(this.service);
                }
        
                if (name === 'ipstrand-sort') {
                    this.cache[name] = new InPlaceStrandSortAlgorithm(this.service);
                }
        
                if (name === 'recu-stooge-sort') {
                    this.cache[name] = new RecursiveStoogeSortAlgorithm(this.service);
                }

                if (name === 'iter-stooge-sort') {
                    this.cache[name] = new IterativeStoogeSortAlgorithm(this.service);
                }

                if (name === 'tournament-sort') {
                    this.cache[name] = new TournamentSortAlgorithm(this.service);
                }
        
                this.keys.push(name);
            }
         
            return this.cache[name] as AbstractComparisonSortAlgorithm;
        }

        return null;
    }

}

export class SortAlgorithmMatchFlyWeightFactory {

    private static factory: SortAlgorithmMatchFlyWeightFactory | null = null;

    private cache: { [key: number]: AbstractSortAlgorithmFlyWeightFactory } = {};
    private keys: number[] = [];

    protected constructor() {}

    public fetch(type: SortType, name: SortName, _service: SortToolsService): AbstractSortAlgorithm | null {
        if (type) {
            if (!this.keys.includes(type)) {
                if (type === 1) {
                    this.cache[type] = new ComparisonSortAlgorithmFlyWeightFactory(_service);
                } 
                
                if (type === 2) {
                    this.cache[type] = new DistributionSortAlgorithmFlyWeightFactory(_service);
                }
        
                if (type === 3) {
                    this.cache[type] = new ParallelSortAlgorithmFlyWeightFactory(_service);
                }
        
                if (type === 4) {
                    this.cache[type] = new HybridSortAlgorithmFlyWeightFactory(_service);
                }
        
                if (type === 5) {
                    this.cache[type] = new CuriousSortAlgorithmFlyWeightFactory(_service);
                }

                this.keys.push(type);
            }
            
            return this.cache[type].produce(name);
        }

        return null;
    }

    public clear(): void {
        let key: number | null;

        while (this.keys.length > 0) {
            key = this.keys.pop() as number;
            this.cache[key].clear();
            delete this.cache[key];
        }

        key = null;
    }

    public lookup(): void {
        for (let key of this.keys) this.cache[key].lookup();
    }

    public static newInstance(): SortAlgorithmMatchFlyWeightFactory {
        if (this.factory === null) {
            this.factory = new SortAlgorithmMatchFlyWeightFactory();
        }

        return this.factory;
    }

}
