import { CLEAR_COLOR } from "../../public/global.utils";
import { MazeDataModel } from "./ngrx-store/maze.state";

export const delay = (duration: number = 10): Promise<void> => new Promise<void>(resolve => setTimeout(resolve, duration));

export const MAZE_DELAY_DURATION: number = 1;

export class MazeDataVisualBuilder {

    private context: CanvasRenderingContext2D | null = null;
    private width: number = -1;
    private height: number = -1;

    public setContext(canvas: HTMLCanvasElement): MazeDataVisualBuilder {
        if (!this.context) {
            this.context = canvas.getContext('2d');
        }
        
        return this;
    }

    public getContext(): CanvasRenderingContext2D | null {
        return this.context;
    }

    public setDimension(width: number, height: number): MazeDataVisualBuilder {
        this.width = width;
        this.height = height;

        return this;
    }

    public getDimension(): { width: number, height: number } {
        return { width: this.width, height: this.height };
    }

    public build(): MazeDataVisualFactory {
        return new MazeDataVisualFactory(this.context, this.width, this.height);
    }

}

export class MazeDataVisualFactory {

    private context: CanvasRenderingContext2D | null = null;
    private width: number = 0;
    private height: number = 0;

    constructor(context: CanvasRenderingContext2D | null, width: number, height: number) {
        this.context = context;
        this.update(width, height);
    }

    public update(width: number, height: number): void {
        this.width = width;
        this.height = height;
    }

    public erase(): void {
        if (this.context) {
            this.context.clearRect(0, 0, this.width, this.height);
            this.context.reset();
        }
    }

    public draw(source: MazeDataModel[][], rows: number, cols: number, lineWidth: number): void {
        if (this.context) {
            const xSize: number = Number.parseFloat(((this.width - lineWidth) / cols).toFixed(3));
            const ySize: number = Number.parseFloat(((this.height - lineWidth) / rows).toFixed(3));
            let x: number = 0, y: number = lineWidth * 0.5, col: number, row: number;
            let cell: MazeDataModel, innerPath: Path2D, outerPath: Path2D;

            this.context.clearRect(0, 0, this.width, this.height);

            this.context.lineWidth = lineWidth;
            this.context.lineJoin = 'round';
            this.context.lineCap = 'round';
            this.context.strokeStyle = CLEAR_COLOR;
      
            for (let i = 0, length = rows * cols; i < length; i++) {
                col = i % cols;
                row = Math.floor(i / cols);
                cell = source[row][col];

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

    private drawCellInnerPath(cell: MazeDataModel, x: number, y: number, xSize: number, ySize: number): Path2D {
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