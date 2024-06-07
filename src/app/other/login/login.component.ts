import { AfterViewInit, Component, ElementRef, OnInit, Renderer2, ViewEncapsulation } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { ThemeType } from "../../ngrx-store/app.state";

@Component({
    selector: 'tauri-app-login-page',
    templateUrl: './login.component.html'
})
export class LoginPageComponent implements OnInit, AfterViewInit {
    
    theme: ThemeType | null = null;

    constructor(
        private _route: ActivatedRoute,
        private _element: ElementRef,
        private _renderer: Renderer2
    ) {}

    ngOnInit(): void {
        this.theme = this._route.snapshot.queryParams['theme'];
    }

    ngAfterViewInit(): void {
        this.initHostLayout();
        this.initHostBackground();
    }

    calculateXAxisPosition(element: HTMLElement): string {
        return `calc((100% - ${element.clientWidth}px) * 0.5)`;
    }

    calculateYAxisPosition(element: HTMLElement): string {
        return `calc((100% - ${element.clientHeight}px) * 0.5)`;
    }

    private initHostLayout(): void {
        this._renderer.addClass(this._element.nativeElement, 'relative');
        this._renderer.addClass(this._element.nativeElement, 'flex');
        this._renderer.addClass(this._element.nativeElement, 'h-full');
    }

    private initHostBackground(): void {
        this._renderer.setStyle(this._element.nativeElement, 'background-image', `url(../../../assets/images/bg-image-${this.theme}.webp)`);
        this._renderer.setStyle(this._element.nativeElement, 'background-position', 'center');
        this._renderer.setStyle(this._element.nativeElement, 'background-repeat', 'repeat');
        this._renderer.setStyle(this._element.nativeElement, 'background-size', 'auto');
    }

}