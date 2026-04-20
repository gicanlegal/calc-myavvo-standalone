import React, { useState } from 'react';
import { StepHeader, CalcButton, RadioGroup } from './FormComponents';
import { formatMoney } from '../utils/helpers';

type PersonType = 'f' | 'j';
type ActionType = 'p' | 'n';

const NON_PATRIMONIAL_OPTIONS = [
  { value: '250', label: 'Cereri cu caracter nepatrimonial — 250 lei' },
  { value: '500', label: 'Desfacerea căsătoriei — 500 lei' },
  { value: '200', label: 'Stabilirea domiciliului copilului minor — 200 lei' },
  { value: '250', label: 'Apărarea onoarei și demnității — 250 lei' },
  { value: '250', label: 'Contestarea actelor executorului judecătoresc — 250 lei' },
  { value: '250', label: 'Suspendarea executării — 250 lei' },
  { value: '1000', label: 'Intentarea procesului de insolvabilitate — 1000 lei' },
  { value: '250', label: 'Cauze cu procedură specială — 250 lei' },
  { value: '500', label: 'Confirmarea tranzacției extrajudiciare — 500 lei' },
  { value: '250', label: 'Recunoaștere/executare/desființare hotărâre arbitrală — 250 lei' },
];

function calcTaxa(suma: number, person: PersonType, instance: number, action: ActionType, nonPatrimonialVal: number): { taxa: number; info: string; explanation: string } {
  if (action === 'n') {
    const taxa = nonPatrimonialVal * instance;
    return { taxa, info: `Taxa fixă nepatrimonială × ${instance === 1 ? '100%' : `${instance * 100}%`}`, explanation: `Taxă de stat fixă: ${formatMoney(nonPatrimonialVal)} MDL × ${instance} = ${formatMoney(taxa)} MDL` };
  }

  // Patrimonial - Conform Legii nr. 1216/1992
  let rate: number;
  let baseInfo: string;

  if (person === 'f') {
    // Persoane fizice
    if (suma <= 5000) { rate = 0.03; baseInfo = '3% din valoarea acțiunii'; }
    else if (suma <= 10000) { rate = 0.025; baseInfo = '2.5% din valoarea acțiunii'; }
    else if (suma <= 50000) { rate = 0.02; baseInfo = '2% din valoarea acțiunii'; }
    else if (suma <= 100000) { rate = 0.015; baseInfo = '1.5% din valoarea acțiunii'; }
    else if (suma <= 500000) { rate = 0.01; baseInfo = '1% din valoarea acțiunii'; }
    else { rate = 0.005; baseInfo = '0.5% din valoarea acțiunii'; }
  } else {
    // Persoane juridice
    if (suma <= 5000) { rate = 0.05; baseInfo = '5% din valoarea acțiunii'; }
    else if (suma <= 10000) { rate = 0.04; baseInfo = '4% din valoarea acțiunii'; }
    else if (suma <= 50000) { rate = 0.03; baseInfo = '3% din valoarea acțiunii'; }
    else if (suma <= 100000) { rate = 0.025; baseInfo = '2.5% din valoarea acțiunii'; }
    else if (suma <= 500000) { rate = 0.02; baseInfo = '2% din valoarea acțiunii'; }
    else { rate = 0.015; baseInfo = '1.5% din valoarea acțiunii'; }
  }

  const baseTaxa = suma * rate;
  const taxa = baseTaxa * instance;
  const instInfo = instance === 1 ? '(Fond 100%)' : `(instanță: ×${instance})`;

  return {
    taxa,
    info: `${baseInfo} ${instInfo}`,
    explanation: `Valoare: ${formatMoney(suma)} MDL\nRată: ${baseInfo}\nTaxă bază: ${formatMoney(baseTaxa)} MDL\nInstanță factor: ×${instance}\nTotal: ${formatMoney(taxa)} MDL`
  };
}

export function CalculatorTaxa() {
  const [personType, setPersonType] = useState<PersonType>('f');
  const [instance, setInstance] = useState('1');
  const [actionType, setActionType] = useState<ActionType>('p');
  const [suma, setSuma] = useState('');
  const [nonPatrimonialIdx, setNonPatrimonialIdx] = useState(0);
  const [result, setResult] = useState<{ taxa: number; info: string; explanation: string; suma: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const calculate = () => {
    setError(null);
    try {
      const instanceNum = parseFloat(instance);
      if (actionType === 'p') {
        const s = parseFloat(suma);
        if (!s || s <= 0) { setError('Introduceți suma acțiunii!'); return; }
        const res = calcTaxa(s, personType, instanceNum, actionType, 0);
        setResult({ ...res, suma: s });
      } else {
        const npVal = parseInt(NON_PATRIMONIAL_OPTIONS[nonPatrimonialIdx].value);
        const res = calcTaxa(0, personType, instanceNum, actionType, npVal);
        setResult({ ...res, suma: 0 });
      }
    } catch {
      setError('A apărut o eroare la calculare.');
    }
  };

  return (
    <div>
      {error && <div className="mb-4 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-500 font-medium text-sm">{error}</div>}

      <div className="mb-5">
        <StepHeader step="1" title="Tip persoană" />
        <RadioGroup name="tp" value={personType} onChange={v => setPersonType(v as PersonType)}
          options={[{ value: 'f', label: 'Fizică' }, { value: 'j', label: 'Juridică' }]} />
      </div>

      <div className="mb-5">
        <StepHeader step="2" title="Instanță" />
        <div className="flex flex-wrap gap-2">
          {[{ v: '1', l: 'Fond', s: '100%' }, { v: '0.85', l: 'Apel', s: '85%' }, { v: '0.70', l: 'Recurs', s: '70%' }, { v: '0.55', l: 'Revizuire', s: '55%' }].map(o => (
            <label key={o.v} className="relative flex-1 min-w-[70px] cursor-pointer">
              <input type="radio" name="inst" value={o.v} checked={instance === o.v} onChange={() => setInstance(o.v)} className="absolute opacity-0 w-full h-full cursor-pointer z-10" />
              <div className={`block p-3 rounded-xl border-2 text-center transition-all ${instance === o.v ? 'border-[var(--accent)] bg-[var(--accent-subtle)]' : 'border-[var(--border)] bg-[var(--surface-2)]'}`}>
                <span className={`text-base font-bold block ${instance === o.v ? 'text-[var(--accent)]' : 'text-[var(--text-main)]'}`}>{o.l}</span>
                <span className="text-xs text-[var(--text-muted)] mt-0.5 block">{o.s}</span>
              </div>
            </label>
          ))}
        </div>
      </div>

      <div className="mb-5">
        <StepHeader step="3" title="Tip acțiune" />
        <RadioGroup name="ta" value={actionType} onChange={v => setActionType(v as ActionType)}
          options={[{ value: 'p', label: 'Patrimonială' }, { value: 'n', label: 'Nepatrimonială' }]} />
      </div>

      {actionType === 'p' ? (
        <div className="mb-5">
          <StepHeader step="4" title="Valoare" />
          <div className="mb-4">
            <label className="block text-sm text-[var(--text-muted)] mb-1.5 font-medium">Suma MDL:</label>
            <input
              type="number"
              value={suma}
              onChange={e => setSuma(e.target.value)}
              placeholder="100000"
              step="0.01"
              className="w-full px-4 py-3 bg-[var(--input-bg)] border border-[var(--input-border)] rounded-xl text-[var(--text-main)] text-base transition-all focus:outline-none focus:border-[var(--accent)] focus:shadow-[0_0_0_3px_rgba(14,165,233,0.1)]"
            />
          </div>
        </div>
      ) : (
        <div className="mb-5">
          <StepHeader step="4" title="Tip cerere" />
          <select
            value={nonPatrimonialIdx}
            onChange={e => setNonPatrimonialIdx(parseInt(e.target.value))}
            className="w-full px-4 py-3 bg-[var(--input-bg)] border border-[var(--input-border)] rounded-xl text-[var(--text-main)] text-sm transition-all focus:outline-none focus:border-[var(--accent)]"
          >
            {NON_PATRIMONIAL_OPTIONS.map((o, i) => (
              <option key={i} value={i}>{o.label}</option>
            ))}
          </select>
        </div>
      )}

      <CalcButton onClick={calculate}>Calculează Taxă</CalcButton>

      {result && (
        <div className="mt-6">
          <div className="rounded-2xl p-6 bg-[linear-gradient(135deg,#38bdf8,#3b82f6)] text-white text-center shadow-[0_10px_30px_rgba(14,165,233,0.3)] mb-4">
            <div className="text-xs uppercase tracking-widest font-semibold opacity-90 mb-2">Taxă de stat</div>
            <div className="text-4xl font-bold break-all">{formatMoney(result.taxa)} MDL</div>
            <div className="text-sm opacity-80 mt-2">{result.info}</div>
          </div>
          <div className="bg-[var(--glass-bg)] backdrop-blur-xl rounded-3xl p-6 border border-[var(--glass-border)] shadow-[var(--glass-shadow)]">
            <h3 className="font-semibold text-[var(--text-main)] mb-3">Detalii calcul</h3>
            <pre className="text-sm text-[var(--text-muted)] leading-relaxed whitespace-pre-line">{result.explanation}</pre>
          </div>
          <div className="flex gap-2 mt-3">
            <button onClick={() => setResult(null)} className="flex-1 py-3 border-2 border-[var(--accent)] rounded-2xl text-[var(--accent)] font-bold hover:bg-[var(--accent-subtle)] transition-all">Ascunde</button>
            <button className="flex-1 py-3 rounded-2xl bg-[linear-gradient(135deg,#38bdf8,#3b82f6)] text-white font-bold shadow-[0_10px_20px_rgba(14,165,233,0.2)] hover:-translate-y-0.5 transition-all">Descarcă PDF</button>
          </div>
        </div>
      )}
    </div>
  );
}
