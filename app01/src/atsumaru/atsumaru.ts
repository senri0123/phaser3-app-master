import { AtsumaruApiError, ErrorFunc, NextFunc, Observer, StorageItem, Subscription } from "@atsumaru/api-types";
import { RPGAtsumaruApi } from "@atsumaru/api-types";

export const AtsumaruConsts = {
    //アツマール用
    Data: {
        KEY: "cells",
    },
    CommStat: {
        NONE: 0,    //通信していない
        DURING: 1,  //通信中
        SUCCESS: 2, //成功
        FAIL: 3,     //失敗
    },
}

class AtsumaruWrapperBase {
    protected _isValid(): boolean {
        const atsumaru = window.RPGAtsumaru;
        if (atsumaru) {
            return true;
        }
        else {
            return false;
        }
    }

    protected _withAtsumaru(fn: (atsumaru: RPGAtsumaruApi) => void): void {
        const atsumaru = window.RPGAtsumaru;
        if (atsumaru) {
            fn(atsumaru);
        }
        else {
            // console.log("RPGAtsumaruオブジェクトが存在しません");
        }
    }
}


//--- master volume -----------------------
export type AtsumaruMasterVolumeInfo = {
    isChanged: boolean; //マスターボリュームが変更されたか
    volume: number;     //現在のマスターボリュームの値
}

export class AtsumaruMasterVolume
    extends AtsumaruWrapperBase
    implements Observer<number>
{

    private isActive: boolean;
    private isChanged: boolean;
    private masterVolume: number;
    private callback: ((info: AtsumaruMasterVolumeInfo) => void) | null;

    constructor() {
        super();

        this.isActive = false;
        this.isChanged = false;
        this.masterVolume = 0;
        this.callback = null;
    }

    /**
     * 初期化。起動時に一度呼ぶ。
     */
    initialize(): void {
        // console.log(`AtsumaruMasterVolume.initialize called.`);

        if (this._isValid()) {
            //初回マスターボリューム取得
            const volume = this._getMasterVolume();
            if (volume != null) {
                //マスターボリュームが取れた
                this.isActive = true;
                this.isChanged = true;
                this.masterVolume = volume;
                console.log(`AtsumaruMasterVolume.initialize. initialize OK! isActive=${this.isActive} masterVolume=${this.masterVolume}`);
            }

            //ボリューム変更コールバック設定
            this._setChangeVolumeCallback();
        }
    }

    setCallback(fn: (info: AtsumaruMasterVolumeInfo) => void) {
        this.callback = fn;
    }

    /**
     * マスターボリューム情報(AtsumaruMasterVolumeInfo)を取得する。
     * @returns マスターボリュームの情報を返す。アツマールが無効の場合はnullが返される。
     */
    getMasterVolume(): AtsumaruMasterVolumeInfo | null {
        if (this.isActive) {
            const ret: AtsumaruMasterVolumeInfo = {
                isChanged: this.isChanged,
                volume: this.masterVolume,
            };

            //変更フラグは下ろす
            this.isChanged = false;
            return ret;
        }
        else {
            return null;
        }
    }


    private _getMasterVolume(): number | null {
        let volume = null;
        this._withAtsumaru(atsumaru => {
            volume = atsumaru.volume.getCurrentValue();
            // console.log(`AtsumaruMasterVolume._getMasterVolume called. volume=${volume}`);
        });
        return volume;
    }

    private _setChangeVolumeCallback(): void {
        // console.log(`AtsumaruMasterVolume._setChangeVolumeCallback called.`);
        this._withAtsumaru(atsumaru => atsumaru.volume.changed.subscribe(this));
    }

    //--- implements Observer<number> -------------------
    start(subscription: Subscription): void {
    }

    next(volume: number) {
        // console.log(`AtsumaruMasterVolume._onChangeMasterVolume called. volume=${volume}`);

        if (this.isActive) {
            if (this.masterVolume != volume) {
                this.masterVolume = volume;
                this.isChanged = true;
                if (this.callback != null) {
                    this.callback({ isChanged: this.isChanged, volume: this.masterVolume });
                }
            }
        }
    }

    error(errorValue: any) {
        console.log(`${errorValue}`);
    }
}

//--- snap shot -----------------------
export class AtsumaruSnapShot extends AtsumaruWrapperBase {

    private currentScene: Phaser.Scene | null;
    private lastImage: HTMLImageElement | null;
    private modalOpen: boolean;

    private static modalName = 'ScreenshotModal__ScreenshotModal__Body';

    constructor() {
        super();

        this.currentScene = null;
        this.lastImage = null;
        this.modalOpen = false;
    }

    initialize(): void {
        this._withAtsumaru(atsumaru => {
            atsumaru.experimental?.screenshot?.setScreenshotHandler?.(async () => {
                if (this.currentScene == null) {
                    console.log("currentScene == null");
                    return "";
                }
                else {
                    this.currentScene.game.renderer.snapshot((snapshot: Phaser.Display.Color | HTMLImageElement) => {
                        console.log("_snapshot called");

                        //前回くっつけた画像がある場合は外す
                        if (this.lastImage != null) {
                            document.body.removeChild(this.lastImage);
                            this.lastImage = null;
                        }

                        //画像を追加する
                        this.lastImage = snapshot as HTMLImageElement;
                        const child = document.body.appendChild(this.lastImage);
                        child.setAttribute('hidden', '');
                    });

                    //snapshotを読んだあと、コールバック処理関数の処理を行うのにラグがあるため、スリープで待つ。
                    await this._sleep(100);
                    if (this.lastImage != null) {
                        return this.lastImage.currentSrc;
                    }
                    else {
                        return "";
                    }
                }
            });
        });

    }

    setScene(scene: Phaser.Scene): void {
        this.currentScene = scene;
    }

    //スリープ
    private async _sleep(ms: number) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }
}



//--- server data -----------------------
//--- server data load -----------------------
export type AtsumaruServerDataLoadInfo = {
    stat: number,
    data: StorageItem[],
};

export class AtsumaruServerDataLoad extends AtsumaruWrapperBase {

    private stat: number;
    private items: StorageItem[];
    private callback: ((info: AtsumaruServerDataLoadInfo) => void) | null;

    constructor() {
        super();
        this.stat = AtsumaruConsts.CommStat.NONE;
        this.items = [];
        this.callback = null;
    }

    setCallback(fn: (info: AtsumaruServerDataLoadInfo) => void): void {
        this.callback = fn;
    }

    load(callback?: (info: AtsumaruServerDataLoadInfo) => void): void {
        console.log('AtsumaruServerDataLoad called.');

        if (callback != null) {
            this.setCallback(callback);
        }

        if (!this._isValid()) {
            //アツマールが有効ではない
            console.log("AtsumaruServerDataLoad. Atsumaru not in work.");
            this.stat = AtsumaruConsts.CommStat.FAIL;
            this.items = [];
            if (this.callback != null) {
                this.callback({ stat: this.stat, data: this.items });
            }
            return;
        }

        this._withAtsumaru(atsumaru => {
            console.log("Atsumaru atsumaru.storage.getItems() start.");
            //ロード開始
            this.stat = AtsumaruConsts.CommStat.DURING;
            this.items = [];

            atsumaru.storage.getItems()
                .then(items => {
                    console.log("Atsumaru atsumaru.storage.getItems() success.");

                    this.stat = AtsumaruConsts.CommStat.SUCCESS;
                    this.items = items;
                    if (this.callback != null) {
                        this.callback({ stat: this.stat, data: this.items });
                    }
                })
                .catch((error: AtsumaruApiError) => {
                    console.error(error.message);
                    console.log("Atsumaru atsumaru.storage.getItems() fail.");

                    this.stat = AtsumaruConsts.CommStat.FAIL;
                    this.items = [];
                    if (this.callback != null) {
                        this.callback({ stat: this.stat, data: this.items });
                    }
                });
        });
    }

    check(): AtsumaruServerDataLoadInfo {
        const info: AtsumaruServerDataLoadInfo = { stat: this.stat, data: this.items };
        return info;
    }
}

//--- server data save -----------------------
export class AtsumaruServerDataSave extends AtsumaruWrapperBase {

    private stat: number;
    private callback: ((stat: number) => void) | null;

    constructor() {
        super();
        this.stat = AtsumaruConsts.CommStat.NONE;
        this.callback = null;
    }

    setCallback(fn: (stat: number) => void): void {
        this.callback = fn;
    }

    save(data: StorageItem[], callback?: (stat: number) => void): void {
        console.log('AtsumaruServerDataSave called.');

        if (callback != null) {
            this.setCallback(callback);
        }

        if (!this._isValid()) {
            //アツマールが有効ではない
            console.log("AtsumaruServerDataLoad. Atsumaru not in work.");
            this.stat = AtsumaruConsts.CommStat.FAIL;
            if (this.callback != null) {
                this.callback(this.stat);
            }
            return;
        }

        //データ保存
        this._withAtsumaru(atsumaru => {
            console.log("Atsumaru atsumaru.storage.setItems() start.");
            this.stat = AtsumaruConsts.CommStat.DURING;

            atsumaru.storage.setItems(data)
                .then((value) => {
                    console.log("Atsumaru atsumaru.storage.setItems() success.");
                    this.stat = AtsumaruConsts.CommStat.SUCCESS;
                    if (this.callback != null) {
                        this.callback(this.stat);
                    }
                })
                .catch((error: AtsumaruApiError) => {
                    console.error(error.message);
                    console.log("Atsumaru atsumaru.storage.setItems() fail.");
                    this.stat = AtsumaruConsts.CommStat.FAIL;
                    if (this.callback != null) {
                        this.callback(this.stat);
                    }
                });
        });
    }

    check(): number {
        return this.stat;
    }
}

//--- server data delete -----------------------
export class AtsumaruServerDataDelete extends AtsumaruWrapperBase {

    private stat: number;
    private callback: ((stat: number) => void) | null;

    constructor() {
        super();
        this.stat = AtsumaruConsts.CommStat.NONE;
        this.callback = null;
    }

    setCallback(fn: (stat: number) => void): void {
        this.callback = fn;
    }

    delete(key: string, callback?: (stat: number) => void): void {
        console.log('AtsumaruServerDataDelete called.');

        if (callback != null) {
            this.setCallback(callback);
        }

        if (!this._isValid()) {
            //アツマールが有効ではない
            console.log("AtsumaruServerDataDelete. Atsumaru not in work.");
            this.stat = AtsumaruConsts.CommStat.FAIL;
            if (this.callback != null) {
                this.callback(this.stat);
            }
            return;
        }

        //データ削除
        this._withAtsumaru(atsumaru => {
            console.log("Atsumaru atsumaru.storage.removeItem() start.");
            this.stat = AtsumaruConsts.CommStat.DURING;

            atsumaru.storage.removeItem(key)
                .then((value) => {
                    console.log("Atsumaru atsumaru.storage.removeItem() success.");
                    this.stat = AtsumaruConsts.CommStat.SUCCESS;
                    if (this.callback != null) {
                        this.callback(this.stat);
                    }
                })
                .catch((error: AtsumaruApiError) => {
                    console.error(error.message);
                    console.log("Atsumaru atsumaru.storage.removeItem() fail.");
                    this.stat = AtsumaruConsts.CommStat.FAIL;
                    if (this.callback != null) {
                        this.callback(this.stat);
                    }
                });
        });
    }

    check(): number {
        return this.stat;
    }
}


//--- scoreboard save -----------------------
export class AtsumaruScoreboardSave extends AtsumaruWrapperBase {

    private stat: number;
    private callback: ((stat: number) => void) | null;

    constructor() {
        super();

        this.stat = AtsumaruConsts.CommStat.NONE;
        this.callback = null;
    }

    setCallback(fn: (stat: number) => void): void {
        this.callback = fn;
    }

    save(boardId: number, score: number, callback?: (stat: number) => void): void {
        console.log('AtsumaruScoreboardSave called.');

        if (callback != null) {
            this.setCallback(callback);
        }

        if (!this._isValid()) {
            //アツマールが有効ではない
            console.log("AtsumaruScoreboardSave. Atsumaru not in work.");
            this.stat = AtsumaruConsts.CommStat.FAIL;
            if (this.callback != null) {
                this.callback(this.stat);
            }
            return;
        }

        //スコアボード保存
        this._withAtsumaru(atsumaru => {
            console.log("Atsumaru atsumaru.experimental.scoreboards.setRecord() start.");
            this.stat = AtsumaruConsts.CommStat.DURING;

            atsumaru.experimental?.scoreboards?.setRecord?.(boardId, score)
                .then((value) => {
                    console.log("Atsumaru atsumaru.experimental.scoreboards.setRecord() success.");
                    this.stat = AtsumaruConsts.CommStat.SUCCESS;
                    if (this.callback != null) {
                        this.callback(this.stat);
                    }
                })
                .catch((error: AtsumaruApiError) => {
                    console.error(error.message);
                    console.log("Atsumaru atsumaru.experimental.scoreboards.setRecord() fail.");
                    this.stat = AtsumaruConsts.CommStat.FAIL;
                    if (this.callback != null) {
                        this.callback(this.stat);
                    }
                });
        });
    }

    check(): number {
        return this.stat;
    }
}

//--- scoreboard display -----------------------
export class AtsumaruScoreboardDisplay extends AtsumaruWrapperBase {

    private stat: number;
    private callback: ((stat: number) => void) | null;

    constructor() {
        super();

        this.stat = AtsumaruConsts.CommStat.NONE;
        this.callback = null;
    }

    setCallback(fn: (stat: number) => void): void {
        this.callback = fn;
    }

    save(boardId: number, score: number, callback?: (stat: number) => void): void {
        console.log('AtsumaruScoreboardDisplay called.');

        if (callback != null) {
            this.setCallback(callback);
        }

        if (!this._isValid()) {
            //アツマールが有効ではない
            console.log("AtsumaruScoreboardDisplay. Atsumaru not in work.");
            this.stat = AtsumaruConsts.CommStat.FAIL;
            if (this.callback != null) {
                this.callback(this.stat);
            }
            return;
        }

        //スコアボード表示
        this._withAtsumaru(atsumaru => {
            console.log("Atsumaru atsumaru.experimental.scoreboards.display() start.");
            this.stat = AtsumaruConsts.CommStat.DURING;

            atsumaru.experimental?.scoreboards?.display?.(boardId)
                .then((value) => {
                    console.log("Atsumaru atsumaru.experimental.scoreboards.display() success.");
                    this.stat = AtsumaruConsts.CommStat.SUCCESS;
                    if (this.callback != null) {
                        this.callback(this.stat);
                    }
                })
                .catch((error: AtsumaruApiError) => {
                    console.error(error.message);
                    console.log("Atsumaru atsumaru.experimental.scoreboards.display() fail.");
                    this.stat = AtsumaruConsts.CommStat.FAIL;
                    if (this.callback != null) {
                        this.callback(this.stat);
                    }
                });
        });
    }

    check(): number {
        return this.stat;
    }
}
