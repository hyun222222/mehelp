import { supabase } from '@/lib/supabase';
import { ArrowLeft, Eye, ExternalLink, Scale, FileQuestion, Gavel, BookOpen } from 'lucide-react';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

export const revalidate = 86400;

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
    const { data: caseData } = await supabase
        .from('legal_cases')
        .select('title, category, case_type, question')
        .eq('id', params.id)
        .single();

    if (!caseData) return { title: '사례를 찾을 수 없습니다' };

    const desc = caseData.question?.slice(0, 160) || `${caseData.title} - ${caseData.category} ${caseData.case_type}`;
    return {
        title: `${caseData.title} | ${caseData.case_type}`,
        description: desc,
        openGraph: {
            title: `${caseData.title} | K&H 법률서식`,
            description: desc,
            type: 'article',
            url: `https://forms.kimnhyunlaw.com/cases/${params.id}`,
            siteName: 'K&H 법률서식',
        },
        alternates: {
            canonical: `https://forms.kimnhyunlaw.com/cases/${params.id}`,
        },
    };
}

export default async function CaseDetailPage({ params }: { params: { id: string } }) {
    const { data: caseData } = await supabase
        .from('legal_cases')
        .select('*')
        .eq('id', params.id)
        .single();

    if (!caseData) return notFound();

    // Increment view
    try {
        const { data: vd } = await supabase.from('legal_cases').select('view_count').eq('id', params.id).single();
        if (vd) await supabase.from('legal_cases').update({ view_count: (vd.view_count || 0) + 1 }).eq('id', params.id);
    } catch { }

    const categoryParts = caseData.category?.split(' > ') || [];

    // Related cases
    const { data: relatedCases } = await supabase
        .from('legal_cases')
        .select('id, title, case_type, category')
        .eq('case_type', caseData.case_type)
        .ilike('category', `%${categoryParts[0]}%`)
        .neq('id', caseData.id)
        .limit(5);

    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: caseData.title,
        description: caseData.question || caseData.facts || caseData.title,
        author: { '@type': 'Organization', name: caseData.source },
        publisher: {
            '@type': 'LegalService',
            name: '김앤현 법률사무소',
            url: 'https://forms.kimnhyunlaw.com',
        },
        datePublished: caseData.created_at,
        url: `https://forms.kimnhyunlaw.com/cases/${caseData.id}`,
        inLanguage: 'ko',
        isAccessibleForFree: true,
    };

    const breadcrumbJsonLd = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
            { '@type': 'ListItem', position: 1, name: '홈', item: 'https://forms.kimnhyunlaw.com' },
            { '@type': 'ListItem', position: 2, name: '사례', item: 'https://forms.kimnhyunlaw.com/cases' },
            { '@type': 'ListItem', position: 3, name: caseData.case_type, item: `https://forms.kimnhyunlaw.com/search?category=${encodeURIComponent(caseData.case_type)}` },
            ...(categoryParts[0] ? [{ '@type': 'ListItem', position: 4, name: categoryParts[0], item: `https://forms.kimnhyunlaw.com/search?category=${encodeURIComponent(categoryParts[0])}` }] : []),
            { '@type': 'ListItem', position: categoryParts[0] ? 5 : 4, name: caseData.title, item: `https://forms.kimnhyunlaw.com/cases/${caseData.id}` },
        ],
    };
    const isConsultation = caseData.case_type === '상담사례';

    return (
        <>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
            <div className="max-w-6xl mx-auto px-4 py-6">
                <a href="/cases" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-[var(--color-primary)] mb-4 no-underline transition-colors">
                    <ArrowLeft className="w-4 h-4" /> 사례 목록
                </a>

                <div className="lg:flex lg:gap-8">
                    <div className="flex-1 min-w-0">
                        {/* Breadcrumb */}
                        <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-3">
                            <a href="/cases" className="hover:text-[var(--color-primary)] no-underline">사례</a>
                            <span className="mx-1">›</span>
                            <span className="text-gray-500">{caseData.case_type}</span>
                            {categoryParts.map((part: string, i: number) => (
                                <span key={i}>
                                    <span className="mx-1">›</span>
                                    <span className="text-gray-500">{part}</span>
                                </span>
                            ))}
                        </div>

                        <div className="flex items-center gap-2 mb-2">
                            <span className="px-2.5 py-1 rounded text-xs font-semibold text-white bg-emerald-600">
                                {caseData.case_type}
                            </span>
                            <span className="px-2.5 py-1 rounded text-xs font-medium bg-gray-100 text-gray-600">
                                {categoryParts[0] || '기타'}
                            </span>
                        </div>

                        <h1 className="text-xl md:text-2xl font-bold text-gray-900 mb-3">{caseData.title}</h1>

                        <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500 mb-6">
                            <span className="flex items-center gap-1"><Eye className="w-3.5 h-3.5" /> 조회 {(caseData.view_count || 0).toLocaleString()}</span>
                            <span>·</span>
                            <span>{caseData.source}</span>
                        </div>

                        {/* Structured sections */}
                        <div className="space-y-5">
                            {isConsultation ? (
                                <>
                                    {caseData.question && (
                                        <Section icon={<FileQuestion className="w-4 h-4 text-primary" />} title="질문" color="primary">
                                            {caseData.question}
                                        </Section>
                                    )}
                                    {caseData.answer && (
                                        <Section icon={<Gavel className="w-4 h-4 text-accent" />} title="답변" color="accent">
                                            {caseData.answer}
                                        </Section>
                                    )}
                                </>
                            ) : (
                                <>
                                    {caseData.facts && (
                                        <Section icon={<BookOpen className="w-4 h-4 text-primary" />} title="사실관계" color="primary">
                                            {caseData.facts}
                                        </Section>
                                    )}
                                    {caseData.legal_issue && (
                                        <Section icon={<Scale className="w-4 h-4 text-accent" />} title="법적 쟁점" color="accent">
                                            {caseData.legal_issue}
                                        </Section>
                                    )}
                                    {caseData.conclusion && (
                                        <Section icon={<Gavel className="w-4 h-4 text-primary" />} title="결론" color="primary">
                                            {caseData.conclusion}
                                        </Section>
                                    )}
                                </>
                            )}
                        </div>

                        {/* Related laws */}
                        {caseData.related_laws && caseData.related_laws.length > 0 && (
                            <div className="mt-6">
                                <h3 className="text-sm font-bold text-gray-800 mb-2">관련 법령</h3>
                                <div className="flex flex-wrap gap-1.5">
                                    {caseData.related_laws.map((law: string, i: number) => (
                                        <span key={i} className="px-2.5 py-1 bg-gray-100 rounded text-xs text-gray-600">{law}</span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {caseData.source_url && (
                            <a
                                href={caseData.source_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 text-sm no-underline mt-6"
                                style={{ color: 'var(--color-primary)' }}
                            >
                                <ExternalLink className="w-4 h-4" /> 원본 출처에서 보기
                            </a>
                        )}
                    </div>

                    {/* Sidebar */}
                    <aside className="lg:w-72 mt-8 lg:mt-0 flex-shrink-0">
                        <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 sticky top-20">
                            <h3 className="text-sm font-bold text-gray-800 mb-3">관련 사례</h3>
                            <div className="space-y-2">
                                {(relatedCases || []).map((rc: any) => (
                                    <a
                                        key={rc.id}
                                        href={`/cases/${rc.id}`}
                                        className="block text-sm text-gray-600 hover:text-[var(--color-primary)] transition-colors no-underline py-1.5 border-b border-gray-100 last:border-0"
                                    >
                                        {rc.title}
                                    </a>
                                ))}
                                {(!relatedCases || relatedCases.length === 0) && (
                                    <p className="text-xs text-gray-400">관련 사례가 없습니다.</p>
                                )}
                            </div>
                        </div>
                    </aside>
                </div>
            </div >
        </>
    );
}

function Section({ icon, title, color, children }: { icon: React.ReactNode; title: string; color: string; children: React.ReactNode }) {
    const borderColors: Record<string, string> = {
        primary: 'border-l-[var(--color-primary)]',
        accent: 'border-l-[var(--color-accent)]',
    };
    return (
        <div className={`bg-gray-50 border border-gray-200 ${borderColors[color] || ''} border-l-4 rounded-xl p-5`}>
            <h3 className="flex items-center gap-1.5 text-sm font-bold text-gray-800 mb-2">
                {icon} {title}
            </h3>
            <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{children}</div>
        </div>
    );
}
