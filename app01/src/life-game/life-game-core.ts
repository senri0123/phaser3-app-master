import { Consts } from "../consts";
//ライフゲームコアの初期設定
export type CoreConfig = {
    cols: number;   //横にセルが何個あるか
    rows: number;   //縦にセルが何個あるか
    loopEnable: boolean;    //画面端でループさせるか
}

//セル情報
export class UpdateCellInfo {

    col: number;
    row: number;
    stat: number;
    lastStat: number;

    constructor(col: number, row: number, stat: number, lastStat: number) {
        this.col = col;
        this.row = row;
        this.stat = stat;
        this.lastStat = lastStat;
    }
}

// export const CoreConsts = {
//     Cell: {
//         //セルの状態
//         Stat: {
//             NONE: 0,     //未定義
//             ALIVE: 1,    //生存
//             DEAD: 2,     //死亡
//         },
//     },
// }

class Cell {

    private stat: number;       //セルの状態(CoreConsts.Cell.Stat)

    constructor() {
        this.stat = Consts.LifeGame.Cell.Stat.DEAD;
    }

    //セルの状態を取得する
    getStat(): number {
        return this.stat;
    }

    //セルの状態を設定する
    setStat(stat: number) {
        this.stat = stat;
    }

}

export class Core {

    private config: CoreConfig;     //コンフィグ
    private cells: Cell[];      //セル
    private generation: number; //現在の世代数

    constructor(config: CoreConfig) {
        this.config = config;
        this.cells = [];
        this.generation = 0;

        //初期化を行う
        this._init();
    }

    //セルの状態を設定する
    setCellStat(row: number, col: number, stat: number) {
        const index = this._coords2index(row, col);
        if (index < 0) {
            return; //範囲外なので無視
        }
        //セルに状態をセットする
        this.cells[index].setStat(stat);
    }

    //セルの状態を取得する
    getCellStat(row: number, col: number): number {
        const index = this._coords2index(row, col);
        if (index < 0) {
            return Consts.LifeGame.Cell.Stat.NONE;
        }
        //セルの状態を返す
        return this.cells[index].getStat();
    }

    //現在の世代数を取得する
    getGeneration(): number {
        return this.generation;
    }

    //世代を進める
    proceed(): UpdateCellInfo[] {
        let info: UpdateCellInfo[] = [];

        //まず変更後のステータスを決める
        for (let r = 0; r < this.config.rows; r++) {
            for (let c = 0; c < this.config.cols; c++) {
                const lastStat = this.getCellStat(r, c);
                const stat = this._nextStat(r, c);
                if (stat === Consts.LifeGame.Cell.Stat.NONE) {
                    continue;   //変化なし
                }
                if (lastStat !== stat) {
                    info.push(new UpdateCellInfo(c, r, stat, lastStat));
                }
            }
        }

        //変更後のステータスをセットする
        for (let i = 0; i < info.length; i++) {
            this.setCellStat(info[i].row, info[i].col, info[i].stat);
        }

        //世代数を進める
        this.generation++;

        return info;
    }

    //初期状態に戻す
    reset(): void {
        for (let i = 0; i < this.cells.length; i++) {
            this.cells[i].setStat(Consts.LifeGame.Cell.Stat.DEAD);
        }
    }

    getAliveCount(): number {
        let count = 0;

        for (let i = 0; i < this.cells.length; i++) {
            const stat = this.cells[i].getStat();
            if (stat === Consts.LifeGame.Cell.Stat.ALIVE) {
                count++;
            }
        }

        return count;
    }

    //現在の状態を文字列で返す
    getData(): string {
        let text: string = "";

        let count = 0;
        let value = 0;
        for (let i = 0; i < this.cells.length; i++) {

            //現在の状態を追加
            const stat = this.cells[i].getStat();
            if (stat === Consts.LifeGame.Cell.Stat.ALIVE) {
                value |= (1 << count);
            }

            count++;
            if (count === 4) {
                //4つ揃ったので文字列化する
                text += value.toString(16);
                value = 0;
                count = 0;
            }
        }

        //文字列化できていない物があれば追加する
        if (count > 0 && count < 4) {
            text += value.toString(16);
        }

        return text;
    }

    //文字列から状態を復帰する
    restoreFromString(text: string): void {
        let statArray: number[] = [];

        //文字列から各セルのステータスを復元
        for (let i = 0; i < text.length; i++) {
            let temp = text.substring(i, i + 1);
            let value = parseInt(temp, 16);

            for (let j = 0; j < 4; j++) {
                //下位1ビットを取り出す
                statArray.push((value >> j) & 1);
            }
        }

        //全セルをリセット
        this.reset();
        //各セルに設定していく
        for (let i = 0; i < this.cells.length; i++) {
            let stat = Consts.LifeGame.Cell.Stat.DEAD;
            if (i < statArray.length) {
                if (statArray[i] > 0) {
                    stat = Consts.LifeGame.Cell.Stat.ALIVE;
                }
            }
            this.cells[i].setStat(stat);
        }
    }




    //初期化
    private _init() {
        //セルの初期化
        for (let r = 0; r < this.config.rows; r++) {
            for (let c = 0; c < this.config.cols; c++) {
                const cell = new Cell()
                this.cells.push(cell);
            }
        }
    }

    //縦横の座標からインデックスを取得する
    protected _coords2index(row: number, col: number): number {
        if (row < 0 || row >= this.config.rows) {
            return -1;  //範囲外
        }
        if (col < 0 || col >= this.config.cols) {
            return -1;  //範囲外
        }

        const index = col * this.config.cols + row;
        return index;
    }

    protected _nextStat(row: number, col: number): number {
        //周囲の生存セル数を取得
        const aliveCount = this._getNeighborAliveCount(row, col);

        const cellStat = this.getCellStat(row, col);
        switch (cellStat) {
            case Consts.LifeGame.Cell.Stat.ALIVE: {
                //生存中
                switch (aliveCount) {
                    case 2:
                    case 3:
                        //隣接生存数が 2 or 3 なら生存継続(ステータス変更しない)
                        return Consts.LifeGame.Cell.Stat.NONE;
                    default:
                        //それ以外は死亡
                        return Consts.LifeGame.Cell.Stat.DEAD;
                }
                break;  //FAIL SAFE
            }

            case Consts.LifeGame.Cell.Stat.DEAD: {
                //死亡中
                switch (aliveCount) {
                    case 3:
                        //隣接生存数が 3 なら誕生
                        return Consts.LifeGame.Cell.Stat.ALIVE;

                    default:
                        //それ以外は死亡継続(ステータス変更しない)
                        return Consts.LifeGame.Cell.Stat.NONE;
                }
                break;  //FAIL SAFE
            }
        }
        return Consts.LifeGame.Cell.Stat.NONE;
    }

    protected _getNeighborAliveCount(row: number, col: number) {
        //周囲のセルのインデックス
        const indices: number[][] = [
            [row - 1, col - 1],
            [row, col - 1],
            [row + 1, col - 1],
            [row - 1, col],
            //[row, col],   //自分自身は判定しない
            [row + 1, col],
            [row - 1, col + 1],
            [row, col + 1],
            [row + 1, col + 1],
        ];

        let aliveCount: number = 0;

        for (let i = 0; i < indices.length; i++) {
            let r = indices[i][0];
            let c = indices[i][1];

            if (this.config.loopEnable) {
                if (r < 0) { r += this.config.rows; }
                if (c < 0) { c += this.config.cols; }
                r %= this.config.rows;
                c %= this.config.cols;
            }


            const cellStat = this.getCellStat(r, c);
            if (cellStat === Consts.LifeGame.Cell.Stat.ALIVE) {
                ++aliveCount;
            }
        }

        return aliveCount;
    }
}