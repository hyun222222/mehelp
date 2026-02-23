import axios from 'axios';
import * as cheerio from 'cheerio';
import { Logger } from '../utils/logger';
import { RateLimiter } from '../utils/rate-limiter';
import { upsertForm, getExistingSourceIds, LegalFormRow } from '../db/supabase';
import { downloadAndUpload } from '../storage/uploader';

const logger = new Logger('prose-scourt');
const rateLimiter = new RateLimiter(2000, 3);

const BASE_URL = 'https://pro-se.scourt.go.kr';

const client = axios.create({
    timeout: 30000,
    headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/html,application/xhtml+xml',
    },
});

// ──────────────────────────────────────────────
// 나홀로소송 서식 크롤러
// pro-se.scourt.go.kr (JSP pages, not SPA)
// ──────────────────────────────────────────────

interface ProseFormItem {
    title: string;
    category: string;
    detailUrl: string;
    fileUrl?: string;
    fileName?: string;
}

/**
 * Crawl the '나홀로소송' (Pro Se Litigation) form pages.
 * These are standard JSP pages so we use axios + cheerio.
 */
export async function crawlProseForms(): Promise<{ total: number; failed: string[] }> {
    let totalInserted = 0;
    const allFailed: string[] = [];

    const existingIds = await getExistingSourceIds('legal_forms');
    logger.info(`기존 서식 ${existingIds.size}건 발견 (스킵 대상)`);

    // Target pages
    const pages = [
        { url: `${BASE_URL}/wsh/wshA00/WSHA10.jsp`, label: '서식모음 (WSHA10)' },
        { url: `${BASE_URL}/wsh/wsh500/WSH5A0.jsp`, label: '서식모음 (WSH5A0)' },
    ];

    for (const pageConfig of pages) {
        logger.info(`\n=== ${pageConfig.label} 수집 시작 ===`);

        try {
            const items = await scrapeProseListPage(pageConfig.url);
            logger.info(`${items.length}건 발견`);

            for (let i = 0; i < items.length; i++) {
                const item = items[i];
                const sourceId = `prose-${encodeURIComponent(item.title)}-${i}`;

                if (existingIds.has(sourceId)) {
                    continue;
                }

                const fileUrls: any[] = [];

                // Download attached file if available
                if (item.fileUrl) {
                    const fileName = item.fileName || `prose_${i}.hwp`;
                    const uploaded = await rateLimiter.execute(() =>
                        downloadAndUpload(item.fileUrl!, fileName, `forms/prose`)
                    );
                    if (uploaded) {
                        fileUrls.push({ name: fileName, url: uploaded });
                    }
                }

                const formRow: LegalFormRow = {
                    title: item.title,
                    category: item.category || '민사',
                    subcategory: undefined,
                    description: undefined,
                    content: undefined,
                    file_urls: fileUrls,
                    source: '나홀로소송 (대법원)',
                    source_url: item.detailUrl || pageConfig.url,
                    source_id: sourceId,
                    tags: ['나홀로소송'],
                };

                const ok = await upsertForm(formRow);
                if (ok) {
                    totalInserted++;
                    logger.progress(totalInserted, items.length, `수집 중: ${formRow.title}`);
                } else {
                    allFailed.push(sourceId);
                }
            }
        } catch (err) {
            logger.error(`Failed to crawl ${pageConfig.label}`, err);
        }
    }

    return { total: totalInserted, failed: allFailed };
}

/**
 * Scrape a single JSP list page to extract form items.
 */
async function scrapeProseListPage(url: string): Promise<ProseFormItem[]> {
    const items: ProseFormItem[] = [];

    try {
        const { data: html } = await rateLimiter.execute(() => client.get<string>(url));
        const $ = cheerio.load(html);

        // The structure varies, so we try multiple selectors
        // Look for table rows or list items with links
        $('table tbody tr, .list-group-item, .board-list tr').each((_idx, el) => {
            const $el = $(el);

            // Try to extract title from anchor tags
            const $link = $el.find('a').first();
            const title = $link.text().trim();
            if (!title || title.length < 2) return;

            let href = $link.attr('href') || '';
            if (href && !href.startsWith('http')) {
                href = `${BASE_URL}${href.startsWith('/') ? '' : '/'}${href}`;
            }

            // Look for file download links (HWP, DOCX, PDF)
            let fileUrl: string | undefined;
            let fileName: string | undefined;
            $el.find('a').each((_i, aEl) => {
                const aHref = $(aEl).attr('href') || '';
                const aText = $(aEl).text().trim();
                if (/\.(hwp|docx|pdf|doc)$/i.test(aHref) || /\.(hwp|docx|pdf|doc)$/i.test(aText)) {
                    fileUrl = aHref.startsWith('http') ? aHref : `${BASE_URL}${aHref.startsWith('/') ? '' : '/'}${aHref}`;
                    fileName = aText || aHref.split('/').pop() || undefined;
                }
            });

            // Try to extract category from a category cell
            const categoryCell = $el.find('td').eq(1).text().trim() || $el.find('.category').text().trim();

            items.push({
                title,
                category: categoryCell || '민사',
                detailUrl: href,
                fileUrl,
                fileName,
            });
        });
    } catch (err) {
        logger.error(`Failed to parse ${url}`, err);
    }

    return items;
}
