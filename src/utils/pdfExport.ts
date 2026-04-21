// pdfExport.ts — Professional PDF generation for Legal Calculator
import { jsPDF } from 'jspdf';
import { applyPlugin } from 'jspdf-autotable';
import { formatMoney, formatDateRO } from './helpers';
import { ROBOTO_REGULAR, ROBOTO_BOLD } from './fonts';

// Apply plugin once at module load time
applyPlugin(jsPDF);

// After applyPlugin, doc.autoTable becomes available
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
    lastAutoTable: { finalY: number };
  }
}

// Design Palette
const PALETTE = {
  navy: [26, 54, 93] as [number, number, number],
  teal: [17, 165, 234] as [number, number, number],
  gray: [113, 128, 150] as [number, number, number],
  darkGray: [45, 55, 72] as [number, number, number],
  bgLight: [247, 250, 252] as [number, number, number],
  bgBorder: [226, 232, 240] as [number, number, number],
  boxBg: [235, 248, 255] as [number, number, number],
};

/**
 * Utility to sanitize text (now preserved for custom font compatibility)
 */
function sanitize(s: string): string {
  if (!s) return '';
  return s;
}

/**
 * Common PDF initialization with custom fonts
 */
function createDoc() {
  const doc = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });
  doc.addFileToVFS('Roboto-Regular.ttf', ROBOTO_REGULAR);
  doc.addFileToVFS('Roboto-Bold.ttf', ROBOTO_BOLD);
  doc.addFont('Roboto-Regular.ttf', 'Roboto', 'normal');
  doc.addFont('Roboto-Bold.ttf', 'Roboto', 'bold');
  doc.setFont('Roboto', 'normal');
  return doc;
}

/**
 * Renders the professional header with branding
 */
function pdfHeader(doc: jsPDF, logoB64?: string, qrB64?: string) {
  const pageW = doc.internal.pageSize.getWidth();
  
  // Brand "myAVVO"
  doc.setFont('Roboto', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(PALETTE.teal[0], PALETTE.teal[1], PALETTE.teal[2]);
  doc.text('my', 10, 14);
  const myW = doc.getTextWidth('my');
  doc.setTextColor(PALETTE.navy[0], PALETTE.navy[1], PALETTE.navy[2]);
  doc.text('AVVO', 10 + myW, 14);

  // Subtitles
  doc.setFont('Roboto', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(PALETTE.navy[0], PALETTE.navy[1], PALETTE.navy[2]);
  doc.text('HUB Juridic Unic in Moldova', 10, 22);
  
  doc.setFont('Roboto', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(74, 85, 104);
  doc.text('Toate solutiile juridice intr-un singur loc', 10, 27);

  // QR Code
  if (qrB64) {
    const qrX = pageW - 38;
    const qrY = 8;
    const qrSize = 26;
    doc.addImage(qrB64, 'PNG', qrX, qrY, qrSize, qrSize);
    doc.setFontSize(6);
    doc.setTextColor(PALETTE.gray[0], PALETTE.gray[1], PALETTE.gray[2]);
    doc.text('calc.myavvo.md', qrX + qrSize / 2, qrY + qrSize + 4, { align: 'center' });
  }

  // Separator line
  doc.setDrawColor(PALETTE.navy[0], PALETTE.navy[1], PALETTE.navy[2]);
  doc.setLineWidth(0.5);
  doc.line(10, 40, pageW - 10, 40);

  return 46; // Next Y position
}

/**
 * Renders the multi-page footer
 */
function pdfFooter(doc: jsPDF, dateStr: string) {
  const ML = 14;
  const MR = doc.internal.pageSize.getWidth() - 14;
  const H = doc.internal.pageSize.getHeight();
  const totalPages = doc.internal.getNumberOfPages();

  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);
    
    // Line
    doc.setDrawColor(PALETTE.navy[0], PALETTE.navy[1], PALETTE.navy[2]);
    doc.setLineWidth(0.4);
    doc.line(ML, H - 20, MR, H - 20);

    // Left info
    doc.setFont('Roboto', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(PALETTE.navy[0], PALETTE.navy[1], PALETTE.navy[2]);
    doc.text('myAVVO \u2014 Hub Juridic Moldova', ML, H - 15.5);
    
    doc.setFont('Roboto', 'normal');
    doc.setFontSize(6);
    doc.setTextColor(PALETTE.gray[0], PALETTE.gray[1], PALETTE.gray[2]);
    doc.text('Solutii juridice complete pentru business si persoane fizice', ML, H - 12);
    
    doc.setTextColor(PALETTE.teal[0], PALETTE.teal[1], PALETTE.teal[2]);
    doc.text('calc.myavvo.md', ML, H - 8.5);

    // Right info
    doc.setTextColor(PALETTE.gray[0], PALETTE.gray[1], PALETTE.gray[2]);
    doc.setFontSize(6.5);
    doc.text('Document generat automat', MR, H - 15.5, { align: 'right' });
    doc.text(dateStr, MR, H - 12, { align: 'right' });
    doc.text(`Pagina ${p} / ${totalPages}`, MR, H - 8.5, { align: 'right' });
  }
}

/**
 * Renders summary statistics boxes
 */
function pdfStats(doc: jsPDF, stats: {l: string, v: string}[], y: number) {
  const pageW = doc.internal.pageSize.getWidth();
  const ML = 14;
  const UW = pageW - 28;
  const bW = (UW - 9) / 4;

  stats.forEach((st, i) => {
    const bx = ML + i * (bW + 3);
    doc.setFillColor(PALETTE.bgLight[0], PALETTE.bgLight[1], PALETTE.bgLight[2]);
    doc.setDrawColor(PALETTE.bgBorder[0], PALETTE.bgBorder[1], PALETTE.bgBorder[2]);
    doc.setLineWidth(0.3);
    doc.roundedRect(bx, y, bW, 16, 2, 2, 'FD');
    
    doc.setFont('Roboto', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(PALETTE.gray[0], PALETTE.gray[1], PALETTE.gray[2]);
    doc.text(sanitize(st.l), bx + bW / 2, y + 5.5, { align: 'center' });
    
    doc.setFont('Roboto', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(PALETTE.navy[0], PALETTE.navy[1], PALETTE.navy[2]);
    doc.text(st.v, bx + bW / 2, y + 12.5, { align: 'center' });
  });
}

/**
 * Loads branding images and converts them to Base64
 */
async function loadBrandingImages(): Promise<{logoB64?: string, qrB64?: string}> {
  const toBase64 = async (url: string): Promise<string> => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(blob);
      });
    } catch (e) {
      console.warn('Failed to load image:', url);
      return '';
    }
  };

  const [logo, qr] = await Promise.all([
    toBase64('/logo.png'),
    toBase64('/qr-calc.png')
  ]);

  return { logoB64: logo, qrB64: qr };
}

function getDateStr() {
  const n = new Date();
  const p = (x: number) => String(x).padStart(2, '0');
  return formatDateRO(n) + ' ' + p(n.getHours()) + ':' + p(n.getMinutes());
}

/**
 * DOBANDA LEGALA EXPORT
 */
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
  const { logoB64, qrB64 } = await loadBrandingImages();
  const doc = createDoc();
  const ML = 14;
  const UW = doc.internal.pageSize.getWidth() - 28;
  const dt = getDateStr();

  let y = pdfHeader(doc, logoB64, qrB64);

  // Intro
  const intro = sanitize(`Dobanda legala constituie \u2014 ${formatMoney(params.total)} ${params.currency} si a fost calculata pentru perioada ${formatDateRO(params.startDate)} - ${formatDateRO(params.endDate)}, conform art. 874 Cod Civil RM, rata BNM + ${params.percent}% (persoane ${params.percent === 5 ? 'fizice' : 'juridice'}).`);
  doc.setFont('Roboto', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(PALETTE.darkGray[0], PALETTE.darkGray[1], PALETTE.darkGray[2]);
  const iL = doc.splitTextToSize(intro, UW);
  doc.text(iL, ML, y);
  y += iL.length * 4.5 + 3;

  // Main Result Box
  const boxW = 130;
  const boxX = (doc.internal.pageSize.getWidth() - boxW) / 2;
  const boxH = 24;
  doc.setFillColor(PALETTE.boxBg[0], PALETTE.boxBg[1], PALETTE.boxBg[2]);
  doc.roundedRect(boxX, y, boxW, boxH, 3, 3, 'F');
  doc.setDrawColor(PALETTE.teal[0], PALETTE.teal[1], PALETTE.teal[2]);
  doc.setLineWidth(0.5);
  doc.roundedRect(boxX, y, boxW, boxH, 3, 3, 'S');
  
  doc.setFontSize(8);
  doc.setTextColor(17, 165, 234);
  doc.text(sanitize('Dobanda legala de intarziere'), doc.internal.pageSize.getWidth() / 2, y + 6, { align: 'center' });
  doc.setFontSize(18);
  doc.setFont('Roboto', 'bold');
  doc.setTextColor(PALETTE.navy[0], PALETTE.navy[1], PALETTE.navy[2]);
  doc.text(`${formatMoney(params.total)} ${params.currency}`, doc.internal.pageSize.getWidth() / 2, y + 15, { align: 'center' });
  doc.setFontSize(8);
  doc.setFont('Roboto', 'normal');
  doc.setTextColor(74, 85, 104);
  doc.text(`${formatDateRO(params.startDate)} \u2014 ${formatDateRO(params.endDate)}`, doc.internal.pageSize.getWidth() / 2, y + 21, { align: 'center' });
  y += boxH + 4;

  // Stats
  pdfStats(doc, [
    { l: 'Sume scadente', v: formatMoney(params.totalDebts) + ' ' + params.currency },
    { l: 'Achitat', v: formatMoney(params.totalPayments) + ' ' + params.currency },
    { l: 'Zile calculate', v: String(params.totalDays) },
    { l: 'Procent supl.', v: '+' + params.percent + '%' }
  ], y);
  y += 20;

  // Table
  const rows = params.rows.map((w: any) => {
    const p = w.b ? (w.z === 1 ? formatDateRO(w.a) : formatDateRO(w.a) + '-' + formatDateRO(w.b)) : formatDateRO(w.a);
    return [
      p,
      w.z || '-',
      formatMoney(w.s),
      (w.r || 0).toFixed(2) + '%',
      (w.rt || 0).toFixed(2) + '%',
      w.db > 0 ? formatMoney(w.db) : '-',
      formatMoney(w.c),
      sanitize(w.o || '')
    ];
  });
  rows.push(['TOTAL', String(params.totalDays), '', '', '', '', formatMoney(params.total), '']);

  doc.autoTable({
    startY: y,
    head: [['Perioada', 'Zile', `Suma ${params.currency}`, 'BNM%', 'Total%', 'Dobanda', 'Cumulat', 'Obs']],
    body: rows,
    theme: 'grid',
    styles: { fontSize: 7.5, cellPadding: 2, lineColor: PALETTE.bgBorder, lineWidth: 0.2 },
    headStyles: { fillColor: PALETTE.navy, textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 7.5, halign: 'center' },
    alternateRowStyles: { fillColor: PALETTE.bgLight },
    columnStyles: { 
      0: { cellWidth: 32 }, 1: { halign: 'center', cellWidth: 9 }, 2: { halign: 'right', cellWidth: 23 },
      3: { halign: 'center', cellWidth: 13 }, 4: { halign: 'center', cellWidth: 13 },
      5: { halign: 'right', cellWidth: 23 }, 6: { halign: 'right', cellWidth: 23 }, 7: { cellWidth: 46 }
    },
    margin: { left: ML, right: 14, top: 46, bottom: 22 },
    didParseCell: (data: any) => {
      if (data.section === 'body') {
        const rowIndex = data.row.index;
        const isTotal = rowIndex === rows.length - 1;
        const rowData = params.rows[rowIndex];

        if (isTotal) {
          data.cell.styles.fillColor = PALETTE.boxBg;
          data.cell.styles.textColor = PALETTE.navy;
          data.cell.styles.fontStyle = 'bold';
        } else if (rowData?.iS) { // Scadenta
          data.cell.styles.fillColor = [255, 251, 235];
          data.cell.styles.textColor = [183, 121, 31];
        } else if (rowData?.iP) { // Plata
          data.cell.styles.fillColor = [240, 255, 244];
          data.cell.styles.textColor = [39, 103, 73];
        }
      }
    },
    didDrawPage: (data: any) => {
      if (data.pageNumber > 1) pdfHeader(doc, logoB64, qrB64);
    }
  });

  // Signature
  const fy = doc.lastAutoTable.finalY + 4;
  doc.setLineWidth(1.5);
  doc.setDrawColor(PALETTE.navy[0], PALETTE.navy[1], PALETTE.navy[2]);
  doc.line(ML, fy, ML + UW / 2, fy);
  doc.setDrawColor(PALETTE.teal[0], PALETTE.teal[1], PALETTE.teal[2]);
  doc.line(ML + UW / 2, fy, ML + UW, fy);

  const sy = fy + 9;
  doc.setFont('Roboto', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(PALETTE.darkGray[0], PALETTE.darkGray[1], PALETTE.darkGray[2]);
  doc.text('Calcul efectuat de: ___________________________', ML, sy);
  doc.setDrawColor(PALETTE.navy[0], PALETTE.navy[1], PALETTE.navy[2]);
  doc.setLineWidth(0.4);
  doc.line(ML, sy + 10, ML + 60, sy + 10);
  doc.setFontSize(8);
  doc.setTextColor(PALETTE.gray[0], PALETTE.gray[1], PALETTE.gray[2]);
  doc.text('Semnatura', ML + 30, sy + 15, { align: 'center' });

  pdfFooter(doc, dt);
  doc.save(`myavvo-dobanda-${formatDateRO(new Date()).replace(/\./g, '')}.pdf`);
}

/**
 * PENALITATE EXPORT
 */
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
  const { logoB64, qrB64 } = await loadBrandingImages();
  const doc = createDoc();
  const ML = 14;
  const UW = doc.internal.pageSize.getWidth() - 28;
  const dt = getDateStr();

  let y = pdfHeader(doc, logoB64, qrB64);

  const intro = sanitize(`Penalitatea contractuala constituie \u2014 ${formatMoney(params.total)} ${params.currency} si a fost calculata pentru perioada ${formatDateRO(params.startDate)} - ${formatDateRO(params.endDate)}, in baza clauzei penale de ${params.percentDay}% pe zi din suma datoriei neachitate.` + (params.limitNote ? ` Nota: ${params.limitNote}.` : ''));
  doc.setFont('Roboto', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(PALETTE.darkGray[0], PALETTE.darkGray[1], PALETTE.darkGray[2]);
  const iL = doc.splitTextToSize(intro, UW);
  doc.text(iL, ML, y);
  y += iL.length * 4.5 + 3;

  const boxW = 130;
  const boxX = (doc.internal.pageSize.getWidth() - boxW) / 2;
  const boxH = 24;
  doc.setFillColor(PALETTE.boxBg[0], PALETTE.boxBg[1], PALETTE.boxBg[2]);
  doc.roundedRect(boxX, y, boxW, boxH, 3, 3, 'F');
  doc.setDrawColor(PALETTE.teal[0], PALETTE.teal[1], PALETTE.teal[2]);
  doc.setLineWidth(0.5);
  doc.roundedRect(boxX, y, boxW, boxH, 3, 3, 'S');
  
  doc.setFontSize(8);
  doc.setTextColor(17, 165, 234);
  doc.text(sanitize('Penalitate contractuala totala'), doc.internal.pageSize.getWidth() / 2, y + 6, { align: 'center' });
  doc.setFontSize(18);
  doc.setFont('Roboto', 'bold');
  doc.setTextColor(PALETTE.navy[0], PALETTE.navy[1], PALETTE.navy[2]);
  doc.text(`${formatMoney(params.total)} ${params.currency}`, doc.internal.pageSize.getWidth() / 2, y + 15, { align: 'center' });
  doc.setFontSize(8);
  doc.setFont('Roboto', 'normal');
  doc.setTextColor(74, 85, 104);
  doc.text(`${formatDateRO(params.startDate)} \u2014 ${formatDateRO(params.endDate)}`, doc.internal.pageSize.getWidth() / 2, y + 21, { align: 'center' });
  y += boxH + 4;

  pdfStats(doc, [
    { l: 'Sume scadente', v: formatMoney(params.totalDebts) + ' ' + params.currency },
    { l: 'Achitat', v: formatMoney(params.totalPayments) + ' ' + params.currency },
    { l: 'Zile calculate', v: String(params.totalDays) },
    { l: 'Procent/zi', v: params.percentDay + '%' }
  ], y);
  y += 20;

  const rows = params.rows.map((w: any) => {
    const p = w.b ? (w.z === 1 ? formatDateRO(w.a) : formatDateRO(w.a) + '-' + formatDateRO(w.b)) : formatDateRO(w.a);
    return [
      p,
      w.z || '-',
      formatMoney(w.s),
      (w.rt || 0) + '%',
      w.db > 0 ? formatMoney(w.db) : '-',
      formatMoney(w.c),
      sanitize(w.o || '')
    ];
  });
  rows.push(['TOTAL', String(params.totalDays), '', '', '', formatMoney(params.total), '']);

  doc.autoTable({
    startY: y,
    head: [['Perioada', 'Zile', `Suma ${params.currency}`, '%/zi', 'Penalitate', 'Cumulat', 'Obs']],
    body: rows,
    theme: 'grid',
    styles: { fontSize: 7.5, cellPadding: 2, lineColor: PALETTE.bgBorder, lineWidth: 0.2 },
    headStyles: { fillColor: PALETTE.navy, textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 7.5, halign: 'center' },
    alternateRowStyles: { fillColor: PALETTE.bgLight },
    columnStyles: { 
      0: { cellWidth: 33 }, 1: { halign: 'center', cellWidth: 10 }, 2: { halign: 'right', cellWidth: 27 },
      3: { halign: 'center', cellWidth: 15 }, 4: { halign: 'right', cellWidth: 26 },
      5: { halign: 'right', cellWidth: 26 }, 6: { cellWidth: 45 }
    },
    margin: { left: ML, right: 14, top: 46, bottom: 22 },
    didParseCell: (data: any) => {
      if (data.section === 'body') {
        const rowIndex = data.row.index;
        const isTotal = rowIndex === rows.length - 1;
        const rowData = params.rows[rowIndex];

        if (isTotal) {
          data.cell.styles.fillColor = PALETTE.boxBg;
          data.cell.styles.textColor = PALETTE.navy;
          data.cell.styles.fontStyle = 'bold';
        } else if (rowData?.iS) {
          data.cell.styles.fillColor = [255, 251, 235];
          data.cell.styles.textColor = [183, 121, 31];
        } else if (rowData?.iP) {
          data.cell.styles.fillColor = [240, 255, 244];
          data.cell.styles.textColor = [39, 103, 73];
        } else if (rowData?.o === 'LIMITA') {
          data.cell.styles.fillColor = [254, 226, 226];
          data.cell.styles.textColor = [185, 28, 28];
        }
      }
    },
    didDrawPage: (data: any) => {
      if (data.pageNumber > 1) pdfHeader(doc, logoB64, qrB64);
    }
  });

  const fy = doc.lastAutoTable.finalY + 4;
  doc.setLineWidth(1.5);
  doc.setDrawColor(PALETTE.navy[0], PALETTE.navy[1], PALETTE.navy[2]);
  doc.line(ML, fy, ML + UW / 2, fy);
  doc.setDrawColor(PALETTE.teal[0], PALETTE.teal[1], PALETTE.teal[2]);
  doc.line(ML + UW / 2, fy, ML + UW, fy);

  const sy = fy + 9;
  doc.setFont('Roboto', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(PALETTE.darkGray[0], PALETTE.darkGray[1], PALETTE.darkGray[2]);
  doc.text('Calcul efectuat de: ___________________________', ML, sy);
  doc.setDrawColor(PALETTE.navy[0], PALETTE.navy[1], PALETTE.navy[2]);
  doc.setLineWidth(0.4);
  doc.line(ML, sy + 10, ML + 60, sy + 10);
  doc.setFontSize(8);
  doc.setTextColor(PALETTE.gray[0], PALETTE.gray[1], PALETTE.gray[2]);
  doc.text('Semnatura', ML + 30, sy + 15, { align: 'center' });

  pdfFooter(doc, dt);
  doc.save(`myavvo-penalitate-${formatDateRO(new Date()).replace(/\./g, '')}.pdf`);
}

/**
 * TAXA DE STAT EXPORT
 */
export async function exportTaxaPDF(params: {
  taxa: number;
  info: string;
  explanation: string;
  explanationSteps?: { title: string; items: { text: string; bold?: boolean }[] }[];
}) {
  const { logoB64, qrB64 } = await loadBrandingImages();
  const doc = createDoc();
  const ML = 14;
  const UW = doc.internal.pageSize.getWidth() - 28;
  const dt = getDateStr();

  let y = pdfHeader(doc, logoB64, qrB64);

  const intro = sanitize(`Taxa de stat constituie \u2014 ${formatMoney(params.taxa)} MDL si a fost calculata conform Legii taxei de stat Nr. 213 din 31.07.2023.`);
  doc.setFont('Roboto', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(PALETTE.darkGray[0], PALETTE.darkGray[1], PALETTE.darkGray[2]);
  const iL = doc.splitTextToSize(intro, UW);
  doc.text(iL, ML, y);
  y += iL.length * 4.5 + 3;

  const boxW = 130;
  const boxX = (doc.internal.pageSize.getWidth() - boxW) / 2;
  const boxH = 24;
  doc.setFillColor(PALETTE.boxBg[0], PALETTE.boxBg[1], PALETTE.boxBg[2]);
  doc.roundedRect(boxX, y, boxW, boxH, 3, 3, 'F');
  doc.setDrawColor(PALETTE.teal[0], PALETTE.teal[1], PALETTE.teal[2]);
  doc.setLineWidth(0.5);
  doc.roundedRect(boxX, y, boxW, boxH, 3, 3, 'S');
  
  doc.setFontSize(8);
  doc.setTextColor(17, 165, 234);
  doc.text(sanitize('Taxa de stat finala'), doc.internal.pageSize.getWidth() / 2, y + 6, { align: 'center' });
  doc.setFontSize(18);
  doc.setFont('Roboto', 'bold');
  doc.setTextColor(PALETTE.navy[0], PALETTE.navy[1], PALETTE.navy[2]);
  doc.text(`${formatMoney(params.taxa)} MDL`, doc.internal.pageSize.getWidth() / 2, y + 15, { align: 'center' });
  doc.setFontSize(8);
  doc.setFont('Roboto', 'normal');
  doc.setTextColor(74, 85, 104);
  doc.text(sanitize(params.info), doc.internal.pageSize.getWidth() / 2, y + 21, { align: 'center' });
  y += boxH + 4;

  pdfStats(doc, [
    { l: 'Taxa finala', v: formatMoney(params.taxa) + ' MDL' },
    { l: 'Baza legala', v: 'L. 213/2023' },
    { l: 'Instanta', v: params.info.split(' ')[0] },
    { l: 'Tip', v: 'Judiciara' }
  ], y);
  y += 20;

  if (params.explanationSteps && params.explanationSteps.length > 0) {
    params.explanationSteps.forEach(step => {
      if (y > 260) { doc.addPage(); pdfHeader(doc, logoB64, qrB64); y = 46; }

      doc.setFont('Roboto', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(PALETTE.navy[0], PALETTE.navy[1], PALETTE.navy[2]);
      doc.text(sanitize(step.title), ML, y);
      y += 6;

      step.items.forEach(item => {
        if (y > 275) { doc.addPage(); pdfHeader(doc, logoB64, qrB64); y = 46; }
        
        doc.setFont('Roboto', item.bold ? 'bold' : 'normal');
        doc.setFontSize(8.5);
        doc.setTextColor(PALETTE.darkGray[0], PALETTE.darkGray[1], PALETTE.darkGray[2]);
        
        doc.setTextColor(PALETTE.teal[0], PALETTE.teal[1], PALETTE.teal[2]);
        doc.text('\u2022', ML + 2, y);
        doc.setTextColor(PALETTE.darkGray[0], PALETTE.darkGray[1], PALETTE.darkGray[2]);

        const splitText = doc.splitTextToSize(sanitize(item.text), UW - 10);
        doc.text(splitText, ML + 7, y);
        y += (splitText.length * 5) + 1;
      });
      y += 2;
    });
  }

  pdfFooter(doc, dt);
  doc.save(`myavvo-taxa-stat-${formatDateRO(new Date()).replace(/\./g, '')}.pdf`);
}

/**
 * CALCULATOR ZILE EXPORT
 */
export async function exportZilePDF(params: {
  totalDays: number;
  workDays: number;
  years: number;
  months: number;
  weeks: number;
  remainingDays: number;
  startDate: Date;
  endDate: Date;
  period: string;
}) {
  const { logoB64, qrB64 } = await loadBrandingImages();
  const doc = createDoc();
  const ML = 14;
  const UW = doc.internal.pageSize.getWidth() - 28;
  const dt = getDateStr();

  let y = pdfHeader(doc, logoB64, qrB64);

  const intro = sanitize(`Termenul calculat constituie \u2014 ${params.totalDays} zile (dintre care ${params.workDays} lucratoare), pentru perioada ${params.period}.`);
  doc.setFont('Roboto', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(PALETTE.darkGray[0], PALETTE.darkGray[1], PALETTE.darkGray[2]);
  const iL = doc.splitTextToSize(intro, UW);
  doc.text(iL, ML, y);
  y += iL.length * 4.5 + 3;

  const boxW = 130;
  const boxX = (doc.internal.pageSize.getWidth() - boxW) / 2;
  const boxH = 24;
  doc.setFillColor(PALETTE.boxBg[0], PALETTE.boxBg[1], PALETTE.boxBg[2]);
  doc.roundedRect(boxX, y, boxW, boxH, 3, 3, 'F');
  doc.setDrawColor(PALETTE.teal[0], PALETTE.teal[1], PALETTE.teal[2]);
  doc.setLineWidth(0.5);
  doc.roundedRect(boxX, y, boxW, boxH, 3, 3, 'S');
  
  doc.setFontSize(8);
  doc.setTextColor(17, 165, 234);
  doc.text(sanitize('Termen calendaristic total'), doc.internal.pageSize.getWidth() / 2, y + 6, { align: 'center' });
  doc.setFontSize(18);
  doc.setFont('Roboto', 'bold');
  doc.setTextColor(PALETTE.navy[0], PALETTE.navy[1], PALETTE.navy[2]);
  doc.text(`${params.totalDays} zile`, doc.internal.pageSize.getWidth() / 2, y + 15, { align: 'center' });
  doc.setFontSize(8);
  doc.setFont('Roboto', 'normal');
  doc.setTextColor(74, 85, 104);
  doc.text(sanitize(params.period), doc.internal.pageSize.getWidth() / 2, y + 21, { align: 'center' });
  y += boxH + 4;

  pdfStats(doc, [
    { l: 'Calendaristice', v: params.totalDays + ' zile' },
    { l: 'Lucratoare', v: params.workDays + ' zile' },
    { l: 'Ani / Luni', v: `${params.years} ani / ${params.months} luni` },
    { l: 'Sapt. / Rest', v: `${params.weeks} sapt. / ${params.remainingDays} zile` }
  ], y);
  y += 20;

  const zrows = [
    ['Zile calendaristice', String(params.totalDays)],
    ['Zile lucratoare', String(params.workDays)],
    ['Perioada', sanitize(params.period)],
    ['Ani', String(params.years)],
    ['Luni', String(params.months)],
    ['Saptamani', String(params.weeks)],
    ['Zile rest', String(params.remainingDays)]
  ];

  doc.autoTable({
    startY: y,
    head: [['Indicator', 'Valoare']],
    body: zrows,
    theme: 'grid',
    styles: { fontSize: 9, cellPadding: 3, lineColor: PALETTE.bgBorder, lineWidth: 0.2 },
    headStyles: { fillColor: PALETTE.navy, textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 9, halign: 'center' },
    alternateRowStyles: { fillColor: PALETTE.bgLight },
    columnStyles: { 0: { cellWidth: 80, fontStyle: 'bold' }, 1: { cellWidth: 102 } },
    margin: { left: ML, right: 14, top: 46, bottom: 22 },
    didDrawPage: (data: any) => {
      if (data.pageNumber > 1) pdfHeader(doc, logoB64, qrB64);
    }
  });

  pdfFooter(doc, dt);
  doc.save(`myavvo-zile-${formatDateRO(new Date()).replace(/\./g, '')}.pdf`);
}
