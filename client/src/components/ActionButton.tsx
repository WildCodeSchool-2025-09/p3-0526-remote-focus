import type { LucideIcon } from "lucide-react";

type ActionButtonProps = {
  label: string;
  color: string;
  icon: LucideIcon;
  align?: "center" | "start";
};

function ActionButton({
  label,
  color,
  icon: Icon,
  align = "center",
}: ActionButtonProps) {
  return (
    <div
      className={`flex flex-col gap-2 ${align === "start" ? "items-start" : "items-center"}`}
    >
      <button
        type="button"
        disabled
        className="flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-full border-2 md:h-12 md:w-12"
        style={{ borderColor: color, color }}
      >
        <Icon size={22} strokeWidth={1.8} />
      </button>
      <span className="text-sm text-white/60">{label}</span>
    </div>
  );
}

export default ActionButton;
