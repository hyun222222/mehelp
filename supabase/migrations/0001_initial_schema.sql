-- Enable pgcrypto for UUIDs
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. legal_forms (법률서식)
CREATE TABLE IF NOT EXISTS public.legal_forms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    subcategory TEXT,
    description TEXT,
    content TEXT,
    file_urls JSONB DEFAULT '[]'::JSONB,
    source TEXT NOT NULL,
    source_url TEXT,
    source_id TEXT UNIQUE,
    tags TEXT[] DEFAULT '{}',
    view_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. legal_cases (법률사례)
CREATE TABLE IF NOT EXISTS public.legal_cases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    case_type TEXT NOT NULL CHECK (case_type IN ('상담사례', '구조사례')),
    category TEXT NOT NULL,
    subcategory TEXT,
    question TEXT,
    answer TEXT,
    facts TEXT,
    legal_issue TEXT,
    conclusion TEXT,
    related_laws TEXT[] DEFAULT '{}',
    source TEXT NOT NULL,
    source_url TEXT,
    source_id TEXT UNIQUE,
    tags TEXT[] DEFAULT '{}',
    view_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. categories (카테고리)
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    parent_id UUID REFERENCES public.categories(id) ON DELETE CASCADE,
    icon TEXT,
    sort_order INTEGER DEFAULT 0,
    item_count INTEGER DEFAULT 0
);

-- 4. search_logs (검색 로그)
CREATE TABLE IF NOT EXISTS public.search_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    keyword TEXT NOT NULL,
    result_count INTEGER DEFAULT 0,
    searched_at TIMESTAMPTZ DEFAULT NOW()
);

-- 인덱스 (Indexes)
-- GIN indexes for full-text search (to_tsvector)
CREATE INDEX IF NOT EXISTS legal_forms_search_idx ON public.legal_forms USING GIN (to_tsvector('simple', title || ' ' || COALESCE(description, '') || ' ' || COALESCE(content, '')));
CREATE INDEX IF NOT EXISTS legal_cases_search_idx ON public.legal_cases USING GIN (to_tsvector('simple', title || ' ' || COALESCE(question, '') || ' ' || COALESCE(answer, '') || ' ' || COALESCE(facts, '')));

-- Category & Tags indexes
CREATE INDEX IF NOT EXISTS legal_forms_category_idx ON public.legal_forms(category);
CREATE INDEX IF NOT EXISTS legal_cases_category_idx ON public.legal_cases(category);
CREATE INDEX IF NOT EXISTS legal_forms_tags_idx ON public.legal_forms USING GIN (tags);
CREATE INDEX IF NOT EXISTS legal_cases_tags_idx ON public.legal_cases USING GIN (tags);

-- RLS 정책 (Row Level Security)
ALTER TABLE public.legal_forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.legal_cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.search_logs ENABLE ROW LEVEL SECURITY;

-- 모든 사용자 공개 읽기 허용 (Public Read Access)
CREATE POLICY "Allow public read access to legal_forms" ON public.legal_forms FOR SELECT USING (true);
CREATE POLICY "Allow public read access to legal_cases" ON public.legal_cases FOR SELECT USING (true);
CREATE POLICY "Allow public read access to categories" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Allow public read access to search_logs" ON public.search_logs FOR SELECT USING (true);

-- 검색 로그 저장을 위한 anon INSERT 허용 (Allow anon to insert search logs)
CREATE POLICY "Allow anon insert to search_logs" ON public.search_logs FOR INSERT WITH CHECK (true);

-- (참고: service_role은 기본적으로 RLS를 우회하므로 명시적인 INSERT/UPDATE/DELETE 정책이 없어도 수정이 가능합니다.)

-- 검색 함수 (RPC)
CREATE OR REPLACE FUNCTION public.search_all(keyword TEXT)
RETURNS TABLE (
    source_table TEXT,
    id UUID,
    title TEXT,
    category TEXT,
    subcategory TEXT,
    summary TEXT,
    source TEXT,
    tags TEXT[],
    view_count INTEGER,
    created_at TIMESTAMPTZ,
    rank REAL
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    WITH forms_match AS (
        SELECT 
            'legal_forms' AS source_table,
            f.id,
            f.title,
            f.category,
            f.subcategory,
            SUBSTRING(COALESCE(f.description, f.content) FROM 1 FOR 200) AS summary,
            f.source,
            f.tags,
            f.view_count,
            f.created_at,
            ts_rank(to_tsvector('simple', f.title || ' ' || COALESCE(f.description, '') || ' ' || COALESCE(f.content, '')), plainto_tsquery('simple', keyword)) AS rank
        FROM public.legal_forms f
        WHERE to_tsvector('simple', f.title || ' ' || COALESCE(f.description, '') || ' ' || COALESCE(f.content, '')) @@ plainto_tsquery('simple', keyword)
           OR f.title ILIKE '%' || keyword || '%'
           OR keyword = ANY(f.tags)
    ),
    cases_match AS (
        SELECT 
            'legal_cases' AS source_table,
            c.id,
            c.title,
            c.category,
            c.subcategory,
            SUBSTRING(COALESCE(c.question, c.facts, c.answer) FROM 1 FOR 200) AS summary,
            c.source,
            c.tags,
            c.view_count,
            c.created_at,
            ts_rank(to_tsvector('simple', c.title || ' ' || COALESCE(c.question, '') || ' ' || COALESCE(c.answer, '') || ' ' || COALESCE(c.facts, '')), plainto_tsquery('simple', keyword)) AS rank
        FROM public.legal_cases c
        WHERE to_tsvector('simple', c.title || ' ' || COALESCE(c.question, '') || ' ' || COALESCE(c.answer, '') || ' ' || COALESCE(c.facts, '')) @@ plainto_tsquery('simple', keyword)
           OR c.title ILIKE '%' || keyword || '%'
           OR keyword = ANY(c.tags)
    )
    SELECT * FROM forms_match
    UNION ALL
    SELECT * FROM cases_match
    ORDER BY rank DESC, created_at DESC;
END;
$$;

-- 뷰 (Views)

-- 1. 인기검색어 (최근 7일 TOP 20)
CREATE OR REPLACE VIEW public.popular_searches AS
SELECT keyword, COUNT(*) as search_count, SUM(result_count) as total_results
FROM public.search_logs
WHERE searched_at >= NOW() - INTERVAL '7 days'
GROUP BY keyword
ORDER BY search_count DESC
LIMIT 20;

-- 2. 카테고리 통계
CREATE OR REPLACE VIEW public.category_stats AS
SELECT category, 'forms' as type, COUNT(*) as count FROM public.legal_forms GROUP BY category
UNION ALL
SELECT category, 'cases' as type, COUNT(*) as count FROM public.legal_cases GROUP BY category;
