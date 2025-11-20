/**
 * 개인회생 변제계획서 계산 로직
 */

import {
    getMinimumLivingCost,
    INSURANCE_RATES,
    TAX_RATES,
    TRUSTEE_FEE_RATE,
    calculateMinimumRepayment,
} from './legal-constants';

/**
 * 소득 공제 항목 인터페이스
 */
export interface IncomeDeductions {
    incomeTax: number;           // 소득세
    localIncomeTax: number;      // 지방소득세
    nationalPension: number;     // 국민연금
    healthInsurance: number;     // 건강보험
    longTermCare: number;        // 장기요양보험
    employmentInsurance: number; // 고용보험
    livingCost: number;          // 생계비
    businessExpense?: number;    // 영업비용 (사업소득자만)
}

/**
 * 채권자 정보 인터페이스
 */
export interface Creditor {
    id: string;
    name: string;              // 채권자명
    principal: number;         // 원금
    cause: string;             // 발생원인
    isSecured: boolean;        // 담보부 여부
}

/**
 * 변제 정보 인터페이스
 */
export interface RepaymentInfo {
    monthlyAmount: number;     // 월 변제액
    totalAmount: number;       // 총 변제액
    repaymentRate: number;     // 변제율 (%)
}

/**
 * 4대보험료 계산
 */
export function calculateInsurance(monthlyIncome: number): {
    nationalPension: number;
    healthInsurance: number;
    longTermCare: number;
    employmentInsurance: number;
    total: number;
} {
    const nationalPension = Math.round(monthlyIncome * INSURANCE_RATES.NATIONAL_PENSION);
    const healthInsurance = Math.round(monthlyIncome * INSURANCE_RATES.HEALTH_INSURANCE);
    const longTermCare = Math.round(healthInsurance * INSURANCE_RATES.LONG_TERM_CARE);
    const employmentInsurance = Math.round(monthlyIncome * INSURANCE_RATES.EMPLOYMENT_INSURANCE);

    return {
        nationalPension,
        healthInsurance,
        longTermCare,
        employmentInsurance,
        total: nationalPension + healthInsurance + longTermCare + employmentInsurance,
    };
}

/**
 * 세금 계산 (간이세액표 기준 근사치)
 */
export function calculateTax(monthlyIncome: number): {
    incomeTax: number;
    localIncomeTax: number;
    total: number;
} {
    const incomeTax = Math.round(monthlyIncome * TAX_RATES.INCOME_TAX_RATE);
    const localIncomeTax = Math.round(monthlyIncome * TAX_RATES.LOCAL_INCOME_TAX_RATE);

    return {
        incomeTax,
        localIncomeTax,
        total: incomeTax + localIncomeTax,
    };
}

/**
 * 가용소득 계산
 */
export function calculateDisposableIncome(
    monthlyIncome: number,
    dependents: number,
    businessExpense: number = 0
): {
    deductions: IncomeDeductions;
    disposableIncome: number;
} {
    const tax = calculateTax(monthlyIncome);
    const insurance = calculateInsurance(monthlyIncome);
    const livingCost = getMinimumLivingCost(dependents);

    const deductions: IncomeDeductions = {
        incomeTax: tax.incomeTax,
        localIncomeTax: tax.localIncomeTax,
        nationalPension: insurance.nationalPension,
        healthInsurance: insurance.healthInsurance,
        longTermCare: insurance.longTermCare,
        employmentInsurance: insurance.employmentInsurance,
        livingCost,
        businessExpense: businessExpense > 0 ? businessExpense : undefined,
    };

    const totalDeductions =
        tax.total +
        insurance.total +
        livingCost +
        businessExpense;

    const disposableIncome = Math.max(0, monthlyIncome - totalDeductions);

    return {
        deductions,
        disposableIncome,
    };
}

/**
 * 총 가용소득 계산 (변제기간 전체)
 */
export function calculateTotalDisposableIncome(
    monthlyDisposableIncome: number,
    repaymentPeriodMonths: number
): {
    totalBeforeFee: number;
    trusteeFee: number;
    totalAfterFee: number;
} {
    const totalBeforeFee = monthlyDisposableIncome * repaymentPeriodMonths;
    const trusteeFee = Math.round(totalBeforeFee * TRUSTEE_FEE_RATE);
    const totalAfterFee = totalBeforeFee - trusteeFee;

    return {
        totalBeforeFee,
        trusteeFee,
        totalAfterFee,
    };
}

/**
 * 채권자별 변제예정액 계산 (안분)
 */
export function calculateCreditorRepayments(
    creditors: Creditor[],
    totalAvailableAmount: number,
    repaymentPeriodMonths: number
): Map<string, RepaymentInfo> {
    const totalPrincipal = creditors.reduce((sum, c) => sum + c.principal, 0);

    if (totalPrincipal === 0) {
        return new Map();
    }

    const repaymentMap = new Map<string, RepaymentInfo>();

    creditors.forEach((creditor) => {
        // 안분 비율
        const ratio = creditor.principal / totalPrincipal;

        // 총 변제예정액
        const totalAmount = Math.round(totalAvailableAmount * ratio);

        // 월 변제액
        const monthlyAmount = Math.round(totalAmount / repaymentPeriodMonths);

        // 변제율
        const repaymentRate = (totalAmount / creditor.principal) * 100;

        repaymentMap.set(creditor.id, {
            monthlyAmount,
            totalAmount,
            repaymentRate: Math.round(repaymentRate * 100) / 100, // 소수점 2자리
        });
    });

    return repaymentMap;
}

/**
 * 청산가치보장 원칙 충족 여부 확인
 */
export function checkLiquidationValue(
    totalRepaymentAmount: number,
    liquidationValue: number
): {
    isSatisfied: boolean;
    shortage: number;
} {
    const isSatisfied = totalRepaymentAmount >= liquidationValue;
    const shortage = isSatisfied ? 0 : liquidationValue - totalRepaymentAmount;

    return {
        isSatisfied,
        shortage,
    };
}

/**
 * 변제계획 요약 정보
 */
export interface RepaymentPlanSummary {
    monthlyDisposableIncome: number;
    totalDisposableIncomeBeforeFee: number;
    trusteeFee: number;
    totalAvailableForRepayment: number;
    totalDebt: number;
    averageRepaymentRate: number;
    liquidationValueSatisfied: boolean;
    liquidationValueShortage: number;
    minimumRepaymentRequired: number;
    meetsMinimumRepayment: boolean;
}

/**
 * 전체 변제계획 요약 계산
 */
export function calculateRepaymentPlanSummary(
    monthlyIncome: number,
    dependents: number,
    businessExpense: number,
    creditors: Creditor[],
    repaymentPeriodMonths: number,
    liquidationValue: number
): RepaymentPlanSummary {
    // 1. 가용소득 계산
    const { disposableIncome } = calculateDisposableIncome(
        monthlyIncome,
        dependents,
        businessExpense
    );

    // 2. 총 가용소득 계산
    const {
        totalBeforeFee,
        trusteeFee,
        totalAfterFee,
    } = calculateTotalDisposableIncome(disposableIncome, repaymentPeriodMonths);

    // 3. 총 채무액
    const totalDebt = creditors.reduce((sum, c) => sum + c.principal, 0);

    // 4. 평균 변제율
    const averageRepaymentRate = totalDebt > 0
        ? Math.round((totalAfterFee / totalDebt) * 10000) / 100
        : 0;

    // 5. 청산가치보장
    const { isSatisfied, shortage } = checkLiquidationValue(
        totalAfterFee,
        liquidationValue
    );

    // 6. 최소변제액
    const minimumRepaymentRequired = calculateMinimumRepayment(totalDebt);
    const meetsMinimumRepayment = totalAfterFee >= minimumRepaymentRequired;

    return {
        monthlyDisposableIncome: disposableIncome,
        totalDisposableIncomeBeforeFee: totalBeforeFee,
        trusteeFee,
        totalAvailableForRepayment: totalAfterFee,
        totalDebt,
        averageRepaymentRate,
        liquidationValueSatisfied: isSatisfied,
        liquidationValueShortage: shortage,
        minimumRepaymentRequired,
        meetsMinimumRepayment,
    };
}
