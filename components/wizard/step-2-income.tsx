"use client";

import { useWizardStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { calculateDisposableIncome } from "@/lib/calculations";

export function Step2Income({ onNext, onPrev }: { onNext: () => void; onPrev: () => void }) {
    const { monthlyIncome, totalAssets, dependents, setField } = useWizardStore();

    const disposableIncome = calculateDisposableIncome(monthlyIncome, dependents);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onNext();
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>2. 소득 및 재산 정보</CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold">소득 정보</h3>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">월 평균 수입 (세후)</label>
                            <Input
                                type="number"
                                value={monthlyIncome || ""}
                                onChange={(e) => setField("monthlyIncome", Number(e.target.value))}
                                placeholder="예: 3000000"
                            />
                        </div>
                        <div className="rounded-md bg-blue-50 p-4">
                            <p className="text-sm font-medium text-blue-900">예상 월 가용소득: {disposableIncome.toLocaleString()}원</p>
                            <p className="text-xs text-blue-700">
                                (월 소득 - {dependents}인 가구 최저생계비)
                            </p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold">재산 정보 (청산가치)</h3>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">총 재산 가치 합계</label>
                            <Input
                                type="number"
                                value={totalAssets || ""}
                                onChange={(e) => setField("totalAssets", Number(e.target.value))}
                                placeholder="부동산, 차량, 예금, 보험해약환급금 합계"
                            />
                            <p className="text-xs text-slate-500">
                                * 임차보증금 중 압류금지채권액(서울 기준 5,500만원)은 제외하고 입력하세요.
                            </p>
                        </div>
                    </div>

                    <div className="flex justify-between pt-4">
                        <Button type="button" variant="outline" onClick={onPrev}>이전</Button>
                        <Button type="submit">다음 단계로</Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}
