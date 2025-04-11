import { useUserTokens } from "@/hooks/user-tokens/use-user-tokens";
import { ArrowUpRight } from "lucide-react";
import { TokenListItem } from "./token-list-item";
import { useWeb3 } from "@/hooks/use-web3";
import { useSuperChainAccount } from "@/hooks/use-smart-account";

export function TokenList() {
  const {status, data} = useUserTokens();
  const {chain} = useWeb3();
  const {account} = useSuperChainAccount();

  return (
    <div className="flex flex-col rounded-lg shadow-sm bg-white p-8 max-w-screen-xl gap-8">
      <div className="flex flex-wrap items-baseline justify-between">
        <h1 className="text-base font-medium">Tokens</h1>
        {account.status !== "pending" && (
          <a href={`${chain.explorer}/address/${account.address}`} className="flex items-center gap-1 text-base font-medium text-primary" target="_blank" rel="noreferrer">
            View my Activity <ArrowUpRight />
          </a>
        )}
      </div>
      <ul>
        {status === "pending" && <li className="text-lg">Loading Tokens...</li>}
        {status === "error" && <li className="text-lg">There was an error loading the token list...</li>}
        {status === "success" && (data.length > 0 ? 
          data.sort(({balance: balanceA}, {balance: balanceB}) => {
          // Sort by balance descending
            if (balanceA > balanceB) return -1;
            if (balanceA < balanceB) return 1;
            return 0;
          }).map(c => (
            <TokenListItem token={c} key={c.address} />
          )) 
          :  
          <li className="text-lg">No tokens imported</li>
        )}
      </ul>
    </div>
  );
}
