/**
 * PDF 변제계획서 생성 로직
 * jsPDF 및 jsPDF-autoTable 사용
 */

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { BasicInfo, IncomeInfo, PlanSettings } from './repayment-store';
import {
    Creditor,
    calculateDisposableIncome,
    calculateCreditorRepayments,
    calculateRepaymentPlanSummary,
} from './repayment-calculations';
import { LEGAL_ARTICLES } from './legal-constants';

export function generateRepaymentPlanPDF(
    basicInfo: BasicInfo,
    incomeInfo: IncomeInfo,
    creditors: Creditor[],
    planSettings: PlanSettings
): void {
    const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
    });

    let yPos = 20;

    // === 표지 ===
    doc.setFontSize(20);
    doc.text('Personal Rehabilitation Repayment Plan', 105, yPos, { align: 'center' });
    doc.setFontSize(18);
    yPos += 10;
    doc.text('Gaein Hoesaeng Byeonje Gyehoekseo', 105, yPos, { align: 'center' });

    yPos += 20;
    doc.setFontSize(12);
    doc.text(`Debtor: ${basicInfo.name}`, 20, yPos);
    yPos += 7;
    doc.text(`Date: ${new Date().toLocaleDateString('ko-KR')}`, 20, yPos);

    // === 페이지 구분 ===
    doc.addPage();
    yPos = 20;

    // === I. 채무자 현황 ===
    doc.setFontSize(14);
    doc.text('I. Debtor Information / Chaeumuja Hyeonhwang', 20, yPos);
    yPos += 10;

    doc.setFontSize(10);
    const basicInfoData = [
        ['Name / Seongmyeong', basicInfo.name],
        ['Resident Number / Jumin Deungnok Beonho', basicInfo.residentNumber],
        ['Address / Juso', basicInfo.address],
        ['Occupation / Jigeop', basicInfo.occupation],
        ['Court / Sincheongeob-won', basicInfo.court || 'N/A'],
        ['Case Number / Sageon Beonho', basicInfo.caseNumber || 'N/A'],
    ];

    autoTable(doc, {
        startY: yPos,
        head: [['Item', 'Information']],
        body: basicInfoData,
        theme: 'grid',
        headStyles: { fillColor: [66, 139, 202] },
    });

    yPos = (doc as any).lastAutoTable.finalY + 10;

    // === II. 가용소득 산정 ===
    doc.setFontSize(14);
    doc.text('II. Disposable Income Calculation / Gayong Sodeuk Sanjeong', 20, yPos);
    yPos += 10;

    const { deductions, disposableIncome } = calculateDisposableIncome(
        incomeInfo.monthlyIncome,
        incomeInfo.dependents,
        incomeInfo.businessExpense
    );

    const incomeData = [
        ['Monthly Income / Wol Pyeong-gyun Suib', incomeInfo.monthlyIncome.toLocaleString() + ' won'],
        ['Income Tax / Sodeuk-se', '-' + deductions.incomeTax.toLocaleString() + ' won'],
        ['Local Income Tax / Jibang Sodeuk-se', '-' + deductions.localIncomeTax.toLocaleString() + ' won'],
        ['National Pension / Gungmin Yeon-geum', '-' + deductions.nationalPension.toLocaleString() + ' won'],
        ['Health Insurance / Geongang Bohyeom', '-' + deductions.healthInsurance.toLocaleString() + ' won'],
        ['Long-term Care / Janggi Yoyang', '-' + deductions.longTermCare.toLocaleString() + ' won'],
        ['Employment Insurance / Go-yong Bohyeom', '-' + deductions.employmentInsurance.toLocaleString() + ' won'],
        [
            `Living Cost / Saeng-gyebi (${incomeInfo.dependents + 1} persons)`,
            '-' + deductions.livingCost.toLocaleString() + ' won',
        ],
    ];

    if (deductions.businessExpense && deductions.businessExpense > 0) {
        incomeData.push(['Business Expense / Yeongeopbi-yong', '-' + deductions.businessExpense.toLocaleString() + ' won']);
    }

    incomeData.push([
        'Monthly Disposable Income / Wol Gayong Sodeuk',
        disposableIncome.toLocaleString() + ' won',
    ]);

    autoTable(doc, {
        startY: yPos,
        body: incomeData,
        theme: 'striped',
        headStyles: { fillColor: [66, 139, 202] },
    });

    yPos = (doc as any).lastAutoTable.finalY + 10;

    doc.setFontSize(8);
    doc.text(`Legal Basis: ${LEGAL_ARTICLES.DISPOSABLE_INCOME}`, 20, yPos);
    yPos += 5;

    // === III. 변제계획 ===
    doc.addPage();
    yPos = 20;

    doc.setFontSize(14);
    doc.text('III. Repayment Plan / Byeonje Gyehoek', 20, yPos);
    yPos += 10;

    const summary = calculateRepaymentPlanSummary(
        incomeInfo.monthlyIncome,
        incomeInfo.dependents,
        incomeInfo.businessExpense,
        creditors,
        planSettings.repaymentPeriodMonths,
        planSettings.liquidationValue
    );

    const planData = [
        ['Repayment Period / Byeonje Gigan', `${planSettings.repaymentPeriodMonths} months`],
        [
            'Total Disposable Income / Chong Gayong Sodeuk',
            summary.totalDisposableIncomeBeforeFee.toLocaleString() + ' won',
        ],
        ['Trustee Fee (10%) / Hoesaeng Wiwon Bosu', '-' + summary.trusteeFee.toLocaleString() + ' won'],
        [
            'Available for Repayment / Siljae Byeonje Ganeung-aek',
            summary.totalAvailableForRepayment.toLocaleString() + ' won',
        ],
        ['Total Debt / Chong Chaemuaek', summary.totalDebt.toLocaleString() + ' won'],
        ['Average Repayment Rate / Byeonje-yul', summary.averageRepaymentRate.toFixed(2) + '%'],
    ];

    autoTable(doc, {
        startY: yPos,
        body: planData,
        theme: 'grid',
        headStyles: { fillColor: [66, 139, 202] },
    });

    yPos = (doc as any).lastAutoTable.finalY + 10;

    doc.setFontSize(8);
    doc.text(`Legal Basis: ${LEGAL_ARTICLES.REPAYMENT_PERIOD}`, 20, yPos);
    yPos += 10;

    // === IV. 채권자 목록 및 변제예정액 ===
    doc.setFontSize(14);
    doc.text('IV. Creditor List & Repayment Schedule / Chaegwonja Mok-rok', 20, yPos);
    yPos += 10;

    const repayments = calculateCreditorRepayments(
        creditors,
        summary.totalAvailableForRepayment,
        planSettings.repaymentPeriodMonths
    );

    const creditorData = creditors.map((c) => {
        const repayment = repayments.get(c.id)!;
        return [
            c.name,
            c.principal.toLocaleString() + ' won',
            repayment.monthlyAmount.toLocaleString() + ' won',
            repayment.totalAmount.toLocaleString() + ' won',
            repayment.repaymentRate.toFixed(2) + '%',
            c.isSecured ? 'Secured' : 'Unsecured',
        ];
    });

    autoTable(doc, {
        startY: yPos,
        head: [
            [
                'Creditor / Chaegwonja',
                'Principal / Wongeum',
                'Monthly / Wol Byeonje',
                'Total / Chong Byeonje',
                'Rate / Byeonje-yul',
                'Type / Yuhyeong',
            ],
        ],
        body: creditorData,
        theme: 'striped',
        headStyles: { fillColor: [66, 139, 202], fontSize: 8 },
        bodyStyles: { fontSize: 8 },
    });

    yPos = (doc as any).lastAutoTable.finalY + 10;

    // === V. 청산가치보장 확인 ===
    doc.addPage();
    yPos = 20;

    doc.setFontSize(14);
    doc.text('V. Liquidation Value Guarantee / Cheongsangaji Bojang', 20, yPos);
    yPos += 10;

    const liquidationData = [
        ['Liquidation Value / Cheongsangaji', planSettings.liquidationValue.toLocaleString() + ' won'],
        ['Total Repayment Amount / Chong Byeonje-aek', summary.totalAvailableForRepayment.toLocaleString() + ' won'],
        [
            'Status / Sang-tae',
            summary.liquidationValueSatisfied ? 'Satisfied / Chungjo' : 'Not Satisfied / Michungjo',
        ],
    ];

    if (!summary.liquidationValueSatisfied) {
        liquidationData.push([
            'Shortage / Bujok-aek',
            summary.liquidationValueShortage.toLocaleString() + ' won',
        ]);
    }

    autoTable(doc, {
        startY: yPos,
        body: liquidationData,
        theme: 'grid',
        headStyles: { fillColor: [66, 139, 202] },
    });

    yPos = (doc as any).lastAutoTable.finalY + 10;

    doc.setFontSize(8);
    doc.text(`Legal Basis: ${LEGAL_ARTICLES.LIQUIDATION_VALUE}`, 20, yPos);
    yPos += 10;

    // === VI. 유의사항 ===
    doc.setFontSize(12);
    doc.text('VI. Important Notes / Yui-sahang', 20, yPos);
    yPos += 8;

    doc.setFontSize(9);
    doc.text('1. Must perform repayment obligations / Byeonje iheng uimu', 20, yPos);
    yPos += 6;
    doc.text(`2. Report income changes (${LEGAL_ARTICLES.INCOME_CHANGE_REPORT})`, 20, yPos);
    yPos += 6;
    doc.text(`3. Potential termination if 3+ months delayed (${LEGAL_ARTICLES.TERMINATION})`, 20, yPos);
    yPos += 6;
    doc.text(`4. Non-dischargeable debts (${LEGAL_ARTICLES.DISCHARGE_EXCEPTION})`, 20, yPos);
    yPos += 6;
    doc.text('   - Taxes, public charges', 25, yPos);
    yPos += 5;
    doc.text('   - Worker wages, retirement pay', 25, yPos);
    yPos += 5;
    doc.text('   - Intentional tort damages', 25, yPos);
    yPos += 5;
    doc.text('   - Alimony', 25, yPos);
    yPos += 5;
    doc.text('   - Fines, criminal costs', 25, yPos);

    // === 페이지 번호 추가 ===
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.text(`Page ${i} of ${pageCount}`, 105, 287, { align: 'center' });
    }

    // PDF 다운로드
    const filename = `Repayment_Plan_${basicInfo.name}_${new Date().toISOString().slice(0, 10)}.pdf`;
    doc.save(filename);
}
