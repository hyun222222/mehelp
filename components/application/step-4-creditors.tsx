"use client";

import { useWizardStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CurrencyInput } from "@/components/ui/currency-input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Trash2 } from "lucide-react";
import { v4 as uuidv4 } from 'uuid';

interface StepProps {
    onNext: () => void;
    onPrev: () => void;
}

export function Step4Creditors({ onNext, onPrev }: StepProps) {
    const store = useWizardStore();

    const handleAddCreditor = () => {
        store.addArrayItem("creditors", {
            id: uuidv4(),
            name: "",
            address: "",
            phone: "",
            isSecured: false,
            principal: 0,
            interest: 0,
            cause: "",
            collateral: ""
        });
    };

    const handleRemoveCreditor = (id: string) => {
        store.removeArrayItem("creditors", id);
    };

    const handleUpdateCreditor = (id: string, field: string, value: any) => {
        store.updateArrayItem("creditors", id, { [field]: value });
    };

    const calculateTotalDebt = () => {
        return store.creditors.reduce((sum: number, item: any) => sum + (item.principal || 0) + (item.interest || 0), 0);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onNext();
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>4. 채권자 목록</CardTitle>
                    <CardDescription>
                        모든 채무를 빠짐없이 기재해야 합니다. 누락된 채권은 면책되지 않을 수 있습니다.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <Label className="text-base">채권자 목록</Label>
                            <Button type="button" variant="outline" size="sm" onClick={handleAddCreditor}>
                                <Plus className="w-4 h-4 mr-2" />
                                채권자 추가
                            </Button>
                        </div>

                        {store.creditors.length === 0 && (
                            <p className="text-sm text-gray-500 text-center py-4 bg-gray-50 rounded-md">
                                등록된 채권자가 없습니다. 최소 1명 이상의 채권자가 있어야 합니다.
                            </p>
                        )}

                        {store.creditors.map((item: any, index: number) => (
                            <div key={item.id} className="flex gap-3 items-start p-3 border rounded-md bg-gray-50">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 flex-1">
                                    <div className="space-y-1 md:col-span-2">
                                        <div className="flex items-center justify-between">
                                            <Label className="text-xs font-bold">채권자명 (금융기관/개인)</Label>
                                            <div className="flex items-center space-x-2">
                                                <Checkbox
                                                    id={`secured-${item.id}`}
                                                    checked={item.isSecured}
                                                    onCheckedChange={(checked) => handleUpdateCreditor(item.id, "isSecured", checked)}
                                                />
                                                <Label htmlFor={`secured-${item.id}`} className="text-xs">담보채권 여부</Label>
                                            </div>
                                        </div>
                                        <Input
                                            value={item.name}
                                            onChange={(e) => handleUpdateCreditor(item.id, "name", e.target.value)}
                                            placeholder="예: OO은행, 홍길동"
                                            className="h-8 text-sm"
                                            required
                                        />
                                    </div>

                                    <div className="space-y-1">
                                        <Label className="text-xs">주소</Label>
                                        <Input
                                            value={item.address}
                                            onChange={(e) => handleUpdateCreditor(item.id, "address", e.target.value)}
                                            placeholder="채권자 주소"
                                            className="h-8 text-sm"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-xs">연락처</Label>
                                        <Input
                                            value={item.phone}
                                            onChange={(e) => handleUpdateCreditor(item.id, "phone", e.target.value)}
                                            placeholder="전화/팩스"
                                            className="h-8 text-sm"
                                        />
                                    </div>

                                    <div className="space-y-1">
                                        <Label className="text-xs">원금 (현재액)</Label>
                                        <CurrencyInput
                                            value={item.principal}
                                            onChange={(val) => handleUpdateCreditor(item.id, "principal", val)}
                                            className="h-8 text-sm"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-xs">이자 (지연손해금 포함)</Label>
                                        <CurrencyInput
                                            value={item.interest}
                                            onChange={(val) => handleUpdateCreditor(item.id, "interest", val)}
                                            className="h-8 text-sm"
                                        />
                                    </div>

                                    <div className="space-y-1 md:col-span-2">
                                        <Label className="text-xs">채권 발생 원인 및 시기</Label>
                                        <Input
                                            value={item.cause}
                                            onChange={(e) => handleUpdateCreditor(item.id, "cause", e.target.value)}
                                            placeholder="예: 2023.1.1.자 생활비 차용금"
                                            className="h-8 text-sm"
                                            required
                                        />
                                    </div>

                                    {item.isSecured && (
                                        <div className="space-y-1 md:col-span-2">
                                            <Label className="text-xs">담보 내용</Label>
                                            <Input
                                                value={item.collateral}
                                                onChange={(e) => handleUpdateCreditor(item.id, "collateral", e.target.value)}
                                                placeholder="예: 서울시 강남구 아파트 근저당권 설정"
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
                                    onClick={() => handleRemoveCreditor(item.id)}
                                >
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>
                        ))}
                    </div>

                    <div className="space-y-4 border-t pt-4">
                        <div className="grid grid-cols-1 gap-4 bg-slate-50 p-4 rounded-lg text-right">
                            <div>
                                <p className="text-sm font-medium text-gray-500">총 채무액 (원금 + 이자)</p>
                                <p className="text-xl font-bold text-red-600">{calculateTotalDebt().toLocaleString()} 원</p>
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
