import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, NgZone, OnDestroy, OnInit, Renderer2 } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Subscription, filter } from 'rxjs';

import { APP_STYLE_CHANGE_ACTION, APP_STYLE_CHECK_ACTION, APP_STYLE_FETCH_ACTION } from './ngrx-store/app.action';
import { APP_FEATURE_SELECTOR } from './ngrx-store/app.selector';
import { AppStyleModel, AppStyleReducerState } from './ngrx-store/app.state';

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'tauri-app-root-page',
    templateUrl: './app.component.html',
    styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit, OnDestroy, AfterViewInit {
    // greetingMessage = "";

    // greet(event: SubmitEvent, name: string): void {
    //     event.preventDefault();

    //     // Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
    //     invoke<string>("greet", { name }).then((text) => {
    //         this.greetingMessage = text;
    //     });
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
            .pipe(filter(state => state.styleFeatuer.action.length > 0))
            .subscribe(state => this._ngZone.run(() => {
                const feature: AppStyleReducerState = state.styleFeatuer;
                // console.log(feature.action);
                if (feature.action === APP_STYLE_CHECK_ACTION.type) {
                    if (feature.value) {
                        this._store.dispatch(APP_STYLE_FETCH_ACTION());
                    } else {
                        this._store.dispatch(APP_STYLE_CHANGE_ACTION({ name: 'lara', theme: 'light', color: 'amber' }));
                    }
                }

                if (feature.action === APP_STYLE_FETCH_ACTION.type) {
                    const model: AppStyleModel = feature.value as AppStyleModel;
                    this._store.dispatch(APP_STYLE_CHANGE_ACTION({ 
                        name: model.struct.name, 
                        theme: model.struct.theme, 
                        color: model.struct.color
                    }));
                }

                if (feature.action === APP_STYLE_CHANGE_ACTION.type) {
                    this._renderer.setAttribute(this.styleLink, 'href', `assets/themes/${(feature.value as AppStyleModel).name as string}/theme.css`);
                }

                this._cdr.detectChanges();
            }));
        });
    }

}


