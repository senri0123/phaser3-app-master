import { atsumaru_getVolume, atsumaru_onChangeVolume, atsumaru_setScreenshoScene } from "../atsumaru/atsumaru";
import { Assets, Consts } from "../consts";
import { Globals } from "../globals";


export class SceneTitle extends Phaser.Scene {

    private bg: Phaser.GameObjects.Image | null;
    private title: Phaser.GameObjects.Image | null;
    private start: Phaser.GameObjects.Image | null;
    private timeattack: Phaser.GameObjects.Image | null;
    private panel: Phaser.GameObjects.Rectangle[];
    private bgm: Phaser.Sound.BaseSound | null;

    constructor() {
        super({ key: "Title" });

        this.bg = null;
        this.title = null;
        this.start = null;
        this.timeattack = null;
        this.panel = [];
        this.bgm = null;
    }

    preload() {
    }

    create() {
        this.cameras.main.setBackgroundColor(0x101010);
        Globals.get().reset();

        this._initVolume();
        this._createPanel();
        this._createImage();

        this.bgm = this.sound.add(Assets.Audio.BGM.BGMOP);
        this.bgm.play();

        //スクリーンショット撮影のシーン登録
        atsumaru_setScreenshoScene(this);
    }

    update(): void {
    }

    private _initVolume(): void {
        //現在のボリュームを取得し設定
        const volume = atsumaru_getVolume();
        if (volume) {
            this.sound.volume = volume;
        }
        //ボリュームが変わったときのコールバックを設定
        atsumaru_onChangeVolume((volume: number) => {
            this.sound.volume = volume;
        });
    }

    private _createImage(): void {
        //背景
        {
            const x = this.game.canvas.width * 0.5;
            const y = this.game.canvas.height * 0.5;
            const depth = 0;
            this.bg = this.add.image(x, y, Assets.Graphic.TitleBG.KEY);
            this.bg.setDepth(depth);
        }
        //TITLE
        {
            const x = this.game.canvas.width * 0.5;
            const y = 200;
            const depth = 3;
            this.start = this.add.image(x, y, Assets.Graphic.TitleUIs.KEY, Assets.Graphic.TitleUIs.TITLE);
            this.start.setDepth(depth);
        }
        //START
        {
            const x = this.game.canvas.width * 0.5;
            const y = 420;
            const depth = 3;
            const panelIndex = 0;
            this.start = this.add.image(x, y, Assets.Graphic.TitleUIs.KEY, Assets.Graphic.TitleUIs.START);
            this.start.setDepth(depth);
            this.start.setInteractive();
            this.start.on("pointerout", () => {
                if (panelIndex < this.panel.length) {
                    this.panel[panelIndex].setFillStyle(0x0000FF);
                }
            });
            this.start.on("pointerdown", () => {
                if (panelIndex < this.panel.length) {
                    this.panel[panelIndex].setFillStyle(0x00FF7F);
                }
                this.sound.play(Assets.Audio.SE.DECIDE);
            });
            this.start.on("pointerup", () => {
                if (panelIndex < this.panel.length) {
                    this.panel[panelIndex].setFillStyle(0x0000FF);
                }
                this._onStart(Consts.Game.Mode.NOMAL);
            });
        }
        //TIME ATTACH
        {
            const x = this.game.canvas.width * 0.5;
            const y = 500;
            const depth = 3;
            const panelIndex = 1;

            this.timeattack = this.add.image(x, y, Assets.Graphic.TitleUIs.KEY, Assets.Graphic.TitleUIs.TIMEATTACK);
            this.timeattack.setDepth(depth);
            this.timeattack.setInteractive();
            this.timeattack.on("pointerout", () => {
                if (panelIndex < this.panel.length) {
                    this.panel[panelIndex].setFillStyle(0x0000FF);
                }
            });
            this.timeattack.on("pointerdown", () => {
                if (panelIndex < this.panel.length) {
                    this.panel[panelIndex].setFillStyle(0x00FF7F);
                }
                this.sound.play(Assets.Audio.SE.DECIDE);
            });
            this.timeattack.on("pointerup", () => {
                if (panelIndex < this.panel.length) {
                    this.panel[panelIndex].setFillStyle(0x0000FF);
                }
                this._onStart(Consts.Game.Mode.TIMEATTACK);
            });
        }
    }

    private _createPanel(): void {

        //パネル表示
        {
            const x = this.game.canvas.width * 0.5;
            const y = 430;
            const w = 300;
            const h = 20;

            const rect = this.add.rectangle(x, y, w, h, 0x0000FF);
            rect.setOrigin(0.5, 0);
            rect.setDepth(2);

            this.panel.push(rect);
        }
        {
            const x = this.game.canvas.width * 0.5;
            const y = 510;
            const w = 515;
            const h = 20;

            const rect = this.add.rectangle(x, y, w, h, 0x0000FF);
            rect.setOrigin(0.5, 0);
            rect.setDepth(2);

            this.panel.push(rect);
        }
    }

    private _onStart(mode: number) {
        Globals.get().setMode(mode);
        this.scene.start("Main");
        this.bgm?.stop();
    }
}