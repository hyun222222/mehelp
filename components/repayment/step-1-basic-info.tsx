"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useRepaymentPlanStore } from "@/lib/repayment-store";

interface Step1BasicInfoProps {
    onNext: () => void;
}

export function Step1BasicInfo({ onNext }: Step1BasicInfoProps) {
    const { basicInfo, setBasicInfo } = useRepaymentPlanStore();
    const [errors, setErrors] = useState<Record<string, string>>({});

    const handleSubmit = () => {
        const newErrors: Record<string, string> = {};

        if (!basicInfo.name.trim()) newErrors.name = "성명을 입력해주세요";
        if (!basicInfo.residentNumber.trim()) newErrors.residentNumber = "주민등록번호를 입력해주세요";
        if (!basicInfo.address.trim()) newErrors.address = "주소를 입력해주세요";
        if (!basicInfo.occupation.trim()) newErrors.occupation = "직업을 입력해주세요";

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        onNext();
    };

    return (
        <Card>
            <CardHeader className="bg-blue-50">
                <CardTitle className="text-blue-900">1단계: 채무자 기본정보</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
                <div className="rounded-lg bg-amber-50 p-4 text-sm">
                    <p className="font-semibold text-amber-900 mb-2">📋 안내</p>
                    <p className="text-amber-800">
                        변제계획서 작성을 위한 기본 인적사항을 입력해주세요.
                    </p>
                </div>

                <div>
                    <label className="block text-sm font-medium mb-2">
                        성명 <span className="text-red-500">*</span>
                    </label>
                    <Input
                        placeholder="홍길동"
                        value={basicInfo.name}
                        onChange={(e) => setBasicInfo({ name: e.target.value })}
                    />
                    {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                </div>

                <div>
                    <label className="block text-sm font-medium mb-2">
                        주민등록번호 <span className="text-red-500">*</span>
                    </label>
                    <Input
                        placeholder="000000-0000000"
                        value={basicInfo.residentNumber}
                        onChange={(e) => setBasicInfo({ residentNumber: e.target.value })}
                    />
                    {errors.residentNumber && (
                        <p className="text-red-500 text-sm mt-1">{errors.residentNumber}</p>
                    )}
                </div>

                <div>
                    <label className="block text-sm font-medium mb-2">
                        주소 <span className="text-red-500">*</span>
                    </label>
                    <Input
                        placeholder="서울특별시 강남구 ..."
                        value={basicInfo.address}
                        onChange={(e) => setBasicInfo({ address: e.target.value })}
                    />
                    {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address}</p>}
                </div>

                <div>
                    <label className="block text-sm font-medium mb-2">
                        직업 <span className="text-red-500">*</span>
                    </label>
                    <Input
                        placeholder="회사원, 자영업자 등"
                        value={basicInfo.occupation}
                        onChange={(e) => setBasicInfo({ occupation: e.target.value })}
                    />
                    {errors.occupation && <p className="text-red-500 text-sm mt-1">{errors.occupation}</p>}
                </div>

                <div>
                    <label className="block text-sm font-medium mb-2">
                        신청법원 (선택)
                    </label>
                    <Input
                        placeholder="서울회생법원"
                        value={basicInfo.court}
                        onChange={(e) => setBasicInfo({ court: e.target.value })}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-2">
                        사건번호 (선택)
                    </label>
                    <Input
                        placeholder="2025회개00000"
                        value={basicInfo.caseNumber}
                        onChange={(e) => setBasicInfo({ caseNumber: e.target.value })}
                    />
                </div>

                <Button onClick={handleSubmit} className="w-full" size="lg">
                    다음 단계
                </Button>
            </CardContent>
        </Card>
    );
}
