import type { LucideIcon } from "lucide-react";

type ActionButtonProps = {
  label: string;
  color: string;
  icon: LucideIcon;
  onClick?: () => void;
  active?: boolean;
};

function ActionButton({
  label,
  color,
  icon: Icon,
  onClick,
  active = false,
}: ActionButtonProps) {
  const isInteractive = onClick != null;

  return (
    <div className="flex flex-col items-center gap-2">
      <button
        type="button"
        disabled={!isInteractive}
        onClick={onClick}
        aria-pressed={isInteractive ? active : undefined}
        className={`flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-full border-2 md:h-12 md:w-12 ${
          isInteractive ? "pointer-events-none md:pointer-events-auto" : ""
        }`}
        style={{
          borderColor: color,
          color: active ? "#0D1117" : color,
          backgroundColor: active ? color : "transparent",
        }}
      >
        <Icon size={22} strokeWidth={1.8} fill={active ? "#0D1117" : "none"} />
      </button>
      <span className="text-sm text-white/60">{label}</span>
    </div>
  );
}

export default ActionButton;
