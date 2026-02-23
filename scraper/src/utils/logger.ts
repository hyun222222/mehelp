export class Logger {
    private context: string;

    constructor(context: string) {
        this.context = context;
    }

    progress(current: number, total: number, message: string): void {
        const pct = total > 0 ? Math.round((current / total) * 100) : 0;
        console.log(`[${current}/${total}] (${pct}%) ${message}`);
    }

    info(message: string): void {
        console.log(`[${this.context}] ${message}`);
    }

    warn(message: string): void {
        console.warn(`[${this.context}] ⚠ ${message}`);
    }

    error(message: string, err?: unknown): void {
        console.error(`[${this.context}] ✖ ${message}`, err instanceof Error ? err.message : '');
    }

    success(message: string): void {
        console.log(`[${this.context}] ✔ ${message}`);
    }

    summary(forms: number, cases: number, files: number, failed: number): void {
        console.log('\n========================================');
        console.log(`  수집 완료 요약`);
        console.log(`  서식: ${forms}건`);
        console.log(`  사례: ${cases}건`);
        console.log(`  파일: ${files}건`);
        console.log(`  실패: ${failed}건`);
        console.log('========================================\n');
    }
}
