import { LEGAL_LIMITS, MINIMUM_COST_OF_LIVING_2025 } from "./constants";

export function calculateDisposableIncome(monthlyIncome: number, dependents: number): number {
    // 부양가족 수에 따른 최저생계비 조회 (기본값 1인)
    // @ts-ignore
    const minimumCost = MINIMUM_COST_OF_LIVING_2025[dependents] || MINIMUM_COST_OF_LIVING_2025[1];

    // 가용소득 = 월 소득 - 최저생계비
    const disposableIncome = monthlyIncome - minimumCost;
    return disposableIncome > 0 ? disposableIncome : 0;
}

export function checkEligibility(securedDebt: number, unsecuredDebt: number): { eligible: boolean; reason?: string } {
    if (securedDebt > LEGAL_LIMITS.SECURED_DEBT_LIMIT) {
        return { eligible: false, reason: "담보부 채무가 10억 원을 초과합니다." };
    }
    if (unsecuredDebt > LEGAL_LIMITS.UNSECURED_DEBT_LIMIT) {
        return { eligible: false, reason: "무담보 채무가 5억 원을 초과합니다." };
    }
    if (securedDebt + unsecuredDebt > LEGAL_LIMITS.TOTAL_DEBT_LIMIT) {
        return { eligible: false, reason: "총 채무액이 15억 원을 초과합니다." };
    }
    return { eligible: true };
}
