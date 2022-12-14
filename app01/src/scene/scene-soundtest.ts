import { Consts } from "../consts";

class ListContent {
    key: string;
    marker: string;
    volume: number;
    sound: Phaser.Sound.BaseSound | null;

    constructor(key: string, marker: string, volume: number) {
        this.key = key;
        this.marker = marker;
        this.volume = volume;
        this.sound = null;
    }
}

class SoundData {
    markers: Set<string>;

    constructor() {
        this.markers = new Set<string>();
    }

    addMarker(marker: string): void {
        if (this.markers.has(marker)) {
            return;
        }
        this.markers.add(marker);
    }
}

class SoundList {
    soundList: Map<string, SoundData>;

    constructor() {
        this.soundList = new Map<string, SoundData>();
    }

    addKey(key: string): void {
        if (this.soundList.has(key)) {
            return;
        }
        else {
            this.soundList.set(key, new SoundData());
        }
    }

    addMarker(key: string, marker: string): void {
        this.addKey(key);
        if (this.soundList.has(key)) {
            const data = this.soundList.get(key);
            data?.addMarker(marker);
        }
    }

    getContent(): ListContent[] {
        const content: ListContent[] = [];

        for (const [key, data] of this.soundList) {
            if (data.markers.size > 0) {
                for (const marker of data.markers) {
                    content.push(new ListContent(key, marker, 50));
                }
            }
            else {
                content.push(new ListContent(key, "", 50));
            }
        }

        return content;
    }
}


export class SceneSoundTest extends Phaser.Scene {

    private soundList: SoundList;
    private coundContent: ListContent[];

    private textPlayList: Phaser.GameObjects.Text | null;
    private textVolume: Phaser.GameObjects.Text | null;
    private textMute: Phaser.GameObjects.Text | null;
    private index: number;

    private keyPlay: Phaser.Input.Keyboard.Key | null;
    private keyStop: Phaser.Input.Keyboard.Key | null;
    private keyNext: Phaser.Input.Keyboard.Key | null;
    private keyPrev: Phaser.Input.Keyboard.Key | null;
    private keyVolUp: Phaser.Input.Keyboard.Key | null;
    private keyVolDown: Phaser.Input.Keyboard.Key | null;
    private keyMute: Phaser.Input.Keyboard.Key | null;
    private keyShift: Phaser.Input.Keyboard.Key | null;
    private keyAlt: Phaser.Input.Keyboard.Key | null;

    private soundVolume: number;
    private muted: boolean;
    private targetMasterVolume: boolean;

    constructor() {
        super({ key: "SoundTest" });

        this.soundList = new SoundList();
        this.coundContent = [];

        this.textPlayList = null;
        this.textVolume = null;
        this.textMute = null;
        this.index = 0;

        this.keyPlay = null;
        this.keyStop = null;
        this.keyNext = null;
        this.keyPrev = null;
        this.keyVolUp = null;
        this.keyVolDown = null;
        this.keyMute = null;
        this.keyShift = null;
        this.keyAlt = null;

        this.soundVolume = 0
        this.muted = false;
        this.targetMasterVolume = false;
    }

    preload(): void {
        // this.load.audio(Consts.Assets.Audio.Start.NAME, [Consts.Assets.Audio.Start.OGG, Consts.Assets.Audio.Start.MP3]);
        // this.load.audio(Consts.Assets.Audio.Select.NAME, [Consts.Assets.Audio.Select.OGG, Consts.Assets.Audio.Select.MP3]);
        this.load.audioSprite(Consts.Assets.Audio.SE.NAME, Consts.Assets.Audio.SE.JSON,
            [Consts.Assets.Audio.SE.OGG, Consts.Assets.Audio.SE.MP3]);
        this.load.audio(Consts.Assets.Audio.BGM.NAME, [Consts.Assets.Audio.BGM.OGG, Consts.Assets.Audio.BGM.MP3]);


    }

    create(): void {
        //サウンドリストの設定
        // this.soundList.addKey(Consts.Assets.Audio.Start.NAME);
        // this.soundList.addKey(Consts.Assets.Audio.Select.NAME);
        this.soundList.addMarker(Consts.Assets.Audio.SE.NAME, Consts.Assets.Audio.SE.START);
        this.soundList.addMarker(Consts.Assets.Audio.SE.NAME, Consts.Assets.Audio.SE.SELECT);
        this.soundList.addMarker(Consts.Assets.Audio.SE.NAME, Consts.Assets.Audio.SE.DECIDE);
        this.soundList.addKey(Consts.Assets.Audio.BGM.NAME);

        this.coundContent = this.soundList.getContent();

        //サウンドボリューム設定
        this.targetMasterVolume = true;
        this.soundVolume = 50;
        this._applyMasterVolume(this.soundVolume);
        this.muted = false;
        this.sound.mute = this.muted;

        //テキスト初期化
        var textStyle: Phaser.Types.GameObjects.Text.TextStyle = {
            font: "16px Arial",
            color: "#00000"
        };

        this.textPlayList = this.add.text(5, 5, "", textStyle);
        this.textVolume = this.add.text(5, 25, "", textStyle);
        this.textMute = this.add.text(5, 45, "", textStyle);
        this._setText();

        //イベントリスナー初期化
        this.keyPlay = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ZERO);
        this.keyStop = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ONE);
        this.keyNext = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.TWO);
        this.keyPrev = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.THREE);
        this.keyVolUp = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.FOUR);
        this.keyVolDown = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.FIVE);
        this.keyMute = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SIX);
        this.keyShift = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT);
        this.keyAlt = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ALT);

        this.keyPlay.on(Phaser.Input.Keyboard.Events.DOWN, () => { this._onPlay(); }, this);
        this.keyStop.on(Phaser.Input.Keyboard.Events.DOWN, () => { this._onStop(); }, this);
        this.keyNext.on(Phaser.Input.Keyboard.Events.DOWN, () => { this._onNext(); }, this);
        this.keyPrev.on(Phaser.Input.Keyboard.Events.DOWN, () => { this._onPrev(); }, this);
        this.keyVolUp.on(Phaser.Input.Keyboard.Events.DOWN, () => { this._onVolUp(); }, this);
        this.keyVolDown.on(Phaser.Input.Keyboard.Events.DOWN, () => { this._onVolDown(); }, this);
        this.keyMute.on(Phaser.Input.Keyboard.Events.DOWN, () => { this._onMute(); }, this);
        this.keyAlt.on(Phaser.Input.Keyboard.Events.DOWN, () => { this._onAlt(); }, this)

    }

    private _applyMasterVolume(volume: number): void {
        this.sound.volume = (volume / 100);
    }

    private _setText(): void {
        let currentVolume = 0;
        if (this.coundContent.length > this.index) {
            const data = this.coundContent[this.index];
            let text = "KEY:" + data.key;
            if (data.marker.length > 0) {
                text += " MARKER:" + data.marker;
            }

            text += "     next:'2'key prev:'3'key";
            this.textPlayList?.setText(text);

            currentVolume = data.volume;
        }

        {
            let volumeTarget = "PART";
            if (this.targetMasterVolume) {
                volumeTarget = "MASTER"
            }
            this.textVolume?.setText("VOLUME:" + this.soundVolume + "/" + currentVolume + " target:" + volumeTarget + "    up:'5'key down:'6'key");
        }
        this.textMute?.setText("MUTE:" + this.muted + "     tggle:'7'key");
    }

    private _onPlay(): void {
        if (this.coundContent.length > this.index) {
            const data = this.coundContent[this.index];
            const volume = data.volume / 100;
            if (data.marker.length > 0) {
                this.sound.playAudioSprite(data.key, data.marker, { volume: volume });
            }
            else {
                this.sound.play(data.key, { volume: volume });
            }
        }
    }

    private _onStop(): void {
        this.sound.stopAll();
    }

    private _onNext(): void {
        this.index++;
        if (this.index >= this.coundContent.length) {
            this.index = 0;
        }
        this._setText();
    }

    private _onPrev(): void {
        if (this.index > 0) {
            this.index--;
        }
        else {
            if (this.coundContent.length > 0) {
                this.index = this.coundContent.length - 1;
            }
            else {
                this.index = 0;
            }
        }
        this._setText();
    }

    private _onVolUp(): void {
        let val = 1;
        if (this.keyShift?.isDown) {
            val = 10;
        }

        if (this.targetMasterVolume) {
            this.soundVolume = Math.min(this.soundVolume + val, 100);
            this._applyMasterVolume(this.soundVolume);
        }
        else {
            if (this.coundContent.length > this.index) {
                this.coundContent[this.index].volume = Math.min(this.coundContent[this.index].volume + val, 100);
            }
        }
        this._setText();
    }

    private _onVolDown(): void {
        let val = 1;
        if (this.keyShift?.isDown) {
            val = 10;
        }

        if (this.targetMasterVolume) {
            this.soundVolume = Math.max(this.soundVolume - val, 0);
            this._applyMasterVolume(this.soundVolume);
        }
        else {
            this.coundContent[this.index].volume = Math.max(this.coundContent[this.index].volume - val, 0);
        }
        this._setText();
    }

    private _onMute(): void {
        this.muted = !this.muted;
        this.sound.mute = this.muted;
        this._setText();
    }

    private _onAlt(): void {
        this.targetMasterVolume = !this.targetMasterVolume;
        this._setText();
    }




}