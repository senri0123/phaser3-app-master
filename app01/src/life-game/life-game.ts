import { Core, CoreConfig, UpdateCellInfo } from "./life-game-core";
import { ColorTransition } from "./service/color-transition";
import { Control } from "./control";
import { Consts } from "../consts";

export type LifeGameConfig = {
    core: CoreConfig;   //コアのコンフィグ

    x: number;  //x座標
    y: number;  //y座標
    w: number;  //横幅
    h: number;  //縦幅

    speed: number;  //シミュレート速度

    use_mask: boolean;  //マスクを使用する
    use_blur: boolean;  //ブラーをかける
    blur_name: string;  //パイプライン名

    restored: boolean;  //復帰を行う
    restoreData: string;    //復帰用データ
}




export class LifeGame {

    private scene: Phaser.Scene;    //シーン
    private config: LifeGameConfig; //コンフィグ
    private core: Core;             //コア
    private control: Control;       //制御クラス
    private panel: Phaser.GameObjects.Graphics; //描画用オブジェクト
    private proceedTimer: Phaser.Time.TimerEvent | null;
    private speed: number;

    private cell_w: number;         //セルの幅
    private cell_h: number;         //セルの高さ

    private dirty: DirtyInfo[];     //変更リスト
    private colorTransition: ColorTransition[]; //色変更用tween

    constructor(scene: Phaser.Scene, control: Control, config: LifeGameConfig) {
        this.scene = scene;
        this.config = config;
        this.control = control;
        this.core = new Core(config.core);
        this.panel = scene.add.graphics();
        this.speed = this.config.speed;
        this.proceedTimer = null;

        //セルの幅、高さを算出
        this.cell_w = this.config.w / this.config.core.cols;
        this.cell_h = this.config.h / this.config.core.rows;

        this.dirty = [];
        this.colorTransition = [];

        //タイマー初期化
        this._initTimer();
        this._stopTimer();
        //パネルの初期化
        this._initPanel();

        //復元を行う
        if (this.config.restored && this.config.restoreData.length > 0) {
            this.restoreFromString(this.config.restoreData);
        }
    }

    update(): void {
        if (this._isPlayback()) {
            //鑑賞モード中
            this._updatePlayMode();
        }
        else {
            //編集モード中
            this._updateEditMode();
        }
    }


    //セルの状態を設定する
    //内部的な状態のみ設定される。描画に反映するには applyCellStat を呼ぶ。
    setCellStat(row: number, col: number, stat: number): void {
        const lastStat = this.core.getCellStat(row, col);
        if (lastStat === Consts.LifeGame.Cell.Stat.NONE) {
            return;
        }
        if (lastStat != stat) {
            this.core.setCellStat(row, col, stat);
            this._addDirty(new DirtyInfo(row, col, stat, lastStat));
        }
    }

    //セルの状態を取得する
    getCellStat(row: number, col: number): number {
        return this.core.getCellStat(row, col);
    }

    //セルの状態を描画に反映させる
    applyCellStat(): void {
        for (let i = 0; i < this.dirty.length; i++) {
            this._drawCell(this.dirty[i].row, this.dirty[i].col, this.dirty[i].stat);
        }
        //要素を全削除
        this.dirty.splice(0);
    }

    //シミュレート速度設定
    setSpeed(speed: number): void {
        this.speed = speed;
    }

    //タイマースタート
    //現在の状態をもとに、シミュレート開始する
    startTimer(): void {
        this._startTimer();
    }

    //シミュレートを停止する
    stopTimer(): void {
        this._stopTimer();
    }

    //外部からセルを描画する（鑑賞モード時のみ有効。主にColorTransitionから使用する）
    drawCell(row: number, col: number, color: number): void {

        if (!this._isPlayback()) {
            return;
        }

        const stat = Consts.LifeGame.Cell.Stat.NONE;    //状態は見ないのでNONEにして置く
        this._drawCell(row, col, stat, color);
    }

    //現在の状態を文字列化する
    toString(): string {
        return this.core.getData();
    }

    //文字列から状態を復元する
    restoreFromString(text: string): void {
        this.core.restoreFromString(text);
        this._redraw();
        this.applyCellStat();
    }


    //タイマー初期化
    protected _initTimer(): void {
        this.proceedTimer = this.scene.time.addEvent({
            delay: this._getSimulateSpeed(this.speed),
            callback: this._proceed,
            callbackScope: this,
            loop: true
        });
    }

    //タイマー処理開始
    protected _startTimer(): void {
        if (this.proceedTimer === null) {
            this._initTimer()
        }
        else {
            this.proceedTimer.reset({
                delay: this._getSimulateSpeed(this.speed),
                callback: this._proceed,
                callbackScope: this,
                loop: true
            });
        }
    }

    //タイマー処理停止
    protected _stopTimer(): void {
        if (this.proceedTimer !== null) {
            this.proceedTimer.paused = true;
        }
        this._clearColorTransition();
        this._redraw();
        this.applyCellStat();
    }

    //タイマーが有効かどうか
    protected _isTimerActive(): boolean {
        if (this.proceedTimer === null) {
            return false;
        }
        else {
            if (this.proceedTimer.paused) {
                return false;    //ポーズ中＝有効
            }
            else {
                return true;    //ポーズ中ではない＝有効
            }
        }
    }



    //パネルの初期化
    private _initPanel(): void {
        this.panel.fillStyle(Consts.LifeGame.Cell.Color.OFF);
        this.panel.fillRect(this.config.x, this.config.y, this.config.w, this.config.h);
        this.panel.setDepth(Consts.Panel.DEPTH);

        if (this.config.use_mask) {
            //マスクを作成
            const maskObject = this.scene.make.graphics(this.panel);
            maskObject.beginPath();
            maskObject.fillRect(this.config.x, this.config.y, this.config.w, this.config.h);

            const mask = maskObject.createGeometryMask();
            this.panel.setMask(mask);
        }

        if (this.config.use_blur) {
            this.panel.setPostPipeline(this.config.blur_name);    //シェーダの対象にする
        }
    }

    //シミュレート定期処理
    private _proceed(): void {
        // this._dump();

        //状態更新
        const updateList: UpdateCellInfo[] = this.core.proceed();

        //前回の tween が残っていれば殺す
        this._clearColorTransition();

        //tween を登録
        for (let i = 0; i < updateList.length; i++) {
            const col = updateList[i].col;
            const row = updateList[i].row;

            //矩形を算出
            const x = this.config.x + col * this.cell_w;
            const y = this.config.y + row * this.cell_h;

            //矩形の範囲をチェック
            if (!this._checkRect(x, y)) {
                continue;   //おかしければ次へ
            }

            //色を取得
            const colorFrom = this._getCellColor(updateList[i].lastStat);
            const colorTo = this._getCellColor(updateList[i].stat);

            //色変化用アニメーションを設定する
            const config = {
                col: col,
                row: row,
                colorFrom: colorFrom,
                colorTo: colorTo,
                duration: Consts.LifeGame.Cell.Color.DURATION,
            }
            const colorTransition = new ColorTransition(this.scene, this, config);
            this.colorTransition.push(colorTransition);
        }
    }

    private _clearColorTransition(): void {
        //前回の tween が残っていれば殺す
        for (let i = 0; i < this.colorTransition.length; i++) {
            this.colorTransition[i].kill();
        }
        this.colorTransition.splice(0);
    }

    //すべてのセルを描画し直す
    private _redraw(): void {
        for (let row = 0; row < this.config.core.rows; row++) {
            for (let col = 0; col < this.config.core.cols; col++) {
                const lastStat = this.core.getCellStat(row, col);
                this._addDirty(new DirtyInfo(row, col, lastStat, lastStat));
            }
        }
    }


    private _drawCell(row: number, col: number, stat: number, color?: number | undefined): void {
        //矩形を算出
        const x = this.config.x + col * this.cell_w;
        const y = this.config.y + row * this.cell_h;

        //矩形の範囲をチェック
        if (!this._checkRect(x, y)) {
            return;   //おかしければ何もしない
        }

        //色を取得
        let fillColor = 0;
        if (color === undefined) {
            fillColor = this._getCellColor(stat);
        }
        else {
            fillColor = color;
        }

        //パネルに反映する
        this.panel.fillStyle(fillColor);
        this.panel.fillRect(x, y, this.cell_w, this.cell_h);
    }

    private _checkRect(x: number, y: number): boolean {
        const xx = x + this.cell_w;
        const yy = y + this.cell_h;

        //範囲をチェック
        if (x < this.config.x || x > (this.config.x + this.config.w)) { return false; }
        if (y < this.config.y || y > (this.config.y + this.config.h)) { return false; }
        // if (xx < this.config.x || xx > (this.config.x + this.config.w)) { return false; }
        // if (yy < this.config.y || yy > (this.config.y + this.config.h)) { return false; }

        return true;
    }

    private _getCellColor(stat: number) {
        switch (stat) {
            case Consts.LifeGame.Cell.Stat.ALIVE: return Consts.LifeGame.Cell.Color.ON;
            default: return Consts.LifeGame.Cell.Color.OFF;
        }
    }

    private _addDirty(info: DirtyInfo) {
        //同じセルが登録済みなら上書きする
        for (let i = 0; i < this.dirty.length; i++) {
            if (this.dirty[i].row === info.row && this.dirty[i].col == info.col) {
                this.dirty[i] = info;
                return;
            }
        }
        //なければ新規に追加する
        this.dirty.push(info)
    }

    private _getSimulateSpeed(speed: number): number {

        //範囲外が指定されたときはデフォルトにする。
        if (speed < Consts.Control.Speed.MIN || speed > Consts.Control.Speed.MAX) {
            speed = Consts.Control.Speed.DEFAULT;
        }

        switch (speed) {
            case 1: return 1000;    //Consts.Control.Speed.MIN
            case 2: return 500;     //DEFAULT
            case 3: return 400;     //
            case 4: return 300;     //
            case 5: return 200;     //MAX
            default: return 500;    //DEFAULT
        }
    }

    private _isPlayback(): boolean {
        const playback = this.control.getPlayBack();
        return (playback === Consts.Control.PlayBack.PLAY);
    }

    private _updatePlayMode(): void {
        if (!this._isTimerActive()) {
            this._startTimer(); //タイマー処理開始
        }

        const speed = this.control.getSpeed();
        if (this.speed != speed) {
            this.speed = speed;
            this._startTimer(); //速度変更
        }
    }

    private _updateEditMode(): void {
        //タイマーチェック
        if (this._isTimerActive()) {
            this._stopTimer(); //タイマー処理停止
        }

        if (this.control.isGameReset()) {
            this._clearAllCells();
            return;
        }

        //生存数を制御クラスへ通知
        const aliveCount = this.core.getAliveCount();
        this.control.setAliveCellCount(aliveCount);

        const pointer = this.control.getPointer();
        if (!this._pointerValidation(pointer)) {
            return; //ポインターが有効な状態ではない
        }

        //ポインターの座標をセルの座標に返還
        const col = this._pointer2Col(pointer);
        const row = this._pointer2Row(pointer);

        const mode = this.control.getEditMode();
        switch (mode) {
            case Consts.Control.EditMode.EDIT:
                this.setCellStat(row, col, Consts.LifeGame.Cell.Stat.ALIVE);
                this.applyCellStat();
                break;

            case Consts.Control.EditMode.ERASE:
                this.setCellStat(row, col, Consts.LifeGame.Cell.Stat.DEAD);
                this.applyCellStat();
                break;

            default:
                //モードがおかしい？
                break;
        }
    }

    private _clearAllCells(): void {
        for (let row = 0; row < this.config.core.rows; row++) {
            for (let col = 0; col < this.config.core.cols; col++) {
                this.setCellStat(row, col, Consts.LifeGame.Cell.Stat.DEAD);
            }
        }
        this.applyCellStat();
    }

    private _pointerValidation(pointer: Phaser.Input.Pointer): boolean {
        //パネル矩形内でクリック、移動したものを受け付ける
        if (!pointer.isDown) { return false; }
        if (!this._checkRect(pointer.downX, pointer.downY)) { return false; }
        if (!this._checkRect(pointer.x, pointer.y)) { return false; }

        return true;
    }

    private _pointer2Col(pointer: Phaser.Input.Pointer): number {
        if (!this._pointerValidation(pointer)) {
            return -1;
        }

        const x = pointer.x;
        const col = Math.floor((x - this.config.x) / this.cell_w);
        return col;
    }

    private _pointer2Row(pointer: Phaser.Input.Pointer): number {
        if (!this._pointerValidation(pointer)) {
            return -1;
        }

        const y = pointer.y;
        const row = Math.floor((y - this.config.y) / this.cell_h);
        return row;
    }

    dump(): void {
        const generation = this.core.getGeneration();
        const aliveCount = this.core.getAliveCount();
        console.log("===========================================");
        console.log("[" + generation + "]alive:" + aliveCount);
        for (let r = 0; r < this.config.core.rows; r++) {
            let str = "";
            for (let c = 0; c < this.config.core.cols; c++) {
                const stat = this.core.getCellStat(r, c);
                switch (stat) {
                    case Consts.LifeGame.Cell.Stat.NONE: str += " "; break;
                    case Consts.LifeGame.Cell.Stat.ALIVE: str += "+"; break;
                    case Consts.LifeGame.Cell.Stat.DEAD: str += "-"; break;
                    default: str += "?"; break;
                }
            }
            const line = ('00' + r).slice(-2);
            console.log("[" + line + "] " + str);
        }
        console.log("===========================================");
    }


}


//状態変化を記録するためのクラス
class DirtyInfo {
    row: number = -1;
    col: number = -1;

    stat: number = Consts.LifeGame.Cell.Stat.NONE;
    lastStat: number = Consts.LifeGame.Cell.Stat.NONE;

    constructor(row: number, col: number, stat: number, lastStat: number) {
        this.row = row;
        this.col = col;
        this.stat = stat;
        this.lastStat = lastStat;
    }
}

