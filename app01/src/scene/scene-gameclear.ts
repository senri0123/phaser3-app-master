export class SceneGameClear extends Phaser.Scene {

    constructor() {
        super({ key: "GameClear" });

    }

    create() {
        this.scene.start("Title");
    }
}