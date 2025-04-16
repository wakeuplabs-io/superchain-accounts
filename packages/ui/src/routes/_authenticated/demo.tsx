import { Button } from "@/components/ui";
import { Input } from "@/components/ui/input";
import { ConnectionDialog } from "@/components/wallet-connect/connection-dialog";
import { createFileRoute } from "@tanstack/react-router";

import { useCallback, useEffect, useState } from "react";
import { SignClientTypes } from "@walletconnect/types";
import { DialogType, getWalletKit } from "@/lib/wallet-connect";
import { useWalletConnect } from "@/hooks/use-wallet-connect";
import { SessionDetails } from "@/components/wallet-connect/session-details";

export const Route = createFileRoute("/_authenticated/demo")({
  component: RouteComponent,
});

function RouteComponent() {
  const [dialogState, setDialogState] = useState({
    uri: "",
    proposalOpen: false,
    requestOpen: false,
  });

  const { data, setData, setActiveSessions } = useWalletConnect();
  const walletkit = getWalletKit();

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
    setActiveSessions(walletkit.getActiveSessions());

    if (walletkit) {
      walletkit.on("session_proposal", onSessionProposal);
      walletkit.on("session_request", onSessionRequest);
      walletkit.on("session_delete", () => {
        setActiveSessions(walletkit.getActiveSessions());
      });

      return () => {
        walletkit.off("session_proposal", onSessionProposal);
        walletkit.off("session_request", onSessionRequest);
        walletkit.off("session_delete", () => {
          setActiveSessions(walletkit.getActiveSessions());
        });
      };
    }
  }, [onSessionProposal, onSessionRequest, walletkit]);

  const handleConnect = async () => {
    const sessions = await walletkit.getActiveSessions();

    for (const session of Object.values(sessions)) {
      await walletkit.disconnectSession({
        topic: session.topic,
        reason: { code: 1000, message: "User disconnected" },
      });
    }

    await walletkit.pair({ uri: dialogState.uri });
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        <ConnectionDialog
          open={dialogState.proposalOpen}
          onOpenChange={() =>
            setDialogState((prev) => ({ ...prev, proposalOpen: false }))
          }
          type="proposal"
        />
        <ConnectionDialog
          open={dialogState.requestOpen}
          onOpenChange={() =>
            setDialogState((prev) => ({ ...prev, requestOpen: false }))
          }
          type={data?.requestEvent?.params.request.method as DialogType}
        />

        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Mini Wallet</h1>
        </div>

        <div className="text-center mb-6">
          <div className="flex flex-col sm:flex-row gap-4 mt-4">
            <Input
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              type="text"
              placeholder="Enter WalletConnect URI"
              value={dialogState.uri}
              onChange={(e) =>
                setDialogState((prev) => ({ ...prev, uri: e.target.value }))
              }
            />
            <Button
              className="w-full sm:w-auto bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              onClick={handleConnect}
            >
              Connect
            </Button>
          </div>
        </div>
      </div>

      <SessionDetails />
    </div>
  );
}
