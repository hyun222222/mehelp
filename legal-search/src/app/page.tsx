import { supabase } from '@/lib/supabase';
import { LegalForm } from '@/lib/types';
import { Search, FileText, ArrowRight, Download } from 'lucide-react';

// ─── Main Page (Server Component) ───
export default async function HomePage() {
  // Fetch popular forms
  const { data: popularForms } = await supabase
    .from('legal_forms')
    .select('id, title, category, subcategory, source, view_count')
    .order('view_count', { ascending: false })
    .limit(8);

  // Fetch counts
  const { count: formsCount } = await supabase
    .from('legal_forms')
    .select('*', { count: 'exact', head: true });

  const { count: casesCount } = await supabase
    .from('legal_cases')
    .select('*', { count: 'exact', head: true });

  return (
    <>
      <HeroSearch />
      <PopularTags />
      <CategoryChips />
      <FormsGrid forms={(popularForms as LegalForm[]) || []} />
      <StatsBanner formsCount={formsCount || 0} casesCount={casesCount || 0} />
    </>
  );
}

// ─── Hero Search Section ───
function HeroSearch() {
  return (
    <section className="gradient-navy py-16 md:py-24 px-4">
      <div className="max-w-3xl mx-auto text-center">
        <h1 className="text-2xl md:text-4xl font-bold text-white mb-3 text-balance">
          법률 서식과 사례를 검색하세요
        </h1>
        <p className="text-primary-lighter text-sm md:text-base mb-8 opacity-90">
          소장, 답변서, 고소장 등 무료 검색·다운로드
        </p>
        <form action="/search" method="GET" className="relative max-w-xl mx-auto">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            name="q"
            placeholder="서식명, 키워드로 검색"
            className="w-full pl-12 pr-24 py-4 rounded-2xl text-base bg-white text-gray-900 shadow-xl border-0 outline-none focus:ring-4 focus:ring-primary/40 transition-shadow"
          />
          <button
            type="submit"
            className="absolute right-2 top-1/2 -translate-y-1/2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-colors hover:bg-accent"
            style={{ backgroundColor: 'var(--color-primary)' }}
          >
            검색
          </button>
        </form>
      </div>
    </section>
  );
}

// ─── Popular Tags ───
function PopularTags() {
  const tags = ['이혼소장', '임대차보증금', '대여금', '상속포기', '고소장', '임금청구'];

  return (
    <section className="max-w-3xl mx-auto px-4 -mt-5">
      <div className="flex flex-wrap gap-2 justify-center">
        {tags.map((tag) => (
          <a
            key={tag}
            href={`/search?q=${encodeURIComponent(tag)}`}
            className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-white border border-gray-200 text-gray-600 hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] transition-colors shadow-sm no-underline"
          >
            #{tag}
          </a>
        ))}
      </div>
    </section>
  );
}

// ─── Category Chips ───
function CategoryChips() {
  const categories = [
    { name: '민사', icon: '⚖️' },
    { name: '형사', icon: '🔒' },
    { name: '가사/가족', icon: '👨‍👩‍👧' },
    { name: '부동산', icon: '🏠' },
    { name: '근로/노동', icon: '👷' },
    { name: '행정', icon: '🏛️' },
    { name: '소비자', icon: '🛒' },
    { name: '채권/채무', icon: '💰' },
  ];

  return (
    <section className="max-w-6xl mx-auto px-4 mt-10">
      <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2">
        {categories.map((cat) => (
          <a
            key={cat.name}
            href={`/search?category=${encodeURIComponent(cat.name)}`}
            className="flex-shrink-0 inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium border border-gray-200 bg-white text-gray-700 hover:bg-[var(--color-primary-lighter)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] transition-all no-underline"
          >
            <span>{cat.icon}</span>
            <span>{cat.name}</span>
          </a>
        ))}
      </div>
    </section>
  );
}

// ─── Forms Grid ───
function FormsGrid({ forms }: { forms: LegalForm[] }) {
  return (
    <section className="max-w-6xl mx-auto px-4 mt-12 mb-12">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">법률서식</h2>
        <a
          href="/forms"
          className="flex items-center gap-1 text-sm font-medium no-underline transition-colors"
          style={{ color: 'var(--color-primary)' }}
        >
          전체보기 <ArrowRight className="w-4 h-4" />
        </a>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {forms.map((form) => (
          <FormCard key={form.id} form={form} />
        ))}
      </div>
      {forms.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>등록된 서식이 없습니다.</p>
        </div>
      )}
    </section>
  );
}

// ─── Form Card ───
function FormCard({ form }: { form: LegalForm }) {
  const categoryParts = form.category?.split(' > ') || [];
  const mainCategory = categoryParts[0] || '기타';
  const subCategory = form.subcategory || categoryParts[1] || null;

  return (
    <a
      href={`/forms/${form.id}`}
      className="group block bg-white border border-gray-200 rounded-xl p-4 hover:shadow-lg hover:border-[var(--color-primary)]/30 transition-all duration-200 no-underline"
    >
      <div className="flex items-center gap-1.5 mb-2.5">
        <span className="px-2 py-0.5 rounded text-[10px] font-semibold text-white" style={{ backgroundColor: 'var(--color-primary)' }}>
          {mainCategory}
        </span>
        {subCategory && (
          <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-gray-100 text-gray-600">
            {subCategory}
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
}

// ─── Stats Banner ───
function StatsBanner({ formsCount, casesCount }: { formsCount: number; casesCount: number }) {
  return (
    <section className="gradient-navy py-10 px-4">
      <div className="max-w-4xl mx-auto text-center">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 text-white">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 opacity-80" />
            <span className="text-lg">
              법률서식 <strong className="text-2xl font-bold">{formsCount.toLocaleString()}</strong>건
            </span>
          </div>
          <div className="hidden sm:block w-px h-6 bg-white/30" />
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 opacity-80" />
            <span className="text-lg">
              법률사례 <strong className="text-2xl font-bold">{casesCount.toLocaleString()}</strong>건
            </span>
          </div>
          <div className="hidden sm:block w-px h-6 bg-white/30" />
          <span className="text-primary-lighter text-sm opacity-80">무료 열람·다운로드</span>
        </div>
      </div>
    </section>
  );
}
