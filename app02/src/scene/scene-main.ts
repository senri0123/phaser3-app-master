
import { Assets, Consts } from "../consts";
import { Globals } from "../globals";
import { Tilemap, TilemapConfig } from "../objects/tilemap/tilemap";
import { Player, PlayerConfig } from "../objects/ball/player";
import { Coord2 } from "../types";
import { Enemy, EnemyConfig } from "../objects/ball/enemy";
import { EffectConfig } from "../objects/effect/effect-ring";
import { EffectRingYellow } from "../objects/effect/effect-ring_y";
import { GimicManager } from "../objects/gimic/gimic";
import { gimicReverse, gimicReverseConfig } from "../objects/gimic/gimic-reverse";
import { Ball } from "../objects/ball/ball";
import { uiScore, uiScoreConfig } from "../objects/ui/ui-score";
import { uiLives, uiLivesConfig } from "../objects/ui/ui-lives";
import { uiShade, uiShadeConfig } from "../objects/ui/ui-shade";
import { uiStage, uiStageConfig } from "../objects/ui/ui-stage";
import { uiTimerGuageConfig, uiTimerGuage } from "../objects/ui/ui-timerGuage";
import { BehaviorManager } from "../behavior/behavior";
import { BehaviorStart } from "../behavior/behavior-start";
import { BehaviorClear } from "../behavior/behavior-clear";
import { BehaviorGameOver } from "../behavior/behavior-gameover";
import { BehaviorAllClear } from "../behavior/behavior-allclear";
import { BehaviorMiss } from "../behavior/behavior-miss";
import { Log } from "../service/logwithstamp";
import { BehaviorTimeup } from "../behavior/behavior-timeup";
import { getStageConfig, getStageCount, getTilemapConfig, StageConfig } from "../objects/stage/stage";
import { Timer } from "../service/timer";
import { BehaviorTimeAttackClear } from "../behavior/behavior-timeattack-clear";
import { atsumaru_getVolume, atsumaru_onChangeVolume, atsumaru_setScreenshoScene } from "../atsumaru/atsumaru";
import { BehaviorScoreBoard } from "../behavior/behavior-scoreboard";
import { BehaviorReturnTile } from "../behavior/behavior-returntitle";

//ステップ
const Step = {
    //プレー前
    INIT: 0,

    //準備
    READY: 1,
    //開始待ち
    READY_WAIT: 2,

    //プレー中
    PLAY: 10,

    //クリア→次のステージ or 全クリア
    CLEAR: 20,
    NEXTSTAGE: 21,
    ALLCLEAR: 22,

    //ミス→リスタート or ゲームオーバー
    MISS: 30,
    RESTART: 31,
    GAMEORVER: 32,

    //タイムアップ（タイムアタック時）
    TIMEUP: 40,

    //結果表示待ち
    RESULT: 50,

    //スコアボード
    SCOREBOARD: 60,

    //タイトルに戻る
    RETURNTITLE: 70,

    //終了
    END: 100,
}


export class SceneMain extends Phaser.Scene {

    private tilemap: Tilemap | null;
    private player: Player | null;
    private enemies: Enemy[];
    private effect: EffectRingYellow | null;
    private gimicManager: GimicManager | null;
    private behaviorManager: BehaviorManager | null;
    private step: number;
    private missed: boolean;
    private scoreRate: number;
    private debugClear: boolean;

    private baseLayerName: string;
    private transLayerName: string;

    private bits: Phaser.GameObjects.Image[];
    private powerBits: Phaser.GameObjects.Image[];

    private enemySpawnCount: number;
    private enemySpawnTimer: Timer;

    private bg: Phaser.GameObjects.Image | null;

    //UI関連
    private score: uiScore | null;
    private lives: uiLives | null;
    private stage: uiStage | null;
    private timerGuage: uiTimerGuage | null;
    private shade: uiShade | null;

    //サウンド関連
    private bgmName: string;
    private bgm: Phaser.Sound.BaseSound | null;

    //ステージ設定
    private stageConfig: StageConfig | null;

    //for debug
    private keyClear: Phaser.Input.Keyboard.Key | null;

    constructor() {
        super({ key: "Main" });

        this.tilemap = null;
        this.player = null;
        this.enemies = [];
        this.effect = null;
        this.gimicManager = null;
        this.behaviorManager = null;
        this.step = Step.INIT;
        this.missed = false;
        this.scoreRate = 1;

        this.bits = [];
        this.powerBits = [];

        this.keyClear = null;
        this.debugClear = false;

        this.baseLayerName = '';
        this.transLayerName = '';

        this.enemySpawnCount = 0;
        this.enemySpawnTimer = new Timer();

        this.bg = null;

        this.score = null;
        this.lives = null;
        this.stage = null;
        this.timerGuage = null;
        this.shade = null;

        this.bgmName = '';
        this.bgm = null;

        this.stageConfig = null;
    }

    create(): void {
        //ボリューム初期化
        this._initVolume();
        //ステージ初期化
        this._initStage();

        this._createBG();
        this._createTilemap();
        this._createPlayer();
        // this._createEnemies();
        this._createEffect();
        this._createGmicManager();
        this._createBehaviorManager();
        this._createDebug();
        this._createBits();

        this._createInterface();

        this._createSound();

        //スクリーンショット撮影のシーン登録
        atsumaru_setScreenshoScene(this);
    }

    update(time: number, delta: number): void {
        Globals.get().update(delta);
        this.enemySpawnTimer.update(delta);

        this._updateInterface();
        this._updateBehaviorManager();

        const step = this.step;
        switch (this.step) {
            case Step.INIT:
                this._stepInit();
                this.step = Step.PLAY;
            // break;   //FALL THROUGH

            case Step.READY:
                this._stepReady();
                break;

            case Step.READY_WAIT:
                //演出終了トリガー待ち
                break;

            case Step.PLAY:
                this._stepPlay();
                break;

            case Step.CLEAR:
                this._stepClear();
                break;

            case Step.NEXTSTAGE:
                //演出終了トリガー待ち
                break;

            case Step.ALLCLEAR:
                this._stepAllClear();
                break;

            case Step.MISS:
                this._stepMiss();
                break;

            case Step.RESTART:
                //演出終了トリガー待ち
                break;

            case Step.GAMEORVER:
                this._stepGameOver();
                break;

            case Step.TIMEUP:
                this._stepTimeUp();
                break;

            case Step.RESULT:
                //演出終了トリガー待ち
                break;

            case Step.SCOREBOARD:
                this._stepScoreBoard();
                break;

            case Step.RETURNTITLE:
                this._stepReturnTitle();
                break;

            case Step.END:
                break;

            default:
                break;
        }

        if (step !== this.step) {
            Log.put(`SceneMain.update() step change. ${step} -> ${this.step}`);
        }
    }

    getGimicManager(): GimicManager | null {
        return this.gimicManager;
    }

    getTimeMap(): Tilemap | null {
        return this.tilemap;
    }

    getBaseLayerName(): string {
        return this.baseLayerName;
    }
    getTransLayerName(): string {
        return this.transLayerName;
    }

    //プレー開始トリガー
    onPlay(): void {
        //プレー開始待ち状態ならプレー開始状態に遷移させる
        if (this.step === Step.READY_WAIT) {
            this.step = Step.PLAY;
            //タイマー開始
            Globals.get().startTimer(this);
            this.enemySpawnTimer.start();
            //BGM開始
            this._playBgm();
        }
    }

    //リスタートトリガー
    onRestart(): void {
        if (this.step === Step.RESTART) {
            this.step = Step.INIT;
        }
    }

    //次のステージへ
    onNextStage(): void {
        //次のステージへ
        if (this.step === Step.NEXTSTAGE) {
            this.step = Step.END;
            Globals.get().addStage(1);
            this.scene.start('Main');
        }
    }

    //スコアボード表示へ
    onDisplayScoreBoard(): void {
        if (this.step === Step.RESULT) {
            this.step = Step.SCOREBOARD;
        }
    }

    //ゲーム終了へ
    onGameEnd(): void {
        if (this.step === Step.END) {
            //タイトルに戻る
            this.scene.start('Title');
        }
    }


    private _stepInit(): void {
        this.missed = false;
        this.scoreRate = 1;

        this._initPlayer();
        this._initEnemy();
        this._initGimic();
    }

    private _initPlayer(): void {
        //初期位置に戻す
        this.player?.returnSpawnPosition();
    }

    private _initEnemy(): void {
        //生き残っているものを殺す
        for (let i = 0; i < this.enemies.length; i++) {
            if (this.enemies[i].isAlive()) {
                this.enemies[i].kill();
            }
        }

        //配列をクリア
        this.enemies = [];
        this.enemySpawnCount = 0;

        //敵を作り直す
        this._createEnemies();
    }

    private _initGimic(): void {
        this.gimicManager?.clear();
    }

    private _stepReady(): void {
        this.step = Step.READY_WAIT;

        //開始演出を登録
        if (this.behaviorManager) {
            this.behaviorManager.add(new BehaviorStart(this));
        }
        else {
            //behaviorManagerがいなかったら直接呼ぶ
            this.onPlay();
        }
    }

    private _stepPlay(): void {
        this._updateStage();
        this._updatePlayer();
        this._updateEnemies();
        this._updateEffect();
        this._updateCollision();
        this._updateGimics();

        if (this._isCleared()) {
            //全体停止
            this._AllStop();

            const stage = Globals.get().getStage();
            const stageCount = getStageCount();
            if (stage + 1 >= stageCount) {
                //全クリア
                this.step = Step.ALLCLEAR;
            }
            else {
                //クリア
                this.step = Step.CLEAR;
            }
        }
        else if (this._isMissed()) {
            //全体停止
            this._AllStop();
            //SE
            this.sound.play(Assets.Audio.SE.MISS);

            if (Globals.get().getMode() === Consts.Game.Mode.NOMAL) {
                //通常時はミスでライフを減らす
                const life = Globals.get().getLife();
                if (life > 0) {
                    //ライフを減らす
                    Globals.get().setLife(life - 1);
                    this.step = Step.MISS;
                }
                else {
                    this.step = Step.GAMEORVER;
                }
            }
            else {
                // タイムアタック時はライフを減らさない
                this.step = Step.MISS;
            }
        }
        else if (this._isTimeOver()) {
            //全体停止
            this._AllStop();

            this.step = Step.TIMEUP;
        }
    }

    private _stepClear(): void {
        Globals.get().pauseTimer();
        //BGM停止
        this._stopBgm();
        this.step = Step.NEXTSTAGE;

        //クリア演出を登録
        if (this.behaviorManager != null) {
            this.behaviorManager.add(new BehaviorClear(this));
        }
        else {
            //behaviorManagerがいなかったら直接呼ぶ
            this.onNextStage();
        }
    }

    private _stepAllClear(): void {
        Globals.get().pauseTimer();
        //BGM停止
        this._stopBgm();
        this.step = Step.RESULT;

        //全クリア演出を登録
        if (this.behaviorManager != null) {
            if (Globals.get().getMode() === Consts.Game.Mode.NOMAL) {
                this.behaviorManager.add(new BehaviorAllClear(this));
            }
            else {
                this.behaviorManager.add(new BehaviorTimeAttackClear(this));
            }
        }
        else {
            //behaviorManagerがいなかったら直接呼ぶ
            this.onDisplayScoreBoard();
        }
    }

    private _stepMiss(): void {
        Globals.get().pauseTimer();
        //BGM停止
        this._stopBgm();
        this.step = Step.RESTART;

        //全クリア演出を登録
        if (this.behaviorManager != null) {
            this.behaviorManager.add(new BehaviorMiss(this));
        }
        else {
            //behaviorManagerがいなかったら直接呼ぶ
            this.onRestart();
        }
    }

    private _stepGameOver(): void {
        Globals.get().pauseTimer();
        //BGM停止
        this._stopBgm();
        this.step = Step.RESULT;

        //ゲームオーバー演出を登録
        if (this.behaviorManager != null) {
            this.behaviorManager.add(new BehaviorGameOver(this));
        }
        else {
            //behaviorManagerがいなかったら直接呼ぶ
            this.onDisplayScoreBoard();
        }
    }

    private _stepTimeUp(): void {
        Globals.get().pauseTimer();
        //BGM停止
        this._stopBgm();
        this.step = Step.RESULT;

        //ゲームオーバー演出を登録
        if (this.behaviorManager != null) {
            this.behaviorManager.add(new BehaviorTimeup(this));
        }
        else {
            //behaviorManagerがいなかったら直接呼ぶ
            this.onDisplayScoreBoard();
        }
    }

    private _stepScoreBoard(): void {
        this.step = Step.RETURNTITLE;

        //スコアボード表示
        if (this.behaviorManager != null) {
            this.behaviorManager.add(new BehaviorScoreBoard());
        }
    }

    private _stepReturnTitle(): void {
        this.step = Step.END;

        //タイトルに戻る表示
        if (this.behaviorManager != null) {
            this.behaviorManager.add(new BehaviorReturnTile(this));
        }
        else {
            //behaviorManagerがいなかったら直接呼ぶ
            this.onGameEnd();
        }
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

    private _initStage(): void {
        //ステージ設定を取得
        const stageNo = Globals.get().getStage();
        this.stageConfig = getStageConfig(stageNo);

        this.enemySpawnCount = 0;
        this.enemySpawnTimer.reset();

        //ステージ初期化
        this.step = Step.INIT;
        this.scoreRate = 1;
        this.missed = false;
        this.enemies = [];
    }


    private _createBG(): void {
        const x = this.game.canvas.width * 0.5;
        const y = this.game.canvas.height * 0.5;
        this.bg = this.add.image(x, y, Assets.Graphic.GameBGs[0].KEY);
        this.bg.setDepth(Consts.BG.DEPTH);
    }

    private _createTilemap(): void {
        if (this.stageConfig == null) {
            throw new RangeError("_createTilemap");
        }

        const stage = Globals.get().getStage();
        this._validateStage(stage);

        const info = getTilemapConfig(this.stageConfig.key);
        //よく使うのでメンバに取っておく
        this.baseLayerName = info.baseLayer;
        this.transLayerName = info.transLayer;

        const config: TilemapConfig = {
            stage: stage,
            key: info.key,
            tilesetName: info.tileset,
            tilesetKey: Assets.Graphic.Tiles.KEY,
            layers: [
                { layerName: this.baseLayerName, depth: Consts.Map.Base.DEPTH },
                { layerName: this.transLayerName, depth: Consts.Map.Trans.DEPTH },
            ],
        }

        this.tilemap = new Tilemap(this, config);
    }

    //ステージ番号の配置チェック
    private _validateStage(stage: number) {
        const minStage = 0;
        const maxStage = getStageCount();

        if (stage < minStage || stage >= maxStage) {
            throw new RangeError("illegal stage index."
                + " stage=" + stage
                + " " + minStage + " <= range < " + maxStage
                + ".");
        }
    }

    private _createPlayer(): void {
        //初期位置を取得
        const tiles = this._getTilesFromTileLayer(this.baseLayerName, Consts.Tiles.PLAYER_START);
        let position: Coord2 = { x: 0, y: 0 };
        if (tiles.length > 0) {
            const origin: Coord2 = { x: 0.5, y: 0.5 };
            position = Tilemap.convertPostion(tiles[0], origin);
        }

        //プレーヤーを生成
        const config: PlayerConfig = {
            ballConfig: {
                key: Assets.Graphic.Objects.KEY,
                frame: Assets.Graphic.Objects.YELLOW,
                depth: Consts.Player.DEPTH,
                spawnPosition: position,
                bounce: { x: 0.8, y: 0.8 }, //反射係数
            },
            speedValue: 10,  //速度の係数　大きいほど加速力が高い（等速で加速）
            speedMax: 30,  //最大速度
            reduceVerocity: 0.98, //速度の減衰係数
        }
        this.player = new Player(this, config);


        //当たりを設定
        {
            const baseLayer = this.tilemap?.getLayer(this.baseLayerName);
            const transLayer = this.tilemap?.getLayer(this.transLayerName);
            const edge = this.tilemap?.getEdgeColliders();
            const gameObject = this.player.getGameObject();

            if (gameObject != null && baseLayer != null) {
                this.physics.add.collider(gameObject, baseLayer);
            }
            if (gameObject != null && transLayer != null) {
                this.physics.add.collider(gameObject, transLayer);
            }
            if (gameObject != null && edge != null) {
                this.physics.add.collider(gameObject, edge);
            }
        }
    }

    private _createEnemies(): void {

        if (this.step !== Step.INIT && this.step !== Step.PLAY) {
            return; //初期化 or プレー中以外では敵を発生させない。
        }

        //初期位置を取得
        const tiles = this._getTilesFromTileLayer(this.baseLayerName, Consts.Tiles.ENEMY_START);
        let position: Coord2 = { x: 0, y: 0 };
        if (tiles.length > 0) {
            const origin: Coord2 = { x: 0.5, y: 0.5 };
            position = Tilemap.convertPostion(tiles[0], origin);
        }

        //敵を生成
        let spawnStayTime = Consts.Enemy.SPWN_STAY_TIME;
        let respawnStayTime = Consts.Enemy.RESPWN_STAY_TIME;
        if (this.stageConfig != null) {
            spawnStayTime = this.stageConfig.enemy.stayTime;
            respawnStayTime = this.stageConfig.enemy.respawnStayTime;
        }

        const config: EnemyConfig = {
            ballConfig: {
                key: Assets.Graphic.Objects.KEY,
                frame: Assets.Graphic.Objects.RED,
                depth: Consts.Enemy.DEPTH,
                spawnPosition: position,
                bounce: { x: 0.8, y: 0.8 }, //反射係数
            },
            speedValue: 400,        //速度の係数　大きいほど加速力が高い（距離に反比例して加速）
            speedMax: 30,           //最大速度
            reduceVerocity: 0.98,   //速度の減衰係数
            spawnStayTime: spawnStayTime,       //スポーン時の滞在時間
            respawnStayTime: respawnStayTime,   //リスポーン時の滞在時間
        }

        const enemy = new Enemy(this, this.enemySpawnCount, config);

        //当たりを設定
        {
            const baseLayer = this.tilemap?.getLayer(this.baseLayerName);
            const transLayer = this.tilemap?.getLayer(this.transLayerName);
            const edge = this.tilemap?.getEdgeColliders();
            const gameObject = enemy.getGameObject();

            if (gameObject != null && baseLayer != null) {
                this.physics.add.collider(gameObject, baseLayer);
            }
            if (gameObject != null && transLayer != null) {
                this.physics.add.collider(gameObject, transLayer, undefined, this._process_Eney_Tile, this);
            }
            if (gameObject != null && edge != null) {
                this.physics.add.collider(gameObject, edge);
            }
        }

        this.enemies.push(enemy);
        this.enemySpawnCount++;


    }

    private _createEffect(): void {
        const config: EffectConfig = {
            key: Assets.Graphic.Effects.KEY,
            frame: Assets.Graphic.Effects.RING,
            depth: Consts.Effects.Ring.DEPTH,
            duration: Consts.Effects.Ring.DURATION,
            count: Consts.Effects.Ring.COUNT,
            loopDelay: Consts.Effects.Ring.LOOPDELAY,
            span: Consts.Effects.Ring.SPAN,
        };

        this.effect = new EffectRingYellow(this, config);
    }

    private _createGmicManager(): void {
        this.gimicManager = new GimicManager();
    }

    private _createBehaviorManager(): void {
        this.behaviorManager = new BehaviorManager();
    }

    private _createBits(): void {
        const layer = this.tilemap?.getLayer(this.baseLayerName);
        if (layer == null) {
            return;
        }

        const tiles = this._getTilesFromTileLayer(this.baseLayerName, Consts.Tiles.TILE);

        const indices: number[] = [];
        for (let i = 0; i < tiles.length; i++) {
            indices.push(i);
        }
        for (let i = 0; i < tiles.length * 2; i++) {
            const a = Math.floor(Math.random() * tiles.length);
            const b = Math.floor(Math.random() * tiles.length);

            const tmp = indices[a];
            indices[a] = indices[b];
            indices[b] = tmp;
        }

        //最初の4箇所にパワー餌
        let powerBitCount = 0;
        let normalBitCount = 10;
        if (this.stageConfig != null) {
            const bit = this.stageConfig.bit;
            powerBitCount = bit.power.count;
            normalBitCount = bit.normal.count;
        }

        const origin: Coord2 = { x: 0.5, y: 0.5 };
        for (let i = 0; i < powerBitCount; i++) {
            const index = indices[i];
            const tile = tiles[index];
            const pos = Tilemap.convertPostion(tile, origin);

            const powerBit = this.add.image(pos.x, pos.y, Assets.Graphic.Objects.KEY, Assets.Graphic.Objects.POWERBIT);
            powerBit.setDepth(3);
            const is_static = true;
            this.physics.add.existing(powerBit, is_static);
            this.powerBits.push(powerBit);
        }

        //他の場所に通常餌
        const maxBitCount = powerBitCount + normalBitCount;
        const bitCount = Math.min(maxBitCount, indices.length - powerBitCount);
        for (let i = powerBitCount; i < bitCount; i++) {
            const index = indices[i];
            const tile = tiles[index];
            const pos = Tilemap.convertPostion(tile, origin);

            const bit = this.add.image(pos.x, pos.y, Assets.Graphic.Objects.KEY, Assets.Graphic.Objects.BIT);
            bit.setDepth(3);
            const is_static = true;
            this.physics.add.existing(bit, is_static);
            this.bits.push(bit);
        }
    }

    private _createSound(): void {

        this.bgmName = Assets.Audio.BGMs[0].KEY;
        if (this.stageConfig != null) {
            this.bgmName = this.stageConfig.bgm;
        }
        this.bgm = this.sound.add(this.bgmName);
    }

    private _playBgm(): void {
        this._stopBgm();
        if (this.bgm != null) {
            this.bgm.play({ loop: true });
        }
    }
    private _stopBgm(): void {
        if (this.bgm != null) {
            this.bgm.stop();
        }
    }

    private _createInterface(): void {
        this._createScore();
        this._createLives();
        this._createStage();
        this._createTimerGuage();
        this._createShade();
    }

    private _createScore(): void {
        const config: uiScoreConfig = {
            text: {
                position: { x: Consts.UI.Score.Text.Position.x, y: Consts.UI.Score.Text.Position.y },
                origin: { x: Consts.UI.Score.Text.Origin.x, y: Consts.UI.Score.Text.Origin.y },
                depth: Consts.UI.Score.Text.DEPTH,
            },
        }
        this.score = new uiScore(this, config);
    }

    private _createLives(): void {
        if (Globals.get().getMode() === Consts.Game.Mode.TIMEATTACK) {
            this.lives = null;
            return; //タイムアタックモードのときは表示しない
        }

        const config: uiLivesConfig = {
            ball: {
                position: { x: Consts.UI.Lives.Ball.Position.x, y: Consts.UI.Lives.Ball.Position.y },
                origin: { x: Consts.UI.Lives.Ball.Origin.x, y: Consts.UI.Lives.Ball.Origin.y },
                scale: { x: Consts.UI.Lives.Ball.Scale.x, y: Consts.UI.Lives.Ball.Scale.y },
                depth: Consts.UI.Lives.Ball.DEPTH,
            },
            text: {
                position: { x: Consts.UI.Lives.Text.Position.x, y: Consts.UI.Lives.Text.Position.y },
                origin: { x: Consts.UI.Lives.Text.Origin.x, y: Consts.UI.Lives.Text.Origin.y },
                depth: Consts.UI.Lives.Text.DEPTH,
            },
        }
        this.lives = new uiLives(this, config);
    }

    private _createStage(): void {
        const config: uiStageConfig = {
            text: {
                position: { x: Consts.UI.Stage.Text.Position.x, y: Consts.UI.Stage.Text.Position.y },
                origin: { x: Consts.UI.Stage.Text.Origin.x, y: Consts.UI.Stage.Text.Origin.y },
                depth: Consts.UI.Stage.Text.DEPTH,
            },
        }
        this.stage = new uiStage(this, config);
    }

    private _createTimerGuage(): void {
        if (Globals.get().getMode() === Consts.Game.Mode.NOMAL) {
            this.timerGuage = null;
            return; //通常モードのときは表示しない
        }

        const config: uiTimerGuageConfig = {
            frame: {
                key: Assets.Graphic.UIs.KEY,
                frame: Assets.Graphic.UIs.GUAGE_FRAME,
                position: { x: Consts.UI.TimerGuage.Frame.Position.x, y: Consts.UI.TimerGuage.Frame.Position.y },
                origin: { x: Consts.UI.TimerGuage.Frame.Origin.x, y: Consts.UI.TimerGuage.Frame.Origin.y },
                depth: Consts.UI.TimerGuage.Frame.DEPTH,
            },
            guage: {
                position: { x: Consts.UI.TimerGuage.Guage.Position.x, y: Consts.UI.TimerGuage.Guage.Position.y },
                size: { x: Consts.UI.TimerGuage.Guage.Size.x, y: Consts.UI.TimerGuage.Guage.Size.y },
                origin: { x: Consts.UI.TimerGuage.Guage.Origin.x, y: Consts.UI.TimerGuage.Guage.Origin.y },
                depth: Consts.UI.TimerGuage.Guage.DEPTH,
            },
        }
        this.timerGuage = new uiTimerGuage(this, config);
    }

    private _createShade(): void {
        const config: uiShadeConfig = {
            shade: {
                key: Assets.Graphic.UIs.KEY,
                frame: Assets.Graphic.UIs.SHADE,
                position: { x: Consts.UI.Shade.Position.x, y: Consts.UI.Shade.Position.y },
                scale: { x: Consts.UI.Shade.Scale.x, y: Consts.UI.Shade.Scale.y },
                origin: { x: Consts.UI.Shade.Origin.x, y: Consts.UI.Shade.Origin.y },
                depth: Consts.UI.Shade.DEPTH,
            },
        }
        this.shade = new uiShade(this, config);
    }

    private _createDebug(): void {
        // this.debugClear = false;
        // this.keyClear = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ZERO);
        // //イベント登録
        // this.keyClear.on(Phaser.Input.Keyboard.Events.UP, () => {
        //     //キーおされたらクリアしたことにする
        //     this.debugClear = true;
        // }, this);
    }


    //指定したタイルをタイルマップレイヤーから取得する
    private _getTilesFromTileLayer(layerName: string, target: number): Phaser.Tilemaps.Tile[] {

        if (this.tilemap == null) {
            return [];
        }

        const tiles = this.tilemap.getTilesFromTileLayer(layerName, target);
        return tiles;
    }



    private _updateStage(): void {
        //時間を見て敵を発生させる
        if (this.stageConfig != null) {
            const enemy = this.stageConfig.enemy;
            if (this.enemySpawnCount < enemy.count &&
                this.enemySpawnCount < enemy.spawnTime.length) {

                const stageTime = this.enemySpawnTimer.get();
                if (stageTime > enemy.spawnTime[this.enemySpawnCount]) {
                    this._createEnemies();
                }
            }
        }
    }

    private _updatePlayer(): void {
        const pointer = this._getPointer();
        this.player?.updateVerocity(pointer.position, pointer.isDown);

        if (!this._checkPlayerInsideMap(this.baseLayerName)) {
            //外に落ちた
            this.missed = true;
        }
    }

    private _checkPlayerInsideMap(layerName: string): boolean {
        const position = this.player?.getPosition();
        if (position == null) {
            return false;
        }

        if (this.tilemap?.isInside(layerName, position)) {
            return true;
        }
        else {
            return false;
        }
    }

    private _updateEnemies(): void {
        let move: boolean = false;
        let target: Coord2 = { x: 0, y: 0 };

        if (this.player != null) {
            move = true;
            target = this.player.getPosition();
        }

        for (let i = 0; i < this.enemies.length; i++) {
            if (this.enemies[i].isAlive()) {
                this.enemies[i].updateVerocity(target, move);
                this.enemies[i].update();
            }
        }
    }

    private _updateEffect(): void {
        const pointer = this._getPointer();

        if (pointer.isDown) {
            this.effect?.setPosition(pointer.position.x, pointer.position.y);
            this.effect?.setVisible(true);
        }
        else {
            this.effect?.setVisible(false);
        }
    }

    private _updateGimics(): void {
        this.gimicManager?.update();
    }

    private _updateInterface(): void {
        this._updateScore();
        this._updateLives();
        this._updateTimerGuage();
    }

    private _updateBehaviorManager(): void {
        this.behaviorManager?.update();
    }

    private _updateScore(): void {
        this.score?.update();
    }

    private _updateLives(): void {
        this.lives?.update();
    }

    private _updateTimerGuage(): void {
        this.timerGuage?.update();
    }

    private _updateCollision(): void {
        const player = this.player?.getGameObject();
        //プレーヤーと敵の当たり判定
        if (player != null) {
            for (let i = 0; i < this.enemies.length; i++) {
                if (this.enemies[i].isCollisonForPlayer()) {
                    const enemy = this.enemies[i].getGameObject();
                    this.physics.world.overlap(player, enemy, this._hit_Player_Enemy, undefined, this);
                }
            }
        }

        //プレーヤーのBit獲得判定
        if (player != null) {
            this.physics.world.overlap(player, this.bits, this._hit_Player_Bits, undefined, this);
            this.physics.world.overlap(player, this.powerBits, this._hit_Player_PowerBits, undefined, this);
        }

        //敵同士の当たり判定（数が可変なので毎フレcolliderを呼ぶ）
        for (let i = 0; i < this.enemies.length; i++) {
            if (!this.enemies[i].isCollisonForEnemy()) {
                continue;
            }

            for (let j = 0; j < this.enemies.length; j++) {
                if (i === j) { continue; }
                if (!this.enemies[j].isCollisonForEnemy()) {
                    continue;
                }

                const enemyA = this.enemies[i].getGameObject();
                const enemyB = this.enemies[j].getGameObject();

                this.physics.add.collider(enemyA, enemyB);
            }
        }
    }

    private _hit_Player_Enemy(player: Phaser.GameObjects.GameObject, enemy: Phaser.GameObjects.GameObject) {
        if (this.gimicManager?.isActive(Consts.Gimics.Type.REVERSE)) {
            const id: number = enemy.getData('id');
            if (id == null) {
                return;
            }
            //敵を検索
            for (let i = 0; i < this.enemies.length; i++) {
                if (!this.enemies[i].isCollisonForPlayer()) {
                    continue;   //プレーヤーと当たりを取らない
                }

                if (id === this.enemies[i].getID()) {
                    if (this.enemies[i].getStat() === Consts.Enemy.Stat.ESCAPE) {
                        //パワーアップ状態で逃げ状態の敵にあたったら敵を倒せる
                        //スポーン位置に戻す
                        this.enemies[i].returnSpawnPosition();
                        //スコア加算
                        this._addScore(Consts.Enemy.SCORE, this.scoreRate);
                        //@@@const score = Consts.Enemy.SCORE * this.scoreRate;
                        //@@@Globals.get().addScore(score);
                        //打撃音
                        this.sound.play(Assets.Audio.SE.ATACK);
                        //スコア倍率を加算
                        this.scoreRate += 1;
                    }
                    else if (this.enemies[i].getStat() === Consts.Enemy.Stat.NORMAL) {
                        //敵が通常ならこちらがやられる
                        this.missed = true;
                    }
                    break;
                }
            }
        }
        else {
            this.missed = true;
        }
    }

    private _hit_Enemy_Goal(enemy: Phaser.GameObjects.GameObject, tile: Phaser.GameObjects.GameObject) {
        //Phaser.GameObjects.GameObject から Phaser.Tilemaps.Tile に直接キャストできないので unknown を噛ませる必要がある。
        const tmp = tile as unknown;
        const goal = tmp as Phaser.Tilemaps.Tile;

        //タイルを置き換える
        this.tilemap?.replace(this.baseLayerName, goal.x, goal.y, Consts.Tiles.TILE);

        //敵を消去する
        const id: number = enemy.getData('id');
        if (id != null) {
            for (let i = 0; i < this.enemies.length; i++) {
                if (!this.enemies[i].isAlive()) {
                    continue;
                }
                if (id === this.enemies[i].getID()) {
                    this.enemies[i].kill();
                }
            }
        }
    }

    private _hit_Player_Gimics(player: Phaser.GameObjects.GameObject, tile: Phaser.GameObjects.GameObject) {
        const tmp = tile as unknown;
        const gimic = tmp as Phaser.Tilemaps.Tile;

        switch (gimic.index) {
            case Consts.Tiles.REVERSE: {
                //プレーヤーにリバース発動
                if (this.player != null) {
                    this._startReverseGimic(this.player);
                }
                break;
            }
        }
    }

    private _hit_Player_Bits(player: Phaser.GameObjects.GameObject, bit: Phaser.GameObjects.GameObject): void {
        bit.destroy();

        //SE
        this.sound.play(Assets.Audio.SE.BIT);

        //スコア加算
        this._addScore(Consts.Bit.Small.SCORE, 1);
        //@@@const score = Consts.Bit.Small.SCORE;
        //@@@Globals.get().addScore(score);
    }

    private _hit_Player_PowerBits(player: Phaser.GameObjects.GameObject, powerBit: Phaser.GameObjects.GameObject): void {
        powerBit.destroy();

        //SE
        this.sound.play(Assets.Audio.SE.BIT);
        this.sound.play(Assets.Audio.SE.POWERBIT);

        if (this.player != null) {
            this._startReverseGimic(this.player);

            //スコア加算
            this._addScore(Consts.Bit.Power.SCORE, 1);
            //@@@const score = Consts.Bit.Power.SCORE;
            //@@@Globals.get().addScore(score);
        }
    }

    private _process_Eney_Tile(enemy: Phaser.GameObjects.GameObject, tile: Phaser.GameObjects.GameObject): boolean {
        const tmp = tile as unknown;
        const curTile = tmp as Phaser.Tilemaps.Tile;

        const id: number = enemy.getData('id');
        const curEnemy = this._getEnemy(id);
        if (curEnemy != null) {
            const stat = curEnemy.getStat();
            //敵の状態がOUTのとき...
            if (stat === Consts.Enemy.Stat.OUT) {
                //タイルがTRANS_WALLの場合...
                if (curTile.index === Consts.Tiles.TRANS_WALL) {
                    return false;    //通行可能
                }
            }
        }
        return true;
    }

    private _addScore(base: number, rate: number): void {
        const score = base * rate;
        if (this.player != null) {
            const pos = this.player.getPosition();
            const offs: Coord2 = { x: 0, y: -10 };
            //スコアテキスト
            const textStyle: Phaser.Types.GameObjects.Text.TextStyle = {
                font: "18px Arial",
                color: "#FFFFFF"
            }

            const x = pos.x + offs.x;
            const y = pos.y + offs.y;
            const text = this.add.text(x, y, `+${score}`, textStyle);
            text.setDepth(10);

            //スケール
            let scale = 1;
            switch (rate) {
                case 3: scale = 1.2; break;
                case 4: scale = 1.3; break;
                case 5: scale = 1.5; break;
            }
            text.setScale(scale);

            //色
            let color = "#FFFFFF";
            switch (rate) {
                case 2: color = "#ffffe0"; break;
                case 3: color = "#ffd700"; break;
                case 4: color = "#ffa500"; break;
                case 5: color = "#ff4500"; break;
            }
            text.setColor(color);

            const tween = this.tweens.add({
                targets: text,
                duration: 500,
                props: {
                    y: { from: y, to: y - 5 },
                },
                onComplete: () => {
                    text.destroy();
                },
                onCompleteScope: this,
            });
        }
        Globals.get().addScore(score);
    }

    private _startReverseGimic(ball: Ball) {
        if (this.gimicManager == null) {
            return; //nullなら何もしない
        }
        if (this.gimicManager.isActive(Consts.Gimics.Type.REVERSE)) {
            //すでに発動中ならリチャージ
            const gimic = this.gimicManager.get(Consts.Gimics.Type.REVERSE);
            if (gimic != null) {
                gimic.rechargeGimic();
            }
            return;
        }

        let gimicDelay = 10000;
        if (this.stageConfig != null) {
            const reverseGimic = this.stageConfig.gimic.reverse;
            gimicDelay = reverseGimic.duration;
        }

        const config: gimicReverseConfig = {
            gimic: {
                type: Consts.Gimics.Type.REVERSE,
                manager: this.gimicManager,
            },
            effect: {
                key: Assets.Graphic.Effects.KEY,
                frame: Assets.Graphic.Effects.RING_R,
                depth: Consts.Effects.Ring_r.DEPTH,
                duration: Consts.Effects.Ring_r.DURATION,
                count: Consts.Effects.Ring_r.COUNT,
                loopDelay: Consts.Effects.Ring_r.LOOPDELAY,
                span: Consts.Effects.Ring_r.SPAN,
            },
            delay: gimicDelay,
        }
        const reverse = new gimicReverse(this, ball, config);
        this.gimicManager?.add(reverse);
    }

    private _getPointer(): { isDown: boolean, position: Coord2 } {
        const pointer = this.input.mousePointer;

        //スクリーン範囲内でボタン押下されているかどうか
        let isDown = false;
        if (pointer.isDown) {
            if (pointer.x >= 0 && pointer.x < this.game.canvas.width && pointer.y >= 0 && pointer.y < this.game.canvas.height) {
                isDown = true;
            }
        }

        return { isDown: isDown, position: { x: pointer.x, y: pointer.y } };
    }

    private _isMissed(): boolean {
        return this.missed;
    }

    private _isCleared(): boolean {
        let remainBits = 0;
        for (let i = 0; i < this.bits.length; i++) {
            if (this.bits[i].active) {
                remainBits++;
            }
        }

        if (remainBits === 0) {
            return true;
        }
        else {
            if (this.debugClear) {
                return true;    //デバッグクリアフラグが立っていればクリアしたことにする
            }
            return false;
        }
    }

    private _isTimeOver(): boolean {
        if (Globals.get().getMode() === Consts.Game.Mode.TIMEATTACK) {
            //タイムアタックのときだけ判定する
            const timerRemain = Globals.get().getRemamin();
            if (timerRemain > 0) {
                return false;
            }
            else {
                return true;
            }
        }
        else {
            return false;
        }
    }

    private _AllStop(): void {
        const zero: Coord2 = { x: 0, y: 0 };
        //プレーヤー
        this.player?.setVelocity(zero);

        //エネミー
        for (let i = 0; i < this.enemies.length; i++) {
            if (this.enemies[i].isAlive()) {
                this.enemies[i].setVelocity(zero);
            }
        }

        //エフェクト
        this.effect?.setVisible(false);
    }

    private _getEnemy(id: number | null): Enemy | null {
        if (id != null) {
            for (let i = 0; i < this.enemies.length; i++) {
                if (!this.enemies[i].isAlive()) {
                    continue;
                }
                if (id === this.enemies[i].getID()) {
                    return this.enemies[i];
                }
            }
        }
        return null;
    }

}