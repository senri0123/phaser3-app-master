import { Consts } from "./consts";
import { IntervalTimer, Timer } from "./service/timer";

export class Globals {

    //シングルトンで使用するインスタンス
    private static instance: Globals | null = null;

    //シングルトンのインスタンスを取得
    static get(): Globals {
        if (Globals.instance === null) {
            Globals.instance = new Globals();
        }
        return Globals.instance;
    }

    //--------------------------------------------
    private mode: number;
    private stage: number;
    private score: number;
    private life: number;
    private timer: IntervalTimer | null;


    //外部からインスタンス化できないようにコンストラクタは private にする
    private constructor() {
        this.mode = Consts.Game.Mode.NOMAL;
        this.score = 0;
        this.stage = 0;
        this.life = Consts.Game.LIFE;
        this.timer = null;

        this.reset();

    }

    reset(): void {
        this.mode = Consts.Game.Mode.NOMAL;
        this.score = 0;
        this.stage = 0;
        this.life = Consts.Game.LIFE;
        if (this.timer != null) {
            this.timer = null;
        }
    }

    update(delta: number): void {
        this.timer?.update(delta);
    }

    setMode(mode: number): void {
        this.mode = mode;
    }
    getMode(): number {
        return this.mode;
    }

    setStage(stage: number): void {
        this.stage = Math.min(stage, 0);
    }
    addStage(add: number): void {
        this.stage += add;
    }
    getStage(): number {
        return this.stage;
    }

    setScore(score: number): void {
        this.score = Math.max(score, 0);
    }
    addScore(add: number): void {
        this.score += add;
    }
    getScore(): number {
        return this.score;
    }

    setLife(life: number): void {
        this.life = Math.max(life, 0);
    }
    addLife(add: number): void {
        this.life += add;
    }
    getLife(): number {
        return this.life;
    }

    startTimer(scene: Phaser.Scene): void {
        if (this.timer == null) {
            this.timer = new IntervalTimer(Consts.Game.TIME);
            this.timer.start();
        }
        else {
            this.timer.resume();
        }
    }
    pauseTimer(): void {
        if (this.timer != null) {
            this.timer.pause();
        }
    }
    getRemamin(): number {
        if (this.timer == null) {
            return Consts.Game.TIME;
        }
        else {
            return this.timer.getRemain();
        }
    }
    getRemainPercent(): number {
        if (this.timer != null) {
            if (Consts.Game.TIME > 0) {
                const percent = this.timer.getRemainPercentage();
                return percent;
            }
        }
        return 1;
    }
    reduceRemain(value: number) {
        if (this.timer != null) {
            this.timer.add(value);
        }
    }
}