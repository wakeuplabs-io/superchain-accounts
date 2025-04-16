import { initializeWallet } from "@/lib/wallet-connect";
import { useCallback, useEffect, useState } from "react";

export const WalletWrapper = ({ children }: { children: React.ReactNode }) => {
  const [initialized, setInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const onInitialize = useCallback(async () => {
    try {
      setIsLoading(true);
      await initializeWallet();
      setInitialized(true);
    } catch (err) {
      console.log(err);
      setError(
        err instanceof Error ? err.message : "Failed to initialize wallet"
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!initialized) {
      onInitialize();
    }
  }, [initialized, onInitialize]);

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-3">
          <p className="text-sm text-red-500">{error}</p>
          <button
            onClick={() => {
              setError(null);
              onInitialize();
            }}
            className="px-4 py-2 text-sm text-white bg-primary rounded hover:bg-primary/80"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
          <p className="text-sm text-gray-500 animate-pulse">
            Initializing Wallet...
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
