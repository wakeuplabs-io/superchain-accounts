import clsx from "clsx";
import { LucideIcon } from "lucide-react";
import { ButtonHTMLAttributes } from "react";

interface ActionButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    icon: LucideIcon
    text: string
    onClick: () => void
    className?: string
}

export const ActionButton = ({ text, icon: Icon, className, onClick }: ActionButtonProps) => {
  return (
    <button
      onClick={onClick}
      className={clsx("flex items-center justify-center gap-2 rounded-xl text-custom-slate-300 border border-custom-gray-200 hover:bg-gray-50 py-3 px-7", className)} >
      <Icon className="w-5 h-5" />
      <span className="text-base">{text}</span>
    </button>
  );
};
