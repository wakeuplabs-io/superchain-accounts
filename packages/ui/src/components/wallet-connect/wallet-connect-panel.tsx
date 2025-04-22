import { useSuperChainAccount } from "@/hooks/use-smart-account";
import { useWalletConnect } from "@/hooks/use-wallet-connect";
import { Button } from "../ui";
import { ConnectDialog } from "./connect-dialog";
import { LinkIcon, UnlinkIcon } from "lucide-react";
import { ConfirmDialog } from "../confirm-dialog";
import { useToast } from "@/hooks/use-toast";

export function WalletConnectPanel() {
  const {account} = useSuperChainAccount();
  const {isInitializing, activeSessions, handleDisconnect} = useWalletConnect();
  const {toast} = useToast();

  if(account.status === "pending" || isInitializing) {
    return (
      <Button 
        className="px-6" 
        size="lg" 
        variant="outline" 
        disabled={true}
        loading={true}
      />
    );
  }

  const disconnect = async () => {
    try {
      await handleDisconnect();
      toast({
        title: "Your wallet has been disconnected", 
      });
    } catch (error) {
      console.log(error);
      toast({
        title: "Error disconnecting wallet",
        description: "There was an error disconnecting your wallet",
        variant: "destructive",
      });
    }

  };

  return  Object.entries(activeSessions).length > 0 ? (
    <ConfirmDialog
      title="Disconnect Wallet"
      description="Are you sure you want to disconnect your wallet?"
      onConfirm={disconnect}
    >
      <Button className="gap-2 px-6 group" size='lg' variant='outline'>
        <UnlinkIcon className="h-5 w-5 group-hover:text-primary" />
        <span className="text-base">Disconnect</span>
      </Button>
    </ConfirmDialog>
  ) : (
    <ConnectDialog>
      <Button 
        className="gap-2 px-6 group" 
        size="lg" 
        variant="outline" 
      >
        <LinkIcon className="w-5 h-5 group-hover:text-primary" />
        <span className="text-base">Connect</span>
      </Button>
    </ConnectDialog>
  );
}