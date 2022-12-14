import { atsumaru_displayScoreBoard, atsumaru_saveScoreBoard } from "../atsumaru/atsumaru";
import { Assets, Consts } from "../consts";
import { Globals } from "../globals";
import { SceneMain } from "../scene/scene-main";
import { Behavior } from "./behavior";

export class BehaviorTimeup extends Behavior {

    private scene: SceneMain;
    private timeup: Phaser.GameObjects.Image;
    private seTimeup: Phaser.Sound.BaseSound;
    private tween: Phaser.Tweens.Tween | null;
    private spacer: Phaser.Time.TimerEvent | null;
    private finished: boolean;

    constructor(scene: SceneMain) {
        super('BehaviorTimeup');
        this.scene = scene;
        this.tween = null;
        this.spacer = null;
        this.finished = false;

        const x = scene.game.canvas.width * 0.5;
        const y = scene.game.canvas.height * 0.5;
        const imageKey = Assets.Graphic.UIs.KEY;

        //clear
        {
            const frame = Assets.Graphic.UIs.TIMEUP;
            const depth = Consts.UI.Clear.DEPTH;

            this.timeup = scene.add.image(x, y, imageKey, frame);
            this.timeup.setVisible(false);   //まだ表示しない
            this.timeup.setPosition(x, y);
            this.timeup.setOrigin(0.5, 0.5);
            this.timeup.setDepth(depth)
        }
        //se
        {
            this.seTimeup = scene.sound.add(Assets.Audio.SE.START);
        }
    }

    //extends Behavior
    initialize(): void {
        this._timeupInStart();
    }

    update(): void {
    }

    finalize(): void {
        if (this.tween != null) {
            this.tween.remove();
        }
        this.timeup.destroy();
    }

    isFinished(): boolean {
        return this.finished;
    }


    private _timeupInStart(): void {
        const start = 0.5;
        const end = 1.0;
        const tweenDuration = 500;
        const spaceDuration = 2000;
        //初期状態にしておく
        this.timeup.setScale(start);

        this.tween = this.scene.tweens.add({
            targets: this.timeup,
            ease: 'Power',
            duration: tweenDuration,
            props: {
                scale: { from: start, to: end },
            },
            onStart: () => {
                this.timeup.setVisible(true);
                this.seTimeup.play();
            },
            onStartScope: this,
        });

        //次の演出への間をとる
        this.spacer = this.scene.time.addEvent({
            delay: spaceDuration,
            callback: this._timeupOutStart,
            callbackScope: this,
        });
    }

    private _timeupOutStart(): void {
        const start = 1.0;
        const end = 0;
        const tweenDuration = 1000;
        const spaceDuration = 2000;

        this.tween = this.scene.tweens.add({
            targets: this.timeup,
            ease: 'Linear',
            duration: tweenDuration,
            props: {
                alpha: { from: start, to: end },
            },
        });

        //次の演出への間をとる
        this.spacer = this.scene.time.addEvent({
            delay: spaceDuration,
            callback: this._onEnd,
            callbackScope: this,
        });
    }

    private _onEnd(): void {
        this.scene.onDisplayScoreBoard();
        this.finished = true;
    }
}