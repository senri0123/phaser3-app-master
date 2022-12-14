import { Assets, Consts } from "../../consts";
import { Globals } from "../../globals";

export type StageConfig = {
    key: string,
    bgm: string,

    // bit関連
    bit: {
        normal: {
            count: number,
        },
        power: {
            count: number,
        }
    },

    // 敵関連
    enemy: {
        count: number,
        spawnTime: number[],
        stayTime: number,
        respawnStayTime: number,
    },

    // ギミック関連
    gimic: {
        reverse: {
            duration: number,
        },
    },
}

export type TileMapConfig = {
    key: string,
    tileset: string,
    baseLayer: string,
    transLayer: string,
}

const STAGES: StageConfig[] = [
    //stage1
    {
        key: 'stage02',
        bgm: Assets.Audio.BGM.BGM01,
        bit: {
            normal: { count: 10 },
            power: { count: 1 },
        },
        enemy: {
            count: 1,
            spawnTime: [0],
            stayTime: 1000,
            respawnStayTime: 5000,
        },
        gimic: {
            reverse: { duration: 10000 },
        },
    },
    //stage2
    {
        key: 'stage03',
        bgm: Assets.Audio.BGM.BGM01,
        bit: {
            normal: { count: 15 },
            power: { count: 2 },
        },
        enemy: {
            count: 2,
            spawnTime: [0, 20000],
            stayTime: 1000,
            respawnStayTime: 5000,
        },
        gimic: {
            reverse: { duration: 10000 },
        },
    },
    //stage3
    {
        key: 'stage04',
        bgm: Assets.Audio.BGM.BGM02,
        bit: {
            normal: { count: 15 },
            power: { count: 2 },
        },
        enemy: {
            count: 2,
            spawnTime: [0, 20000],
            stayTime: 1000,
            respawnStayTime: 5000,
        },
        gimic: {
            reverse: { duration: 10000 },
        },
    },
    //stage4
    {
        key: 'stage05',
        bgm: Assets.Audio.BGM.BGM02,
        bit: {
            normal: { count: 20 },
            power: { count: 2 },
        },
        enemy: {
            count: 2,
            spawnTime: [0, 20000],
            stayTime: 1000,
            respawnStayTime: 5000,
        },
        gimic: {
            reverse: { duration: 10000 },
        },
    },
    //stage5
    {
        key: 'stage01',
        bgm: Assets.Audio.BGM.BGM03,
        bit: {
            normal: { count: 25 },
            power: { count: 3 },
        },
        enemy: {
            count: 3,
            spawnTime: [0, 15000, 30000],
            stayTime: 1000,
            respawnStayTime: 5000,
        },
        gimic: {
            reverse: { duration: 10000 },
        },
    },
    //stage2-1
    {
        key: 'stage02',
        bgm: Assets.Audio.BGM.BGM01,
        bit: {
            normal: { count: 20 },
            power: { count: 2 },
        },
        enemy: {
            count: 2,
            spawnTime: [0, 15000],
            stayTime: 1000,
            respawnStayTime: 5000,
        },
        gimic: {
            reverse: { duration: 8000 },
        },
    },
    //stage2-2
    {
        key: 'stage03',
        bgm: Assets.Audio.BGM.BGM01,
        bit: {
            normal: { count: 25 },
            power: { count: 3 },
        },
        enemy: {
            count: 3,
            spawnTime: [0, 15000, 30000],
            stayTime: 1000,
            respawnStayTime: 5000,
        },
        gimic: {
            reverse: { duration: 8000 },
        },
    },
    //stage2-3
    {
        key: 'stage04',
        bgm: Assets.Audio.BGM.BGM02,
        bit: {
            normal: { count: 25 },
            power: { count: 3 },
        },
        enemy: {
            count: 3,
            spawnTime: [0, 15000, 30000],
            stayTime: 1000,
            respawnStayTime: 5000,
        },
        gimic: {
            reverse: { duration: 8000 },
        },
    },
    //stage2-4
    {
        key: 'stage05',
        bgm: Assets.Audio.BGM.BGM02,
        bit: {
            normal: { count: 25 },
            power: { count: 3 },
        },
        enemy: {
            count: 3,
            spawnTime: [0, 15000, 30000],
            stayTime: 1000,
            respawnStayTime: 5000,
        },
        gimic: {
            reverse: { duration: 8000 },
        },
    },
    //stage2-5
    {
        key: 'stage01',
        bgm: Assets.Audio.BGM.BGM03,
        bit: {
            normal: { count: 50 },
            power: { count: 4 },
        },
        enemy: {
            count: 5,
            spawnTime: [0, 15000, 30000, 45000, 60000],
            stayTime: 1000,
            respawnStayTime: 5000,
        },
        gimic: {
            reverse: { duration: 8000 },
        },
    },

    // template    
    // {
    //     key: '',
    //     bgm: '',
    //     bit: {
    //         normal: { count: 0 },
    //         power: { count: 0 },
    //     },
    //     enemy: {
    //         count: 0,
    //         spawnTime: [0],
    //     },
    //     gimic: {
    //         reverse: { duration: 0 },
    //     },
    // },

];


export function getStageConfig(index: number): StageConfig {

    if (index >= STAGES.length) {
        index = 0;
    }

    const stage = STAGES[index];
    return stage;
}

export function getTilemapConfig(key: string): TileMapConfig {
    const tilemaps = Assets.Tilemaps.filter(map => {
        if (map.KEY === key) { return true; }
    });

    let tilemap;
    if (tilemaps.length > 0) {
        tilemap = tilemaps[0];
    }
    else {
        tilemap = Assets.Tilemaps[0];
    }

    const map: TileMapConfig = {
        key: tilemap.KEY,
        tileset: tilemap.TILESET,
        baseLayer: tilemap.BASELAYER,
        transLayer: tilemap.TRANSLAYER,
    };
    return map;
}

export function getStageCount(): number {
    if (Globals.get().getMode() === Consts.Game.Mode.NOMAL) {
        return STAGES.length;
    }
    else {
        return 5;
    }

}
