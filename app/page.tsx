"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Home() {
  const [checkedItems, setCheckedItems] = useState<number[]>([]);

  const toggleItem = (id: number) => {
    setCheckedItems(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const allChecked = [1, 2, 3, 4].every(id => checkedItems.includes(id));

  return (
    <div className="flex flex-col items-center justify-center py-12 md:py-24 bg-slate-50 px-4">
      <div className="max-w-3xl text-center space-y-8">
        <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-6xl">
          개인회생 신청서 <br />
          <span className="text-blue-600">자동 작성 시스템</span>
        </h1>
        <p className="mt-6 text-lg leading-8 text-slate-600">
          복잡한 법률 서류, 이제 집에서 간편하게 작성하세요. <br />
          입력하신 정보는 서버에 저장되지 않아 안전합니다.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-x-6">
          <Link href="/check" className="w-full sm:w-auto">
            <Button size="lg" className="w-full sm:w-auto text-lg px-8 py-6">
              자격 자가 진단하기
            </Button>
          </Link>
          <Link href="/apply" className="w-full sm:w-auto">
            <Button variant="outline" size="lg" className="w-full sm:w-auto text-lg px-8 py-6">
              신청서 작성하기
            </Button>
          </Link>
          <Link href="/repayment-plan" className="w-full sm:w-auto">
            <Button variant="secondary" size="lg" className="w-full sm:w-auto text-lg px-8 py-6">
              변제계획서 작성하기
            </Button>
          </Link>
        </div>

        {/* Checklist Preview Section */}
        <div className="mt-16 text-left w-full bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-slate-900">신청 전 필수 체크리스트</h2>
            <Link href="/check" className="text-blue-600 hover:underline text-sm font-medium">
              전체 리스트 보기 →
            </Link>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {[
              { id: 1, title: "1. 채무 규모", desc: "담보부 채무 15억원 이하, 무담보 채무 10억원 이하인가요?" },
              { id: 2, title: "2. 소득 활동", desc: "현재 급여소득 또는 영업소득이 있어 정기적인 수입이 있나요?" },
              { id: 3, title: "3. 지급 불능", desc: "현재 재산보다 채무가 많거나, 갚을 수 없는 상태인가요?" },
              { id: 4, title: "4. 재신청 기간", desc: "최근 5년 이내에 면책을 받은 사실이 없나요?" }
            ].map((item) => (
              <div
                key={item.id}
                onClick={() => toggleItem(item.id)}
                className={cn(
                  "p-4 rounded-lg border cursor-pointer transition-all duration-200 flex items-start gap-3",
                  checkedItems.includes(item.id)
                    ? "bg-blue-50 border-blue-200 ring-1 ring-blue-200"
                    : "bg-slate-50 border-slate-100 hover:bg-slate-100"
                )}
              >
                <div className={cn(
                  "mt-1 w-5 h-5 rounded border flex items-center justify-center flex-shrink-0 transition-colors",
                  checkedItems.includes(item.id)
                    ? "bg-blue-600 border-blue-600"
                    : "bg-white border-slate-300"
                )}>
                  {checkedItems.includes(item.id) && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                </div>
                <div>
                  <h3 className={cn("font-semibold mb-1", checkedItems.includes(item.id) ? "text-blue-900" : "text-slate-900")}>
                    {item.title}
                  </h3>
                  <p className="text-sm text-slate-600">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 text-center bg-slate-50 rounded-xl p-6">
            {allChecked ? (
              <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center justify-center gap-2 text-green-600 font-bold text-lg">
                  <CheckCircle2 className="w-6 h-6" />
                  <span>기본 자격 요건을 모두 충족합니다!</span>
                </div>
                <p className="text-slate-600 mb-4">
                  이제 더 상세한 자가진단을 통해 구체적인 준비사항을 확인해보세요.
                </p>
                <Link href="/check">
                  <Button size="lg" className="bg-green-600 hover:bg-green-700 text-white px-8 shadow-lg shadow-green-200">
                    상세 자가진단 시작하기
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-slate-500">
                  위 항목들을 클릭하여 해당 여부를 체크해보세요.
                </p>
                <Button disabled variant="outline" className="bg-slate-100 text-slate-400 border-slate-200">
                  모든 항목을 체크하면 다음 단계가 열립니다
                </Button>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 mt-12 text-left">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">🔒 100% 익명 보장</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-slate-500">
              서버에 아무런 기록도 남기지 않습니다. 브라우저에서만 작동합니다.
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">⚡ 10분 완성</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-slate-500">
              질문에 답하기만 하면 복잡한 신청서와 변제계획안이 완성됩니다.
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">⚖️ 최신 법률 반영</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-slate-500">
              2025년 최저생계비 및 최신 법원 양식을 자동으로 적용합니다.
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
