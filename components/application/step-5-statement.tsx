"use client";

import { useWizardStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Trash2 } from "lucide-react";
import { v4 as uuidv4 } from 'uuid';

interface StepProps {
    onNext: () => void;
    onPrev: () => void;
}

export function Step5Statement({ onNext, onPrev }: StepProps) {
    const store = useWizardStore();

    const handleAddCareer = () => {
        store.addArrayItem("careers", {
            id: uuidv4(),
            period: "",
            company: "",
            position: "",
            type: "employment"
        });
    };

    const handleRemoveCareer = (id: string) => {
        store.removeArrayItem("careers", id);
    };

    const handleUpdateCareer = (id: string, field: string, value: any) => {
        store.updateArrayItem("careers", id, { [field]: value });
    };

    const debtCauseOptions = [
        "생활비 부족", "병원비 과다 지출", "교육비 과다 지출",
        "음식/음주/여행/도박/취미", "점포 운영 실패",
        "타인 채무 보증", "주식 투자 실패", "사기 피해"
    ];

    const handleDebtCauseChange = (cause: string, checked: boolean) => {
        const current = store.debtCauses || [];
        if (checked) {
            store.setField("debtCauses", [...current, cause]);
        } else {
            store.setField("debtCauses", current.filter((c: string) => c !== cause));
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onNext();
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>5. 진술서 (경력 및 주거)</CardTitle>
                    <CardDescription>
                        법원에서 채무자의 상황을 이해하기 위한 자료입니다. 솔직하게 기재해주세요.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="education">최종 학력</Label>
                        <Input
                            id="education"
                            value={store.education}
                            onChange={(e) => store.setField("education", e.target.value)}
                            placeholder="예: OO대학교 졸업 (2010년)"
                        />
                    </div>

                    <div className="space-y-4 border-t pt-4">
                        <div className="flex justify-between items-center">
                            <Label className="text-base">과거 경력 (최근 순서대로)</Label>
                            <Button type="button" variant="outline" size="sm" onClick={handleAddCareer}>
                                <Plus className="w-4 h-4 mr-2" />
                                경력 추가
                            </Button>
                        </div>

                        {store.careers.map((item: any) => (
                            <div key={item.id} className="flex gap-3 items-start p-3 border rounded-md bg-gray-50">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 flex-1">
                                    <div className="space-y-1">
                                        <Label className="text-xs">기간</Label>
                                        <Input
                                            value={item.period}
                                            onChange={(e) => handleUpdateCareer(item.id, "period", e.target.value)}
                                            placeholder="2010.1 ~ 2015.12"
                                            className="h-8 text-sm"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-xs">직장명/상호</Label>
                                        <Input
                                            value={item.company}
                                            onChange={(e) => handleUpdateCareer(item.id, "company", e.target.value)}
                                            className="h-8 text-sm"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-xs">직위/업종</Label>
                                        <Input
                                            value={item.position}
                                            onChange={(e) => handleUpdateCareer(item.id, "position", e.target.value)}
                                            className="h-8 text-sm"
                                        />
                                    </div>
                                </div>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="text-red-500 hover:text-red-700 hover:bg-red-50 h-8 w-8 mt-6"
                                    onClick={() => handleRemoveCareer(item.id)}
                                >
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>
                        ))}
                    </div>

                    <div className="space-y-4 border-t pt-4">
                        <Label className="text-base">현재 주거 상황</Label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>거주 형태</Label>
                                <Select
                                    value={store.housingType}
                                    onValueChange={(val) => store.setField("housingType", val)}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="owned">본인 소유</SelectItem>
                                        <SelectItem value="rent">임차 (전/월세)</SelectItem>
                                        <SelectItem value="relative">친족 무상 거주</SelectItem>
                                        <SelectItem value="other">기타</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="housingDetail">상세 내용</Label>
                                <Input
                                    id="housingDetail"
                                    value={store.housingDetail}
                                    onChange={(e) => store.setField("housingDetail", e.target.value)}
                                    placeholder="보증금/월세 또는 소유자 관계 등"
                                />
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>6. 채무 증대 경위</CardTitle>
                    <CardDescription>
                        채무가 발생하고 지급불능에 이르게 된 사유를 선택하고 구체적으로 기술해주세요.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-2">
                        <Label>주요 원인 (중복 선택 가능)</Label>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {debtCauseOptions.map((cause) => (
                                <div key={cause} className="flex items-center space-x-2">
                                    <Checkbox
                                        id={`cause-${cause}`}
                                        checked={(store.debtCauses || []).includes(cause)}
                                        onCheckedChange={(checked) => handleDebtCauseChange(cause, checked as boolean)}
                                    />
                                    <Label htmlFor={`cause-${cause}`} className="text-sm font-normal">{cause}</Label>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="debtCauseDetail">구체적 사유 (서술형)</Label>
                        <Textarea
                            id="debtCauseDetail"
                            value={store.debtCauseDetail}
                            onChange={(e) => store.setField("debtCauseDetail", e.target.value)}
                            placeholder="채무가 늘어나게 된 경위와 현재 상황을 상세히 적어주세요."
                            className="min-h-[150px]"
                        />
                    </div>

                    <div className="space-y-2 border-t pt-4">
                        <Label htmlFor="pastInsolvency">과거 면책/회생 이용 이력</Label>
                        <Input
                            id="pastInsolvency"
                            value={store.pastInsolvency}
                            onChange={(e) => store.setField("pastInsolvency", e.target.value)}
                            placeholder="없음 또는 '2020년 파산면책 (서울회생법원)' 등 기재"
                        />
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
