"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useRepaymentPlanStore } from "@/lib/repayment-store";
import { calculateRepaymentPlanSummary } from "@/lib/repayment-calculations";
import { REPAYMENT_PERIODS } from "@/lib/legal-constants";

interface Step4PlanProps {
    onNext: () => void;
    onPrev: () => void;
}

export function Step4Plan({ onNext, onPrev }: Step4PlanProps) {
    const { incomeInfo, creditors, planSettings, setPlanSettings } =
        useRepaymentPlanStore();

    const summary = calculateRepaymentPlanSummary(
        incomeInfo.monthlyIncome,
        incomeInfo.dependents,
        incomeInfo.businessExpense,
        creditors,
        planSettings.repaymentPeriodMonths,
        planSettings.liquidationValue
    );

    const handleSubmit = () => {
        onNext();
    };

    return (
        <Card>
            <CardHeader className="bg-blue-50">
                <CardTitle className="text-blue-900">4단계: 변제계획 설정</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
                <div className="rounded-lg bg-amber-50 p-4 text-sm">
                    <p className="font-semibold text-amber-900 mb-2">⚖️ 안내</p>
                    <p className="text-amber-800">
                        변제기간과 청산가치를 설정하시면 자동으로 변제계획이 계산됩니다.
                    </p>
                </div>

                <div>
                    <label className="block text-sm font-medium mb-2">
                        변제기간 <span className="text-red-500">*</span>
                    </label>
                    <select
                        className="w-full border rounded-md p-2"
                        value={planSettings.repaymentPeriodMonths}
                        onChange={(e) =>
                            setPlanSettings({
                                repaymentPeriodMonths: parseInt(e.target.value) as 36 | 60,
                            })
                        }
                    >
                        <option value={REPAYMENT_PERIODS.THREE_YEARS}>3년 (36개월)</option>
                        <option value={REPAYMENT_PERIODS.FIVE_YEARS}>5년 (60개월)</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium mb-2">
                        청산가치 (원) <span className="text-red-500">*</span>
                    </label>
                    <Input
                        type="number"
                        placeholder="0"
                        value={planSettings.liquidationValue || ""}
                        onChange={(e) =>
                            setPlanSettings({ liquidationValue: parseInt(e.target.value) || 0 })
                        }
                    />
                    <p className="text-xs text-gray-500 mt-1">
                        * 재산을 파산절차로 환가할 경우 예상되는 배당액
                    </p>
                </div>

                <div>
                    <label className="block text-sm font-medium mb-2">조기변제 금액 (선택, 원)</label>
                    <Input
                        type="number"
                        placeholder="0"
                        value={planSettings.earlyRepayment || ""}
                        onChange={(e) =>
                            setPlanSettings({ earlyRepayment: parseInt(e.target.value) || 0 })
                        }
                    />
                </div>

                {/* 변제계획 요약 */}
                <div className="rounded-lg bg-green-50 p-4 space-y-3">
                    <h3 className="font-semibold text-green-900">변제계획 요약</h3>

                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span>월 가용소득:</span>
                            <span className="font-semibold">
                                {summary.monthlyDisposableIncome.toLocaleString()}원
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span>변제기간:</span>
                            <span className="font-semibold">
                                {planSettings.repaymentPeriodMonths}개월
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span>총 가용소득:</span>
                            <span className="font-semibold">
                                {summary.totalDisposableIncomeBeforeFee.toLocaleString()}원
                            </span>
                        </div>
                        <div className="flex justify-between text-red-700">
                            <span>회생위원 보수 (약 10%):</span>
                            <span>-{summary.trusteeFee.toLocaleString()}원</span>
                        </div>
                        <div className="border-t pt-2 flex justify-between font-bold">
                            <span>실제 변제가능액:</span>
                            <span>{summary.totalAvailableForRepayment.toLocaleString()}원</span>
                        </div>
                        <div className="flex justify-between">
                            <span>총 채무액:</span>
                            <span>{summary.totalDebt.toLocaleString()}원</span>
                        </div>
                        <div className="flex justify-between text-lg font-bold text-green-900">
                            <span>예상 변제율:</span>
                            <span>{summary.averageRepaymentRate.toFixed(2)}%</span>
                        </div>
                    </div>
                </div>

                {/* 청산가치보장 원칙 검증 */}
                <div
                    className={`rounded-lg p-4 ${summary.liquidationValueSatisfied ? "bg-green-100" : "bg-red-100"
                        }`}
                >
                    <h3
                        className={`font-semibold mb-2 ${summary.liquidationValueSatisfied ? "text-green-900" : "text-red-900"
                            }`}
                    >
                        {summary.liquidationValueSatisfied ? "✅ 청산가치보장 충족" : "❌ 청산가치보장 미충족"}
                    </h3>
                    <div
                        className={`text-sm ${summary.liquidationValueSatisfied ? "text-green-800" : "text-red-800"
                            }`}
                    >
                        <div>청산가치: {planSettings.liquidationValue.toLocaleString()}원</div>
                        <div>
                            변제예정액: {summary.totalAvailableForRepayment.toLocaleString()}원
                        </div>
                        {!summary.liquidationValueSatisfied && (
                            <div className="mt-2 font-semibold">
                                부족액: {summary.liquidationValueShortage.toLocaleString()}원
                                <p className="text-xs mt-1">
                                    * 변제기간을 5년으로 연장하거나 청산가치를 재검토해주세요
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* 최소변제액 검증 */}
                <div
                    className={`rounded-lg p-4 ${summary.meetsMinimumRepayment ? "bg-green-100" : "bg-yellow-100"
                        }`}
                >
                    <h3
                        className={`font-semibold mb-2 ${summary.meetsMinimumRepayment ? "text-green-900" : "text-yellow-900"
                            }`}
                    >
                        {summary.meetsMinimumRepayment
                            ? "✅ 최소변제액 요건 충족"
                            : "⚠️ 최소변제액 요건 확인 필요"}
                    </h3>
                    <div
                        className={`text-sm ${summary.meetsMinimumRepayment ? "text-green-800" : "text-yellow-800"
                            }`}
                    >
                        <div>
                            최소변제액: {summary.minimumRepaymentRequired.toLocaleString()}원
                        </div>
                        <div>
                            변제예정액: {summary.totalAvailableForRepayment.toLocaleString()}원
                        </div>
                    </div>
                </div>

                <div className="flex gap-2">
                    <Button variant="outline" onClick={onPrev} className="flex-1">
                        이전
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        className="flex-1"
                        size="lg"
                        disabled={!summary.liquidationValueSatisfied}
                    >
                        미리보기
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
