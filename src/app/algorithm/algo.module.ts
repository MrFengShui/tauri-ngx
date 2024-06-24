import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { HttpClientModule } from "@angular/common/http";
import { EffectsModule } from "@ngrx/effects";
import { StoreModule } from "@ngrx/store";
import { ButtonModule } from 'primeng/button';
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

import { SortOrderOptionLoadEffect as SortOptionLoadEffect } from "./sort/ngrx-store/sort.effect";
import { SORT_OPTION_FEATURE_KEY } from "./sort/ngrx-store/sourt.selector";
import { SORT_OPTION_LOAD_REDUCER } from "./sort/ngrx-store/sort.reducer";

import { SortLoadConfigService, SortMatchService, SortToolsService, SortUtilsService } from "./sort/service/sort.service";
import { BubbleSortService, CooktailSortService } from "./sort/service/bubble-sort.service";
import { BinarySearchInserionSortService, InsertionSortService, ShellSortService } from "./sort/service/insertion-sort.service";
import { LibrarySortService } from "./sort/service/library-sort.service";
import { BiSelectionSortService, SelectionSortService } from "./sort/service/selection-sort.service";
import { BogoBubbleSortService, BogoCocktailSortService, BogoSortService } from "./sort/service/bogo-sort.service";
import { DualPivotIterativeQuickSortService, DualPivotRecursiveQuickSortService, IterativeQuickSortService, RecursiveQuickSortService, ThreeWayIterativeQuickSortService, ThreeWayRecursiveQuickSortService, TwoWayIterativeQuickSortService, TwoWayRecursiveQuickSortService } from "./sort/service/quick-sort.service";
import { CountSortService } from "./sort/service/count-sort.service";
import { BucketSortService, InterpolationSortService, PigeonholeSortService } from "./sort/service/bucket-sort.service";
import { RadixLSDSortService, RadixMSDSortService } from "./sort/service/radix-sort.service";
import { SleepSortService } from "./sort/service/sleep-sort.service";
import { CycleSortService } from "./sort/service/cycle-sort.service";
import { HeapSortService, TernaryHeapSortService } from "./sort/service/heap-sort.service";
import { BottomUpMergeSortService, MultiWayMergeSortService, InPlaceMergeSortService, TopDownMergeSortService } from "./sort/service/merge-sort.service";
import { StoogeSortService } from "./sort/service/stooge-sort.service";
import { SlowSortService } from "./sort/service/slow-sort.service";
import { GnomeSortService } from "./sort/service/gnome-sort.service";
import { TournamentSortService } from "./sort/service/tournament-sort.service";
import { BottomUpBitonicMergeSortService, TopDownBitonicMergeSortService } from "./sort/service/bitonic-merge-sort.service";
import { OddEvenSortService } from "./sort/service/bubble-sort.service";
import { CombSortService } from "./sort/service/bubble-sort.service";
import { PancakeSortService } from "./sort/service/pancake-sort.service";
import { GravitySortService } from "./sort/service/gravity-sort.service";
import { BottomUpOddEvenMergeSortService, TopDownOddEvenMergeSortService } from "./sort/service/odd-even-merge-sort.service";
import { PatienceSortService } from "./sort/service/patience-sort.service";
import { StrandSortService } from "./sort/service/strand-sort.service";
import { TimSortService } from "./sort/service/tim-sort.service";

@NgModule({
    declarations: [
        AlgorithmSortPageComponent,
        TimerPipe
    ],
    imports: [
        CommonModule,
        FormsModule,
        HttpClientModule,
        ButtonModule,
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
        BubbleSortService, CooktailSortService, OddEvenSortService, CombSortService, InsertionSortService, BinarySearchInserionSortService, ShellSortService, SelectionSortService, BiSelectionSortService, RecursiveQuickSortService, IterativeQuickSortService, TwoWayRecursiveQuickSortService, TwoWayIterativeQuickSortService, ThreeWayRecursiveQuickSortService, ThreeWayIterativeQuickSortService, DualPivotRecursiveQuickSortService, DualPivotIterativeQuickSortService, HeapSortService, TernaryHeapSortService,
        BucketSortService, CountSortService, InterpolationSortService, PigeonholeSortService, RadixLSDSortService, RadixMSDSortService, TopDownMergeSortService, BottomUpMergeSortService, MultiWayMergeSortService, InPlaceMergeSortService,
        TopDownBitonicMergeSortService, BottomUpBitonicMergeSortService, TopDownOddEvenMergeSortService, BottomUpOddEvenMergeSortService, TimSortService,
        BogoSortService, BogoBubbleSortService, BogoCocktailSortService, CycleSortService, GnomeSortService, GravitySortService, SleepSortService, StoogeSortService, SlowSortService, TournamentSortService, PancakeSortService, PatienceSortService, LibrarySortService, StrandSortService
    ]
})
export class AlgorithmModule {}