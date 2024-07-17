import { CLEAR_COLOR } from "../../public/values.utils";
import { MazeCellModel } from "./ngrx-store/maze.state";

export const delay = (duration: number = 10): Promise<void> => new Promise<void>(resolve => setTimeout(resolve, duration));

export const MAZE_DELAY_DURATION: number = 1;

export class MazeCanvasUtils {

    private canvas: HTMLCanvasElement;
    private context: CanvasRenderingContext2D | null = null;
    private source: MazeCellModel[][] = [];
    private width: number = 0;
    private height: number = 0;

    constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas;
    }

    public create(width: number, height: number): void {
        this.context = this.canvas.getContext('2d');
        this.width = width;
        this.height = height;
    }

    public loadData(source: MazeCellModel[][]) {
        this.source = source;
    }

    public clear(): void {
        if (this.context) {
            this.context.clearRect(0, 0, this.width, this.height);
            this.context.reset();
        }
    }

    // public draw(rows: number, cols: number, lineWidth: number): void {
    //     if (this.context) {
    //         const xSize: number = Number.parseFloat(((this.width - lineWidth) / cols).toFixed(3));
    //         const ySize: number = Number.parseFloat(((this.height - lineWidth) / rows).toFixed(3));
    //         let x: number = lineWidth * 0.5, y: number = lineWidth * 0.5, col: number, row: number;
    //         let cell: MazeCellModel, innerPath: Path2D, outerPath: Path2D;

    //         this.context.clearRect(0, 0, this.width, this.height);

    //         this.context.lineWidth = lineWidth;
    //         this.context.lineJoin = 'round';
    //         this.context.lineCap = 'round';
    //         this.context.strokeStyle = CLEAR_COLOR;
            
    //         for (let row = 0; row < rows; row++) {
    //             for (let col = 0; col < cols; col++) {
    //                 const cell = this.source[row][col];

    //                 this.context.fillStyle = cell.color;

    //                 innerPath = this.drawCellInnerPath(cell, x, y, xSize, ySize);
    //                 outerPath = this.drawCellOuterPath(lineWidth, x, y, xSize, ySize);
                    
    //                 this.context.stroke(innerPath);
    //                 this.context.fill(outerPath);

    //                 x += xSize;
    //             }

    //             x = lineWidth * 0.5;
    //             y += ySize;
    //         }
    //     }
    // }

    public draw(rows: number, cols: number, lineWidth: number): void {
        if (this.context) {
            const xSize: number = Number.parseFloat(((this.width - lineWidth) / cols).toFixed(3));
            const ySize: number = Number.parseFloat(((this.height - lineWidth) / rows).toFixed(3));
            let x: number = 0, y: number = lineWidth * 0.5, col: number, row: number;
            let cell: MazeCellModel, innerPath: Path2D, outerPath: Path2D;

            this.context.clearRect(0, 0, this.width, this.height);

            this.context.lineWidth = lineWidth;
            this.context.lineJoin = 'round';
            this.context.lineCap = 'round';
            this.context.strokeStyle = CLEAR_COLOR;
      
            for (let i = 0, length = rows * cols; i < length; i++) {
                col = i % cols;
                row = Math.floor(i / cols);
                cell = this.source[row][col];

                x = col === 0 ? lineWidth * 0.5 : x + xSize;
                y = col === 0 ? (i > 0 ? y + ySize : y) : y;

                this.context.fillStyle = cell.color;
                
                innerPath = this.drawCellInnerPath(cell, x, y, xSize, ySize);
                outerPath = this.drawCellOuterPath(lineWidth, x, y, xSize, ySize);

                this.context.stroke(innerPath);
                this.context.fill(outerPath);
            }
        }
    }

    private drawCellInnerPath(cell: MazeCellModel, x: number, y: number, xSize: number, ySize: number): Path2D {
        const path = new Path2D();

        path.moveTo(x, y);
        /* 画上边 */
        if (cell.walls.top) {
            path.lineTo(x + xSize, y);
        } else {
            path.moveTo(x + xSize, y);
        }
        /* 画右边 */
        if (cell.walls.right) {
            path.lineTo(x + xSize, y + ySize);
        } else {
            path.moveTo(x + xSize, y + ySize);
        }
        /* 画下边 */
        if (cell.walls.bottom) {
            path.lineTo(x, y + ySize);
        } else {
            path.moveTo(x, y + ySize);
        }
        /* 画左边 */
        if (cell.walls.left) {
            path.lineTo(x, y);
        } else {
            path.moveTo(x, y);
        }
        
        return path;
    }

    private drawCellOuterPath(lineWidth: number, x: number, y: number, xSize: number, ySize: number): Path2D {
        const path = new Path2D();
        path.moveTo(x, y);
        path.rect(x + lineWidth * 0.5, y + lineWidth * 0.5, xSize - lineWidth, ySize - lineWidth);
        return path;
    }

}