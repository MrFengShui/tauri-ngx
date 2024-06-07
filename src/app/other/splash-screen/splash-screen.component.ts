import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, NgZone, OnDestroy, OnInit, Renderer2 } from "@angular/core";
import { Router } from "@angular/router";
import { Subscription, interval, map, take } from "rxjs";
import { random } from 'lodash';

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'tauri-app-splash-screen-page',
    templateUrl: './splash-screen.component.html',
    styleUrl: './splash-screen.component.scss'
})
export class SplashScreenPageComponent implements OnInit, OnDestroy {
    
    value: number = 0;

    private load$: Subscription | null = null;
    private wait$: Subscription | null = null;

    constructor(
        private _cdr: ChangeDetectorRef,
        private _element: ElementRef,
        private _renderer: Renderer2,
        private _router: Router,
        private _ngZone: NgZone
    ) {}

    ngOnInit(): void {
        this.initHostLayout();
        this.loadForCompletion();
    }

    ngOnDestroy(): void {
        this.load$?.unsubscribe();
        this.wait$?.unsubscribe();
    }

    private initHostLayout(): void {
        this._renderer.addClass(this._element.nativeElement, 'flex');
        this._renderer.addClass(this._element.nativeElement, 'justify-content-center');
        this._renderer.addClass(this._element.nativeElement, 'align-items-center');
        this._renderer.addClass(this._element.nativeElement, 'h-full');
    }

    private loadForCompletion(): void {
        this._ngZone.runOutsideAngular(() => {
            this.load$ = interval(1000).pipe(
                        map(() => {
                            this.value = Math.min(this.value + random(0, 5, false), 100);
                            return this.value;
                        })
                    )
                    .subscribe(value => 
                        this._ngZone.run(() => {
                            if (value === 100) {
                                this.waitForRedirection();
                                this.load$?.unsubscribe();
                            }

                            this._cdr.markForCheck();
                        }));
        });
    }

    private waitForRedirection(): void {
        this._ngZone.runOutsideAngular(() => {
            this.wait$ = interval(1000).pipe(take(5))
                .subscribe({
                    complete: () => this._ngZone.run(() => this._router.navigate(['/playground']))
                })
        });
    }

}