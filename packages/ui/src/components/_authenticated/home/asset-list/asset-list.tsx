import { ArrowUpRight } from "lucide-react";
import { AssetListItem } from "./asset-list-item";
import { useWeb3 } from "@/hooks/use-web3";
import { useSuperChainAccount } from "@/hooks/use-smart-account";
import { useAssets } from "@/hooks/use-assets";

export function AssetList() {
  const {status, data } = useAssets();
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
          data.sort((a, b) => {
            // Sort native token first
            if(a.native) return -1;
            // Sort by balance descending
            if (a.balance > b.balance) return -1;
            if (a.balance< b.balance) return 1;
            return 0;
          }).map(c => (
            <AssetListItem token={c} key={c.symbol} />
          )) 
          :  
          <li className="text-lg">No tokens imported</li>
        )}
      </ul>
    </div>
  );
}
