import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, NgZone, OnDestroy, OnInit, Renderer2, ViewEncapsulation } from "@angular/core";
import { Store } from "@ngrx/store";
import { ScrollerOptions, TreeNode } from "primeng/api";
import { Subscription, filter, map } from "rxjs";
import { cloneDeep } from "lodash";

import { APP_CONFIG_STYLE_NAME_LOAD_ACTION, APP_CONFIG_STYLE_COLOR_LOAD_ACTION, APP_STYLE_CHANGE_ACTION, APP_NAVLIST_LOAD_ACTION } from "../ngrx-store/app.action";
import { APP_FEATURE_SELECTOR } from "../ngrx-store/app.selector";
import { AppStyleNameModel, AppStyleColorModel, ColorType, AppStyleModel, AppConfigReducerState, AppStyleReducerState } from "../ngrx-store/app.state";

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    selector: 'home-page',
    templateUrl: 'home.component.html',
    styleUrl: 'home.component.scss'
})
export class HomePageComponent implements OnInit, OnDestroy, AfterViewInit {
    
    styleThemeMode: boolean = true;
    styleNameSelect: AppStyleNameModel = { name: 'lara', text: 'Aura主题样式' };
    styleNameList: AppStyleNameModel[] = [];
    styleColorSelect: AppStyleColorModel = { name: 'amber', text: '琥珀黄', code: '#fbbf24' };
    styleColorList: AppStyleColorModel[] = [];
    navlist: TreeNode[] = [];
    navlistSelect: TreeNode = {};

    private config$: Subscription | null = null;
    private style$: Subscription | null = null;
    private navlist$: Subscription | null = null;
    
    constructor(
        private _cdr: ChangeDetectorRef,
        private _element: ElementRef<HTMLElement>,
        private _renderer: Renderer2,
        private _ngZone: NgZone,
        private _store: Store
    ) { }

    ngOnInit(): void {
        this._store.dispatch(APP_CONFIG_STYLE_NAME_LOAD_ACTION());
        this._store.dispatch(APP_CONFIG_STYLE_COLOR_LOAD_ACTION());
        this._store.dispatch(APP_NAVLIST_LOAD_ACTION());
    }

    ngOnDestroy(): void {
        this.config$?.unsubscribe();
        this.style$?.unsubscribe();
        this.navlist$?.unsubscribe();
    }

    ngAfterViewInit(): void {
        this.initHostLayout();
        this.listenNavlistChange();
        this.listenConfigChange();
        this.listenStyleChange();
    }

    styleOnChange(): void {
        this._store.dispatch(APP_STYLE_CHANGE_ACTION({
            name: this.styleNameSelect?.name as string,
            theme: this.styleThemeMode as boolean ? 'dark' : 'light',
            color: this.styleColorSelect?.name as ColorType 
        }));
    }

    private initHostLayout(): void {
        this._renderer.addClass(this._element.nativeElement, 'flex');
        this._renderer.addClass(this._element.nativeElement, 'flex-column');
        this._renderer.addClass(this._element.nativeElement, 'h-full');
    }

    private renderStyle(model: AppStyleModel) {
        this.styleThemeMode = model.mode;
        this.styleColorSelect = this.styleColorList.find(item => item.name === model.struct.color) as AppStyleColorModel;
        this.styleNameSelect = this.styleNameList.find(item => item.name === model.struct.name) as AppStyleNameModel;
    }

    private listenConfigChange(): void {
        this._ngZone.runOutsideAngular(() => {
            this.config$ = this._store.select(APP_FEATURE_SELECTOR)
                .pipe(filter(state => state.configFeature.action.length > 0))
                .subscribe(state => this._ngZone.run(() => {
                    const feature: AppConfigReducerState = state.configFeature;
                    
                    if (feature.action === APP_CONFIG_STYLE_NAME_LOAD_ACTION.type) {
                        this.styleNameList = feature.value as AppStyleNameModel[];
                    }

                    if (feature.action === APP_CONFIG_STYLE_COLOR_LOAD_ACTION.type) {
                        this.styleColorList = feature.value as AppStyleColorModel[];
                    }

                    if (feature.action === APP_NAVLIST_LOAD_ACTION.type) {
                        this.navlist = feature.value as TreeNode[];
                    }

                    this._cdr.detectChanges();
                }));
        });
    }

    private listenStyleChange(): void {
        this._ngZone.runOutsideAngular(() => {
            this.style$ = this._store.select(APP_FEATURE_SELECTOR)
                .pipe(filter(state => state.styleFeature.action === APP_STYLE_CHANGE_ACTION.type))
                .subscribe(state => this._ngZone.run(() => {
                    const feature: AppStyleReducerState = state.styleFeature;
                    this.renderStyle(feature.value as AppStyleModel);
                    this._cdr.detectChanges();
                }));
        });
    }

    private listenNavlistChange(): void {
        this._ngZone.runOutsideAngular(() => 
            this.navlist$ = this._store.select(APP_FEATURE_SELECTOR)
                .pipe(
                    filter(state => state.navlistFeature.action === APP_NAVLIST_LOAD_ACTION.type),
                    map(state => state.navlistFeature.value)
                )
                .subscribe(value => this._ngZone.run(() => {
                    this.navlist = cloneDeep(value);
                    this._cdr.markForCheck();
                    this.navlist$?.unsubscribe();
                })));
    }

}