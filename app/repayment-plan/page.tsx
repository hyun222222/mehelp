"use client";

import { useState } from "react";
import { Step1BasicInfo } from "@/components/repayment/step-1-basic-info";
import { Step2Income } from "@/components/repayment/step-2-income";
import { Step3Debts } from "@/components/repayment/step-3-debts";
import { Step4Plan } from "@/components/repayment/step-4-plan";
import { Step5Preview } from "@/components/repayment/step-5-preview";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function RepaymentPlanPage() {
    const router = useRouter();
    const [step, setStep] = useState(1);

    const handleNext = () => setStep((prev) => prev + 1);
    const handlePrev = () => setStep((prev) => prev - 1);
    const handleHome = () => router.push("/");

    return (
        <div className="min-h-screen bg-slate-50 p-4 md:p-8">
            <div className="mx-auto max-w-4xl space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">개인회생 변제계획서 작성</h1>
                        <p className="text-sm text-slate-500">단계별로 정보를 입력해주세요.</p>
                    </div>
                    <Button variant="outline" size="sm" onClick={handleHome}>
                        홈으로
                    </Button>
                </div>

                {/* Progress Bar */}
                <div className="h-2 w-full rounded-full bg-slate-200">
                    <div
                        className="h-2 rounded-full bg-blue-600 transition-all duration-300"
                        style={{ width: `${(step / 5) * 100}%` }}
                    />
                </div>

                {/* Step Content */}
                <div className="mt-8">
                    {step === 1 && <Step1BasicInfo onNext={handleNext} />}
                    {step === 2 && <Step2Income onNext={handleNext} onPrev={handlePrev} />}
                    {step === 3 && <Step3Debts onNext={handleNext} onPrev={handlePrev} />}
                    {step === 4 && <Step4Plan onNext={handleNext} onPrev={handlePrev} />}
                    {step === 5 && <Step5Preview onPrev={handlePrev} />}
                </div>
            </div>
        </div>
    );
}
