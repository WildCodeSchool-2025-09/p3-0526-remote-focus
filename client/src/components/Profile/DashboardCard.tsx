import type { LucideIcon } from "lucide-react";
import { Link } from "react-router";

type DashboardCardProps = {
  icon: LucideIcon;
  label: string;
  count: number;
  to?: string;
};

function DashboardCard({ icon: Icon, label, count, to }: DashboardCardProps) {
  const content = (
    <div className="card bg-base-200 p-6 transition-colors hover:bg-base-300">
      <Icon className="text-primary" size={28} />
      <span className="mt-4 text-3xl font-bold">{count}</span>
      <span className="text-focus-muted-dark text-sm">{label}</span>
      {to == null && (
        <span className="badge badge-sm mt-2 w-fit">Bientôt disponible</span>
      )}
    </div>
  );

  if (to == null) {
    return content;
  }

  return <Link to={to}>{content}</Link>;
}

export default DashboardCard;
