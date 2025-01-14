import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SmartAccount } from "viem/account-abstraction";
import { useSuperChainStore } from "@/core/store";
import { Button } from "@/components";
import { SmartAccountCard } from "@/components/_authenticated/SmartAccountCard/SmartAccountContainer";
import { SuperchainNetwork } from "@/types";
import { base, optimism } from "viem/chains";
import { Address } from "viem";

export const Route = createFileRoute("/_authenticated/")({
  component: Index,
});

function Index() {
  const smartAccountHandler = useSuperChainStore(
    (state) => state.smartAccountHandler
  );
  const authHandler = useSuperChainStore((state) => state.authHandler);
  const web3Client = useSuperChainStore((state) => state.web3Client);
  const web2Client = useSuperChainStore((state) => state.web2Client);
  const [smartAccount, setSmartAccount] = useState<{
    account: SmartAccount | null;
    isDeployed: boolean;
  }>({ account: null, isDeployed: false });
  const [_, setAccountBalance] = useState<string>("");
  const [accountPoints, setAccountPoints] = useState<number>(0);
  const [smartAccountAddress, setSmartAccountAddress] =
    useState<Address>("0x0");
  const [error, setError] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(false);
  const [isDeploying, setIsDeploying] = useState(false);
  const testNetworks: SuperchainNetwork[] = [
    {
      ...optimism,
      isConnected: true,
      symbol: "OP",
      color: "#FF0420",
    },
    {
      ...base,
      isConnected: false,
      symbol: "BASE",
      color: "#0052FF",
    },
  ];

  useEffect(() => {
    setIsInitializing(true);
    smartAccountHandler
      .initialize(authHandler.getProvider())
      .then(async (smartAccount) => {
        const isDeployed = await smartAccount.isDeployed();
        return { account: smartAccount, isDeployed };
      })
      .then(setSmartAccount)
      .finally(() => setIsInitializing(false));
  }, []);

  useEffect(() => {
    async function getSmartAccountBalance(
      smartAccount: SmartAccount
    ): Promise<{ balance: string; points: number }> {
      console.log(
        "Getting balance and points for smart account",
        smartAccount.address
      );
      setSmartAccountAddress(smartAccount.address);
      const [balance, points] = await Promise.all([
        web3Client.getBalance(smartAccount.address),
        web2Client
          .getUserByAddress(smartAccount.address)
          .then((user) => user.superchain_points),
      ]);

      return {
        balance,
        points,
      };
    }

    if (!smartAccount.account || !smartAccount.isDeployed) {
      return;
    }

    getSmartAccountBalance(smartAccount.account).then(({ balance, points }) => {
      setAccountBalance(balance);
      setAccountPoints(points);
    });
  }, [smartAccount?.account, smartAccount?.isDeployed, web3Client]);

  const deploySmartAccount = async () => {
    setIsDeploying(true);
    try {
      await smartAccountHandler.deploySmartAccount();
      setSmartAccount((prev) => ({ ...prev, isDeployed: true }));
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      }
      setError("Error deploying smart account");
    } finally {
      setIsDeploying(false);
    }
  };

  //TODO: IMPROVE THIS CODE
  if (isInitializing) {
    return (
      <div className="flex flex-col gap-3">
        <p className="text-3xl font-bold">Account</p>
        <p className="text-xl">Initializing smart account</p>
      </div>
    );
  }

  if (!smartAccount?.account) {
    return (
      <div className="flex flex-col gap-3">
        <p className="text-3xl font-bold">Accounts</p>
        <p className="text-xl">Smart account not deployed</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <p className="text-3xl font-bold">Accounts</p>
      <p>
        <b>Smart Account Address:</b> {smartAccount.account.address.toString()}
      </p>
      {smartAccount.isDeployed && (
        <>
          <SmartAccountCard
            address={smartAccountAddress}
            points={accountPoints}
            networks={testNetworks}
            currentNetwork={testNetworks[0]}
            onNetworkSelect={(networkId) =>
              console.log("Selected network:", networkId)
            }
            onSend={() => console.log("Send clicked")}
            onImport={() => console.log("Import clicked")}
          />
        </>
      )}
      {!smartAccount.isDeployed && (
        <div className="flex flex-row gap-2 items-center">
          <span>
            Smart account not deployed, click the next button to deploy it and
            confirm the transaction in your wallet.
          </span>
          <Button size="sm" onClick={deploySmartAccount} loading={isDeploying}>
            Deploy Account
          </Button>
        </div>
      )}
      {error && <div className="text-xl text-red-500">Error: {error}</div>}
    </div>
  );
}
