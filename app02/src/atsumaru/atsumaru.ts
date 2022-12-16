import { AtsumaruApiError } from "@atsumaru/api-types";
import { RPGAtsumaruApi } from "@atsumaru/api-types";
import { Consts } from "../consts";

export const AtumaruConst = {
    //スコアボード
    ScoreBorad: {
        NORMAL: 1,
        TIMEATTACK: 2,
    },
    //アツマール用
    CommStat: {
        NONE: 0,    //通信していない
        DURING: 1,  //通信中
        SUCCESS: 2, //成功
        FAIL: 3,     //失敗
    },
}

//Atumaruが有効かどうか
export function atsumaru_isValid(): boolean {
    const atsumaru = window.RPGAtsumaru;
    if (atsumaru) {
        return true;
    }
    else {
        return false;
    }
}

//マスターボリュームを取得
export function atsumaru_getVolume(): number | undefined {
    let volume = undefined;
    _withAtsumaru(atsumaru => {
        volume = atsumaru.volume.getCurrentValue();
        console.log("Atsumaru atsumaru.volume.getCurrentValue volume=" + volume);
    });
    return volume;
}

//マスターボリューム変更コールバックを設定
export function atsumaru_onChangeVolume(fn: (volume: number) => void) {
    _withAtsumaru(atsumaru => atsumaru.volume.changed.subscribe(fn));
}

//スクリーンショット
export function atsumaru_tweetScreenShot(): void {
    _withAtsumaru(atsumaru => {
        atsumaru.experimental?.screenshot?.displayModal?.()
            .then((value) => {
                console.log("atsumaru.experimental.screenshot.displayModal() success.");
            })
            .catch((error: AtsumaruApiError) => {
                console.error(error.message)
                console.log("atsumaru.experimental.screenshot.displayModal() fail.");
            });
    });
}

//スクリーンショット画像差し替え実行
let currentScene: Phaser.Scene | null = null;
let lastImage: HTMLImageElement | null = null;

//スクリーンショットコールバック
function _snapshot(snapshot: Phaser.Display.Color | HTMLImageElement) {
    console.log("_snapshot called");

    //前回くっつけた画像がある場合は外す
    if (lastImage != null) {
        document.body.removeChild(lastImage);
        lastImage = null;
    }

    //画像を追加する
    lastImage = snapshot as HTMLImageElement;
    document.body.appendChild(lastImage);
}

//スリープ
async function _sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function atsumaru_screenshotHandler(): Promise<string> {
    console.log("atsumaru_screenshotHandler called");

    if (currentScene == null) {
        console.log("currentScene == null");
        return "";
    }
    else {
        currentScene.game.renderer.snapshot(_snapshot);
        //snapshotを読んだあと、コールバック処理関数の処理を行うのにラグがあるため、スリープで待つ。
        await _sleep(100);
        if (lastImage != null) {
            return lastImage.currentSrc;
        }
        else {
            return "";
        }
    }
}

//スクリーンショット画像差し替え
export function atsumaru_setScreenshoScene(scene: Phaser.Scene): void {
    currentScene = scene;

    _withAtsumaru(atsumaru => {
        atsumaru.experimental?.screenshot?.setScreenshotHandler?.(atsumaru_screenshotHandler);
    });

    console.log("atsumaru_setScreenshoScene called.");
}

//サーバーデータ取得
let loadServerDataCallback: ((result: number, data: { key: string, value: string }[]) => void) | null = null;
export function atsumaru_loadServerData(fn: (result: number, data: { key: string, value: string }[]) => void): void {

    loadServerDataCallback = fn;

    if (!atsumaru_isValid()) {
        console.log("Atsumaru not in work.");
        if (loadServerDataCallback) {
            const data: { key: string, value: string }[] = [];
            loadServerDataCallback(AtumaruConst.CommStat.FAIL, data);
        }
    }

    //データ取得
    _withAtsumaru(atsumaru => {
        console.log("Atsumaru atsumaru.storage.getItems() start.");
        atsumaru.storage.getItems()
            .then(items => {
                if (loadServerDataCallback) {
                    loadServerDataCallback(AtumaruConst.CommStat.SUCCESS, items);
                }
                console.log("Atsumaru atsumaru.storage.getItems() success.");
            })
            .catch((error: AtsumaruApiError) => {
                console.error(error.message);
                if (loadServerDataCallback) {
                    const data: { key: string, value: string }[] = [];
                    loadServerDataCallback(AtumaruConst.CommStat.FAIL, data);
                }
                console.log("Atsumaru atsumaru.storage.getItems() fail.");
            });
    });
}

//サーバーデータ保存
let saveServerDataContent: { key: string, value: string }[];
let saveServerDataCallback: ((result: number) => void) | null = null;
export function atsumaru_saveServerData(data: { key: string, value: string }[], fn: (result: number) => void): void {

    saveServerDataContent = data;
    saveServerDataCallback = fn;

    if (!atsumaru_isValid()) {
        console.log("Atsumaru not in work.");
        if (saveServerDataCallback) {
            saveServerDataCallback(AtumaruConst.CommStat.FAIL);
        }
    }


    //データ保存
    _withAtsumaru(atsumaru => {
        console.log("Atsumaru atsumaru.storage.setItems() start.");
        atsumaru.storage.setItems(saveServerDataContent)
            .then((value) => {
                if (saveServerDataCallback) {
                    saveServerDataCallback(AtumaruConst.CommStat.SUCCESS);
                }
                console.log("Atsumaru atsumaru.storage.setItems() success.");
            })
            .catch((error: AtsumaruApiError) => {
                console.error(error.message);
                if (saveServerDataCallback) {
                    saveServerDataCallback(AtumaruConst.CommStat.FAIL);
                }
                console.log("Atsumaru atsumaru.storage.setItems() fail.");
            });
    });
}

//セーブデータ削除
let deleteServerDataKey: string = "";
let deleteServerDataCallback: ((result: number) => void) | null = null;
export function atsumaru_deleteServerData(key: string, fn: (result: number) => void): void {

    deleteServerDataKey = key;
    deleteServerDataCallback = fn;

    if (!atsumaru_isValid()) {
        console.log("Atsumaru not in work.");
        if (deleteServerDataCallback) {
            deleteServerDataCallback(AtumaruConst.CommStat.FAIL);
        }
    }

    //データ削除
    _withAtsumaru(atsumaru => {
        console.log("Atsumaru atsumaru.storage.removeItem() start.");
        atsumaru.storage.removeItem(deleteServerDataKey)
            .then((value) => {
                if (deleteServerDataCallback) {
                    deleteServerDataCallback(AtumaruConst.CommStat.SUCCESS);
                }
                console.log("Atsumaru atsumaru.storage.removeItem() success.");
            })
            .catch((error: AtsumaruApiError) => {
                console.error(error.message);
                if (deleteServerDataCallback) {
                    deleteServerDataCallback(AtumaruConst.CommStat.FAIL);
                }
                console.log("Atsumaru atsumaru.storage.removeItem() fail.");
            });
    });
}

//スコアボードへの記録
let saveScoreBoardContent: { mode: number, score: number };
let saveScoreBoardCallback: ((result: number) => void) | null = null;
export function atsumaru_saveScoreBoard(data: { mode: number, score: number }, fn: (result: number) => void): void {

    saveScoreBoardContent = data;
    saveScoreBoardCallback = fn;

    if (!atsumaru_isValid()) {
        console.log("Atsumaru not in work.");
        if (saveScoreBoardCallback) {
            saveScoreBoardCallback(AtumaruConst.CommStat.FAIL);
        }
    }


    _withAtsumaru(atsumaru => {
        console.log("Atsumaru atsumaru.experimental.scoreboards.setRecord() start.");
        const boardId = _modetoBoardId(saveScoreBoardContent.mode);
        atsumaru.experimental?.scoreboards?.setRecord?.(boardId, saveScoreBoardContent.score)
            .then((value) => {
                if (saveScoreBoardCallback) {
                    saveScoreBoardCallback(AtumaruConst.CommStat.SUCCESS);
                }
                console.log("Atsumaru atsumaru.experimental.scoreboards.setRecord() success.");
            })
            .catch((error: AtsumaruApiError) => {
                console.error(error.message);
                if (saveScoreBoardCallback) {
                    saveScoreBoardCallback(AtumaruConst.CommStat.FAIL);
                }
                console.log("Atsumaru atsumaru.experimental.scoreboards.setRecord() fail.");
            });
    });
}


//スコアボードの表示
let displayScoreBoardContent: { mode: number };
let displayScoreBoardCallback: ((result: number) => void) | null = null;
export function atsumaru_displayScoreBoard(data: { mode: number }, fn: (result: number) => void): void {

    displayScoreBoardContent = data;
    displayScoreBoardCallback = fn;

    if (!atsumaru_isValid()) {
        console.log("Atsumaru not in work.");
        if (displayScoreBoardCallback) {
            displayScoreBoardCallback(AtumaruConst.CommStat.FAIL);
        }
    }


    _withAtsumaru(atsumaru => {
        console.log("Atsumaru atsumaru.experimental.scoreboards.display() start.");
        const boardId = _modetoBoardId(displayScoreBoardContent.mode);
        atsumaru.experimental?.scoreboards?.display?.(boardId)
            .then((value) => {
                if (displayScoreBoardCallback) {
                    displayScoreBoardCallback(AtumaruConst.CommStat.SUCCESS);
                }
                console.log("Atsumaru atsumaru.experimental.scoreboards.display() success.");
            })
            .catch((error: AtsumaruApiError) => {
                console.error(error.message);
                if (displayScoreBoardCallback) {
                    displayScoreBoardCallback(AtumaruConst.CommStat.FAIL);
                }
                console.log("Atsumaru atsumaru.experimental.scoreboards.display() fail.");
            });
    });
}

function _modetoBoardId(mode: number): number {
    switch (mode) {
        case Consts.Game.Mode.TIMEATTACK: return AtumaruConst.ScoreBorad.TIMEATTACK;
        default: return AtumaruConst.ScoreBorad.NORMAL;
    }
}

function _withAtsumaru(fn: (atsumaru: RPGAtsumaruApi) => void) {
    const atsumaru = window.RPGAtsumaru;
    if (atsumaru) {
        fn(atsumaru);
    }
    else {
        // console.log("RPGAtsumaruオブジェクトが存在しません");
    }
}
