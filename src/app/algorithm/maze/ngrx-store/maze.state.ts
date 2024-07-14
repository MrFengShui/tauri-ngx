export interface MazeWallModel {

    top: boolean;
    bottom: boolean;
    left: boolean;
    right: boolean;

}

export interface MazeCellModel {

    bdcolor: string;
    bgcolor: string;
    visited: boolean;
    walls: MazeWallModel;

}