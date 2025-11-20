export const siteConfig = {
    name: "개인회생 신청서 자동 생성",
    title: "개인회생 신청서 무료 자동 생성 | 온라인 작성 도우미",
    description: "개인회생 신청서를 온라인에서 무료로 자동 생성하세요. 법원 제출용 공식 양식에 맞춘 7단계 간편 작성. 변호사 검토 가능. 채권자목록, 재산목록, 수입지출목록, 진술서 자동 생성.",
    keywords: [
        "개인회생",
        "개인회생 신청서",
        "개인회생 신청서 작성",
        "개인회생 무료",
        "개인회생 자동 생성",
        "개인파산",
        "회생절차",
        "개인회생 온라인",
        "개인회생 양식",
        "개인회생 변호사",
        "채무조정",
        "신용회복",
        "파산신청",
        "법원 신청서"
    ],
    url: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
    ogImage: "/og-image.png",
    author: {
        name: "김남현 변호사",
        email: "info@kimnhyun.com"
    },
    lawyer: {
        name: "김남현",
        phone: "010-5534-6843",
        email: "info@kimnhyun.com"
    }
};

export type SiteConfig = typeof siteConfig;
