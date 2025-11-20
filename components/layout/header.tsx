import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Scale } from "lucide-react";

export function Header() {
    return (
        <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
            <div className="container mx-auto flex h-16 items-center justify-between px-4">
                <Link href="/" className="flex items-center gap-2">
                    <Scale className="h-6 w-6 text-blue-600" />
                    <div className="flex flex-col">
                        <span className="text-lg font-bold text-slate-900 leading-none">김앤현 법률사무소</span>
                        <span className="text-[10px] text-slate-500 font-medium">Kim& Hyun Law office</span>
                    </div>
                </Link>

                <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
                    <Link href="/profile" className="hover:text-blue-600 transition-colors">변호사 소개</Link>
                    <Link href="/check" className="hover:text-blue-600 transition-colors">자격 자가 진단</Link>
                    <Link href="/apply" className="hover:text-blue-600 transition-colors">신청서 작성</Link>
                </nav>

                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" className="hidden md:inline-flex">
                        상담 문의: 010-5534-6843
                    </Button>
                    <Link href="/apply">
                        <Button size="sm" className="bg-blue-600 hover:bg-blue-700">시작하기</Button>
                    </Link>
                </div>
            </div>
        </header>
    );
}
