import { useRef, useEffect, useState } from 'react';
import { CURRENCIES } from '../utils/helpers';

interface CurrencySelectorProps {
  value: string;
  onChange: (code: string) => void;
}

export function CurrencySelector({ value, onChange }: CurrencySelectorProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const selected = CURRENCIES.find(c => c.code === value) || CURRENCIES[0];

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  return (
    <div ref={ref} className="relative w-full">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full px-4 py-3 rounded-xl border border-[var(--input-border)] bg-[var(--input-bg)] text-[var(--text-main)] cursor-pointer flex items-center justify-between text-left transition-all hover:border-[var(--accent)]"
      >
        <div>
          <span className="text-lg font-bold text-[var(--accent)] block leading-tight">{selected.code}</span>
          <span className="text-xs text-[var(--text-muted)] block mt-0.5">{selected.name}</span>
        </div>
        <span className={`text-xs text-[var(--text-muted)] transition-transform duration-200 ${open ? 'rotate-180' : ''}`}>▾</span>
      </button>
      {open && (
        <div className="absolute top-[calc(100%+4px)] left-0 right-0 bg-[var(--surface)] border border-[var(--border)] rounded-xl shadow-[var(--shadow)] z-50 max-h-64 overflow-y-auto backdrop-blur-xl">
          {CURRENCIES.map(c => (
            <div
              key={c.code}
              onClick={() => { onChange(c.code); setOpen(false); }}
              className={`flex items-center gap-2.5 px-4 py-2.5 cursor-pointer border-b border-[var(--border)] last:border-0 hover:bg-[var(--surface-2)] transition-colors ${value === c.code ? 'bg-[var(--accent-subtle)]' : ''}`}
            >
              <span className="text-sm font-bold text-[var(--accent)] min-w-[38px]">{c.code}</span>
              <span className="text-xs text-[var(--text-muted)]">{c.name}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
