/**
 * Enrich existing legal_forms records with attachment download URLs.
 * 
 * Strategy:
 * 1. Re-scan helplaw24 list API to get atchFileList for each form
 * 2. Build download URLs from atchFileId + atchFileSeq
 * 3. Download each file and upload to Supabase Storage (legal-files bucket)
 * 4. Update the form's file_urls column in Supabase
 */

import axios from 'axios';
import { supabase } from './db/supabase';
import { Logger } from './utils/logger';
import { RateLimiter } from './utils/rate-limiter';

const BASE_URL = 'https://www.helplaw24.go.kr';
const API_LIST = `${BASE_URL}/api/lwaCtgry/findUseLwaCtgryTmpltList`;
const DOWNLOAD_URL = `${BASE_URL}/api/download`;
const BUCKET = 'legal-files';

const logger = new Logger('enrich');
const rateLimiter = new RateLimiter(1500, 5);

const HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36',
    'Accept': 'application/json, text/plain, */*',
    'Referer': `${BASE_URL}/statuteinfo/template/korea/list`,
};

interface AtchFileEntry {
    atchFileId: string;
    atchFileSeq: number;
    pdfId?: string;
    atchFileExtnNm?: string;
    atchFileDwnldCnt?: number;
}

interface FormConfig {
    instNo: string;
    sourceName: string;
    referer: string;
}

const FORM_CONFIGS: FormConfig[] = [
    // {
    //     instNo: 'I001000000',
    //     sourceName: '대한법률구조공단',
    //     referer: `${BASE_URL}/statuteinfo/template/korea/list`,
    // },
    {
        instNo: 'I012000000', // FIXED from I002000000
        sourceName: '법원 소송안내마당',
        referer: `${BASE_URL}/statuteinfo/template/supremecourt/list`,
    },
];

async function ensureBucket() {
    const { data: buckets } = await supabase.storage.listBuckets();
    const exists = buckets?.some(b => b.name === BUCKET);
    if (!exists) {
        const { error } = await supabase.storage.createBucket(BUCKET, { public: true });
        if (error) {
            logger.error(`Failed to create bucket: ${error.message}`);
        } else {
            logger.info(`Created bucket: ${BUCKET}`);
        }
    } else {
        logger.info(`Bucket exists: ${BUCKET}`);
    }
}

async function downloadFile(atchFileId: string, atchFileSeq: number): Promise<Buffer | null> {
    try {
        const resp = await axios.get(DOWNLOAD_URL, {
            params: { atchFileId, atchFileSeq },
            headers: HEADERS,
            responseType: 'arraybuffer',
            timeout: 30000,
        });
        if (resp.status === 200 && resp.data?.length > 100) {
            return Buffer.from(resp.data);
        }
        return null;
    } catch {
        return null;
    }
}

async function uploadToStorage(fileName: string, data: Buffer, contentType: string): Promise<string | null> {
    const storagePath = `forms/${fileName}`;
    const { error } = await supabase.storage
        .from(BUCKET)
        .upload(storagePath, data, {
            contentType,
            upsert: true,
        });

    if (error) {
        logger.error(`Upload failed for ${fileName}: ${error.message}`);
        return null;
    }

    const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(storagePath);
    return urlData?.publicUrl || null;
}

async function fetchAllFormAttachments(config: FormConfig): Promise<Map<string, AtchFileEntry[]>> {
    const result = new Map<string, AtchFileEntry[]>();
    const headers = { ...HEADERS, Referer: config.referer };

    // Get total count first
    const firstResp = await axios.get(API_LIST, {
        params: {
            instNo: config.instNo,
            page: 1,
            size: 10,
            desc: '', keywordType: '', keyword: '', tmpltCtgryNo: '', sortOrder: '',
        },
        headers,
    });

    const totalElements = firstResp.data?.totalElements || 0;
    const totalPages = Math.ceil(totalElements / 10);
    logger.info(`${config.sourceName}: ${totalElements}건, ${totalPages}페이지`);

    for (let page = 1; page <= totalPages; page++) {
        try {
            const resp = await rateLimiter.execute(() =>
                axios.get(API_LIST, {
                    params: {
                        instNo: config.instNo,
                        page,
                        size: 10,
                        desc: '', keywordType: '', keyword: '', tmpltCtgryNo: '', sortOrder: '',
                    },
                    headers,
                })
            );

            const items = resp.data?.content || [];
            for (const item of items) {
                const sourceId = `helplaw24-form-${item.tmpltNo}`;
                const files: AtchFileEntry[] = (item.atchFileList || []).map((f: any) => ({
                    atchFileId: f.atchFileId,
                    atchFileSeq: f.atchFileSeq,
                    pdfId: f.pdfId,
                    atchFileExtnNm: f.atchFileExtnNm || 'hwp',
                    atchFileDwnldCnt: f.atchFileDwnldCnt,
                }));
                if (files.length > 0) {
                    result.set(sourceId, files);
                }
            }

            if (page % 50 === 0) {
                logger.progress(page, totalPages, `스캔 중`);
            }
        } catch (err: any) {
            logger.error(`Page ${page} error: ${err.message}`);
        }
    }

    return result;
}

async function main() {
    logger.info('=== 서식 첨부파일 보강 시작 ===');
    logger.info(`시작 시간: ${new Date().toLocaleString('ko-KR')}\n`);

    await ensureBucket();

    // Phase 1: Collect all attachment info from API
    logger.info('\n--- Phase 1: API에서 첨부파일 정보 수집 ---');
    const allAttachments = new Map<string, AtchFileEntry[]>();

    for (const config of FORM_CONFIGS) {
        const attachments = await fetchAllFormAttachments(config);
        attachments.forEach((v, k) => allAttachments.set(k, v));
    }

    logger.info(`\n첨부파일 있는 서식: ${allAttachments.size}건`);

    // Phase 2: Get existing forms from DB
    logger.info('\n--- Phase 2: DB에서 기존 서식 조회 ---');
    let allForms: any[] = [];
    let page = 0;
    while (true) {
        const { data, error } = await supabase
            .from('legal_forms')
            .select('id, source_id, file_urls')
            .range(page * 1000, (page + 1) * 1000 - 1);
        if (error || !data || data.length === 0) break;
        allForms.push(...data);
        if (data.length < 1000) break;
        page++;
    }
    logger.info(`DB 서식: ${allForms.length}건`);

    // Phase 3: Download files & upload to storage & update DB
    logger.info('\n--- Phase 3: 파일 다운로드 → 스토리지 업로드 → DB 업데이트 ---');
    let updated = 0;
    let skipped = 0;
    let failed = 0;
    const total = allForms.length;

    for (let i = 0; i < allForms.length; i++) {
        const form = allForms[i];
        const attachments = allAttachments.get(form.source_id);

        if (!attachments || attachments.length === 0) {
            skipped++;
            continue;
        }

        // Check if already has valid file_urls
        if (form.file_urls && form.file_urls.length > 0 && form.file_urls[0]?.url?.includes(BUCKET)) {
            skipped++;
            continue;
        }

        const fileUrls: { name: string; url: string }[] = [];

        for (const atch of attachments) {
            const ext = atch.atchFileExtnNm || 'hwp';
            const fileName = `${form.source_id}_${atch.atchFileSeq}.${ext}`;

            // Download the file
            const fileData = await rateLimiter.execute(() =>
                downloadFile(atch.atchFileId, atch.atchFileSeq)
            );

            if (fileData) {
                const contentType = ext === 'pdf' ? 'application/pdf' : 'application/octet-stream';
                const publicUrl = await uploadToStorage(fileName, fileData, contentType);

                if (publicUrl) {
                    fileUrls.push({ name: `${fileName}`, url: publicUrl });
                } else {
                    // Fallback: store the helplaw24 download URL directly
                    fileUrls.push({
                        name: fileName,
                        url: `${DOWNLOAD_URL}?atchFileId=${atch.atchFileId}&atchFileSeq=${atch.atchFileSeq}`,
                    });
                }
            } else {
                // Store direct download URL even if download failed
                fileUrls.push({
                    name: fileName,
                    url: `${DOWNLOAD_URL}?atchFileId=${atch.atchFileId}&atchFileSeq=${atch.atchFileSeq}`,
                });
            }
        }

        // Update DB
        const { error } = await supabase
            .from('legal_forms')
            .update({ file_urls: fileUrls })
            .eq('id', form.id);

        if (error) {
            logger.error(`DB update failed for ${form.source_id}: ${error.message}`);
            failed++;
        } else {
            updated++;
        }

        if ((i + 1) % 50 === 0) {
            logger.progress(i + 1, total, `업데이트: ${updated}건, 스킵: ${skipped}건, 실패: ${failed}건`);
        }
    }

    logger.info('\n========================================');
    logger.info(`  보강 완료!`);
    logger.info(`  업데이트: ${updated}건`);
    logger.info(`  스킵: ${skipped}건`);
    logger.info(`  실패: ${failed}건`);
    logger.info(`  완료 시간: ${new Date().toLocaleString('ko-KR')}`);
    logger.info('========================================');
}

main().catch(e => {
    logger.error(`FATAL: ${e.message}`);
    process.exit(1);
});
