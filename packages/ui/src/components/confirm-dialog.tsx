import { useState } from "react";
import { Button } from "./ui";
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";

interface ConfirmDialogProps {
  title: string;
  description: string;
  onConfirm: () => Promise<void>;
  children?: React.ReactNode;
}

export function ConfirmDialog({title, description, onConfirm, children}: ConfirmDialogProps) {
  const [isConfirming, setIsConfirming] = useState(false);
  const [open, setOpen] = useState(false);

  const handleConfirm = async () => {
    try {
      setIsConfirming(true);
      await onConfirm();
    } finally {
      setIsConfirming(false);
      setOpen(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="gap-10">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <span className="text-base">{description}</span>
        <DialogFooter className="w-full flex justify-between gap-3">
          <Button className="sm:w-1/2" onClick={handleConfirm} loading={isConfirming}>Confirm</Button>
          <DialogClose className="sm:w-1/2">
            <Button className="w-full" variant="secondary" >Cancel</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

}