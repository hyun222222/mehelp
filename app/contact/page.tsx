"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Phone, Mail, Send } from "lucide-react";

export default function ContactPage() {
    const [formData, setFormData] = useState({
        name: "",
        phone: "",
        email: "",
        message: ""
    });
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // 여기서 실제로는 이메일 전송이나 DB 저장을 할 수 있습니다
        // 지금은 간단히 성공 메시지만 표시
        setSubmitted(true);
    };

    if (submitted) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
                <Card className="max-w-md w-full">
                    <CardHeader>
                        <CardTitle className="text-green-600">문의가 접수되었습니다</CardTitle>
                        <CardDescription>
                            빠른 시일 내에 연락드리겠습니다.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button onClick={() => window.location.href = "/"} className="w-full">
                            홈으로 돌아가기
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mx-auto space-y-8">
                <div className="text-center">
                    <h1 className="text-3xl font-bold text-slate-900">정식 의뢰 문의</h1>
                    <p className="mt-2 text-slate-600">
                        아래 정보를 남겨주시면 빠르게 연락드리겠습니다.
                    </p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>연락처 정보</CardTitle>
                        <CardDescription>
                            담당 변호사: 김현정 | 전화: 010-5534-6843
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="name">성명 *</Label>
                                <Input
                                    id="name"
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="phone">연락처 *</Label>
                                <Input
                                    id="phone"
                                    type="tel"
                                    required
                                    placeholder="010-0000-0000"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="email">이메일</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="example@email.com"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="message">문의 내용</Label>
                                <Textarea
                                    id="message"
                                    placeholder="상담하고 싶은 내용을 간단히 적어주세요"
                                    className="min-h-[120px]"
                                    value={formData.message}
                                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                />
                            </div>

                            <div className="flex gap-3">
                                <Button type="submit" className="flex-1">
                                    <Send className="w-4 h-4 mr-2" />
                                    문의 접수
                                </Button>
                                <Button type="button" variant="outline" asChild>
                                    <a href="tel:010-5534-6843">
                                        <Phone className="w-4 h-4 mr-2" />
                                        전화 상담
                                    </a>
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>

                <div className="grid md:grid-cols-2 gap-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Phone className="w-5 h-5 text-blue-600" />
                                전화 상담
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-slate-600 mb-3">
                                바로 상담을 원하시면 전화주세요
                            </p>
                            <Button variant="outline" className="w-full" asChild>
                                <a href="tel:010-5534-6843">010-5534-6843</a>
                            </Button>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Mail className="w-5 h-5 text-green-600" />
                                방문 상담
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-slate-600">
                                서울 서초구 법원로 16<br />
                                정곡빌딩 동관 502호
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
