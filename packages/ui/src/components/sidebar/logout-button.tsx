import { Dialog, DialogClose, DialogContent, DialogTitle, DialogTrigger, DialogFooter, DialogHeader } from "@/components/ui/dialog";
import { Button } from "../ui";
import { useRouter } from "@tanstack/react-router";
import { useAuth } from "@/hooks/use-auth";
import { LogOut } from "lucide-react";
import { useState } from "react";

export function LogoutButton() {
  const router = useRouter();
  const { logout } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const onLogout = async () => {
    try {
      setIsLoggingOut(true);
      await logout();
      router.history.push("/login");
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger className="w-full">
        <Button className="flex gap-2 justify-start w-full" variant='ghost'>
          <LogOut className="h-5 w-5" />
          Log out
        </Button>
      </DialogTrigger>
      <DialogContent className="gap-10">
        <DialogHeader>
          <DialogTitle>Log out</DialogTitle>
        </DialogHeader>
        <span className="text-base">Are you sure you want to log out?</span>
        <DialogFooter className="w-full flex justify-between gap-3">
          <Button className="sm:w-1/2" onClick={onLogout} loading={isLoggingOut}>Confirm</Button>
          <DialogClose className="sm:w-1/2">
            <Button className="w-full" variant="secondary" >Cancel</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}