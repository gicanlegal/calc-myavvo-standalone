import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Calendar, X, ChevronLeft, ChevronRight } from 'lucide-react';

const MONTHS_RO = [
  'Ianuarie', 'Februarie', 'Martie', 'Aprilie', 'Mai', 'Iunie',
  'Iulie', 'August', 'Septembrie', 'Octombrie', 'Noiembrie', 'Decembrie'
];
const DAYS_RO = ['Lu', 'Ma', 'Mi', 'Jo', 'Vi', 'Sâ', 'Du'];

function parseInput(val: string): Date | null {
  // Accept dd/mm/yyyy or dd.mm.yyyy
  const m = val.match(/^(\d{1,2})[\/\.](\d{1,2})[\/\.](\d{4})$/);
  if (!m) return null;
  const d = new Date(parseInt(m[3]), parseInt(m[2]) - 1, parseInt(m[1]));
  if (isNaN(d.getTime())) return null;
  return d;
}

function dateToInput(d: Date): string {
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  return `${dd}/${mm}/${d.getFullYear()}`;
}

function autoFormatInput(raw: string): string {
  const digits = raw.replace(/\D/g, '');
  if (digits.length === 0) return '';
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return digits.slice(0, 2) + '/' + digits.slice(2);
  return digits.slice(0, 2) + '/' + digits.slice(2, 4) + '/' + digits.slice(4, 8);
}

function getMonthDays(year: number, month: number): (Date | null)[] {
  const first = new Date(year, month, 1);
  // Monday = 0 offset
  let startDow = first.getDay() - 1;
  if (startDow < 0) startDow = 6;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (Date | null)[] = [];
  for (let i = 0; i < startDow; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));
  return cells;
}

interface DatePickerProps {
  value: string;
  onChange: (val: string) => void;
  label?: string;
  placeholder?: string;
  className?: string;
}

export function DatePicker({ value, onChange, label, placeholder = 'zz/ll/aaaa', className = '' }: DatePickerProps) {
  const [open, setOpen] = useState(false);
  const [inputVal, setInputVal] = useState(value);
  const [viewYear, setViewYear] = useState(() => new Date().getFullYear());
  const [viewMonth, setViewMonth] = useState(() => new Date().getMonth());
  const ref = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync external value → local input
  useEffect(() => {
    setInputVal(value);
  }, [value]);

  // Sync viewYear/Month when calendar opens or when value changes
  useEffect(() => {
    if (value) {
      const d = parseInput(value);
      if (d) {
        setViewYear(d.getFullYear());
        setViewMonth(d.getMonth());
      }
    }
  }, [open, value]);

  // Close on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = autoFormatInput(e.target.value);
    setInputVal(formatted);
    onChange(formatted);
    // If valid date → update calendar view
    const d = parseInput(formatted);
    if (d) {
      setViewYear(d.getFullYear());
      setViewMonth(d.getMonth());
    }
  };

  const handleDayClick = (d: Date) => {
    const str = dateToInput(d);
    setInputVal(str);
    onChange(str);
    setOpen(false);
  };

  const handleToday = () => {
    const str = dateToInput(new Date());
    setInputVal(str);
    onChange(str);
    setOpen(false);
  };

  const handleClear = () => {
    setInputVal('');
    onChange('');
    inputRef.current?.focus();
  };

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  };

  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  };

  const cells = getMonthDays(viewYear, viewMonth);
  const selectedDate = parseInput(value);
  const today = new Date();

  const isSameDay = (a: Date, b: Date) =>
    a.getDate() === b.getDate() && a.getMonth() === b.getMonth() && a.getFullYear() === b.getFullYear();

  return (
    <div ref={ref} className={`relative ${className}`}>
      {label && (
        <label className="block text-sm text-[var(--text-muted)] mb-1.5 font-medium">{label}</label>
      )}
      <div className="relative flex items-center">
        <input
          ref={inputRef}
          type="text"
          value={inputVal}
          onChange={handleInputChange}
          placeholder={placeholder}
          inputMode="numeric"
          maxLength={10}
          className="w-full pl-4 pr-[72px] py-3 bg-[var(--input-bg)] border border-[var(--input-border)] rounded-xl text-[var(--text-main)] text-base transition-all focus:outline-none focus:border-[var(--accent)] focus:shadow-[0_0_0_3px_rgba(14,165,233,0.1)]"
        />
        <div className="absolute right-2 flex items-center gap-1">
          {inputVal && (
            <button
              type="button"
              onClick={handleClear}
              className="w-6 h-6 flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors rounded"
              tabIndex={-1}
            >
              <X size={13} />
            </button>
          )}
          <button
            type="button"
            onClick={() => setOpen(o => !o)}
            className={`w-7 h-7 flex items-center justify-center rounded-lg border transition-all ${open ? 'border-[var(--accent)] bg-[var(--accent-subtle)] text-[var(--accent)]' : 'border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--accent)] hover:border-[var(--accent)]'}`}
            tabIndex={-1}
          >
            <Calendar size={14} />
          </button>
        </div>
      </div>

      {/* Calendar Popup */}
      {open && (
        <div className="absolute top-[calc(100%+6px)] left-0 z-[200] bg-white dark:bg-slate-900 border border-[var(--border)] rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.15)] p-3 min-w-[260px]">
          {/* Month navigation */}
          <div className="flex items-center justify-between mb-3">
            <button
              type="button"
              onClick={prevMonth}
              className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-[var(--surface-2)] text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors"
            >
              <ChevronLeft size={15} />
            </button>
            <div className="flex gap-1.5 items-center">
              {/* Month select */}
              <select
                value={viewMonth}
                onChange={e => setViewMonth(Number(e.target.value))}
                className="bg-[var(--surface-2)] border border-[var(--border)] rounded-lg px-2 py-1 text-xs font-semibold text-[var(--text-main)] cursor-pointer focus:outline-none focus:border-[var(--accent)]"
              >
                {MONTHS_RO.map((m, i) => <option key={i} value={i}>{m}</option>)}
              </select>
              {/* Year select */}
              <select
                value={viewYear}
                onChange={e => setViewYear(Number(e.target.value))}
                className="bg-[var(--surface-2)] border border-[var(--border)] rounded-lg px-2 py-1 text-xs font-semibold text-[var(--text-main)] cursor-pointer focus:outline-none focus:border-[var(--accent)]"
              >
                {Array.from({ length: 50 }, (_, i) => today.getFullYear() - 40 + i).map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
            <button
              type="button"
              onClick={nextMonth}
              className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-[var(--surface-2)] text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors"
            >
              <ChevronRight size={15} />
            </button>
          </div>

          {/* Days header */}
          <div className="grid grid-cols-7 mb-1">
            {DAYS_RO.map(d => (
              <div key={d} className="text-center text-[10px] font-semibold text-[var(--text-muted)] py-1">{d}</div>
            ))}
          </div>

          {/* Day cells */}
          <div className="grid grid-cols-7 gap-0.5">
            {cells.map((day, i) => {
              if (!day) return <div key={i} />;
              const isSelected = selectedDate && isSameDay(day, selectedDate);
              const isToday = isSameDay(day, today);
              const isWeekend = day.getDay() === 0 || day.getDay() === 6;
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleDayClick(day)}
                  className={`
                    w-full aspect-square flex items-center justify-center rounded-lg text-xs font-medium transition-all
                    ${isSelected
                      ? 'bg-[var(--accent)] text-white shadow-md'
                      : isToday
                        ? 'border border-[var(--accent)] text-[var(--accent)] font-bold'
                        : isWeekend
                          ? 'text-[var(--text-muted)] hover:bg-[var(--surface-2)]'
                          : 'text-[var(--text-main)] hover:bg-[var(--surface-2)]'
                    }
                  `}
                >
                  {day.getDate()}
                </button>
              );
            })}
          </div>

          {/* Azi button */}
          <div className="mt-2.5 pt-2 border-t border-[var(--border)]">
            <button
              type="button"
              onClick={handleToday}
              className="w-full py-2 rounded-xl bg-[var(--accent-subtle)] border border-[var(--accent)]/30 text-[var(--accent)] text-xs font-bold hover:bg-[var(--accent)] hover:text-white transition-all"
            >
              📅 Azi — {dateToInput(today)}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
