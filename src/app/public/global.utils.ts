
export const PRIMARY_COLOR: string = 'darkorchid';
export const SECONDARY_COLOR: string = 'darkorange';
export const ACCENT_COLOR: string = 'deeppink';

export const PRIMARY_ONE_COLOR: string = 'limegreen';
export const SECONDARY_ONE_COLOR: string = 'orangered';
export const ACCENT_ONE_COLOR: string = 'dodgerblue';

export const PRIMARY_TWO_COLOR: string = 'seagreen';
export const SECONDARY_TWO_COLOR: string = 'indianred';
export const ACCENT_TWO_COLOR: string = 'skyblue';

export const PLACE_FST_COLOR: string = 'red';
export const PLACE_SND_COLOR: string = 'green';
export const PLACE_TRD_COLOR: string = 'blue';
export const PLACE_FTH_COLOR: string = 'yellow';

export const START_COLOR: string = 'goldenrod';
export const FINAL_COLOR: string = 'turquoise';
export const CLEAR_COLOR: string = 'snow';
export const EMPTY_COLOR: string = 'transparent';

export type CanvasDimension = { width: number, height: number };

export const delay = (duration: number = 1): Promise<void> => 
    new Promise<void>(resolve => {
        const task = setTimeout(() => {
            clearTimeout(task);
            resolve();
        }, duration);
    });

export const calcGCD = (fst: number, snd: number): number => {
    while (true) {
        if (fst > snd) {
            fst -= snd;
        } else if (fst < snd) {
            snd -= fst;
        } else {
            break;
        }
    }
    
    return fst;
}

export const calcLCM = (fst: number, snd: number): number => {
    let mult: number = 0, gcd: number = calcGCD(fst, snd);
    
    for (let i = 0; i < snd; i++) {
        mult += fst;
    }
    
    return Math.floor(mult / gcd);
}
