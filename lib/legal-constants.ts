/**
 * 개인회생 관련 법률 상수 및 기준
 * 채무자 회생 및 파산에 관한 법률 기준
 */

// 2025년 기준 최저생계비 (1인 가구 기준)
export const MINIMUM_LIVING_COST_BASE = 1337067; // 원

// 추가 부양가족 1인당 생계비 증가분
export const ADDITIONAL_DEPENDENT_COST = 500000; // 원

// 채무 한도
export const DEBT_LIMITS = {
    SECURED: 1500000000, // 담보부채권 15억원
    UNSECURED: 1000000000, // 무담보채권 10억원
} as const;

// 변제기간 옵션 (개월)
export const REPAYMENT_PERIODS = {
    THREE_YEARS: 36,
    FIVE_YEARS: 60,
} as const;

// 최소변제액 계산 기준
export const MINIMUM_REPAYMENT = {
    THRESHOLD: 50000000, // 5천만원
    BELOW_THRESHOLD_RATE: 0.05, // 5%
    ABOVE_THRESHOLD_RATE: 0.03, // 3%
    ABOVE_THRESHOLD_FIXED: 1000000, // 100만원
} as const;

// 세율 (2025년 기준)
export const TAX_RATES = {
    // 근로소득세 간이세액표 (월 급여 기준, 1인 기준)
    // 실제로는 더 복잡하지만 간소화된 버전
    INCOME_TAX_RATE: 0.06, // 약 6% (평균)
    LOCAL_INCOME_TAX_RATE: 0.006, // 지방소득세 0.6%
} as const;

// 4대보험 요율 (2025년 기준)
export const INSURANCE_RATES = {
    NATIONAL_PENSION: 0.045, // 국민연금 4.5%
    HEALTH_INSURANCE: 0.03545, // 건강보험 3.545%
    LONG_TERM_CARE: 0.004591, // 장기요양보험 (건강보험의 12.95%)
    EMPLOYMENT_INSURANCE: 0.009, // 고용보험 0.9%
} as const;

// 회생위원 보수 (평균)
export const TRUSTEE_FEE_RATE = 0.1; // 총 변제액의 약 10%

// 법령 조문
export const LEGAL_ARTICLES = {
    ELIGIBILITY: "채무자 회생 및 파산에 관한 법률 제579조",
    DISPOSABLE_INCOME: "채무자 회생 및 파산에 관한 법률 제579조 제4호",
    REPAYMENT_PERIOD: "채무자 회생 및 파산에 관한 법률 제611조 제5항",
    LIQUIDATION_VALUE: "채무자 회생 및 파산에 관한 법률 제614조 제1항 제4호",
    INCOME_CHANGE_REPORT: "채무자 회생 및 파산에 관한 법률 제602조 제2항",
    TERMINATION: "채무자 회생 및 파산에 관한 법률 제621조 제1항 제1호",
    DISCHARGE_EXCEPTION: "채무자 회생 및 파산에 관한 법률 제625조 제2항",
} as const;

// 면책되지 않는 채권 종류
export const NON_DISCHARGEABLE_DEBTS = [
    "조세, 공과금",
    "근로자의 임금, 퇴직금, 재해보상금",
    "고의적 불법행위로 인한 손해배상",
    "부양료",
    "벌금, 과료, 추징금, 형사소송비용",
] as const;

// 생계비 테이블 (가구원 수별)
export function getMinimumLivingCost(dependents: number): number {
    // 본인(1명) + 부양가족 수
    const totalMembers = 1 + dependents;

    if (totalMembers === 1) return MINIMUM_LIVING_COST_BASE;

    // 간소화된 계산: 기본 + (추가인원 × 추가비용)
    return MINIMUM_LIVING_COST_BASE + (dependents * ADDITIONAL_DEPENDENT_COST);
}

/**
 * 최소변제액 계산
 * @param totalDebt 총 채무액
 */
export function calculateMinimumRepayment(totalDebt: number): number {
    if (totalDebt < MINIMUM_REPAYMENT.THRESHOLD) {
        return totalDebt * MINIMUM_REPAYMENT.BELOW_THRESHOLD_RATE;
    } else {
        return (totalDebt * MINIMUM_REPAYMENT.ABOVE_THRESHOLD_RATE) + MINIMUM_REPAYMENT.ABOVE_THRESHOLD_FIXED;
    }
}
