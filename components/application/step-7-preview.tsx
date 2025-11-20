"use client";

import { useState } from "react";
import { useWizardStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Printer, Mail, Phone, Briefcase } from "lucide-react";
import emailjs from '@emailjs/browser';

interface StepProps {
    onPrev: () => void;
}

export function Step7Preview({ onPrev }: StepProps) {
    const store = useWizardStore();
    const [emailSending, setEmailSending] = useState(false);
    const [emailStatus, setEmailStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);

    const handlePrint = () => {
        window.print();
    };

    const handleEmailSubmit = async () => {
        setEmailSending(true);
        setEmailStatus(null);

        try {
            // 이메일 템플릿에 보낼 데이터 준비
            const emailData = {
                to_email: "info@kimnhyun.com", // 변호사님 이메일
                applicant_name: store.applicantName,
                applicant_phone: store.applicantMobile,
                applicant_email: store.applicantEmail,
                total_debt: store.creditors.reduce((sum: number, c: any) => sum + c.principal + c.interest, 0).toLocaleString(),
                monthly_income: store.monthlyIncome.toLocaleString(),
                monthly_payment: store.monthlyPayment.toLocaleString(),
                repayment_period: store.repaymentPeriod,
                creditors_count: store.creditors.length,
                submission_date: new Date().toLocaleDateString('ko-KR')
            };

            // EmailJS로 이메일 전송
            // 주의: 실제 사용하려면 EmailJS 계정 생성 및 설정 필요
            // https://www.emailjs.com/ 에서 가입 후 아래 ID들을 실제 값으로 교체
            await emailjs.send(
                'YOUR_SERVICE_ID',      // EmailJS 서비스 ID
                'YOUR_TEMPLATE_ID',     // EmailJS 템플릿 ID
                emailData,
                'YOUR_PUBLIC_KEY'       // EmailJS Public Key
            );

            setEmailStatus({
                type: 'success',
                message: '✅ 신청서가 변호사에게 성공적으로 전송되었습니다. 빠른 시일 내에 연락드리겠습니다.'
            });
        } catch (error) {
            console.error('Email send error:', error);
            setEmailStatus({
                type: 'error',
                message: '❌ 이메일 전송에 실패했습니다. 전화(010-5534-6843)로 직접 문의해 주세요.'
            });
        } finally {
            setEmailSending(false);
        }
    };

    return (
        <div className="space-y-6">
            <Card className="print:shadow-none print:border-none">
                <CardHeader className="print:hidden">
                    <CardTitle>최종 검토 및 출력</CardTitle>
                    <CardDescription>
                        작성된 내용을 확인하고 인쇄하거나 PDF로 저장하세요.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-8 print:p-0">
                    {/* 상단 액션 버튼 */}
                    <div className="flex flex-col sm:flex-row gap-3 print:hidden">
                        <Button
                            onClick={handlePrint}
                            variant="outline"
                            className="flex-1"
                        >
                            <Printer className="w-4 h-4 mr-2" />
                            신청서 인쇄 / PDF 저장
                        </Button>
                        <Button
                            onClick={handleEmailSubmit}
                            disabled={emailSending}
                            className="flex-1 bg-green-600 hover:bg-green-700"
                        >
                            <Mail className="w-4 h-4 mr-2" />
                            {emailSending ? "전송 중..." : "변호사에게 이메일 보내기"}
                        </Button>
                        <a href="tel:010-5534-6843" className="flex-1">
                            <Button
                                variant="outline"
                                className="w-full"
                            >
                                <Phone className="w-4 h-4 mr-2" />
                                전화 상담하기
                            </Button>
                        </a>
                        <a href="/contact" className="flex-1">
                            <Button
                                variant="default"
                                className="w-full bg-blue-600 hover:bg-blue-700"
                            >
                                <Briefcase className="w-4 h-4 mr-2" />
                                정식 의뢰하기
                            </Button>
                        </a>
                    </div>

                    {/* 이메일 전송 상태 메시지 */}
                    {emailStatus && (
                        <div className={`p-4 rounded-lg ${emailStatus.type === 'success'
                            ? 'bg-green-50 text-green-800 border border-green-200'
                            : 'bg-red-50 text-red-800 border border-red-200'
                            } print:hidden`}>
                            {emailStatus.message}
                        </div>
                    )}

                    {/* 문서 미리보기 영역 */}
                    <div className="bg-white p-8 border rounded-lg shadow-sm print:border-none print:shadow-none print:p-0 text-black">

                        {/* 1. 개시신청서 */}
                        <div className="mb-12 break-after-page">
                            <h1 className="text-2xl font-bold text-center mb-8">개인회생절차 개시신청서</h1>

                            <table className="w-full border-collapse border border-black mb-6 text-sm">
                                <tbody>
                                    <tr>
                                        <td className="border border-black p-2 bg-gray-50 w-24 font-bold">신청인</td>
                                        <td className="border border-black p-2">
                                            <div className="grid grid-cols-2 gap-2">
                                                <div>성명: {store.applicantName}</div>
                                                <div>주민등록번호: {store.applicantRRN}</div>
                                                <div className="col-span-2">주소: {store.applicantAddress}</div>
                                                <div className="col-span-2">현주소: {store.applicantCurrentAddress}</div>
                                                <div>전화: {store.applicantPhone}</div>
                                                <div>휴대전화: {store.applicantMobile}</div>
                                                <div className="col-span-2">이메일: {store.applicantEmail}</div>
                                            </div>
                                        </td>
                                    </tr>
                                    {store.agentName && (
                                        <tr>
                                            <td className="border border-black p-2 bg-gray-50 font-bold">대리인</td>
                                            <td className="border border-black p-2">
                                                <div className="grid grid-cols-2 gap-2">
                                                    <div>성명: {store.agentName}</div>
                                                    <div>전화: {store.agentPhone}</div>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>

                            <div className="mb-6">
                                <h3 className="font-bold mb-2">신청 취지</h3>
                                <p className="p-4 border border-black rounded">
                                    「신청인에 대하여 개인회생절차를 개시한다.」라는 결정을 구합니다.
                                </p>
                            </div>

                            <div className="mb-6">
                                <h3 className="font-bold mb-2">신청 이유</h3>
                                <div className="space-y-2 text-sm">
                                    <p>1. 신청인은 지급불능 상태에 있으며, {store.incomeType === 'salary' ? '급여소득자' : '영업소득자'}로서 장래 계속적인 수입을 얻을 가능성이 있습니다. 수입 및 재산에 관한 구체적 내용은 별지 제3호 및 제5호에 기재된 바와 같으므로 파산의 원인사실이 생길 염려가 있습니다(파산의 원인사실이 생길 염려가 있습니다).</p>

                                    <p className="flex items-start">
                                        <span className="mr-1">□</span>
                                        <span>신청인은 재기적이고 활실한 수입을 얻을 것으로 예상되고, 또한 재무자 회생 및 파산에 관한 법률 제595조에 해당하는 개시신청 기각사유는 없습니다(영업소득자의 경우).</span>
                                    </p>

                                    <p className="flex items-start">
                                        <span className="mr-1">□</span>
                                        <span>신청인은 부동산임대소득 사업소득 농업소득 임업소득 그 밖에 이와 유사한 수입을 장래에 계속적으로 또는 반복하여 얻을 것으로 예상되고, 또한 재무자 회생 및 파산에 관한 법률 제595조에 해당하는 개시신청 기각사유는 없습니다(영업소득자의 경우).</span>
                                    </p>

                                    <p>2. 신청인은 각 회생채권자에 대한 채무 전액의 변제가 곤란하므로, 그 일부를 분할하여 지급할 계획입니다. 즉 현실적에서 계획하고 있는 변제계획의안은 ____{store.repaymentPeriod}____개월간 월 ______{store.monthlyPayment.toLocaleString()}______원씩이고, 이 변제의 준비 및 절차비용지급의 준비를 위하여, 개시결정이 내려지는 경우를 제1회로 하여, 이후 매월 _____일에 개시결정 시 통지되는 개인회생채권자위의 은행계좌에 동액의 금전을 입금하겠습니다.</p>

                                    <p>3. 이 사건 개인회생절차에서 변제계획이 불인가될 경우 불인가 결정 시까지의 적립금을 받을 방식 신청인의 예금계좌는 ________{store.refundBank}______은행 ___________입니다.</p>

                                    <p>4. 개인회생채권자목록 본문(개인회생채권자목록상의 채권자 수 + 2통)은 개시결정 전 회생위원의 지시에 따라 지참하는 일자까지 반드시 제출하겠습니다.</p>
                                </div>
                            </div>

                            <div className="mb-8">
                                <h3 className="font-bold mb-3">첨 부 서 류</h3>
                                <div className="text-sm space-y-1">
                                    <p>1. 개인회생채권자목록 1통</p>
                                    <p>2. 재산목록 1통</p>
                                    <p>3. 수입 및 지출에 관한 목록 1 통</p>
                                    <p>4. 진술서 1통</p>
                                    <p>5. 수입인지 1통(30,000원)</p>
                                    <p>6. 송달료납부서 1통(송달료 10회분 + (채권자 수 × 8회분))</p>
                                    <p>7. 신청인 본인의 예금계좌 사본 1통(대리인의 예금계좌 사본 아님)</p>
                                    <p>8. 위임장 1통(대리인을 통해 신청하는 경우)</p>
                                </div>
                            </div>

                            <div className="border border-black p-4 mb-6">
                                <h3 className="font-bold text-center mb-3">휴대전화를 통한 정본 수신 신청서</h3>
                                <div className="text-sm space-y-2">
                                    <p>위 사건에 관한 개인회생절차 개시결정, 월 변제액 3개월분 연체의 정보를 예납금무자 납부한 송달료 절감을 위하여 휴대전화를 통하여 알려주실 것을 신청합니다.</p>
                                    <p className="mt-3">■ 휴대전화번호 : {store.applicantMobile}</p>

                                    <div className="mt-6 text-center">
                                        <p>20 . . .</p>
                                        <p className="mt-3">신청인 채무자 _____________ (날인 또는 서명)</p>
                                    </div>

                                    <div className="mt-4 text-xs text-gray-600">
                                        <p>※ 개인회생절자 개시결정이 있거나 변제계획 인가결정 후 월 변제액 3개월분 이상 연체 시 위 휴대전화로 문자메시지가 발송됩니다.</p>
                                        <p>※ 문자메시지 서비스 이용 금액은 매시지 1건당 17원씩 납부된 송달료에서 지급됩니다(송달료가 부족하면 문자메시지가 발송되지 않습니다). 추후 서비스 대상 정보, 이용 금액 등이 변동될 수 있습니다.</p>
                                    </div>
                                </div>
                            </div>

                            <div className="text-center mt-12">
                                <p className="mb-8">20 . . .</p>
                                <p className="mb-12">신청인 _____________ (서명 또는 날인)</p>
                                <p className="font-bold text-xl">{store.courtName} 귀중</p>
                            </div>
                        </div>

                        {/* 1. 채권자 목록 */}
                        <div className="mb-12 break-after-page">
                            <h2 className="text-xl font-bold text-center mb-6">개인회생채권자목록</h2>
                            <table className="w-full border-collapse border border-black text-sm">
                                <thead>
                                    <tr className="bg-gray-100">
                                        <th className="border border-black p-2">채권번호</th>
                                        <th className="border border-black p-2">채권자</th>
                                        <th className="border border-black p-2">담보/무담보</th>
                                        <th className="border border-black p-2">채권현재액<br />(원금)</th>
                                        <th className="border border-black p-2">채권현재액<br />(이자)</th>
                                        <th className="border border-black p-2">주소</th>
                                        <th className="border border-black p-2">전화/팩스</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {store.creditors.map((item: any, idx: number) => (
                                        <tr key={item.id}>
                                            <td className="border border-black p-2 text-center">{idx + 1}</td>
                                            <td className="border border-black p-2">{item.name}</td>
                                            <td className="border border-black p-2 text-center">
                                                {item.isSecured ? '담보' : '무담보'}
                                            </td>
                                            <td className="border border-black p-2 text-right">{item.principal.toLocaleString()}</td>
                                            <td className="border border-black p-2 text-right">{item.interest.toLocaleString()}</td>
                                            <td className="border border-black p-2 text-xs">{item.address || '-'}</td>
                                            <td className="border border-black p-2 text-xs">{item.phone || '-'}</td>
                                        </tr>
                                    ))}
                                    <tr className="bg-gray-50 font-bold">
                                        <td colSpan={3} className="border border-black p-2 text-center">합계</td>
                                        <td className="border border-black p-2 text-right">
                                            {store.creditors.reduce((sum: number, i: any) => sum + i.principal, 0).toLocaleString()}
                                        </td>
                                        <td className="border border-black p-2 text-right">
                                            {store.creditors.reduce((sum: number, i: any) => sum + i.interest, 0).toLocaleString()}
                                        </td>
                                        <td colSpan={2} className="border border-black p-2"></td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        {/* 2. 재산 목록 */}
                        <div className="mb-12 break-after-page">
                            <h2 className="text-xl font-bold text-center mb-6">재산목록</h2>
                            <table className="w-full border-collapse border border-black text-sm mb-4">
                                <thead>
                                    <tr className="bg-gray-100">
                                        <th className="border border-black p-2 w-32">종류</th>
                                        <th className="border border-black p-2">상세 내역</th>
                                        <th className="border border-black p-2 w-32">가액 (시가)</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {/* 현금 */}
                                    {store.properties.filter((p: any) => p.type === 'cash').map((item: any) => (
                                        <tr key={item.id}>
                                            <td className="border border-black p-2 text-center">현금</td>
                                            <td className="border border-black p-2">{item.description}</td>
                                            <td className="border border-black p-2 text-right">{item.value.toLocaleString()}</td>
                                        </tr>
                                    ))}

                                    {/* 예금 */}
                                    {store.properties.filter((p: any) => p.type === 'deposit').map((item: any) => (
                                        <tr key={item.id}>
                                            <td className="border border-black p-2 text-center">예금</td>
                                            <td className="border border-black p-2">{item.description}</td>
                                            <td className="border border-black p-2 text-right">{item.value.toLocaleString()}</td>
                                        </tr>
                                    ))}

                                    {/* 보험 */}
                                    {store.properties.filter((p: any) => p.type === 'insurance').map((item: any) => (
                                        <tr key={item.id}>
                                            <td className="border border-black p-2 text-center">보험</td>
                                            <td className="border border-black p-2">{item.description}</td>
                                            <td className="border border-black p-2 text-right">{item.value.toLocaleString()}</td>
                                        </tr>
                                    ))}

                                    {/* 임차보증금 */}
                                    {store.properties.filter((p: any) => p.type === 'deposit_rent').map((item: any) => (
                                        <tr key={item.id}>
                                            <td className="border border-black p-2 text-center">임차보증금</td>
                                            <td className="border border-black p-2">{item.description}</td>
                                            <td className="border border-black p-2 text-right">{item.value.toLocaleString()}</td>
                                        </tr>
                                    ))}

                                    {/* 부동산 */}
                                    {store.properties.filter((p: any) => p.type === 'realEstate').map((item: any) => (
                                        <tr key={item.id}>
                                            <td className="border border-black p-2 text-center">부동산</td>
                                            <td className="border border-black p-2">{item.description}</td>
                                            <td className="border border-black p-2 text-right">{item.value.toLocaleString()}</td>
                                        </tr>
                                    ))}

                                    {/* 사업용 설비/재고품/비품 등 */}
                                    {store.properties.filter((p: any) => p.type === 'business').map((item: any) => (
                                        <tr key={item.id}>
                                            <td className="border border-black p-2 text-center">사업용설비재고비품등</td>
                                            <td className="border border-black p-2">{item.description}</td>
                                            <td className="border border-black p-2 text-right">{item.value.toLocaleString()}</td>
                                        </tr>
                                    ))}

                                    {/* 예상 퇴직금 */}
                                    {store.properties.filter((p: any) => p.type === 'severance').map((item: any) => (
                                        <tr key={item.id}>
                                            <td className="border border-black p-2 text-center">예상퇴직금</td>
                                            <td className="border border-black p-2">{item.description}</td>
                                            <td className="border border-black p-2 text-right">{item.value.toLocaleString()}</td>
                                        </tr>
                                    ))}

                                    {/* 기타 */}
                                    {store.properties.filter((p: any) => ['vehicle', 'other'].includes(p.type)).map((item: any) => (
                                        <tr key={item.id}>
                                            <td className="border border-black p-2 text-center">
                                                {item.type === 'vehicle' ? '자동차' : '기타'}
                                            </td>
                                            <td className="border border-black p-2">{item.description}</td>
                                            <td className="border border-black p-2 text-right">{item.value.toLocaleString()}</td>
                                        </tr>
                                    ))}

                                    <tr className="bg-gray-50 font-bold">
                                        <td className="border border-black p-2 text-center">합계</td>
                                        <td className="border border-black p-2"></td>
                                        <td className="border border-black p-2 text-right">
                                            {store.properties.reduce((sum: number, i: any) => sum + i.value, 0).toLocaleString()}
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                            <div className="text-right text-sm space-y-1">
                                <p><strong>면제재산결정신청금액:</strong> {store.exemptionAmount.toLocaleString()}원</p>
                                <p><strong>청산가치:</strong> {Math.max(0, store.properties.reduce((sum: number, i: any) => sum + i.value, 0) - store.exemptionAmount - store.properties.reduce((sum: number, i: any) => sum + (i.securedAmount || 0), 0)).toLocaleString()}원</p>
                            </div>
                        </div>

                        {/* 4. 수입 및 지출에 관한 목록 */}
                        <div className="mb-12 break-after-page">
                            <h2 className="text-xl font-bold text-center mb-6">수입 및 지출에 관한 목록</h2>
                            <table className="w-full border-collapse border border-black text-sm mb-6">
                                <tbody>
                                    <tr>
                                        <td className="border border-black p-2 bg-gray-50 w-32 font-bold">직업</td>
                                        <td className="border border-black p-2">
                                            {store.incomeType === 'salary' ? '급여소득자' : '영업소득자'}
                                            ({store.employerName})
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className="border border-black p-2 bg-gray-50 font-bold">월 평균 수입</td>
                                        <td className="border border-black p-2">{store.monthlyIncome.toLocaleString()}원</td>
                                    </tr>
                                    <tr>
                                        <td className="border border-black p-2 bg-gray-50 font-bold">부양가족</td>
                                        <td className="border border-black p-2">
                                            {store.dependents.length}명
                                            ({store.dependents.map((d: any) => d.relationship).join(', ')})
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className="border border-black p-2 bg-gray-50 font-bold">월 생계비</td>
                                        <td className="border border-black p-2">
                                            {(store.monthlyLivingCost + store.additionalLivingCost).toLocaleString()}원
                                            {store.additionalLivingCost > 0 && ` (추가생계비 ${store.additionalLivingCost.toLocaleString()}원 포함)`}
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        {/* 5. 진술서 */}
                        <div className="mb-12 break-after-page">
                            <h2 className="text-xl font-bold text-center mb-6">진술서</h2>
                            <div className="space-y-6 text-sm">
                                <div className="border border-black p-4">
                                    <h3 className="font-bold mb-2 border-b border-black pb-1">1. 최종 학력</h3>
                                    <p>{store.education}</p>
                                </div>
                                <div className="border border-black p-4">
                                    <h3 className="font-bold mb-2 border-b border-black pb-1">2. 경력 사항</h3>
                                    {store.careers.map((c: any, idx: number) => (
                                        <p key={c.id} className="mb-1">
                                            - {c.period} / {c.company} / {c.position}
                                        </p>
                                    ))}
                                </div>
                                <div className="border border-black p-4">
                                    <h3 className="font-bold mb-2 border-b border-black pb-1">3. 주거 상황</h3>
                                    <p>
                                        {store.housingType === 'owned' && '자가'}
                                        {store.housingType === 'rent' && '임차'}
                                        {store.housingType === 'relative' && '무상거주'}
                                        {store.housingType === 'other' && '기타'}
                                        {' '}({store.housingDetail})
                                    </p>
                                </div>
                                <div className="border border-black p-4">
                                    <h3 className="font-bold mb-2 border-b border-black pb-1">4. 채무 증대 경위</h3>
                                    <p className="mb-2"><strong>주요 원인:</strong> {store.debtCauses?.join(', ')}</p>
                                    <p className="whitespace-pre-wrap">{store.debtCauseDetail}</p>
                                </div>
                                <div className="border border-black p-4">
                                    <h3 className="font-bold mb-2 border-b border-black pb-1">5. 과거 면책 이력</h3>
                                    <p>{store.pastInsolvency || '해당 사항 없음'}</p>
                                </div>
                            </div>
                        </div>

                        {/* 6. 변제계획안 */}
                        <div className="mb-12">
                            <h2 className="text-xl font-bold text-center mb-6">변제계획안</h2>
                            <table className="w-full border-collapse border border-black text-sm mb-6">
                                <tbody>
                                    <tr>
                                        <td className="border border-black p-2 bg-gray-50 w-32">1. 변제기간</td>
                                        <td className="border border-black p-2">{store.repaymentPeriod}개월</td>
                                    </tr>
                                    <tr>
                                        <td className="border border-black p-2 bg-gray-50">2. 월 평균 수입</td>
                                        <td className="border border-black p-2">{store.monthlyIncome.toLocaleString()}원</td>
                                    </tr>
                                    <tr>
                                        <td className="border border-black p-2 bg-gray-50">3. 생계비</td>
                                        <td className="border border-black p-2">
                                            {(store.monthlyLivingCost + store.additionalLivingCost).toLocaleString()}원
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className="border border-black p-2 bg-gray-50 font-bold">4. 월 변제액</td>
                                        <td className="border border-black p-2 font-bold text-blue-600">
                                            {store.monthlyPayment.toLocaleString()}원
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className="border border-black p-2 bg-gray-50">5. 총 변제액</td>
                                        <td className="border border-black p-2">
                                            {(store.monthlyPayment * store.repaymentPeriod).toLocaleString()}원
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                            <p className="text-sm text-gray-500 text-center">
                                * 이 문서는 자동 생성된 초안입니다. 법원 제출 전 전문가의 검토를 권장합니다.
                            </p>
                        </div>

                    </div>
                </CardContent>
            </Card>

            <div className="flex justify-start print:hidden">
                <Button type="button" variant="outline" onClick={onPrev}>이전 단계</Button>
            </div>
        </div>
    );
}
