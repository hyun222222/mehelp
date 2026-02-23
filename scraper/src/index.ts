import dotenv from 'dotenv';
dotenv.config();

import * as fs from 'fs';
import * as path from 'path';
import { crawlAllForms, crawlAllCases } from './crawlers/helplaw24';
import { crawlProseForms } from './crawlers/prose';
import { Logger } from './utils/logger';

const logger = new Logger('main');
const OUTPUT_DIR = path.join(__dirname, '..', 'output');
if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });

type Target = 'all' | 'forms' | 'cases' | 'prose';

function getTarget(): Target {
    const args = process.argv.slice(2);
    const targetIdx = args.indexOf('--target');
    if (targetIdx !== -1 && args[targetIdx + 1]) {
        return args[targetIdx + 1] as Target;
    }
    return 'all';
}

async function main() {
    const target = getTarget();
    logger.info(`크롤링 시작 (대상: ${target})`);
    logger.info(`시작 시간: ${new Date().toLocaleString('ko-KR')}`);

    let totalForms = 0;
    let totalCases = 0;
    let totalFiles = 0;
    const allFailed: string[] = [];

    try {
        // 1. Helplaw24 법률서식
        if (target === 'all' || target === 'forms') {
            logger.info('\n━━━ 법률서식 크롤링 시작 (helplaw24.go.kr) ━━━');
            const formsResult = await crawlAllForms();
            totalForms += formsResult.total;
            allFailed.push(...formsResult.failed);
        }

        // 2. Helplaw24 법률사례
        if (target === 'all' || target === 'cases') {
            logger.info('\n━━━ 법률사례 크롤링 시작 (helplaw24.go.kr) ━━━');
            const casesResult = await crawlAllCases();
            totalCases += casesResult.total;
            allFailed.push(...casesResult.failed);
        }

        // 3. 나홀로소송 서식
        if (target === 'all' || target === 'prose') {
            logger.info('\n━━━ 나홀로소송 서식 크롤링 시작 (pro-se.scourt.go.kr) ━━━');
            const proseResult = await crawlProseForms();
            totalForms += proseResult.total;
            allFailed.push(...proseResult.failed);
        }

    } catch (err) {
        logger.error('치명적 오류 발생', err);
    }

    // Save failed items
    if (allFailed.length > 0) {
        const failedPath = path.join(OUTPUT_DIR, 'failed.json');
        fs.writeFileSync(failedPath, JSON.stringify(allFailed, null, 2), 'utf-8');
        logger.warn(`실패 항목 ${allFailed.length}건 → ${failedPath}`);
    }

    logger.summary(totalForms, totalCases, totalFiles, allFailed.length);
    logger.info(`완료 시간: ${new Date().toLocaleString('ko-KR')}`);
}

main().catch((err) => {
    logger.error('Unexpected error', err);
    process.exit(1);
});
