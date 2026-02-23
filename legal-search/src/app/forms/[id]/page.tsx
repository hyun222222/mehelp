import { supabase } from '@/lib/supabase';
import { Download, ExternalLink, Eye, ArrowLeft } from 'lucide-react';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

export const revalidate = 86400; // ISR: 24 hours

// ─── Dynamic metadata ───
export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
    const { data: form } = await supabase
        .from('legal_forms')
        .select('title, category, description')
        .eq('id', params.id)
        .single();

    if (!form) return { title: '서식을 찾을 수 없습니다' };

    const desc = form.description || `${form.title} - ${form.category} 법률서식을 무료로 다운로드하세요.`;
    return {
        title: `${form.title} | 법률서식 무료 다운로드`,
        description: desc,
        keywords: [form.title, form.category, '법률서식', '무료 다운로드', '소장', '답변서'].filter(Boolean),
        openGraph: {
            title: `${form.title} | K&H 법률서식`,
            description: desc,
            type: 'article',
            url: `https://forms.kimnhyunlaw.com/forms/${params.id}`,
            siteName: 'K&H 법률서식',
        },
        alternates: {
            canonical: `https://forms.kimnhyunlaw.com/forms/${params.id}`,
        },
    };
}

// ─── Increment view count ───
async function incrementView(id: string) {
    try {
        const { data } = await supabase.from('legal_forms').select('view_count').eq('id', id).single();
        if (data) await supabase.from('legal_forms').update({ view_count: (data.view_count || 0) + 1 }).eq('id', id);
    } catch { }
}

export default async function FormDetailPage({ params }: { params: { id: string } }) {
    const { data: form } = await supabase
        .from('legal_forms')
        .select('*')
        .eq('id', params.id)
        .single();

    if (!form) return notFound();

    // Fire-and-forget view increment
    incrementView(params.id);

    const categoryParts = form.category?.split(' > ') || [];
    const fileUrls = (form.file_urls || []) as { name: string; url: string }[];

    // Related forms
    const { data: relatedForms } = await supabase
        .from('legal_forms')
        .select('id, title, category, source')
        .ilike('category', `%${categoryParts[0]}%`)
        .neq('id', form.id)
        .limit(5);

    // JSON-LD: DigitalDocument + BreadcrumbList
    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'DigitalDocument',
        name: form.title,
        headline: form.title,
        description: form.description || form.title,
        provider: { '@type': 'Organization', name: form.source },
        publisher: {
            '@type': 'LegalService',
            name: '김앤현 법률사무소',
            url: 'https://forms.kimnhyunlaw.com',
        },
        datePublished: form.created_at,
        dateModified: form.updated_at,
        url: `https://forms.kimnhyunlaw.com/forms/${form.id}`,
        inLanguage: 'ko',
        encodingFormat: 'application/x-hwp',
        isAccessibleForFree: true,
        genre: form.category,
        keywords: [form.category, form.subcategory, '법률서식', '무료 다운로드'].filter(Boolean).join(', '),
        about: {
            '@type': 'Thing',
            name: form.category || '법률서식',
        },
    };

    const breadcrumbJsonLd = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
            { '@type': 'ListItem', position: 1, name: '홈', item: 'https://forms.kimnhyunlaw.com' },
            { '@type': 'ListItem', position: 2, name: '서식', item: 'https://forms.kimnhyunlaw.com/forms' },
            ...(categoryParts[0] ? [{ '@type': 'ListItem', position: 3, name: categoryParts[0] }] : []),
            { '@type': 'ListItem', position: categoryParts[0] ? 4 : 3, name: form.title },
        ],
    };

    return (
        <>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
            <div className="max-w-6xl mx-auto px-4 py-6">
                {/* Back button */}
                <a href="/forms" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-[var(--color-primary)] mb-4 no-underline transition-colors">
                    <ArrowLeft className="w-4 h-4" /> 서식 목록
                </a>

                <div className="lg:flex lg:gap-8">
                    {/* Main content */}
                    <div className="flex-1 min-w-0">
                        {/* Breadcrumb */}
                        <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-3">
                            <a href="/forms" className="hover:text-[var(--color-primary)] no-underline">서식</a>
                            {categoryParts.map((part: string, i: number) => (
                                <span key={i}>
                                    <span className="mx-1">›</span>
                                    <span className="text-gray-500">{part}</span>
                                </span>
                            ))}
                        </div>

                        {/* Title */}
                        <h1 className="text-xl md:text-2xl font-bold text-gray-900 mb-3">{form.title}</h1>

                        {/* Meta */}
                        <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500 mb-6">
                            <span className="flex items-center gap-1"><Eye className="w-3.5 h-3.5" /> 조회 {(form.view_count || 0).toLocaleString()}</span>
                            <span>·</span>
                            <span>{form.source}</span>
                            {form.created_at && (
                                <>
                                    <span>·</span>
                                    <span>{new Date(form.created_at).toLocaleDateString('ko-KR')}</span>
                                </>
                            )}
                        </div>

                        {/* Download buttons */}
                        {fileUrls.length > 0 && (
                            <div className="bg-[var(--color-primary-lighter)] border border-[var(--color-primary)]/10 rounded-xl p-5 mb-6">
                                <h3 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-1.5">
                                    <Download className="w-4 h-4" /> 첨부파일 다운로드
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                    {fileUrls.map((file, i) => (
                                        <a
                                            key={i}
                                            href={file.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold text-white hover:opacity-90 transition-opacity no-underline"
                                            style={{ backgroundColor: 'var(--color-primary)' }}
                                        >
                                            <Download className="w-4 h-4" />
                                            {file.name || `파일 ${i + 1}`}
                                        </a>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Content */}
                        {form.content && (
                            <div className="mb-6">
                                <h3 className="text-sm font-bold text-gray-800 mb-2">서식 내용</h3>
                                <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 max-h-[500px] overflow-y-auto text-sm leading-relaxed text-gray-700 whitespace-pre-wrap">
                                    {form.content}
                                </div>
                            </div>
                        )}

                        {/* Description */}
                        {form.description && (
                            <div className="mb-6">
                                <h3 className="text-sm font-bold text-gray-800 mb-2">설명</h3>
                                <p className="text-sm text-gray-600 leading-relaxed">{form.description}</p>
                            </div>
                        )}

                        {/* Source link */}
                        {form.source_url && (
                            <a
                                href={form.source_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 text-sm no-underline mt-2"
                                style={{ color: 'var(--color-primary)' }}
                            >
                                <ExternalLink className="w-4 h-4" /> 원본 출처에서 보기
                            </a>
                        )}
                    </div>

                    {/* Sidebar */}
                    <aside className="lg:w-72 mt-8 lg:mt-0 flex-shrink-0">
                        <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 sticky top-20">
                            <h3 className="text-sm font-bold text-gray-800 mb-3">관련 서식</h3>
                            <div className="space-y-2">
                                {(relatedForms || []).map((rf: any) => (
                                    <a
                                        key={rf.id}
                                        href={`/forms/${rf.id}`}
                                        className="block text-sm text-gray-600 hover:text-[var(--color-primary)] transition-colors no-underline py-1.5 border-b border-gray-100 last:border-0"
                                    >
                                        {rf.title}
                                    </a>
                                ))}
                                {(!relatedForms || relatedForms.length === 0) && (
                                    <p className="text-xs text-gray-400">관련 서식이 없습니다.</p>
                                )}
                            </div>
                        </div>
                    </aside>
                </div>
            </div>
        </>
    );
}
