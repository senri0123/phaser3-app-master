import { Consts } from "../../consts";
import { Globals } from "../../globals";
import { Coord2 } from "../../types";

export type uiScoreConfig = {
    text: {
        position: Coord2;
        origin: Coord2;
        depth: number;
    },
}

class IncrementTimer {
    scene: Phaser.Scene;
    start: number;
    end: number;
    delay: number;
    incTimer: Phaser.Time.TimerEvent;

    constructor(scene: Phaser.Scene, start: number, end: number, delay: number) {
        this.scene = scene;
        this.start = start;
        this.end = end;
        this.delay = delay;

        this.incTimer = scene.time.addEvent({ delay: delay });
    }

    destroy(): void {
        if (this.incTimer) {
            this.incTimer.remove();
        }
    }

    getStart(): number {
        return this.start;
    }
    getEnd(): number {
        return this.end;
    }
    getCur(): number {
        const progress = this.incTimer.getProgress();
        const cur = Math.floor(this.start + (this.end - this.start) * progress);
        return cur;
    }

}

export class uiScore {

    private scene: Phaser.Scene;
    private config: uiScoreConfig;
    private score: number;
    private lastScore: number;
    private text: Phaser.GameObjects.Text;
    private incTimer: IncrementTimer | null;


    constructor(scene: Phaser.Scene, config: uiScoreConfig) {
        this.scene = scene;
        this.config = config;
        this.score = 0;
        this.lastScore = 0;

        //スコアテキスト
        const textStyle: Phaser.Types.GameObjects.Text.TextStyle = {
            font: "18px Arial",
            color: "#FFFFFF"
        }
        this.text = scene.add.text(config.text.position.x, config.text.position.y, "", textStyle);
        this.text.setDepth(config.text.depth);

        //インクリメントタイマー
        this.incTimer = null;

        //初回描画
        this.score = Globals.get().getScore();
        this._setText(this.score);
    }

    update(): void {

        //スコアが加算されたらインクリメントを行う
        const curScore = Globals.get().getScore();
        if (curScore !== this.score) {
            if (this.incTimer != null) {
                this.incTimer.destroy();
                this.incTimer = null;
            }
            //増加値によってインクリメント時間を調整する
            const delay = this._getDelay(curScore - this.score);
            if (delay > 0) {
                //タイマー処理でインクリメント
                this.incTimer = new IncrementTimer(this.scene, this.score, curScore, delay);
            }
            else {
                //即時加算
                this._setText(curScore);
            }
            this.score = curScore;
        }

        if (this.incTimer != null) {
            const curValue = this.incTimer.getCur();
            if (this.lastScore != curValue) {
                this._setText(curValue);
            }
        }
    }

    private _setText(score: number) {
        this.text.setText(`SCORE:${score}`);
        this.lastScore = score;
    }

    private _getDelay(value: number) {
        if (value <= Consts.UI.Score.Threshold.Small.VALUE) {
            return Consts.UI.Score.Threshold.Small.DELAY;
        }
        else if (value <= Consts.UI.Score.Threshold.Middle.VALUE) {
            return Consts.UI.Score.Threshold.Middle.DELAY;
        }
        else {
            return Consts.UI.Score.Threshold.Large.DELAY;
        }
    }
}