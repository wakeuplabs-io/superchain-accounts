import { useSuperChainAccount } from "@/hooks/use-smart-account";
import { Button } from "@/components/ui";
import { shortenAddress } from "@/lib/address";
import { Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export const AccountButton = () => {
  const { account } = useSuperChainAccount();
  const { toast } = useToast();

  return (
    <Button
      variant="secondary"
      onClick={() => {
        navigator.clipboard.writeText(account.address);
        toast({
          title: "Address copied to clipboard",
        });
      }}
      className="flex justify-between items-center bg-[#F7F7F7] py-3"
    >
      <div className="flex items-center gap-2">
        <span className="h-4 w-4 bg-primary rounded-full block"></span>
        <span>{shortenAddress(account.address)}</span>
      </div>
      <Copy className="w-4 h-4"/>
    </Button>
  );
};
