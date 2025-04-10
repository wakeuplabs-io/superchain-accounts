import { GetUserTokensResponse } from "schemas";
import { formatUnits } from "viem";

interface TokenListItemProps {
  token: GetUserTokensResponse[number]
}

export function TokenListItem({ token }: TokenListItemProps){
  return (
    <li className="flex flex-wrap items-center justify-between border-t border-b py-6">
      <div className="flex items-center gap-4">
        <img className="w-10 h-10 rounded-full" src={token.logoURI} alt={token.name} />
        <span className="text-base font-semibold">{token.symbol}</span>
      </div>
      <span className="text-sm font-semibold">{formatUnits(token.balance, token.decimals)}</span>
    </li>
  );
}
