import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FormsModule } from "@angular/forms";
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
import { TooltipModule } from 'primeng/tooltip';

import { TimerPipe } from "../pipe/timer.pipe";

import { AlgorithmSortPageComponent } from "./sort/sort.component";
import { AlgorithmMazePageComponent } from "./maze/maze.component";

import { SortConfigEffect, SortDataEffect } from "./sort/ngrx-store/sort.effect";
import { SORT_RESULT_FEATURE_KEY } from "./sort/ngrx-store/sourt.selector";
import { SORT_RESULT_REDUCER } from "./sort/ngrx-store/sort.reducer";

import { SortConfigService, SortMatchService, SortToolsService, SortDataService } from "./sort/ngrx-store/sort.service";

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

@NgModule({ 
    declarations: [
        AlgorithmSortPageComponent,
        AlgorithmMazePageComponent,
        TimerPipe
    ],
    exports: [
        AlgorithmSortPageComponent
    ], 
    imports: [
        CommonModule,
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
        TooltipModule,
        EffectsModule.forFeature([SortConfigEffect, SortDataEffect]),
        StoreModule.forFeature(SORT_RESULT_FEATURE_KEY, { 'feature': SORT_RESULT_REDUCER })
    ], 
    providers: [
        SortConfigService, SortDataService, SortToolsService, SortMatchService,

        MazeMatchService, MazeUtilsService, MazeToolsService,
        MazeGenerationAldousBroderService, MazeGenerationRandomizedDivisionService, MazeGenerationEllerService, MazeGenerationGrowTreeService, MazeGenerationHuntAndKillService, MazeGenerationRandomizedBacktrackerService, MazeGenerationRandomizedKruskalService, MazeGenerationRandomizedPrimService, MazeGenerationSidewinderService, MazeGenerationWilsonService,
    ] 
})
export class AlgorithmModule {}