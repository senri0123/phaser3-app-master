
import { Consts } from "../consts";

export class Control {

    private scene: Phaser.Scene;
    private playBack: number;
    private editMode: number;
    private speed: number;
    private gameReset: boolean;
    private returnTitle: boolean;
    private saveData: boolean;

    private textPlayBack: Phaser.GameObjects.Text;
    private textEditMode: Phaser.GameObjects.Text;
    private textSpeed: Phaser.GameObjects.Text;

    private statEdit: boolean;
    private statErase: boolean;
    private statPlay: boolean;
    private statPause: boolean;
    private statClear: boolean;
    private statSpeedUp: boolean;
    private statSpeedDown: boolean;
    private statReturn: boolean;
    private statSave: boolean;
    private statScreenShot: boolean;

    private keyEdit: Phaser.Input.Keyboard.Key;
    private keyErase: Phaser.Input.Keyboard.Key;
    private keyPlay: Phaser.Input.Keyboard.Key;
    private keyPause: Phaser.Input.Keyboard.Key;
    private keyClear: Phaser.Input.Keyboard.Key;
    private keySpeedUp: Phaser.Input.Keyboard.Key;
    private keySpeedDown: Phaser.Input.Keyboard.Key;
    private keyReturn: Phaser.Input.Keyboard.Key;
    private keySave: Phaser.Input.Keyboard.Key;
    private keyScreenShot: Phaser.Input.Keyboard.Key;

    private mouseOverButton: number;
    private aliveCellCount: number;

    constructor(scene: Phaser.Scene) {
        this.scene = scene;
        this.playBack = Consts.Control.PlayBack.STOP;
        this.editMode = Consts.Control.EditMode.EDIT;
        this.speed = Consts.Control.Speed.DEFAULT;
        this.gameReset = false;
        this.returnTitle = false;
        this.saveData = false;

        var textStyle: Phaser.Types.GameObjects.Text.TextStyle = {
            font: "12px Arial",
            color: "#E0E0E0"
        };

        this.textPlayBack = this.scene.add.text(5, 5, "", textStyle);
        this.textPlayBack.setDepth(10);
        this.textEditMode = this.scene.add.text(5, 20, "", textStyle);
        this.textEditMode.setDepth(10);
        this.textSpeed = this.scene.add.text(5, 35, "", textStyle);
        this.textSpeed.setDepth(10);
        this._setText();

        this.statEdit = false;
        this.statErase = false;
        this.statPlay = false;
        this.statPause = false;
        this.statClear = false;
        this.statSpeedUp = false;
        this.statSpeedDown = false;
        this.statReturn = false;
        this.statSave = false;
        this.statScreenShot = false;

        this.keyEdit = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ZERO);
        this.keyErase = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ONE);
        this.keyPlay = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.TWO);
        this.keyPause = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.THREE);
        this.keyClear = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.FOUR);
        this.keySpeedUp = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.FIVE);
        this.keySpeedDown = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SIX);
        this.keyReturn = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SEVEN);
        this.keySave = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.EIGHT);
        this.keyScreenShot = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.NINE);

        // this.keyEdit.on(Phaser.Input.Keyboard.Events.DOWN, () => { this.onEdit(); }, this);
        // this.keyErase.on(Phaser.Input.Keyboard.Events.DOWN, () => { this.onErase(); }, this);
        // this.keyPlay.on(Phaser.Input.Keyboard.Events.DOWN, () => { this.onPlay(); }, this);
        // this.keyPause.on(Phaser.Input.Keyboard.Events.DOWN, () => { this.onPause(); }, this);
        // this.keyClear.on(Phaser.Input.Keyboard.Events.DOWN, () => { this.onClear(); }, this);
        // this.keySpeedUp.on(Phaser.Input.Keyboard.Events.DOWN, () => { this.onSpeedUp(); }, this);
        // this.keySpeedDown.on(Phaser.Input.Keyboard.Events.DOWN, () => { this.onSpeedDown(); }, this);
        // this.keyReturn.on(Phaser.Input.Keyboard.Events.DOWN, () => { this.onReturn(); }, this);
        // this.keySave.on(Phaser.Input.Keyboard.Events.DOWN, () => { this.onSave(); }, this);
        // this.keyScreenShot.on(Phaser.Input.Keyboard.Events.DOWN, () => { this.onScreenShot(); }, this);

        this.mouseOverButton = Consts.Button.Type.NONE;
        this.aliveCellCount = 0;
    }

    update(): void {
        this._checkKeys();
    }

    isGameReset(): boolean {
        return this.gameReset;
    }

    isReturnTitle(): boolean {
        return this.returnTitle;
    }

    isDataSave(): boolean {
        return this.saveData;
    }

    getPlayBack(): number {
        return this.playBack;
    }

    getEditMode(): number {
        return this.editMode;
    }

    getSpeed(): number {
        return this.speed;
    }

    setSpeed(speed: number): void {
        this.speed = speed;
    }

    //マウスポインターの状態を取得
    getPointer(): Phaser.Input.Pointer {
        return this.scene.input.activePointer;
    }

    //各種ボタンのステータスセット。複数のデバイスで入力の競合が起きないようにワンクッション置く
    onEdit(): void { this.statEdit = true; }
    onErase(): void { this.statErase = true; }
    onPlay(): void { this.statPlay = true; }
    onPause(): void { this.statPause = true; }
    onClear(): void { this.statClear = true; }
    onSpeedUp(): void { this.statSpeedUp = true; }
    onSpeedDown(): void { this.statSpeedDown = true; }
    onReturn(): void { this.statReturn = true; }
    onSave(): void { this.statSave = true; }
    onScreenShot(): void { this.statScreenShot = true; }

    //現在マウスが載っているボタンをセット
    setMouseOverButton(button: number): void {
        this.mouseOverButton = button;
    }
    //現在マウスが載っているボタンを取得
    getMouseOverButton(): number {
        return this.mouseOverButton;
    }

    //現在生存中のセル数セット
    setAliveCellCount(count: number): void {
        this.aliveCellCount = count;
    }

    //現在生存中のセル数を取得
    getAliveCellCount(): number {
        return this.aliveCellCount;
    }

    private _checkKeys(): void {

        //チェック前にやることはここで
        this.gameReset = false;     //ゲームリセットフラグはクリアしておく
        this.returnTitle = false;   //戻るフラグはクリアしておく
        this.saveData = false;      //セーブフラグはクリアしておく

        if (this.statPlay) {
            this.playBack = Consts.Control.PlayBack.PLAY;
            this.editMode = Consts.Control.EditMode.NONE;
            this._setText();
        }
        else if (this.statPause) {
            this.playBack = Consts.Control.PlayBack.STOP;
            this.editMode = Consts.Control.EditMode.EDIT;
            this._setText();
        }
        else if (this.statEdit) {
            if (this.playBack === Consts.Control.PlayBack.STOP) {
                this.editMode = Consts.Control.EditMode.EDIT;
            }
            else {
                this.editMode = Consts.Control.EditMode.NONE;
            }
            this._setText();
        }
        else if (this.statErase) {
            if (this.playBack === Consts.Control.PlayBack.STOP) {
                this.editMode = Consts.Control.EditMode.ERASE;
            }
            else {
                this.editMode = Consts.Control.EditMode.NONE;
            }
            this._setText();
        }
        else if (this.statClear) {
            //リセット
            this.gameReset = true;
        }
        else if (this.statSpeedUp) {
            if (this.speed < Consts.Control.Speed.MAX) {
                ++this.speed;
                this._setText();
            }
        }
        else if (this.statSpeedDown) {
            if (this.speed > Consts.Control.Speed.MIN) {
                --this.speed;
                this._setText();
            }
        }
        else if (this.statReturn) {
            this.returnTitle = true;
        }
        else if (this.statSave) {
            this.saveData = true;
        }
        else if (this.statScreenShot) {
        }
        else {
            ;
        }

        this._resetStat();
    }

    private _resetStat(): void {
        this.statEdit = false;
        this.statErase = false;
        this.statPlay = false;
        this.statPause = false;
        this.statClear = false;
        this.statSpeedUp = false;
        this.statSpeedDown = false;
        this.statReturn = false;
        this.statSave = false;
        this.statScreenShot = false;
    }

    private _setText(): void {
        // let strPlayBack: string = "";
        // let strEditMode: string = "";

        // switch (this.playBack) {
        //     case Consts.Control.PlayBack.STOP: strPlayBack = "STOP"; break;
        //     case Consts.Control.PlayBack.PLAY: strPlayBack = "PLAY"; break;
        // }
        // switch (this.editMode) {
        //     case Consts.Control.EditMode.NONE: strEditMode = "NONE"; break;
        //     case Consts.Control.EditMode.EDIT: strEditMode = "WRITE"; break;
        //     case Consts.Control.EditMode.ERASE: strEditMode = "ERASE"; break;
        // }

        // this.textPlayBack.setText("PlayBack: " + strPlayBack);
        // this.textEditMode.setText("EditMode: " + strEditMode);
        // this.textSpeed.setText("Speed: " + this.speed);
    }
}