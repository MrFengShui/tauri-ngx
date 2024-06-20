import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FormsModule } from "@angular/forms";
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

import { SortMatchService, SortToolsService, SortUtilsService } from "./sort/service/sort.service";
import { BubbleSortService, CooktailSortService } from "./sort/service/bubble-sort.service";
import { BinarySearchInserionSortService, InsertionSortService, ShellSortService } from "./sort/service/insertion-sort.service";
import { LibrarySortService } from "./sort/service/library-sort.service";
import { BiSelectionSortService, SelectionSortService } from "./sort/service/selection-sort.service";
import { BogoBubbleSortService, BogoCocktailSortService, BogoSortService } from "./sort/service/bogo-sort.service";
import { QuickSortService, TwoWayQuickSortService } from "./sort/service/quick-sort.service";
import { CountSortService } from "./sort/service/count-sort.service";
import { BucketSortService } from "./sort/service/bucket-sort.service";
import { RadixLSDSortService, RadixMSDSortService } from "./sort/service/radix-sort.service";
import { SleepSortService } from "./sort/service/sleep-sort.service";
import { CycleSortService } from "./sort/service/cycle-sort.service";
import { HeapSortService, TernaryHeapSortService } from "./sort/service/heap-sort.service";
import { BottomUpMergeSortService, FourWayMergeSortService, InPlaceMergeSortService, TopDownMergeSortService } from "./sort/service/merge-sort.service";
import { StoogeSortService } from "./sort/service/stooge-sort.service";
import { SlowSortService } from "./sort/service/slow-sort.service";
import { GnomeSortService } from "./sort/service/gnome-sort.service";
import { TournamentSortService } from "./sort/service/tournament-sort.service";
import { BottomUpBitonicMergeSortService, TopDownBitonicMergeSortService } from "./sort/service/bitonic-merge-sort.service";
import { OddEvenSortService } from "./sort/service/odd-even-sort.service";
import { CombSortService } from "./sort/service/bubble-sort.service";
import { PancakeSortService } from "./sort/service/pancake-sort.service";
import { GravitySortService } from "./sort/service/gravity-sort.service";
import { BottomUpOddEvenMergeSortService, TopDownOddEvenMergeSortService } from "./sort/service/odd-even-merge-sort.service";
import { PatienceSortService } from "./sort/service/patience-sort.service";

@NgModule({
    declarations: [
        AlgorithmSortPageComponent,
        TimerPipe
    ],
    imports: [
        CommonModule,
        FormsModule,
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

        // EffectsModule.forFeature([SortEffect]),
        // StoreModule.forFeature(SORT_FEATURE_KEY, { 'feature': SORT_REDUCER })
    ],
    exports: [
        AlgorithmSortPageComponent
    ],
    providers: [
        SortMatchService, SortUtilsService, SortToolsService,
        BubbleSortService, CooktailSortService, OddEvenSortService, CombSortService, InsertionSortService, BinarySearchInserionSortService, LibrarySortService, ShellSortService, SelectionSortService, BiSelectionSortService, QuickSortService, TwoWayQuickSortService, HeapSortService, TernaryHeapSortService,
        BucketSortService, CountSortService, RadixLSDSortService, RadixMSDSortService, TopDownMergeSortService, BottomUpMergeSortService, FourWayMergeSortService, InPlaceMergeSortService,
        TopDownBitonicMergeSortService, BottomUpBitonicMergeSortService, TopDownOddEvenMergeSortService, BottomUpOddEvenMergeSortService,
        BogoSortService, BogoBubbleSortService, BogoCocktailSortService, CycleSortService, GnomeSortService, GravitySortService, SleepSortService, StoogeSortService, SlowSortService, TournamentSortService, PancakeSortService, PatienceSortService
    ]
})
export class AlgorithmModule {}