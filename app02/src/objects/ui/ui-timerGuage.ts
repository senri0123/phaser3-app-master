import { Globals } from "../../globals";
import { Coord2 } from "../../types";

export type uiTimerGuageConfig = {
    frame: {
        key: string;
        frame: string;
        position: Coord2;
        origin: Coord2;
        depth: number;
    },
    guage: {
        position: Coord2;
        size: Coord2;
        origin: Coord2;
        depth: number;
    }
}

const GuageStat = {
    NORMAL: 0,
    NOTICE: 1,
    WARN: 2,
}
const GuageStatThreshold = {
    NORMAL: 0,
    NOTICE: 0.2,
    WARN: 0.1,
}

export class uiTimerGuage {

    private scene: Phaser.Scene;
    private config: uiTimerGuageConfig;
    private base: Phaser.GameObjects.Rectangle;
    private guage: Phaser.GameObjects.Rectangle;
    private frame: Phaser.GameObjects.Image;
    private stat: number;

    private static baseColor = 0x0000FF;
    private static guageColor = 0x00FFFF;
    private static noticeColor = 0xFFFF00;
    private static warnColor = 0xFF0000;

    constructor(scene: Phaser.Scene, config: uiTimerGuageConfig) {
        this.scene = scene;
        this.config = config;

        //枠
        this.frame = scene.add.image(config.frame.position.x, config.frame.position.y, config.frame.key, config.frame.frame);
        this.frame.setOrigin(config.frame.origin.x, config.frame.origin.y);
        this.frame.setDepth(config.frame.depth);

        //ベース部分
        this.base = scene.add.rectangle(config.guage.position.x, config.guage.position.y,
            config.guage.size.x, config.guage.size.y, uiTimerGuage.baseColor);
        this.base.setOrigin(config.guage.origin.x, config.guage.origin.y);
        this.base.setDepth(config.guage.depth);

        //ゲージ部分
        this.guage = scene.add.rectangle(config.guage.position.x, config.guage.position.y,
            config.guage.size.x, config.guage.size.y, uiTimerGuage.guageColor);
        this.guage.setOrigin(config.guage.origin.x, config.guage.origin.y);
        this.guage.setDepth(config.guage.depth + 1);

        this.stat = GuageStat.NORMAL;
    }

    update(): void {
        const percent = Globals.get().getRemainPercent();
        const w = this.config.guage.size.x * percent;
        const h = this.config.guage.size.y;
        this.guage.setSize(w, h);

        const stat = this._getStat(percent);
        if (this.stat != stat) {
            this.stat = stat;
            if (this.stat === GuageStat.NOTICE) {
                this.guage.setFillStyle(uiTimerGuage.noticeColor);
            }
            else if (this.stat === GuageStat.WARN) {
                this.guage.setFillStyle(uiTimerGuage.warnColor);
            }
        }
    }

    private _getStat(percent: number) {
        if (percent < GuageStatThreshold.WARN) {
            return GuageStat.WARN;
        }
        else if (percent < GuageStatThreshold.NOTICE) {
            return GuageStat.NOTICE;
        }
        else {
            return GuageStat.NORMAL;
        }
    }

}