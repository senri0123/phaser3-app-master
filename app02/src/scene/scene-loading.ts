import { Assets, Consts } from "../consts";

export class SceneLoading extends Phaser.Scene {

    private text: Phaser.GameObjects.Text | null;

    constructor() {
        super({ key: "Loading" });

        this.text = null;
    }

    preload() {
        //TODO ここでアセットを読み込む
        this.load.setBaseURL(Assets.BASE);

        //グラフィック
        this.load.atlas(Assets.Graphic.Objects.KEY, Assets.Graphic.Objects.FILE, Assets.Graphic.Objects.ATLAS);
        this.load.atlas(Assets.Graphic.Effects.KEY, Assets.Graphic.Effects.FILE, Assets.Graphic.Effects.ATLAS);
        this.load.atlas(Assets.Graphic.Tiles.KEY, Assets.Graphic.Tiles.FILE, Assets.Graphic.Tiles.ATLAS);
        this.load.atlas(Assets.Graphic.UIs.KEY, Assets.Graphic.UIs.FILE, Assets.Graphic.UIs.ATLAS);
        this.load.atlas(Assets.Graphic.TitleUIs.KEY, Assets.Graphic.TitleUIs.FILE, Assets.Graphic.TitleUIs.ATLAS);
        this.load.image(Assets.Graphic.TitleBG.KEY, Assets.Graphic.TitleBG.FILE);
        for (let i = 0; i < Assets.Graphic.GameBGs.length; i++) {
            this.load.image(Assets.Graphic.GameBGs[i].KEY, Assets.Graphic.GameBGs[i].FILE);
        }

        //オーディオ
        for (let i = 0; i < Assets.Audio.SEs.length; i++) {
            const audio = Assets.Audio.SEs[i];
            this.load.audio(audio.KEY, [audio.OGG, audio.MP3]);
        }
        for (let i = 0; i < Assets.Audio.BGMs.length; i++) {
            const audio = Assets.Audio.BGMs[i];
            this.load.audio(audio.KEY, [audio.OGG, audio.MP3]);
        }
        //タイルマップ
        //ステージ開始時にロードでもいいかもしれない…
        for (let i = 0; i < Assets.Tilemaps.length; i++) {
            const key = Assets.Tilemaps[i].KEY;
            const file = Assets.Tilemaps[i].FILE;
            this.load.tilemapTiledJSON(key, file);
        }

        //ロード進捗
        {
            const x = this.game.canvas.width * 0.5;
            const y = this.game.canvas.height * 0.5;
            const textStyle: Phaser.Types.GameObjects.Text.TextStyle = {
                font: "18px Arial",
                color: "#0000FF"
            }
            this.text = this.add.text(x, y, '', textStyle);
            this.text.setOrigin(0.5, 0.5);
        }
        this.scene.scene.load.on('progress', (progress: number) => {
            this.text?.setText(`Loading...  ${Math.floor(progress * 100)}%`);
        }, this);
        this.scene.scene.load.on('complete', () => {
            this.text?.destroy();
            console.log('load complete');
        }, this);
    }

    create() {
        this.scene.start("Title");
        // this.scene.start("SoundTest");
    }
}