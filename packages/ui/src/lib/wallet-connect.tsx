import { SessionTypes, SignClientTypes } from "@walletconnect/types";
import { WalletKit, IWalletKit } from "@reown/walletkit";
import { Core } from "@walletconnect/core";
import { WALLET_METADATA } from "@/config/wallet-connect";

export interface ModalData {
  proposal?: SignClientTypes.EventArguments["session_proposal"];
  requestEvent?: SignClientTypes.EventArguments["session_request"];
  requestSession?: SessionTypes.Struct;
  loadingMessage?: string;
  authRequest?: SignClientTypes.EventArguments["session_authenticate"];
}

export interface WalletState {
  data: ModalData;
  setData: (data: ModalData) => void;
  sessions: SessionTypes.Struct[];
  addSession: (session: SessionTypes.Struct) => void;
  removeSession: (publicKey: string) => void;
}

export type DialogType = "proposal" | "eth_sendTransaction" | "personal_sign";

export type Transaction = {
  amount: bigint;
  to: string;
};

export type encodedTransaction = {
  to: string;
  from: string;
  data: string;
  value: string;
};


// Returns the walletkit instance
export async function getWalletKit(): Promise<IWalletKit> {
  const core = new Core({
    projectId: import.meta.env.VITE_WALLET_CONNECT_PROJECT_ID, // TODO: use envParsed()
  });

  // Initialize the walletkit
  const walletKit = await WalletKit.init({
    core,
    metadata: WALLET_METADATA,
  });

  return walletKit;
}
