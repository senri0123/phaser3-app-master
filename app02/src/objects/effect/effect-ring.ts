import { Consts } from "../../consts";

/**
 * tween でアニメーションするエフェクトを時間差で表示するクラス。
 * アニメーション開始時のフレームをなんとかして変えられないか試したが、結局いい手段は見つからなかった。
 * そのため、インスタンス生成時に時間差でtweenを起動させ、表示、非表示はImage側のsetVisibleで制御するようにした。
 */

/**
 * リングエフェクトの設定
 */
export type EffectConfig = {
    key: string;
    frame: string;
    depth: number;
    duration: number;   //遷移時間(ms)
    loopDelay: number;  //ループ終了後、次の再生までの時間(ms)
    count: number;      //何個エフェクトを再生するか
    span: number;       //エフェクト間の再生間隔
}

/**
 * リングエフェクトクラス
 */
export abstract class EffectRing {
    protected scene: Phaser.Scene;
    protected config: EffectConfig;
    protected ring: Phaser.GameObjects.Image[];
    protected tween: Phaser.Tweens.Tween[];
    protected resumeTimer: Phaser.Time.TimerEvent | null;
    protected resumeIndex;
    protected visibled: boolean;

    constructor(scene: Phaser.Scene, config: EffectConfig) {
        this.scene = scene;
        this.config = config;
        this.visibled = false;
        this.ring = [];
        this.tween = [];
        this.resumeTimer = null;
        this.resumeIndex = 0;

        for (let i = 0; i < config.count; i++) {
            //表示設定
            const ring = this._createImage();

            //tween作成
            const tween = this._createTween(ring);

            this.ring.push(ring);
            this.tween.push(tween);
        }

        //時間差でtweenを起動させる
        this._resumeEffect();
    }

    destory(): void {
        this.ring.forEach(ring => {
            ring.destroy();
        })
        this.tween.forEach(tween => {
            tween.remove();
        })
        this.resumeTimer?.remove();
    }

    //表示/非表示設定
    setVisible(flag: boolean): void {
        if (this.visibled !== flag) {
            this.visibled = flag;
            for (let i = 0; i < this.ring.length; i++) {
                this.ring[i].setVisible(this.visibled);
            }
        }
    }

    //表示位置設定
    setPosition(x: number, y: number): void {
        for (let i = 0; i < this.ring.length; i++) {
            this.ring[i].setPosition(x, y);
        }
    }

    protected _resumeEffect(): void {
        if (this.resumeIndex >= this.tween.length) {
            return; //何もしない
        }
        if (this.resumeIndex >= this.ring.length) {
            return; //何もしない
        }

        const tween = this.tween[this.resumeIndex];
        tween.resume();

        this.resumeIndex++;
        if (this.resumeIndex < this.tween.length) {
            this._startTimer();
        }
    }

    protected _initTimer(): void {
        this.resumeTimer = this.scene.time.addEvent({
            delay: this.config.span,
            callback: this._resumeEffect,
            callbackScope: this,
        });
    }

    protected _startTimer(): void {
        if (this.resumeTimer === null) {
            this._initTimer()
        }
        else {
            this.resumeTimer.destroy();
            this._initTimer();
        }
    }

    protected _stopTimer(): void {
        if (this.resumeTimer !== null) {
            this.resumeTimer.paused = true;
        }
    }

    protected abstract _createImage(): Phaser.GameObjects.Image;
    protected abstract _createTween(parent: Phaser.GameObjects.Image): Phaser.Tweens.Tween;
}