import { Consts } from "../../consts";
import { Control } from "../control";

export type uiSpeedConfig = {
    x: number,
    y: number,
    depth: number,
    scale: number,
    pad_x: number,
    count: number,
    atlas: string;
    disableIcon: string,
    onIcon: string,
}

export class uiSpeed {
    private scene: Phaser.Scene;
    private control: Control;
    private config: uiSpeedConfig;
    private icons: Phaser.GameObjects.Image[];
    private playback: number;
    private speed: number;


    constructor(scene: Phaser.Scene, control: Control, config: uiSpeedConfig) {
        this.scene = scene;
        this.control = control;
        this.config = config;
        this.icons = [];
        this.speed = this.control.getSpeed();
        this.playback = this.control.getPlayBack();

        this._initIcons();
        this._updateIcons();
    }

    update(): void {

        const playback = this.control.getPlayBack();
        const speed = this.control.getSpeed();

        if (playback !== this.playback || speed !== this.speed) {
            this.playback = playback;
            this.speed = speed;

            this._updateIcons();
        }
    }



    private _initIcons(): void {
        for (let i = 0; i < this.config.count; i++) {
            const x = this.config.x + (this.config.pad_x * i);
            const y = this.config.y;

            const icon = this.scene.add.image(x, y, this.config.atlas, this.config.disableIcon);
            icon.setDepth(this.config.depth);
            icon.setScale(this.config.scale);
            this.icons.push(icon);
        }
    }

    private _updateIcons() {
        if (this.playback === Consts.Control.PlayBack.PLAY) {
            const enableCount = Math.min(this.speed - Consts.Control.Speed.MIN + 1, this.config.count);
            //有効アイコン
            for (let i = 0; i < enableCount; i++) {
                this.icons[i].setFrame(this.config.onIcon);
            }
            //無効アイコン
            for (let i = enableCount; i < this.config.count; i++) {
                this.icons[i].setFrame(this.config.disableIcon);
            }
        }
        else {
            //編集モードはすべて無効
            for (let i = 0; i < this.config.count; i++) {
                this.icons[i].setFrame(this.config.disableIcon);
            }
        }
    }
}