/**
 * test-crawl.ts — 소규모 테스트: 각 유형별 1페이지(10건)씩만 수집
 * 실행: npx ts-node src/test-crawl.ts
 */
import dotenv from 'dotenv';
dotenv.config();

import axios from 'axios';
import { upsertForm, upsertCase, supabase, LegalFormRow, LegalCaseRow } from './db/supabase';
import { Logger } from './utils/logger';

const logger = new Logger('test-crawl');
const BASE_URL = 'https://www.helplaw24.go.kr';
const API_BASE = `${BASE_URL}/api/lwaCtgry`;

const client = axios.create({
    baseURL: API_BASE,
    timeout: 30000,
    headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36',
        'Accept': 'application/json, text/plain, */*',
        'Referer': `${BASE_URL}/statuteinfo/template/korea/list`,
    },
});

async function testConnection() {
    logger.info('1. Supabase 연결 테스트...');
    const { data, error } = await supabase.from('legal_forms').select('id').limit(1);
    if (error) {
        logger.error(`Supabase 연결 실패: ${error.message}`);
        return false;
    }
    logger.success('Supabase 연결 성공!');
    return true;
}

async function testFormsKorea() {
    logger.info('\n2. 법률서식 (공단) - 1페이지 테스트...');
    const res = await client.get('/findUseLwaCtgryTmpltList', {
        params: {
            page: 1,
            size: 10,
            desc: '',
            keywordType: '',
            keyword: '',
            upCtgryNo: '',
            ctgryNo: '',
            instNo: 'I001000000',
            ctgryWholYn: '',
        },
        headers: { 'Referer': `${BASE_URL}/statuteinfo/template/korea/list` },
    });
    const totalElements = res.data.totalElements;
    const items = res.data.content || [];
    logger.info(`총 ${totalElements}건 중 ${items.length}건 가져옴`);

    let success = 0;
    for (const item of items) {
        const formRow: LegalFormRow = {
            title: item.tmpltNm || '제목 없음',
            category: item.upCtgryNm || item.ctgryNm || '기타',
            subcategory: item.ctgryNm || undefined,
            description: item.tmpltDc || undefined,
            content: item.tmpltCn || undefined,
            file_urls: [],
            source: '대한법률구조공단',
            source_url: `${BASE_URL}/statuteinfo/template/detail/${item.tmpltNo}`,
            source_id: `helplaw24-form-${item.tmpltNo}`,
            tags: [],
        };
        const ok = await upsertForm(formRow);
        if (ok) success++;
        logger.progress(success, items.length, `${formRow.title}`);
    }
    logger.success(`공단 서식: ${success}/${items.length}건 저장 성공`);
    return success;
}

async function testFormsCourt() {
    logger.info('\n3. 법률서식 (법원) - 1페이지 테스트...');
    const res = await client.get('/findUseLwaCtgryTmpltList', {
        params: {
            page: 1,
            size: 10,
            desc: '',
            keywordType: '',
            keyword: '',
            upCtgryNo: '',
            ctgryNo: '',
            instNo: 'I012000000',
            ctgryWholYn: '',
        },
        headers: { 'Referer': `${BASE_URL}/statuteinfo/template/supremecourt/list` },
    });
    const totalElements = res.data.totalElements;
    const items = res.data.content || [];
    logger.info(`총 ${totalElements}건 중 ${items.length}건 가져옴`);

    let success = 0;
    for (const item of items) {
        const formRow: LegalFormRow = {
            title: item.tmpltNm || '제목 없음',
            category: item.upCtgryNm || item.ctgryNm || '기타',
            subcategory: item.ctgryNm || undefined,
            description: item.tmpltDc || undefined,
            content: item.tmpltCn || undefined,
            file_urls: [],
            source: '법원 소송안내마당',
            source_url: `${BASE_URL}/statuteinfo/template/detail/${item.tmpltNo}`,
            source_id: `helplaw24-form-${item.tmpltNo}`,
            tags: [],
        };
        const ok = await upsertForm(formRow);
        if (ok) success++;
        logger.progress(success, items.length, `${formRow.title}`);
    }
    logger.success(`법원 서식: ${success}/${items.length}건 저장 성공`);
    return success;
}

async function testConsultCases() {
    logger.info('\n4. 법률상담사례 - 1페이지 테스트...');
    const res = await client.get('/findUseLwaCtgryCaseList', {
        params: {
            page: 1,
            size: 10,
            desc: '',
            keywordType: '',
            keyword: '',
            upCtgryNo: '2I001000001000000000',
            ctgryNo: '',
            instNo: '',
            ctgryWholYn: '',
        },
        headers: { 'Referer': `${BASE_URL}/statuteinfo/discussion/list` },
    });
    const totalElements = res.data.totalElements;
    const items = res.data.content || [];
    logger.info(`총 ${totalElements}건 중 ${items.length}건 가져옴`);

    let success = 0;
    for (const item of items) {
        const caseRow: LegalCaseRow = {
            title: item.caseTtl || '제목 없음',
            case_type: '상담사례',
            category: item.upCtgryNm || item.ctgryNm || '기타',
            subcategory: item.ctgryNm || undefined,
            question: item.caseQestn || undefined,
            answer: item.caseAnswr || undefined,
            source: '대한법률구조공단',
            source_url: `${BASE_URL}/statuteinfo/case/detail/${item.caseNo}`,
            source_id: `helplaw24-case-${item.caseNo}`,
            tags: [],
        };
        const ok = await upsertCase(caseRow);
        if (ok) success++;
        logger.progress(success, items.length, `${caseRow.title}`);
    }
    logger.success(`상담사례: ${success}/${items.length}건 저장 성공`);
    return success;
}

async function testAidCases() {
    logger.info('\n5. 법률구조사례 - 1페이지 테스트...');
    const res = await client.get('/findUseLwaCtgryCaseList', {
        params: {
            page: 1,
            size: 10,
            desc: '',
            keywordType: '',
            keyword: '',
            upCtgryNo: '2I001000002000000000',
            ctgryNo: '',
            instNo: '',
            ctgryWholYn: '',
        },
        headers: { 'Referer': `${BASE_URL}/statuteinfo/legalaid/list` },
    });
    const totalElements = res.data.totalElements;
    const items = res.data.content || [];
    logger.info(`총 ${totalElements}건 중 ${items.length}건 가져옴`);

    let success = 0;
    for (const item of items) {
        const caseRow: LegalCaseRow = {
            title: item.caseTtl || '제목 없음',
            case_type: '구조사례',
            category: item.upCtgryNm || item.ctgryNm || '기타',
            subcategory: item.ctgryNm || undefined,
            facts: item.caseFacts || undefined,
            legal_issue: item.caseLglIssu || undefined,
            conclusion: item.caseCnclsn || undefined,
            source: '대한법률구조공단',
            source_url: `${BASE_URL}/statuteinfo/case/detail/${item.caseNo}`,
            source_id: `helplaw24-case-${item.caseNo}`,
            tags: [],
        };
        const ok = await upsertCase(caseRow);
        if (ok) success++;
        logger.progress(success, items.length, `${caseRow.title}`);
    }
    logger.success(`구조사례: ${success}/${items.length}건 저장 성공`);
    return success;
}

async function verifyData() {
    logger.info('\n6. DB 저장 검증...');
    const { count: formsCount } = await supabase.from('legal_forms').select('*', { count: 'exact', head: true });
    const { count: casesCount } = await supabase.from('legal_cases').select('*', { count: 'exact', head: true });
    logger.info(`DB 현황: legal_forms ${formsCount}건, legal_cases ${casesCount}건`);

    const { data: sampleForm } = await supabase.from('legal_forms').select('title, category, source').limit(3);
    const { data: sampleCase } = await supabase.from('legal_cases').select('title, case_type, category').limit(3);

    if (sampleForm && sampleForm.length > 0) {
        logger.info('서식 샘플:');
        sampleForm.forEach((f: any) => logger.info(`  - [${f.category}] ${f.title} (${f.source})`));
    }
    if (sampleCase && sampleCase.length > 0) {
        logger.info('사례 샘플:');
        sampleCase.forEach((c: any) => logger.info(`  - [${c.case_type}][${c.category}] ${c.title}`));
    }
}

async function main() {
    logger.info('=== 크롤러 소규모 테스트 시작 ===');
    logger.info(`시간: ${new Date().toLocaleString('ko-KR')}\n`);

    const connected = await testConnection();
    if (!connected) {
        process.exit(1);
    }

    let totalForms = 0;
    let totalCases = 0;

    try {
        totalForms += await testFormsKorea();
        totalForms += await testFormsCourt();
        totalCases += await testConsultCases();
        totalCases += await testAidCases();
        await verifyData();
    } catch (err) {
        logger.error('테스트 중 오류 발생', err);
    }

    logger.info('\n========================================');
    logger.info(`  테스트 완료!`);
    logger.info(`  서식 저장: ${totalForms}건`);
    logger.info(`  사례 저장: ${totalCases}건`);
    logger.info('========================================');
}

main().catch(console.error);
