export type MazeActionType = 'generation' | 'path-finder' | undefined;
export type MazeActionmName = 'aldous-broder' | 'parallel-aldous-broder' | 'randomized-backtracker' | 'parallel-randomized-backtracker' | 'randomized-division-merge' | 'randomized-division-build' | 'eller' | 'depth-first-growing-tree' | 'parallel-depth-first-growing-tree' | 'breadth-first-growing-tree' | 'parallel-breadth-first-growing-tree' | 'hunt-and-kill' | 'parallel-hunt-and-kill' | 'randomized-kruskal' | 'randomized-prim' | 'parallel-randomized-prim' | 'sidewinder' | 'wilson' | undefined;
export type MazeRunType = 'one' | 'all';
export type MazeGridXY = { row: number, col: number };
export type MazeGridRange = { start: number, final: number };
export type MazeGridPoint = { currPoint: MazeGridXY, nextPoint: MazeGridXY };

export interface MazeWallModel {

    top: boolean;
    bottom: boolean;
    left: boolean;
    right: boolean;

}

export interface MazeCellModel {

    color: string;
    direction: 'u' | 'd' | 'l' | 'r' | null;
    weight: number;
    visited: boolean;
    walls: MazeWallModel;

}
