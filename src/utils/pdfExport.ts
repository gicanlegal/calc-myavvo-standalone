// pdfExport.ts — using applyPlugin approach for jspdf-autotable v5 + jspdf v4 compatibility
import { jsPDF } from 'jspdf';
import { applyPlugin } from 'jspdf-autotable';
import { formatMoney, formatDateRO } from './helpers';

// Apply plugin once at module load time
applyPlugin(jsPDF);

// After applyPlugin, doc.autoTable becomes available
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
    lastAutoTable: { finalY: number };
  }
}

function pdfHeader(doc: jsPDF, title: string) {
  const pageW = doc.internal.pageSize.getWidth();

  // Blue header strip
  doc.setFillColor(14, 165, 233);
  doc.rect(0, 0, pageW, 26, 'F');

  // Brand
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(255, 255, 255);
  doc.text('myAVVO', 10, 11);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(210, 235, 255);
  doc.text('Hub Juridic Unic in Moldova', 10, 18);

  // Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(255, 255, 255);
  doc.text(title, pageW - 10, 11, { align: 'right' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(210, 235, 255);
  doc.text('Generat: ' + formatDateRO(new Date()), pageW - 10, 18, { align: 'right' });
}

function summaryLine(doc: jsPDF, y: number, leftTitle: string, leftValue: string, items: {label: string; value: string}[]) {
  const pageW = doc.internal.pageSize.getWidth();

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text(leftTitle, 10, y);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(14, 165, 233);
  doc.text(leftValue, 10, y + 8);

  const colW = (pageW - 70) / Math.max(items.length, 1);
  items.forEach((item, i) => {
    const x = 70 + i * colW;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(100, 116, 139);
    doc.text(item.label, x, y);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(15, 23, 42);
    doc.text(item.value, x, y + 8);
  });

  return y + 18;
}

export function exportDobandaPDF(params: {
  rows: any[];
  total: number;
  totalDebts: number;
  totalPayments: number;
  totalDays: number;
  percent: number;
  startDate: Date;
  endDate: Date;
  currency: string;
}) {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  pdfHeader(doc, 'DOBANDA LEGALA');

  const y = summaryLine(doc, 32, 'DOBANDA TOTALA', formatMoney(params.total) + ' ' + params.currency, [
    { label: 'Perioada', value: formatDateRO(params.startDate) + ' - ' + formatDateRO(params.endDate) },
    { label: 'Sume scadente', value: formatMoney(params.totalDebts) + ' ' + params.currency },
    { label: 'Plati efectuate', value: formatMoney(params.totalPayments) + ' ' + params.currency },
    { label: 'Zile calcul', value: String(params.totalDays) },
    { label: 'Procent (art.874)', value: '+' + params.percent + '% BNM' },
  ]);

  const calcRows: string[][] = params.rows
    .filter((w: any) => w.b !== null && w.z > 0)
    .map((w: any) => [
      w.z === 1 ? formatDateRO(w.a) : formatDateRO(w.a) + ' - ' + formatDateRO(w.b),
      String(w.z),
      formatMoney(w.s),
      (typeof w.r === 'number' ? w.r.toFixed(2) : '0') + '%',
      (typeof w.rt === 'number' ? w.rt.toFixed(2) : '0') + '%',
      formatMoney(w.db),
      formatMoney(w.c),
    ]);
  calcRows.push(['TOTAL', String(params.totalDays), '', '', '', '', formatMoney(params.total)]);

  doc.autoTable({
    startY: y,
    head: [['Perioada', 'Zile', 'Suma', 'BNM%', 'Total%', 'Dobanda', 'Cumulat']],
    body: calcRows,
    styles: { fontSize: 7, cellPadding: 2 },
    headStyles: { fillColor: [14, 165, 233], textColor: 255, fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [240, 249, 255] },
    footStyles: { fillColor: [220, 240, 255], fontStyle: 'bold' },
    margin: { left: 10, right: 10 },
  });

  doc.save('Dobanda-Legala-' + formatDateRO(new Date()).replace(/\./g, '-') + '.pdf');
}

export function exportPenalitatePDF(params: {
  rows: any[];
  total: number;
  totalDebts: number;
  totalPayments: number;
  totalDays: number;
  percentDay: number;
  startDate: Date;
  endDate: Date;
  currency: string;
  limitNote?: string;
}) {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  pdfHeader(doc, 'PENALITATE');

  let y = summaryLine(doc, 32, 'PENALITATE TOTALA', formatMoney(params.total) + ' ' + params.currency, [
    { label: 'Perioada', value: formatDateRO(params.startDate) + ' - ' + formatDateRO(params.endDate) },
    { label: 'Sume scadente', value: formatMoney(params.totalDebts) + ' ' + params.currency },
    { label: 'Plati efectuate', value: formatMoney(params.totalPayments) + ' ' + params.currency },
    { label: 'Zile calcul', value: String(params.totalDays) },
    { label: 'Procent/zi', value: params.percentDay + '%' },
  ]);

  if (params.limitNote) {
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(7);
    doc.setTextColor(180, 80, 0);
    doc.text('! ' + params.limitNote, 10, y);
    y += 6;
  }

  const calcRows: string[][] = params.rows
    .filter((w: any) => w.z > 0)
    .map((w: any) => [
      w.z === 1 ? formatDateRO(w.a) : formatDateRO(w.a) + ' - ' + formatDateRO(w.b),
      String(w.z),
      formatMoney(w.s),
      w.rt + '%',
      formatMoney(w.db),
      formatMoney(w.c),
    ]);
  calcRows.push(['TOTAL', String(params.totalDays), '', '', '', formatMoney(params.total)]);

  doc.autoTable({
    startY: y,
    head: [['Perioada', 'Zile', 'Suma', '%/zi', 'Penalitate', 'Cumulat']],
    body: calcRows,
    styles: { fontSize: 7, cellPadding: 2 },
    headStyles: { fillColor: [14, 165, 233], textColor: 255, fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [240, 249, 255] },
    margin: { left: 10, right: 10 },
  });

  doc.save('Penalitate-' + formatDateRO(new Date()).replace(/\./g, '-') + '.pdf');
}

export function exportTaxaPDF(params: {
  taxa: number;
  info: string;
  explanation: string;
}) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  pdfHeader(doc, 'TAXA DE STAT');

  let y = summaryLine(doc, 32, 'TAXA DE STAT', formatMoney(params.taxa) + ' MDL', [
    { label: 'Baza legala', value: 'Legea nr.1216/1992' },
    { label: 'Mod calcul', value: params.info },
  ]);

  y += 5;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);
  doc.text('Detalii calcul:', 10, y);
  y += 7;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(50, 70, 90);
  params.explanation.split('\n').forEach(line => {
    doc.text(line, 10, y);
    y += 7;
  });

  doc.save('Taxa-Stat-' + formatDateRO(new Date()).replace(/\./g, '-') + '.pdf');
}
