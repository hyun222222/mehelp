import { supabase } from '@/lib/supabase';
import { Download, ExternalLink, Scale, FileText, ArrowRight } from 'lucide-react';
import type { Metadata } from 'next';

const INHERITANCE_KEYWORDS = ['상속', '유류분', '상속포기', '상속재산분할', '유언', '한정승인', '상속세', '기여분'];

export const metadata: Metadata = {
    title: '상속·유류분 법률서식 무료 다운로드 | 상속포기, 유언, 한정승인',
    description: '상속, 유류분, 상속포기, 상속재산분할, 유언, 한정승인, 상속세, 기여분 관련 법률서식을 무료로 검색하고 다운로드하세요. 대한법률구조공단, 법원 소송안내마당 제공.',
    keywords: ['상속 서식', '유류분 소장', '상속포기 신청서', '유언장 양식', '한정승인', '상속세', '기여분', '상속재산분할', '무료 법률서식'],
    openGraph: {
        title: '상속·유류분 법률서식 무료 다운로드 | K&H 법률서식',
        description: '상속, 유류분, 상속포기, 유언, 한정승인 관련 법률서식을 무료로 다운로드하세요.',
        type: 'website',
        url: 'https://forms.kimnhyunlaw.com/inheritance',
        siteName: 'K&H 법률서식',
    },
    alternates: {
        canonical: 'https://forms.kimnhyunlaw.com/inheritance',
    },
};

export const revalidate = 86400; // ISR: 24 hours

export default async function InheritancePage() {
    // Build OR filter for all inheritance keywords
    const orFilter = INHERITANCE_KEYWORDS
        .map(kw => `title.ilike.%${kw}%,category.ilike.%${kw}%,description.ilike.%${kw}%`)
        .join(',');

    const { data: forms } = await supabase
        .from('legal_forms')
        .select('id, title, category, subcategory, source, view_count, description')
        .or(orFilter)
        .order('view_count', { ascending: false })
        .limit(200);

    const { data: cases } = await supabase
        .from('legal_cases')
        .select('id, title, case_type, category, question, view_count')
        .or(INHERITANCE_KEYWORDS.map(kw => `title.ilike.%${kw}%,category.ilike.%${kw}%`).join(','))
        .order('view_count', { ascending: false })
        .limit(20);

    const breadcrumbJsonLd = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
            { '@type': 'ListItem', position: 1, name: '홈', item: 'https://forms.kimnhyunlaw.com' },
            { '@type': 'ListItem', position: 2, name: '상속·유류분 서식', item: 'https://forms.kimnhyunlaw.com/inheritance' },
        ],
    };

    const collectionJsonLd = {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: '상속·유류분 법률서식',
        description: `상속, 유류분, 상속포기, 유언, 한정승인 관련 ${(forms || []).length}건의 법률서식을 무료로 제공합니다.`,
        url: 'https://forms.kimnhyunlaw.com/inheritance',
        mainEntity: {
            '@type': 'ItemList',
            numberOfItems: (forms || []).length,
            itemListElement: (forms || []).slice(0, 10).map((form: any, i: number) => ({
                '@type': 'ListItem',
                position: i + 1,
                url: `https://forms.kimnhyunlaw.com/forms/${form.id}`,
                name: form.title,
            })),
        },
    };

    // Group forms by sub-category
    const grouped: Record<string, any[]> = {};
    for (const form of (forms || [])) {
        const key = INHERITANCE_KEYWORDS.find(kw =>
            form.title?.includes(kw) || form.category?.includes(kw) || form.description?.includes(kw)
        ) || '기타';
        if (!grouped[key]) grouped[key] = [];
        grouped[key].push(form);
    }

    const categoryIcons: Record<string, string> = {
        '상속': '📜',
        '유류분': '⚖️',
        '상속포기': '🚫',
        '상속재산분할': '📋',
        '유언': '✍️',
        '한정승인': '📝',
        '상속세': '💰',
        '기여분': '🤝',
    };

    return (
        <>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionJsonLd) }} />

            {/* Hero Section */}
            <section className="gradient-navy py-14 md:py-20 px-4">
                <div className="max-w-4xl mx-auto text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 text-white/90 text-xs font-medium mb-5">
                        <Scale className="w-3.5 h-3.5" />
                        상속·유류분 전문 법률서식
                    </div>
                    <h1 className="text-2xl md:text-4xl font-bold text-white mb-3 text-balance">
                        상속·유류분 법률서식 모음
                    </h1>
                    <p className="text-primary-lighter text-sm md:text-base mb-4 opacity-90 max-w-2xl mx-auto">
                        상속포기, 유류분반환, 상속재산분할, 유언, 한정승인 등<br className="hidden sm:block" />
                        상속 관련 법률서식 <strong className="text-white">{(forms || []).length}건</strong>을 무료로 다운로드하세요
                    </p>
                    <div className="flex flex-wrap gap-2 justify-center mt-6">
                        {INHERITANCE_KEYWORDS.map((kw) => (
                            <span
                                key={kw}
                                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium bg-white/15 text-white border border-white/20"
                            >
                                {categoryIcons[kw] || '📄'} {kw}
                            </span>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Banner - sangsok8282.com */}
            <section className="bg-gradient-to-r from-amber-50 to-orange-50 border-b border-amber-200">
                <div className="max-w-6xl mx-auto px-4 py-4">
                    <a
                        href="https://sangsok8282.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between gap-4 no-underline group"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-amber-500 flex items-center justify-center flex-shrink-0">
                                <Scale className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-amber-900">
                                    상속·유류분 전문 변호사 상담
                                </p>
                                <p className="text-xs text-amber-700">
                                    sangsok8282.com — 상속분쟁, 유류분반환, 상속포기 전문 법률상담
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-1 text-amber-600 group-hover:text-amber-800 transition-colors flex-shrink-0">
                            <span className="text-xs font-semibold hidden sm:inline">상담 바로가기</span>
                            <ExternalLink className="w-4 h-4" />
                        </div>
                    </a>
                </div>
            </section>

            {/* Forms Grid by Category */}
            <div className="max-w-6xl mx-auto px-4 py-10">
                {Object.entries(grouped).map(([category, categoryForms]) => (
                    <section key={category} className="mb-10">
                        <div className="flex items-center gap-2 mb-4">
                            <span className="text-xl">{categoryIcons[category] || '📄'}</span>
                            <h2 className="text-lg font-bold text-gray-900">{category} 관련 서식</h2>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-gray-100 text-gray-500">
                                {categoryForms.length}건
                            </span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                            {categoryForms.map((form: any) => {
                                const categoryParts = form.category?.split(' > ') || [];
                                return (
                                    <a
                                        key={form.id}
                                        href={`/forms/${form.id}`}
                                        className="group block bg-white border border-gray-200 rounded-xl p-4 hover:shadow-lg hover:border-[var(--color-primary)]/30 transition-all no-underline"
                                    >
                                        <div className="flex items-center gap-1.5 mb-2">
                                            <span className="px-2 py-0.5 rounded text-[10px] font-semibold text-white" style={{ backgroundColor: 'var(--color-primary)' }}>
                                                {categoryParts[0] || '상속'}
                                            </span>
                                            {form.subcategory && (
                                                <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-gray-100 text-gray-600">
                                                    {form.subcategory}
                                                </span>
                                            )}
                                        </div>
                                        <h3 className="text-sm font-semibold text-gray-900 group-hover:text-[var(--color-primary)] transition-colors line-clamp-2 mb-2 min-h-[2.5rem]">
                                            {form.title}
                                        </h3>
                                        <div className="flex items-center justify-between text-xs text-gray-400">
                                            <span>{form.source}</span>
                                            <Download className="w-3.5 h-3.5" />
                                        </div>
                                    </a>
                                );
                            })}
                        </div>
                    </section>
                ))}

                {/* Related Cases */}
                {cases && cases.length > 0 && (
                    <section className="mb-10">
                        <div className="flex items-center gap-2 mb-4">
                            <span className="text-xl">📚</span>
                            <h2 className="text-lg font-bold text-gray-900">상속 관련 법률사례</h2>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-gray-100 text-gray-500">
                                {cases.length}건
                            </span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {cases.map((c: any) => (
                                <a
                                    key={c.id}
                                    href={`/cases/${c.id}`}
                                    className="group block bg-white border border-gray-200 rounded-xl p-4 hover:shadow-lg hover:border-[var(--color-primary)]/30 transition-all no-underline"
                                >
                                    <div className="flex items-center gap-1.5 mb-2">
                                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold text-white bg-emerald-600">
                                            {c.case_type}
                                        </span>
                                        <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-gray-100 text-gray-600">
                                            {c.category?.split(' > ')[0] || '상속'}
                                        </span>
                                    </div>
                                    <h3 className="text-sm font-semibold text-gray-900 group-hover:text-[var(--color-primary)] transition-colors line-clamp-2 mb-2 min-h-[2.5rem]">
                                        {c.title}
                                    </h3>
                                    {c.question && (
                                        <p className="text-xs text-gray-500 line-clamp-2">{c.question}</p>
                                    )}
                                </a>
                            ))}
                        </div>
                    </section>
                )}
            </div>

            {/* Bottom CTA Banner - sangsok8282.com */}
            <section className="bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent)] py-10 px-4">
                <div className="max-w-3xl mx-auto text-center">
                    <h2 className="text-xl md:text-2xl font-bold text-white mb-3">
                        상속 문제, 전문 변호사와 상담하세요
                    </h2>
                    <p className="text-white/80 text-sm mb-6 max-w-xl mx-auto">
                        상속분쟁, 유류분반환청구, 상속포기·한정승인, 상속재산분할 등<br />
                        복잡한 상속 문제는 전문 변호사의 도움이 필요합니다
                    </p>
                    <a
                        href="https://sangsok8282.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-white text-[var(--color-primary)] font-bold text-sm hover:shadow-xl transition-all no-underline hover:scale-105"
                    >
                        <Scale className="w-4 h-4" />
                        상속 전문 법률상담 바로가기
                        <ArrowRight className="w-4 h-4" />
                    </a>
                    <p className="text-white/60 text-xs mt-3">
                        sangsok8282.com · 김앤현 법률사무소 상속전문
                    </p>
                </div>
            </section>
        </>
    );
}
