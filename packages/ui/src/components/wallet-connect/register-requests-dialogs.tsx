import { RequestDialog } from "@/components/wallet-connect/request-dialog";
import { useCallback, useEffect, useState } from "react";
import { SignClientTypes } from "@walletconnect/types";
import { DialogType } from "@/lib/wallet-connect";
import { useWalletConnect } from "@/hooks/use-wallet-connect";

export function RegisterRequestsDialogs() {
  const [dialogState, setDialogState] = useState({
    uri: "",
    proposalOpen: false,
    requestOpen: false,
  });

  const { data, setData, setActiveSessions, walletKit } = useWalletConnect();

  const onSessionProposal = useCallback(
    async (proposal: SignClientTypes.EventArguments["session_proposal"]) => {
      setDialogState((prev) => ({ ...prev, proposalOpen: true }));
      setData({ proposal });
    },
    []
  );

  const onSessionRequest = useCallback(
    async (request: SignClientTypes.EventArguments["session_request"]) => {
      try {
        console.log("ON SESSION REQUEST", request);
        const { method, params } = request.params.request;
        if (method === "eth_sendTransaction") {
          setDialogState((prev) => ({ ...prev, requestOpen: true }));
          setData({
            requestEvent: request,
          });
        } else if (method === "personal_sign") {
          setDialogState((prev) => ({ ...prev, requestOpen: true }));
          setData({ requestEvent: request });
        } else {
          throw new Error("Unsupported method");
        }
      } catch (error) {
        console.error(error);
      }
    },
    []
  );

  useEffect(() => {
    if (walletKit) {
      setActiveSessions(walletKit.getActiveSessions());

      walletKit.on("session_proposal", onSessionProposal);
      walletKit.on("session_request", onSessionRequest);
      walletKit.on("session_delete", () => {
        setActiveSessions(walletKit.getActiveSessions());
      });

      return () => {
        walletKit.off("session_proposal", onSessionProposal);
        walletKit.off("session_request", onSessionRequest);
        walletKit.off("session_delete", () => {
          setActiveSessions(walletKit.getActiveSessions());
        });
      };
    }
  }, [onSessionProposal, onSessionRequest, walletKit]);

  return (
    <>
      <RequestDialog
        open={dialogState.proposalOpen}
        onOpenChange={() =>
          setDialogState((prev) => ({ ...prev, proposalOpen: false }))
        }
        type="proposal"
      />
      <RequestDialog
        open={dialogState.requestOpen}
        onOpenChange={() =>
          setDialogState((prev) => ({ ...prev, requestOpen: false }))
        }
        type={data?.requestEvent?.params.request.method as DialogType}
      />
    </>
  );
}
