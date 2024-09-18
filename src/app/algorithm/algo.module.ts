import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { provideHttpClient, withInterceptorsFromDi } from "@angular/common/http";
import { EffectsModule } from "@ngrx/effects";
import { StoreModule } from "@ngrx/store";
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DropdownModule } from 'primeng/dropdown';
import { FieldsetModule } from 'primeng/fieldset';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { InputTextModule } from 'primeng/inputtext';
import { SelectButtonModule } from 'primeng/selectbutton';
import { SliderModule } from 'primeng/slider';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { ToolbarModule } from 'primeng/toolbar';

import { TimerPipe } from "../pipe/timer.pipe";

import { AlgorithmSortPageComponent } from "./sort/sort.component";
import { AlgorithmMazePageComponent } from "./maze/maze.component";

import { SortOrderOptionLoadEffect as SortOptionLoadEffect } from "./sort/ngrx-store/sort.effect";
import { SORT_OPTION_FEATURE_KEY } from "./sort/ngrx-store/sourt.selector";
import { SORT_OPTION_LOAD_REDUCER } from "./sort/ngrx-store/sort.reducer";

import { SortLoadConfigService, SortMatchService, SortToolsService, SortUtilsService } from "./sort/ngrx-store/sort.service";
import { BubbleSortService, ShakerBubbleSortService, ExchangeSortService, DualBubbleSortService, ShellBubbleSortService, ShakerOddEvenSortService } from "./sort/service/bubble-sort.service";
import { IterativeBubbleMergeSortService, IterativeCombMergeSortService, RecursiveBubbleMergeSortService, TimWeaveSortService } from "./sort/service/merge-sort.service";
import { RecursiveCombMergeSortService } from "./sort/service/merge-sort.service";
import { BinaryGnomeSortService, BinaryInserionSortService, InsertionSortService, ShakerInsertionSortService, ShellSortService } from "./sort/service/insertion-sort.service";
import { LibrarySortService } from "./sort/service/insertion-sort.service";
import { ShakerSelectionSortService, SelectionSortService, DualSelectionSortService, ShakerPancakeSortService } from "./sort/service/selection-sort.service";
import { BubbleBogoSortService, ShakerBubbleBogoSortService, InsertionBogoSortService, SelectionBogoSortService, BogoSortService, BogoInversePairSortService, ParallelBogoSortService, MergeBogoSortService } from "./sort/service/bogo-sort.service";
import { IterativeAverageQuickSortService, RecursiveAverageQuickSortService, IterativeDualPivotQuickSortService, RecursiveDualPivotQuickSortService, IterativeQuickSortService, RecursiveQuickSortService, ThreeWayIterativeQuickSortService, ThreeWayRecursiveQuickSortService, IterativeTwoWayQuickSortService, RecursiveTwoWayQuickSortService } from "./sort/service/quick-sort.service";
import { CountSortService } from "./sort/service/count-sort.service";
import { BucketSortService, InPlaceBucketSortService, InterpolationSortService, IterativeThreeSlotBucketSortService, PigeonholeSortService, RecursiveThreeSlotBucketSortService } from "./sort/service/bucket-sort.service";
import { InPlaceRadixLSDSortService, InPlaceRadixMSDSortService, IterativeRadixMSDSortService, RadixLSDSortService, RecursiveRadixMSDSortService } from "./sort/service/radix-sort.service";
import { SleepSortService } from "./sort/service/sleep-sort.service";
import { IterativeCycleSortService, RecursiveCycleSortService } from "./sort/service/cycle-sort.service";
import { SmoothSortService } from "./sort/service/selection-sort.service";
import { TernaryHeapSortService } from "./sort/service/selection-sort.service";
import { HeapSortService } from "./sort/service/selection-sort.service";
import { IterativeMergeSortService, InPlaceRecursiveWeaveMergeSortService, IterativeInPlaceMergeSortService, MultiWayMergeSortService,  RecursiveInPlaceMergeSortService, RecursiveMergeSortService, RecursiveWeaveMergeSortService, IterativeWeaveMergeSortService, InPlaceIterativeWeaveMergeSortService, InPlaceStrandSortService, InPlaceBlockStrandSortService } from "./sort/service/merge-sort.service";
import { IterativeStoogeSortService, RecursiveStoogeSortService } from "./sort/service/stooge-sort.service";
import { SlowSortService } from "./sort/service/slow-sort.service";
import { GnomeSortService } from "./sort/service/insertion-sort.service";
import { TournamentSortService } from "./sort/service/selection-sort.service";
import { IterativeBitonicMergeSortService, RecursiveBitonicMergeSortService } from "./sort/service/bitonic-merge-sort.service";
import { OddEvenSortService } from "./sort/service/bubble-sort.service";
import { CombSortService } from "./sort/service/bubble-sort.service";
import { PancakeSortService } from "./sort/service/selection-sort.service";
import { GravitySortService, SimpleGravitySortService } from "./sort/service/gravity-sort.service";
import { IterativeBatcherMergeSortService, RecursiveBatcherMergeSortService } from "./sort/service/batcher-merge-sort.service";
import { PatienceSortService } from "./sort/service/patience-sort.service";
import { IterativeStrandSortService } from "./sort/service/merge-sort.service";
import { RecursiveStrandSortService } from "./sort/service/merge-sort.service";
import { TimSortService } from "./sort/service/merge-sort.service";
import { BinarySearchTreeSortService } from "./sort/service/tree-sort.service";
import { OptimalShearSortService, ShearSortService } from "./sort/service/shear-sort.service";

import { MazeMatchService, MazeToolsService, MazeUtilsService } from "./maze/ngrx-store/maze.service";
import { MazeGenerationRandomizedBacktrackerService } from "./maze/service/backtracker-maze.service";
import { MazeGenerationRandomizedPrimService } from "./maze/service/prim-maze.service";
import { MazeGenerationRandomizedKruskalService } from "./maze/service/kruskal-maze.service";
import { MazeGenerationAldousBroderService } from "./maze/service/aldous-broder-maze.service";
import { MazeGenerationHuntAndKillService } from "./maze/service/hunt-kill-maze.service";
import { MazeGenerationRandomizedDivisionService } from "./maze/service/division-maze.service";
import { MazeGenerationSidewinderService } from "./maze/service/sidewinder-maze.service";
import { MazeGenerationGrowTreeService } from "./maze/service/grow-tree-maze.service";
import { MazeGenerationEllerService } from "./maze/service/eller-maze.service";
import { MazeGenerationWilsonService } from "./maze/service/wilson-maze.service";
import { BlockSortService } from "./sort/service/block-sort.service";
import { GuessSortService } from "./sort/service/cycle-sort.service";
import { IterativeIntrospectiveSortService, RecursiveIntrospectiveSortService } from "./sort/service/intro-sort.service";
import { IterativeCircleSortService, RecursiveCircleSortService } from "./sort/service/circle-sort.service";
import { StalinSortService, InPlaceStalinSortService, BinaryStalinSortService } from "./sort/service/stalin-sort.service";
import { InPlaceLogSortService, IterativeLogSortService, RecursiveLogSortService } from "./sort/service/log-sort.service";
import { IterativePairwiseNetworkingSortService, RecursivePairwiseNetworkingSortService } from "./sort/service/pairwise-sort.service";


@NgModule({ declarations: [
        AlgorithmSortPageComponent,
        AlgorithmMazePageComponent,
        TimerPipe
    ],
    exports: [
        AlgorithmSortPageComponent
    ], imports: [CommonModule,
        FormsModule,
        ButtonModule,
        CheckboxModule,
        ConfirmDialogModule,
        DropdownModule,
        FieldsetModule,
        InputNumberModule,
        InputGroupModule,
        InputGroupAddonModule,
        InputTextModule,
        SelectButtonModule,
        SliderModule,
        TagModule,
        ToastModule,
        ToolbarModule,
        EffectsModule.forFeature(SortOptionLoadEffect),
        StoreModule.forFeature(SORT_OPTION_FEATURE_KEY, { 'feature': SORT_OPTION_LOAD_REDUCER })], providers: [
        SortLoadConfigService, SortMatchService, SortUtilsService, SortToolsService,
        ExchangeSortService, BubbleSortService, ShakerBubbleSortService, DualBubbleSortService, CombSortService, ShellBubbleSortService, OddEvenSortService, ShakerOddEvenSortService, GnomeSortService, BinaryGnomeSortService, InsertionSortService, ShakerInsertionSortService, BinaryInserionSortService, ShellSortService, SelectionSortService, ShakerSelectionSortService, DualSelectionSortService, RecursiveQuickSortService, IterativeQuickSortService, RecursiveAverageQuickSortService, IterativeAverageQuickSortService, RecursiveTwoWayQuickSortService, IterativeTwoWayQuickSortService, ThreeWayRecursiveQuickSortService, ThreeWayIterativeQuickSortService, RecursiveDualPivotQuickSortService, IterativeDualPivotQuickSortService, RecursiveCircleSortService, IterativeCircleSortService, HeapSortService, TernaryHeapSortService, SmoothSortService, InPlaceRadixLSDSortService, InPlaceRadixMSDSortService,
        BucketSortService, InPlaceBucketSortService, RecursiveThreeSlotBucketSortService, IterativeThreeSlotBucketSortService, CountSortService, InterpolationSortService, PigeonholeSortService, RadixLSDSortService, RecursiveRadixMSDSortService, IterativeRadixMSDSortService, RecursiveMergeSortService, IterativeMergeSortService, RecursiveInPlaceMergeSortService, IterativeInPlaceMergeSortService, RecursiveWeaveMergeSortService, IterativeWeaveMergeSortService, InPlaceRecursiveWeaveMergeSortService, InPlaceIterativeWeaveMergeSortService, RecursiveBubbleMergeSortService, IterativeBubbleMergeSortService, RecursiveCombMergeSortService, IterativeCombMergeSortService, MultiWayMergeSortService, RecursiveStrandSortService, IterativeStrandSortService, InPlaceStrandSortService, InPlaceBlockStrandSortService,
        RecursiveBitonicMergeSortService, IterativeBitonicMergeSortService, RecursiveBatcherMergeSortService, IterativeBatcherMergeSortService, ShearSortService, OptimalShearSortService, RecursivePairwiseNetworkingSortService, IterativePairwiseNetworkingSortService,
        RecursiveIntrospectiveSortService, IterativeIntrospectiveSortService, TimSortService, TimWeaveSortService, BlockSortService, 
        BogoSortService, ParallelBogoSortService, BogoInversePairSortService, BubbleBogoSortService, ShakerBubbleBogoSortService, InsertionBogoSortService, SelectionBogoSortService, MergeBogoSortService, RecursiveCycleSortService, IterativeCycleSortService, GravitySortService, SimpleGravitySortService, GuessSortService, SleepSortService, RecursiveStoogeSortService, IterativeStoogeSortService, SlowSortService, TournamentSortService, PancakeSortService, ShakerPancakeSortService, PatienceSortService, LibrarySortService, BinarySearchTreeSortService, InPlaceStalinSortService, StalinSortService, BinaryStalinSortService, RecursiveLogSortService, IterativeLogSortService, InPlaceLogSortService,
        MazeMatchService, MazeUtilsService, MazeToolsService,
        MazeGenerationAldousBroderService, MazeGenerationRandomizedDivisionService, MazeGenerationEllerService, MazeGenerationGrowTreeService, MazeGenerationHuntAndKillService, MazeGenerationRandomizedBacktrackerService, MazeGenerationRandomizedKruskalService, MazeGenerationRandomizedPrimService, MazeGenerationSidewinderService, MazeGenerationWilsonService,
        provideHttpClient(withInterceptorsFromDi())
    ] })
export class AlgorithmModule {}