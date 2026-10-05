import type { LucideIcon } from "lucide-react";

type ActionButtonProps = {
  label: string;
  icon: LucideIcon;
  buttonClassName: string;
  align?: "center" | "start";
  ariaLabel?: string;
  isPressed?: boolean;
  fillIcon?: boolean;
  onClick?: () => void;
  disabled?: boolean;
};

function ActionButton({
  label,
  icon: Icon,
  buttonClassName,
  align = "center",
  ariaLabel,
  isPressed,
  fillIcon = false,
  onClick,
  disabled = false,
}: ActionButtonProps) {
  return (
    <div
      className={`flex flex-col gap-2 ${
        align === "start" ? "items-start" : "items-center"
      }`}
    >
      <button
        type="button"
        aria-label={ariaLabel ?? label}
        aria-pressed={isPressed}
        disabled={disabled}
        onClick={onClick}
        className={`btn btn-circle bg-focus-void hover:bg-focus-void flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-full border-2 md:h-12 md:w-12 ${buttonClassName}`}
      >
        <Icon
          size={22}
          strokeWidth={1.8}
          fill={fillIcon ? "currentColor" : "none"}
        />
      </button>

      <span className="hidden text-sm text-focus-muted md:inline">{label}</span>
    </div>
  );
}

export default ActionButton;
