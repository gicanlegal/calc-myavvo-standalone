import { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { CurrencySelector } from './CurrencySelector';
import { DateInput, StepHeader, CalcButton, RadioGroup, AddItemButton } from './FormComponents';
import { parseDateRO, formatDateRO, formatMoney, addDays, diffDays } from '../utils/helpers';
import { exportPenalitatePDF } from '../utils/pdfExport';

interface DebtItem { id: number; date: string; amount: string; }
interface PaymentItem { id: number; date: string; amount: string; }

interface CalcRow {
  a: Date; b: Date | null; z: number; s: number; rt: number; db: number; c: number; o: string;
  iS?: boolean; iP?: boolean; isLimit?: boolean;
}

interface PenResult {
  rows: CalcRow[];
  total: number;
  totalDebts: number;
  totalPayments: number;
  totalDays: number;
  percentDay: number;
  startDate: Date;
  endDate: Date;
  currency: string;
  limitNote?: string;
}

export function CalculatorPenalitate() {
  const [currency, setCurrency] = useState('MDL');
  const [percentDay, setPercentDay] = useState('0.1');
  const [limit, setLimit] = useState('0');
  const [debts, setDebts] = useState<DebtItem[]>([{ id: 1, date: '', amount: '' }]);
  const [payments, setPayments] = useState<PaymentItem[]>([]);
  const [calcDate, setCalcDate] = useState('');
  const [includeStart, setIncludeStart] = useState('0');
  const [displayMode, setDisplayMode] = useState('0');
  const [result, setResult] = useState<PenResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pdfLoading, setPdfLoading] = useState(false);

  const handleExportPDF = async () => {
    if (!result) return;
    setPdfLoading(true);
    try { await exportPenalitatePDF(result); } catch (e) { console.error(e); } finally { setPdfLoading(false); }
  };

  const addDebt = () => setDebts(p => [...p, { id: Date.now(), date: '', amount: '' }]);
  const removeDebt = (id: number) => setDebts(p => p.filter(d => d.id !== id));
  const updateDebt = (id: number, f: 'date' | 'amount', v: string) =>
    setDebts(p => p.map(d => d.id === id ? { ...d, [f]: v } : d));

  const addPayment = () => setPayments(p => [...p, { id: Date.now(), date: '', amount: '' }]);
  const removePayment = (id: number) => setPayments(p => p.filter(x => x.id !== id));
  const updatePayment = (id: number, f: 'date' | 'amount', v: string) =>
    setPayments(p => p.map(x => x.id === id ? { ...x, [f]: v } : x));

  const calculate = () => {
    setError(null);
    try {
      const pDay = parseFloat(percentDay);
      if (!pDay || pDay <= 0) { setError('Introduceți un procent valid pe zi!'); return; }

      const validDebts = debts
        .filter(d => d.date && parseFloat(d.amount) > 0)
        .map(d => ({ data: parseDateRO(d.date), suma: parseFloat(d.amount) }))
        .sort((a, b) => a.data.getTime() - b.data.getTime());

      if (!validDebts.length) { setError('Adăugați cel puțin o sumă scadentă!'); return; }
      if (!calcDate) { setError('Selectați data calculului!'); return; }

      const D = parseDateRO(calcDate);
      const ps = validDebts[0].data;
      if (D <= ps) { setError('Data calculului trebuie să fie după data primei scadențe!'); return; }

      const validPayments = payments
        .filter(p => p.date && parseFloat(p.amount) > 0)
        .map(p => ({ data: parseDateRO(p.date), suma: parseFloat(p.amount) }))
        .sort((a, b) => a.data.getTime() - b.data.getTime());

      const maxDays = parseInt(limit) || 0;
      const inclS = includeStart === '1';

      const ev: { d: Date; t: 's' | 'p'; v: number }[] = [];
      let avans = 0;
      validDebts.forEach(x => ev.push({ d: x.data, t: 's', v: x.suma }));
      validPayments.forEach(x => {
        if (x.data < ps) avans += x.suma;
        else if (x.data <= D) ev.push({ d: x.data, t: 'p', v: x.suma });
      });
      ev.sort((a, b) => a.d.getTime() - b.d.getTime());

      const T: CalcRow[] = [];
      let s = 0, c = 0, z: Date | null = null;
      let tF = 0, tP = 0, totalDaysUsed = 0;
      let limitNote: string | undefined;

      for (let i = 0; i < ev.length; i++) {
        const e = ev[i];
        if (z && e.d > z && s > 0) {
          const a2 = addDays(z, 1);
          const b2 = addDays(e.d, -1);
          if (b2 >= a2) {
            let n = diffDays(a2, b2) + 1;
            if (maxDays > 0 && totalDaysUsed + n > maxDays) {
              n = maxDays - totalDaysUsed;
              limitNote = `Penalitate limitată la ${maxDays} zile (conform contract)`;
            }
            if (n > 0) {
              const db = s * (pDay / 100) * n;
              c += db;
              totalDaysUsed += n;
              T.push({ a: a2, b: b2, z: n, s, rt: pDay, db, c, o: '' });
            }
          }
        }
        if (e.t === 's') {
          T.push({ a: e.d, b: null, z: 0, s: s + e.v, rt: pDay, db: 0, c, o: `Scadenta +${formatMoney(e.v)}`, iS: true });
          s += e.v; tF += e.v;
          if (avans > 0 && e.d.getTime() === ps.getTime()) {
            s = Math.max(0, s - avans); tP += avans;
            T.push({ a: e.d, b: null, z: 0, s, rt: pDay, db: 0, c, o: `Avans -${formatMoney(avans)}`, iP: true });
          }
          z = inclS ? addDays(e.d, -1) : e.d;
        } else {
          s = Math.max(0, s - e.v);
          T.push({ a: e.d, b: null, z: 0, s, rt: pDay, db: 0, c, o: `Plata -${formatMoney(e.v)}`, iP: true });
          tP += e.v; z = e.d;
        }
      }

      if (z && D > z && s > 0 && (maxDays === 0 || totalDaysUsed < maxDays)) {
        const a2 = addDays(z, 1);
        if (D >= a2) {
          let n = diffDays(a2, D) + 1;
          if (maxDays > 0 && totalDaysUsed + n > maxDays) {
            n = maxDays - totalDaysUsed;
            limitNote = `Penalitate limitată la ${maxDays} zile`;
          }
          if (n > 0) {
            const db = s * (pDay / 100) * n;
            c += db; totalDaysUsed += n;
            T.push({ a: a2, b: D, z: n, s, rt: pDay, db, c, o: '' });
          }
        }
      }

      setResult({ rows: T, total: c, totalDebts: tF, totalPayments: tP, totalDays: totalDaysUsed, percentDay: pDay, startDate: ps, endDate: D, currency, limitNote });
    } catch {
      setError('A apărut o eroare la calculare. Verificați datele introduse.');
    }
  };

  return (
    <div>
      {error && <div className="mb-4 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-500 font-medium text-sm">{error}</div>}

      <div className="mb-5">
        <StepHeader step="1" title="Valuta calculului" />
        <CurrencySelector value={currency} onChange={setCurrency} />
      </div>

      <div className="mb-5">
        <StepHeader step="2" title="Procent penalitate" />
        <div className="mb-4">
          <label className="block text-sm text-[var(--text-muted)] mb-1.5 font-medium">% per zi</label>
          <input
            type="number"
            value={percentDay}
            onChange={e => setPercentDay(e.target.value)}
            placeholder="0.1"
            step="0.001"
            min="0.001"
            className="w-full px-4 py-3 bg-[var(--input-bg)] border border-[var(--input-border)] rounded-xl text-[var(--text-main)] text-base transition-all focus:outline-none focus:border-[var(--accent)] focus:shadow-[0_0_0_3px_rgba(14,165,233,0.1)]"
          />
          <div className="text-xs text-[var(--text-muted)] mt-1">Ex: 0.1% pe zi</div>
        </div>
      </div>

      <div className="mb-5">
        <StepHeader step="3" title="Limita perioadei" />
        <div className="flex flex-wrap gap-2">
          {[{ v: '0', l: 'Fără', s: 'Fără limită' }, { v: '180', l: '180 zile', s: 'Max 180' }, { v: '1095', l: '3 ani', s: 'Max 1095' }].map(o => (
            <label key={o.v} className="relative flex-1 min-w-[80px] cursor-pointer">
              <input type="radio" name="plim" value={o.v} checked={limit === o.v} onChange={() => setLimit(o.v)} className="absolute opacity-0 w-full h-full cursor-pointer z-10" />
              <div className={`block p-3 rounded-xl border-2 text-center transition-all ${limit === o.v ? 'border-[var(--accent)] bg-[var(--accent-subtle)]' : 'border-[var(--border)] bg-[var(--surface-2)]'}`}>
                <span className={`text-base font-bold block ${limit === o.v ? 'text-[var(--accent)]' : 'text-[var(--text-main)]'}`}>{o.l}</span>
                <span className="text-xs text-[var(--text-muted)] mt-0.5 block">{o.s}</span>
              </div>
            </label>
          ))}
        </div>
      </div>

      <div className="mb-5">
        <StepHeader step="4" title="Sume scadente" />
        <div className="flex flex-col gap-2">
          {debts.map(d => (
            <div key={d.id} className="p-3 bg-[var(--surface-2)] rounded-xl border border-[var(--border)]">
              <div className="flex gap-2">
                <div className="flex-1"><DateInput value={d.date} onChange={v => updateDebt(d.id, 'date', v)} label="Data scadenței" /></div>
                <div className="flex-1">
                  <label className="block text-sm text-[var(--text-muted)] mb-1.5 font-medium">Suma</label>
                  <input type="number" value={d.amount} onChange={e => updateDebt(d.id, 'amount', e.target.value)} placeholder="10000" step="0.01" className="w-full px-4 py-3 bg-[var(--input-bg)] border border-[var(--input-border)] rounded-xl text-[var(--text-main)] text-base transition-all focus:outline-none focus:border-[var(--accent)]" />
                </div>
              </div>
              {debts.length > 1 && (
                <button type="button" onClick={() => removeDebt(d.id)} className="mt-2 flex items-center gap-1 text-red-500 text-xs font-semibold px-3 py-1.5 rounded-lg border border-red-500/30 bg-red-500/5 hover:bg-red-500/10 transition-colors">
                  <Trash2 size={12} /> Șterge
                </button>
              )}
            </div>
          ))}
        </div>
        <AddItemButton onClick={addDebt}>+ Adaugă Sumă Scadentă</AddItemButton>
      </div>

      <div className="mb-5">
        <StepHeader step="5" title="Plăți" />
        <div className="flex flex-col gap-2">
          {payments.map(p => (
            <div key={p.id} className="p-3 bg-[var(--surface-2)] rounded-xl border border-[var(--border)]">
              <div className="flex gap-2">
                <div className="flex-1"><DateInput value={p.date} onChange={v => updatePayment(p.id, 'date', v)} label="Data plată" /></div>
                <div className="flex-1">
                  <label className="block text-sm text-[var(--text-muted)] mb-1.5 font-medium">Suma</label>
                  <input type="number" value={p.amount} onChange={e => updatePayment(p.id, 'amount', e.target.value)} placeholder="5000" step="0.01" className="w-full px-4 py-3 bg-[var(--input-bg)] border border-[var(--input-border)] rounded-xl text-[var(--text-main)] text-base transition-all focus:outline-none focus:border-[var(--accent)]" />
                </div>
              </div>
              <button type="button" onClick={() => removePayment(p.id)} className="mt-2 flex items-center gap-1 text-red-500 text-xs font-semibold px-3 py-1.5 rounded-lg border border-red-500/30 bg-red-500/5 hover:bg-red-500/10 transition-colors">
                <Trash2 size={12} /> Șterge
              </button>
            </div>
          ))}
        </div>
        <AddItemButton onClick={addPayment}>+ Adaugă Plată</AddItemButton>
      </div>

      <div className="mb-5">
        <StepHeader step="6" title="Data calcul" />
        <DateInput value={calcDate} onChange={setCalcDate} label="Până la:" />
      </div>

      <div className="mb-5">
        <StepHeader step="7" title="Opțiuni calcul" />
        <div className="mb-3">
          <div className="text-sm font-medium text-[var(--text-main)] mb-2">Ziua scadenței:</div>
          <RadioGroup name="incSP" value={includeStart} onChange={setIncludeStart} options={[{ value: '0', label: 'Fără', sublabel: 'Din ziua următoare' }, { value: '1', label: 'Include', sublabel: 'Din ziua scadenței' }]} />
        </div>
        <div>
          <div className="text-sm font-medium text-[var(--text-main)] mb-2">Mod afișare rezultat:</div>
          <RadioGroup name="modP" value={displayMode} onChange={setDisplayMode} options={[{ value: '0', label: 'Grupat', sublabel: 'Pe perioade' }, { value: '1', label: 'Detaliat', sublabel: 'Zi cu zi' }]} />
        </div>
      </div>

      <CalcButton onClick={calculate}>Calculează Penalitatea</CalcButton>

      {result && (
        <div className="mt-6">
          {result.limitNote && <div className="mb-3 px-4 py-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 text-sm font-medium">{result.limitNote}</div>}
          <div className="rounded-2xl p-6 bg-[linear-gradient(135deg,#38bdf8,#3b82f6)] text-white text-center shadow-[0_10px_30px_rgba(14,165,233,0.3)] mb-4">
            <div className="text-xs uppercase tracking-widest font-semibold opacity-90 mb-2">Penalitate totală</div>
            <div className="text-4xl font-bold break-all">{formatMoney(result.total)} {result.currency}</div>
            <div className="text-sm opacity-80 mt-1">{formatDateRO(result.startDate)} — {formatDateRO(result.endDate)}</div>
            <div className="grid grid-cols-2 gap-2.5 mt-4 bg-black/15 p-4 rounded-2xl text-left">
              <div><div className="text-xs opacity-80">Sume</div><div className="font-semibold">{formatMoney(result.totalDebts)}</div></div>
              <div><div className="text-xs opacity-80">Achitat</div><div className="font-semibold">{formatMoney(result.totalPayments)}</div></div>
              <div><div className="text-xs opacity-80">Zile</div><div className="font-semibold">{result.totalDays}</div></div>
              <div><div className="text-xs opacity-80">%/zi</div><div className="font-semibold">{result.percentDay}%</div></div>
            </div>
          </div>
          <div className="overflow-x-auto bg-[var(--glass-bg)] backdrop-blur-xl rounded-3xl p-6 border border-[var(--glass-border)] shadow-[var(--glass-shadow)]">
            <table className="w-full min-w-[400px] border-collapse text-sm">
              <thead>
                <tr>{['Perioadă', 'Zile', 'Suma', '%/zi', 'Penal.', 'Cum', 'Obs'].map(h => (
                  <th key={h} className="px-2 py-2 bg-[var(--surface-2)] text-[var(--text-muted)] text-center font-semibold text-xs">{h}</th>
                ))}</tr>
              </thead>
              <tbody>
                {result.rows.map((w, i) => {
                  const period = w.b ? (w.z === 1 ? formatDateRO(w.a) : `${formatDateRO(w.a)}-${formatDateRO(w.b)}`) : formatDateRO(w.a);
                  const rc = w.iS ? 'text-amber-600' : w.iP ? 'text-emerald-600' : w.isLimit ? 'text-red-500' : '';
                  return (
                    <tr key={i} className={rc}>
                      <td className="px-2 py-2 border-b border-[var(--border)] text-left text-xs">{period}</td>
                      <td className="px-2 py-2 border-b border-[var(--border)] text-center">{w.z || '-'}</td>
                      <td className="px-2 py-2 border-b border-[var(--border)] text-right">{formatMoney(w.s)}</td>
                      <td className="px-2 py-2 border-b border-[var(--border)] text-center">{w.rt}%</td>
                      <td className="px-2 py-2 border-b border-[var(--border)] text-right">{w.db > 0 ? formatMoney(w.db) : '-'}</td>
                      <td className="px-2 py-2 border-b border-[var(--border)] text-right">{formatMoney(w.c)}</td>
                      <td className="px-2 py-2 border-b border-[var(--border)] text-xs text-[var(--text-muted)]">{w.o}</td>
                    </tr>
                  );
                })}
                <tr className="bg-[var(--surface-2)] font-bold">
                  <td className="px-2 py-2 text-left">TOTAL</td>
                  <td className="px-2 py-2 text-center">{result.totalDays}</td>
                  <td colSpan={3} />
                  <td className="px-2 py-2 text-right">{formatMoney(result.total)}</td>
                  <td />
                </tr>
              </tbody>
            </table>
          </div>
          <div className="flex gap-2 mt-3">
            <button onClick={() => setResult(null)} className="flex-1 py-3 border-2 border-[var(--accent)] rounded-2xl text-[var(--accent)] font-bold hover:bg-[var(--accent-subtle)] transition-all">Ascunde</button>
            <button onClick={handleExportPDF} disabled={pdfLoading} className="flex-1 py-3 rounded-2xl bg-[linear-gradient(135deg,#38bdf8,#3b82f6)] text-white font-bold shadow-[0_10px_20px_rgba(14,165,233,0.2)] hover:-translate-y-0.5 transition-all disabled:opacity-60">{pdfLoading ? 'Generare...' : 'Descarcă PDF'}</button>
          </div>
        </div>
      )}
    </div>
  );
}
