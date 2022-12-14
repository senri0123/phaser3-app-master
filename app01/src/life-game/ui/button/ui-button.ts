import { Control } from "../../control";
import { Consts } from "../../../consts";
import { uiButtonConfig } from "./ui-button-util";


export class uiButton {
    protected scene: Phaser.Scene;
    protected control: Control;
    protected config: uiButtonConfig;
    protected icon: Phaser.GameObjects.Image;
    protected panel: Phaser.GameObjects.Rectangle;
    protected se: Phaser.Sound.BaseSound;
    protected stat: number;

    constructor(scene: Phaser.Scene, control: Control, config: uiButtonConfig) {
        this.scene = scene;
        this.control = control;
        this.config = config;

        this.icon = scene.add.image(config.rect.x, config.rect.y, config.images.atlas, config.images.offIcon);
        this.icon.setDepth(Consts.Button.Depth.ICON);
        this.panel = scene.add.rectangle(config.rect.x, config.rect.y, config.rect.w, config.rect.h, config.color.offColor);
        this.panel.setDepth(Consts.Button.Depth.PANEL);
        this.stat = Consts.Button.Stat.NONE;

        this.se = this.scene.sound.addAudioSprite(Consts.Assets.Audio.SE.NAME);

        //イベントリスナー設定
        this.panel.setInteractive();
        this.panel.on("pointerover", this._onOver, this);
        this.panel.on("pointerout", this._onOut, this);
        this.panel.on("pointerdown", this._onDown, this);
        this.panel.on("pointerup", this._onUp, this);
    }

    update(): void {

    }

    isEnable(): boolean {
        if (this.stat === Consts.Button.Stat.GRAY ||
            this.stat === Consts.Button.Stat.NONE) {
            return false;
        }
        else {
            return true;
        }
    }

    setPos(x: number, y: number): void {
        this.icon.setPosition(x, y);
        this.panel.setPosition(x, y);
    }

    setActive(flag: boolean): void {
        this.icon.setActive(flag);
        this.panel.setActive(flag);

        this.icon.setVisible(flag);
        this.panel.setVisible(flag);
    }

    protected _changeStat(stat: number) {
        //ボタンの状態を更新
        const changed: boolean = (this.stat !== stat);
        this.stat = stat;

        //状態に合わせて表示を切り替え
        switch (this.stat) {
            case Consts.Button.Stat.OFF: this._setOff(changed); break;
            case Consts.Button.Stat.ON: this._setOn(changed); break;
            case Consts.Button.Stat.OVER: this._setOver(changed); break;
            case Consts.Button.Stat.GRAY: this._setDisable(changed); break;
            default: break;
        }
    }

    protected _setOn(changed: boolean): void {
        if (!changed) {
            return;
        }
        this.icon.setFrame(this.config.images.onIcon);
        this.panel.setFillStyle(this.config.color.onColor);
    }

    protected _setOff(changed: boolean): void {
        if (!changed) {
            return;
        }
        this.icon.setFrame(this.config.images.offIcon);
        this.panel.setFillStyle(this.config.color.offColor);
    }

    protected _setOver(changed: boolean): void {
        if (!changed) {
            return;
        }
        this.icon.setFrame(this.config.images.overIcon);
        this.panel.setFillStyle(this.config.color.overColor);
    }

    protected _setDisable(changed: boolean): void {
        if (!changed) {
            return;
        }
        this.icon.setFrame(this.config.images.disableIcon);
        this.panel.setFillStyle(this.config.color.disableColor);
    }



    protected _onOver(): void {
        this._changeStat(Consts.Button.Stat.OVER);
        this.control.setMouseOverButton(this.config.type);
        // this.se.play(Consts.Assets.Audio.SE.SELECT);
    }

    protected _onOut(): void {
        this._changeStat(Consts.Button.Stat.OFF);
        this.control.setMouseOverButton(Consts.Button.Type.NONE);
    }

    protected _onDown(): void {
        this._changeStat(Consts.Button.Stat.ON);
    }

    protected _onUp(): void {
        this._changeStat(Consts.Button.Stat.OFF);
        this.se.play(Consts.Assets.Audio.SE.DECIDE);
    }

}

//
export class uiButtonEdit extends uiButton {
    constructor(scene: Phaser.Scene, control: Control, config: uiButtonConfig) {
        super(scene, control, config);
    }

    //トグルで状態を変化させたいので一部イベントを無視
    protected _onOver(): void {
        this.control.setMouseOverButton(this.config.type);
        // this.se.play(Consts.Assets.Audio.SE.SELECT);
    }
    protected _onOut(): void {
        this.control.setMouseOverButton(Consts.Button.Type.NONE);
    }
    protected _onDown(): void { }
    protected _onUp(): void {
        //super._onUp();
        this.control.onEdit();
        this.se.play(Consts.Assets.Audio.SE.DECIDE);
    }

    update(): void {
        const playback = this.control.getPlayBack();
        const mode = this.control.getEditMode();
        if (playback === Consts.Control.PlayBack.STOP) {
            if (mode === Consts.Control.EditMode.EDIT) {
                this._changeStat(Consts.Button.Stat.ON);
            }
            else {
                this._changeStat(Consts.Button.Stat.OFF);
            }
        }
        else {
            this._changeStat(Consts.Button.Stat.GRAY);
        }
    }
}

//
export class uiButtonErase extends uiButton {
    constructor(scene: Phaser.Scene, control: Control, config: uiButtonConfig) {
        super(scene, control, config);
    }

    //トグルで状態を変化させたいので一部イベントを無視
    protected _onOver(): void {
        this.control.setMouseOverButton(this.config.type);
        // this.se.play(Consts.Assets.Audio.SE.SELECT);
    }
    protected _onOut(): void {
        this.control.setMouseOverButton(Consts.Button.Type.NONE);
    }
    protected _onDown(): void { }
    protected _onUp(): void {
        // super._onUp();
        this.control.onErase();
        this.se.play(Consts.Assets.Audio.SE.DECIDE);
    }

    update(): void {
        const playback = this.control.getPlayBack();
        const mode = this.control.getEditMode();
        if (playback === Consts.Control.PlayBack.STOP) {
            if (mode === Consts.Control.EditMode.ERASE) {
                this._changeStat(Consts.Button.Stat.ON);
            }
            else {
                this._changeStat(Consts.Button.Stat.OFF);
            }
        }
        else {
            this._changeStat(Consts.Button.Stat.GRAY);
        }
    }
}

//
export class uiButtonPlay extends uiButton {
    constructor(scene: Phaser.Scene, control: Control, config: uiButtonConfig) {
        super(scene, control, config);
    }

    protected _onUp(): void {
        super._onUp();
        this.control.onPlay();
    }
}

//
export class uiButtonPause extends uiButton {
    constructor(scene: Phaser.Scene, control: Control, config: uiButtonConfig) {
        super(scene, control, config);
    }

    protected _onUp(): void {
        super._onUp();
        this.control.onPause();
    }
}

//
export class uiButtonClear extends uiButton {
    constructor(scene: Phaser.Scene, control: Control, config: uiButtonConfig) {
        super(scene, control, config);
    }

    protected _onUp(): void {
        super._onUp();
        this.control.onClear();
    }
}

//
export class uiButtonSpeedUp extends uiButton {
    constructor(scene: Phaser.Scene, control: Control, config: uiButtonConfig) {
        super(scene, control, config);
    }

    protected _onUp(): void {
        super._onUp();
        this.control.onSpeedUp();
    }
}

//
export class uiButtonSpeedDown extends uiButton {
    constructor(scene: Phaser.Scene, control: Control, config: uiButtonConfig) {
        super(scene, control, config);
    }

    protected _onUp(): void {
        super._onUp();
        this.control.onSpeedDown();
    }
}

//
export class uiButtonReturn extends uiButton {
    constructor(scene: Phaser.Scene, control: Control, config: uiButtonConfig) {
        super(scene, control, config);
    }

    protected _onUp(): void {
        super._onUp();
        this.control.onReturn();
    }
}

//
export class uiButtonSave extends uiButton {

    private enable: boolean;
    private timerCooldown: Phaser.Time.TimerEvent | null;

    constructor(scene: Phaser.Scene, control: Control, config: uiButtonConfig) {
        super(scene, control, config);

        this.enable = true;
        this.timerCooldown = null;
    }
    protected _onOver(): void {
        if (this.enable) {
            super._onOver();
        }
    }

    protected _onOut(): void {
        if (this.enable) {
            super._onOut();
        }
        else {
            this.control.setMouseOverButton(Consts.Button.Type.NONE);
        }
    }

    protected _onDown(): void {
        if (this.enable) {
            super._onDown();
        }
    }

    protected _onUp(): void {
        if (this.enable) {
            //サーバセーブを行う
            this.control.onSave();

            //ボタンを無効に変える
            this.enable = false;
            this._changeStat(Consts.Button.Stat.GRAY);
            //クールダウンタイムを設定
            this.timerCooldown = this.scene.time.addEvent({
                delay: 10000,
                callback: this._cooldownEnd,
                callbackScope: this,
            });
        }
    }

    protected _cooldownEnd(): void {
        if (!this.enable) {
            this.enable = true;
            this._changeStat(Consts.Button.Stat.OFF);
        }
    }
}

//
export class uiButtonScreenShot extends uiButton {
    constructor(scene: Phaser.Scene, control: Control, config: uiButtonConfig) {
        super(scene, control, config);
    }

    protected _onUp(): void {
        super._onUp();
        this.control.onScreenShot();
    }
}