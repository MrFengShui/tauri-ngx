import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, NgZone, Renderer2 } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { Store } from "@ngrx/store";
import { Subscription, filter, last } from "rxjs";
import { TreeNode } from "primeng/api";
import { TreeNodeSelectEvent } from "primeng/tree";

import { APP_CONFIG_STYLE_NAME_LOAD_ACTION, APP_CONFIG_STYLE_COLOR_LOAD_ACTION, APP_STYLE_CHANGE_ACTION, APP_CONFIG_NAVLIST_LOAD_ACTION } from "../ngrx-store/app.action";
import { APP_NAVLIST } from "../ngrx-store/app.data";
import { APP_FEATURE_SELECTOR } from "../ngrx-store/app.selector";
import { AppStyleNameModel, AppStyleColorModel, ColorType, AppStyleModel, AppConfigReducerState, AppStyleReducerState } from "../ngrx-store/app.state";

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'home-page',
    templateUrl: 'home.component.html'
})
export class HomePageComponent {
    
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
        private _route: ActivatedRoute,
        private _cdr: ChangeDetectorRef,
        private _element: ElementRef<HTMLElement>,
        private _renderer: Renderer2,
        private _router: Router,
        private _ngZone: NgZone,
        private _store: Store
    ) { }

    ngOnInit(): void {
        this._store.dispatch(APP_CONFIG_STYLE_NAME_LOAD_ACTION());
        this._store.dispatch(APP_CONFIG_STYLE_COLOR_LOAD_ACTION());
    }

    ngOnDestroy(): void {
        this.config$?.unsubscribe();
        this.style$?.unsubscribe();
        this.navlist$?.unsubscribe();
    }

    ngAfterViewInit(): void {
        this.initHostLayout();
        this.initNavlist();
        this.listenConfigChange();
        this.listenStyleChange();
    }

    onNodeSelect(event: TreeNodeSelectEvent): void {
        if (event.node.leaf && event.node.data['url']) {
            this._router.navigate(event.node.data['url'], { queryParams: { name: event.node.data['param'] } });
        }
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

    private initNavlist(): void {
        this.navlist$ = APP_NAVLIST.subscribe(value => {
            this.navlist = value;
            this._cdr.detectChanges();
            this.navlist$?.unsubscribe();
        });
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

                    if (feature.action === APP_CONFIG_NAVLIST_LOAD_ACTION.type) {
                        this.navlist = feature.value as TreeNode[];
                    }

                    this._cdr.detectChanges();
                }));
        });
    }

    private listenStyleChange(): void {
        this._ngZone.runOutsideAngular(() => {
            this.style$ = this._store.select(APP_FEATURE_SELECTOR)
                .pipe(filter(state => state.styleFeatuer.action === APP_STYLE_CHANGE_ACTION.type))
                .subscribe(state => this._ngZone.run(() => {
                    const feature: AppStyleReducerState = state.styleFeatuer;
                    this.renderStyle(feature.value as AppStyleModel);
                    this._cdr.detectChanges();
                }));
        });
    }

}