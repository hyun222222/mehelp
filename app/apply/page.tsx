"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useWizardStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Step1BasicInfo } from "@/components/application/step-1-basic-info";
import { Step2Income } from "@/components/application/step-2-income";
import { Step3Property } from "@/components/application/step-3-property";
import { Step4Creditors } from "@/components/application/step-4-creditors";
import { Step5Statement } from "@/components/application/step-5-statement";
import { Step6Repayment } from "@/components/application/step-6-repayment";
import { Step7Preview } from "@/components/application/step-7-preview";
import { DisclaimerModal } from "@/components/disclaimer-modal";

export default function ApplyPage() {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const resetForm = useWizardStore((state) => state.resetForm);

    // Ensure disclaimer is agreed to
    useEffect(() => {
        const hasAgreed = sessionStorage.getItem("hasAgreedToDisclaimer");
        if (!hasAgreed) {
            router.push("/");
        }
    }, [router]);

    const handleNext = () => {
        setStep((prev) => Math.min(prev + 1, 7));
        window.scrollTo(0, 0);
    };

    const handlePrev = () => {
        setStep((prev) => Math.max(prev - 1, 1));
        window.scrollTo(0, 0);
    };

    const handleReset = () => {
        if (confirm("정말로 모든 데이터를 삭제하고 처음으로 돌아가시겠습니까?")) {
            resetForm();
            setStep(1);
            window.scrollTo(0, 0);
        }
    };

    const steps = [
        "기본 정보", "수입/지출", "재산 목록", "채권자 목록", "진술서", "변제계획", "최종 검토"
    ];

    return (
        <div className="min-h-screen bg-slate-50 p-4 md:p-8 print:bg-white print:p-0">
            <div className="print:hidden">
                <DisclaimerModal />
            </div>

            <div className="mx-auto max-w-4xl space-y-6 print:max-w-none print:space-y-0">
                {/* Header & Progress (Hidden when printing) */}
                <div className="print:hidden space-y-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900">개인회생 신청서 작성</h1>
                            <p className="text-sm text-slate-500">
                                {step}단계: {steps[step - 1]}
                            </p>
                        </div>
                        <Button variant="destructive" size="sm" onClick={handleReset}>
                            초기화
                        </Button>
                    </div>

                    {/* Progress Bar */}
                    <div className="h-2 w-full rounded-full bg-slate-200">
                        <div
                            className="h-2 rounded-full bg-blue-600 transition-all duration-300"
                            style={{ width: `${(step / 7) * 100}%` }}
                        />
                    </div>
                </div>

                {/* Step Content */}
                <div className="mt-8 print:mt-0">
                    {step === 1 && <Step1BasicInfo onNext={handleNext} />}
                    {step === 2 && <Step2Income onNext={handleNext} onPrev={handlePrev} />}
                    {step === 3 && <Step3Property onNext={handleNext} onPrev={handlePrev} />}
                    {step === 4 && <Step4Creditors onNext={handleNext} onPrev={handlePrev} />}
                    {step === 5 && <Step5Statement onNext={handleNext} onPrev={handlePrev} />}
                    {step === 6 && <Step6Repayment onNext={handleNext} onPrev={handlePrev} />}
                    {step === 7 && <Step7Preview onPrev={handlePrev} />}
                </div>
            </div>
        </div>
    );
}
