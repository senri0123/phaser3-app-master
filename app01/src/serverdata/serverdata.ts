
export type ServerData = {
    key: string;
    value: string;
}

type innerSaverData = {
    value: string;
    dirty: boolean;
}

export class ServerDataManager {

    private serverData: Map<string, innerSaverData>;

    constructor() {
        this.serverData = new Map<string, innerSaverData>();
    }

    set(data: ServerData): void {

        if (this.serverData.has(data.key)) {
            const cur = this.serverData.get(data.key);
            if (cur?.value === data.value) {
                return; //同じデータなので保存の必要なし
            }
        }

        const innerData: innerSaverData = {
            value: data.value,
            dirty: true,
        };
        this.serverData.set(data.key, innerData);
    }

    get(key: string): string {
        const data = this.serverData.get(key);
        if (data) {
            return data.value;
        }
        else {
            return "";
        }
    }

    has(key: string): boolean {
        return this.serverData.has(key);
    }

    getDirtyValues(): ServerData[] {
        let data: ServerData[] = [];

        this.serverData.forEach((value: innerSaverData, key: string) => {
            if (value.dirty) {
                data.push({ key: key, value: value.value });
            }
        })

        return data;
    }

    clearDitry(): void {
        this.serverData.forEach((value: innerSaverData, key: string) => {
            value.dirty = false;
        })
    }
}