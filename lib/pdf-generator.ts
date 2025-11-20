import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { MINIMUM_COST_OF_LIVING_2025 } from "./constants";

interface PdfData {
    name: string;
    residentNumber: string;
    address: string;
    phone: string;
    dependents: number;
    monthlyIncome: number;
    totalAssets: number;
    securedDebt: number;
    unsecuredDebt: number;
}

export function generateRehabilitationPDF(data: PdfData) {
    const doc = new jsPDF();

    // Page 1: Application for Commencement (개시신청서)
    doc.setFontSize(20);
    doc.text("Application for Individual Rehabilitation", 105, 20, { align: "center" });

    doc.setFontSize(12);
    doc.text(`Name: ${data.name}`, 20, 40);
    doc.text(`Resident ID: ${data.residentNumber}`, 20, 50);
    doc.text(`Address: ${data.address}`, 20, 60);
    doc.text(`Phone: ${data.phone}`, 20, 70);

    doc.text("I hereby apply for the commencement of individual rehabilitation proceedings.", 20, 100);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, 120);
    doc.text(`Applicant: ${data.name} (Signature)`, 120, 140);

    // Page 2: List of Creditors (채권자목록)
    doc.addPage();
    doc.setFontSize(18);
    doc.text("List of Creditors", 105, 20, { align: "center" });

    const creditorData = [
        ["Creditor Name", "Type", "Amount (KRW)"],
        ["Secured Creditors (Summary)", "Secured", data.securedDebt.toLocaleString()],
        ["Unsecured Creditors (Summary)", "Unsecured", data.unsecuredDebt.toLocaleString()],
        ["Total", "-", (data.securedDebt + data.unsecuredDebt).toLocaleString()],
    ];

    autoTable(doc, {
        startY: 40,
        head: [["Creditor Name", "Type", "Amount"]],
        body: creditorData.slice(1),
    });

    // Page 3: Property List (재산목록)
    doc.addPage();
    doc.setFontSize(18);
    doc.text("List of Property (Assets)", 105, 20, { align: "center" });
    doc.setFontSize(12);
    doc.text(`Total Liquidation Value: ${data.totalAssets.toLocaleString()} KRW`, 20, 40);
    doc.text("(Detailed asset list would be attached here)", 20, 50);

    // Page 4: Repayment Plan (변제계획안)
    doc.addPage();
    doc.setFontSize(18);
    doc.text("Repayment Plan", 105, 20, { align: "center" });

    // @ts-ignore
    const minCost = MINIMUM_COST_OF_LIVING_2025[data.dependents] || MINIMUM_COST_OF_LIVING_2025[1];
    const disposableIncome = Math.max(0, data.monthlyIncome - minCost);
    const period = 36;
    const totalRepayment = disposableIncome * period;

    doc.setFontSize(12);
    doc.text(`1. Monthly Disposable Income: ${disposableIncome.toLocaleString()} KRW`, 20, 50);
    doc.text(`   (Monthly Income ${data.monthlyIncome.toLocaleString()} - Living Cost ${minCost.toLocaleString()})`, 20, 60);
    doc.text(`2. Repayment Period: ${period} months`, 20, 80);
    doc.text(`3. Total Repayment Amount: ${totalRepayment.toLocaleString()} KRW`, 20, 100);

    const isGuaranteed = totalRepayment >= data.totalAssets;
    doc.setTextColor(isGuaranteed ? 0 : 255, isGuaranteed ? 128 : 0, 0);
    doc.text(
        isGuaranteed
            ? "Liquidation Value Guarantee: SATISFIED"
            : "Liquidation Value Guarantee: NOT SATISFIED (Increase payment or period)",
        20, 120
    );

    doc.save("rehabilitation_application_package.pdf");
}
