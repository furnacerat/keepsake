type ToggleSwitchProps = {
  checked: boolean;
  description?: string;
  label: string;
  onChange: (checked: boolean) => void;
};

export function ToggleSwitch({ checked, description, label, onChange }: ToggleSwitchProps) {
  return (
    <button
      className="flex w-full items-center justify-between gap-4 rounded-2xl border border-keepsake-roseDeep/10 bg-keepsake-cream px-4 py-3 text-left shadow-soft transition hover:border-keepsake-rose/30"
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
    >
      <span>
        <span className="block text-sm font-bold text-keepsake-ink">{label}</span>
        {description ? (
          <span className="mt-1 block text-sm leading-5 text-keepsake-muted">{description}</span>
        ) : null}
      </span>
      <span
        className={[
          'relative h-7 w-12 shrink-0 rounded-full transition',
          checked ? 'bg-keepsake-roseDeep' : 'bg-keepsake-parchment',
        ].join(' ')}
      >
        <span
          className={[
            'absolute top-1 h-5 w-5 rounded-full bg-white shadow-soft transition',
            checked ? 'left-6' : 'left-1',
          ].join(' ')}
        />
      </span>
    </button>
  );
}
