import { useState, useEffect } from 'react';
import { DateInput, CalcButton } from './FormComponents';
import { parseDateRO, formatDateRO, addDays, diffDays } from '../utils/helpers';
import { exportZilePDF } from '../utils/pdfExport';

type Mode = 'dd' | 'dz';

function isWeekend(d: Date): boolean {
  const day = d.getDay();
  return day === 0 || day === 6;
}

function countWorkdays(start: Date, end: Date): number {
  let count = 0;
  let cur = new Date(start);
  while (cur <= end) {
    if (!isWeekend(cur)) count++;
    cur = addDays(cur, 1);
  }
  return count;
}

interface ZileResult {
  totalDays: number;
  workDays: number;
  years: number;
  months: number;
  weeks: number;
  remainingDays: number;
  startDate: Date;
  endDate: Date;
  period: string;
}

export function CalculatorZile() {
  const [mode, setMode] = useState<Mode>('dd');
  const [startDate, setStartDate] = useState('');
  const [useToday, setUseToday] = useState(false);
  const [endDate, setEndDate] = useState('');
  const [useEndToday, setUseEndToday] = useState(false);
  const [addYears, setAddYears] = useState('');
  const [addMonths, setAddMonths] = useState('');
  const [addDaysVal, setAddDaysVal] = useState('');
  const [includeFirst, setIncludeFirst] = useState(false);
  const [includeLast, setIncludeLast] = useState(true);
  const [result, setResult] = useState<ZileResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [todayStr, setTodayStr] = useState('');

  useEffect(() => {
    const today = new Date();
    setTodayStr(formatDateRO(today));
  }, []);

  const calculate = () => {
    setError(null);
    try {
      const sDate = useToday ? new Date() : parseDateRO(startDate);
      if (isNaN(sDate.getTime())) { setError('Introduceți o dată de început validă!'); return; }

      let eDate: Date;
      if (mode === 'dd') {
        eDate = useEndToday ? new Date() : parseDateRO(endDate);
        if (isNaN(eDate.getTime())) { setError('Introduceți o dată de sfârșit validă!'); return; }
        if (eDate < sDate) { setError('Data de sfârșit trebuie să fie după data de început!'); return; }
      } else {
        // Add years, months, days
        eDate = new Date(sDate);
        const y = parseInt(addYears) || 0;
        const m = parseInt(addMonths) || 0;
        const d = parseInt(addDaysVal) || 0;
        eDate.setFullYear(eDate.getFullYear() + y);
        eDate.setMonth(eDate.getMonth() + m);
        eDate.setDate(eDate.getDate() + d);
      }

      const actualStart = includeFirst ? sDate : addDays(sDate, 1);
      const actualEnd = includeLast ? eDate : addDays(eDate, -1);

      if (actualStart > actualEnd) { setError('Intervalul de calcul este invalid cu opțiunile selectate!'); return; }

      const total = diffDays(actualStart, actualEnd) + 1;
      const workdays = countWorkdays(actualStart, actualEnd);

      // Decompose
      const years = Math.floor(total / 365);
      const remaining = total - years * 365;
      const months = Math.floor(remaining / 30);
      const weeks = Math.floor((remaining - months * 30) / 7);
      const remainingDays = remaining - months * 30 - weeks * 7;

      const period = `${formatDateRO(actualStart)} — ${formatDateRO(actualEnd)}`;

      setResult({ totalDays: total, workDays: workdays, years, months, weeks, remainingDays, startDate: actualStart, endDate: actualEnd, period });
    } catch {
      setError('A apărut o eroare la calculare. Verificați datele introduse.');
    }
  };

  return (
    <div>
      {error && <div className="mb-4 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-500 font-medium text-sm">{error}</div>}

      {/* Mode tabs */}
      <div className="flex gap-2 mb-6">
        {[{ id: 'dd' as Mode, label: 'Data → Data' }, { id: 'dz' as Mode, label: 'Data + Zile' }].map(m => (
          <button
            key={m.id}
            onClick={() => setMode(m.id)}
            className={`flex-1 py-3 rounded-xl font-medium text-sm transition-all cursor-pointer ${mode === m.id ? 'bg-[var(--accent-subtle)] border-[var(--accent)] text-[var(--accent)] border' : 'bg-[var(--surface-2)] border border-[var(--border)] text-[var(--text-muted)]'}`}
          >
            {m.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
        {/* Start date */}
        <div className="bg-[var(--surface-2)] rounded-xl p-4 border border-[var(--border)]">
          <div className="font-semibold text-[var(--text-main)] mb-3 pb-2 border-b border-[var(--border)]">Data început</div>
          <label className="flex items-center gap-2 mb-2 cursor-pointer">
            <input type="radio" name="startType" checked={!useToday} onChange={() => { setUseToday(false); }} className="accent-[var(--accent)]" />
            <span className="text-sm text-[var(--text-main)]">Selectează:</span>
          </label>
          <DateInput value={startDate} onChange={v => { setStartDate(v); setUseToday(false); }} />
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="radio" name="startType" checked={useToday} onChange={() => setUseToday(true)} className="accent-[var(--accent)]" />
            <span className="text-sm text-[var(--text-main)]">Azi ({todayStr})</span>
          </label>
        </div>

        {/* End date or duration */}
        <div className="bg-[var(--surface-2)] rounded-xl p-4 border border-[var(--border)]">
          <div className="font-semibold text-[var(--text-main)] mb-3 pb-2 border-b border-[var(--border)]">
            {mode === 'dd' ? 'Data sfârșit' : 'Durată'}
          </div>
          {mode === 'dd' ? (
            <>
              <label className="flex items-center gap-2 mb-2 cursor-pointer">
                <input type="radio" name="endType" checked={!useEndToday} onChange={() => setUseEndToday(false)} className="accent-[var(--accent)]" />
                <span className="text-sm text-[var(--text-main)]">Selectează:</span>
              </label>
              <DateInput value={endDate} onChange={v => { setEndDate(v); setUseEndToday(false); }} />
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="endType" checked={useEndToday} onChange={() => setUseEndToday(true)} className="accent-[var(--accent)]" />
                <span className="text-sm text-[var(--text-main)]">Azi ({todayStr})</span>
              </label>
            </>
          ) : (
            <div className="flex flex-col gap-2">
              {[{ label: 'Nr. ani:', val: addYears, set: setAddYears }, { label: 'Nr. luni:', val: addMonths, set: setAddMonths }, { label: 'Nr. zile:', val: addDaysVal, set: setAddDaysVal }].map(f => (
                <div key={f.label}>
                  <label className="block text-xs text-[var(--text-muted)] mb-1">{f.label}</label>
                  <input type="number" value={f.val} onChange={e => f.set(e.target.value)} placeholder="0" min="0" className="w-full px-3 py-2 bg-[var(--input-bg)] border border-[var(--input-border)] rounded-lg text-[var(--text-main)] text-sm focus:outline-none focus:border-[var(--accent)]" />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Options */}
      <div className="mb-5 p-4 bg-[var(--surface-2)] rounded-xl border border-[var(--border)]">
        <div className="text-sm font-medium text-[var(--text-main)] mb-3">Opțiuni:</div>
        <div className="flex flex-wrap gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={includeFirst} onChange={e => setIncludeFirst(e.target.checked)} className="w-4 h-4 accent-[var(--accent)]" />
            <span className="text-sm text-[var(--text-main)]">Include prima zi</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={includeLast} onChange={e => setIncludeLast(e.target.checked)} className="w-4 h-4 accent-[var(--accent)]" />
            <span className="text-sm text-[var(--text-main)]">Include ultima zi</span>
          </label>
        </div>
      </div>

      <CalcButton onClick={calculate}>Calculează</CalcButton>

      {result && (
        <div className="mt-6">
          <div className="rounded-2xl p-6 bg-[linear-gradient(135deg,#38bdf8,#3b82f6)] text-white text-center shadow-[0_10px_30px_rgba(14,165,233,0.3)] mb-4">
            <div className="text-5xl font-bold">{result.totalDays}</div>
            <div className="text-lg opacity-90 mt-1">zile totale</div>
            <div className="text-sm opacity-80 mt-1">{result.workDays} lucrătoare</div>
            <div className="text-xs opacity-75 mt-1">{result.period}</div>
            <div className="grid grid-cols-4 gap-2 mt-4 bg-black/15 p-4 rounded-2xl">
              {[
                { n: result.years, l: 'Ani' },
                { n: result.months, l: 'Luni' },
                { n: result.weeks, l: 'Săpt' },
                { n: result.remainingDays, l: 'Zile' },
              ].map(item => (
                <div key={item.l} className="text-center">
                  <div className="text-xl font-bold">{item.n}</div>
                  <div className="text-xs opacity-80 mt-0.5">{item.l}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setResult(null)} className="flex-1 py-3 border-2 border-[var(--accent)] rounded-2xl text-[var(--accent)] font-bold hover:bg-[var(--accent-subtle)] transition-all">Ascunde</button>
            <button onClick={() => exportZilePDF(result)} className="flex-1 py-3 rounded-2xl bg-[linear-gradient(135deg,#38bdf8,#3b82f6)] text-white font-bold shadow-[0_10px_20px_rgba(14,165,233,0.2)] hover:-translate-y-0.5 transition-all">Descarcă PDF</button>
          </div>
        </div>
      )}
    </div>
  );
}
