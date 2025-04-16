import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useWalletConnect } from "@/hooks/use-wallet-connect";
import { useState } from "react";

export const ConnectDialog: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { handleConnect } = useWalletConnect();
  const [input, setInput] = useState("");
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Connect</DialogTitle>
          <DialogDescription>
            Paste connection URI to connect.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <Label htmlFor="link" className="sr-only">
            Link
          </Label>
          <Input onChange={(e) => setInput(e.target.value)} className="h-12" placeholder="wc:..." />
        </div>
        <DialogFooter className="flex flex-col sm:flex-row gap-2 w-full">
          <Button
            type="button"
            disabled={!input}
            onClick={() => handleConnect(input).then(() => setOpen(false))}
          >
            Connect
          </Button>
          <DialogClose asChild>
            <Button type="button" variant="secondary">
              Cancel
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
