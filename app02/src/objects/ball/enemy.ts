import { Ball, BallConfig } from "./ball";
import { Coord2 } from "../../types";
import { getVector, normalizeVector, lengthBetweenPoint } from "../../service/vector2";
import { SceneMain } from "../../scene/scene-main";
import { Assets, Consts } from "../../consts";

export type EnemyConfig = {
    ballConfig: BallConfig
    speedValue: number;
    speedMax: number;
    reduceVerocity: number;
    spawnStayTime: number;
    respawnStayTime: number;
}

export class Enemy extends Ball {

    private config: EnemyConfig;
    private stat: number;
    private id: number;
    private alreadyEscaped: boolean;

    constructor(scene: SceneMain, id: number, config: EnemyConfig) {
        super(scene, config.ballConfig);
        this.config = config;
        this.stat = Consts.Enemy.Stat.OUT;
        this.id = id;
        this.alreadyEscaped = false;

        this.ball.setData('id', id);

        this._spawn(this.config.spawnStayTime);
    }

    update(): void {
        this._updateStat();
    }

    getID(): number {
        const id = this.ball.getData('id');
        if (id != null) {
            return id;
        }
        else {
            return -1;
        }
    }

    getStat(): number {
        return this.stat;
    }

    updateVerocity(target: Coord2, move: boolean): void {

        if (move) {
            //targetに向かって移動する
            const current = { x: this.ball.x, y: this.ball.y };

            const vector = getVector(current, target);
            const norm = normalizeVector(vector);
            const length = lengthBetweenPoint(current, target);

            if (length !== 0) {
                //目標位置と自身の距離に反比例して速度を決める。
                const speed = Math.min(this.config.speedValue / length, this.config.speedMax);
                //目標位置と自身の距離に比例して速度を決める。
                // const speed = Math.min(length * 0.25, this.ballSpeedMax);
                // 等速
                // const speed = Math.min(this.config.speedValue, this.config.speedMax);

                //Escape状態のときベクトルを反転させる
                if (this._isEscape()) {
                    norm.x = -norm.x;
                    norm.y = -norm.y;
                }

                //進みたいベクトルを算出
                const tempX = norm.x * speed;
                const tempY = norm.y * speed;

                //現在のベクトルと合成
                const velocityX = this.ball.body.velocity.x + tempX;
                const velocityY = this.ball.body.velocity.y + tempY;

                this.setVelocity({ x: velocityX, y: velocityY });
            }
        }

        //現在のベクトルを減衰させる
        const velocityX = this.ball.body.velocity.x * this.config.reduceVerocity;
        const velocityY = this.ball.body.velocity.y * this.config.reduceVerocity;

        this.setVelocity({ x: velocityX, y: velocityY });
    }

    returnSpawnPosition(): void {
        this._spawn(this.config.respawnStayTime);
    }

    isThroughTransWall(): boolean {
        switch (this.stat) {
            case Consts.Enemy.Stat.OUT: return true;
        }
        return false;
    }

    //プレーヤーとの当たりを取るかどうか
    isCollisonForPlayer(): boolean {
        if (this.isAlive()) {
            switch (this.stat) {
                case Consts.Enemy.Stat.NONE:
                case Consts.Enemy.Stat.STAY:
                case Consts.Enemy.Stat.OUT:
                    return false;   //取らない
            }
            return true;    //上記以外は取る
        }
        else {
            return false;
        }
    }

    //敵同士の当たりを取るかどうか
    isCollisonForEnemy(): boolean {
        switch (this.stat) {
            case Consts.Enemy.Stat.NONE:
            case Consts.Enemy.Stat.STAY:
            case Consts.Enemy.Stat.OUT:
                return false;   //取らない
        }
        return true;    //上記以外は取る
    }


    private _spawn(stayTime: number): void {
        super.returnSpawnPosition();

        this._setStat(Consts.Enemy.Stat.STAY);

        this.scene.time.addEvent({
            delay: stayTime, callback: () => {
                this._setStat(Consts.Enemy.Stat.OUT);
            }, callbackScope: this
        });
    }

    private _isReverseActive(): boolean {
        const gimicManager = this.scene.getGimicManager();
        if (gimicManager) {
            return gimicManager.isActive(Consts.Gimics.Type.REVERSE);
        }
        return false;
    }

    private _isEscape(): boolean {
        return (this.stat === Consts.Enemy.Stat.ESCAPE)
    }

    private _updateStat(): void {
        switch (this.stat) {
            case Consts.Enemy.Stat.OUT: {
                if (this._checkCurrentTile(Consts.Tiles.TILE)) {
                    this._setStat(Consts.Enemy.Stat.NORMAL);
                }
                break;
            }
            case Consts.Enemy.Stat.NORMAL: {
                if (this._isReverseActive()) {
                    //リバースギミック発動中
                    if (!this.alreadyEscaped) {
                        //まだEscape状態になっていない場合はEscape状態へ遷移
                        this.alreadyEscaped = true;
                        this._setStat(Consts.Enemy.Stat.ESCAPE);
                    }
                }
                else {
                    //Escape遷移済みフラグをリセット
                    this.alreadyEscaped = false;
                }
                break;
            }
            case Consts.Enemy.Stat.ESCAPE: {
                if (this._isReverseActive()) {
                }
                else {
                    //Escape遷移済みフラグをリセット
                    this.alreadyEscaped = false;
                    //通常状態に戻る
                    this._setStat(Consts.Enemy.Stat.NORMAL);
                }
                break;
            }
        }
    }

    private _setStat(stat: number): void {
        if (this.stat === stat) {
            return; //同じstatなので何もしない
        }

        this.stat = stat;


        if (this.stat === Consts.Enemy.Stat.ESCAPE) {
            this.ball.setFrame(Assets.Graphic.Objects.BLUE);
        }
        else {
            this.ball.setFrame(Assets.Graphic.Objects.RED);
        }

        if (this.stat === Consts.Enemy.Stat.STAY || this.stat === Consts.Enemy.Stat.OUT) {
            this.ball.setAlpha(0.5);
        }
        else {
            this.ball.setAlpha(1.0);
        }



        switch (this.stat) {
            case Consts.Enemy.Stat.NORMAL: {
                break;
            }

            case Consts.Enemy.Stat.ESCAPE: {
                break;
            }

            case Consts.Enemy.Stat.STAY: {
                break;
            }

            case Consts.Enemy.Stat.OUT: {
                break;
            }

            case Consts.Enemy.Stat.POWERUP: {
                break;
            }

            default:
                break;
        }
    }

    private _checkCurrentTile(index: number): boolean {
        const tile = this._getCurrentTile();
        if (tile) {
            if (tile.index == index) {
                return true;
            }
        }
        return false;
    }

    private _getCurrentTile(): Phaser.Tilemaps.Tile | null {
        const tileMap = this.scene.getTimeMap();
        const baseLayerName = this.scene.getBaseLayerName();
        const transLayerName = this.scene.getTransLayerName();
        const position = this.getPosition();

        if (tileMap) {
            //まずbaseからチェック
            let layer = tileMap.getLayer(baseLayerName);
            let tile = layer?.getTileAtWorldXY(position.x, position.y);
            if (tile) {
                return tile;
            }
            else {
                //タイルが見つからなければtransをチェック
                layer = tileMap.getLayer(transLayerName);
                tile = layer?.getTileAtWorldXY(position.x, position.y);
                if (tile) {
                    return tile;
                }
            }
        }
        return null;
    }
}