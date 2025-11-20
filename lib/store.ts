import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

// --- Types for Complex Data Structures ---

export interface Creditor {
    id: string;
    name: string;
    address: string;
    phone: string;
    isSecured: boolean; // 담보 여부
    principal: number; // 원금
    interest: number; // 이자
    cause: string; // 채권 발생 원인 (예: 2023.1.1 대여금)
    collateral?: string; // 담보 내용 (담보채권인 경우)
}

export interface PropertyItem {
    id: string;
    type: 'cash' | 'deposit' | 'insurance' | 'vehicle' | 'realEstate' | 'deposit_rent' | 'business' | 'severance' | 'other';
    description: string; // 상세 내역 (은행명, 차량번호, 주소 등)
    value: number; // 시가/예상액
    securedAmount?: number; // 담보설정액 (부동산/차량 등)
}

export interface Dependent {
    id: string;
    name: string;
    age: number;
    relationship: string;
    cohabitation: boolean;
    hasDisability: boolean;
}

export interface CareerHistory {
    id: string;
    period: string;
    company: string;
    position: string;
    type: 'employment' | 'business';
}

// --- Main Store State ---

interface WizardState {
    // 1. Basic Info (개시신청서)
    applicantName: string;
    applicantRRN: string;
    applicantAddress: string; // 주민등록상 주소
    applicantCurrentAddress: string; // 현주소
    applicantPhone: string;
    applicantMobile: string;
    applicantEmail: string;

    courtName: string; // 관할법원

    agentName: string;
    agentAddress: string;
    agentPhone: string;
    agentFax: string;
    agentEmail: string;

    relatedCaseName: string; // 관련 사건 (배우자 등)
    relatedCaseNumber: string;

    refundBank: string; // 환급 계좌
    refundAccount: string;
    refundHolder: string;

    // 2. Income & Expenditure (수입 및 지출 목록)
    incomeType: 'salary' | 'business';
    employerName: string; // 직장명/상호
    employmentPeriod: string;
    monthlyIncome: number; // 월 평균 수입

    dependents: Dependent[];
    monthlyLivingCost: number; // 산정된 생계비
    additionalLivingCost: number; // 추가 생계비
    additionalLivingCostReason: string;

    // 3. Property List (재산 목록)
    properties: PropertyItem[];
    exemptionAmount: number; // 면제재산 신청액

    // 4. Creditor List (채권자 목록)
    creditors: Creditor[];

    // 5. Statement (진술서)
    education: string; // 최종학력
    careers: CareerHistory[];
    marriageHistory: string; // 결혼/이혼 경력

    housingType: 'owned' | 'rent' | 'relative' | 'other';
    housingDetail: string; // 임대료 등 상세

    debtCauses: string[]; // 채무 발생 사유 (체크박스)
    debtCauseDetail: string; // 구체적 사유 (서술형)

    pastInsolvency: string; // 과거 면책/회생 이력

    // 6. Repayment Plan (변제계획안)
    repaymentPeriod: number; // 변제 기간 (개월)
    monthlyPayment: number; // 월 변제 예정액

    // Actions
    setField: (field: keyof WizardState, value: any) => void;
    addArrayItem: (field: 'creditors' | 'properties' | 'dependents' | 'careers', item: any) => void;
    removeArrayItem: (field: 'creditors' | 'properties' | 'dependents' | 'careers', id: string) => void;
    updateArrayItem: (field: 'creditors' | 'properties' | 'dependents' | 'careers', id: string, updates: any) => void;
    resetForm: () => void;
}

export const useWizardStore = create<WizardState>()(
    persist(
        (set) => ({
            // Initial State
            applicantName: '',
            applicantRRN: '',
            applicantAddress: '',
            applicantCurrentAddress: '',
            applicantPhone: '',
            applicantMobile: '',
            applicantEmail: '',
            courtName: '서울회생법원',
            agentName: '',
            agentAddress: '',
            agentPhone: '',
            agentFax: '',
            agentEmail: '',
            relatedCaseName: '',
            relatedCaseNumber: '',
            refundBank: '',
            refundAccount: '',
            refundHolder: '',

            incomeType: 'salary',
            employerName: '',
            employmentPeriod: '',
            monthlyIncome: 0,

            dependents: [],
            monthlyLivingCost: 0,
            additionalLivingCost: 0,
            additionalLivingCostReason: '',

            properties: [],
            exemptionAmount: 0,

            creditors: [],

            education: '',
            careers: [],
            marriageHistory: '',
            housingType: 'rent',
            housingDetail: '',
            debtCauses: [],
            debtCauseDetail: '',
            pastInsolvency: '',

            repaymentPeriod: 36,
            monthlyPayment: 0,

            // Actions
            setField: (field, value) => set((state) => ({ ...state, [field]: value })),

            addArrayItem: (field, item) => set((state) => ({
                ...state,
                [field]: [...state[field], item]
            })),

            removeArrayItem: (field, id) => set((state) => ({
                ...state,
                [field]: state[field].filter((i: any) => i.id !== id)
            })),

            updateArrayItem: (field, id, updates) => set((state) => ({
                ...state,
                [field]: state[field].map((i: any) => i.id === id ? { ...i, ...updates } : i)
            })),

            resetForm: () => set({
                applicantName: '',
                applicantRRN: '',
                applicantAddress: '',
                applicantCurrentAddress: '',
                applicantPhone: '',
                applicantMobile: '',
                applicantEmail: '',
                courtName: '서울회생법원',
                agentName: '',
                agentAddress: '',
                agentPhone: '',
                agentFax: '',
                agentEmail: '',
                relatedCaseName: '',
                relatedCaseNumber: '',
                refundBank: '',
                refundAccount: '',
                refundHolder: '',
                incomeType: 'salary',
                employerName: '',
                employmentPeriod: '',
                monthlyIncome: 0,
                dependents: [],
                monthlyLivingCost: 0,
                additionalLivingCost: 0,
                additionalLivingCostReason: '',
                properties: [],
                exemptionAmount: 0,
                creditors: [],
                education: '',
                careers: [],
                marriageHistory: '',
                housingType: 'rent',
                housingDetail: '',
                debtCauses: [],
                debtCauseDetail: '',
                pastInsolvency: '',
                repaymentPeriod: 36,
                monthlyPayment: 0,
            }),
        }),
        {
            name: 'rehab-wizard-storage',
            storage: createJSONStorage(() => sessionStorage),
        }
    )
);
