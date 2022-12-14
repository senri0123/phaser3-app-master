import { atsumaru_displayScoreBoard, atsumaru_saveScoreBoard } from "../atsumaru/atsumaru";
import { Assets, Consts } from "../consts";
import { Globals } from "../globals";
import { SceneMain } from "../scene/scene-main";
import { Behavior } from "./behavior";

export class BehaviorTimeAttackClear extends Behavior {

    private scene: SceneMain;
    private clear: Phaser.GameObjects.Image;
    private congra: Phaser.GameObjects.Image;
    private board: Phaser.GameObjects.Image;
    private textRemain: Phaser.GameObjects.Text;
    private textBonus: Phaser.GameObjects.Text;
    private bonus: number;
    private seClear: Phaser.Sound.BaseSound;
    private seCongra: Phaser.Sound.BaseSound;
    private tween: Phaser.Tweens.Tween | null;
    private spacer: Phaser.Time.TimerEvent | null;
    private finished: boolean;

    constructor(scene: SceneMain) {
        super('BehaviorTimeAttackClear');
        this.scene = scene;
        this.tween = null;
        this.spacer = null;
        this.finished = false;

        const x = scene.game.canvas.width * 0.5;
        const y = scene.game.canvas.height * 0.5;
        const imageKey = Assets.Graphic.UIs.KEY;

        //clear
        {
            const frame = Assets.Graphic.UIs.CLEAR;
            const depth = Consts.UI.Clear.DEPTH;

            this.clear = scene.add.image(x, y, imageKey, frame);
            this.clear.setVisible(false);   //まだ表示しない
            this.clear.setPosition(x, y);
            this.clear.setOrigin(0.5, 0.5);
            this.clear.setDepth(depth)
        }
        //congra
        {
            const frame = Assets.Graphic.UIs.CONGRA;
            const depth = Consts.UI.Clear.DEPTH;

            this.congra = scene.add.image(x, y - 150, imageKey, frame);
            this.congra.setVisible(false);   //まだ表示しない
            // this.congra.setPosition(x, y);
            this.congra.setOrigin(0.5, 0.5);
            this.congra.setDepth(depth)
        }
        //board
        {
            const frame = Assets.Graphic.UIs.PANEL;
            const depth = Consts.UI.Clear.DEPTH;

            this.board = scene.add.image(x, y + 100, imageKey, frame);
            this.board.setVisible(false);   //まだ表示しない
            // this.board.setPosition(x, y);
            this.board.setOrigin(0.5, 0.5);
            this.board.setDepth(depth)
        }
        //Text
        {
            //テキスト
            const textStyle: Phaser.Types.GameObjects.Text.TextStyle = {
                font: "36px Arial",
                color: "#FFFFFF"
            }
            const depth = Consts.UI.Clear.DEPTH;

            const remainTime = Math.floor(Globals.get().getRemamin() / 1000);
            const bonus = remainTime * Consts.Time.SCORE;
            this.bonus = bonus;

            this.textRemain = scene.add.text(x, y + 50, `残りタイム ${remainTime}`, textStyle);
            this.textRemain.setVisible(false);   //まだ表示しない
            this.textRemain.setOrigin(0.5, 0.5);
            this.textRemain.setDepth(depth + 1);

            this.textBonus = scene.add.text(x, y + 150, `BONUS +${bonus}`, textStyle);
            this.textBonus.setVisible(false);   //まだ表示しない
            this.textBonus.setOrigin(0.5, 0.5);
            this.textBonus.setDepth(depth + 1);
        }
        //se
        {
            this.seClear = scene.sound.add(Assets.Audio.SE.CLEAR);
            this.seCongra = scene.sound.add(Assets.Audio.SE.ALLCLEAR);
        }
    }

    //extends Behavior
    initialize(): void {
        this._clearInStart();
    }

    update(): void {
    }

    finalize(): void {
        if (this.tween != null) {
            this.tween.remove();
        }
        this.clear.destroy();
    }

    isFinished(): boolean {
        return this.finished;
    }


    private _clearInStart(): void {
        const start = 2.0;
        const end = 1.0;
        const tweenDuration = 500;
        const spaceDuration = 5000;
        //初期状態にしておく
        this.clear.setScale(start);

        this.tween = this.scene.tweens.add({
            targets: this.clear,
            ease: 'Power',
            duration: tweenDuration,
            props: {
                scale: { from: start, to: end },
            },
            onStart: () => {
                this.clear.setVisible(true);
                this.seClear.play();
            },
            onStartScope: this,
        });

        //次の演出への間をとる
        this.spacer = this.scene.time.addEvent({
            delay: spaceDuration,
            callback: this._clearOutStart,
            callbackScope: this,
        });
    }

    private _clearOutStart(): void {
        const start = 1.0;
        const end = 0;
        const tweenDuration = 1000;
        const spaceDuration = 1500;

        this.tween = this.scene.tweens.add({
            targets: this.clear,
            ease: 'Linear',
            duration: tweenDuration,
            props: {
                alpha: { from: start, to: end },
            },
        });

        //次の演出への間をとる
        this.spacer = this.scene.time.addEvent({
            delay: spaceDuration,
            callback: this._congraInStart,
            callbackScope: this,
        });
    }

    private _congraInStart(): void {
        const start = 0;
        const end = 1;
        const tweenDuration = 500;
        const spaceDuration = 5000;
        //初期状態にしておく
        this.congra.setScale(start);

        this.tween = this.scene.tweens.add({
            targets: [this.congra, this.board],
            ease: 'Power',
            duration: tweenDuration,
            props: {
                scale: { from: start, to: end },
            },
            onStart: () => {
                this.congra.setVisible(true);
                this.board.setVisible(true);
                this.seCongra.play();
            },
            onStartScope: this,
        });

        //次の演出への間をとる
        this.spacer = this.scene.time.addEvent({
            delay: spaceDuration,
            callback: this._remianTimeInStart,
            callbackScope: this,
        });
    }

    private _remianTimeInStart(): void {
        const start = 1.2;
        const end = 1;
        const tweenDuration = 500;
        const spaceDuration = 1000;
        //初期状態にしておく
        this.textRemain.setScale(start);

        this.tween = this.scene.tweens.add({
            targets: this.textRemain,
            ease: 'Power',
            duration: tweenDuration,
            props: {
                scale: { from: start, to: end },
            },
            onStart: () => {
                this.textRemain.setVisible(true);
            },
            onStartScope: this,
        });

        //次の演出への間をとる
        this.spacer = this.scene.time.addEvent({
            delay: spaceDuration,
            callback: this._bonusScoreInStart,
            callbackScope: this,
        });
    }

    private _bonusScoreInStart(): void {
        const start = 1.2;
        const end = 1;
        const tweenDuration = 500;
        const spaceDuration = 2000;
        //初期状態にしておく
        this.textBonus.setScale(start);

        this.tween = this.scene.tweens.add({
            targets: this.textBonus,
            ease: 'Power',
            duration: tweenDuration,
            props: {
                scale: { from: start, to: end },
            },
            onStart: () => {
                this.textBonus.setVisible(true);
            },
            onStartScope: this,
            onComplete: () => {
                Globals.get().addScore(this.bonus);
            },
            onCompleteScope: this,
        });

        //次の演出への間をとる
        this.spacer = this.scene.time.addEvent({
            delay: spaceDuration,
            callback: this._congraOutStart,
            callbackScope: this,
        });
    }

    private _congraOutStart(): void {
        const start = 1.0;
        const end = 0;
        const tweenDuration = 1000;
        const spaceDuration = 2000;

        this.tween = this.scene.tweens.add({
            targets: [this.congra, this.board, this.textRemain, this.textBonus],
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