"use client";

import { useWizardStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function Step3Debts({ onNext, onPrev }: { onNext: () => void; onPrev: () => void }) {
    const { securedDebt, unsecuredDebt, setField } = useWizardStore();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onNext();
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>3. 채무 정보</CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">담보부 채무 합계</label>
                        <Input
                            type="number"
                            value={securedDebt || ""}
                            onChange={(e) => setField("securedDebt", Number(e.target.value))}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">무담보 채무 합계</label>
                        <Input
                            type="number"
                            value={unsecuredDebt || ""}
                            onChange={(e) => setField("unsecuredDebt", Number(e.target.value))}
                        />
                    </div>

                    <div className="rounded-md bg-yellow-50 p-4 text-sm text-yellow-800">
                        <p>💡 채권자 목록은 상세 입력 대신 합계 금액으로 간소화했습니다.</p>
                        <p>실제 신청 시에는 채권자별 상세 내역이 필요합니다.</p>
                    </div>

                    <div className="flex justify-between pt-4">
                        <Button type="button" variant="outline" onClick={onPrev}>이전</Button>
                        <Button type="submit">결과 확인</Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}
