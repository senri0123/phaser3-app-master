import { Consts } from "../consts";
import { EffectConfig } from "../objects/effect/effect-ring";
import { EffectRingYellow } from "../objects/effect/effect-ring_y";

export class SceneTest extends Phaser.Scene {

    private timer: Phaser.Time.TimerEvent | null;
    private text: Phaser.GameObjects.Text | null;

    constructor() {
        super({ key: "Test" });
        this.timer = null;
        this.text = null;
    }

    preload(): void {
    }

    create(): void {
        this.timer = this.time.addEvent({ delay: 10000 });

        const style: Phaser.Types.GameObjects.Text.TextStyle = {
            font: "18px Arial",
            color: "#000000"
        };
        this.text = this.add.text(10, 10, '', style);
        this.text.setInteractive();
        this.text.on('pointerdown', () => {
            if (this.timer != null) {
                this.timer.remove();
            }
            this.timer = this.time.addEvent({
                delay: 10000, callback: () => {
                    console.log('timer end.');
                },
                callbackScope: this
            });
        })
    }

    update(): void {
        if (this.text != null && this.timer != null) {
            const elapsed = Math.round(this.timer.getElapsed());
            const progress = Math.round(this.timer.getProgress() * 10000);
            const remain = Math.round(this.timer.getRemaining());
            this.text.setText(`remain:${remain} erapsed:${elapsed} progress:${progress}`);
        }
    }


}