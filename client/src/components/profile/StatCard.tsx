type StatCardProps = {
  label: string;
  value: string;
};

function StatCard({ label, value }: StatCardProps) {
  return (
    <div className="flex flex-1 flex-col items-center gap-2 rounded-lg border border-focus-line/20 bg-base-200 px-6 py-5">
      <span className="text-sm text-focus-muted">{label}</span>
      <span className="text-2xl font-bold">{value}</span>
    </div>
  );
}

export default StatCard;
