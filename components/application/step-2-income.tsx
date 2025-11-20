"use client";

import { useWizardStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CurrencyInput } from "@/components/ui/currency-input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Trash2 } from "lucide-react";
import { v4 as uuidv4 } from 'uuid';

interface StepProps {
    onNext: () => void;
    onPrev: () => void;
}

export function Step2Income({ onNext, onPrev }: StepProps) {
    const store = useWizardStore();

    // Safety check: ensure dependents is always an array
    const dependents = Array.isArray(store.dependents) ? store.dependents : [];

    const handleAddDependent = () => {
        // Ensure dependents is an array first
        if (!Array.isArray(store.dependents)) {
            store.setField('dependents', []);
        }

        store.addArrayItem("dependents", {
            id: uuidv4(),
            name: "",
            age: 0,
            relationship: "",
            cohabitation: true,
            hasDisability: false
        });
    };

    const handleRemoveDependent = (id: string) => {
        store.removeArrayItem("dependents", id);
    };

    const handleUpdateDependent = (id: string, field: string, value: any) => {
        store.updateArrayItem("dependents", id, { [field]: value });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onNext();
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>1. 수입 현황</CardTitle>
                    <CardDescription>현재 소득 활동에 대한 정보를 입력해주세요.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label>소득 형태</Label>
                        <RadioGroup
                            value={store.incomeType}
                            onValueChange={(val) => store.setField("incomeType", val)}
                            className="flex gap-4"
                        >
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="salary" id="salary" />
                                <Label htmlFor="salary">급여소득자 (직장인)</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="business" id="business" />
                                <Label htmlFor="business">영업소득자 (사업자/프리랜서)</Label>
                            </div>
                        </RadioGroup>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="employerName">{store.incomeType === 'salary' ? '직장명' : '상호명'}</Label>
                            <Input
                                id="employerName"
                                value={store.employerName}
                                onChange={(e) => store.setField("employerName", e.target.value)}
                                required
                                placeholder={store.incomeType === 'salary' ? '(주)대한민국' : '길동상사'}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="employmentPeriod">{store.incomeType === 'salary' ? '근무기간' : '사업기간'}</Label>
                            <Input
                                id="employmentPeriod"
                                value={store.employmentPeriod}
                                onChange={(e) => store.setField("employmentPeriod", e.target.value)}
                                required
                                placeholder="2020.01.01 ~ 현재"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="monthlyIncome">월 평균 순수입 (세후)</Label>
                        <div className="relative">
                            <CurrencyInput
                                id="monthlyIncome"
                                value={store.monthlyIncome}
                                onChange={(value) => store.setField("monthlyIncome", value)}
                                required
                                className="pl-8"
                            />
                            <span className="absolute left-3 top-2.5 text-gray-500">₩</span>
                        </div>
                        <p className="text-xs text-gray-500">
                            * 최근 1년간의 평균 소득을 기재하세요. (세금, 4대보험 공제 후 금액)
                        </p>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>2. 부양가족 및 생계비</CardTitle>
                    <CardDescription>
                        본인을 포함한 부양가족 수를 기준으로 생계비가 산정됩니다.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <Label className="text-base">부양가족 목록 (본인 제외)</Label>
                            <Button type="button" variant="outline" size="sm" onClick={handleAddDependent}>
                                <Plus className="w-4 h-4 mr-2" />
                                가족 추가
                            </Button>
                        </div>

                        {dependents.length === 0 && (
                            <p className="text-sm text-gray-500 text-center py-4 bg-gray-50 rounded-md">
                                추가된 부양가족이 없습니다. (1인 가구 기준 적용)
                            </p>
                        )}

                        {dependents.map((dep: any, index: number) => (
                            <div key={dep.id} className="flex gap-3 items-start p-3 border rounded-md bg-gray-50">
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 flex-1">
                                    <div className="space-y-1">
                                        <Label className="text-xs">성명</Label>
                                        <Input
                                            value={dep.name}
                                            onChange={(e) => handleUpdateDependent(dep.id, "name", e.target.value)}
                                            placeholder="이름"
                                            className="h-8 text-sm"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-xs">나이</Label>
                                        <Input
                                            type="number"
                                            value={dep.age || ''}
                                            onChange={(e) => handleUpdateDependent(dep.id, "age", Number(e.target.value))}
                                            placeholder="세"
                                            className="h-8 text-sm"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-xs">관계</Label>
                                        <Input
                                            value={dep.relationship}
                                            onChange={(e) => handleUpdateDependent(dep.id, "relationship", e.target.value)}
                                            placeholder="자녀, 배우자 등"
                                            className="h-8 text-sm"
                                        />
                                    </div>
                                    <div className="flex flex-col gap-2 pt-6">
                                        <div className="flex items-center space-x-2">
                                            <Checkbox
                                                id={`cohab-${dep.id}`}
                                                checked={dep.cohabitation}
                                                onCheckedChange={(checked) => handleUpdateDependent(dep.id, "cohabitation", checked)}
                                            />
                                            <Label htmlFor={`cohab-${dep.id}`} className="text-xs">동거</Label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Checkbox
                                                id={`disability-${dep.id}`}
                                                checked={dep.hasDisability}
                                                onCheckedChange={(checked) => handleUpdateDependent(dep.id, "hasDisability", checked)}
                                            />
                                            <Label htmlFor={`disability-${dep.id}`} className="text-xs">장애</Label>
                                        </div>
                                    </div>
                                </div>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="text-red-500 hover:text-red-700 hover:bg-red-50 h-8 w-8 mt-6"
                                    onClick={() => handleRemoveDependent(dep.id)}
                                >
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>
                        ))}
                    </div>

                    <div className="space-y-4 border-t pt-4">
                        <div className="space-y-2">
                            <Label htmlFor="monthlyLivingCost">인정 생계비 (기준 중위소득 60%)</Label>
                            <div className="relative">
                                <CurrencyInput
                                    id="monthlyLivingCost"
                                    value={store.monthlyLivingCost}
                                    onChange={(value) => store.setField("monthlyLivingCost", value)}
                                    required
                                    className="pl-8"
                                />
                                <span className="absolute left-3 top-2.5 text-gray-500">₩</span>
                            </div>
                            <p className="text-xs text-gray-500">
                                * 2024년 기준: 1인 133만원, 2인 220만원, 3인 282만원, 4인 343만원
                            </p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="additionalLivingCost">추가 생계비 (의료비, 주거비 등)</Label>
                            <div className="relative">
                                <CurrencyInput
                                    id="additionalLivingCost"
                                    value={store.additionalLivingCost}
                                    onChange={(value) => store.setField("additionalLivingCost", value)}
                                    className="pl-8"
                                />
                                <span className="absolute left-3 top-2.5 text-gray-500">₩</span>
                            </div>
                        </div>

                        {store.additionalLivingCost > 0 && (
                            <div className="space-y-2">
                                <Label htmlFor="additionalLivingCostReason">추가 생계비 사유</Label>
                                <Input
                                    id="additionalLivingCostReason"
                                    value={store.additionalLivingCostReason}
                                    onChange={(e) => store.setField("additionalLivingCostReason", e.target.value)}
                                    placeholder="예: 지병으로 인한 고정 의료비 지출"
                                    required
                                />
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            <div className="flex justify-between">
                <Button type="button" variant="outline" onClick={onPrev}>이전 단계</Button>
                <Button type="submit">다음 단계로</Button>
            </div>
        </form>
    );
}
