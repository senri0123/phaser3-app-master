import { Globals } from "../../globals";
import { Coord2 } from "../../types";

export type uiStageConfig = {
    text: {
        position: Coord2;
        origin: Coord2;
        depth: number;
    },
}

export class uiStage {
    private scene: Phaser.Scene;
    private config: uiStageConfig;
    private stage: number;
    private text: Phaser.GameObjects.Text;

    constructor(scene: Phaser.Scene, config: uiStageConfig) {
        this.scene = scene;
        this.config = config;
        this.stage = 0;

        //スコアテキスト
        const textStyle: Phaser.Types.GameObjects.Text.TextStyle = {
            font: "18px Arial",
            color: "#FFFFFF"
        }
        this.text = scene.add.text(config.text.position.x, config.text.position.y, '', textStyle);
        this.text.setOrigin(config.text.origin.x, config.text.origin.y);
        this.text.setDepth(config.text.depth);

        //初回描画
        this.stage = Globals.get().getStage();
        this._setText(this.stage);
    }

    update(): void {
        const stage = Globals.get().getStage();
        if (this.stage !== stage) {
            this.stage = stage;
            this._setText(this.stage);
        }
    }

    private _setText(stage: number) {
        this.text.setText(`STAGE ${(stage + 1)}`);
    }

}