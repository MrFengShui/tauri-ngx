import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { HttpClientModule } from "@angular/common/http";
import { EffectsModule } from "@ngrx/effects";
import { StoreModule } from "@ngrx/store";
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DropdownModule } from 'primeng/dropdown';
import { FieldsetModule } from 'primeng/fieldset';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { InputTextModule } from 'primeng/inputtext';
import { SelectButtonModule } from 'primeng/selectbutton';
import { SliderModule } from 'primeng/slider';
import { TagModule } from 'primeng/tag';
import { ToolbarModule } from 'primeng/toolbar';

import { TimerPipe } from "../pipe/timer.pipe";

import { AlgorithmSortPageComponent } from "./sort/sort.component";
import { AlgorithmMazePageComponent } from "./maze/maze.component";

import { SortOrderOptionLoadEffect as SortOptionLoadEffect } from "./sort/ngrx-store/sort.effect";
import { SORT_OPTION_FEATURE_KEY } from "./sort/ngrx-store/sourt.selector";
import { SORT_OPTION_LOAD_REDUCER } from "./sort/ngrx-store/sort.reducer";

import { SortLoadConfigService, SortMatchService, SortToolsService, SortUtilsService } from "./sort/ngrx-store/sort.service";
import { BubbleSortService, CooktailSortService, ExchangeSortService, TwoWayBubbleSortService } from "./sort/service/bubble-sort.service";
import { BinarySearchInserionSortService, InsertionSortService, ShellSortService } from "./sort/service/insertion-sort.service";
import { LibrarySortService } from "./sort/service/insertion-sort.service";
import { ShakerSelectionSortService, SelectionSortService, TwoWaySelectionSortService } from "./sort/service/selection-sort.service";
import { BogoBubbleSortService, BogoCocktailSortService, BogoSortService } from "./sort/service/bogo-sort.service";
import { DualPivotIterativeQuickSortService, DualPivotRecursiveQuickSortService, IterativeQuickSortService, RecursiveQuickSortService, ThreeWayIterativeQuickSortService, ThreeWayRecursiveQuickSortService, TwoWayIterativeQuickSortService, TwoWayRecursiveQuickSortService } from "./sort/service/quick-sort.service";
import { CountSortService } from "./sort/service/count-sort.service";
import { BucketSortService, InterpolationSortService, PigeonholeSortService } from "./sort/service/bucket-sort.service";
import { RadixLSDSortService, RadixMSDSortService } from "./sort/service/radix-sort.service";
import { AsyncSleepSortService, SyncSleepSortService } from "./sort/service/sleep-sort.service";
import { CycleSortService } from "./sort/service/cycle-sort.service";
import { HeapSortService, SmoothSortService, TernaryHeapSortService } from "./sort/service/heap-sort.service";
import { BottomUpMergeSortService, MultiWayMergeSortService, InPlaceMergeSortService, TopDownMergeSortService } from "./sort/service/merge-sort.service";
import { IterativeStoogeSortService, RecursiveStoogeSortService } from "./sort/service/stooge-sort.service";
import { SlowSortService } from "./sort/service/slow-sort.service";
import { GnomeSortService } from "./sort/service/insertion-sort.service";
import { TournamentSortService } from "./sort/service/tree-sort.service";
import { BottomUpBitonicMergeSortService, TopDownBitonicMergeSortService } from "./sort/service/bitonic-merge-sort.service";
import { OddEvenSortService } from "./sort/service/bubble-sort.service";
import { CombSortService } from "./sort/service/bubble-sort.service";
import { PancakeSortService } from "./sort/service/pancake-sort.service";
import { GravitySortService } from "./sort/service/gravity-sort.service";
import { BottomUpOddEvenMergeSortService, TopDownOddEvenMergeSortService } from "./sort/service/odd-even-merge-sort.service";
import { PatienceSortService } from "./sort/service/patience-sort.service";
import { OptimalStrandSortService, StrandSortService } from "./sort/service/strand-sort.service";
import { TimSortService } from "./sort/service/tim-sort.service";
import { BinarySearchTreeSortService } from "./sort/service/tree-sort.service";
import { OptimalShearSortService, ShearSortService } from "./sort/service/shear-sort.service";

import { MazeMatchService, MazeToolsService, MazeUtilsService } from "./maze/ngrx-store/maze.service";
import { MazeGenerationRandomizedBacktrackerService, MazeGenerationParallelRandomizedBacktrackerService } from "./maze/service/backtracker-maze.service";
import { MazeGenerationParallelPrimService, MazeGenerationRandomizedPrimService } from "./maze/service/prim-maze.service";

@NgModule({
    declarations: [
        AlgorithmSortPageComponent,
        AlgorithmMazePageComponent,
        TimerPipe
    ],
    imports: [
        CommonModule,
        FormsModule,
        HttpClientModule,
        ButtonModule,
        ConfirmDialogModule,
        DropdownModule,
        FieldsetModule,
        InputGroupModule,
        InputGroupAddonModule,
        InputTextModule,
        SelectButtonModule,
        SliderModule,
        TagModule,
        ToolbarModule,

        EffectsModule.forFeature(SortOptionLoadEffect),
        StoreModule.forFeature(SORT_OPTION_FEATURE_KEY, { 'feature': SORT_OPTION_LOAD_REDUCER }),
    ],
    exports: [
        AlgorithmSortPageComponent
    ],
    providers: [
        SortLoadConfigService, SortMatchService, SortUtilsService, SortToolsService,
        BubbleSortService, CooktailSortService, TwoWayBubbleSortService, CombSortService, OddEvenSortService, ExchangeSortService, InsertionSortService, BinarySearchInserionSortService, ShellSortService, SelectionSortService, ShakerSelectionSortService, TwoWaySelectionSortService, RecursiveQuickSortService, IterativeQuickSortService, TwoWayRecursiveQuickSortService, TwoWayIterativeQuickSortService, ThreeWayRecursiveQuickSortService, ThreeWayIterativeQuickSortService, DualPivotRecursiveQuickSortService, DualPivotIterativeQuickSortService, HeapSortService, TernaryHeapSortService, SmoothSortService,
        BucketSortService, CountSortService, InterpolationSortService, PigeonholeSortService, RadixLSDSortService, RadixMSDSortService, TopDownMergeSortService, BottomUpMergeSortService, MultiWayMergeSortService, InPlaceMergeSortService, TimSortService, 
        TopDownBitonicMergeSortService, BottomUpBitonicMergeSortService, TopDownOddEvenMergeSortService, BottomUpOddEvenMergeSortService, ShearSortService, OptimalShearSortService,
        BogoSortService, BogoBubbleSortService, BogoCocktailSortService, CycleSortService, GnomeSortService, GravitySortService, SyncSleepSortService, AsyncSleepSortService, RecursiveStoogeSortService, IterativeStoogeSortService, SlowSortService, TournamentSortService, PancakeSortService, PatienceSortService, LibrarySortService, StrandSortService, OptimalStrandSortService, BinarySearchTreeSortService,

        MazeMatchService, MazeUtilsService, MazeToolsService,
        MazeGenerationRandomizedBacktrackerService, MazeGenerationParallelRandomizedBacktrackerService, MazeGenerationRandomizedPrimService, MazeGenerationParallelPrimService
    ]
})
export class AlgorithmModule {}