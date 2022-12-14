import { Consts } from "../../consts";

export type GimicConfig = {
    type: number;
    manager: GimicManager,
}

export interface Gimic {

    //ギミックタイプを取得する
    getGimicType(): number;

    //ギミックを更新する
    updateGimic(): void;

    //ギミックの再充填を行う
    rechargeGimic(): void

    //ギミックを有効にする
    startGimic(): void;

    //ギミックを無効にする
    stopGimic(): void;

    //現在ギミックが有効か
    isGimicActive(): boolean;

    //マネージャから外す
    removeGimic(): void;

    //マネージャから外れているか
    isGimicRemoved(): boolean;

    //内部インスタンスの破棄
    destroyGimic(): void;
}

export class GimicManager {

    private gimics: Gimic[];

    constructor() {
        this.gimics = [];
    }

    add(gimic: Gimic) {
        this.gimics.push(gimic);
    }

    get(type: number): Gimic | null {
        //指定タイプのギミックを抽出
        const gimics: Gimic[] = this.gimics.filter(gimic => {
            return (gimic.getGimicType() === type)
        });

        if (gimics.length > 0) {
            //あれば先頭を返す
            return gimics[0];
        }
        else {
            //なければnullを返す
            return null;
        }
    }

    update(): void {
        let removes: Gimic[] = [];

        this.gimics.forEach((child: Gimic) => {
            //アクティブで、リムーブ予約がなければ更新
            if (child.isGimicActive() && !child.isGimicRemoved()) {
                child.updateGimic();
            }
            //リムーブ予約が入っていれば別途抽出しておく
            if (child.isGimicRemoved()) {
                removes.push(child);
            }
        });

        //リムーブ予約が入っているものを取り外す
        removes.forEach((child: Gimic) => {
            child.destroyGimic();
            const index = this.gimics.indexOf(child);
            this.gimics.splice(index, 1);
        });
    }

    isActive(type: number): boolean {

        const gimics = this.gimics.filter(gimic => {
            if (gimic.getGimicType() == type) {
                if (gimic.isGimicActive() && !gimic.isGimicRemoved()) {
                    return true;
                }
            }
            return false;
        });

        if (gimics.length > 0) {
            return true;
        }
        else {
            return false;
        }
    }

    clear(): void {
        this.gimics.forEach((child: Gimic) => {
            child.destroyGimic()
        });

        this.gimics = [];
    }

}

