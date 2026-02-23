import { supabase } from '@/lib/supabase';
import { BookOpen } from 'lucide-react';

export default async function CasesListPage() {
    const { data: cases } = await supabase
        .from('legal_cases')
        .select('id, title, case_type, category, subcategory, source, question, view_count')
        .order('created_at', { ascending: false })
        .limit(40);

    return (
        <div className="max-w-6xl mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">법률사례</h1>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {(cases || []).map((c: any) => (
                    <a
                        key={c.id}
                        href={`/cases/${c.id}`}
                        className="group block bg-white border border-gray-200 rounded-xl p-4 hover:shadow-lg hover:border-[var(--color-primary)]/30 transition-all no-underline"
                    >
                        <div className="flex items-center gap-1.5 mb-2">
                            <span className="px-2 py-0.5 rounded text-[10px] font-semibold text-white bg-accent">
                                {c.case_type}
                            </span>
                            <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-gray-100 text-gray-600">
                                {c.category?.split(' > ')[0] || '기타'}
                            </span>
                        </div>
                        <h3 className="text-sm font-semibold text-gray-900 group-hover:text-[var(--color-primary)] transition-colors line-clamp-2 mb-2 min-h-[2.5rem]">
                            {c.title}
                        </h3>
                        {c.question && (
                            <p className="text-xs text-gray-500 line-clamp-2 mb-2">{c.question.slice(0, 120)}</p>
                        )}
                        <div className="flex items-center justify-between text-[10px] text-gray-400">
                            <span>{c.source}</span>
                            <BookOpen className="w-3.5 h-3.5" />
                        </div>
                    </a>
                ))}
            </div>
        </div>
    );
}
