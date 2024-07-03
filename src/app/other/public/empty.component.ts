import { Component, ElementRef, Input, OnInit, Renderer2, ViewEncapsulation } from "@angular/core";

@Component({
    encapsulation: ViewEncapsulation.None,
    selector: 'tauri-ngx-empty-holder',
    template: `
        <img [src]="src" [alt]="alt" height="75%"/>
        <span class="font-bold text-4xl">{{text}}</span>
    `,
    styleUrl: 'public.styles.scss'
})
export class EmptyHolderComponent implements OnInit {
    
    @Input('src') src?: string = 'assets/images/no.data.svg';
    
    @Input('alt') alt?: string = 'no.data.svg';

    @Input('text') text?: string = '暂无数据';

    constructor(
        private _element: ElementRef,
        private _renderer: Renderer2
    ) {}

    ngOnInit(): void {
        this.initHostLayout();
    }
    
    private initHostLayout(): void {
        this._renderer.addClass(this._element.nativeElement, 'tauri-ngx-empty-holder');
        this._renderer.addClass(this._element.nativeElement, 'flex');
        this._renderer.addClass(this._element.nativeElement, 'flex-column');
        this._renderer.addClass(this._element.nativeElement, 'justify-content-center');
        this._renderer.addClass(this._element.nativeElement, 'align-items-center');
        this._renderer.addClass(this._element.nativeElement, 'gap-4');
    }

}