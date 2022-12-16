/**
 * 各種定数
 */
export const Consts = {
    //version
    VERSION: "202212141838",

    //画面サイズ
    Screen: {
        WIDTH: 800,
        HEIGHT: 600,
        BGCOLOR: 0xE0E0E0,
    },

    //ライフゲーム
    LifeGame: {
        Position: {
            X: 80,
            Y: 67,
        },

        Size: {
            Small: {
                W: 512,
                H: 512,
                ROW: 16,
                COL: 16,
            },
            Middle: {
                W: 512,
                H: 512,
                ROW: 32,
                COL: 32,
            },
            Large: {
                W: 512,
                H: 512,
                ROW: 64,
                COL: 64,
            },
        },

        //セル関連
        Cell: {
            //セルの状態
            Stat: {
                NONE: 0,     //未定義
                ALIVE: 1,    //生存
                DEAD: 2,     //死亡
            },
            //セルの色関連
            Color: {
                ON: 0x00FF7F,       //セルが生存時の色
                OFF: 0x000080,      //セルが死亡時の色
                DURATION: 80,       //色変更時の所要時間
            },
        },
    },

    //制御用定義
    Control: {
        //再生状態
        PlayBack: {
            STOP: 0,
            PLAY: 1,
        },
        //編集モード
        EditMode: {
            NONE: 0,
            EDIT: 1,
            ERASE: 2,
        },
        //進行速度
        Speed: {
            MIN: 1, //SLOW
            MAX: 5, //FAST
            DEFAULT: 2,
        },
    },

    Button: {
        //ボタンの種別
        Type: {
            NONE: 0,
            EDIT: 1,
            ERASE: 2,
            PLAY: 3,
            PAUSE: 4,
            CLEAR: 5,
            SPEEDUP: 6,
            SPEEDDWON: 7,
            RETURN: 8,
            SAVE: 9,
            SCREENSHOT: 10,
        },

        //ボタン状態
        Stat: {
            NONE: 0,
            OFF: 1,
            ON: 2,
            OVER: 3,
            GRAY: 4,
        },

        //アイコン 1 x N のときのボタン配置
        Position_1: {
            ORIG_X: 732,
            ORIG_Y: 90,
            PAD_X: 0,
            PAD_Y: 10,
            W: 50,
            H: 50,
        },

        //パネルの色
        Color: {
            ON: 0x00FF7F,
            OFF: 0x0000FF,
            OVER: 0x0000FF,
            GRAY: 0x808080,
        },

        //描画優先度
        Depth: {
            PANEL: 1,
            ICON: 2,
        },
    },

    //背景
    Base: {
        DEPTH: 0,
    },

    //パネル
    Panel: {
        DEPTH: 1,
    },

    //グリッド
    Grid: {
        LINE_WIDTH: 1,
        COLOR: 0xFFFFFF,
        DEPTH: 2,
    },

    //モード表示
    Mode: {
        Position: {
            X: 68,
            Y: 41,
        },
        Size: {
            W: 126,
            H: 18,
        },
        Panel: {
            DEPTH: 1
        },
        Text: {
            DEPTH: 2
        },
    },

    //メッセージ表示
    Message: {
        Position: {
            X: 133,
            Y: 41,
        },
        Size: {
            W: 662,
            H: 18,
        },
        Origin: {
            X: 0,
            Y: 0.5,
        },
        DEPTH: 1,
    },

    //タイトル表示
    Title: {
        Position: {
            X: 400,
            Y: 18,
        },
        Size: {
            W: 790,
            H: 24,
        },
        Origin: {
            X: 0.5,
            Y: 0.5,
        },
        DEPTH: 1,
    },

    //スピード表示
    Speed: {
        Position: {
            x: 706,
            y: 41,
        },
        Padding: {
            x: 12,
        },
        SCALE: 1.0,
        DEPTH: 2,
    },

    //アツマール用
    Atsumaru: {
        Data: {
            KEY: "cells",
        },
        CommStat: {
            NONE: 0,    //通信していない
            DURING: 1,  //通信中
            SUCCESS: 2, //成功
            FAIL: 3,     //失敗
        },
    },

    //アセット定義
    Assets: {
        //ベースディレクトリ
        BasePath: "assets/",

        //画像
        Graphic: {
            //背景
            Base: {
                FILE: "image/base.png",
                NAME: "base",
            },

            //タイトル
            Title: {
                FILE: "image/title.png",
                NAME: "title",
            },
            //スタート
            Start: {
                FILE: "image/start.png",
                NAME: "start",
            },

            //タイトル画面
            Titles: {
                Atlas: {
                    NAME: "titles",
                    FILE: "image/titles.png",
                    ATLAS: "image/titles_atlas.json",
                },

                Title: "title",
                Start: "start",
                Continue: {
                    OK: "continue",
                    NG: "continue_g",
                },
            },

            //アイコン
            Icon: {
                Atlas: {
                    NAME: "icons",
                    FILE: "image/icons.png",
                    ATLAS: "image/icons_atlas.json",
                },

                Edit: {
                    ON: "edit_w",
                    OFF: "edit_w",
                    GRAY: "edit_w",
                },
                Erase: {
                    ON: "erase_w",
                    OFF: "erase_w",
                    GRAY: "erase_w",
                },
                Play: {
                    ON: "play_w",
                    OFF: "play_w",
                    GRAY: "play_w",
                },
                Pause: {
                    ON: "pause_w",
                    OFF: "pause_w",
                    GRAY: "pause_w",
                },
                Clear: {
                    ON: "clear_w",
                    OFF: "clear_w",
                    GRAY: "clear_w",
                },
                SpeedUp: {
                    ON: "speedup_w",
                    OFF: "speedup_w",
                    GRAY: "speedup_w",
                },
                SpeedDown: {
                    ON: "speeddown_w",
                    OFF: "speeddown_w",
                    GRAY: "speeddown_w",
                },
                Return: {
                    ON: "return_w",
                    OFF: "return_w",
                    GRAY: "return_w",
                },
                Speed: {
                    ON: "play_on_18",
                    OFF: "",
                    GRAY: "play_g_18",
                },
                Save: {
                    ON: "save_w",
                    OFF: "save_w",
                    GRAY: "save_w",
                },
                ScreenShot: {
                    ON: "screenshot_w",
                    OFF: "screenshot_w",
                    GRAY: "screenshot_w",
                },
            },

            PipeLine: {
                Blur: {
                    NAME: "blur",
                }
            },
        },

        //サウンド
        Audio: {
            SE: {
                NAME: "se",
                JSON: "audio/se/se.json",
                MP3: "audio/se/se.mp3",
                OGG: "audio/se/se.ogg",

                START: "start",
                SELECT: "over",
                DECIDE: "on",
            },

            //BGM
            BGM: {
                NAME: "bgm",
                MP3: "audio/bgm/bgm.mp3",
                OGG: "audio/bgm/bgm.ogg",
            }
        }
    },
}
