import { Control } from "../control";
import { Consts } from "../../consts";
import { uiString, uiStringConfig } from "./ui-string";

export class uiMessage extends uiString {

    private control: Control;
    private mouseOverButton: number;
    private noMessageTimer: Phaser.Time.TimerEvent;
    private timerConfig: Phaser.Types.Time.TimerEventConfig;

    constructor(scene: Phaser.Scene, control: Control, config: uiStringConfig) {
        super(scene, config);
        this.control = control;

        this.mouseOverButton = Consts.Button.Type.NONE;

        this.timerConfig = {
            delay: 5000,
        }

        this.noMessageTimer = scene.time.addEvent(this.timerConfig);
        // this.noMessageTimer.paused = true;
    }

    update(): void {

        this.mouseOverButton = this.control.getMouseOverButton();
        this._updateMessage();
    }

    private _updateMessage(): void {
        let message: string = "";

        //なにかのボタンに乗っていればタイマーを止める
        if (this.mouseOverButton !== Consts.Button.Type.NONE) {
            this.noMessageTimer.paused = true;
        }

        switch (this.mouseOverButton) {
            case Consts.Button.Type.EDIT:
                message = "パネルに生命を配置します";
                break;

            case Consts.Button.Type.ERASE:
                message = "パネルから生命を消去します";
                break;

            case Consts.Button.Type.PLAY:
                message = "生命の行く末を見守ります";
                break;

            case Consts.Button.Type.PAUSE:
                message = "時を止めます";
                break;

            case Consts.Button.Type.CLEAR:
                message = "すべてをやり直します";
                break;

            case Consts.Button.Type.SPEEDUP:
                message = "時の流れを速くします";
                break;

            case Consts.Button.Type.SPEEDDWON:
                message = "時の流れを緩やかにします";
                break;

            case Consts.Button.Type.RETURN:
                message = "タイトル画面に戻ります";
                break;

            case Consts.Button.Type.SAVE:
                message = "現在の状態を保存します";
                break;

            case Consts.Button.Type.SCREENSHOT:
                message = "スクリーンショットを投稿します";
                break;

            default: {
                if (this.noMessageTimer.paused) {
                    this.noMessageTimer.remove();
                    this.noMessageTimer = this.scene.time.addEvent(this.timerConfig);
                }
                else {
                    if (this.noMessageTimer.getRemaining() === 0) {
                        if (this.control.getPlayBack() === Consts.Control.PlayBack.STOP) {
                            const aliveCount = this.control.getAliveCellCount();
                            if (aliveCount < 10) {
                                message = "下のパネルに生命を配置してみましょう";
                            }
                            else {
                                message = "▶ボタンで時を進め、生命の行く末を見守りましょう"
                            }
                        }
                        else {
                            message = "生命の行く末を見守りましょう"
                        }
                    }
                }
                break;
            }
        }

        this.setText(message);
    }
}