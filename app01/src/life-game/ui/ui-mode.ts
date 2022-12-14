import { Control } from "../control";
import { Consts } from "../../consts";

export type uiModeConfig = {
    x: number;
    y: number;
    w: number;
    h: number;

    editModeText: string;
    editModeTextColor: number;
    editModeColor: number;

    showModeText: string;
    showModeTextColor: number;
    showModeColor: number;
}

export class uiMode {
    private scene: Phaser.Scene;
    private control: Control;
    private config: uiModeConfig;
    private panel: Phaser.GameObjects.Rectangle;
    private text: Phaser.GameObjects.Text;
    private playback: number;

    constructor(scene: Phaser.Scene, control: Control, config: uiModeConfig) {
        this.scene = scene;
        this.control = control;
        this.config = config;
        this.panel = scene.add.rectangle(config.x, config.y,
            config.w, config.h,
            config.editModeColor);
        this.panel.setOrigin(0.5, 0.5);
        this.panel.setDepth(Consts.Mode.Panel.DEPTH);

        const textStyle: Phaser.Types.GameObjects.Text.TextStyle = {
            font: "16px Arial",
            color: this._toColorCodeString(config.editModeColor),
        };
        this.text = scene.add.text(config.x, config.y, config.editModeText, textStyle);
        this.text.setOrigin(0.5, 0.5);
        this.text.setDepth(Consts.Mode.Text.DEPTH);

        this.playback = this.control.getPlayBack();
        this._updatePanel();
    }

    update(): void {
        const playback = this.control.getPlayBack();
        if (this.playback !== playback) {
            this.playback = playback;
            this._updatePanel();
        }
    }



    private _updatePanel(): void {
        //パネルを変更
        switch (this.playback) {
            case Consts.Control.PlayBack.PLAY: {
                const colorCode = this._toColorCodeString(this.config.showModeTextColor);
                this.text.setColor(colorCode);
                this.text.setText(this.config.showModeText);
                this.panel.setFillStyle(this.config.showModeColor);
                break;
            }

            case Consts.Control.PlayBack.STOP: {
                const colorCode = this._toColorCodeString(this.config.editModeTextColor);
                this.text.setColor(colorCode);
                this.text.setText(this.config.editModeText);
                this.panel.setFillStyle(this.config.editModeColor);
                break;
            }
        }
    }

    private _toColorCodeString(color: number): string {
        const colorCode = "#" + color.toString(16);
        return colorCode;
    }


}