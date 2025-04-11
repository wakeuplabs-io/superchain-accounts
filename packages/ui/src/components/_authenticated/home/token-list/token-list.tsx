import { useUserTokens } from "@/hooks/user-tokens/use-user-tokens";
import { ArrowUpRight } from "lucide-react";
import { TokenListItem } from "./token-list-item";

export function TokenList() {
  const {status, data} = useUserTokens();
  if (status === "pending") {
    //TODO: Show loading spinner or skeleton loader
    return <div>Loading Tokens...</div>;
  }

  if (status === "error") {
    //TODO: Show error message
    return <div>There was an error loading the token list...</div>;
  }

  return (
    <div className="flex flex-col rounded-lg shadow-sm bg-white p-8 max-w-screen-xl gap-8">
      <div className="flex flex-wrap items-baseline justify-between">
        <h1 className="text-base font-medium">Tokens</h1>
        <a href="/tokens" className="flex items-center gap-1 text-base font-medium text-primary">
          View my Activity <ArrowUpRight />
        </a>
      </div>
      <ul>
        {data.length > 0 ? 
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
        }
      </ul>
    </div>
  );
}
