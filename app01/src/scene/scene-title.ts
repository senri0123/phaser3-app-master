import { atsumaru_getVolume, atsumaru_onChangeVolume, atsumaru_screenshotHandler, atsumaru_setScreenshoScene } from "../atsumaru/atsumaru";
import { Consts } from "../consts";
import { Globals } from "../globals";
import { Control } from "../life-game/control";
import { LifeGame, LifeGameConfig } from "../life-game/life-game";


export class SceneTitle extends Phaser.Scene {

    private panel: Phaser.GameObjects.Rectangle | null;
    private panel_c: Phaser.GameObjects.Rectangle | null;
    private shade: Phaser.GameObjects.Rectangle | null;
    private title: Phaser.GameObjects.Image | null;
    private start: Phaser.GameObjects.Image | null;
    private continue: Phaser.GameObjects.Image | null;
    private control: Control | null;
    private lifeGame: LifeGame | null;
    private resetTimer: Phaser.Time.TimerEvent | null;
    private fade: Phaser.Tweens.Tween | null;

    private se: Phaser.Sound.BaseSound | null;
    private bgm: Phaser.Sound.BaseSound | null;

    private serverDataValidation: boolean;

    constructor() {
        super({ key: "Title" });

        this.panel = null;
        this.panel_c = null;
        this.shade = null;
        this.title = null;
        this.start = null;
        this.continue = null;
        this.control = null;
        this.lifeGame = null;
        this.resetTimer = null;
        this.fade = null;

        this.se = null;
        this.bgm = null;

        this.serverDataValidation = false;
    }

    preload() {
    }

    create() {
        this.cameras.main.setBackgroundColor(0x101010);
        //グローバル変数をリセット(できるものだけ)
        Globals.get().reset();

        //サーバデータの確認
        this.serverDataValidation = Globals.get().serverDataMan.has(Consts.Atsumaru.Data.KEY);

        this._createPanel();
        this._createTitle();
        this._createStart();
        this._createContinue();
        this._createShade();
        this._createControl();
        this._createLifeGame();
        this._createTimer();
        this._createSound();
        this._setupDemo();

        //スクリーンショット撮影のシーン登録
        atsumaru_setScreenshoScene(this);
    }

    update(): void {
        this.control?.update();
        this.lifeGame?.update();
    }

    private _createPanel(): void {
        const x = this.game.canvas.width * 0.5;
        const y = 500;
        const w = 250;
        const h = 20;
        const onColor = Consts.LifeGame.Cell.Color.ON;
        const offColor = Consts.LifeGame.Cell.Color.OFF;

        //パネル表示
        this.panel = this.add.rectangle(x, 415, 250, h, 0x0000FF);
        this.panel.setOrigin(0.5, 0);
        this.panel.setDepth(10);

        let color = 0x0000FF;
        this.panel_c = this.add.rectangle(x, 515, 400, h, 0x0000FF);
        this.panel_c.setOrigin(0.5, 0);
        this.panel_c.setDepth(10);
    }

    private _createTitle(): void {
        const x = this.game.canvas.width * 0.5;
        const y = 200;
        this.title = this.add.image(x, y, Consts.Assets.Graphic.Titles.Atlas.NAME, Consts.Assets.Graphic.Titles.Title);
        this.title.setOrigin(0.5, 0.5);
        this.title.setDepth(11);
    }

    private _createStart(): void {
        const x = this.game.canvas.width * 0.5;
        const y = 400;
        this.start = this.add.image(x, y, Consts.Assets.Graphic.Titles.Atlas.NAME, Consts.Assets.Graphic.Titles.Start);
        this.start.setOrigin(0.5, 0.5);
        this.start.setDepth(11);
        this.start.setInteractive();
        this.start.on("pointerover", () => {
            this.panel?.setFillStyle(0x0080FF);
            this.se?.play(Consts.Assets.Audio.SE.SELECT);
            // console.log("pointerover");
        });
        this.start.on("pointerout", () => {
            this.panel?.setFillStyle(0x0000FF);
        });
        this.start.on("pointerdown", () => {
            this.panel?.setFillStyle(0x00FF7F);
            this.se?.play(Consts.Assets.Audio.SE.START);
        });
        this.start.on("pointerup", () => {
            this.panel?.setFillStyle(0x0000FF);
            this.scene.start("Main");
        });
    }

    private _createContinue(): void {
        const x = this.game.canvas.width * 0.5;
        const y = 500;

        let frame = Consts.Assets.Graphic.Titles.Continue.NG;
        if (this.serverDataValidation) {
            frame = Consts.Assets.Graphic.Titles.Continue.OK;
        }

        this.continue = this.add.image(x, y, Consts.Assets.Graphic.Titles.Atlas.NAME, frame);
        this.continue.setOrigin(0.5, 0.5);
        this.continue.setDepth(11);
        this.continue.setInteractive();
        this.continue.on("pointerover", () => {
            this.panel_c?.setFillStyle(0x0080FF);
            this.se?.play(Consts.Assets.Audio.SE.SELECT);
            // console.log("pointerover");
        });
        this.continue.on("pointerout", () => {
            this.panel_c?.setFillStyle(0x0000FF);
        });
        this.continue.on("pointerdown", () => {
            if (this.serverDataValidation) {
                this.panel_c?.setFillStyle(0x00FF7F);
                this.se?.play(Consts.Assets.Audio.SE.START);
            }
        });
        this.continue.on("pointerup", () => {
            if (this.serverDataValidation) {
                this.panel_c?.setFillStyle(0x0000FF);
                Globals.get().continue = true;
                this.scene.start("Main");
            }
        });
    }

    //フェード用の板
    private _createShade(): void {
        const x = 0;
        const y = 0;
        const w = this.game.canvas.width;
        const h = this.game.canvas.height;

        //シェード
        this.shade = this.add.rectangle(x, y, w, h, 0x000000);
        this.shade.setAlpha(0.3);
        this.shade.setOrigin(0, 0);
        this.shade.setDepth(5);
    }

    private _onStartFade(): void {
        //更新を止める
        this.control?.onPause();
        this.lifeGame?.stopTimer();

        //フェードアウト・フェードアウト
        this.fade = this.tweens.add({
            targets: this.shade,
            alpha: { from: 0.3, to: 1 },
            duration: 500,
            ease: "Linear",
            yoyo: true,
            onYoyo: this._onFadeOut,    //フェードアウトしたときに呼ばれる
            onYoyoScope: this,
        })
    }

    private _onFadeOut(): void {
        this._setupDemo();
    }

    private _createControl(): void {
        this.control = new Control(this);
    }

    private _createLifeGame(): void {
        const x = (this.game.canvas.width - Consts.LifeGame.Size.Middle.W) * 0.5
        const y = (this.game.canvas.height - Consts.LifeGame.Size.Middle.H) * 0.5

        const config: LifeGameConfig = {
            x: x,
            y: y,
            w: Consts.LifeGame.Size.Middle.W,
            h: Consts.LifeGame.Size.Middle.H,
            core: {
                rows: Consts.LifeGame.Size.Middle.ROW,
                cols: Consts.LifeGame.Size.Middle.COL,
                loopEnable: true,
            },
            speed: Consts.Control.Speed.DEFAULT,
            use_mask: false,
            use_blur: true,
            blur_name: Consts.Assets.Graphic.PipeLine.Blur.NAME,
            restored: false,
            restoreData: "",
        }
        if (this.control !== null) {
            this.lifeGame = new LifeGame(this, this.control, config);
        }
    }

    private _createTimer(): void {
        //１分ごとにフェードアウト・フェードインする
        //フェードアウトのタイミングでパネルをリセット
        this.resetTimer = this.time.addEvent({
            delay: 60000,
            callback: this._onStartFade,
            callbackScope: this,
            loop: true
        });
    }

    private _createSound(): void {

        this.se = this.sound.addAudioSprite(Consts.Assets.Audio.SE.NAME);
        this.bgm = this.sound.add(Consts.Assets.Audio.BGM.NAME);

        //現在のボリュームを取得し設定
        const volume = atsumaru_getVolume();
        if (volume) {
            // this._onChangeVolume(volume);
            this.sound.volume = volume;
        }
        //ボリュームが変わったときのコールバックを設定
        atsumaru_onChangeVolume((volume: number) => {
            this.sound.volume = volume;
            // console.log("_onChangeVolume volume:" + volume);
        });

        // this.bgm.play();

        // if(this.sound.locked){
        //     //ロックがまだかかっている。
        //     this.sound.once(Phaser.Sound.Events.UNLOCKED, ()=>{
        //         //ロック解除イベントが来たら再生
        //         this.bgm?.play();
        //     },this);
        // }
        // else{
        //     //ロックは解除されている
        //     this.bgm?.play();
        // }

    }

    private _setupDemo(): void {
        const rows = Consts.LifeGame.Size.Middle.ROW;
        const cols = Consts.LifeGame.Size.Middle.COL;

        //タイマー処理を停止
        this.control?.onPause();
        this.lifeGame?.stopTimer();

        {
            //一旦全てクリア
            for (let c = 0; c < cols; c++) {
                for (let r = 0; r < rows; r++) {
                    this.lifeGame?.setCellStat(r, c, Consts.LifeGame.Cell.Stat.DEAD);
                }
            }
            this.lifeGame?.applyCellStat();
        }

        {
            //5*5 のエリアに10個ランダムにセルを配置
            //を10回行う
            const areaSelect = 20;
            const area_w = 5;
            const area_h = 5;
            const putCount = 10;
            for (let i = 0; i < areaSelect; i++) {

                const col = area_w + Math.floor(Math.random() * cols - area_w);
                const row = area_h + Math.floor(Math.random() * cols - area_h);

                for (let n = 0; n < putCount; n++) {
                    const put_col = col + Math.floor(Math.random() * area_w);
                    const put_row = row + Math.floor(Math.random() * area_h);

                    //念のためチェック
                    if (put_col < 0 || put_col >= cols) { continue; }
                    if (put_row < 0 || put_row >= rows) { continue; }

                    this.lifeGame?.setCellStat(put_row, put_col, Consts.LifeGame.Cell.Stat.ALIVE);
                    // console.log("" + put_row + "\t" + put_col);
                }
            }
            this.lifeGame?.applyCellStat();
        }

        //タイマー処理再開
        {
            this.control?.setSpeed(Consts.Control.Speed.MIN);
            this.control?.onPlay();
            this.lifeGame?.startTimer();
        }
    }

}