import { Coord2 } from "../../types";

export type uiShadeConfig = {
    shade: {
        key: string;
        frame: string;
        position: Coord2;
        scale: Coord2;
        origin: Coord2;
        depth: number;
    },
}


export class uiShade {

    private scene: Phaser.Scene;
    private config: uiShadeConfig;
    private shade: Phaser.GameObjects.Image;

    constructor(scene: Phaser.Scene, config: uiShadeConfig) {
        this.scene = scene;
        this.config = config;

        //シェード
        this.shade = scene.add.image(config.shade.position.x, config.shade.position.y, config.shade.key, config.shade.frame);
        this.shade.setOrigin(config.shade.origin.x, config.shade.origin.y);
        this.shade.setScale(config.shade.scale.x, config.shade.scale.y);
        this.shade.setDepth(config.shade.depth);
    }
}