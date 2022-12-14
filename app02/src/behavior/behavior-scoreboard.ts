import { atsumaru_displayScoreBoard, atsumaru_saveScoreBoard } from "../atsumaru/atsumaru";
import { Globals } from "../globals";
import { Log } from "../service/logwithstamp";
import { Behavior } from "./behavior";

export class BehaviorScoreBoard extends Behavior {

    private finished: boolean;

    constructor() {
        super('BehaviorScoreBoard');
        this.finished = false;
    }

    initialize(): void {
        this._setScore();
        // this._displayScore();
    }
    update(): void {
    }
    finalize(): void {
    }
    isFinished(): boolean {
        return this.finished;
    }

    private _setScore(): void {
        const mode = Globals.get().getMode();
        const score = Globals.get().getScore();
        atsumaru_saveScoreBoard(
            {
                mode: mode,
                score: score,
            },
            (result) => {
                this._displayScore();
            }
        );
    }

    private _displayScore(): void {
        const mode = Globals.get().getMode();
        atsumaru_displayScoreBoard(
            {
                mode: mode,
            },
            (result) => {
            }
        );
    }
}