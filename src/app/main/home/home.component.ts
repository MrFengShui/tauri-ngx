import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, EventEmitter, Inject, Input, LOCALE_ID, NgZone, OnDestroy, OnInit, Output, Renderer2, ViewEncapsulation } from "@angular/core";
import { ActivatedRoute, ActivatedRouteSnapshot, NavigationEnd, Router, UrlSegment } from "@angular/router";
import { Store } from "@ngrx/store";
import { TreeNode } from "primeng/api";
import { Subscription, filter, map } from "rxjs";
import { cloneDeep } from "lodash";

import { HOME_LOCALE_OPTION_LOAD_ACTION, HONE_NAVLIST_LOAD_ACTION } from '../ngrx-store/main.action';
import { AppStyleModel, ColorType } from "../../ngrx-store/app.state";
import { LocaleIDType, LocaleOptionModel, StyleColorOptionModel } from "../ngrx-store/main.state";
import { StyleNameOptionModel } from "../ngrx-store/main.state";
import { HOME_NAVLIST_LOAD_FEATURE_SELECTOR, HOME_OPTION_LOAD_FEATURE_SELECTOR } from "../ngrx-store/main.selector";
import { HOME_STYLE_COLOR_OPTION_LOAD_ACTION, HOME_STYLE_NAME_OPTION_LOAD_ACTION } from "../ngrx-store/main.action";
import { RouteUrlParam } from "../ngrx-store/main.state";
import { APP_STYLE_SAVE_ACTION } from "../../ngrx-store/app.action";
import { APP_FEATURE_SELECTOR } from "../../ngrx-store/app.selector";

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    selector: 'tauri-ngx-home-page',
    templateUrl: 'home.component.html',
    styleUrl: 'home.component.scss'
})
export class HomePageComponent implements OnInit, OnDestroy, AfterViewInit {

    localeOptions: LocaleOptionModel[] = [];
    localeID: LocaleIDType = this._localeID as LocaleIDType;
    styleNameOptions: StyleNameOptionModel[] = [];
    styleName: string = 'aura';
    styleColorOptions: StyleColorOptionModel[] = [];
    styleColor: ColorType = 'amber';
    styleMode: boolean = true;
    navlist: TreeNode<RouteUrlParam>[] = [];
    protected key: string = '';

    private readonly PORT: { [key: string]: number } = { 'en-US': 4200, 'zh-Hans': 5200, 'zh-Hant': 5300 };

    private location:Location = window.location;
    private idSplit: string[] = [];

    private event$: Subscription | null = null;
    private style$: Subscription | null = null;
    private navlist$: Subscription | null = null;
    private options$: Subscription | null = null;
    
    constructor(
        private _route: ActivatedRoute,
        private _cdr: ChangeDetectorRef,
        private _element: ElementRef<HTMLElement>,
        private _renderer: Renderer2,
        private _router: Router,
        private _ngZone: NgZone,
        private _store: Store,

        @Inject(LOCALE_ID)
        private _localeID: string
    ) { 
        this._ngZone.runOutsideAngular(() => {
            this.event$ = this._router.events
                .pipe(
                    filter(event => event instanceof NavigationEnd),
                    map(() => this._route.snapshot)
                )
                .subscribe(snapshot => 
                    this._ngZone.run(() => {
                        if (Object.keys(snapshot.queryParams).includes('id')) {
                            this.key = snapshot.queryParams['id'] as string;
                            const split = this.key.split('-');

                            for (let i = 1; i <= split.length; i++) {
                                this.idSplit.push(split.slice(0, i).join('-'));
                            }
                        }
                    }));
        });
    }

    ngOnInit(): void {
        this._store.dispatch(HOME_LOCALE_OPTION_LOAD_ACTION({ localeID: this._localeID }));
        this._store.dispatch(HOME_STYLE_NAME_OPTION_LOAD_ACTION({ localeID: this._localeID }));
        this._store.dispatch(HOME_STYLE_COLOR_OPTION_LOAD_ACTION({ localeID: this._localeID }));
        this._store.dispatch(HONE_NAVLIST_LOAD_ACTION({ localeID: this._localeID }));
    }

    ngOnDestroy(): void {
        this.event$?.unsubscribe();
        this.style$?.unsubscribe();
        this.options$?.unsubscribe();
        this.navlist$?.unsubscribe();
    }

    ngAfterViewInit(): void {
        this.initHostLayout();
        this.listenNavlistChange();
        this.listenOptionChange();
        this.listenStyleChange();
    }
    
    styleOnChange(): void {
        this._store.dispatch(APP_STYLE_SAVE_ACTION({
            mode: this.styleMode,
            name: this.styleName,
            theme: this.styleMode ? 'dark' : 'light',
            color: this.styleColor
        }));
    }

    localeOnChange(): void { 
        let href: string;
        
        if (this.location.hostname === 'localhost' || this.location.hostname === '127.0.0.1') {
            href = this.location.href
                .replace(this.location.port, this.PORT[this.localeID].toString())
                .replace(this._localeID, this.localeID);
        } else {
            href = this.location.href.replace(this._localeID, this.localeID);
        }

        this.location.replace(href);
    }

    findColorOption(name: ColorType): StyleColorOptionModel | undefined {
        return this.styleColorOptions.find(item => item.name === name);
    }

    findLocaleOption(name: LocaleIDType): LocaleOptionModel | undefined {
        return this.localeOptions.find(item => item.name === name);
    }

    private initHostLayout(): void {
        this._renderer.addClass(this._element.nativeElement, 'flex');
        this._renderer.addClass(this._element.nativeElement, 'flex-column');
        this._renderer.addClass(this._element.nativeElement, 'w-screen');
        this._renderer.addClass(this._element.nativeElement, 'h-screen');
    }

    private listenStyleChange(): void {
        this._ngZone.runOutsideAngular(() => {
            this.style$ = this._store.select(APP_FEATURE_SELECTOR)
                .pipe(filter(state => state.action.length > 0))
                .subscribe(state => this._ngZone.run(() => {
                    const model: AppStyleModel = state.result as AppStyleModel;
                    this.styleMode = model.mode;
                    this.styleName = model.name;
                    this.styleColor = model.color;
                }))
        });
    }

    private listenOptionChange(): void {
        this._ngZone.runOutsideAngular(() => {
            this.options$ = this._store.select(HOME_OPTION_LOAD_FEATURE_SELECTOR)
                .pipe(filter(state => state.action.length > 0))
                .subscribe(state => this._ngZone.run(() => {
                    if (state.action === HOME_LOCALE_OPTION_LOAD_ACTION.type) {
                        this.localeOptions = state.result as LocaleOptionModel[];
                    }

                    if (state.action === HOME_STYLE_NAME_OPTION_LOAD_ACTION.type) {
                        this.styleNameOptions = state.result as StyleNameOptionModel[];
                    }

                    if (state.action === HOME_STYLE_COLOR_OPTION_LOAD_ACTION.type) {
                        this.styleColorOptions = state.result as StyleColorOptionModel[];
                    }

                    this._cdr.markForCheck();
                }));
        });
    }

    private listenNavlistChange(): void {
        this._ngZone.runOutsideAngular(() => {
            this.navlist$ = this._store.select(HOME_NAVLIST_LOAD_FEATURE_SELECTOR)
                .pipe(filter(state => state.action.length > 0))
                .subscribe(state => this._ngZone.run(() => {
                    this.navlist = cloneDeep(state.result);
                    this.expandNavlistOnLoad(this.navlist);
                    this._cdr.markForCheck();
                }));
        });
    }

    private expandNavlistOnLoad(navlist: TreeNode<RouteUrlParam>[]): void {
        const stack: TreeNode<RouteUrlParam>[] = [];
        let node: TreeNode<RouteUrlParam> = {};

        for (let i = navlist.length - 1; i >= 0; i--) {
            stack.push(navlist[i]);
        }

        while (stack.length > 0) {
            node = stack.pop() as TreeNode<RouteUrlParam>;
            
            if (node.key && this.idSplit.includes(node.key)) {
                if (node.leaf) {
                    node.data = { ...node.data, mark: true }
                } else {
                    node.expanded = true;
                }
            }
            
            if (node.children) {
                for (let i = node.children.length - 1; i >= 0; i--) {
                    stack.push(node.children[i]);
                }
            }
        }

        stack.splice(0);
        this.idSplit.splice(0);
    }

}

@Component({
    selector: 'tauri-ngx-navlist',
    template: `
        <ng-container *ngFor="let item of list">
            <a [routerLink]="item.data?.url" [queryParams]="{ id: item.key, name: item.data?.param }"
                class="flex align-items-center min-w-full p-2 gap-2" 
                [class.no-underline]="item?.leaf" [class.cursor-pointer]="item?.leaf" 
                [class.bg-primary]="item?.key === nodeKey" [class.text-white]="item?.key === nodeKey" [class.text-color]="item?.key !== nodeKey"
                [class.hover:bg-primary]="item.leaf" [class.hover:text-primary]="item.leaf"
                [style.padding-left]="(depth * 0.5) + 'rem !important'" (click)="handleExpandCollapseEvent(item)">
                <span class="control-button flex justify-content-center align-items-center"
                    [class.hidden]="item?.leaf">
                    <i [class]="item?.expanded ? collapsedIcon : expandedIcon"></i>
                </span>
                <i [class]="item?.icon" *ngIf="showIcon"></i>
                <span class="flex-auto white-space-nowrap" [class.font-bold]="!item.leaf">{{item?.label}}</span>
            </a>
            <tauri-ngx-navlist [navlist]="item.children" [nodeKey]="nodeKey" [showIcon]="showIcon" [depth]="depth + 1" 
                (selectedChange)="selectedChange.emit($event)"
                [class.visible]="item?.expanded" [class.hidden]="!item?.expanded"></tauri-ngx-navlist>
        </ng-container>
    `
})
export class NavlistComponent {
    
    @Input('navlist') list: TreeNode<RouteUrlParam>[] | undefined = [];

    @Input('showIcon') showIcon: boolean = false;

    @Input('nodeKey') nodeKey: string = '';

    @Input('depth')
    protected depth: number = 1;

    @Output('selectedChange') selectedChange: EventEmitter<any> = new EventEmitter();

    protected expandedIcon: string = 'pi pi-plus-circle';
    protected collapsedIcon: string = 'pi pi-minus-circle';

    constructor(
        private _element: ElementRef,
        private _renderer: Renderer2,
    ) {}

    ngOnInit(): void {
        this.initHostLayout();
    }

    ngOnDestroy(): void {
        this.list?.splice(0);
        this.selectedChange.complete();
    }

    protected handleExpandCollapseEvent(node: TreeNode): void {
        if (!node.leaf) {
            node.expanded = !node.expanded;
            this.selectedChange.emit(node);
        }
    }

    private initHostLayout(): void {
        this._renderer.addClass(this._element.nativeElement, 'tauri-ngx-navlist');
        this._renderer.addClass(this._element.nativeElement, 'flex-column');
        this._renderer.addClass(this._element.nativeElement, 'w-full');
    }

}