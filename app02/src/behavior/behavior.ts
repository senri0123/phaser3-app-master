import { Log } from "../service/logwithstamp";

export abstract class Behavior {
    protected key: string;

    constructor(key: string) {
        this.key = key;
        Log.put(`${key} create.`, key);
    }

    //keyを取得する
    getKey(): string {
        return this.key;
    }

    //初期化(BehaviorManagerにaddされたときに呼ばれる)
    abstract initialize(): void;

    //更新処理
    abstract update(): void;

    //終了処理
    abstract finalize(): void;

    //終了したか
    abstract isFinished(): boolean;
}

export class BehaviorManager {

    private elems: Behavior[];

    constructor() {
        this.elems = [];
    }

    //behavior の追加
    add(behavior: Behavior) {
        behavior.initialize();
        this.elems.push(behavior);
    }

    //指定したキーのbehaviorを取得する
    get(key: string): Behavior[] {
        //指定タイプのギミックを抽出
        const behaviors: Behavior[] = this.elems.filter(elem => {
            return (elem.getKey() === key)
        });
        return behaviors;
    }

    update(): void {
        let removes: Behavior[] = [];

        this.elems.forEach((elem: Behavior) => {
            //更新処理を行う
            elem.update();

            //終了していれば別途抽出しておく
            if (elem.isFinished()) {
                removes.push(elem);
            }
        });

        //リムーブ予約が入っているものを取り外す
        removes.forEach((elem: Behavior) => {
            //終了処理を行う
            elem.finalize();
            //配列から取り出す
            const index = this.elems.indexOf(elem);
            this.elems.splice(index, 1);
        });
    }

    clear(): void {
        //すべてに対して終了処理を呼び出す
        this.elems.forEach((elem: Behavior) => {
            elem.finalize();
        });

        //配列をクリアする
        this.elems = [];
    }

}