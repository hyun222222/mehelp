"use client";

import { useState, useEffect } from "react";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function DisclaimerModal() {
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        const hasAgreed = sessionStorage.getItem("hasAgreedToDisclaimer");
        if (!hasAgreed) {
            setIsOpen(true);
        }
    }, []);

    const handleAgree = () => {
        sessionStorage.setItem("hasAgreedToDisclaimer", "true");
        setIsOpen(false);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <Card className="w-full max-w-lg shadow-lg">
                <CardHeader>
                    <CardTitle className="text-red-600">⚠️ 서비스 이용 전 필독 사항</CardTitle>
                    <CardDescription>
                        본 서비스는 법률적 효력을 보증하지 않습니다.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 text-sm text-slate-700">
                    <p>
                        1. <strong>서버 저장 없음</strong>: 귀하가 입력한 모든 정보는 서버에 저장되지 않으며,
                        현재 사용 중인 브라우저(SessionStorage)에만 임시 저장됩니다.
                        브라우저 창을 닫으면 모든 데이터는 즉시 삭제됩니다.
                    </p>
                    <p>
                        2. <strong>공용 PC 주의</strong>: PC방 등 공용 컴퓨터에서 이용 시,
                        반드시 사용 후 브라우저를 완전히 종료해 주시기 바랍니다.
                    </p>
                    <p>
                        3. <strong>법적 책임 면책</strong>: 본 프로그램이 생성한 문서는 단순 참고용 초안이며,
                        법원의 실제 판단과 다를 수 있습니다. 제출 전 반드시 변호사나 법무사의 검토를 받으시기 바랍니다.
                    </p>
                </CardContent>
                <CardFooter className="flex justify-end">
                    <Button onClick={handleAgree} className="w-full sm:w-auto">
                        위 내용을 확인하였으며 동의합니다
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}
