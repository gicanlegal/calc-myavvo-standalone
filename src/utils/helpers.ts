// Date utilities
export function parseDateRO(s: string): Date {
  if (!s) return new Date(NaN);
  if (s.indexOf('-') > -1) {
    const p = s.split('-');
    return new Date(+p[0], +p[1] - 1, +p[2]);
  }
  if (s.indexOf('/') > -1) {
    const p = s.split('/');
    return new Date(+p[2], +p[1] - 1, +p[0]);
  }
  const p = s.split('.');
  return new Date(+p[2], +p[1] - 1, +p[0]);
}

export function formatDateRO(d: Date): string {
  if (isNaN(d.getTime())) return '-';
  return String(d.getDate()).padStart(2, '0') + '.' +
    String(d.getMonth() + 1).padStart(2, '0') + '.' +
    d.getFullYear();
}

export function addDays(d: Date, n: number): Date {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
}

export function diffDays(a: Date, b: Date): number {
  return Math.round((b.getTime() - a.getTime()) / 86400000);
}

// Number formatting
export function formatMoney(n: number): string {
  return n.toLocaleString('ro-MD', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// Currencies list
export const CURRENCIES = [
  { code: 'MDL', name: 'Leu moldovenesc' },
  { code: 'EUR', name: 'Euro' },
  { code: 'USD', name: 'Dolar american' },
  { code: 'UAH', name: 'Grivna ucraineana' },
  { code: 'RUB', name: 'Rubla ruseasca' },
  { code: 'RON', name: 'Leu romanesc' },
  { code: 'GBP', name: 'Lira sterlina britanica' },
  { code: 'CHF', name: 'Franc elvetian' },
  { code: 'JPY', name: 'Yen japonez' },
  { code: 'CAD', name: 'Dolar canadian' },
  { code: 'AUD', name: 'Dolar australian' },
  { code: 'SEK', name: 'Coroana suedeza' },
  { code: 'NOK', name: 'Coroana norvegiana' },
  { code: 'DKK', name: 'Coroana daneza' },
  { code: 'HUF', name: 'Forint maghiar' },
  { code: 'CZK', name: 'Coroana ceha' },
  { code: 'PLN', name: 'Zlot polonez' },
  { code: 'BGN', name: 'Leva bulgara' },
  { code: 'TRY', name: 'Lira turceasca' },
  { code: 'CNY', name: 'Yuan chinezesc' },
  { code: 'XDR', name: 'DST (FMI)' },
];
