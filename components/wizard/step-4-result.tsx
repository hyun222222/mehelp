"use client";

import { useWizardStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { calculateDisposableIncome } from "@/lib/calculations";
import { generateRehabilitationPDF } from "@/lib/pdf-generator";

export function Step4Result({ onPrev }: { onPrev: () => void }) {
    const data = useWizardStore();
    const { monthlyIncome, dependents, totalAssets, securedDebt, unsecuredDebt } = data;

    const disposableIncome = calculateDisposableIncome(monthlyIncome, dependents);
    const period = 36; // 기본 36개월
    const totalRepayment = disposableIncome * period;
    const isLiquidationGuaranteed = totalRepayment >= totalAssets;

    const handleDownload = () => {
        generateRehabilitationPDF(data);
    };

    return (
        <Card className="border-blue-200 shadow-lg">
            <CardHeader className="bg-blue-50">
                <CardTitle className="text-blue-900">4. 최종 시뮬레이션 결과</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="space-y-2 rounded-lg border p-4">
                        <p className="text-sm text-slate-500">월 가용소득 (변제금)</p>
                        <p className="text-2xl font-bold text-blue-600">{disposableIncome.toLocaleString()}원</p>
                    </div>
                    <div className="space-y-2 rounded-lg border p-4">
                        <p className="text-sm text-slate-500">총 변제 예정액 (36개월)</p>
                        <p className="text-2xl font-bold text-slate-900">{totalRepayment.toLocaleString()}원</p>
                    </div>
                </div>

                <div className={`rounded-md p-4 ${isLiquidationGuaranteed ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                    <h4 className="font-bold mb-2">청산가치 보장 원칙 확인</h4>
                    <p>나의 재산 가치(청산가치): {totalAssets.toLocaleString()}원</p>
                    <p className="mt-1">
                        {isLiquidationGuaranteed
                            ? "✅ 총 변제액이 재산 가치보다 많으므로 조건이 충족됩니다."
                            : "⚠️ 총 변제액이 재산 가치보다 적습니다. 변제 기간을 늘리거나 월 변제금을 높여야 합니다."}
                    </p>
                </div>

                <div className="space-y-2">
                    <h4 className="font-semibold">예상 변제율</h4>
                    <div className="h-4 w-full rounded-full bg-slate-100 overflow-hidden">
                        <div
                            className="h-full bg-blue-500"
                            style={{ width: `${Math.min(100, (totalRepayment / (securedDebt + unsecuredDebt)) * 100)}%` }}
                        />
                    </div>
                    <p className="text-right text-sm text-slate-600">
                        약 {((totalRepayment / (securedDebt + unsecuredDebt)) * 100).toFixed(1)}% 변제 예상
                    </p>
                </div>

                <div className="flex flex-col gap-3 pt-4 sm:flex-row sm:justify-between">
                    <Button variant="outline" onClick={onPrev}>이전 단계로 수정하기</Button>
                    <Button size="lg" onClick={handleDownload} className="bg-blue-600 hover:bg-blue-700">
                        📄 신청서류 PDF 다운로드
                    </Button>
                </div>

                <p className="text-center text-xs text-slate-400 mt-4">
                    * 본 결과는 모의 계산이며 법적 효력이 없습니다.
                </p>
            </CardContent>
        </Card>
    );
}
