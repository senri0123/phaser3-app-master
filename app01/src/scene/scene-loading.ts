import { Consts } from "../consts";
import { AtsumaruConsts, AtsumaruServerDataLoad } from "../atsumaru/atsumaru";
import PostFXBlur from "../assets/pipelines/PostFXBlur";
import { Globals } from "../globals";

export class SceneLoading extends Phaser.Scene {

    private atsumaruLoadResult: number;
    private atsuServerDataLoad: AtsumaruServerDataLoad | null;

    constructor() {
        super({ key: "Loading" });

        this.atsumaruLoadResult = AtsumaruConsts.CommStat.NONE;
        this.atsuServerDataLoad = null;
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
        // this.atsumaruLoadResult = Consts.Atsumaru.CommStat.NONE;
        // atsumaru_loadServerData((result: number, data: { key: string, value: string }[]) => {
        //     this.atsumaruLoadResult = result;
        //     console.log("Atsumaru ServerDataLoad result:" + result);

        //     if (this.atsumaruLoadResult === Consts.Atsumaru.CommStat.SUCCESS) {
        //         for (let i = 0; i < data.length; i++) {
        //             Globals.get().serverDataMan.set(data[i]);
        //         }
        //     }
        // });

        this.atsuServerDataLoad = new AtsumaruServerDataLoad();

        this.atsuServerDataLoad.load();
    }

    update(): void {
        // switch (this.atsumaruLoadResult) {
        //     case Consts.Atsumaru.CommStat.DURING:
        //         //ロード中
        //         return;

        //     case Consts.Atsumaru.CommStat.DURING:
        //         //成功
        //         break;

        //     default:
        //         //アツマールが有効でない or 失敗した
        //         break;
        // }

        // this.scene.start("Title");

        let wait = false;
        if (this.atsuServerDataLoad != null) {
            const result = this.atsuServerDataLoad.check();
            switch (result.stat) {
                case AtsumaruConsts.CommStat.DURING: {
                    wait = true;
                    break;  //ロード中
                }
                case AtsumaruConsts.CommStat.SUCCESS: {
                    console.log("Atsumaru ServerDataLoad result:" + result.stat);
                    for (let i = 0; i < result.data.length; i++) {
                        Globals.get().serverDataMan.set(result.data[i]);
                    }
                    break;
                }
            }
        }

        if (!wait) {
            this.scene.start("Title");
        }
    }
}