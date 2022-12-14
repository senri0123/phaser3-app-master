
export type uiStringConfig = {
    x: number;
    y: number;
    w: number;
    h: number;
    font: string;
    text: string;
    textColor: number;
    origin_x: number;
    origin_y: number;
    depth: number;
}

export class uiString {
    protected scene: Phaser.Scene;
    protected config: uiStringConfig;
    protected text: Phaser.GameObjects.Text;

    constructor(scene: Phaser.Scene, config: uiStringConfig) {
        this.scene = scene;
        this.config = config;

        const textStyle: Phaser.Types.GameObjects.Text.TextStyle = {
            font: this.config.font,
            color: this._toColorCodeString(config.textColor),
        };
        this.text = scene.add.text(config.x, config.y, config.text, textStyle);
        this.text.setOrigin(config.origin_x, config.origin_y);
        this.text.setDepth(config.depth);
    }

    update() {

    }

    setText(text: string): void {
        this.text.setText(text);
    }

    protected _toColorCodeString(color: number): string {
        const colorCode = "#" + color.toString(16);
        return colorCode;
    }
}