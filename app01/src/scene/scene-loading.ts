import { Consts } from "../consts";
import { atsumaru_loadServerData } from "../atsumaru/atsumaru";
import PostFXBlur from "../assets/pipelines/PostFXBlur";
import { Globals } from "../globals";

export class SceneLoading extends Phaser.Scene {

    private atsumaruLoadResult: number;

    constructor() {
        super({ key: "Loading" });

        this.atsumaruLoadResult = Consts.Atsumaru.CommStat.NONE;
    }

    preload() {
        this.load.setBaseURL(Consts.Assets.BasePath);

        //グラフィック
        //TODO ここでアセットを読み込む
        this.load.image(Consts.Assets.Graphic.Base.NAME, Consts.Assets.Graphic.Base.FILE);
        // this.load.image(Consts.Assets.Graphic.Title.NAME, Consts.Assets.Graphic.Title.FILE);
        // this.load.image(Consts.Assets.Graphic.Start.NAME, Consts.Assets.Graphic.Start.FILE);
        this.load.atlas(Consts.Assets.Graphic.Titles.Atlas.NAME,
            Consts.Assets.Graphic.Titles.Atlas.FILE,
            Consts.Assets.Graphic.Titles.Atlas.ATLAS);
        this.load.atlas(Consts.Assets.Graphic.Icon.Atlas.NAME,
            Consts.Assets.Graphic.Icon.Atlas.FILE,
            Consts.Assets.Graphic.Icon.Atlas.ATLAS);

        const renderer = this.renderer as Phaser.Renderer.WebGL.WebGLRenderer;
        renderer.pipelines.addPostPipeline(Consts.Assets.Graphic.PipeLine.Blur.NAME, PostFXBlur);

        //オーディオ
        this.load.audioSprite(Consts.Assets.Audio.SE.NAME, Consts.Assets.Audio.SE.JSON,
            [Consts.Assets.Audio.SE.OGG, Consts.Assets.Audio.SE.MP3]);
        this.load.audio(Consts.Assets.Audio.BGM.NAME, [Consts.Assets.Audio.BGM.OGG, Consts.Assets.Audio.BGM.MP3]);
    }

    create(): void {
        this.atsumaruLoadResult = Consts.Atsumaru.CommStat.NONE;
        atsumaru_loadServerData((result: number, data: { key: string, value: string }[]) => {
            this.atsumaruLoadResult = result;
            console.log("Atsumaru ServerDataLoad result:" + result);

            if (this.atsumaruLoadResult === Consts.Atsumaru.CommStat.SUCCESS) {
                for (let i = 0; i < data.length; i++) {
                    Globals.get().serverDataMan.set(data[i]);
                }
            }
        });
    }

    update(): void {
        switch (this.atsumaruLoadResult) {
            case Consts.Atsumaru.CommStat.DURING:
                //ロード中
                return;

            case Consts.Atsumaru.CommStat.DURING:
                //成功
                break;

            default:
                //アツマールが有効でない or 失敗した
                break;
        }

        this.scene.start("Title");
    }
}