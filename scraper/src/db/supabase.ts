import { createClient, SupabaseClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseKey) {
    throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env');
}

export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseKey, {
    auth: { persistSession: false },
});

export interface LegalFormRow {
    title: string;
    category: string;
    subcategory?: string;
    description?: string;
    content?: string;
    file_urls?: any[];
    source: string;
    source_url?: string;
    source_id: string;
    tags?: string[];
}

export interface LegalCaseRow {
    title: string;
    case_type: '상담사례' | '구조사례';
    category: string;
    subcategory?: string;
    question?: string;
    answer?: string;
    facts?: string;
    legal_issue?: string;
    conclusion?: string;
    related_laws?: string[];
    source: string;
    source_url?: string;
    source_id: string;
    tags?: string[];
}

/** Upsert a legal form. Skips duplicates via source_id conflict. */
export async function upsertForm(form: LegalFormRow): Promise<boolean> {
    const { error } = await supabase
        .from('legal_forms')
        .upsert(form, { onConflict: 'source_id' });

    if (error) {
        console.error(`[DB] Failed to upsert form "${form.title}": ${error.message}`);
        return false;
    }
    return true;
}

/** Upsert a legal case. Skips duplicates via source_id conflict. */
export async function upsertCase(caseRow: LegalCaseRow): Promise<boolean> {
    const { error } = await supabase
        .from('legal_cases')
        .upsert(caseRow, { onConflict: 'source_id' });

    if (error) {
        console.error(`[DB] Failed to upsert case "${caseRow.title}": ${error.message}`);
        return false;
    }
    return true;
}

/** Get existing source_ids from a table to allow skipping. */
export async function getExistingSourceIds(table: 'legal_forms' | 'legal_cases'): Promise<Set<string>> {
    const ids = new Set<string>();
    let page = 0;
    const pageSize = 1000;
    while (true) {
        const { data, error } = await supabase
            .from(table)
            .select('source_id')
            .range(page * pageSize, (page + 1) * pageSize - 1);

        if (error) {
            console.error(`[DB] Error fetching existing ${table} source_ids: ${error.message}`);
            break;
        }
        if (!data || data.length === 0) break;
        data.forEach((row: any) => {
            if (row.source_id) ids.add(row.source_id);
        });
        if (data.length < pageSize) break;
        page++;
    }
    return ids;
}
