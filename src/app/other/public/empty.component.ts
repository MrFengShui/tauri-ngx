import { Component, ElementRef, Input, OnInit, Renderer2 } from "@angular/core";

@Component({
    selector: 'tauri-app-empty-holder',
    template: `
        <div class="flex flex-column align-items-center gap-3">
            <p-image [src]="logo" alt="tauri.svg" width="256" height="256"/>
            <span class="font-bold text-4xl">{{subject}}</span>
            <span class="font-bold text-xl">{{content}}</span>
        </div>
    `
})
export class EmptyHolderComponent implements OnInit {
    
    @Input('logo') logo?: string = 'assets/tauri.svg';

    @Input('subject') subject?: string = '暂无数据';

    @Input('content') content?: string = '';

    constructor(
        private _element: ElementRef,
        private _renderer: Renderer2
    ) {}

    ngOnInit(): void {
        this.initHostLayout();
    }
    
    private initHostLayout(): void {
        this._renderer.addClass(this._element.nativeElement, 'flex');
        this._renderer.addClass(this._element.nativeElement, 'justify-content-center');
        this._renderer.addClass(this._element.nativeElement, 'align-items-center');
        this._renderer.addClass(this._element.nativeElement, 'w-full');
        this._renderer.addClass(this._element.nativeElement, 'h-full');
    }

}