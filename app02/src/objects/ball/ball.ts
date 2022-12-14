
import { SceneMain } from "../../scene/scene-main";
import { Coord2 } from "../../types";

export type BallConfig = {
    key: string;
    frame: string;

    depth: number;
    bounce: Coord2;
    spawnPosition: Coord2;
}

export class Ball {

    protected scene: SceneMain;
    protected ballConfig: BallConfig;
    protected ball: Phaser.GameObjects.Image;
    protected alive: boolean;

    constructor(scene: SceneMain, config: BallConfig) {
        this.scene = scene;
        this.ballConfig = config;

        this.ball = scene.add.image(config.spawnPosition.x, config.spawnPosition.y, config.key, config.frame);
        this.ball.setDepth(config.depth);
        //物理を有効にする
        const is_static = false;
        scene.physics.add.existing(this.ball, is_static);
        {
            let ballBody = this.ball.body as Phaser.Physics.Arcade.Body;
            ballBody.setVelocity(0, 0);                                 //加速度
            ballBody.setAllowGravity(false);                            //重力の影響を受けない
            ballBody.setBounce(config.bounce.x, config.bounce.y);       //反射係数
            const radius = this.ball.width * 0.5;
            ballBody.setCircle(radius);                                 //円当たりを使用する。
        }

        this.alive = true;
    }

    update(): void {
    }

    setPosition(pos: Coord2): void {
        if (this.alive) {
            this.ball.setPosition(pos.x, pos.y);
        }
    }

    getPosition(): Coord2 {
        const x = this.ball.body.position.x + (this.ball.originX * this.ball.width);
        const y = this.ball.body.position.y + (this.ball.originY * this.ball.height);
        return { x: x, y: y };
    }

    returnSpawnPosition(): void {
        this.setPosition(this.ballConfig.spawnPosition);
        this.setVelocity({ x: 0, y: 0 });
    }

    setVelocity(vec: Coord2): void {
        if (this.alive) {
            this.ball.body.velocity.x = vec.x;
            this.ball.body.velocity.y = vec.y;
        }
    }

    getGameObject(): Phaser.GameObjects.GameObject {
        return this.ball;
    }

    kill(): void {
        if (this.alive) {
            this.ball.destroy();
            this.alive = false;
        }
    }

    isAlive(): boolean {
        return this.alive;
    }

}