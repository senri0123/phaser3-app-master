import { Consts } from "../../consts";

export type uiGridConfig = {
    x: number,
    y: number,
    w: number;
    h: number;
    cell_w: number,
    cell_h: number,
    lineWidth: number;
    color: number;
}

export class uiGrid {
    private scene: Phaser.Scene;
    private config: uiGridConfig;
    private grid: Phaser.GameObjects.Graphics;

    constructor(scene: Phaser.Scene, config: uiGridConfig) {
        this.scene = scene;
        this.config = config;
        this.grid = this.scene.add.graphics();

        this._initGrid();
    }


    private _initGrid() {
        const orig_x = this.config.x;
        const orig_y = this.config.y;
        const w = this.config.w;
        const h = this.config.h;

        this.grid = this.scene.add.graphics();
        this.grid.lineStyle(this.config.lineWidth, this.config.color);
        this.grid.setDepth(Consts.Grid.DEPTH);

        //縦に線を引く
        for (let x = 0; x <= this.config.w; x += this.config.cell_w) {
            const x1 = orig_x + x;
            const y1 = orig_y;
            const x2 = x1;
            const y2 = y1 + h;
            this.grid.lineBetween(x1, y1, x2, y2);
        }
        //横に線を引く
        for (let y = 0; y <= this.config.w; y += this.config.cell_h) {
            const x1 = orig_x;
            const y1 = orig_y + y;
            const x2 = x1 + w;
            const y2 = y1;
            this.grid.lineBetween(x1, y1, x2, y2);
        }
    }
}