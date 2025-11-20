export function Footer() {
    return (
        <footer className="border-t bg-slate-50">
            <div className="container mx-auto px-4 py-8 md:py-12">
                <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
                    <div className="space-y-3">
                        <h3 className="text-lg font-bold text-slate-900">김앤현 법률사무소</h3>
                        <p className="text-sm text-slate-500 leading-relaxed">
                            의뢰인의 새 출발을 위해 최선을 다하겠습니다.
                        </p>
                    </div>

                    <div className="space-y-3">
                        <h4 className="font-semibold text-slate-900">연락처</h4>
                        <ul className="space-y-2 text-sm text-slate-600">
                            <li>담당변호사: 김현정</li>
                            <li>전화: 010-5534-6843</li>
                            <li>주소: 서울 서초구 법원로 16 정곡빌딩 동관 502호</li>
                        </ul>
                    </div>

                    <div className="space-y-3">
                        <h4 className="font-semibold text-slate-900">서비스 안내</h4>
                        <ul className="space-y-2 text-sm text-slate-600">
                            <li>개인회생 자가 진단</li>
                            <li>신청서 자동 작성</li>
                        </ul>
                    </div>
                </div>

                <div className="mt-8 border-t pt-8 text-center text-xs text-slate-400">
                    <p>&copy; {new Date().getFullYear()} 김앤현 법률사무소. All rights reserved.</p>
                    <p className="mt-2">
                        본 사이트에서 제공하는 정보는 일반적인 법률 정보이며, 구체적인 사안에 대한 법률적 자문이 아닙니다.
                    </p>
                </div>
            </div>
        </footer>
    );
}
