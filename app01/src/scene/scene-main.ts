import { LifeGame, LifeGameConfig } from "../life-game/life-game";
import { Control } from "../life-game/control";
import { Consts } from "../consts";
import { uiButtonManager } from "../life-game/ui/button/ui-button-manager";
import { uiGrid, uiGridConfig } from "../life-game/ui/ui-grid";
import { uiMode, uiModeConfig } from "../life-game/ui/ui-mode";
import { uiString, uiStringConfig } from "../life-game/ui/ui-string";
import { uiMessage } from "../life-game/ui/ui-message";
import { uiSpeed, uiSpeedConfig } from "../life-game/ui/ui-speed";
import { atsumaru_getVolume, atsumaru_onChangeVolume, atsumaru_saveServerData, atsumaru_setScreenshoScene } from "../atsumaru/atsumaru";
import { Globals } from "../globals";

export class SceneMain extends Phaser.Scene {

    private control: Control | null;
    private lifeGame: LifeGame | null;
    private ui: uiButtonManager | null;
    private uiGrid: uiGrid | null;
    private uiMode: uiMode | null;
    private uiMessage: uiMessage | null;
    private uiBackGround: Phaser.GameObjects.Image | null;
    private uiTitle: uiString | null;
    private uiSpeed: uiSpeed | null;

    private bgm: Phaser.Sound.BaseSound | null;
    private atsumaruSaveResult: number;


    constructor() {
        super({ key: "Main" });

        this.control = null;
        this.lifeGame = null;
        this.ui = null;
        this.uiGrid = null;
        this.uiMode = null;
        this.uiMessage = null;
        this.uiTitle = null;
        this.uiSpeed = null;
        this.uiBackGround = null;
        this.bgm = null;

        this.atsumaruSaveResult = Consts.Atsumaru.CommStat.NONE;
    }

    preload() {
    }

    create() {
        this.cameras.main.setBackgroundColor(0x101010);

        this._createControl();
        this._createUI();
        this._createUIBackGround();
        this._createLifeGame();
        this._createGrid();
        this._createUIMode();
        this._createUIMessage();
        this._createUITitle();
        this._createUISpeed();
        this._createSound();

        //スクリーンショット撮影のシーン登録
        atsumaru_setScreenshoScene(this);
    }

    update(): void {

        this.control?.update();
        this.lifeGame?.update();
        this.ui?.update();
        this.uiMode?.update();
        this.uiMessage?.update();
        this.uiSpeed?.update();

        if (this.control?.isReturnTitle()) {
            this.bgm?.stop();
            this.scene.start("Title");
        }

        if (this.control?.isDataSave()) {
            //保存ボタンが押された
            if (this.lifeGame) {
                const text = this.lifeGame.toString();
                Globals.get().serverDataMan.set({ key: Consts.Atsumaru.Data.KEY, value: text });
            }
            this._saveData();
        }
    }


    private _createControl(): void {
        this.control = new Control(this);
    }

    private _createLifeGame(): void {
        //復帰用データが有るか確認
        let restoreData: string = "";
        let restored: boolean = false;
        if (Globals.get().continue) {
            restoreData = Globals.get().serverDataMan.get(Consts.Atsumaru.Data.KEY)
            restored = (restoreData.length > 0);
        }

        const config: LifeGameConfig = {
            x: Consts.LifeGame.Position.X,
            y: Consts.LifeGame.Position.Y,
            w: Consts.LifeGame.Size.Middle.W,
            h: Consts.LifeGame.Size.Middle.H,
            core: {
                rows: Consts.LifeGame.Size.Middle.ROW,
                cols: Consts.LifeGame.Size.Middle.COL,
                loopEnable: true,
            },
            speed: Consts.Control.Speed.DEFAULT,
            use_mask: true,
            use_blur: false,
            blur_name: "",
            restored: restored,
            restoreData: restoreData,
        }
        if (this.control !== null) {
            this.lifeGame = new LifeGame(this, this.control, config);
        }
    }

    private _createUI(): void {
        if (this.control !== null) {
            this.ui = new uiButtonManager(this, this.control);
        }
    }

    private _createGrid(): void {

        const cell_w = Consts.LifeGame.Size.Middle.W / Consts.LifeGame.Size.Middle.ROW;
        const cell_h = Consts.LifeGame.Size.Middle.H / Consts.LifeGame.Size.Middle.COL;
        const config: uiGridConfig = {
            x: Consts.LifeGame.Position.X,
            y: Consts.LifeGame.Position.Y,
            w: Consts.LifeGame.Size.Middle.W,
            h: Consts.LifeGame.Size.Middle.H,
            cell_w: cell_w,
            cell_h: cell_h,
            lineWidth: Consts.Grid.LINE_WIDTH,
            color: Consts.Grid.COLOR,
        };

        this.uiGrid = new uiGrid(this, config);
    }

    private _createUIMode(): void {
        const config: uiModeConfig = {
            x: Consts.Mode.Position.X,   //center pos
            y: Consts.Mode.Position.Y,    //center pos
            w: Consts.Mode.Size.W,
            h: Consts.Mode.Size.H,
            editModeColor: Consts.LifeGame.Cell.Color.OFF,
            editModeText: "編集モード",
            editModeTextColor: Consts.LifeGame.Cell.Color.ON,
            showModeColor: Consts.LifeGame.Cell.Color.ON,
            showModeText: "鑑賞モード",
            showModeTextColor: Consts.LifeGame.Cell.Color.OFF,
        };
        if (this.control !== null) {
            this.uiMode = new uiMode(this, this.control, config);
        }
    }

    private _createUIMessage(): void {
        const config: uiStringConfig = {
            x: Consts.Message.Position.X,
            y: Consts.Message.Position.Y,  //center ops
            w: Consts.Message.Size.W,
            h: Consts.Message.Size.H,
            origin_x: Consts.Message.Origin.X,
            origin_y: Consts.Message.Origin.Y,
            font: "18px Arial",
            depth: Consts.Message.DEPTH,
            text: "",
            textColor: 0xFFFFFF,
        };
        if (this.control !== null) {
            this.uiMessage = new uiMessage(this, this.control, config);
        }
    }

    private _createUITitle(): void {
        const config: uiStringConfig = {
            x: Consts.Title.Position.X, //center pos
            y: Consts.Title.Position.Y,  //center ops
            w: Consts.Title.Size.W,
            h: Consts.Title.Size.H,
            origin_x: Consts.Title.Origin.X,
            origin_y: Consts.Title.Origin.Y,
            font: "22px Arial",
            depth: Consts.Title.DEPTH,
            text: "=== LIFE GAME ===",
            textColor: Consts.LifeGame.Cell.Color.ON,
        };
        this.uiTitle = new uiString(this, config);
    }

    private _createUISpeed(): void {
        const config: uiSpeedConfig = {
            x: Consts.Speed.Position.x,
            y: Consts.Speed.Position.y,
            pad_x: Consts.Speed.Padding.x,
            depth: Consts.Speed.DEPTH,
            scale: Consts.Speed.SCALE,
            count: Consts.Control.Speed.MAX - Consts.Control.Speed.MIN + 1,
            atlas: Consts.Assets.Graphic.Icon.Atlas.NAME,
            onIcon: Consts.Assets.Graphic.Icon.Speed.ON,
            disableIcon: Consts.Assets.Graphic.Icon.Speed.GRAY,
        }

        if (this.control !== null) {
            this.uiSpeed = new uiSpeed(this, this.control, config);
        }
    }

    private _createUIBackGround(): void {
        this.uiBackGround = this.add.image(0, 0, Consts.Assets.Graphic.Base.NAME);
        this.uiBackGround.setOrigin(0, 0);
        this.uiBackGround.setDepth(Consts.Base.DEPTH);
    }

    private _createSound(): void {
        this.bgm = this.sound.add(Consts.Assets.Audio.BGM.NAME);
        this.bgm.play({ loop: true });

        //現在のボリュームを取得し設定
        const volume = atsumaru_getVolume();
        if (volume) {
            this.sound.volume = volume;
        }
        //ボリュームが変わったときのコールバックを設定
        atsumaru_onChangeVolume((volume: number) => {
            this.sound.volume = volume;
            // console.log("_onChangeVolume volume:" + volume);
        });
    }

    private _saveData(): void {
        this.atsumaruSaveResult = Consts.Atsumaru.CommStat.NONE;
        if (this.lifeGame) {

            //保存データ作成
            const saveData = Globals.get().serverDataMan.getDirtyValues();
            if (saveData.length > 0) {
                atsumaru_saveServerData(saveData, (result: number) => {
                    this.atsumaruSaveResult = result;
                    console.log("Atsumaru ServerDataSave result:" + result);
                });
            }
            Globals.get().serverDataMan.clearDitry();
        }
    }
}