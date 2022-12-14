import { Control } from "../../control";
import { uiButton, uiButtonReturn, uiButtonSave, uiButtonScreenShot } from "./ui-button";
import {
    uiButtonPlay, uiButtonPause, uiButtonEdit, uiButtonErase,
    uiButtonClear, uiButtonSpeedUp, uiButtonSpeedDown
} from "./ui-button";
import { Consts } from "../../../consts";
import { uiButtonConfig } from "./ui-button-util";
import { uiButtonUtil } from "./ui-button-util";

export class uiButtonManager {

    private scene: Phaser.Scene;
    private control: Control;
    private playback: number;
    private buttonPlay: uiButtonPlay;
    private buttonPause: uiButtonPause;
    private buttonEdit: uiButtonEdit;
    private buttonErase: uiButtonErase;
    private buttonSpeedUp: uiButtonSpeedUp;
    private buttonSpeedDown: uiButtonSpeedDown;
    private buttonClear: uiButtonClear;
    private buttonReturn: uiButtonReturn;
    private buttonSave: uiButtonSave;
    private buttonScreenShot: uiButtonScreenShot;


    constructor(scene: Phaser.Scene, control: Control) {
        this.scene = scene;
        this.control = control;

        //各ボタンの生成
        //PLAY
        {
            const config: uiButtonConfig = {
                type: Consts.Button.Type.PLAY,
                images: uiButtonUtil.getButtonImages(Consts.Button.Type.PLAY),
                color: uiButtonUtil.getButtonColor(),
                rect: uiButtonUtil.getButtonRect(0),
            }
            this.buttonPlay = new uiButtonPlay(scene, control, config);
        }
        //PAUSE
        {
            const config: uiButtonConfig = {
                type: Consts.Button.Type.PAUSE,
                images: uiButtonUtil.getButtonImages(Consts.Button.Type.PAUSE),
                color: uiButtonUtil.getButtonColor(),
                rect: uiButtonUtil.getButtonRect(1),
            }
            this.buttonPause = new uiButtonPause(scene, control, config);
        }
        //EDIT
        {
            const config: uiButtonConfig = {
                type: Consts.Button.Type.EDIT,
                images: uiButtonUtil.getButtonImages(Consts.Button.Type.EDIT),
                color: uiButtonUtil.getButtonColor(),
                rect: uiButtonUtil.getButtonRect(2),
            }
            this.buttonEdit = new uiButtonEdit(scene, control, config);
        }
        //ERASE
        {
            const config: uiButtonConfig = {
                type: Consts.Button.Type.ERASE,
                images: uiButtonUtil.getButtonImages(Consts.Button.Type.ERASE),
                color: uiButtonUtil.getButtonColor(),
                rect: uiButtonUtil.getButtonRect(3),
            }
            this.buttonErase = new uiButtonErase(scene, control, config);
        }
        //SPEED UP
        {
            const config: uiButtonConfig = {
                type: Consts.Button.Type.SPEEDUP,
                images: uiButtonUtil.getButtonImages(Consts.Button.Type.SPEEDUP),
                color: uiButtonUtil.getButtonColor(),
                rect: uiButtonUtil.getButtonRect(4),
            }
            this.buttonSpeedUp = new uiButtonSpeedUp(scene, control, config);
        }
        //SPEED DOWN
        {
            const config: uiButtonConfig = {
                type: Consts.Button.Type.SPEEDDWON,
                images: uiButtonUtil.getButtonImages(Consts.Button.Type.SPEEDDWON),
                color: uiButtonUtil.getButtonColor(),
                rect: uiButtonUtil.getButtonRect(5),
            }
            this.buttonSpeedDown = new uiButtonSpeedDown(scene, control, config);
        }
        //CLEAR
        {
            const config: uiButtonConfig = {
                type: Consts.Button.Type.CLEAR,
                images: uiButtonUtil.getButtonImages(Consts.Button.Type.CLEAR),
                color: uiButtonUtil.getButtonColor(),
                rect: uiButtonUtil.getButtonRect(6),
            }
            this.buttonClear = new uiButtonClear(scene, control, config);
        }
        //RETURN
        {
            const config: uiButtonConfig = {
                type: Consts.Button.Type.RETURN,
                images: uiButtonUtil.getButtonImages(Consts.Button.Type.RETURN),
                color: uiButtonUtil.getButtonColor(),
                rect: uiButtonUtil.getButtonRect(7),
            }
            this.buttonReturn = new uiButtonReturn(scene, control, config);
        }
        //SAVE
        {
            const config: uiButtonConfig = {
                type: Consts.Button.Type.SAVE,
                images: uiButtonUtil.getButtonImages(Consts.Button.Type.SAVE),
                color: uiButtonUtil.getButtonColor(),
                rect: uiButtonUtil.getButtonRect(8),
            }
            this.buttonSave = new uiButtonSave(scene, control, config);
        }
        //SCREENSHOT
        {
            const config: uiButtonConfig = {
                type: Consts.Button.Type.SCREENSHOT,
                images: uiButtonUtil.getButtonImages(Consts.Button.Type.SCREENSHOT),
                color: uiButtonUtil.getButtonColor(),
                rect: uiButtonUtil.getButtonRect(9),
            }
            this.buttonScreenShot = new uiButtonScreenShot(scene, control, config);
        }

        //ボタンの初期配置
        this.playback = this.control.getPlayBack();
        this._replace();
    }

    update() {
        const playback = this.control.getPlayBack();
        if (this.playback !== playback) {
            this.playback = playback;
            this._replace();
        }

        this.buttonPlay.update();
        this.buttonPause.update();
        this.buttonEdit.update();
        this.buttonErase.update();
        this.buttonSpeedUp.update();
        this.buttonSpeedDown.update();
        this.buttonClear.update();
        this.buttonReturn.update();
        this.buttonSave.update();
        this.buttonScreenShot.update();
    }

    private _replace(): void {
        let row: number = 0;

        if (this.playback === Consts.Control.PlayBack.PLAY) {
            //鑑賞モード
            let rect = uiButtonUtil.getButtonRect(row);
            this.buttonPause.setPos(rect.x, rect.y);
            this.buttonPause.setActive(true);
            ++row;

            rect = uiButtonUtil.getButtonRect(row);
            this.buttonSpeedUp.setPos(rect.x, rect.y);
            this.buttonSpeedUp.setActive(true);
            ++row;

            rect = uiButtonUtil.getButtonRect(row);
            this.buttonSpeedDown.setPos(rect.x, rect.y);
            this.buttonSpeedDown.setActive(true);
            ++row;

            rect = uiButtonUtil.getButtonRect(row);
            this.buttonReturn.setPos(rect.x, rect.y);
            this.buttonReturn.setActive(true);
            ++row;

            //以下非表示
            this.buttonPlay.setActive(false);
            this.buttonEdit.setActive(false);
            this.buttonErase.setActive(false);
            this.buttonClear.setActive(false);
            this.buttonSave.setActive(false);
            this.buttonScreenShot.setActive(false);

        }
        else {
            //編集モード
            let rect = uiButtonUtil.getButtonRect(row);
            this.buttonPlay.setPos(rect.x, rect.y);
            this.buttonPlay.setActive(true);
            ++row;

            rect = uiButtonUtil.getButtonRect(row);
            this.buttonEdit.setPos(rect.x, rect.y);
            this.buttonEdit.setActive(true);
            ++row;

            rect = uiButtonUtil.getButtonRect(row);
            this.buttonErase.setPos(rect.x, rect.y);
            this.buttonErase.setActive(true);
            ++row;

            rect = uiButtonUtil.getButtonRect(row);
            this.buttonClear.setPos(rect.x, rect.y);
            this.buttonClear.setActive(true);
            ++row;

            rect = uiButtonUtil.getButtonRect(row);
            this.buttonReturn.setPos(rect.x, rect.y);
            this.buttonReturn.setActive(true);
            ++row;

            rect = uiButtonUtil.getButtonRect(row);
            this.buttonSave.setPos(rect.x, rect.y);
            this.buttonSave.setActive(true);
            ++row;

            //以下非表示
            this.buttonPause.setActive(false);
            this.buttonSpeedUp.setActive(false);
            this.buttonSpeedDown.setActive(false);
            this.buttonScreenShot.setActive(false);
        }
    }
}