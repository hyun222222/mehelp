"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useRepaymentPlanStore } from "@/lib/repayment-store";
import { calculateDisposableIncome } from "@/lib/repayment-calculations";

interface Step2IncomeProps {
    onNext: () => void;
    onPrev: () => void;
}

export function Step2Income({ onNext, onPrev }: Step2IncomeProps) {
    const { incomeInfo, setIncomeInfo } = useRepaymentPlanStore();
    const [errors, setErrors] = useState<Record<string, string>>({});

    const handleSubmit = () => {
        const newErrors: Record<string, string> = {};

        if (incomeInfo.monthlyIncome <= 0) {
            newErrors.monthlyIncome = "월 수입을 입력해주세요";
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        onNext();
    };

    const { deductions, disposableIncome } = calculateDisposableIncome(
        incomeInfo.monthlyIncome,
        incomeInfo.dependents,
        incomeInfo.businessExpense
    );

    return (
        <Card>
            <CardHeader className="bg-blue-50">
                <CardTitle className="text-blue-900">2단계: 소득 정보</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
                <div className="rounded-lg bg-amber-50 p-4 text-sm">
                    <p className="font-semibold text-amber-900 mb-2">💰 안내</p>
                    <p className="text-amber-800">
                        월 평균 소득과 부양가족 수를 입력하시면 가용소득이 자동 계산됩니다.
                    </p>
                </div>

                <div>
                    <label className="block text-sm font-medium mb-2">
                        소득 유형 <span className="text-red-500">*</span>
                    </label>
                    <select
                        className="w-full border rounded-md p-2"
                        value={incomeInfo.incomeType}
                        onChange={(e) =>
                            setIncomeInfo({ incomeType: e.target.value as 'salary' | 'business' | 'mixed' })
                        }
                    >
                        <option value="salary">급여소득</option>
                        <option value="business">사업소득</option>
                        <option value="mixed">급여+사업 혼합</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium mb-2">
                        월 평균 수입 (원) <span className="text-red-500">*</span>
                    </label>
                    <Input
                        type="number"
                        placeholder="2500000"
                        value={incomeInfo.monthlyIncome || ''}
                        onChange={(e) => setIncomeInfo({ monthlyIncome: parseInt(e.target.value) || 0 })}
                    />
                    {errors.monthlyIncome && (
                        <p className="text-red-500 text-sm mt-1">{errors.monthlyIncome}</p>
                    )}
                </div>

                {(incomeInfo.incomeType === 'business' || incomeInfo.incomeType === 'mixed') && (
                    <div>
                        <label className="block text-sm font-medium mb-2">
                            영업비용 (월, 원)
                        </label>
                        <Input
                            type="number"
                            placeholder="500000"
                            value={incomeInfo.businessExpense || ''}
                            onChange={(e) => setIncomeInfo({ businessExpense: parseInt(e.target.value) || 0 })}
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            * 사업 운영에 필수적인 비용 (임대료, 재료비 등)
                        </p>
                    </div>
                )}

                <div>
                    <label className="block text-sm font-medium mb-2">
                        부양가족 수 (본인 제외) <span className="text-red-500">*</span>
                    </label>
                    <Input
                        type="number"
                        placeholder="2"
                        value={incomeInfo.dependents}
                        onChange={(e) => setIncomeInfo({ dependents: parseInt(e.target.value) || 0 })}
                    />
                </div>

                {incomeInfo.monthlyIncome > 0 && (
                    <div className="rounded-lg bg-green-50 p-4 space-y-2">
                        <h3 className="font-semibold text-green-900">가용소득 계산 결과</h3>
                        <div className="text-sm text-green-800 space-y-1">
                            <div className="flex justify-between">
                                <span>월 수입:</span>
                                <span className="font-semibold">{incomeInfo.monthlyIncome.toLocaleString()}원</span>
                            </div>
                            <div className="border-t pt-1 mt-1">
                                <div className="flex justify-between text-red-700">
                                    <span>소득세:</span>
                                    <span>-{deductions.incomeTax.toLocaleString()}원</span>
                                </div>
                                <div className="flex justify-between text-red-700">
                                    <span>지방소득세:</span>
                                    <span>-{deductions.localIncomeTax.toLocaleString()}원</span>
                                </div>
                                <div className="flex justify-between text-red-700">
                                    <span>국민연금:</span>
                                    <span>-{deductions.nationalPension.toLocaleString()}원</span>
                                </div>
                                <div className="flex justify-between text-red-700">
                                    <span>건강보험:</span>
                                    <span>-{deductions.healthInsurance.toLocaleString()}원</span>
                                </div>
                                <div className="flex justify-between text-red-700">
                                    <span>장기요양:</span>
                                    <span>-{deductions.longTermCare.toLocaleString()}원</span>
                                </div>
                                <div className="flex justify-between text-red-700">
                                    <span>고용보험:</span>
                                    <span>-{deductions.employmentInsurance.toLocaleString()}원</span>
                                </div>
                                <div className="flex justify-between text-red-700">
                                    <span>생계비 ({incomeInfo.dependents + 1}인 가구):</span>
                                    <span>-{deductions.livingCost.toLocaleString()}원</span>
                                </div>
                                {deductions.businessExpense && deductions.businessExpense > 0 && (
                                    <div className="flex justify-between text-red-700">
                                        <span>영업비용:</span>
                                        <span>-{deductions.businessExpense.toLocaleString()}원</span>
                                    </div>
                                )}
                            </div>
                            <div className="border-t pt-2 mt-2 flex justify-between font-bold text-lg text-green-900">
                                <span>월 가용소득:</span>
                                <span>{disposableIncome.toLocaleString()}원</span>
                            </div>
                        </div>
                    </div>
                )}

                <div className="flex gap-2">
                    <Button variant="outline" onClick={onPrev} className="flex-1">
                        이전
                    </Button>
                    <Button onClick={handleSubmit} className="flex-1" size="lg">
                        다음 단계
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
