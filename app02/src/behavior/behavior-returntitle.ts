import { Assets, Consts } from "../consts";
import { SceneMain } from "../scene/scene-main";
import { Behavior } from "./behavior"

export class BehaviorReturnTile extends Behavior {

    private scene: SceneMain;
    private returnTitle: Phaser.GameObjects.Image;
    private panel: Phaser.GameObjects.Rectangle;
    private shade: Phaser.GameObjects.Rectangle;
    private finished: boolean;

    private static offColor = 0x0000FF;
    private static onColor = 0x00FF7F;

    constructor(scene: SceneMain) {
        super('BehaviorReturnTile');
        this.scene = scene;
        this.finished = false;

        const x = scene.game.canvas.width * 0.5;
        const y = scene.game.canvas.height * 0.5;
        const imageKey = Assets.Graphic.UIs.KEY;
        const depth = Consts.UI.ReturnTitle.DEPTH;

        //shade
        {
            const w = this.scene.game.canvas.width;
            const h = this.scene.game.canvas.height;
            this.shade = scene.add.rectangle(x, y, w, h, 0, 0.5);
            this.shade.setDepth(depth);
        }
        //panel
        {
            const w = 600;
            const h = 20;
            this.panel = scene.add.rectangle(x, y + 20, w, h, BehaviorReturnTile.offColor);
            this.panel.setDepth(depth + 1);
        }
        //return title
        {
            const frame = Assets.Graphic.UIs.RETURN_TITLE;

            this.returnTitle = scene.add.image(x, y, imageKey, frame);
            this.returnTitle.setDepth(depth + 2);

            this.returnTitle.setInteractive();
            this.returnTitle.on("pointerout", () => {
                this.panel.setFillStyle(BehaviorReturnTile.offColor);
            });
            this.returnTitle.on("pointerdown", () => {
                this.panel.setFillStyle(BehaviorReturnTile.onColor);
                this.scene.sound.play(Assets.Audio.SE.DECIDE);
            });
            this.returnTitle.on("pointerup", () => {
                this.panel.setFillStyle(BehaviorReturnTile.offColor);
                this._onEnd();
            });
        }
    }

    initialize(): void {
    }
    update(): void {
    }
    finalize(): void {
        this.returnTitle.destroy();
        this.panel.destroy();
        this.shade.destroy();
    }
    isFinished(): boolean {
        return this.finished;
    }

    private _onEnd(): void {
        this.scene.onGameEnd();
        this.finished = true;
    }
}