"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useRepaymentPlanStore } from "@/lib/repayment-store";
import { Creditor } from "@/lib/repayment-calculations";

interface Step3DebtsProps {
    onNext: () => void;
    onPrev: () => void;
}

export function Step3Debts({ onNext, onPrev }: Step3DebtsProps) {
    const { creditors, addCreditor, updateCreditor, removeCreditor } =
        useRepaymentPlanStore();
    const [newCreditor, setNewCreditor] = useState({
        name: "",
        principal: 0,
        cause: "",
        isSecured: false,
    });
    const [errors, setErrors] = useState<string>("");

    const handleAddCreditor = () => {
        if (!newCreditor.name.trim()) {
            setErrors("채권자명을 입력해주세요");
            return;
        }
        if (newCreditor.principal <= 0) {
            setErrors("채권액을 입력해주세요");
            return;
        }

        const creditor: Creditor = {
            id: Date.now().toString(),
            name: newCreditor.name,
            principal: newCreditor.principal,
            cause: newCreditor.cause || "금전대여",
            isSecured: newCreditor.isSecured,
        };

        addCreditor(creditor);
        setNewCreditor({ name: "", principal: 0, cause: "", isSecured: false });
        setErrors("");
    };

    const handleSubmit = () => {
        if (creditors.length === 0) {
            setErrors("최소 1개 이상의 채권자를 추가해주세요");
            return;
        }
        onNext();
    };

    const totalDebt = creditors.reduce((sum, c) => sum + c.principal, 0);
    const securedDebt = creditors
        .filter((c) => c.isSecured)
        .reduce((sum, c) => sum + c.principal, 0);
    const unsecuredDebt = totalDebt - securedDebt;

    return (
        <Card>
            <CardHeader className="bg-blue-50">
                <CardTitle className="text-blue-900">3단계: 채권자 정보</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
                <div className="rounded-lg bg-amber-50 p-4 text-sm">
                    <p className="font-semibold text-amber-900 mb-2">📝 안내</p>
                    <p className="text-amber-800">
                        모든 채권자를 빠짐없이 추가해주세요. 고의 또는 과실로 누락 시 면책이
                        불허될 수 있습니다.
                    </p>
                </div>

                {/* 채권자 추가 폼 */}
                <div className="border rounded-lg p-4 space-y-3 bg-slate-50">
                    <h3 className="font-semibold">채권자 추가</h3>

                    <div>
                        <label className="block text-sm font-medium mb-1">채권자명</label>
                        <Input
                            placeholder="예: 국민은행"
                            value={newCreditor.name}
                            onChange={(e) => setNewCreditor({ ...newCreditor, name: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">채권액 (원)</label>
                        <Input
                            type="number"
                            placeholder="30000000"
                            value={newCreditor.principal || ""}
                            onChange={(e) =>
                                setNewCreditor({ ...newCreditor, principal: parseInt(e.target.value) || 0 })
                            }
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">발생원인</label>
                        <Input
                            placeholder="금전대여, 신용카드, 대출 등"
                            value={newCreditor.cause}
                            onChange={(e) => setNewCreditor({ ...newCreditor, cause: e.target.value })}
                        />
                    </div>

                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            id="isSecured"
                            checked={newCreditor.isSecured}
                            onChange={(e) => setNewCreditor({ ...newCreditor, isSecured: e.target.checked })}
                        />
                        <label htmlFor="isSecured" className="text-sm">
                            담보부 채권
                        </label>
                    </div>

                    <Button onClick={handleAddCreditor} className="w-full" variant="outline">
                        + 채권자 추가
                    </Button>

                    {errors && <p className="text-red-500 text-sm">{errors}</p>}
                </div>

                {/* 채권자 목록 */}
                {creditors.length > 0 && (
                    <div className="space-y-2">
                        <h3 className="font-semibold">채권자 목록 ({creditors.length}명)</h3>
                        {creditors.map((creditor) => (
                            <div
                                key={creditor.id}
                                className="border rounded-lg p-3 flex justify-between items-start bg-white"
                            >
                                <div className="flex-1">
                                    <div className="font-semibold">
                                        {creditor.name}
                                        {creditor.isSecured && (
                                            <span className="ml-2 text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded">
                                                담보부
                                            </span>
                                        )}
                                    </div>
                                    <div className="text-sm text-gray-600">
                                        원금: {creditor.principal.toLocaleString()}원
                                    </div>
                                    <div className="text-xs text-gray-500">원인: {creditor.cause}</div>
                                </div>
                                <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => removeCreditor(creditor.id)}
                                >
                                    삭제
                                </Button>
                            </div>
                        ))}

                        <div className="rounded-lg bg-blue-50 p-4 space-y-1">
                            <div className="flex justify-between text-sm">
                                <span>담보부 채무:</span>
                                <span className="font-semibold">{securedDebt.toLocaleString()}원</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span>무담보 채무:</span>
                                <span className="font-semibold">{unsecuredDebt.toLocaleString()}원</span>
                            </div>
                            <div className="flex justify-between font-bold text-blue-900 pt-2 border-t">
                                <span>총 채무액:</span>
                                <span>{totalDebt.toLocaleString()}원</span>
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
