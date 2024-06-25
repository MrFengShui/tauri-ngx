import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, NgZone, OnDestroy, OnInit, Renderer2, ViewEncapsulation } from "@angular/core";
import { ActivatedRoute, ActivatedRouteSnapshot, NavigationEnd, Router, UrlSegment } from "@angular/router";
import { Store } from "@ngrx/store";
import { TreeNode } from "primeng/api";
import { Subscription, filter, map } from "rxjs";
import { cloneDeep } from "lodash";

import { APP_CONFIG_STYLE_NAME_LOAD_ACTION, APP_CONFIG_STYLE_COLOR_LOAD_ACTION, APP_STYLE_CHANGE_ACTION, APP_NAVLIST_LOAD_ACTION } from "../../ngrx-store/app.action";
import { APP_FEATURE_SELECTOR } from "../../ngrx-store/app.selector";
import { AppStyleNameModel, AppStyleColorModel, ColorType, AppStyleModel, AppConfigReducerState, AppStyleReducerState } from "../../ngrx-store/app.state";

type RouteUrlParam = { url?: string[], param?: string, mark?: boolean };

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
    navlist: TreeNode<RouteUrlParam>[] = [];
    navlistSelect: TreeNode = {};

    private param: string = '';

    private config$: Subscription | null = null;
    private style$: Subscription | null = null;
    private navlist$: Subscription | null = null;
    private event$: Subscription | null = null;
    
    constructor(
        private _route: ActivatedRoute,
        private _cdr: ChangeDetectorRef,
        private _element: ElementRef<HTMLElement>,
        private _renderer: Renderer2,
        private _router: Router,
        private _ngZone: NgZone,
        private _store: Store
    ) { 
        this._ngZone.runOutsideAngular(() => {
            this.event$ = this._router.events
                .pipe(
                    filter(event => event instanceof NavigationEnd),
                    map(() => this._route.snapshot)
                )
                .subscribe(snapshot => 
                    this._ngZone.run(() => {
                        this.parseRouteSnapshot(snapshot);
                    }));
        });
    }

    ngOnInit(): void {
        this._store.dispatch(APP_CONFIG_STYLE_NAME_LOAD_ACTION());
        this._store.dispatch(APP_CONFIG_STYLE_COLOR_LOAD_ACTION());
        this._store.dispatch(APP_NAVLIST_LOAD_ACTION());
    }

    ngOnDestroy(): void {
        this.config$?.unsubscribe();
        this.style$?.unsubscribe();
        this.navlist$?.unsubscribe();
        this.event$?.unsubscribe();
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
        this._renderer.addClass(this._element.nativeElement, 'w-screen');
        this._renderer.addClass(this._element.nativeElement, 'h-screen');
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
                    this.expandNavlistOnLoad(this.navlist);
                    this._cdr.markForCheck();
                    this.navlist$?.unsubscribe();
                })));
    }

    private parseRouteSnapshot(snapshot: ActivatedRouteSnapshot): void {
        let stack: ActivatedRouteSnapshot[] = [snapshot], path: string;

        while (stack.length > 0) {
            snapshot = stack.pop() as ActivatedRouteSnapshot;
            path = snapshot.url[snapshot.url.length - 1].path;

            if (path === 'sort') {
                this.param = snapshot.queryParams['name'];
                break;
            } else {
                this.param = path;
            }

            snapshot.children.forEach(child => stack.push(child));
        }

        stack.splice(0);
    }

    private expandNavlistOnLoad(navlist: TreeNode<RouteUrlParam>[]): void {
        let stack: TreeNode<RouteUrlParam>[] = [], queue: TreeNode<RouteUrlParam>[] = [], node: TreeNode<RouteUrlParam> = {};

        for (let i = navlist.length - 1; i >= 0; i--) {
            stack.push(navlist[i]);
        }

        while (stack.length > 0) {
            node = stack.pop() as TreeNode<RouteUrlParam>;
            queue.push(node);
            
            if (node.data && (node.data.param === this.param || (node.data.url && node.data.url[node.data.url.length - 1] === this.param))) break;
            
            if (node.children) {
                for (let i = node.children.length - 1; i >= 0; i--) {
                    stack.push(node.children[i]);
                }
            }
        }
        
        for (let item of queue) {
            if (!item.key || !node.key?.includes(item.key)) continue;

            if (item.leaf) {
                item.data = { ...item.data, mark: true };
            } else {
                item.expanded = true;
            }
        }

        queue.splice(0);
        stack.splice(0);
    }

}