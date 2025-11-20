"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRepaymentPlanStore } from "@/lib/repayment-store";
import {
    calculateDisposableIncome,
    calculateRepaymentPlanSummary,
    calculateCreditorRepayments,
} from "@/lib/repayment-calculations";
import { generateRepaymentPlanPDF } from "@/lib/repayment-pdf-generator";

interface Step5PreviewProps {
    onPrev: () => void;
}

export function Step5Preview({ onPrev }: Step5PreviewProps) {
    const { basicInfo, incomeInfo, creditors, planSettings, resetForm } =
        useRepaymentPlanStore();

    const { deductions, disposableIncome } = calculateDisposableIncome(
        incomeInfo.monthlyIncome,
        incomeInfo.dependents,
        incomeInfo.businessExpense
    );

    const summary = calculateRepaymentPlanSummary(
        incomeInfo.monthlyIncome,
        incomeInfo.dependents,
        incomeInfo.businessExpense,
        creditors,
        planSettings.repaymentPeriodMonths,
        planSettings.liquidationValue
    );

    const repayments = calculateCreditorRepayments(
        creditors,
        summary.totalAvailableForRepayment,
        planSettings.repaymentPeriodMonths
    );

    const handleDownloadPDF = () => {
        generateRepaymentPlanPDF(basicInfo, incomeInfo, creditors, planSettings);
    };

    const handleReset = () => {
        if (confirm("모든 입력 정보를 삭제하고 처음부터 다시 시작하시겠습니까?")) {
            resetForm();
            window.location.reload();
        }
    };

    return (
        <Card>
            <CardHeader className="bg-blue-50">
                <CardTitle className="text-blue-900">5단계: 미리보기 및 다운로드</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
                <div className="rounded-lg bg-green-50 p-4 text-sm">
                    <p className="font-semibold text-green-900 mb-2">✅ 완료!</p>
                    <p className="text-green-800">
                        변제계획서가 준비되었습니다. 아래 내용을 확인하시고 PDF로 다운로드하세요.
                    </p>
                </div>

                {/* 기본정보 */}
                <div className="border rounded-lg p-4">
                    <h3 className="font-semibold mb-2">채무자 정보</h3>
                    <div className="text-sm space-y-1">
                        <div>성명: {basicInfo.name}</div>
                        <div>주민등록번호: {basicInfo.residentNumber}</div>
                        <div>주소: {basicInfo.address}</div>
                        <div>직업: {basicInfo.occupation}</div>
                        {basicInfo.court && <div>신청법원: {basicInfo.court}</div>}
                        {basicInfo.caseNumber && <div>사건번호: {basicInfo.caseNumber}</div>}
                    </div>
                </div>

                {/* 소득 및 가용소득 */}
                <div className="border rounded-lg p-4">
                    <h3 className="font-semibold mb-2">소득 및 가용소득</h3>
                    <div className="text-sm space-y-1">
                        <div>월 평균 수입: {incomeInfo.monthlyIncome.toLocaleString()}원</div>
                        <div>부양가족 수: {incomeInfo.dependents}명</div>
                        <div className="pt-2 border-t font-semibold text-green-700">
                            월 가용소득: {disposableIncome.toLocaleString()}원
                        </div>
                    </div>
                </div>

                {/* 채권자 목록 */}
                <div className="border rounded-lg p-4">
                    <h3 className="font-semibold mb-2">채권자 목록 ({creditors.length}명)</h3>
                    <div className="space-y-2">
                        {creditors.map((c) => {
                            const rep = repayments.get(c.id)!;
                            return (
                                <div key={c.id} className="text-sm border-b pb-2">
                                    <div className="font-semibold">{c.name}</div>
                                    <div className="text-gray-600">
                                        원금: {c.principal.toLocaleString()}원 → 변제예정: {rep.totalAmount.toLocaleString()}원 (
                                        {rep.repaymentRate.toFixed(2)}%)
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* 변제계획 요약 */}
                <div className="border rounded-lg p-4 bg-blue-50">
                    <h3 className="font-semibold mb-2 text-blue-900">변제계획 요약</h3>
                    <div className="text-sm space-y-1">
                        <div className="flex justify-between">
                            <span>변제기간:</span>
                            <span className="font-semibold">{planSettings.repaymentPeriodMonths}개월</span>
                        </div>
                        <div className="flex justify-between">
                            <span>총 채무액:</span>
                            <span className="font-semibold">{summary.totalDebt.toLocaleString()}원</span>
                        </div>
                        <div className="flex justify-between">
                            <span>총 변제예정액:</span>
                            <span className="font-semibold">{summary.totalAvailableForRepayment.toLocaleString()}원</span>
                        </div>
                        <div className="flex justify-between text-lg pt-2 border-t">
                            <span>평균 변제율:</span>
                            <span className="font-bold text-blue-900">{summary.averageRepaymentRate.toFixed(2)}%</span>
                        </div>
                    </div>
                </div>

                {/* 액션 버튼 */}
                <div className="space-y-2">
                    <Button onClick={handleDownloadPDF} className="w-full bg-green-600 hover:bg-green-700" size="lg">
                        📄 PDF 다운로드
                    </Button>

                    <div className="flex gap-2">
                        <Button variant="outline" onClick={onPrev} className="flex-1">
                            이전
                        </Button>
                        <Button variant="destructive" onClick={handleReset} className="flex-1">
                            처음부터 다시 작성
                        </Button>
                    </div>
                </div>

                <div className="rounded-lg bg-amber-50 p-4 text-sm">
                    <p className="font-semibold text-amber-900 mb-2">⚠️ 주의사항</p>
                    <ul className="list-disc list-inside text-amber-800 space-y-1">
                        <li>이 문서는 참고용이며, 법원 제출 시 정확성을 반드시 검토하세요</li>
                        <li>전문 법률가의 검토를 받는 것을 권장합니다</li>
                        <li>입력하신 정보는 서버에 저장되지 않으며 브라우저를 닫으면 삭제됩니다</li>
                    </ul>
                </div>
            </CardContent>
        </Card>
    );
}
