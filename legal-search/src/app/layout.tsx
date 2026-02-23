import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "법률서식·사례 검색 | 무료 법률서식 다운로드",
    template: "%s | 법률서식",
  },
  description: "소장, 답변서, 고소장 등 법률서식과 법률상담·구조 사례를 무료로 검색하고 다운로드하세요. 대한법률구조공단, 법원 소송안내마당 제공.",
  keywords: ["법률서식", "소장", "고소장", "답변서", "법률상담", "무료 다운로드", "법률구조", "법률서식 검색", "법원 서식"],
  openGraph: {
    title: "법률서식·사례 검색",
    description: "3,000건+ 법률서식 무료 검색·다운로드",
    type: "website",
    locale: "ko_KR",
  },
  robots: {
    index: true,
    follow: true,
  },
  verification: {},
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}

// ─── Header ───
function Header() {
  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <a href="/" className="flex items-center gap-2 no-underline">
          <img src="/logo.png" alt="김앤현 법률사무소" className="h-8 w-auto object-contain" />
          <span className="text-lg font-bold hidden sm:inline" style={{ color: 'var(--color-primary)' }}>K&amp;H 법률서식</span>
        </a>
        <nav className="flex items-center gap-3 sm:gap-6 text-sm font-medium text-gray-600">
          <a href="/forms" className="hover:text-[var(--color-primary)] transition-colors no-underline">서식</a>
          <a href="/search" className="hover:text-[var(--color-primary)] transition-colors no-underline">검색</a>
          <a href="/about" className="hover:text-[var(--color-primary)] transition-colors no-underline whitespace-nowrap">김앤현 소개</a>
        </nav>
      </div>
    </header>
  );
}

// ─── Footer ───
function Footer() {
  return (
    <footer className="bg-gray-50 border-t border-gray-200 mt-auto">
      <div className="max-w-6xl mx-auto px-4 py-8 md:py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10">
          {/* Law Firm Info */}
          <div className="space-y-2.5">
            <h3 className="text-sm font-bold text-gray-800">김앤현 법률사무소 <span className="font-normal text-gray-500">(K&amp;H Law Office)</span></h3>
            <div className="text-xs text-gray-500 space-y-1 leading-relaxed">
              <p>광고책임변호사: 김현정</p>
              <p>사업자등록번호: 213-08-92422</p>
              <p>주소: 서울 서초구 법원로 16 정곡빌딩 동관 502호</p>
              <p>
                전화: <a href="tel:02-3477-7600" className="hover:text-[var(--color-primary)] transition-colors no-underline">02-3477-7600</a>
                {' / '}
                <a href="tel:010-5534-6843" className="hover:text-[var(--color-primary)] transition-colors no-underline">010-5534-6843</a>
                <span className="text-gray-400"> (법률상담직통)</span>
              </p>
              <p>
                이메일: <a href="mailto:info@kimnhyun.com" className="hover:text-[var(--color-primary)] transition-colors no-underline">info@kimnhyun.com</a>
              </p>
            </div>
          </div>

          {/* Disclaimer & Sources */}
          <div className="space-y-3">
            <div>
              <h4 className="text-xs font-bold text-gray-600 mb-1">면책조항</h4>
              <p className="text-[11px] text-gray-500 leading-relaxed">
                본 사이트의 법률서식은 대한법률구조공단 및 법원 출처인 일반적인 참고용이며, 법률적 자문에 해당하지 않습니다. 구체적인 법률문제는 변호사와 상담하시기 바랍니다.
              </p>
            </div>
            <div>
              <h4 className="text-xs font-bold text-gray-600 mb-1">서식 출처</h4>
              <p className="text-[11px] text-gray-500">
                대한법률구조공단, 법원 소송안내마당
              </p>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-6 pt-4 border-t border-gray-200 text-center">
          <p className="text-[11px] text-gray-400">
            Copyright © {new Date().getFullYear()} 김앤현 법률사무소. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
