export type MazeActionType = 'generation' | 'path-finder' | undefined;
export type MazeActionmName = 'rbt' | 'para-rbt' | 'prim' | 'para-prim' | undefined;
export type MazeGridXY = { row: number; col: number; };

export interface MazeWallModel {

    top: boolean;
    bottom: boolean;
    left: boolean;
    right: boolean;

}

export interface MazeCellModel {

    color: string;
    visited: boolean;
    walls: MazeWallModel;

}
