import { formatMoney, formatDateRO } from './helpers';

// Attempt to load jsPDF dynamically
async function getJsPDF() {
  const { jsPDF } = await import('jspdf');
  const { default: autoTable } = await import('jspdf-autotable');
  return { jsPDF, autoTable };
}

function pdfHeader(doc: any, title: string) {
  const pageW = doc.internal.pageSize.getWidth();
  
  // Background gradient strip
  doc.setFillColor(56, 189, 248);
  doc.rect(0, 0, pageW, 28, 'F');
  
  // Brand
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(255, 255, 255);
  doc.text('myAVVO', 10, 12);
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(220, 240, 255);
  doc.text('Hub Juridic Unic in Moldova', 10, 19);

  // Title right aligned
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(255, 255, 255);
  doc.text(title, pageW - 10, 12, { align: 'right' });
  
  // Date
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(220, 240, 255);
  const now = new Date();
  doc.text(`Generat: ${formatDateRO(now)}`, pageW - 10, 19, { align: 'right' });

  // Footer line
  doc.setDrawColor(56, 189, 248);
  doc.setLineWidth(0.5);
  doc.line(10, 32, pageW - 10, 32);
}

export async function exportDobandaPDF(params: {
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
  const { jsPDF } = await getJsPDF();
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  
  pdfHeader(doc, 'DOBANDA LEGALA');

  // Summary block
  let y = 38;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);
  doc.text('DOBANDA TOTALA:', 10, y);
  doc.setFontSize(14);
  doc.setTextColor(56, 189, 248);
  doc.text(`${formatMoney(params.total)} ${params.currency}`, 10, y + 7);

  const pageW = doc.internal.pageSize.getWidth();
  const summaryItems = [
    { label: 'Perioada', value: `${formatDateRO(params.startDate)} - ${formatDateRO(params.endDate)}` },
    { label: 'Sume scadente', value: `${formatMoney(params.totalDebts)} ${params.currency}` },
    { label: 'Plati efectuate', value: `${formatMoney(params.totalPayments)} ${params.currency}` },
    { label: 'Zile calcul', value: String(params.totalDays) },
    { label: 'Procent BNM +', value: `+${params.percent}%` },
  ];
  
  const colW = (pageW - 60) / summaryItems.length;
  summaryItems.forEach((item, i) => {
    const x = 60 + i * colW;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(100, 116, 139);
    doc.text(item.label, x, y);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(15, 23, 42);
    doc.text(item.value, x, y + 7);
  });

  y += 16;

  // Table
  const calcRows = params.rows
    .filter(w => w.b !== null && w.z > 0)
    .map(w => [
      w.z === 1 ? formatDateRO(w.a) : `${formatDateRO(w.a)} - ${formatDateRO(w.b)}`,
      String(w.z),
      formatMoney(w.s),
      `${w.r.toFixed(2)}%`,
      `${w.rt.toFixed(2)}%`,
      formatMoney(w.db),
      formatMoney(w.c),
    ]);

  calcRows.push(['TOTAL', String(params.totalDays), '', '', '', '', formatMoney(params.total)]);

  (doc as any).autoTable({
    startY: y,
    head: [['Perioada', 'Zile', 'Suma', 'BNM', 'Total%', 'Dobanda', 'Cumulat']],
    body: calcRows,
    styles: { fontSize: 7, cellPadding: 2 },
    headStyles: { fillColor: [56, 189, 248], textColor: 255, fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [240, 249, 255] },
    foot: [],
    margin: { left: 10, right: 10 },
  });

  doc.save(`Dobanda-Legala-${formatDateRO(new Date()).replace(/\./g, '-')}.pdf`);
}

export async function exportPenalitatePDF(params: {
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
  const { jsPDF } = await getJsPDF();
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  
  pdfHeader(doc, 'PENALITATE');
  
  let y = 38;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);
  doc.text('PENALITATE TOTALA:', 10, y);
  doc.setFontSize(14);
  doc.setTextColor(56, 189, 248);
  doc.text(`${formatMoney(params.total)} ${params.currency}`, 10, y + 7);

  if (params.limitNote) {
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(7);
    doc.setTextColor(217, 119, 6);
    doc.text(`⚠ ${params.limitNote}`, 10, y + 14);
    y += 6;
  }

  const pageW = doc.internal.pageSize.getWidth();
  const summaryItems = [
    { label: 'Perioada', value: `${formatDateRO(params.startDate)} - ${formatDateRO(params.endDate)}` },
    { label: 'Sume scadente', value: `${formatMoney(params.totalDebts)} ${params.currency}` },
    { label: 'Plati efectuate', value: `${formatMoney(params.totalPayments)} ${params.currency}` },
    { label: 'Zile calcul', value: String(params.totalDays) },
    { label: 'Procent/zi', value: `${params.percentDay}%` },
  ];
  const colW = (pageW - 60) / summaryItems.length;
  summaryItems.forEach((item, i) => {
    const x = 60 + i * colW;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(100, 116, 139);
    doc.text(item.label, x, y);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(15, 23, 42);
    doc.text(item.value, x, y + 7);
  });

  y += 16;

  const calcRows = params.rows
    .filter(w => w.z > 0)
    .map(w => [
      w.z === 1 ? formatDateRO(w.a) : `${formatDateRO(w.a)} - ${formatDateRO(w.b)}`,
      String(w.z),
      formatMoney(w.s),
      `${w.rt}%`,
      formatMoney(w.db),
      formatMoney(w.c),
    ]);

  calcRows.push(['TOTAL', String(params.totalDays), '', '', '', formatMoney(params.total)]);

  (doc as any).autoTable({
    startY: y,
    head: [['Perioada', 'Zile', 'Suma', '%/zi', 'Penalitate', 'Cumulat']],
    body: calcRows,
    styles: { fontSize: 7, cellPadding: 2 },
    headStyles: { fillColor: [56, 189, 248], textColor: 255, fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [240, 249, 255] },
    margin: { left: 10, right: 10 },
  });

  doc.save(`Penalitate-${formatDateRO(new Date()).replace(/\./g, '-')}.pdf`);
}

export async function exportTaxaPDF(params: {
  taxa: number;
  info: string;
  explanation: string;
}) {
  const { jsPDF } = await getJsPDF();
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  
  pdfHeader(doc, 'TAXA DE STAT');
  
  let y = 40;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);
  doc.text('TAXA DE STAT:', 10, y);
  doc.setFontSize(18);
  doc.setTextColor(56, 189, 248);
  doc.text(`${formatMoney(params.taxa)} MDL`, 10, y + 10);

  y += 22;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text(params.info, 10, y);

  y += 10;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(15, 23, 42);
  const lines = params.explanation.split('\n');
  lines.forEach(line => {
    doc.text(line, 10, y);
    y += 6;
  });

  doc.save(`Taxa-Stat-${formatDateRO(new Date()).replace(/\./g, '-')}.pdf`);
}
