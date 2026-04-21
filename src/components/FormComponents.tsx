import type { ReactNode } from 'react';
import { DatePicker } from './DatePicker';

interface DateInputProps {
  id?: string;
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  label?: string;
}

export function DateInput({ value, onChange, label, placeholder }: DateInputProps) {
  return (
    <DatePicker
      value={value}
      onChange={onChange}
      label={label}
      placeholder={placeholder}
      className="mb-4"
    />
  );
}


interface FormGroupProps {
  label?: string;
  hint?: string;
  children: ReactNode;
  className?: string;
}

export function FormGroup({ label, hint, children, className = '' }: FormGroupProps) {
  return (
    <div className={`mb-4 ${className}`}>
      {label && <label className="block text-sm text-[var(--text-muted)] mb-1.5 font-medium">{label}</label>}
      {children}
      {hint && <div className="text-xs text-[var(--text-muted)] mt-1">{hint}</div>}
    </div>
  );
}

interface NumberInputProps {
  id?: string;
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  label?: string;
  hint?: string;
  step?: string;
  min?: string;
}

export function NumberInput({ id, value, onChange, placeholder, label, hint, step = '0.01', min }: NumberInputProps) {
  return (
    <FormGroup label={label} hint={hint}>
      <input
        id={id}
        type="number"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        step={step}
        min={min}
        className="w-full px-4 py-3 bg-[var(--input-bg)] border border-[var(--input-border)] rounded-xl text-[var(--text-main)] font-inherit text-base transition-all focus:outline-none focus:border-[var(--accent)] focus:shadow-[0_0_0_3px_rgba(14,165,233,0.1)]"
      />
    </FormGroup>
  );
}

interface StepHeaderProps {
  step: string | number;
  title: string;
}

export function StepHeader({ step, title }: StepHeaderProps) {
  return (
    <div className="flex items-center gap-2 mb-3 text-base font-semibold text-[var(--text-main)]">
      <span className="flex items-center justify-center min-w-[24px] h-6 rounded-full bg-[var(--accent-gradient)] text-white text-xs font-bold">{step}</span>
      <span>{title}</span>
    </div>
  );
}

interface CalcButtonProps {
  onClick: () => void;
  children: React.ReactNode;
  variant?: 'primary' | 'outline';
  className?: string;
  type?: 'button' | 'submit';
}

export function CalcButton({ onClick, children, variant = 'primary', className = '', type = 'button' }: CalcButtonProps) {
  if (variant === 'outline') {
    return (
      <button
        type={type}
        onClick={onClick}
        className={`w-full py-3.5 px-4 border-2 border-[var(--accent)] rounded-2xl text-[var(--accent)] text-lg font-bold cursor-pointer transition-all hover:-translate-y-0.5 hover:bg-[var(--accent-subtle)] ${className}`}
      >
        {children}
      </button>
    );
  }
  return (
    <button
      type={type}
      onClick={onClick}
      className={`w-full py-3.5 px-4 border-none rounded-2xl bg-[linear-gradient(135deg,#38bdf8,#3b82f6)] text-white text-lg font-bold cursor-pointer mt-4 shadow-[0_10px_20px_rgba(14,165,233,0.2)] transition-all hover:-translate-y-0.5 hover:shadow-[0_15px_25px_rgba(14,165,233,0.3)] ${className}`}
    >
      {children}
    </button>
  );
}

interface RadioGroupProps {
  name: string;
  options: { value: string; label: string; sublabel?: string }[];
  value: string;
  onChange: (val: string) => void;
}

export function RadioGroup({ name, options, value, onChange }: RadioGroupProps) {
  return (
    <div className="flex flex-row gap-2">
      {options.map(opt => (
        <label key={opt.value} className="relative flex-1 cursor-pointer">
          <input
            type="radio"
            name={name}
            value={opt.value}
            checked={value === opt.value}
            onChange={() => onChange(opt.value)}
            className="absolute opacity-0 w-full h-full cursor-pointer z-10"
          />
          <div className={`block p-3 rounded-xl border-2 text-center transition-all ${value === opt.value ? 'border-[var(--accent)] bg-[var(--accent-subtle)]' : 'border-[var(--border)] bg-[var(--surface-2)]'}`}>
            <span className={`text-lg font-bold block ${value === opt.value ? 'text-[var(--accent)]' : 'text-[var(--text-main)]'}`}>{opt.label}</span>
            {opt.sublabel && <span className="text-xs text-[var(--text-muted)] mt-0.5 block">{opt.sublabel}</span>}
          </div>
        </label>
      ))}
    </div>
  );
}

interface AddItemButtonProps {
  onClick: () => void;
  children: React.ReactNode;
}

export function AddItemButton({ onClick, children }: AddItemButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full py-2.5 px-4 border border-dashed border-[var(--accent)] text-[var(--accent)] bg-[var(--surface-2)] rounded-xl cursor-pointer text-sm font-semibold mt-1.5 text-center hover:bg-[var(--accent-subtle)] transition-colors"
    >
      {children}
    </button>
  );
}
