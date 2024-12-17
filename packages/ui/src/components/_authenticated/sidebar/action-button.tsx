import { Button, ButtonProps } from "@/components/ui";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

type ActionButtonProps =  ButtonProps & {
    icon: LucideIcon;
    onClick: () => void;
    className?: string;
}

export const ActionButton: React.FC<ActionButtonProps> = ({ icon: Icon, onClick, className, ...props }: ActionButtonProps) => (
  <Button onClick={onClick} className={cn("w-12 h-12 rounded-xl",className)} size='icon' {...props}>
    <Icon size={24}/>
  </Button>
);

