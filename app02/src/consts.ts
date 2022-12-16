/**
 * 各種定数
 */
export const Consts = {
    TITLE: "SPHERE DECIDE",
    VERSION: "202212161802",

    //画面サイズ
    Screen: {
        WIDTH: 800,
        HEIGHT: 600,
        BGCOLOR: 0xE0E0E0,
    },



    Game: {
        LIFE: 2,
        TIME: (3 * 60 * 1000),  //3分
        Mode: {
            NOMAL: 1,
            TIMEATTACK: 2,
        },
        REDUCE_TIME: 10000, //タイムアタックでミスしたときに減る時間
    },

    BG: {
        DEPTH: 0,
    },

    Map: {
        Base: {
            DEPTH: 0,
        },
        Trans: {
            DEPTH: 1,
        },
    },

    Player: {
        DEPTH: 2,
    },

    Enemy: {
        DEPTH: 2,

        Stat: {
            NONE: 0,
            NORMAL: 1,
            ESCAPE: 2,
            STAY: 3,
            OUT: 4,
            POWERUP: 5,
        },

        SCORE: 100,

        SPWN_STAY_TIME: 1000,
        RESPWN_STAY_TIME: 5000,
    },

    Bit: {
        Small: {
            SCORE: 10
        },
        Power: {
            SCORE: 100,
        },
    },

    Effects: {
        Ring: {
            DEPTH: 1,
            DURATION: 800,
            COUNT: 3,
            LOOPDELAY: 200,
            SPAN: 200,
        },
        Ring_r: {
            DEPTH: 3,
            DURATION: 400,
            COUNT: 1,
            LOOPDELAY: 0,
            SPAN: 100,
        },
    },

    //タイルセット各画像のインデックス
    Tiles: {
        TILE: 1,
        PLAYER_START: 2,
        ENEMY_GOAL: 3,
        PLAYER_GOAL: 4,
        ENEMY_START: 5,
        WALL: 6,
        OBSTACLE: 7,
        REVERSE: 8,
        TRANS_WALL: 9,

    },

    //ギミック
    Gimics: {
        Type: {
            NONE: 0,
            REVERSE: 1,
        },
    },

    //タイム
    Time: {
        SCORE: 100.
    },

    //UI
    UI: {
        Score: {
            Text: {
                Position: {
                    x: 20,
                    y: 20,
                },
                Origin: {
                    x: 0,
                    y: 0,
                },
                DEPTH: 3,
            },
            Threshold: {
                Small: {
                    VALUE: 100,
                    // DELAY: 0,
                    DELAY: 100,
                },
                Middle: {
                    VALUE: 1000,
                    // DELAY: 100,
                    DELAY: 500,
                },
                Large: {
                    VALUE: 9999999,
                    DELAY: 1000
                },
            },
        },
        Lives: {
            Ball: {
                Position: {
                    x: 730,
                    y: 20,
                },
                Origin: {
                    x: 0,
                    y: 0,
                },
                Scale: {
                    x: 0.6,
                    y: 0.6,
                },
                DEPTH: 3,
            },
            Text: {
                Position: {
                    x: 750,
                    y: 20,
                },
                Origin: {
                    x: 0,
                    y: 0,
                },
                DEPTH: 3,
            },
        },
        Stage: {
            Text: {
                Position: {
                    x: 400,
                    y: 20,
                },
                Origin: {
                    x: 0.5,
                    y: 0,
                },
                DEPTH: 3,
            },
        },
        TimerGuage: {
            Frame: {
                Position: {
                    x: 15,
                    y: 555,
                },
                Origin: {
                    x: 0,
                    y: 0,
                },
                DEPTH: 4,
            },
            Guage: {
                Position: {
                    x: 20,
                    y: 560,
                },
                Size: {
                    x: 760,
                    y: 20,
                },
                Origin: {
                    x: 0,
                    y: 0,
                },
                DEPTH: 2,
            },
        },
        Shade: {
            Position: {
                x: 15,
                y: 18,
            },
            Scale: {
                x: 16.1,
                y: 0.5,
            },
            Origin: {
                x: 0,
                y: 0,
            },
            DEPTH: 2,
        },

        Ready: {
            DEPTH: 3,
        },
        Start: {
            DEPTH: 3,
        },
        Clear: {
            DEPTH: 3,
        },
        GameOver: {
            DEPTH: 3,
        },
        Congratulations: {
            DEPTH: 3,
        },
        ReturnTitle: {
            DEPTH: 3,
        },
    },
}

export const Assets = {
    BASE: 'assets/',

    //グラフィック
    Graphic: {
        Objects: {
            KEY: 'objects',
            ATLAS: 'image/objects_atlas.json',
            FILE: 'image/objects.png',

            RED: 'red',
            BLUE: 'bule',
            YELLOW: 'orange',
            BIT: 'bit',
            POWERBIT: 'powerbit',
        },

        Effects: {
            KEY: 'effects',
            ATLAS: 'image/effects_atlas.json',
            FILE: 'image/effects.png',

            RING: 'ring',
            RING_R: 'power32_2',
        },

        Tiles: {
            KEY: 'tiles',
            ATLAS: 'image/tiles_atlas.json',
            FILE: 'image/tiles.png',

            TILE: 'tile',
            PLAYER_START: 'player_start',
            PLAYER_GOAL: 'player_goal',
            ENEMY_START: 'enemy_start',
            ENEMY_GOAL: 'enemy_goal',
            WALL: 'wall',
            OBSTACLE: 'obstacle',
            REVERSE: 'reverse',
        },

        UIs: {
            KEY: 'uis',
            ATLAS: 'image/uis_atlas.json',
            FILE: 'image/uis.png',

            GUAGE_FRAME: 'guage_frame',
            SHADE: 'shade',
            READY: 'ready',
            START: 'start',
            CLEAR: 'clear',
            TIMEUP: 'timeup',
            GAMEOVER: 'gameover',
            CONGRA: 'congra',
            PANEL: 'panel',
            RETURN_TITLE: 'returntitle'
        },

        TitleUIs: {
            KEY: 'title_uis',
            ATLAS: 'image/title_uis_atlas.json',
            FILE: 'image/title_uis.png',

            TITLE: 'title',
            START: 'gamestart',
            TIMEATTACK: 'timeattack',
        },

        TitleBG: {
            KEY: 'title_bg',
            FILE: 'image/title_bg.png',
        },

        GameBGs: [
            { KEY: 'gamebg01', FILE: 'image/gamebg01.png' },
            { KEY: 'gamebg02', FILE: 'image/gamebg02.png' },
        ],
    },

    //サウンド
    Audio: {
        SEs: [
            { KEY: 'se_01_01', MP3: 'audio/se/se_01_01.mp3', OGG: 'audio/se/se_01_01.ogg' },
            { KEY: 'se_01_02', MP3: 'audio/se/se_01_02.mp3', OGG: 'audio/se/se_01_02.ogg' },
            { KEY: 'se_01_03', MP3: 'audio/se/se_01_03.mp3', OGG: 'audio/se/se_01_03.ogg' },
            { KEY: 'se_01_04', MP3: 'audio/se/se_01_04.mp3', OGG: 'audio/se/se_01_04.ogg' },
            { KEY: 'se_01_08', MP3: 'audio/se/se_01_08.mp3', OGG: 'audio/se/se_01_08.ogg' },
            { KEY: 'se_01_11', MP3: 'audio/se/se_01_11.mp3', OGG: 'audio/se/se_01_11.ogg' },
            { KEY: 'se_01_14', MP3: 'audio/se/se_01_14.mp3', OGG: 'audio/se/se_01_14.ogg' },
            { KEY: 'se_01_16', MP3: 'audio/se/se_01_16.mp3', OGG: 'audio/se/se_01_16.ogg' },
            { KEY: 'se_01_17', MP3: 'audio/se/se_01_17.mp3', OGG: 'audio/se/se_01_17.ogg' },
            { KEY: 'se_01_18', MP3: 'audio/se/se_01_18.mp3', OGG: 'audio/se/se_01_18.ogg' },
            { KEY: 'se_02_10', MP3: 'audio/se/se_02_10.mp3', OGG: 'audio/se/se_02_10.ogg' },
            { KEY: 'se_02_13', MP3: 'audio/se/se_02_13.mp3', OGG: 'audio/se/se_02_13.ogg' },
            { KEY: 'se_03_02', MP3: 'audio/se/se_03_02.mp3', OGG: 'audio/se/se_03_02.ogg' },
        ],
        SE: {
            SELECT: "se_02_13",
            DECIDE: "se_02_10",
            BIT: "se_03_02",
            POWERBIT: "se_01_08",
            POWEREND: "se_01_11",
            WALL: "se_01_03",
            MISS: "se_01_16",
            READY: "se_01_04",
            START: "se_01_17",
            ATACK: "se_01_18",
            CLEAR: "se_01_01",
            ALLCLEAR: "se_01_02",
            GAMEOVER: "se_01_14",
        },

        BGMs: [
            { KEY: 'bgm_01_01', MP3: 'audio/bgm/bgm_01_01.mp3', OGG: 'audio/bgm/bgm_01_01.ogg' },
            { KEY: 'bgm_01_02', MP3: 'audio/bgm/bgm_01_02.mp3', OGG: 'audio/bgm/bgm_01_02.ogg' },
            { KEY: 'bgm_01_03', MP3: 'audio/bgm/bgm_01_03.mp3', OGG: 'audio/bgm/bgm_01_03.ogg' },
            { KEY: 'bgm_01_04', MP3: 'audio/bgm/bgm_01_04.mp3', OGG: 'audio/bgm/bgm_01_04.ogg' },
            { KEY: 'bgm_01_07', MP3: 'audio/bgm/bgm_01_07.mp3', OGG: 'audio/bgm/bgm_01_07.ogg' },
            { KEY: 'bgm_01_06', MP3: 'audio/bgm/bgm_01_06.mp3', OGG: 'audio/bgm/bgm_01_06.ogg' },
        ],
        BGM: {
            BGMOP: 'bgm_01_02',
            BGM01: 'bgm_01_04',
            BGM02: 'bgm_01_07',
            BGM03: 'bgm_01_06',
        },
    },

    //タイルマップ
    Tilemaps: [
        { KEY: 'stage01', FILE: 'map/pac01.json', TILESET: 'tiles', BASELAYER: 'map', TRANSLAYER: 'trans', },
        { KEY: 'stage02', FILE: 'map/pac02.json', TILESET: 'tiles', BASELAYER: 'map', TRANSLAYER: 'trans', },
        { KEY: 'stage03', FILE: 'map/pac03.json', TILESET: 'tiles', BASELAYER: 'map', TRANSLAYER: 'trans', },
        { KEY: 'stage04', FILE: 'map/pac04.json', TILESET: 'tiles', BASELAYER: 'map', TRANSLAYER: 'trans', },
        { KEY: 'stage05', FILE: 'map/pac05.json', TILESET: 'tiles', BASELAYER: 'map', TRANSLAYER: 'trans', },
        { KEY: 'stage06', FILE: 'map/pac06.json', TILESET: 'tiles', BASELAYER: 'map', TRANSLAYER: 'trans', },
        { KEY: 'stage07', FILE: 'map/pac07.json', TILESET: 'tiles', BASELAYER: 'map', TRANSLAYER: 'trans', },
    ],
}
