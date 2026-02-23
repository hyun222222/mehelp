export interface LegalForm {
    id: string;
    title: string;
    category: string;
    subcategory: string | null;
    description: string | null;
    content: string | null;
    file_urls: { name: string; url: string }[];
    source: string;
    source_url: string | null;
    source_id: string;
    tags: string[];
    view_count: number;
    created_at: string;
    updated_at: string;
}

export interface LegalCase {
    id: string;
    title: string;
    case_type: '상담사례' | '구조사례';
    category: string;
    subcategory: string | null;
    question: string | null;
    answer: string | null;
    facts: string | null;
    legal_issue: string | null;
    conclusion: string | null;
    related_laws: string[];
    source: string;
    source_url: string | null;
    source_id: string;
    tags: string[];
    view_count: number;
    created_at: string;
}

export interface CategoryStat {
    category: string;
    type: 'forms' | 'cases';
    count: number;
}
