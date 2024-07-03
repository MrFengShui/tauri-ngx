import { Component, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output, Renderer2, ViewEncapsulation, booleanAttribute } from "@angular/core";
import { TreeNode } from "primeng/api";

@Component({
    selector: 'tauri-ngx-tree-list',
    encapsulation: ViewEncapsulation.None,
    template: `
        <tauri-ngx-tree-node [treelist]="list" [showIcon]="showIcon"
            [showStateIcon]="showStateIcon"  [showPlusIcon]="showPlusIcon" [showMinusIcon]="showMinusIcon"
            (selectedChange)="selectedChange.emit($event)" (controlPlusChange)="controlPlusChange.emit($event)"
            (controlMinusChange)="controlMinusChange.emit($event)" class="flex"></tauri-ngx-tree-node>`,
    styleUrl: 'public.styles.scss'
})
export class TreeListComponent implements OnInit, OnDestroy {

    @Input('treelist') list: TreeNode[] | undefined = [];

    @Input('showStateIcon') showStateIcon: boolean = false;

    @Input('showIcon') showIcon: boolean = true;

    @Input('showPlusIcon') showPlusIcon: boolean = false;

    @Input('showMinusIcon') showMinusIcon: boolean = false;

    @Output('selectedChange') selectedChange: EventEmitter<any> = new EventEmitter();

    @Output('controlPlusChange') controlPlusChange: EventEmitter<any> = new EventEmitter();

    @Output('controlMinusChange') controlMinusChange: EventEmitter<any> = new EventEmitter();

    constructor(
        private _element: ElementRef,
        private _renderer: Renderer2,
    ) {}

    ngOnInit(): void {
        this.initHostLayout();
    }

    ngOnDestroy(): void {
        this.list?.splice(0);
        this.controlPlusChange.complete();
        this.controlMinusChange.complete();
    }

    private initHostLayout(): void {
        this._renderer.addClass(this._element.nativeElement, 'tauri-ngx-tree-list');
        this._renderer.addClass(this._element.nativeElement, 'flex');
        this._renderer.addClass(this._element.nativeElement, 'overflow-auto');
        this._renderer.addClass(this._element.nativeElement, 'w-full');
        this._renderer.addClass(this._element.nativeElement, 'h-full');
    }

}

@Component({
    selector: 'tauri-ngx-tree-node',
    encapsulation: ViewEncapsulation.None,
    template: `
        <ng-container *ngFor="let item of list">
            <a class="flex align-items-center text-color hover:text-primary min-w-full p-2 gap-2" 
                [style.padding-left]="(depth * 0.5) + 'rem !important'" (click)="handleExpandCollapseEvent(item)">
                <span class="control-button flex justify-content-center align-items-center"
                    [class.hidden]="item?.type === 'leaf'" *ngIf="showStateIcon">
                    <i [class]="item?.expanded ? collapsedIcon : expandedIcon"></i>
                </span>
                <i [class]="item?.icon" *ngIf="showIcon"></i>
                <span class="flex-auto white-space-nowrap" [class.font-bold]="item?.type === 'node'">{{item?.label}}</span>
                <a pButton icon="pi pi-plus" severity="success" [rounded]="true" [plain]="true" 
                        class="control-button flex justify-content-center align-items-center"
                        (click)="handlePlusActionEvent($event, item)" *ngIf="showPlusIcon && item?.type === 'node'"></a>
                <a pButton icon="pi pi-minus" severity="danger" [rounded]="true" [plain]="true"
                    class="control-button flex justify-content-center align-items-center"
                    (click)="handleMinusActionEvent($event, item)" *ngIf="showMinusIcon"></a>
            </a>
            <tauri-ngx-tree-node [treelist]="item.children" [showStateIcon]="showStateIcon" [showIcon]="showIcon"
                [showPlusIcon]="showPlusIcon" [showMinusIcon]="showMinusIcon" [depth]="depth + 1" 
                (selectedChange)="selectedChange.emit($event)"
                (controlPlusChange)="controlPlusChange.emit($event)" (controlMinusChange)="controlMinusChange.emit($event)"
                [class.visible]="item?.expanded" [class.hidden]="!item?.expanded"></tauri-ngx-tree-node>
        </ng-container>
    `,
    styleUrl: 'public.styles.scss'
})
export class TreeNodeComponent implements OnInit, OnDestroy {

    @Input('treelist') list: TreeNode[] | undefined = [];

    @Input('showStateIcon') showStateIcon: boolean = false;

    @Input('showIcon') showIcon: boolean = true;

    @Input('showPlusIcon') showPlusIcon: boolean = false;

    @Input('showMinusIcon') showMinusIcon: boolean = false;

    @Input('depth')
    protected depth: number = 1;

    @Output('selectedChange') selectedChange: EventEmitter<any> = new EventEmitter();

    @Output('controlPlusChange') controlPlusChange: EventEmitter<any> = new EventEmitter();

    @Output('controlMinusChange') controlMinusChange: EventEmitter<any> = new EventEmitter();

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
        this.controlPlusChange.complete();
        this.controlMinusChange.complete();
    }

    protected handleExpandCollapseEvent(node: TreeNode): void {
        node.expanded = !node.expanded;
        this.selectedChange.emit(node);
    }

    protected handlePlusActionEvent(event: MouseEvent, node: TreeNode): void {
        event.preventDefault();
        event.stopPropagation();
        this.controlPlusChange.emit(node);
    }

    protected handleMinusActionEvent(event: MouseEvent, node: TreeNode): void {
        event.preventDefault();
        event.stopPropagation();
        this.controlMinusChange.emit(node);
    }

    private initHostLayout(): void {
        this._renderer.addClass(this._element.nativeElement, 'tauri-ngx-tree-node');
        this._renderer.addClass(this._element.nativeElement, 'flex-column');
        this._renderer.addClass(this._element.nativeElement, 'min-w-full');
    }

}