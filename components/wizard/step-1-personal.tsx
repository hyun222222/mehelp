"use client";

import { useState } from "react";
import { useWizardStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function Step1Personal({ onNext }: { onNext: () => void }) {
    const { name, residentNumber, address, phone, dependents, setField } = useWizardStore();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !residentNumber || !address || !phone) {
            alert("모든 항목을 입력해주세요.");
            return;
        }
        onNext();
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>1. 기본 인적사항</CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">이름</label>
                            <Input
                                value={name}
                                onChange={(e) => setField("name", e.target.value)}
                                placeholder="홍길동"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">주민등록번호</label>
                            <Input
                                value={residentNumber}
                                onChange={(e) => setField("residentNumber", e.target.value)}
                                placeholder="000000-0000000"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">주소</label>
                        <Input
                            value={address}
                            onChange={(e) => setField("address", e.target.value)}
                            placeholder="주민등록상 주소지 입력"
                        />
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">연락처</label>
                            <Input
                                value={phone}
                                onChange={(e) => setField("phone", e.target.value)}
                                placeholder="010-0000-0000"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">부양가족 수 (본인 포함)</label>
                            <Input
                                type="number"
                                min={1}
                                value={dependents}
                                onChange={(e) => setField("dependents", parseInt(e.target.value))}
                            />
                            <p className="text-xs text-slate-500">본인 포함 1명 이상 입력</p>
                        </div>
                    </div>

                    <div className="flex justify-end pt-4">
                        <Button type="submit">다음 단계로</Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}
