"use client";

import { useWizardStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";

interface StepProps {
    onNext: () => void;
    onPrev: () => void;
}

export function Step6Repayment({ onNext, onPrev }: StepProps) {
    const store = useWizardStore();

    // Calculate derived values
    const monthlyAvailableIncome = Math.max(0, (store.monthlyIncome || 0) - (store.monthlyLivingCost || 0) - (store.additionalLivingCost || 0));
    const totalDebt = store.creditors.reduce((sum: number, item: any) => sum + (item.principal || 0), 0); // 원금 기준
    const totalRepayment = monthlyAvailableIncome * store.repaymentPeriod;
    const repaymentRate = totalDebt > 0 ? (totalRepayment / totalDebt) * 100 : 0;

    // Update store with calculated monthly payment
    if (store.monthlyPayment !== monthlyAvailableIncome) {
        store.setField("monthlyPayment", monthlyAvailableIncome);
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onNext();
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>7. 변제계획안 작성</CardTitle>
                    <CardDescription>
                        앞서 입력한 소득과 생계비를 바탕으로 변제 계획을 수립합니다.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4 p-4 bg-slate-50 rounded-lg">
                            <h4 className="font-medium text-gray-900">소득 및 생계비 요약</h4>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-500">월 평균 수입</span>
                                    <span className="font-medium">{(store.monthlyIncome || 0).toLocaleString()} 원</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">인정 생계비</span>
                                    <span className="font-medium text-red-600">- {(store.monthlyLivingCost || 0).toLocaleString()} 원</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">추가 생계비</span>
                                    <span className="font-medium text-red-600">- {(store.additionalLivingCost || 0).toLocaleString()} 원</span>
                                </div>
                                <div className="border-t pt-2 flex justify-between text-base">
                                    <span className="font-bold">월 가용소득 (변제금)</span>
                                    <span className="font-bold text-blue-600">{monthlyAvailableIncome.toLocaleString()} 원</span>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4 p-4 bg-slate-50 rounded-lg">
                            <h4 className="font-medium text-gray-900">채무 요약</h4>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-500">총 채무액 (원금)</span>
                                    <span className="font-medium">{totalDebt.toLocaleString()} 원</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">총 변제 예정액</span>
                                    <span className="font-medium text-blue-600">{totalRepayment.toLocaleString()} 원</span>
                                </div>
                                <div className="border-t pt-2 flex justify-between text-base">
                                    <span className="font-bold">예상 변제율</span>
                                    <span className={`font-bold ${repaymentRate >= 100 ? 'text-green-600' : 'text-orange-600'}`}>
                                        {repaymentRate.toFixed(2)}%
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6 border-t pt-6">
                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <Label htmlFor="repaymentPeriod">변제 기간 (개월)</Label>
                                <span className="font-bold text-lg text-blue-600">{store.repaymentPeriod}개월</span>
                            </div>
                            <Slider
                                id="repaymentPeriod"
                                min={36}
                                max={60}
                                step={1}
                                value={[store.repaymentPeriod]}
                                onValueChange={(vals) => store.setField("repaymentPeriod", vals[0])}
                                className="py-4"
                            />
                            <div className="flex justify-between text-xs text-gray-500">
                                <span>36개월 (3년)</span>
                                <span>60개월 (5년)</span>
                            </div>
                            <p className="text-sm text-gray-500">
                                * 원칙적으로 36개월이며, 청산가치 보장 등을 위해 필요한 경우 최대 60개월까지 연장할 수 있습니다.
                            </p>
                        </div>
                    </div>

                    {repaymentRate < 100 && (
                        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md text-sm text-yellow-800">
                            <strong>주의:</strong> 원금의 100%를 변제하지 못하는 계획안입니다.
                            이 경우 <strong>청산가치 보장의 원칙</strong>(총 변제액 &gt; 재산 처분가치)을 만족해야 인가될 수 있습니다.
                        </div>
                    )}
                </CardContent>
            </Card>

            <div className="flex justify-between">
                <Button type="button" variant="outline" onClick={onPrev}>이전 단계</Button>
                <Button type="submit">최종 검토 및 출력</Button>
            </div>
        </form>
    );
}
