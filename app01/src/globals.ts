import { ServerDataManager } from "./serverdata/serverdata";

export class Globals {

    //シングルトンで使用するインスタンス
    private static instance: Globals | null = null;

    //シングルトンのインスタンスを取得
    static get(): Globals {
        if (Globals.instance === null) {
            Globals.instance = new Globals();
        }
        return Globals.instance;
    }

    //--------------------------------------------
    serverDataMan: ServerDataManager;
    continue: boolean;


    //外部からインスタンス化できないようにコンストラクタは private にする
    private constructor() {
        this.serverDataMan = new ServerDataManager();
        this.continue = false;

        this.reset();
    }

    reset(): void {
        this.continue = false;
    }


}