type SettingsRowProps = {
  label: string;
  value: string;
  onEdit?: () => void;
};

function SettingsRow({ label, value, onEdit }: SettingsRowProps) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-base-300 py-3 last:border-b-0">
      <div>
        <p className="text-focus-muted-dark text-sm">{label}</p>
        <p className="font-medium">{value}</p>
      </div>
      <button
        type="button"
        className="btn btn-ghost btn-sm"
        onClick={onEdit}
        disabled={onEdit == null}
      >
        Modifier
      </button>
    </div>
  );
}

export default SettingsRow;
