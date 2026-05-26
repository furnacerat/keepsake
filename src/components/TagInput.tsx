import { X } from 'lucide-react';
import { useState } from 'react';
import type { FormEvent } from 'react';

type TagInputProps = {
  label: string;
  placeholder: string;
  values: string[];
  onChange: (values: string[]) => void;
};

export function TagInput({ label, placeholder, values, onChange }: TagInputProps) {
  const [input, setInput] = useState('');

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextValue = input.trim();

    if (!nextValue || values.includes(nextValue)) {
      setInput('');
      return;
    }

    onChange([...values, nextValue]);
    setInput('');
  }

  return (
    <div className="grid gap-2">
      <span className="text-sm font-bold text-keepsake-ink">{label}</span>
      <form className="flex gap-2" onSubmit={handleSubmit}>
        <input
          className="min-h-11 min-w-0 flex-1 rounded-2xl border border-keepsake-roseDeep/10 bg-keepsake-cream px-4 text-sm font-semibold text-keepsake-ink shadow-soft outline-none focus:border-keepsake-rose focus:ring-2 focus:ring-keepsake-rose/25"
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder={placeholder}
        />
        <button className="ks-button-primary px-4 text-sm font-extrabold" type="submit">
          Add
        </button>
      </form>

      {values.length === 0 ? (
        <p className="text-sm text-keepsake-muted">None yet</p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {values.map((value) => (
            <button
              className="inline-flex items-center gap-1 rounded-full bg-keepsake-blush px-3 py-1 text-sm font-bold text-keepsake-accentStrong"
              key={value}
              type="button"
              onClick={() => onChange(values.filter((item) => item !== value))}
            >
              {value}
              <X size={13} aria-hidden="true" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
