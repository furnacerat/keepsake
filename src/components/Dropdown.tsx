type DropdownProps = {
  label: string;
  options: string[];
  value: string;
  onChange: (value: string) => void;
};

export function Dropdown({ label, options, value, onChange }: DropdownProps) {
  return (
    <label className="grid gap-2">
      <span className="text-sm font-bold text-keepsake-ink">{label}</span>
      <select
        className="min-h-12 rounded-2xl border border-keepsake-roseDeep/10 bg-keepsake-cream px-4 text-base font-semibold text-keepsake-ink shadow-soft outline-none transition focus:border-keepsake-rose focus:ring-2 focus:ring-keepsake-rose/25"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option || 'None'}
          </option>
        ))}
      </select>
    </label>
  );
}
