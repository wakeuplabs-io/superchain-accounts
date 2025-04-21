import { Button } from "../ui";
import { useRouter } from "@tanstack/react-router";
import { useAuth } from "@/hooks/use-auth";
import { LogOut } from "lucide-react";
import { ConfirmDialog } from "../confirm-dialog";

export function LogoutButton() {
  const router = useRouter();
  const { logout } = useAuth();

  const onLogout = async () => {
    await logout();
    router.history.push("/login");
  };

  return (
    <ConfirmDialog
      title="Log out"
      description="Are you sure you want to log out?"
      onConfirm={onLogout}
    >
      <Button className="flex gap-2 justify-start w-full" variant='ghost'>
        <LogOut className="h-5 w-5" />
          Log out
      </Button>
    </ConfirmDialog>
  );
}