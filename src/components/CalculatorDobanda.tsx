import React, { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { CurrencySelector } from './CurrencySelector';
import { DateInput, StepHeader, CalcButton, RadioGroup, AddItemButton } from './FormComponents';
import { parseDateRO, formatDateRO, formatMoney, addDays, diffDays } from '../utils/helpers';
import { getRateForDate, getSemesterRateForDate } from '../utils/bnmRates';
import { exportDobandaPDF } from '../utils/pdfExport';

interface DebtItem {
  id: number;
  date: string;
  amount: string;
}

interface PaymentItem {
  id: number;
  date: string;
  amount: string;
}

interface CalcRow {
  a: Date;
  b: Date | null;
  z: number;
  s: number;
  r: number;
  rt: number;
  db: number;
  c: number;
  o: string;
  iS?: boolean;
  iP?: boolean;
}

interface DobandaResult {
  rows: CalcRow[];
  total: number;
  totalDebts: number;
  totalPayments: number;
  totalDays: number;
  percent: number;
  startDate: Date;
  endDate: Date;
  currency: string;
}

export function CalculatorDobanda() {
  const [currency, setCurrency] = useState('MDL');
  const [percent, setPercent] = useState('9');
  const [debts, setDebts] = useState<DebtItem[]>([{ id: 1, date: '', amount: '' }]);
  const [payments, setPayments] = useState<PaymentItem[]>([]);
  const [calcDate, setCalcDate] = useState('');
  const [includeStart, setIncludeStart] = useState('0');
  const [displayMode, setDisplayMode] = useState('0');
  const [result, setResult] = useState<DobandaResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pdfLoading, setPdfLoading] = useState(false);

  const handleExportPDF = async () => {
    if (!result) return;
    setPdfLoading(true);
    try {
      await exportDobandaPDF(result);
    } catch (e) {
      console.error(e);
    } finally {
      setPdfLoading(false);
    }
  };

  let debtCounter = debts.length;
  let payCounter = payments.length;

  const addDebt = () => setDebts(prev => [...prev, { id: Date.now(), date: '', amount: '' }]);
  const removeDebt = (id: number) => setDebts(prev => prev.filter(d => d.id !== id));
  const updateDebt = (id: number, field: 'date' | 'amount', val: string) =>
    setDebts(prev => prev.map(d => d.id === id ? { ...d, [field]: val } : d));

  const addPayment = () => setPayments(prev => [...prev, { id: Date.now(), date: '', amount: '' }]);
  const removePayment = (id: number) => setPayments(prev => prev.filter(p => p.id !== id));
  const updatePayment = (id: number, field: 'date' | 'amount', val: string) =>
    setPayments(prev => prev.map(p => p.id === id ? { ...p, [field]: val } : p));

  const calculate = () => {
    setError(null);
    try {
      const Y = parseInt(percent);
      const validDebts = debts
        .filter(d => d.date && parseFloat(d.amount) > 0)
        .map(d => ({ data: parseDateRO(d.date), suma: parseFloat(d.amount) }))
        .sort((a, b) => a.data.getTime() - b.data.getTime());

      if (!validDebts.length) {
        setError('Adăugați cel puțin o sumă scadentă cu data și suma completate!');
        return;
      }
      if (!calcDate) {
        setError('Selectați data calculului!');
        return;
      }

      const D = parseDateRO(calcDate);
      const ps = validDebts[0].data;
      if (D <= ps) {
        setError('Data calculului trebuie să fie după data primei scadențe!');
        return;
      }

      const validPayments = payments
        .filter(p => p.date && parseFloat(p.amount) > 0)
        .map(p => ({ data: parseDateRO(p.date), suma: parseFloat(p.amount) }))
        .sort((a, b) => a.data.getTime() - b.data.getTime());

      // Build events array
      const ev: { d: Date; t: 's' | 'p' | 'r'; v: number }[] = [];
      validDebts.forEach(x => ev.push({ d: x.data, t: 's', v: x.suma }));

      let avans = 0;
      validPayments.forEach(x => {
        if (x.data < ps) {
          avans += x.suma;
        } else if (x.data <= D) {
          ev.push({ d: x.data, t: 'p', v: x.suma });
        }
      });

      // Semester boundaries
      for (let bYr = ps.getFullYear(); bYr <= D.getFullYear() + 1; bYr++) {
        const bJ = new Date(bYr, 0, 1);
        const bJu = new Date(bYr, 6, 1);
        if (bJ > ps && bJ <= D) ev.push({ d: bJ, t: 'r', v: getRateForDate(bJ) });
        if (bJu > ps && bJu <= D) ev.push({ d: bJu, t: 'r', v: getRateForDate(bJu) });
      }
      ev.sort((a, b) => a.d.getTime() - b.d.getTime());

      const inclS = includeStart === '1';
      const T: CalcRow[] = [];
      let s = 0, r = getSemesterRateForDate(ps), c = 0;
      let z: Date | null = null;
      let tF = 0, tP = 0;

      for (let i = 0; i < ev.length; i++) {
        const e = ev[i];
        if (z && e.d > z && s > 0) {
          const a2 = addDays(z, 1);
          const b2 = addDays(e.d, -1);
          if (b2 >= a2) {
            const n = diffDays(a2, b2) + 1;
            const rt = r + Y;
            const db = s * (rt / 100) / 365 * n;
            c += db;
            T.push({ a: a2, b: b2, z: n, s, r, rt, db, c, o: '' });
          }
        }
        if (e.t === 's') {
          T.push({ a: e.d, b: null, z: 0, s: s + e.v, r, rt: r + Y, db: 0, c, o: `Scadenta +${formatMoney(e.v)}`, iS: true });
          s += e.v;
          tF += e.v;
          if (avans > 0 && e.d.getTime() === ps.getTime()) {
            s = Math.max(0, s - avans);
            tP += avans;
            T.push({ a: e.d, b: null, z: 0, s, r, rt: r + Y, db: 0, c, o: `Avans -${formatMoney(avans)}`, iP: true });
          }
          z = inclS ? addDays(e.d, -1) : e.d;
        } else if (e.t === 'p') {
          s = Math.max(0, s - e.v);
          T.push({ a: e.d, b: null, z: 0, s, r, rt: r + Y, db: 0, c, o: `Plata -${formatMoney(e.v)}`, iP: true });
          tP += e.v;
          z = e.d;
        } else {
          r = e.v;
          if (z) z = addDays(e.d, -1);
        }
      }

      if (z && D > z && s > 0) {
        const a2 = addDays(z, 1);
        if (D >= a2) {
          const n = diffDays(a2, D) + 1;
          const rt = r + Y;
          const db = s * (rt / 100) / 365 * n;
          c += db;
          T.push({ a: a2, b: D, z: n, s, r, rt, db, c, o: '' });
        }
      }

      let zt = 0;
      T.forEach(x => { zt += x.z; });

      setResult({ rows: T, total: c, totalDebts: tF, totalPayments: tP, totalDays: zt, percent: Y, startDate: ps, endDate: D, currency });
    } catch (e) {
      setError('A apărut o eroare la calculare. Verificați datele introduse.');
    }
  };

  const expandDetailed = (T: CalcRow[]): CalcRow[] => {
    const res: CalcRow[] = [];
    T.forEach(w => {
      if (!w.b || w.z === 0) {
        res.push(w);
      } else {
        const dd = w.s * (w.rt / 100) / 365;
        const cB = w.c - w.db;
        let cur = new Date(w.a.getTime());
        const end = new Date(w.b.getTime());
        let rc = cB;
        while (cur <= end) {
          rc += dd;
          res.push({ a: new Date(cur.getTime()), b: new Date(cur.getTime()), z: 1, s: w.s, r: w.r, rt: w.rt, db: dd, c: rc, o: '' });
          cur = addDays(cur, 1);
        }
      }
    });
    return res;
  };

  const displayRows = result ? (displayMode === '1' ? expandDetailed(result.rows) : result.rows) : [];

  return (
    <div>
      {error && (
        <div className="mb-4 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-500 font-medium text-sm">
          {error}
        </div>
      )}

      <div className="mb-5">
        <StepHeader step="1" title="Valuta calculului" />
        <CurrencySelector value={currency} onChange={setCurrency} />
      </div>

      <div className="mb-5">
        <StepHeader step="2" title="Procent (art.874 CC)" />
        <RadioGroup
          name="percent-dob"
          value={percent}
          onChange={setPercent}
          options={[
            { value: '9', label: '+9%', sublabel: 'Non-Consumatori' },
            { value: '5', label: '+5%', sublabel: 'Consumatori' },
          ]}
        />
      </div>

      <div className="mb-5">
        <StepHeader step="3" title="Sume scadente" />
        <div className="flex flex-col gap-2">
          {debts.map(debt => (
            <div key={debt.id} className="p-3 bg-[var(--surface-2)] rounded-xl border border-[var(--border)]">
              <div className="flex gap-2">
                <div className="flex-1">
                  <DateInput
                    value={debt.date}
                    onChange={val => updateDebt(debt.id, 'date', val)}
                    label="Data scadenței"
                    placeholder="zz/ll/aaaa"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-sm text-[var(--text-muted)] mb-1.5 font-medium">Suma</label>
                  <input
                    type="number"
                    value={debt.amount}
                    onChange={e => updateDebt(debt.id, 'amount', e.target.value)}
                    placeholder="10000"
                    step="0.01"
                    className="w-full px-4 py-3 bg-[var(--input-bg)] border border-[var(--input-border)] rounded-xl text-[var(--text-main)] text-base transition-all focus:outline-none focus:border-[var(--accent)] focus:shadow-[0_0_0_3px_rgba(14,165,233,0.1)]"
                  />
                </div>
              </div>
              {debts.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeDebt(debt.id)}
                  className="mt-2 flex items-center gap-1 text-red-500 text-xs font-semibold px-3 py-1.5 rounded-lg border border-red-500/30 bg-red-500/5 hover:bg-red-500/10 transition-colors"
                >
                  <Trash2 size={12} /> Șterge
                </button>
              )}
            </div>
          ))}
        </div>
        <AddItemButton onClick={addDebt}>+ Adaugă Sumă Scadentă</AddItemButton>
      </div>

      <div className="mb-5">
        <StepHeader step="4" title="Plăți" />
        <div className="flex flex-col gap-2">
          {payments.map(pay => (
            <div key={pay.id} className="p-3 bg-[var(--surface-2)] rounded-xl border border-[var(--border)]">
              <div className="flex gap-2">
                <div className="flex-1">
                  <DateInput
                    value={pay.date}
                    onChange={val => updatePayment(pay.id, 'date', val)}
                    label="Data plată"
                    placeholder="zz/ll/aaaa"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-sm text-[var(--text-muted)] mb-1.5 font-medium">Suma</label>
                  <input
                    type="number"
                    value={pay.amount}
                    onChange={e => updatePayment(pay.id, 'amount', e.target.value)}
                    placeholder="5000"
                    step="0.01"
                    className="w-full px-4 py-3 bg-[var(--input-bg)] border border-[var(--input-border)] rounded-xl text-[var(--text-main)] text-base transition-all focus:outline-none focus:border-[var(--accent)] focus:shadow-[0_0_0_3px_rgba(14,165,233,0.1)]"
                  />
                </div>
              </div>
              <button
                type="button"
                onClick={() => removePayment(pay.id)}
                className="mt-2 flex items-center gap-1 text-red-500 text-xs font-semibold px-3 py-1.5 rounded-lg border border-red-500/30 bg-red-500/5 hover:bg-red-500/10 transition-colors"
              >
                <Trash2 size={12} /> Șterge
              </button>
            </div>
          ))}
        </div>
        <AddItemButton onClick={addPayment}>+ Adaugă Plată</AddItemButton>
      </div>

      <div className="mb-5">
        <StepHeader step="5" title="Data calcul" />
        <DateInput value={calcDate} onChange={setCalcDate} label="Până la:" />
      </div>

      <div className="mb-5">
        <StepHeader step="6" title="Opțiuni calcul" />
        <div className="mb-3">
          <div className="text-sm font-medium text-[var(--text-main)] mb-2">Ziua scadenței:</div>
          <RadioGroup
            name="incS-dob"
            value={includeStart}
            onChange={setIncludeStart}
            options={[
              { value: '0', label: 'Fără', sublabel: 'Din ziua următoare' },
              { value: '1', label: 'Include', sublabel: 'Din ziua scadenței' },
            ]}
          />
        </div>
        <div>
          <div className="text-sm font-medium text-[var(--text-main)] mb-2">Mod afișare rezultat:</div>
          <RadioGroup
            name="modD"
            value={displayMode}
            onChange={setDisplayMode}
            options={[
              { value: '0', label: 'Grupat', sublabel: 'Pe perioade' },
              { value: '1', label: 'Detaliat', sublabel: 'Zi cu zi' },
            ]}
          />
        </div>
      </div>

      <CalcButton onClick={calculate}>Calculează Dobânda</CalcButton>

      {result && (
        <div className="mt-6 animate-[fadeIn_0.3s_ease]">
          {/* Main result card */}
          <div className="rounded-2xl p-6 bg-[linear-gradient(135deg,#38bdf8,#3b82f6)] text-white text-center shadow-[0_10px_30px_rgba(14,165,233,0.3)] mb-4">
            <div className="text-xs uppercase tracking-widest font-semibold opacity-90 mb-2">Dobânda legală</div>
            <div className="text-4xl font-bold leading-tight break-all">{formatMoney(result.total)} {result.currency}</div>
            <div className="text-sm opacity-80 mt-1">{formatDateRO(result.startDate)} — {formatDateRO(result.endDate)}</div>
            <div className="grid grid-cols-2 gap-2.5 mt-4 bg-black/15 p-4 rounded-2xl text-left">
              <div><div className="text-xs opacity-80">Sume</div><div className="font-semibold mt-0.5">{formatMoney(result.totalDebts)}</div></div>
              <div><div className="text-xs opacity-80">Achitat</div><div className="font-semibold mt-0.5">{formatMoney(result.totalPayments)}</div></div>
              <div><div className="text-xs opacity-80">Zile</div><div className="font-semibold mt-0.5">{result.totalDays}</div></div>
              <div><div className="text-xs opacity-80">%</div><div className="font-semibold mt-0.5">+{result.percent}%</div></div>
            </div>
          </div>

          {/* Results table */}
          <div className="overflow-x-auto bg-[var(--glass-bg)] backdrop-blur-xl rounded-3xl p-6 border border-[var(--glass-border)] shadow-[var(--glass-shadow)]">
            <table className="w-full min-w-[500px] border-collapse text-sm">
              <thead>
                <tr>
                  {['Perioadă', 'Zile', 'Suma', 'BNM', 'Tot%', 'Dob', 'Cum', 'Obs'].map(h => (
                    <th key={h} className="px-2 py-2 bg-[var(--surface-2)] text-[var(--text-muted)] text-center font-semibold text-xs">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {displayRows.map((w, i) => {
                  const period = w.b
                    ? (w.z === 1 ? formatDateRO(w.a) : `${formatDateRO(w.a)}-${formatDateRO(w.b)}`)
                    : formatDateRO(w.a);
                  const rowClass = w.iS ? 'text-amber-600' : w.iP ? 'text-emerald-600' : '';
                  return (
                    <tr key={i} className={rowClass}>
                      <td className="px-2 py-2 border-b border-[var(--border)] text-left text-xs">{period}</td>
                      <td className="px-2 py-2 border-b border-[var(--border)] text-center">{w.z || '-'}</td>
                      <td className="px-2 py-2 border-b border-[var(--border)] text-right">{formatMoney(w.s)}</td>
                      <td className="px-2 py-2 border-b border-[var(--border)] text-center">{w.r.toFixed(2)}%</td>
                      <td className="px-2 py-2 border-b border-[var(--border)] text-center">{w.rt.toFixed(2)}%</td>
                      <td className="px-2 py-2 border-b border-[var(--border)] text-right">{w.db > 0 ? formatMoney(w.db) : '-'}</td>
                      <td className="px-2 py-2 border-b border-[var(--border)] text-right">{formatMoney(w.c)}</td>
                      <td className="px-2 py-2 border-b border-[var(--border)] text-xs text-[var(--text-muted)]">{w.o}</td>
                    </tr>
                  );
                })}
                <tr className="bg-[var(--surface-2)] font-bold border-t-2 border-[var(--border)]">
                  <td className="px-2 py-2 text-left">TOTAL</td>
                  <td className="px-2 py-2 text-center">{result.totalDays}</td>
                  <td colSpan={4} />
                  <td className="px-2 py-2 text-right">{formatMoney(result.total)}</td>
                  <td />
                </tr>
              </tbody>
            </table>
          </div>

          <div className="flex gap-2 mt-3">
            <button
              onClick={() => setResult(null)}
              className="flex-1 py-3 border-2 border-[var(--accent)] rounded-2xl text-[var(--accent)] font-bold hover:bg-[var(--accent-subtle)] transition-all"
            >
              Ascunde
            </button>
            <button
              onClick={handleExportPDF}
              disabled={pdfLoading}
              className="flex-1 py-3 rounded-2xl bg-[linear-gradient(135deg,#38bdf8,#3b82f6)] text-white font-bold shadow-[0_10px_20px_rgba(14,165,233,0.2)] hover:-translate-y-0.5 transition-all disabled:opacity-60 disabled:cursor-wait"
            >
              {pdfLoading ? 'Generare...' : 'Descarcă PDF'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
