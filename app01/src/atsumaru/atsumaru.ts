import { AtsumaruApiError, NextFunc, Observer, Subscription } from "@atsumaru/api-types";
import { RPGAtsumaruApi } from "@atsumaru/api-types";
import { Consts } from "../consts";

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

// function changeVolume(volume: number): void {
//     console.log("Atsumaru changeVolume volume=" + volume);
// }

// class ChangeVolumeObserver implements Observer<number>
// {
//     start(subscription: Subscription): void {
//         console.log("ChangeVolumeObserver.start");
//     }

//     next(volume: number): void {
//         console.log("ChangeVolumeObserver.next volue:" + volume);
//     }

//     error(errorValue: any): void {
//         console.log("ChangeVolumeObserver.error");
//     }
// }

// const test: ChangeVolumeObserver = new ChangeVolumeObserver();
// export function atsumaru_changeVolume(): void {
//     console.log("Atsumaru atsumaru_changeVolume");
//     // _withAtsumaru(atsumaru => atsumaru.volume.changed().subscribe(changeVolume as NextFunc<number>));
//     // _withAtsumaru(atsumaru => atsumaru.volume.changed().subscribe(test));
//     _withAtsumaru(atsumaru => atsumaru.volume.changed.subscribe(volume => {
//         console.log("atsumaru.volume.changed() volue:" + volume);
//     }));
// }

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
            loadServerDataCallback(Consts.Atsumaru.CommStat.FAIL, data);
        }
    }

    //データ取得
    _withAtsumaru(atsumaru => {
        console.log("Atsumaru atsumaru.storage.getItems() start.");
        atsumaru.storage.getItems()
            .then(items => {
                if (loadServerDataCallback) {
                    loadServerDataCallback(Consts.Atsumaru.CommStat.SUCCESS, items);
                }
                console.log("Atsumaru atsumaru.storage.getItems() success.");
            })
            .catch((error: AtsumaruApiError) => {
                console.error(error.message);
                if (loadServerDataCallback) {
                    const data: { key: string, value: string }[] = [];
                    loadServerDataCallback(Consts.Atsumaru.CommStat.FAIL, data);
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
            saveServerDataCallback(Consts.Atsumaru.CommStat.FAIL);
        }
    }


    //データ保存
    _withAtsumaru(atsumaru => {
        console.log("Atsumaru atsumaru.storage.setItems() start.");
        atsumaru.storage.setItems(saveServerDataContent)
            .then((value) => {
                if (saveServerDataCallback) {
                    saveServerDataCallback(Consts.Atsumaru.CommStat.SUCCESS);
                }
                console.log("Atsumaru atsumaru.storage.setItems() success.");
            })
            .catch((error: AtsumaruApiError) => {
                console.error(error.message);
                if (saveServerDataCallback) {
                    saveServerDataCallback(Consts.Atsumaru.CommStat.FAIL);
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
            deleteServerDataCallback(Consts.Atsumaru.CommStat.FAIL);
        }
    }

    //データ削除
    _withAtsumaru(atsumaru => {
        console.log("Atsumaru atsumaru.storage.removeItem() start.");
        atsumaru.storage.removeItem(deleteServerDataKey)
            .then((value) => {
                if (deleteServerDataCallback) {
                    deleteServerDataCallback(Consts.Atsumaru.CommStat.SUCCESS);
                }
                console.log("Atsumaru atsumaru.storage.removeItem() success.");
            })
            .catch((error: AtsumaruApiError) => {
                console.error(error.message);
                if (deleteServerDataCallback) {
                    deleteServerDataCallback(Consts.Atsumaru.CommStat.FAIL);
                }
                console.log("Atsumaru atsumaru.storage.removeItem() fail.");
            });
    });
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
