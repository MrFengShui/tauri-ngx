import { MazeCellModel } from "./ngrx-store/maze.state";

export type MazeGenerationName = 'random-backtracker' | undefined;
export type NeighborAccordionate = { row: number, col: number };

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

    public draw(rows: number, cols: number, lineWidth: number): void {
        if (this.context) {
            const xSize: number = Number.parseFloat(((this.width - lineWidth * rows) / rows).toFixed(3));
            const ySize: number = Number.parseFloat(((this.height - lineWidth * cols) / cols).toFixed(3));

            this.context.clearRect(0, 0, this.width, this.height);

            this.context.lineWidth = lineWidth;
            this.context.lineJoin = 'round';
            this.context.lineCap = 'round';
            
            for (let row = 0; row < rows; row++) {
                for (let col = 0; col < cols; col++) {
                    const cell = this.source[row][col];

                    this.context.strokeStyle = cell.bdcolor;
                    this.context.fillStyle = cell.bgcolor;

                    const region = this.drawCell(cell, row * xSize + row * lineWidth + this.context.lineWidth * 0.5, col * ySize + col * lineWidth + this.context.lineWidth * 0.5, xSize, ySize);
                    
                    this.context.stroke(region);
                    this.context.fill(region);
                }
            }
        }
    }

    private drawCell(cell: MazeCellModel, x: number, y: number, xSize: number, ySize: number): Path2D {
        const region = new Path2D();

        region.moveTo(x, y);
        /* 画上边 */
        if (cell.walls.top) {
            region.lineTo(x + xSize, y);
        } else {
            region.moveTo(x + xSize, y);
        }
        /* 画右边 */
        if (cell.walls.right) {
            region.lineTo(x + xSize, y + ySize);
        } else {
            region.moveTo(x + xSize, y + ySize);
        }
        /* 画下边 */
        if (cell.walls.bottom) {
            region.lineTo(x, y + ySize);
        } else {
            region.moveTo(x, y + ySize);
        }
        /* 画左边 */
        if (cell.walls.left) {
            region.lineTo(x, y);
        } else {
            region.moveTo(x, y);
        }

        return region;
    }

}