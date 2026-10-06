import type { LucideIcon } from "lucide-react";

type ActionButtonProps = {
  label: string;
  color: string;
  bgColor?: string;
  icon: LucideIcon;
  align?: "center" | "start";
  onClick?: () => void;
};

function ActionButton({
  label,
  color,
  bgColor,
  icon: Icon,
  align = "center",
  onClick,
}: ActionButtonProps) {
  return (
    <div
      className={`flex flex-col gap-2 ${align === "start" ? "items-start" : "items-center"}`}
    >
      <button
        type="button"
        className="btn btn-circle flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-full border-2 bg-focus-void md:h-12 md:w-12 hover:bg-focus-void"
        style={{ borderColor: color, backgroundColor: bgColor, color }}
        onClick={onClick}
      >
        <Icon size={22} strokeWidth={1.8} />
      </button>
      <span className="text-sm text-white/60 hidden md:inline">{label}</span>
    </div>
  );
}

export default ActionButton;
