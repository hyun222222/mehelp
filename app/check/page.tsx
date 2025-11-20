"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { CHECKLIST_DATA } from "@/lib/checklist-data";
import { ChecklistSectionComponent } from "@/components/check/checklist-section";
import Link from "next/link";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CheckCircle2, AlertTriangle, FileText } from "lucide-react";

export default function CheckPage() {
    // Load initial state from localStorage if available
    const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        const saved = localStorage.getItem("rehab-checklist");
        if (saved) {
            try {
                setCheckedItems(JSON.parse(saved));
            } catch (e) {
                console.error("Failed to load checklist state", e);
            }
        }
    }, []);

    useEffect(() => {
        if (mounted) {
            localStorage.setItem("rehab-checklist", JSON.stringify(checkedItems));
        }
    }, [checkedItems, mounted]);

    const handleToggleItem = (id: string, checked: boolean) => {
        setCheckedItems(prev => ({
            ...prev,
            [id]: checked
        }));
    };

    const handleReset = () => {
        if (confirm("체크리스트를 초기화하시겠습니까?")) {
            setCheckedItems({});
        }
    };

    // Calculate overall progress
    const allItems = CHECKLIST_DATA.flatMap(s => s.items);
    const totalCount = allItems.length;
    const checkedCount = allItems.filter(i => checkedItems[i.id]).length;
    const totalProgress = Math.round((checkedCount / totalCount) * 100);

    // Check critical items
    const criticalItems = allItems.filter(i => i.isCritical);
    const criticalChecked = criticalItems.filter(i => checkedItems[i.id]).length;
    const allCriticalChecked = criticalItems.length > 0 && criticalItems.length === criticalChecked;

    return (
        <div className="container mx-auto max-w-3xl p-4 md:p-8 pb-24">
            <div className="mb-8 space-y-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-bold text-gray-900">개인회생 자가진단 체크리스트</h1>
                    <Button variant="ghost" size="sm" onClick={handleReset} className="text-gray-500">
                        초기화
                    </Button>
                </div>
                <p className="text-gray-600">
                    개인회생 절차의 각 단계별로 필요한 사항들을 꼼꼼히 점검해보세요.
                    진행 상황은 자동으로 저장됩니다.
                </p>

                <div className="bg-white p-4 rounded-xl border shadow-sm sticky top-4 z-10">
                    <div className="flex justify-between text-sm font-medium mb-2">
                        <span>전체 진행률</span>
                        <span className="text-blue-600">{totalProgress}%</span>
                    </div>
                    <Progress value={totalProgress} className="h-3" />

                    {!allCriticalChecked && checkedCount > 0 && (
                        <div className="mt-3 flex items-start gap-2 text-sm text-amber-700 bg-amber-50 p-2 rounded">
                            <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                            <p>아직 확인되지 않은 <strong>필수 자격 요건</strong>이 있습니다. (1단계 확인 필요)</p>
                        </div>
                    )}
                </div>
            </div>

            <div className="space-y-8">
                {CHECKLIST_DATA.map((section) => (
                    <ChecklistSectionComponent
                        key={section.id}
                        section={section}
                        checkedItems={checkedItems}
                        onToggleItem={handleToggleItem}
                    />
                ))}
            </div>

            <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] z-20">
                <div className="container mx-auto max-w-3xl flex gap-4 items-center justify-between">
                    <div className="hidden md:block">
                        <p className="text-sm font-medium text-gray-900">
                            {totalProgress === 100
                                ? "모든 항목을 확인했습니다! 이제 신청서를 작성하세요."
                                : allCriticalChecked
                                    ? "필수 항목을 모두 확인했습니다. 신청을 진행하세요!"
                                    : "꼼꼼한 준비가 성공적인 회생의 첫걸음입니다."}
                        </p>
                    </div>
                    <div className="flex gap-3 w-full md:w-auto">
                        <Link href="/" className="flex-1 md:flex-none">
                            <Button variant="outline" className="w-full">홈으로</Button>
                        </Link>
                        {allCriticalChecked ? (
                            <Link href="/apply" className="flex-1 md:flex-none">
                                <Button className="w-full bg-green-600 hover:bg-green-700">
                                    <FileText className="w-4 h-4 mr-2" />
                                    신청서 작성하기
                                </Button>
                            </Link>
                        ) : (
                            <Link href="/repayment-plan" className="flex-1 md:flex-none">
                                <Button className="w-full bg-blue-600 hover:bg-blue-700">
                                    <FileText className="w-4 h-4 mr-2" />
                                    변제계획안 작성하기
                                </Button>
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
