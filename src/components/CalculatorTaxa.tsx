import { useState } from 'react';
import { StepHeader, CalcButton, RadioGroup } from './FormComponents';
import { formatMoney } from '../utils/helpers';
import { exportTaxaPDF } from '../utils/pdfExport';

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

interface TaxaResult {
  taxa: number;
  info: string;
  explanation: string; // plain text for PDF
  explanationSteps: Step[];
  suma: number;
}

interface Step {
  title: string;
  items: { text: string; bold?: boolean }[];
}

function calcTaxa(
  suma: number,
  person: PersonType,
  instance: number,
  action: ActionType,
  nonPatrimonialVal: number,
  nonPatrimonialLabel: string
): Omit<TaxaResult, 'suma'> {
  const instLabel = instance === 1
    ? 'Fond (prima instanță)'
    : instance === 0.85
      ? 'Apel (85%)'
      : instance === 0.70
        ? 'Recurs (70%)'
        : 'Revizuire (55%)';

  if (action === 'n') {
    const baseTaxa = nonPatrimonialVal;
    const taxa = baseTaxa * instance;
    const steps: Step[] = [
      {
        title: 'Identificarea tipului cererii:',
        items: [
          { text: nonPatrimonialLabel },
          { text: `Taxă fixă stabilită: ${formatMoney(nonPatrimonialVal)} MDL` },
        ],
      },
      {
        title: 'Aplicarea coeficientului de instanță:',
        items: [
          { text: `Instanță: ${instLabel}`, bold: false },
          {
            text: `${formatMoney(nonPatrimonialVal)} MDL × ${instance} = ${formatMoney(taxa)} MDL`,
            bold: true,
          },
        ],
      },
      {
        title: 'Taxa de stat finală:',
        items: [{ text: `${formatMoney(taxa)} MDL`, bold: true }],
      },
    ];

    return {
      taxa,
      info: `Taxa fixă nepatrimonială × ${instance === 1 ? '100%' : `${instance * 100}%`}`,
      explanation: `Cerere: ${nonPatrimonialLabel}\nTaxă fixă: ${formatMoney(nonPatrimonialVal)} MDL\nInstanță factor: ×${instance}\nTotal: ${formatMoney(taxa)} MDL`,
      explanationSteps: steps,
    };
  }

  // ── Patrimonial — Legea taxei de stat Nr. 213 din 31.07.2023 ──
  const minLegal = person === 'f' ? 150 : 250;
  const personLabel = person === 'f' ? 'fizice' : 'juridice';
  
  let rate: number = 0;
  let baseFixed: number = 0;
  let threshold: number = 0;
  let lawRef: string = '';
  let rangeInfo: string = '';

  if (suma <= 5000) {
    rate = 0.05; baseFixed = 0; threshold = 0;
    lawRef = 'pct. 1.1.1';
    rangeInfo = '≤ 5 000 lei (5%)';
  } else if (suma <= 50000) {
    rate = 0.04; baseFixed = 250; threshold = 5001;
    lawRef = 'pct. 1.1.2';
    rangeInfo = '5 001 - 50 000 lei (250 lei + 4%)';
  } else if (suma <= 1500000) {
    rate = 0.03; baseFixed = 2050; threshold = 50001;
    lawRef = 'pct. 1.1.3';
    rangeInfo = '50 001 - 1 500 000 lei (2 050 lei + 3%)';
  } else if (suma <= 5000000) {
    rate = 0.02; baseFixed = 45550; threshold = 1500001;
    lawRef = 'pct. 1.1.4';
    rangeInfo = '1 500 001 - 5 000 000 lei (45 550 lei + 2%)';
  } else if (suma <= 10000000) {
    rate = 0.01; baseFixed = 115550; threshold = 5000001;
    lawRef = 'pct. 1.1.5';
    rangeInfo = '5 000 001 - 10 000 000 lei (115 550 lei + 1%)';
  } else {
    rate = 0.005; baseFixed = 165550; threshold = 10000001;
    lawRef = 'pct. 1.1.6';
    rangeInfo = '≥ 10 000 001 lei (165 550 lei + 0.5%)';
  }

  let baseTaxa: number;
  if (threshold > 0) {
    baseTaxa = baseFixed + rate * (suma - threshold);
  } else {
    baseTaxa = suma * rate;
  }

  // Verification of legal minimum
  let appliedBaseTaxa = baseTaxa;
  const isBelowMin = baseTaxa < minLegal;
  if (isBelowMin) {
    appliedBaseTaxa = minLegal;
  }

  const taxa = appliedBaseTaxa * instance;

  // Build detailed steps
  const steps: Step[] = [
    {
      title: 'Identificarea valorii acțiunii:',
      items: [{ text: `Valoarea acțiunii este de ${formatMoney(suma)} MDL.` }],
    }
  ];

  steps.push({
    title: 'Determinarea pragului de calcul:',
    items: [
      { text: `Conform Legii taxei de stat Nr. 213 din 31.07.2023, ${lawRef}:` },
      { text: `pentru ${rangeInfo}, taxa este calculată conform grilei stabilite.`, bold: true }
    ],
  });

  if (threshold > 0) {
    steps.push({
      title: 'Calculul diferenței:',
      items: [
        { text: `Determinăm cât depășește pragul de ${formatMoney(threshold)} MDL:` },
        { text: `${formatMoney(suma)} MDL − ${formatMoney(threshold)} MDL = ${formatMoney(suma - threshold)} MDL`, bold: true }
      ],
    });

    steps.push({
      title: `Calculul procentului de ${(rate * 100).toFixed(1)}%:`,
      items: [
        { text: `${(rate * 100).toFixed(1)}% × ${formatMoney(suma - threshold)} MDL = ${formatMoney(rate * (suma - threshold))} MDL`, bold: true }
      ],
    });

    steps.push({
      title: 'Adăugarea taxei de bază:',
      items: [
        { text: `Taxa fixă de ${formatMoney(baseFixed)} MDL + cota procentuală:` },
        { text: `${formatMoney(baseFixed)} MDL + ${formatMoney(rate * (suma - threshold))} MDL = ${formatMoney(baseTaxa)} MDL`, bold: true }
      ],
    });
  } else {
    steps.push({
      title: 'Calculul taxei de bază:',
      items: [
        { text: `${formatMoney(suma)} MDL × ${(rate * 100).toFixed(1)}% = ${formatMoney(baseTaxa)} MDL`, bold: true }
      ],
    });
  }

  if (isBelowMin) {
    steps.push({
      title: 'Verificarea minimului legal:',
      items: [
        { text: `Taxa calculată (${formatMoney(baseTaxa)} MDL) este sub minimul legal de ${formatMoney(minLegal)} MDL pentru persoane ${personLabel}.` },
        { text: `Se aplică taxa minimă: ${formatMoney(minLegal)} MDL`, bold: true }
      ],
    });
  }

  if (instance !== 1) {
    steps.push({
      title: 'Aplicarea coeficientului de instanță:',
      items: [
        { text: `Instanță: ${instLabel} (coeficient: ×${instance})` },
        { text: `${formatMoney(appliedBaseTaxa)} MDL × ${instance} = ${formatMoney(taxa)} MDL`, bold: true }
      ],
    });
  }

  steps.push({
    title: 'Taxa de stat finală:',
    items: [{ text: `${formatMoney(taxa)} MDL`, bold: true }],
  });

  return {
    taxa,
    info: `${rangeInfo} ${instance !== 1 ? `× ${instance}` : ''}`,
    explanation: `Valoare: ${formatMoney(suma)} MDL\nPrag: ${rangeInfo}\nTaxă bază: ${formatMoney(baseTaxa)} MDL\nMinim legal: ${minLegal} MDL\nInstanță factor: ×${instance}\nTotal: ${formatMoney(taxa)} MDL`,
    explanationSteps: steps,
  };
}

export function CalculatorTaxa() {
  const [personType, setPersonType] = useState<PersonType>('f');
  const [instance, setInstance] = useState('1');
  const [actionType, setActionType] = useState<ActionType>('p');
  const [suma, setSuma] = useState('');
  const [nonPatrimonialIdx, setNonPatrimonialIdx] = useState(0);
  const [result, setResult] = useState<TaxaResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pdfLoading, setPdfLoading] = useState(false);

  const handleExportPDF = () => {
    if (!result) return;
    setPdfLoading(true);
    try { exportTaxaPDF(result); } catch (e) { console.error(e); } finally { setPdfLoading(false); }
  };

  const calculate = () => {
    setError(null);
    try {
      const instanceNum = parseFloat(instance);
      if (actionType === 'p') {
        const s = parseFloat(suma);
        if (!s || s <= 0) { setError('Introduceți suma acțiunii!'); return; }
        const res = calcTaxa(s, personType, instanceNum, actionType, 0, '');
        setResult({ ...res, suma: s });
      } else {
        const npOpt = NON_PATRIMONIAL_OPTIONS[nonPatrimonialIdx];
        const npVal = parseInt(npOpt.value);
        const res = calcTaxa(0, personType, instanceNum, actionType, npVal, npOpt.label);
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
          {/* Result card */}
          <div className="rounded-2xl p-6 bg-[linear-gradient(135deg,#38bdf8,#3b82f6)] text-white text-center shadow-[0_10px_30px_rgba(14,165,233,0.3)] mb-4">
            <div className="text-xs uppercase tracking-widest font-semibold opacity-90 mb-2">Taxă de stat</div>
            <div className="text-4xl font-bold break-all">{formatMoney(result.taxa)} MDL</div>
            <div className="text-sm opacity-80 mt-2">{result.info}</div>
          </div>

          {/* Detailed explanation */}
          <div className="bg-[var(--glass-bg)] backdrop-blur-xl rounded-3xl p-5 border border-[var(--glass-border)] shadow-[var(--glass-shadow)] mb-3">
            <h3 className="font-bold text-[var(--text-main)] mb-4 text-base">Detalii calcul</h3>
            <div className="space-y-4 text-sm">
              {result?.explanationSteps?.map((step, si) => (
                <div key={si}>
                  <div className="font-bold text-[var(--text-main)] mb-1.5">{step.title}</div>
                  <ul className="space-y-1 pl-1">
                    {step.items?.map((item, ii) => (
                      <li key={ii} className="flex items-start gap-2 text-[var(--text-muted)]">
                        <span className="mt-0.5 text-[var(--accent)] select-none">•</span>
                        {item.bold
                          ? <span className="font-bold text-[var(--text-main)]">{item.text}</span>
                          : <span>{item.text}</span>
                        }
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-2">
            <button onClick={() => setResult(null)} className="flex-1 py-3 border-2 border-[var(--accent)] rounded-2xl text-[var(--accent)] font-bold hover:bg-[var(--accent-subtle)] transition-all">Ascunde</button>
            <button onClick={handleExportPDF} disabled={pdfLoading} className="flex-1 py-3 rounded-2xl bg-[linear-gradient(135deg,#38bdf8,#3b82f6)] text-white font-bold shadow-[0_10px_20px_rgba(14,165,233,0.2)] hover:-translate-y-0.5 transition-all disabled:opacity-60">{pdfLoading ? 'Generare...' : 'Descarcă PDF'}</button>
          </div>
        </div>
      )}
    </div>
  );
}
