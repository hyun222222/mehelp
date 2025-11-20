"use client";

import { useWizardStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface StepProps {
    onNext: () => void;
}

export function Step1BasicInfo({ onNext }: StepProps) {
    const store = useWizardStore();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Basic validation could go here
        onNext();
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>1. 신청인 정보</CardTitle>
                    <CardDescription>신청인의 인적사항을 정확하게 기재해주세요.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="applicantName">성명</Label>
                            <Input
                                id="applicantName"
                                value={store.applicantName}
                                onChange={(e) => store.setField("applicantName", e.target.value)}
                                required
                                placeholder="홍길동"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="applicantRRN">주민등록번호</Label>
                            <Input
                                id="applicantRRN"
                                value={store.applicantRRN}
                                onChange={(e) => store.setField("applicantRRN", e.target.value)}
                                required
                                placeholder="000000-0000000"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="applicantAddress">주민등록상 주소</Label>
                        <Input
                            id="applicantAddress"
                            value={store.applicantAddress}
                            onChange={(e) => store.setField("applicantAddress", e.target.value)}
                            required
                            placeholder="등본상 주소를 입력하세요"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="applicantCurrentAddress">현주소 (우편물 수령지)</Label>
                        <Input
                            id="applicantCurrentAddress"
                            value={store.applicantCurrentAddress}
                            onChange={(e) => store.setField("applicantCurrentAddress", e.target.value)}
                            required
                            placeholder="실제 거주하는 주소를 입력하세요"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="applicantPhone">전화번호 (집/직장)</Label>
                            <Input
                                id="applicantPhone"
                                value={store.applicantPhone}
                                onChange={(e) => store.setField("applicantPhone", e.target.value)}
                                placeholder="02-0000-0000"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="applicantMobile">휴대전화</Label>
                            <Input
                                id="applicantMobile"
                                value={store.applicantMobile}
                                onChange={(e) => store.setField("applicantMobile", e.target.value)}
                                required
                                placeholder="010-0000-0000"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="applicantEmail">이메일</Label>
                        <Input
                            id="applicantEmail"
                            type="email"
                            value={store.applicantEmail}
                            onChange={(e) => store.setField("applicantEmail", e.target.value)}
                            placeholder="example@email.com"
                        />
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>2. 관할 법원 및 대리인</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="courtName">신청 법원</Label>
                        <Select
                            value={store.courtName}
                            onValueChange={(value) => store.setField("courtName", value)}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="법원을 선택하세요" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="서울회생법원">서울회생법원</SelectItem>
                                <SelectItem value="의정부지방법원">의정부지방법원</SelectItem>
                                <SelectItem value="인천지방법원">인천지방법원</SelectItem>
                                <SelectItem value="수원회생법원">수원회생법원</SelectItem>
                                <SelectItem value="춘천지방법원">춘천지방법원</SelectItem>
                                <SelectItem value="대전지방법원">대전지방법원</SelectItem>
                                <SelectItem value="청주지방법원">청주지방법원</SelectItem>
                                <SelectItem value="대구지방법원">대구지방법원</SelectItem>
                                <SelectItem value="부산회생법원">부산회생법원</SelectItem>
                                <SelectItem value="울산지방법원">울산지방법원</SelectItem>
                                <SelectItem value="창원지방법원">창원지방법원</SelectItem>
                                <SelectItem value="광주지방법원">광주지방법원</SelectItem>
                                <SelectItem value="전주지방법원">전주지방법원</SelectItem>
                                <SelectItem value="제주지방법원">제주지방법원</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2 border-t pt-4 mt-4">
                        <h4 className="font-medium mb-2">대리인 정보 (선택사항)</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="agentName">대리인 성명</Label>
                                <Input
                                    id="agentName"
                                    value={store.agentName}
                                    onChange={(e) => store.setField("agentName", e.target.value)}
                                    placeholder="변호사/법무사 홍길동"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="agentPhone">사무실 전화</Label>
                                <Input
                                    id="agentPhone"
                                    value={store.agentPhone}
                                    onChange={(e) => store.setField("agentPhone", e.target.value)}
                                    placeholder="02-0000-0000"
                                />
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>3. 기타 사항</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <h4 className="font-medium mb-2">관련 사건 (배우자 등)</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="relatedCaseName">관련자 성명</Label>
                                <Input
                                    id="relatedCaseName"
                                    value={store.relatedCaseName}
                                    onChange={(e) => store.setField("relatedCaseName", e.target.value)}
                                    placeholder="배우자 등 성명"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="relatedCaseNumber">사건번호</Label>
                                <Input
                                    id="relatedCaseNumber"
                                    value={store.relatedCaseNumber}
                                    onChange={(e) => store.setField("relatedCaseNumber", e.target.value)}
                                    placeholder="2024개회00000"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2 border-t pt-4 mt-4">
                        <h4 className="font-medium mb-2">환급 계좌 (기각 시 반환용)</h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="refundBank">은행명</Label>
                                <Input
                                    id="refundBank"
                                    value={store.refundBank}
                                    onChange={(e) => store.setField("refundBank", e.target.value)}
                                    placeholder="OO은행"
                                />
                            </div>
                            <div className="space-y-2 md:col-span-2">
                                <Label htmlFor="refundAccount">계좌번호</Label>
                                <Input
                                    id="refundAccount"
                                    value={store.refundAccount}
                                    onChange={(e) => store.setField("refundAccount", e.target.value)}
                                    placeholder="'-' 없이 입력"
                                />
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="flex justify-end">
                <Button type="submit" size="lg">다음 단계로</Button>
            </div>
        </form>
    );
}
