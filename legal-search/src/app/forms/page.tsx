import { supabase } from '@/lib/supabase';
import { Download } from 'lucide-react';

export default async function FormsPage() {
    const { data: forms } = await supabase
        .from('legal_forms')
        .select('id, title, category, subcategory, source, view_count')
        .order('created_at', { ascending: false })
        .limit(40);

    return (
        <div className="max-w-6xl mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">법률서식 전체</h1>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {(forms || []).map((form: any) => {
                    const categoryParts = form.category?.split(' > ') || [];
                    return (
                        <a
                            key={form.id}
                            href={`/forms/${form.id}`}
                            className="group block bg-white border border-gray-200 rounded-xl p-4 hover:shadow-lg hover:border-[var(--color-primary)]/30 transition-all no-underline"
                        >
                            <div className="flex items-center gap-1.5 mb-2">
                                <span className="px-2 py-0.5 rounded text-[10px] font-semibold text-white" style={{ backgroundColor: 'var(--color-primary)' }}>
                                    {categoryParts[0] || '기타'}
                                </span>
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
        </div>
    );
}
