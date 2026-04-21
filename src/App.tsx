import { useState, useEffect } from 'react';
import { ThemeToggle } from './components/ThemeToggle';
import { CalculatorDobanda } from './components/CalculatorDobanda';
import { CalculatorPenalitate } from './components/CalculatorPenalitate';
import { CalculatorTaxa } from './components/CalculatorTaxa';
import { CalculatorZile } from './components/CalculatorZile';
import { initializeRates } from './utils/bnmRates';

type Tab = 'dobanda' | 'penalitate' | 'taxa' | 'zile';

const TABS: { id: Tab; label: string }[] = [
  { id: 'dobanda', label: 'Dobândă Legală' },
  { id: 'penalitate', label: 'Penalitate' },
  { id: 'taxa', label: 'Taxă de Stat' },
  { id: 'zile', label: 'Calculator Zile' },
];

const GLASS = 'bg-[var(--glass-bg)] backdrop-blur-xl rounded-[var(--radius)] border border-[var(--glass-border)] shadow-[var(--glass-shadow)]';

function App() {
  const [activeTab, setActiveTab] = useState<Tab>('dobanda');
  const [ratesCount, setRatesCount] = useState<number>(0);
  const [ratesStatus, setRatesStatus] = useState<string>('Se încarcă...');
  const [ratesError, setRatesError] = useState<boolean>(false);
  const [bnmLoading, setBnmLoading] = useState(false);

  const loadRates = (force = false) => {
    setBnmLoading(true);
    initializeRates(force).then(result => {
      setRatesCount(result.rates.length);
      setRatesStatus(result.status);
      setRatesError(result.error || false);
      setBnmLoading(false);
    });
  };

  useEffect(() => { loadRates(); }, []);

  return (
    <>
      <ThemeToggle />
      <div className="w-full max-w-[900px] mx-auto my-10 px-4">
        {/* Header */}
        <div className={`${GLASS} p-5 mb-5`}>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold m-0 bg-[linear-gradient(135deg,#38bdf8,#3b82f6)] bg-clip-text text-transparent">CalcJuridic.</h1>
              <div className="text-sm text-[var(--text-muted)] mt-1">myAVVO &mdash; Hub Juridic Moldova</div>
            </div>
            <div className="bg-white/80 dark:bg-black/20 border border-slate-200 dark:border-white/10 px-4 py-2.5 rounded-xl text-sm font-medium text-[var(--text-main)] flex items-center gap-3 shadow-sm transition-all hover:shadow-md">
              <div>
                <div>BNM: <span className="font-bold text-[var(--accent)]">{ratesCount}</span> rate</div>
                <div className={`text-xs mt-0.5 ${ratesError ? 'text-red-500' : 'text-[var(--text-muted)]'}`}>
                  {!ratesError && ratesCount > 0 ? 'Actualizat' : ratesStatus}
                </div>
              </div>
              <button
                onClick={() => loadRates(true)}
                disabled={bnmLoading}
                title="Actualizează rate BNM"
                className="w-9 h-9 rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800 flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--accent)] hover:border-[var(--accent)] hover:shadow-sm transition-all disabled:opacity-50 disabled:cursor-wait"
              >
                <span className={`text-lg ${bnmLoading ? 'animate-spin inline-block' : ''}`}>⟳</span>
              </button>
            </div>
          </div>
        </div>

        {/* Module tabs */}
        <div className={`${GLASS} p-5 mb-5`}>
          <div className="flex flex-wrap gap-2">
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 min-w-[120px] px-5 py-3 rounded-2xl text-center font-medium transition-all cursor-pointer text-sm ${
                  activeTab === tab.id
                    ? 'bg-[linear-gradient(135deg,#38bdf8,#3b82f6)] text-white shadow-[0_4px_15px_rgba(14,165,233,0.3)] border-transparent'
                    : 'bg-[var(--surface-2)] border border-[var(--border)] text-[var(--text-main)] hover:bg-[rgba(255,255,255,0.7)]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Calculator content */}
        <div className={`${GLASS} p-6`}>
          <h2 className="text-xl font-semibold mb-6 text-[var(--text-main)]">Configurează Calculul</h2>

          {activeTab === 'dobanda' && <CalculatorDobanda />}
          {activeTab === 'penalitate' && <CalculatorPenalitate />}
          {activeTab === 'taxa' && <CalculatorTaxa />}
          {activeTab === 'zile' && <CalculatorZile />}
        </div>

        {/* Footer */}
        <div className="text-center text-xs text-[var(--text-muted)] mt-6 pb-6">
          © {new Date().getFullYear()} myAVVO — Hub Juridic Moldova. Conform Codului Civil al RM.
        </div>
      </div>
    </>
  );
}

export default App;
