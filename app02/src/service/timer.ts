export class Timer {
    protected active: boolean;
    protected current: number;

    constructor() {
        this.active = false;
        this.current = 0;
    }

    reset(): void {
        this.active = false;
        this.current = 0;
    }
    start(): void {
        this.active = true;
        this.current = 0;
    }
    pause(): void {
        this.active = false;
    }
    resume(): void {
        this.active = true;
    }
    get(): number {
        return this.current;
    }
    update(delta: number): void {
        if (this.active) {
            this.current += delta;
        }
    }
}

export class IntervalTimer extends Timer {
    protected duration: number;

    constructor(duration: number) {
        super();
        this.duration = duration;
    }

    update(delta: number): void {
        if (this.active) {
            this.current += delta;
            this.current = Math.min(this.current, this.duration);
        }
    }

    getRemain(): number {
        return this.duration - this.current;
    }
    getRemainPercentage(): number {
        if (this.duration > 0) {
            return (this.duration - this.current) / this.duration;
        }
        else {
            return 0;
        }
    }

    add(value: number): void {
        this.current += value;
        this.current = Math.min(this.current, this.duration);
        this.current = Math.max(this.current, 0);
    }
}