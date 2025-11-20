"use client";

import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GraduationCap, Briefcase, Award, BookOpen } from "lucide-react";

export default function ProfilePage() {
    return (
        <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto space-y-8">
                <div className="flex flex-col md:flex-row items-center justify-center gap-6">
                    <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-blue-600 shadow-lg">
                        <Image
                            src="/profile-photo.png"
                            alt="김현정 변호사"
                            fill
                            className="object-cover"
                        />
                    </div>
                    <div className="text-center md:text-left space-y-2">
                        <h1 className="text-3xl font-bold text-slate-900">변호사 소개</h1>
                        <p className="text-lg text-slate-600">김현정 변호사</p>
                    </div>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                    {/* 학력사항 */}
                    <Card>
                        <CardHeader className="flex flex-row items-center gap-4 pb-2">
                            <div className="p-2 bg-blue-100 rounded-lg">
                                <GraduationCap className="w-6 h-6 text-blue-600" />
                            </div>
                            <CardTitle className="text-xl">학력사항</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ul className="space-y-3 text-slate-600">
                                <li>이화여자대학교 경영전문대학원 제1기 변호사 사외이사 아카데미 수료</li>
                                <li>이화여자대학교 법학전문대학원 졸업 / 상사법 전공</li>
                                <li>이화여자대학교 졸업 / 사회학·전자상거래 전공</li>
                                <li>이화여자고등학교 졸업</li>
                            </ul>
                        </CardContent>
                    </Card>

                    {/* 경력사항 */}
                    <Card>
                        <CardHeader className="flex flex-row items-center gap-4 pb-2">
                            <div className="p-2 bg-green-100 rounded-lg">
                                <Briefcase className="w-6 h-6 text-green-600" />
                            </div>
                            <CardTitle className="text-xl">경력사항</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ul className="space-y-3 text-slate-600">
                                <li className="flex gap-2">
                                    <span className="font-semibold min-w-[100px]">2015. 2 ~ 현재</span>
                                    <span>김앤현 법률사무소 송무 및 자문업무 담당</span>
                                </li>
                                <li className="flex gap-2">
                                    <span className="font-semibold min-w-[100px]">2015. 4</span>
                                    <span>변호사시험 4회 합격</span>
                                </li>
                            </ul>
                        </CardContent>
                    </Card>

                    {/* 자격증 및 어학능력 */}
                    <Card>
                        <CardHeader className="flex flex-row items-center gap-4 pb-2">
                            <div className="p-2 bg-purple-100 rounded-lg">
                                <Award className="w-6 h-6 text-purple-600" />
                            </div>
                            <CardTitle className="text-xl">자격증 및 전문분야</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ul className="space-y-3 text-slate-600">
                                <li>대한변호사협회: 변호사 (2015~현재)</li>
                                <li>대한변리사협회: 변리사 (2020~현재)</li>
                                <li>대한변호사협회 전문분야: 형사법 / 부동산</li>
                                <li>기획재정부: 세무사 (2024. 2~ 현재)</li>
                            </ul>
                        </CardContent>
                    </Card>

                    {/* 수상이력 및 외부활동 */}
                    <Card>
                        <CardHeader className="flex flex-row items-center gap-4 pb-2">
                            <div className="p-2 bg-orange-100 rounded-lg">
                                <BookOpen className="w-6 h-6 text-orange-600" />
                            </div>
                            <CardTitle className="text-xl">수상이력 및 외부활동</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ul className="space-y-3 text-slate-600">
                                <li>대법원 국선변호인 (2018.01 ~ 현재)</li>
                                <li>서울특별시 교육청 성희롱성폭력 자문심의위원 (2020.1 ~ 현재)</li>
                                <li>서울가정법원 전문가 성년후견인</li>
                                <li>유튜브 '이기는 상속가사법' / '이기는 부동산법' 운영</li>
                            </ul>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
