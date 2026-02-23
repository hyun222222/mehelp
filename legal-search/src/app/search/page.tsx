'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Search, SlidersHorizontal, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { Suspense } from 'react';

// ─── Types ───
interface SearchResult {
    id: string;
    title: string;
    category: string;
    subcategory: string | null;
    source: string;
    summary: string;
    type: 'form' | 'case';
    case_type?: string;
    view_count: number;
    created_at: string;
}

// ─── Constants ───
const CATEGORIES = ['전체', '민사소송', '형사', '가사소송', '부동산', '채권/채무', '행정', '근로/노동', '소비자'];
const SOURCES = ['전체', '대한법률구조공단', '법원 소송안내마당'];
const SORT_OPTIONS = [
    { label: '관련도순', value: 'relevance' },
    { label: '최신순', value: 'newest' },
    { label: '조회순', value: 'views' },
];
const PAGE_SIZE = 20;

function SearchContent() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [query, setQuery] = useState(searchParams.get('q') || '');
    const [activeTab, setActiveTab] = useState<'all' | 'forms' | 'cases'>(
        (searchParams.get('tab') as any) || 'all'
    );
    const [category, setCategory] = useState(searchParams.get('category') || '전체');
    const [source, setSource] = useState(searchParams.get('source') || '전체');
    const [sort, setSort] = useState(searchParams.get('sort') || 'relevance');
    const [page, setPage] = useState(parseInt(searchParams.get('page') || '1'));
    const [results, setResults] = useState<SearchResult[]>([]);
    const [totalCount, setTotalCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const [showFilters, setShowFilters] = useState(false);
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const debounceRef = useRef<NodeJS.Timeout>();
    const inputRef = useRef<HTMLInputElement>(null);

    // ─── Debounced autocomplete ───
    const handleInputChange = useCallback((value: string) => {
        setQuery(value);
        if (debounceRef.current) clearTimeout(debounceRef.current);
        if (value.length < 2) {
            setSuggestions([]);
            setShowSuggestions(false);
            return;
        }
        debounceRef.current = setTimeout(async () => {
            const { data } = await supabase
                .from('legal_forms')
                .select('title')
                .ilike('title', `%${value}%`)
                .limit(5);
            if (data) {
                setSuggestions(data.map((d: any) => d.title));
                setShowSuggestions(true);
            }
        }, 300);
    }, []);

    // ─── Search execution ───
    const executeSearch = useCallback(async () => {
        setLoading(true);
        setShowSuggestions(false);

        const offset = (page - 1) * PAGE_SIZE;
        const allResults: SearchResult[] = [];
        let total = 0;

        // Build filter function
        const applyFilters = (q: any, isForm: boolean) => {
            if (query) {
                q = q.or(`title.ilike.%${query}%,category.ilike.%${query}%`);
            }
            if (category !== '전체') {
                q = q.ilike('category', `%${category}%`);
            }
            if (source !== '전체' && isForm) {
                q = q.eq('source', source);
            }
            return q;
        };

        const applySorting = (q: any) => {
            if (sort === 'newest') return q.order('created_at', { ascending: false });
            if (sort === 'views') return q.order('view_count', { ascending: false });
            return q.order('view_count', { ascending: false }); // default
        };

        try {
            if (activeTab === 'all' || activeTab === 'forms') {
                let formsQuery = supabase
                    .from('legal_forms')
                    .select('id, title, category, subcategory, source, description, view_count, created_at', { count: 'exact' });
                formsQuery = applyFilters(formsQuery, true);
                formsQuery = applySorting(formsQuery);

                if (activeTab === 'forms') {
                    formsQuery = formsQuery.range(offset, offset + PAGE_SIZE - 1);
                } else {
                    formsQuery = formsQuery.range(offset, offset + PAGE_SIZE - 1);
                }

                const { data: forms, count: formsCount } = await formsQuery;
                if (forms) {
                    allResults.push(...forms.map((f: any) => ({
                        id: f.id,
                        title: f.title,
                        category: f.category,
                        subcategory: f.subcategory,
                        source: f.source,
                        summary: f.description || '',
                        type: 'form' as const,
                        view_count: f.view_count || 0,
                        created_at: f.created_at,
                    })));
                    total += formsCount || 0;
                }
            }

            if (activeTab === 'all' || activeTab === 'cases') {
                let casesQuery = supabase
                    .from('legal_cases')
                    .select('id, title, category, subcategory, source, question, case_type, view_count, created_at', { count: 'exact' });
                casesQuery = applyFilters(casesQuery, false);
                casesQuery = applySorting(casesQuery);

                if (activeTab === 'cases') {
                    casesQuery = casesQuery.range(offset, offset + PAGE_SIZE - 1);
                } else if (activeTab === 'all') {
                    // Show fewer cases in "all" tab
                    casesQuery = casesQuery.limit(5);
                }

                const { data: cases, count: casesCount } = await casesQuery;
                if (cases) {
                    allResults.push(...cases.map((c: any) => ({
                        id: c.id,
                        title: c.title,
                        category: c.category,
                        subcategory: c.subcategory,
                        source: c.source,
                        summary: c.question || '',
                        type: 'case' as const,
                        case_type: c.case_type,
                        view_count: c.view_count || 0,
                        created_at: c.created_at,
                    })));
                    total += casesCount || 0;
                }
            }

            setResults(allResults);
            setTotalCount(total);
        } finally {
            setLoading(false);
        }
    }, [query, activeTab, category, source, sort, page]);

    // Execute search on param change
    useEffect(() => {
        executeSearch();
    }, [executeSearch]);

    // Update URL
    const updateURL = useCallback(() => {
        const params = new URLSearchParams();
        if (query) params.set('q', query);
        if (activeTab !== 'all') params.set('tab', activeTab);
        if (category !== '전체') params.set('category', category);
        if (source !== '전체') params.set('source', source);
        if (sort !== 'relevance') params.set('sort', sort);
        if (page > 1) params.set('page', String(page));
        router.push(`/search?${params.toString()}`, { scroll: false });
    }, [query, activeTab, category, source, sort, page, router]);

    const handleSearch = (e?: React.FormEvent) => {
        e?.preventDefault();
        setPage(1);
        updateURL();
    };

    // Highlight matching text
    const highlight = (text: string) => {
        if (!query || !text) return text;
        const parts = text.split(new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'));
        return parts.map((part, i) =>
            part.toLowerCase() === query.toLowerCase()
                ? <mark key={i} className="bg-yellow-200 text-gray-900 rounded px-0.5">{part}</mark>
                : part
        );
    };

    const totalPages = Math.ceil(totalCount / PAGE_SIZE);

    return (
        <div className="max-w-6xl mx-auto px-4 py-6">
            {/* Search bar */}
            <form onSubmit={handleSearch} className="relative mb-6">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={(e) => handleInputChange(e.target.value)}
                    onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                    onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                    placeholder="서식명, 키워드로 검색"
                    className="w-full pl-12 pr-32 py-3.5 rounded-xl border border-gray-200 text-base outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30 focus:border-[var(--color-primary)] transition-all"
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                    <button
                        type="button"
                        onClick={() => setShowFilters(!showFilters)}
                        className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors lg:hidden"
                    >
                        <SlidersHorizontal className="w-5 h-5" />
                    </button>
                    <button
                        type="submit"
                        className="px-4 py-2 rounded-lg text-sm font-semibold text-white transition-colors"
                        style={{ backgroundColor: 'var(--color-primary)' }}
                    >
                        검색
                    </button>
                </div>

                {/* Suggestions dropdown */}
                {showSuggestions && suggestions.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-50 overflow-hidden">
                        {suggestions.map((s, i) => (
                            <button
                                key={i}
                                type="button"
                                onMouseDown={() => {
                                    setQuery(s);
                                    setShowSuggestions(false);
                                    setPage(1);
                                }}
                                className="w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 flex items-center gap-2 transition-colors"
                            >
                                <Search className="w-3.5 h-3.5 text-gray-400" />
                                <span className="truncate">{s}</span>
                            </button>
                        ))}
                    </div>
                )}
            </form>

            <div className="lg:flex lg:gap-6">
                {/* Filters sidebar — desktop */}
                <aside className="hidden lg:block w-56 flex-shrink-0">
                    <FilterPanel
                        category={category} setCategory={(v) => { setCategory(v); setPage(1); }}
                        source={source} setSource={(v) => { setSource(v); setPage(1); }}
                        sort={sort} setSort={(v) => { setSort(v); setPage(1); }}
                    />
                </aside>

                {/* Mobile filter sheet */}
                {showFilters && (
                    <div className="fixed inset-0 z-50 lg:hidden">
                        <div className="absolute inset-0 bg-black/30" onClick={() => setShowFilters(false)} />
                        <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl p-6 max-h-[70vh] overflow-y-auto animate-slide-up">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-bold">필터</h3>
                                <button onClick={() => setShowFilters(false)} className="p-1"><X className="w-5 h-5" /></button>
                            </div>
                            <FilterPanel
                                category={category} setCategory={(v) => { setCategory(v); setPage(1); }}
                                source={source} setSource={(v) => { setSource(v); setPage(1); }}
                                sort={sort} setSort={(v) => { setSort(v); setPage(1); }}
                            />
                            <button
                                onClick={() => setShowFilters(false)}
                                className="w-full mt-4 py-3 rounded-xl text-white font-semibold"
                                style={{ backgroundColor: 'var(--color-primary)' }}
                            >
                                필터 적용
                            </button>
                        </div>
                    </div>
                )}

                {/* Main content */}
                <div className="flex-1 min-w-0">
                    {/* Tabs */}
                    <div className="flex items-center gap-1 mb-4 border-b border-gray-200">
                        {([['all', '전체'], ['forms', '서식'], ['cases', '사례']] as const).map(([key, label]) => (
                            <button
                                key={key}
                                onClick={() => { setActiveTab(key); setPage(1); }}
                                className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${activeTab === key
                                    ? 'border-[var(--color-primary)] text-[var(--color-primary)]'
                                    : 'border-transparent text-gray-500 hover:text-gray-700'
                                    }`}
                            >
                                {label}
                            </button>
                        ))}
                        <span className="ml-auto text-xs text-gray-400 py-2">
                            {totalCount.toLocaleString()}건
                        </span>
                    </div>

                    {/* Loading */}
                    {loading && (
                        <div className="flex items-center justify-center py-16">
                            <div className="w-8 h-8 border-3 border-gray-200 border-t-[var(--color-primary)] rounded-full animate-spin" />
                        </div>
                    )}

                    {/* Results */}
                    {!loading && (
                        <div className="space-y-3">
                            {results.map((item) => (
                                <a
                                    key={`${item.type}-${item.id}`}
                                    href={item.type === 'form' ? `/forms/${item.id}` : `/cases/${item.id}`}
                                    className="block bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md hover:border-[var(--color-primary)]/20 transition-all no-underline group"
                                >
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold text-white ${item.type === 'form' ? '' : 'bg-accent'
                                            }`} style={item.type === 'form' ? { backgroundColor: 'var(--color-primary)' } : {}}>
                                            {item.type === 'form' ? '서식' : item.case_type || '사례'}
                                        </span>
                                        <span className="text-[10px] text-gray-400 bg-gray-100 px-2 py-0.5 rounded">
                                            {item.category?.split(' > ')[0] || '기타'}
                                        </span>
                                    </div>
                                    <h3 className="text-sm font-semibold text-gray-900 group-hover:text-[var(--color-primary)] transition-colors mb-1">
                                        {highlight(item.title)}
                                    </h3>
                                    {item.summary && (
                                        <p className="text-xs text-gray-500 line-clamp-2 mb-2">
                                            {highlight(item.summary.slice(0, 150))}
                                        </p>
                                    )}
                                    <div className="flex items-center gap-3 text-[10px] text-gray-400">
                                        <span>{item.source}</span>
                                        <span>조회 {item.view_count}</span>
                                    </div>
                                </a>
                            ))}

                            {results.length === 0 && !loading && (
                                <div className="text-center py-16 text-gray-400">
                                    <Search className="w-12 h-12 mx-auto mb-3 opacity-30" />
                                    <p className="text-sm">{query ? `"${query}"에 대한 결과가 없습니다.` : '검색어를 입력해주세요.'}</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-center gap-2 mt-8">
                            <button
                                disabled={page <= 1}
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                className="p-2 rounded-lg border border-gray-200 disabled:opacity-30 hover:bg-gray-50 transition-colors"
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                const start = Math.max(1, Math.min(page - 2, totalPages - 4));
                                const p = start + i;
                                if (p > totalPages) return null;
                                return (
                                    <button
                                        key={p}
                                        onClick={() => setPage(p)}
                                        className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${p === page
                                            ? 'text-white'
                                            : 'border border-gray-200 hover:bg-gray-50 text-gray-600'
                                            }`}
                                        style={p === page ? { backgroundColor: 'var(--color-primary)' } : {}}
                                    >
                                        {p}
                                    </button>
                                );
                            })}
                            <button
                                disabled={page >= totalPages}
                                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                className="p-2 rounded-lg border border-gray-200 disabled:opacity-30 hover:bg-gray-50 transition-colors"
                            >
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

// ─── Filter Panel ───
function FilterPanel({
    category, setCategory,
    source, setSource,
    sort, setSort,
}: {
    category: string; setCategory: (v: string) => void;
    source: string; setSource: (v: string) => void;
    sort: string; setSort: (v: string) => void;
}) {
    return (
        <div className="space-y-5">
            <div>
                <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">정렬</h4>
                <div className="space-y-1">
                    {SORT_OPTIONS.map((opt) => (
                        <button
                            key={opt.value}
                            onClick={() => setSort(opt.value)}
                            className={`block w-full text-left px-3 py-1.5 rounded-lg text-sm transition-colors ${sort === opt.value
                                ? 'bg-[var(--color-primary-lighter)] text-[var(--color-primary)] font-medium'
                                : 'text-gray-600 hover:bg-gray-50'
                                }`}
                        >
                            {opt.label}
                        </button>
                    ))}
                </div>
            </div>
            <div>
                <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">카테고리</h4>
                <div className="space-y-1">
                    {CATEGORIES.map((cat) => (
                        <button
                            key={cat}
                            onClick={() => setCategory(cat)}
                            className={`block w-full text-left px-3 py-1.5 rounded-lg text-sm transition-colors ${category === cat
                                ? 'bg-[var(--color-primary-lighter)] text-[var(--color-primary)] font-medium'
                                : 'text-gray-600 hover:bg-gray-50'
                                }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>
            <div>
                <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">출처</h4>
                <div className="space-y-1">
                    {SOURCES.map((s) => (
                        <button
                            key={s}
                            onClick={() => setSource(s)}
                            className={`block w-full text-left px-3 py-1.5 rounded-lg text-sm transition-colors ${source === s
                                ? 'bg-[var(--color-primary-lighter)] text-[var(--color-primary)] font-medium'
                                : 'text-gray-600 hover:bg-gray-50'
                                }`}
                        >
                            {s}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}

// ─── Page export with Suspense ───
export default function SearchPage() {
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center py-24">
                <div className="w-8 h-8 border-3 border-gray-200 border-t-[var(--color-primary)] rounded-full animate-spin" />
            </div>
        }>
            <SearchContent />
        </Suspense>
    );
}
