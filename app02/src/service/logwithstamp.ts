
export class Log {
    static put(text: string, scope?: string) {
        const date = new Date();
        const Y = Log.zeroPadding(date.getFullYear(), 4);
        const M = Log.zeroPadding(date.getMonth() + 1, 2);
        const D = Log.zeroPadding(date.getDate(), 2);
        const h = Log.zeroPadding(date.getHours(), 2);
        const m = Log.zeroPadding(date.getMinutes(), 2);
        const s = Log.zeroPadding(date.getSeconds(), 2);
        const ms = Log.zeroPadding(date.getMilliseconds(), 3);

        if (scope === undefined) {
            scope = '';
        }

        // console.log(`${Y}-${M}-${D} ${h}:${m}:${s}.${ms} [${scope}] ${text}`);
    }

    private static zeroPadding(n: number, len: number) {
        return (Array(len).join('0') + n).slice(-len);
    }
}