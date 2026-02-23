export interface Attorney {
    name: string;
    title: string; // e.g. "대표변호사", "변호사"
    photo: string; // path to image in /public
    education: string[];
    career: string[];
    specialties: string[];
}

export const attorneys: Attorney[] = [
    {
        name: '김영훈',
        title: '대표변호사',
        photo: '/attorneys/attorney1.png',
        education: [
            '서울대학교 법과대학 졸업',
            '사법연수원 수료',
            '미국 시애틀 Washington University',
        ],
        career: [
            '전) 서울고등법원 판사',
            '전) 대법원 재판연구원',
            '전) 서울중앙지방법원 부장판사',
            '전) 행정심판위원회 위원',
            '전) 건설전담부 판사',
        ],
        specialties: [
            '부동산관련 행정/민사소송',
            '각종 재산분할 소송',
        ],
    },
    {
        name: '김현정',
        title: '변호사',
        photo: '/attorneys/attorney2.png',
        education: [
            '이화여자대학교 법학전문대학원 상사법',
            '이화여자대학교 경영전문대학원 사외이사 아카데미 수료',
            '변호사시험 4회',
        ],
        career: [
            '대한변호사협회인증 부동산전문 변호사',
            '대한변호사협회 신탁변호사회 / 채권추심변호사회',
            '서울지방변호사회 중대재해처벌법 대응TF자문위원',
            'ESG특별위원회 자문위원',
            '경기도 공사비분쟁 정비구역 파견전문가',
        ],
        specialties: [
            '부동산 관련 소송·분쟁·세금',
            '각종 재산분할 전문',
        ],
    },
];

export const officeInfo = {
    name: '김앤현 법률사무소',
    nameEn: 'K&H Law Office',
    address: '서울 서초구 법원로 16 정곡빌딩 동관 502호',
    phone: '02-3477-7600',
    mobile: '010-5534-6843',
    fax: '02-3477-7616',
    email: 'info@kimnhyun.com',
    description:
        '김앤현 법률사무소는 부동산, 건설분쟁, 상속·증여, 행정소송, 지식재산권 등 다양한 법률분야에서 의뢰인의 권리를 보호하고 있습니다.',
};
