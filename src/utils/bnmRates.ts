const INITIAL_RATES = [
  { d: '11.12.2025', r: 5 }, { d: '18.09.2025', r: 6 }, { d: '07.08.2025', r: 6.25 },
  { d: '05.02.2025', r: 6.5 }, { d: '10.01.2025', r: 5.6 }, { d: '07.05.2024', r: 3.6 },
  { d: '21.03.2024', r: 3.75 }, { d: '06.02.2024', r: 4.25 }, { d: '07.11.2023', r: 4.75 },
  { d: '20.06.2023', r: 6 }, { d: '11.05.2023', r: 10 }, { d: '20.03.2023', r: 14 },
  { d: '07.02.2023', r: 17 }, { d: '05.12.2022', r: 20 }, { d: '04.08.2022', r: 21.5 },
  { d: '03.06.2022', r: 18.5 }, { d: '05.05.2022', r: 15.5 }, { d: '16.03.2022', r: 12.5 },
  { d: '15.02.2022', r: 10.5 }, { d: '13.01.2022', r: 8.5 }, { d: '03.12.2021', r: 6.5 },
  { d: '05.10.2021', r: 5.5 }, { d: '06.09.2021', r: 4.65 }, { d: '30.07.2021', r: 3.65 },
  { d: '06.11.2020', r: 2.65 }, { d: '09.09.2020', r: 2.75 }, { d: '06.08.2020', r: 3 },
  { d: '20.03.2020', r: 3.25 }, { d: '04.03.2020', r: 4.5 }, { d: '11.12.2019', r: 5.5 },
  { d: '31.07.2019', r: 7.5 }, { d: '19.06.2019', r: 7 }, { d: '05.12.2017', r: 6.5 },
  { d: '25.10.2017', r: 7 }, { d: '28.08.2017', r: 7.5 }, { d: '28.06.2017', r: 8 },
  { d: '12.04.2017', r: 9 }, { d: '15.02.2017', r: 9.5 }, { d: '07.12.2016', r: 10 },
  { d: '26.10.2016', r: 10.5 }, { d: '28.09.2016', r: 11 }, { d: '10.08.2016', r: 12.5 },
  { d: '29.06.2016', r: 14 }, { d: '27.04.2016', r: 15 }, { d: '24.02.2016', r: 17 },
  { d: '27.01.2016', r: 19 }, { d: '02.12.2015', r: 19.5 }, { d: '28.10.2015', r: 17.5 },
  { d: '26.08.2015', r: 15.5 }, { d: '29.07.2015', r: 13.5 }, { d: '28.05.2015', r: 12.5 },
  { d: '18.03.2015', r: 8.5 }, { d: '28.01.2015', r: 6.5 }, { d: '29.10.2014', r: 5.5 },
  { d: '27.08.2014', r: 4.5 }, { d: '30.04.2014', r: 3.5 }, { d: '30.10.2013', r: 3.5 },
  { d: '28.08.2013', r: 4 }, { d: '26.06.2013', r: 4.5 }, { d: '04.06.2013', r: 4 },
  { d: '29.04.2013', r: 3.5 }, { d: '31.10.2012', r: 4.5 }, { d: '29.08.2012', r: 5.5 },
  { d: '27.06.2012', r: 6.5 }, { d: '25.04.2012', r: 7 }, { d: '29.02.2012', r: 8.5 },
  { d: '25.01.2012', r: 9.5 }, { d: '28.12.2011', r: 10 }, { d: '26.10.2011', r: 9.5 },
  { d: '31.08.2011', r: 9 }, { d: '29.06.2011', r: 8.5 }, { d: '27.04.2011', r: 8 },
  { d: '29.12.2010', r: 7 }, { d: '28.04.2010', r: 8 }, { d: '24.02.2010', r: 9 },
  { d: '27.01.2010', r: 10 }, { d: '02.12.2009', r: 5 }, { d: '28.10.2009', r: 7 },
  { d: '02.09.2009', r: 8 }, { d: '05.08.2009', r: 9 }, { d: '01.07.2009', r: 10 },
  { d: '27.05.2009', r: 11 }, { d: '29.04.2009', r: 12 }, { d: '25.03.2009', r: 13 },
  { d: '25.02.2009', r: 14 }, { d: '28.01.2009', r: 14.5 }
];

export interface BNMRate {
  ds: Date;
  r: number;
  s: string;
}

const STORAGE_KEY = 'bnm9';
const PROXY_URL = 'https://bnm-proxy.myavvo.md';

function parseDateStr(s: string): Date {
  const p = s.split('.');
  return new Date(+p[2], +p[1] - 1, +p[0]);
}

function parseHtml(html: string): BNMRate[] {
  const r: BNMRate[] = [];
  try {
    const d = new DOMParser().parseFromString(html, 'text/html');
    const t = d.querySelectorAll('table');
    for (let i = 0; i < t.length; i++) {
      if (t[i].textContent?.toLowerCase().indexOf('rata de baz') === -1) continue;
      const w = t[i].querySelectorAll('tr');
      for (let j = 1; j < w.length; j++) {
        const c = w[j].querySelectorAll('td');
        if (c.length >= 3) {
          const dm = c[0].textContent?.match(/(\d{2})\.(\d{2})\.(\d{4})/);
          const rm = c[2].textContent?.match(/([\d,\.]+)/);
          if (dm && rm) {
            const v = parseFloat(rm[1].replace(',', '.'));
            if (v > 0 && v < 50) {
              const strDate = dm[1] + '.' + dm[2] + '.' + dm[3];
              r.push({ ds: parseDateStr(strDate), r: v, s: strDate });
            }
          }
        }
      }
      if (r.length) break;
    }
  } catch (e) {
    console.error('Error parsing BNM html', e);
  }
  return r.sort((a, b) => b.ds.getTime() - a.ds.getTime());
}

let cachedRates: BNMRate[] = [];

export async function initializeRates(force = false): Promise<{ rates: BNMRate[], status: string, error?: boolean }> {
  try {
    if (!force) {
      const s = localStorage.getItem(STORAGE_KEY);
      if (s) {
        const d = JSON.parse(s);
        if (d.r && d.r.length > 0) {
          cachedRates = d.r.map((x: any) => ({ ds: parseDateStr(x.d), r: x.r, s: x.d }))
            .sort((a: BNMRate, b: BNMRate) => b.ds.getTime() - a.ds.getTime());
          
          // If older than 24 hours, fetch in background
          if ((new Date().getTime() - new Date(d.t).getTime()) / 3600000 > 24) {
            return await fetchAndMergeRates();
          } else {
            return { rates: cachedRates, status: 'OK (cache)' };
          }
        }
      }
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  } catch (e) {
    console.error('Error reading cached rates', e);
  }
  
  // Fallback to initial if nothing in storage
  cachedRates = INITIAL_RATES.map(x => ({ ds: parseDateStr(x.d), r: x.r, s: x.d }))
    .sort((a, b) => b.ds.getTime() - a.ds.getTime());
  
  return await fetchAndMergeRates();
}

async function fetchAndMergeRates(): Promise<{ rates: BNMRate[], status: string, error?: boolean }> {
  try {
    const r = await fetch(PROXY_URL);
    const h = await r.text();
    const n = parseHtml(h);
    if (n.length > 0) {
      const m = new Map<string, number>();
      INITIAL_RATES.forEach(x => m.set(x.d, x.r));
      cachedRates.forEach(x => m.set(x.s, x.r));
      n.forEach(x => m.set(x.s, x.r));
      
      const a: {d: string, r: number}[] = [];
      m.forEach((v, k) => a.push({ d: k, r: v }));
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ r: a, t: new Date().toISOString() }));
      cachedRates = a.map(x => ({ ds: parseDateStr(x.d), r: x.r, s: x.d }))
        .sort((a, b) => b.ds.getTime() - a.ds.getTime());
      
      return { rates: cachedRates, status: `${cachedRates.length} rate` };
    } else {
      return { rates: cachedRates, status: 'Parse error', error: true };
    }
  } catch (err) {
    return { rates: cachedRates, status: 'Date locale', error: true };
  }
}

export function getRateForDate(d: Date): number {
  if (!cachedRates.length) return 0;
  for (let i = 0; i < cachedRates.length; i++) {
    if (d >= cachedRates[i].ds) return cachedRates[i].r;
  }
  return cachedRates[cachedRates.length - 1].r;
}

// art.874 alin.(2): sem.I = rata la 1 ian, sem.II = rata la 1 iul
export function getSemesterRateForDate(d: Date): number {
  const y = d.getFullYear();
  const ref = d.getMonth() < 6 ? new Date(y, 0, 1) : new Date(y, 6, 1);
  return getRateForDate(ref);
}
