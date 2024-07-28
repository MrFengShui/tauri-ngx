export type MazeActionType = 'generation' | 'path-finder' | undefined;
export type MazeActionmName = 'aldous-broder' | 'optimal-aldous-broder' | 'parallel-aldous-broder' | 'randomized-backtracker' | 'parallel-randomized-backtracker' | 'randomized-division-merge' | 'randomized-division-build' | 'eller' | 'depth-first-growing-tree' | 'parallel-depth-first-growing-tree' | 'breadth-first-growing-tree' | 'parallel-breadth-first-growing-tree' | 'hunt-and-kill' | 'parallel-hunt-and-kill' | 'randomized-kruskal' | 'optimal-randomized-kruskal' | 'parallel-randomized-kruskal' | 'randomized-prim' | 'parallel-randomized-prim' | 'sidewinder' | 'parallel-sidewinder' | 'wilson' | 'optimal-wilson' | undefined;
export type MazeRunType = 'one' | 'all' | 'opt' | null;
export type MazeGridCell = { row: number, col: number };
export type MazeGridRange = { start: number, final: number, index: number };
export type MazeGridPoint = { currCell: MazeGridCell, nextCell: MazeGridCell };

export interface MazeWallModel {

    top: boolean;
    bottom: boolean;
    left: boolean;
    right: boolean;

}

export interface MazeDataModel {

    color: string;
    direction: 'u' | 'd' | 'l' | 'r' | null;
    weight: number;
    visited: boolean;
    walls: MazeWallModel;

}
