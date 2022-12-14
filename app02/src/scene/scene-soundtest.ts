import { Consts } from "../consts";

type keySet = {
    key: string;
    name: string;
}

export class SceneSoundTest extends Phaser.Scene {

    private bgms: keySet[];
    private ses: keySet[];

    private text: Phaser.GameObjects.Text | null;
    private textName: Phaser.GameObjects.Text[];
    private keys: Phaser.Input.Keyboard.Key[];

    protected bgm: Phaser.Sound.BaseSound | null;
    protected se: Phaser.Sound.BaseSound | null;

    private selectKind: number;
    private selectBgm: number;
    private selectSe: number;
    private playBgm: number;

    constructor() {
        super({ key: "SoundTest" });
        this.bgms = [];
        this.ses = [];

        this.text = null;
        this.textName = [];
        this.keys = [];

        this.bgm = null;
        this.se = null;

        this.selectKind = 0;
        this.selectBgm = 0;
        this.selectSe = 0;

        this.playBgm = -1;
    }

    preload() {
        //TODO ここでアセットを読み込む
        this.bgms = [
            { key: 'bgm_01_01', name: 'assets/audio/bgm/bgm_01_01' },
            { key: 'bgm_01_02', name: 'assets/audio/bgm/bgm_01_02' },
            { key: 'bgm_01_03', name: 'assets/audio/bgm/bgm_01_03' },
            { key: 'bgm_01_04', name: 'assets/audio/bgm/bgm_01_04' },
            { key: 'bgm_01_05', name: 'assets/audio/bgm/bgm_01_05' },
            { key: 'bgm_01_06', name: 'assets/audio/bgm/bgm_01_06' },
        ];

        this.ses = [
            { key: 'se_01_01', name: 'assets/audio/se/se_01_01' },
            { key: 'se_01_02', name: 'assets/audio/se/se_01_02' },
            { key: 'se_01_03', name: 'assets/audio/se/se_01_03' },
            { key: 'se_01_04', name: 'assets/audio/se/se_01_04' },
            { key: 'se_01_08', name: 'assets/audio/se/se_01_08' },
            { key: 'se_01_14', name: 'assets/audio/se/se_01_14' },
            { key: 'se_01_16', name: 'assets/audio/se/se_01_16' },
            { key: 'se_01_17', name: 'assets/audio/se/se_01_17' },
            { key: 'se_02_10', name: 'assets/audio/se/se_02_10' },
            { key: 'se_02_13', name: 'assets/audio/se/se_02_13' },
            { key: 'se_03_02', name: 'assets/audio/se/se_03_02' },
        ];


        //BGMロード
        this.bgms.forEach(bgm => {
            const mp3_file = bgm.name + ".mp3";
            const ogg_file = bgm.name + ".ogg";
            this.load.audio(bgm.key, [mp3_file, ogg_file]);
        });

        //SEロード
        this.ses.forEach(se => {
            const mp3_file = se.name + ".mp3";
            const ogg_file = se.name + ".ogg";
            this.load.audio(se.key, [mp3_file, ogg_file]);
        });


        //ロード進捗
        {
            const x = this.game.canvas.width * 0.5;
            const y = this.game.canvas.height * 0.5;
            const textStyle: Phaser.Types.GameObjects.Text.TextStyle = {
                font: "18px Arial",
                color: "#0000FF"
            }
            this.text = this.add.text(x, y, '', textStyle);
            this.text.setOrigin(0.5, 0.5);
        }
        this.scene.scene.load.on('progress', (progress: number) => {
            this.text?.setText(`Loading...  ${progress}%`);
        }, this);
        this.scene.scene.load.on('complete', () => {
            this.text?.destroy();
            console.log('load complete');
        }, this);
    }

    create() {
        //キー入力用のリスナー
        const keyCodes: number[] = [
            Phaser.Input.Keyboard.KeyCodes.UP,
            Phaser.Input.Keyboard.KeyCodes.DOWN,
            Phaser.Input.Keyboard.KeyCodes.LEFT,
            Phaser.Input.Keyboard.KeyCodes.RIGHT,
            Phaser.Input.Keyboard.KeyCodes.SPACE,
            Phaser.Input.Keyboard.KeyCodes.PAGE_UP,
            Phaser.Input.Keyboard.KeyCodes.PAGE_DOWN,
        ];
        keyCodes.forEach(code => {
            const keyEvent = this.input.keyboard.addKey(code);
            keyEvent.on(Phaser.Input.Keyboard.Events.DOWN, this._onKeyDown, this);
            this.keys.push(keyEvent);
        });

        //表示テキスト
        {
            const textStyle: Phaser.Types.GameObjects.Text.TextStyle = {
                font: "18px Arial",
                color: "#0000FF"
            }
            const textBGM = this.add.text(100, 100, '', textStyle);
            textBGM.setOrigin(0.0, 0.5);
            this.textName.push(textBGM);

            const textSe = this.add.text(100, 200, '', textStyle);
            textSe.setOrigin(0.0, 0.5);
            this.textName.push(textSe);

            this.text = this.add.text(100, 300, '', textStyle);
            textSe.setOrigin(0.0, 0.5);
        }

        this._selectKind(this.selectKind);
        this._selectBgm(this.selectBgm);
        this._selectSe(this.selectSe);
        this._setVolumeText();
    }


    private _onKeyDown(event: KeyboardEvent): void {
        switch (event.keyCode) {
            case Phaser.Input.Keyboard.KeyCodes.UP: {
                if (this.selectKind === 0) {
                    //BGM
                    this.selectBgm += this.bgms.length;
                    this.selectBgm--;
                    this.selectBgm %= this.bgms.length;
                    this._selectBgm(this.selectBgm);
                }
                else {
                    //SE
                    this.selectSe += this.ses.length;
                    this.selectSe--;
                    this.selectSe %= this.ses.length;
                    this._selectSe(this.selectSe);
                }
                break;
            }
            case Phaser.Input.Keyboard.KeyCodes.DOWN: {
                if (this.selectKind === 0) {
                    //BGM
                    this.selectBgm++;
                    this.selectBgm %= this.bgms.length;
                    this._selectBgm(this.selectBgm);
                }
                else {
                    //SE
                    this.selectSe++;
                    this.selectSe %= this.ses.length;
                    this._selectSe(this.selectSe);
                }
                break;
            }
            case Phaser.Input.Keyboard.KeyCodes.LEFT: {
                this.selectKind += 2;
                this.selectKind--;
                this.selectKind %= 2;
                this._selectKind(this.selectKind);
                break;
            }
            case Phaser.Input.Keyboard.KeyCodes.RIGHT: {
                this.selectKind++;
                this.selectKind %= 2;
                this._selectKind(this.selectKind);
                break;
            }
            case Phaser.Input.Keyboard.KeyCodes.SPACE: {
                if (this.selectKind === 0) {
                    //BGM
                    this._playBgm(this.selectBgm);
                }
                else {
                    //SE
                    this._playSe(this.selectSe);
                }
                break;
            }
            case Phaser.Input.Keyboard.KeyCodes.PAGE_UP: {
                this.sound.volume = Math.min(this.sound.volume + 0.1, 1);
                this._setVolumeText();
                break;
            }
            case Phaser.Input.Keyboard.KeyCodes.PAGE_DOWN: {
                this.sound.volume = Math.max(this.sound.volume - 0.1, 0);
                this._setVolumeText();
                break;
            }
        }
    }

    private _playBgm(index: number): void {
        console.log('_playBgm index:' + index);
        if (this.bgm != null) {
            this.bgm.stop();
        }
        if (index >= this.bgms.length) {
            index = 0;
        }

        if (this.playBgm != index) {
            this.bgm = this.sound.add(this.bgms[index].key);
            this.bgm.play({ loop: true });
            this.playBgm = index;
        }
        else {
            this.bgm?.stop();
            this.playBgm = -1;
        }

    }

    private _playSe(index: number): void {
        console.log('_playSe index:' + index);

        if (this.se != null) {
            this.se.stop();
        }

        if (index >= this.ses.length) {
            index = 0;
        }
        this.se = this.sound.add(this.ses[index].key);
        this.se.play();
        console.log(`${this.ses[index].key},${this.se.duration}`);
    }

    private _selectKind(kind: number) {
        if (kind === 0) {
            this.textName[0].setColor('#00FFFF');
            this.textName[1].setColor('#0000FF');
        }
        else {
            this.textName[0].setColor('#0000FF');
            this.textName[1].setColor('#00FFFF');
        }
    }

    private _selectBgm(index: number) {
        if (index >= this.bgms.length) {
            index = 0;
        }
        this.textName[0].setText(this.bgms[index].key);
    }

    private _selectSe(index: number) {
        if (index >= this.ses.length) {
            index = 0;
        }
        this.textName[1].setText(this.ses[index].key);
    }

    private _setVolumeText() {
        this.text?.setText(`Volume:` + this.sound.volume);
    }
}