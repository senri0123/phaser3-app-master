import { Consts } from "../../../consts";

export type uiButtonImages = {
    atlas: string;
    offIcon: string;
    onIcon: string;
    overIcon: string;
    disableIcon: string;
}

export type uiButtonColor = {
    offColor: number;
    onColor: number;
    overColor: number;
    disableColor: number;
}

export type uiButtonConfig = {
    type: number;
    images: uiButtonImages;
    color: uiButtonColor;
    rect: {
        x: number;
        y: number;
        w: number;
        h: number;
    }
}

export class uiButtonUtil {

    static getDefaultButtonConfig(): uiButtonConfig {
        return {
            type: Consts.Button.Type.NONE,
            images: {
                atlas: "",
                offIcon: "",
                onIcon: "",
                overIcon: "",
                disableIcon: "",
            },
            color: {
                offColor: 0,
                onColor: 0,
                overColor: 0,
                disableColor: 0,
            },
            rect: {
                x: 0,
                y: 0,
                w: 0,
                h: 0,
            },
        }
    }

    //1 x N のときのボタン配置
    static getButtonRect(row: number): { x: number, y: number, w: number, h: number } {
        const col = 0;  //１段組なので常に０
        const orig_x = Consts.Button.Position_1.ORIG_X;
        const orig_y = Consts.Button.Position_1.ORIG_Y;
        const pad_x = Consts.Button.Position_1.PAD_X;
        const pad_y = Consts.Button.Position_1.PAD_Y;
        const icon_w = Consts.Button.Position_1.W;
        const icon_h = Consts.Button.Position_1.H;


        const x = orig_x + (pad_x + icon_w) * col;
        const y = orig_y + (pad_y + icon_h) * row;
        const w = icon_w;
        const h = icon_h;

        return { x: x, y: y, w: w, h: h };
    }

    //各種アイコンで使用するアセット
    static getButtonImages(type: number): uiButtonImages {
        switch (type) {
            case Consts.Button.Type.EDIT:
                return {
                    atlas: Consts.Assets.Graphic.Icon.Atlas.NAME,
                    offIcon: Consts.Assets.Graphic.Icon.Edit.OFF,
                    onIcon: Consts.Assets.Graphic.Icon.Edit.ON,
                    overIcon: Consts.Assets.Graphic.Icon.Edit.ON,
                    disableIcon: Consts.Assets.Graphic.Icon.Edit.GRAY,
                };
            case Consts.Button.Type.ERASE:
                return {
                    atlas: Consts.Assets.Graphic.Icon.Atlas.NAME,
                    offIcon: Consts.Assets.Graphic.Icon.Erase.OFF,
                    onIcon: Consts.Assets.Graphic.Icon.Erase.ON,
                    overIcon: Consts.Assets.Graphic.Icon.Erase.ON,
                    disableIcon: Consts.Assets.Graphic.Icon.Erase.GRAY,
                };

            case Consts.Button.Type.PLAY:
                return {
                    atlas: Consts.Assets.Graphic.Icon.Atlas.NAME,
                    offIcon: Consts.Assets.Graphic.Icon.Play.OFF,
                    onIcon: Consts.Assets.Graphic.Icon.Play.ON,
                    overIcon: Consts.Assets.Graphic.Icon.Play.ON,
                    disableIcon: Consts.Assets.Graphic.Icon.Play.GRAY,
                };

            case Consts.Button.Type.PAUSE:
                return {
                    atlas: Consts.Assets.Graphic.Icon.Atlas.NAME,
                    offIcon: Consts.Assets.Graphic.Icon.Pause.OFF,
                    onIcon: Consts.Assets.Graphic.Icon.Pause.ON,
                    overIcon: Consts.Assets.Graphic.Icon.Pause.ON,
                    disableIcon: Consts.Assets.Graphic.Icon.Pause.GRAY,
                };

            case Consts.Button.Type.CLEAR:
                return {
                    atlas: Consts.Assets.Graphic.Icon.Atlas.NAME,
                    offIcon: Consts.Assets.Graphic.Icon.Clear.OFF,
                    onIcon: Consts.Assets.Graphic.Icon.Clear.ON,
                    overIcon: Consts.Assets.Graphic.Icon.Clear.ON,
                    disableIcon: Consts.Assets.Graphic.Icon.Clear.GRAY,
                };

            case Consts.Button.Type.SPEEDUP:
                return {
                    atlas: Consts.Assets.Graphic.Icon.Atlas.NAME,
                    offIcon: Consts.Assets.Graphic.Icon.SpeedUp.OFF,
                    onIcon: Consts.Assets.Graphic.Icon.SpeedUp.ON,
                    overIcon: Consts.Assets.Graphic.Icon.SpeedUp.ON,
                    disableIcon: Consts.Assets.Graphic.Icon.SpeedUp.GRAY,
                };

            case Consts.Button.Type.SPEEDDWON:
                return {
                    atlas: Consts.Assets.Graphic.Icon.Atlas.NAME,
                    offIcon: Consts.Assets.Graphic.Icon.SpeedDown.OFF,
                    onIcon: Consts.Assets.Graphic.Icon.SpeedDown.ON,
                    overIcon: Consts.Assets.Graphic.Icon.SpeedDown.ON,
                    disableIcon: Consts.Assets.Graphic.Icon.SpeedDown.GRAY,
                };

            case Consts.Button.Type.RETURN:
                return {
                    atlas: Consts.Assets.Graphic.Icon.Atlas.NAME,
                    offIcon: Consts.Assets.Graphic.Icon.Return.OFF,
                    onIcon: Consts.Assets.Graphic.Icon.Return.ON,
                    overIcon: Consts.Assets.Graphic.Icon.Return.ON,
                    disableIcon: Consts.Assets.Graphic.Icon.Return.GRAY,
                };

            case Consts.Button.Type.SAVE:
                return {
                    atlas: Consts.Assets.Graphic.Icon.Atlas.NAME,
                    offIcon: Consts.Assets.Graphic.Icon.Save.OFF,
                    onIcon: Consts.Assets.Graphic.Icon.Save.ON,
                    overIcon: Consts.Assets.Graphic.Icon.Save.ON,
                    disableIcon: Consts.Assets.Graphic.Icon.Save.GRAY,
                };

            case Consts.Button.Type.SCREENSHOT:
                return {
                    atlas: Consts.Assets.Graphic.Icon.Atlas.NAME,
                    offIcon: Consts.Assets.Graphic.Icon.ScreenShot.OFF,
                    onIcon: Consts.Assets.Graphic.Icon.ScreenShot.ON,
                    overIcon: Consts.Assets.Graphic.Icon.ScreenShot.ON,
                    disableIcon: Consts.Assets.Graphic.Icon.ScreenShot.GRAY,
                };

            default:
                return {
                    atlas: "",
                    offIcon: "",
                    onIcon: "",
                    overIcon: "",
                    disableIcon: "",
                };
        }
    }

    static getButtonColor(): uiButtonColor {
        return {
            onColor: Consts.Button.Color.ON,
            offColor: Consts.Button.Color.OFF,
            overColor: Consts.Button.Color.OVER,
            disableColor: Consts.Button.Color.GRAY,
        }
    }
}
