import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, LOCALE_ID, NgZone, OnDestroy, OnInit, Renderer2 } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Subscription, filter } from 'rxjs';

import { APP_STYLE_SAVE_ACTION, APP_STYLE_CHECK_ACTION, APP_STYLE_LOAD_ACTION } from './ngrx-store/app.action';
import { APP_FEATURE_SELECTOR } from './ngrx-store/app.selector';
import { AppStyleModel } from './ngrx-store/app.state';

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'tauri-ngx-root-page',
    templateUrl: './app.component.html',
    styleUrl: './app.component.scss',
    providers: [
        {
            provide: LOCALE_ID, 
            useFactory: () => {
                const baseHref: string = window.location.pathname;
                const split: string[] = baseHref.split(/(\/)/).filter(item => item !== '/' && item.trim().length > 0);
                return split[split.length - 1];
            }
        }
    ]
})
export class AppComponent implements OnInit, OnDestroy, AfterViewInit {

    // greet(event: SubmitEvent, name: string): void {
    //     event.preventDefault();
    //     // Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
    //     invoke<string>("greet", { name }).then(console.log);
    // }

    styleThemeMode: boolean = true;

    private event$: Subscription | null = null;
    private style$: Subscription | null = null;
    private styleLink: HTMLElement | null = null;
    
    constructor(
        private _cdr: ChangeDetectorRef,
        private _renderer: Renderer2,
        private _router: Router,
        private _ngZone: NgZone,
        private _store: Store
    ) {
        this._ngZone.runOutsideAngular(() => {
            this.event$ = this._router.events
                .pipe(filter(event => event instanceof NavigationEnd))
                .subscribe(() => 
                    this._ngZone.run(() => 
                        this._store.dispatch(APP_STYLE_CHECK_ACTION())));
        });
     }

    ngOnInit(): void {
        this.styleLink = document.getElementById('style-link');
    }

    ngOnDestroy(): void {
        this.event$?.unsubscribe();
        this.style$?.unsubscribe();
    }

    ngAfterViewInit(): void {
        this.listenStyleChange();
    }

    private listenStyleChange(): void {
        this._ngZone.runOutsideAngular(() => {
            this.style$ = this._store.select(APP_FEATURE_SELECTOR)
            .pipe(filter(state => state.action.length > 0))
            .subscribe(state => this._ngZone.run(() => {
                if (state.action === APP_STYLE_LOAD_ACTION.type) {
                    const model: AppStyleModel = state.result as AppStyleModel;
                    this._store.dispatch(APP_STYLE_SAVE_ACTION({ 
                        mode: model.mode, name: model.name, 
                        theme: model.theme, color: model.color
                    }));
                }

                if (state.action === APP_STYLE_CHECK_ACTION.type) {
                    if (state.result) {
                        this._store.dispatch(APP_STYLE_LOAD_ACTION());
                    } else {
                        this._store.dispatch(APP_STYLE_SAVE_ACTION({ mode: false, name: 'lara', theme: 'light', color: 'amber' }));
                    }
                }

                if (state.action === APP_STYLE_SAVE_ACTION.type) {
                    const model: AppStyleModel = state.result as AppStyleModel;
                    this._renderer.setAttribute(this.styleLink, 'href', 
                        `assets/themes/${model.name}-${model.theme}-${model.color}/theme.css`);
                }

                this._cdr.markForCheck();
            }));
        });
    }

}


