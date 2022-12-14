
import { Consts } from "../../consts";
import { Coord2 } from "../../types";

export type TilemapConfig = {
    stage: number;

    key: string;
    tilesetName: string;
    tilesetKey: string;
    layers: {
        layerName: string,
        depth: number,
    }[],
    //layerName: string;
}

export class Tilemap {

    private scene: Phaser.Scene;
    private config: TilemapConfig;
    private tilemap: Phaser.Tilemaps.Tilemap;
    private tileset: Phaser.Tilemaps.Tileset;
    private layers: Map<string, Phaser.Tilemaps.TilemapLayer>;

    private edge: Phaser.GameObjects.Rectangle[];

    constructor(scene: Phaser.Scene, config: TilemapConfig) {
        this.scene = scene;
        this.config = config;

        //タイルマップ作成
        const stage = config.stage;
        const tilemapKey = config.key;
        this.tilemap = scene.make.tilemap({ key: tilemapKey });
        //タイルセットを反映させる
        this.tileset = this.tilemap.addTilesetImage(config.tilesetName, config.tilesetKey);

        //ステージのレイヤーを作成
        this.layers = new Map<string, Phaser.Tilemaps.TilemapLayer>();
        for (let i = 0; i < config.layers.length; i++) {
            const layerName = config.layers[i].layerName;
            const layerDepth = config.layers[i].depth;
            const layer = this.tilemap.createLayer(layerName, this.tileset);

            //setOrigin は反映されない。必ず右上が原点になる
            const posX = (scene.game.canvas.width - layer.width) * 0.5;
            const posY = (scene.game.canvas.height - layer.height) * 0.5;
            layer.setPosition(posX, posY);
            layer.setDepth(layerDepth);
            //当たり追加
            layer.setCollision([Consts.Tiles.WALL, Consts.Tiles.OBSTACLE, Consts.Tiles.TRANS_WALL]);

            this.layers.set(layerName, layer);
        }

        //タイルマップ端の当たり判定用オブジェクト
        this.edge = [];
        // this._createEdgeCollision();
    }

    update(): void {

    }

    getLayer(layerName: string): Phaser.Tilemaps.TilemapLayer | null {
        const layer = this.layers.get(layerName);
        if (layer != null) {
            return layer;
        }
        else {
            return null;
        }
    }

    replace(layerName: string, x: number, y: number, kind: number) {
        const layer = this.getLayer(layerName);
        if (layer != null) {
            layer.removeTileAt(x, y);
            layer.putTileAt(kind, x, y);
        }
    }

    isInside(layerName: string, position: Coord2): boolean {
        const layer = this.getLayer(layerName);
        if (layer != null) {

            if (position.x < layer.x) { return false; }
            if (position.x >= layer.x + layer.width) { return false; }
            if (position.y < layer.y) { return false; }
            if (position.y >= layer.y + layer.height) { return false; }
            return true;
        }
        else {
            return false;
        }
    }

    getEdgeColliders(): Phaser.GameObjects.Rectangle[] {
        return this.edge;
    }

    //指定したタイルをタイルマップレイヤーから取得する
    getTilesFromTileLayer(layerName: string, target: number): Phaser.Tilemaps.Tile[] {
        const layer = this.getLayer(layerName);
        if (layer != null) {
            const tiles = layer.filterTiles((tile: Phaser.Tilemaps.Tile) => {
                return (tile.index === target);
            })

            return tiles;
        }
        else {
            return [];
        }
    }

    private _createEdgeCollision(): void {
        const edgeWidth = 10;
        if (this.config.layers.length === 0) {
            return;
        }
        const layer = this.getLayer(this.config.layers[0].layerName);
        if (layer == null) {
            return;
        }
        const posX = (this.scene.game.canvas.width - layer.width) * 0.5;
        const posY = (this.scene.game.canvas.height - layer.height) * 0.5;

        const posSize: { x: number, y: number, w: number, h: number }[] = [
            { x: (posX - edgeWidth), y: (posY - edgeWidth), w: (layer.width + (edgeWidth * 2)), h: edgeWidth },
            { x: (posX - edgeWidth), y: (posY + layer.height), w: (layer.width + (edgeWidth * 2)), h: edgeWidth },
            { x: (posX - edgeWidth), y: (posY - edgeWidth), w: edgeWidth, h: (layer.height + (edgeWidth * 2)) },
            { x: (posX + layer.width), y: (posY - edgeWidth), w: edgeWidth, h: (layer.height + (edgeWidth * 2)) },
        ];

        for (let i = 0; i < posSize.length; i++) {
            const rect = this.scene.add.rectangle(posSize[i].x, posSize[i].y, posSize[i].w, posSize[i].h, 0, 0);
            rect.setOrigin(0, 0);
            rect.setDepth(Consts.Map.Base.DEPTH);
            const is_static = true;
            this.scene.physics.add.existing(rect, is_static);
            this.edge.push(rect);
        }
    }

    //static
    static convertPostion(tile: Phaser.Tilemaps.Tile, origin: Coord2): Coord2 {
        //タイル位置のスクリーン座標を取得
        const worldX = tile.tilemapLayer.tileToWorldX(tile.x);
        const worldY = tile.tilemapLayer.tileToWorldY(tile.y);
        //タイルの中央座標に調整
        const posX = worldX + tile.width * origin.x;
        const posY = worldY + tile.height * origin.y;

        return { x: posX, y: posY };
    }
}