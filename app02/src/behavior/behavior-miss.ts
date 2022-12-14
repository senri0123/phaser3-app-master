import { Assets, Consts } from "../consts";
import { Globals } from "../globals";
import { SceneMain } from "../scene/scene-main";
import { Behavior } from "./behavior";

export class BehaviorMiss extends Behavior {

    private scene: SceneMain;
    private timer: Phaser.Time.TimerEvent | null;
    private finished: boolean;

    constructor(scene: SceneMain) {
        super('BehaviorMiss');
        this.scene = scene;
        this.timer = null;
        this.finished = false;
    }

    //extends Behavior
    initialize(): void {
        const sound = this.scene.sound.add(Assets.Audio.SE.MISS);
        if (sound != null) {
            sound.play();
            this.timer = this.scene.time.addEvent({
                delay: sound.duration + 1000,
                callback: () => { this._onEnd(); },
                callbackScope: this
            });

            //タイムアタック時は残り時間を減らす
            const mode = Globals.get().getMode();
            if (mode === Consts.Game.Mode.TIMEATTACK) {
                Globals.get().reduceRemain(Consts.Game.REDUCE_TIME);
            }
        }
        else {
            this._onEnd();
        }
    }

    update(): void {
    }

    finalize(): void {
        if (this.timer != null) {
            this.timer.remove();
        }
    }

    isFinished(): boolean {
        return this.finished;
    }

    private _onEnd(): void {
        this.scene.onRestart();
        this.finished = true;
    }

}