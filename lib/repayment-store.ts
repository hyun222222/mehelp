import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Creditor } from './repayment-calculations';

/**
 * 기본정보 인터페이스
 */
export interface BasicInfo {
    name: string;
    residentNumber: string;
    address: string;
    occupation: string;
    court: string;
    caseNumber: string;
}

/**
 * 소득정보 인터페이스
 */
export interface IncomeInfo {
    monthlyIncome: number;
    incomeType: 'salary' | 'business' | 'mixed';
    businessExpense: number;
    dependents: number;
}

/**
 * 변제계획 설정
 */
export interface PlanSettings {
    repaymentPeriodMonths: 36 | 60; // 3년 or 5년
    liquidationValue: number;
    earlyRepayment: number;
}

/**
 * 변제계획서 상태 인터페이스
 */
interface RepaymentPlanState {
    // 데이터
    basicInfo: BasicInfo;
    incomeInfo: IncomeInfo;
    creditors: Creditor[];
    planSettings: PlanSettings;

    // 액션
    setBasicInfo: (info: Partial<BasicInfo>) => void;
    setIncomeInfo: (info: Partial<IncomeInfo>) => void;
    addCreditor: (creditor: Creditor) => void;
    updateCreditor: (id: string, updates: Partial<Creditor>) => void;
    removeCreditor: (id: string) => void;
    setPlanSettings: (settings: Partial<PlanSettings>) => void;
    resetForm: () => void;
}

const initialBasicInfo: BasicInfo = {
    name: '',
    residentNumber: '',
    address: '',
    occupation: '',
    court: '',
    caseNumber: '',
};

const initialIncomeInfo: IncomeInfo = {
    monthlyIncome: 0,
    incomeType: 'salary',
    businessExpense: 0,
    dependents: 0,
};

const initialPlanSettings: PlanSettings = {
    repaymentPeriodMonths: 36,
    liquidationValue: 0,
    earlyRepayment: 0,
};

export const useRepaymentPlanStore = create<RepaymentPlanState>()(
    persist(
        (set) => ({
            basicInfo: initialBasicInfo,
            incomeInfo: initialIncomeInfo,
            creditors: [],
            planSettings: initialPlanSettings,

            setBasicInfo: (info) =>
                set((state) => ({
                    basicInfo: { ...state.basicInfo, ...info },
                })),

            setIncomeInfo: (info) =>
                set((state) => ({
                    incomeInfo: { ...state.incomeInfo, ...info },
                })),

            addCreditor: (creditor) =>
                set((state) => ({
                    creditors: [...state.creditors, creditor],
                })),

            updateCreditor: (id, updates) =>
                set((state) => ({
                    creditors: state.creditors.map((c) =>
                        c.id === id ? { ...c, ...updates } : c
                    ),
                })),

            removeCreditor: (id) =>
                set((state) => ({
                    creditors: state.creditors.filter((c) => c.id !== id),
                })),

            setPlanSettings: (settings) =>
                set((state) => ({
                    planSettings: { ...state.planSettings, ...settings },
                })),

            resetForm: () =>
                set({
                    basicInfo: initialBasicInfo,
                    incomeInfo: initialIncomeInfo,
                    creditors: [],
                    planSettings: initialPlanSettings,
                }),
        }),
        {
            name: 'repayment-plan-storage',
            storage: createJSONStorage(() => sessionStorage),
        }
    )
);
