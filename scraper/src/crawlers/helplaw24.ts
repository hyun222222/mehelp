import axios, { AxiosInstance } from 'axios';
import { Logger } from '../utils/logger';
import { RateLimiter } from '../utils/rate-limiter';
import { upsertForm, upsertCase, getExistingSourceIds, LegalFormRow, LegalCaseRow } from '../db/supabase';
import { downloadAndUpload } from '../storage/uploader';
import * as fs from 'fs';
import * as path from 'path';

const BASE_URL = 'https://www.helplaw24.go.kr';
const API_BASE = `${BASE_URL}/api/lwaCtgry`;

const logger = new Logger('helplaw24');
const rateLimiter = new RateLimiter(2000, 3);

const OUTPUT_DIR = path.join(__dirname, '..', '..', 'output');
if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });

const client: AxiosInstance = axios.create({
    baseURL: API_BASE,
    timeout: 30000,
    headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36',
        'Accept': 'application/json, text/plain, */*',
        'Referer': `${BASE_URL}/statuteinfo/template/korea/list`,
    },
});

// ──────────────────────────────────────────────
// Types for API Responses
// ──────────────────────────────────────────────

interface TmpltListResponse {
    content: TmpltItem[];
    totalElements: number;
    totalPages: number;
}

interface TmpltItem {
    tmpltNo: string;
    tmpltNm: string;
    ctgryNm?: string;
    upCtgryNm?: string;
    tmpltCn?: string;
    tmpltDc?: string;
    atchFileList?: AtchFile[];
    inqCnt?: number;
}

interface AtchFile {
    atchFileNo?: string;
    fileNm?: string;
    filePath?: string;
    orgnlFileNm?: string;
}

interface CaseListResponse {
    content: CaseItem[];
    totalElements: number;
    totalPages: number;
}

interface CaseItem {
    caseNo: string;
    caseTtl: string;
    ctgryNm?: string;
    upCtgryNm?: string;
    caseQestn?: string;
    caseAnswr?: string;
    caseFacts?: string;
    caseLglIssu?: string;
    caseCnclsn?: string;
    reltLaw?: string;
    inqCnt?: number;
}

// ──────────────────────────────────────────────
// Template Detail API
// ──────────────────────────────────────────────
async function fetchTemplateDetail(tmpltNo: string): Promise<TmpltItem | null> {
    try {
        const res = await client.get('/findUseLwaCtgryTmpltDtl', {
            params: { tmpltNo },
        });
        return res.data || null;
    } catch (err) {
        logger.error(`Failed to fetch template detail ${tmpltNo}`, err);
        return null;
    }
}

// ──────────────────────────────────────────────
// Case Detail API
// ──────────────────────────────────────────────
async function fetchCaseDetail(caseNo: string): Promise<CaseItem | null> {
    try {
        const res = await client.get('/findUseLwaCtgryCaseDtl', {
            params: { caseNo },
        });
        return res.data || null;
    } catch (err) {
        logger.error(`Failed to fetch case detail ${caseNo}`, err);
        return null;
    }
}

// ──────────────────────────────────────────────
// Crawl Forms (법률서식)
// ──────────────────────────────────────────────
interface FormsCrawlConfig {
    instNo: string;
    sourceName: string;
    sourceLabel: string;
    referer: string;
}

const FORMS_CONFIGS: FormsCrawlConfig[] = [
    { instNo: 'I001000000', sourceName: '대한법률구조공단', sourceLabel: '공단 서식', referer: `${BASE_URL}/statuteinfo/template/korea/list` },
    { instNo: 'I012000000', sourceName: '법원 소송안내마당', sourceLabel: '법원 서식', referer: `${BASE_URL}/statuteinfo/template/supremecourt/list` },
];

export async function crawlAllForms(): Promise<{ total: number; failed: string[] }> {
    let totalInserted = 0;
    const allFailed: string[] = [];

    const existingIds = await getExistingSourceIds('legal_forms');
    logger.info(`기존 서식 ${existingIds.size}건 발견 (스킵 대상)`);

    for (const config of FORMS_CONFIGS) {
        logger.info(`\n=== ${config.sourceLabel} 수집 시작 (instNo: ${config.instNo}) ===`);

        try {
            // Fetch first page to get total count
            const firstPage = await rateLimiter.execute(() =>
                client.get<TmpltListResponse>('/findUseLwaCtgryTmpltList', {
                    params: { page: 1, size: 10, desc: '', keywordType: '', keyword: '', upCtgryNo: '', ctgryNo: '', instNo: config.instNo, ctgryWholYn: '' },
                    headers: { 'Referer': config.referer },
                })
            );

            const totalElements = firstPage.data.totalElements;
            const totalPages = firstPage.data.totalPages;
            logger.info(`총 ${totalElements}건, ${totalPages} 페이지`);

            for (let page = 1; page <= totalPages; page++) {
                try {
                    const res = await rateLimiter.execute(() =>
                        client.get<TmpltListResponse>('/findUseLwaCtgryTmpltList', {
                            params: { page, size: 10, desc: '', keywordType: '', keyword: '', upCtgryNo: '', ctgryNo: '', instNo: config.instNo, ctgryWholYn: '' },
                            headers: { 'Referer': config.referer },
                        })
                    );

                    const items = res.data.content || [];

                    for (const item of items) {
                        const sourceId = `helplaw24-form-${item.tmpltNo}`;

                        if (existingIds.has(sourceId)) {
                            continue; // Skip already stored
                        }

                        // Use list data directly (detail API returns 404)
                        const fileUrls: any[] = [];
                        const atchFiles = item.atchFileList || [];
                        for (const file of atchFiles) {
                            if (file.filePath || file.atchFileNo) {
                                const downloadUrl = file.filePath
                                    ? `${BASE_URL}${file.filePath}`
                                    : `${BASE_URL}/api/cmm/downloadAtchFile?atchFileNo=${file.atchFileNo}`;
                                const fileName = file.orgnlFileNm || file.fileNm || `${item.tmpltNo}_file`;
                                fileUrls.push({ name: fileName, url: downloadUrl });
                            }
                        }

                        const formRow: LegalFormRow = {
                            title: item.tmpltNm,
                            category: item.upCtgryNm || item.ctgryNm || '기타',
                            subcategory: item.ctgryNm || undefined,
                            description: item.tmpltDc || undefined,
                            content: item.tmpltCn || undefined,
                            file_urls: fileUrls,
                            source: config.sourceName,
                            source_url: `${BASE_URL}/statuteinfo/template/detail/${item.tmpltNo}`,
                            source_id: sourceId,
                            tags: [],
                        };

                        const ok = await upsertForm(formRow);
                        if (ok) {
                            totalInserted++;
                            logger.progress(totalInserted, totalElements, `수집 중: ${formRow.title}`);
                        } else {
                            allFailed.push(sourceId);
                        }
                    }
                } catch (err) {
                    logger.error(`Page ${page} failed for ${config.sourceLabel}`, err);
                    allFailed.push(`page-${page}-${config.instNo}`);
                }
            }
        } catch (err) {
            logger.error(`Failed to start crawling ${config.sourceLabel}`, err);
        }
    }

    return { total: totalInserted, failed: allFailed };
}

// ──────────────────────────────────────────────
// Crawl Cases (법률사례)
// ──────────────────────────────────────────────
interface CasesCrawlConfig {
    upCtgryNo: string;
    caseType: '상담사례' | '구조사례';
    sourceLabel: string;
    referer: string;
}

const CASES_CONFIGS: CasesCrawlConfig[] = [
    { upCtgryNo: '2I001000001000000000', caseType: '상담사례', sourceLabel: '법률상담사례', referer: `${BASE_URL}/statuteinfo/discussion/list` },
    { upCtgryNo: '2I001000002000000000', caseType: '구조사례', sourceLabel: '법률구조사례', referer: `${BASE_URL}/statuteinfo/legalaid/list` },
];

export async function crawlAllCases(): Promise<{ total: number; failed: string[] }> {
    let totalInserted = 0;
    const allFailed: string[] = [];

    const existingIds = await getExistingSourceIds('legal_cases');
    logger.info(`기존 사례 ${existingIds.size}건 발견 (스킵 대상)`);

    for (const config of CASES_CONFIGS) {
        logger.info(`\n=== ${config.sourceLabel} 수집 시작 ===`);

        try {
            const firstPage = await rateLimiter.execute(() =>
                client.get<CaseListResponse>('/findUseLwaCtgryCaseList', {
                    params: { page: 1, size: 10, desc: '', keywordType: '', keyword: '', upCtgryNo: config.upCtgryNo, ctgryNo: '', instNo: '', ctgryWholYn: '' },
                    headers: { 'Referer': config.referer },
                })
            );

            const totalElements = firstPage.data.totalElements;
            const totalPages = firstPage.data.totalPages;
            logger.info(`총 ${totalElements}건, ${totalPages} 페이지`);

            for (let page = 1; page <= totalPages; page++) {
                try {
                    const res = await rateLimiter.execute(() =>
                        client.get<CaseListResponse>('/findUseLwaCtgryCaseList', {
                            params: { page, size: 10, desc: '', keywordType: '', keyword: '', upCtgryNo: config.upCtgryNo, ctgryNo: '', instNo: '', ctgryWholYn: '' },
                            headers: { 'Referer': config.referer },
                        })
                    );

                    const items = res.data.content || [];

                    for (const item of items) {
                        const sourceId = `helplaw24-case-${item.caseNo}`;

                        if (existingIds.has(sourceId)) {
                            continue;
                        }

                        // Use list data directly (detail API likely returns 404)
                        const caseRow: LegalCaseRow = {
                            title: item.caseTtl,
                            case_type: config.caseType,
                            category: item.upCtgryNm || item.ctgryNm || '기타',
                            subcategory: item.ctgryNm || undefined,
                            question: item.caseQestn || undefined,
                            answer: item.caseAnswr || undefined,
                            facts: item.caseFacts || undefined,
                            legal_issue: item.caseLglIssu || undefined,
                            conclusion: item.caseCnclsn || undefined,
                            related_laws: item.reltLaw ? [item.reltLaw] : [],
                            source: '대한법률구조공단',
                            source_url: `${BASE_URL}/statuteinfo/case/detail/${item.caseNo}`,
                            source_id: sourceId,
                            tags: [],
                        };

                        const ok = await upsertCase(caseRow);
                        if (ok) {
                            totalInserted++;
                            logger.progress(totalInserted, totalElements, `수집 중: ${caseRow.title}`);
                        } else {
                            allFailed.push(sourceId);
                        }
                    }
                } catch (err) {
                    logger.error(`Page ${page} failed for ${config.sourceLabel}`, err);
                    allFailed.push(`page-${page}-${config.upCtgryNo}`);
                }
            }
        } catch (err) {
            logger.error(`Failed to start crawling ${config.sourceLabel}`, err);
        }
    }

    return { total: totalInserted, failed: allFailed };
}
