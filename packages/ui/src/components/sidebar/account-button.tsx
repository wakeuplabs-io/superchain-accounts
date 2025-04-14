import { useAuth } from "@/hooks/use-auth";
import { useSuperChainAccount } from "@/hooks/use-smart-account";
import { useRouter } from "@tanstack/react-router";
import { Button } from "../ui";
import { shortenAddress } from "@/lib/address";
import { LogOut } from "lucide-react";

export const AccountButton = () => {
  const router = useRouter();

  const { logout } = useAuth();
  const { account } = useSuperChainAccount();

  const onLogout = async () => {
    await logout();
    router.history.push("/login");
  };

  return (
    <Button
      variant="secondary"
      onClick={onLogout}
      className="flex justify-between items-center bg-[#F7F7F7] py-3"
    >
      <div className="flex items-center gap-2">
        <span className="h-4 w-4 bg-primary rounded-full block"></span>
        <span>{shortenAddress(account.address)}</span>
      </div>
      <LogOut className="w-4 h-4" />
    </Button>
  );
};
