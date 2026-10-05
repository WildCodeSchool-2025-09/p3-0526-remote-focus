import type { LucideIcon } from "lucide-react";
import { Link } from "react-router";

type DashboardCardProps = {
  to: string;
  icon: LucideIcon;
  iconColor: string;
  iconFilled?: boolean;
  title: string;
  subtitle: string;
};

function DashboardCard({
  to,
  icon: Icon,
  iconColor,
  iconFilled = false,
  title,
  subtitle,
}: DashboardCardProps) {
  return (
    <Link
      to={to}
      className="flex flex-col gap-3 rounded-lg border border-white/10 bg-base-200 p-4 transition-colors hover:border-white/30"
    >
      <span
        className="flex h-9 w-9 items-center justify-center rounded-lg"
        style={{ backgroundColor: `${iconColor}33`, color: iconColor }}
      >
        <Icon size={18} fill={iconFilled ? iconColor : "none"} />
      </span>

      <div className="flex flex-col gap-0.5">
        <span className="font-semibold">{title}</span>
        <span className="text-sm text-focus-muted">{subtitle}</span>
      </div>
    </Link>
  );
}

export default DashboardCard;
