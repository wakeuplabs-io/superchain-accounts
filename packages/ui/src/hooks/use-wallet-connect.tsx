import { Transaction } from "@/lib/wallet-connect";
import React, { createContext, useContext, useState, ReactNode } from "react";
import { SessionTypes, SignClientTypes } from "@walletconnect/types";

interface ModalData {
  proposal?: SignClientTypes.EventArguments["session_proposal"];
  requestEvent?: SignClientTypes.EventArguments["session_request"];
  requestSession?: SessionTypes.Struct;
  loadingMessage?: string;
  authRequest?: SignClientTypes.EventArguments["session_authenticate"];
  txnData?: Transaction;
}

interface WalletContextProps {
  data: ModalData;
  setData: (data: ModalData) => void;
  activeSessions: Record<string, SessionTypes.Struct>;
  setActiveSessions: (sessions: Record<string, SessionTypes.Struct>) => void;
}

const WalletContext = createContext<WalletContextProps | undefined>(undefined);

export const WalletConnectProvider = ({ children }: { children: ReactNode }) => {
  const [data, setData] = useState<ModalData>({});
  const [activeSessions, setActiveSessions] = useState<
    Record<string, SessionTypes.Struct>
  >({});

  return (
    <WalletContext.Provider
      value={{ data, setData, activeSessions, setActiveSessions }}
    >
      {children}
    </WalletContext.Provider>
  );
};

export const useWalletConnect = (): WalletContextProps => {
  const context = useContext(WalletContext);
  if (!context)
    throw new Error("useWallet must be used within a WalletProvider");
  return context;
};
