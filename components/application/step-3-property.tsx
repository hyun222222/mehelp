"use client";

import { useWizardStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CurrencyInput } from "@/components/ui/currency-input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2 } from "lucide-react";
import { v4 as uuidv4 } from 'uuid';

interface StepProps {
    onNext: () => void;
    onPrev: () => void;
}

export function Step3Property({ onNext, onPrev }: StepProps) {
    const store = useWizardStore();

    const handleAddProperty = () => {
        store.addArrayItem("properties", {
            id: uuidv4(),
            type: "deposit",
            description: "",
            value: 0,
            securedAmount: 0
        });
    };

    const handleRemoveProperty = (id: string) => {
        store.removeArrayItem("properties", id);
    };

    const handleUpdateProperty = (id: string, field: string, value: any) => {
        store.updateArrayItem("properties", id, { [field]: value });
    };

    const calculateTotalAssets = () => {
        return store.properties.reduce((sum: number, item: any) => sum + (item.value || 0), 0);
    };

    const calculateLiquidationValue = () => {
        const total = calculateTotalAssets();
        return Math.max(0, total - store.exemptionAmount);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onNext();
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>3. 재산 목록</CardTitle>
                    <CardDescription>
                        보유하고 있는 모든 재산을 빠짐없이 기재해야 합니다. (누락 시 불이익이 있을 수 있습니다)
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <Label className="text-base">재산 항목</Label>
                            <Button type="button" variant="outline" size="sm" onClick={handleAddProperty}>
                                <Plus className="w-4 h-4 mr-2" />
                                재산 추가
                            </Button>
                        </div>

                        {store.properties.length === 0 && (
                            <p className="text-sm text-gray-500 text-center py-4 bg-gray-50 rounded-md">
                                등록된 재산이 없습니다. (없으면 '다음 단계로' 이동)
                            </p>
                        )}

                        {store.properties.map((item: any, index: number) => (
                            <div key={item.id} className="flex gap-3 items-start p-3 border rounded-md bg-gray-50">
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-3 flex-1">
                                    <div className="space-y-1">
                                        <Label className="text-xs">종류</Label>
                                        <Select
                                            value={item.type}
                                            onValueChange={(val) => handleUpdateProperty(item.id, "type", val)}
                                        >
                                            <SelectTrigger className="h-8 text-sm">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="cash">현금 (10만원 이상)</SelectItem>
                                                <SelectItem value="deposit">예금/적금</SelectItem>
                                                <SelectItem value="insurance">보험 (해약환급금)</SelectItem>
                                                <SelectItem value="vehicle">자동차/오토바이</SelectItem>
                                                <SelectItem value="deposit_rent">임차보증금</SelectItem>
                                                <SelectItem value="realEstate">부동산 (토지/건물)</SelectItem>
                                                <SelectItem value="business">사업용 설비/재고</SelectItem>
                                                <SelectItem value="severance">예상 퇴직금</SelectItem>
                                                <SelectItem value="other">기타</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-1 md:col-span-2">
                                        <Label className="text-xs">상세 내역 (은행명, 차량번호, 주소 등)</Label>
                                        <Input
                                            value={item.description}
                                            onChange={(e) => handleUpdateProperty(item.id, "description", e.target.value)}
                                            placeholder="상세 내용을 입력하세요"
                                            className="h-8 text-sm"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-xs">가액 (시가/예상액)</Label>
                                        <CurrencyInput
                                            value={item.value}
                                            onChange={(val) => handleUpdateProperty(item.id, "value", val)}
                                            placeholder="원"
                                            className="h-8 text-sm"
                                        />
                                    </div>
                                    {(item.type === 'realEstate' || item.type === 'vehicle') && (
                                        <div className="space-y-1 md:col-span-4">
                                            <Label className="text-xs">담보 설정액 (근저당 등)</Label>
                                            <CurrencyInput
                                                value={item.securedAmount || 0}
                                                onChange={(val) => handleUpdateProperty(item.id, "securedAmount", val)}
                                                placeholder="채권최고액이 아닌 실제 피담보채무액 기재"
                                                className="h-8 text-sm"
                                            />
                                        </div>
                                    )}
                                </div>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="text-red-500 hover:text-red-700 hover:bg-red-50 h-8 w-8 mt-6"
                                    onClick={() => handleRemoveProperty(item.id)}
                                >
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>
                        ))}
                    </div>

                    <div className="space-y-4 border-t pt-4">
                        <div className="space-y-2">
                            <Label htmlFor="exemptionAmount">면제재산 신청 금액</Label>
                            <div className="relative">
                                <CurrencyInput
                                    id="exemptionAmount"
                                    value={store.exemptionAmount}
                                    onChange={(val) => store.setField("exemptionAmount", val)}
                                    className="pl-8"
                                />
                                <span className="absolute left-3 top-2.5 text-gray-500">₩</span>
                            </div>
                            <p className="text-xs text-gray-500">
                                * 임차보증금 중 최우선변제금, 6개월간의 생계비 등 법령이 정한 면제재산
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-lg">
                            <div>
                                <p className="text-sm font-medium text-gray-500">총 재산 가액</p>
                                <p className="text-lg font-bold">{calculateTotalAssets().toLocaleString()} 원</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-blue-600">청산가치 (예상)</p>
                                <p className="text-lg font-bold text-blue-600">{calculateLiquidationValue().toLocaleString()} 원</p>
                            </div>
                        </div>
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
