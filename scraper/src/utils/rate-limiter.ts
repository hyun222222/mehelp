export class RateLimiter {
    private delayMs: number;
    private maxConcurrent: number;
    private activeCount: number = 0;
    private queue: Array<() => void> = [];

    constructor(delayMs: number = 2000, maxConcurrent: number = 3) {
        this.delayMs = delayMs;
        this.maxConcurrent = maxConcurrent;
    }

    async execute<T>(fn: () => Promise<T>): Promise<T> {
        await this.waitForSlot();
        this.activeCount++;
        try {
            const result = await fn();
            await this.delay();
            return result;
        } finally {
            this.activeCount--;
            this.processQueue();
        }
    }

    private waitForSlot(): Promise<void> {
        if (this.activeCount < this.maxConcurrent) {
            return Promise.resolve();
        }
        return new Promise<void>((resolve) => {
            this.queue.push(resolve);
        });
    }

    private processQueue(): void {
        if (this.queue.length > 0 && this.activeCount < this.maxConcurrent) {
            const next = this.queue.shift();
            if (next) next();
        }
    }

    private delay(): Promise<void> {
        return new Promise((resolve) => setTimeout(resolve, this.delayMs));
    }
}
