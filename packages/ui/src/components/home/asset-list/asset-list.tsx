import { ArrowUpRight } from "lucide-react";
import { AssetListItem } from "./asset-list-item";
import { useWeb3 } from "@/hooks/use-web3";
import { useSuperChainAccount } from "@/hooks/use-smart-account";
import { useAssets } from "@/hooks/use-assets";
import { Skeleton } from "@/components/ui/skeleton";

export function AssetList() {
  const { isPending, error, data } = useAssets();
  const { chain } = useWeb3();
  const { account } = useSuperChainAccount();

  return (
    <div className="flex flex-col rounded-lg border bg-white p-8 pb-2 max-w-screen-xl gap-8">
      <div className="flex flex-wrap items-baseline justify-between">
        <h1 className="text-base font-medium">Tokens</h1>
        {account.status !== "pending" && (
          <a
            href={`${chain.explorer}/address/${account.address}`}
            className="flex items-center gap-1 text-sm font-medium text-primary"
            target="_blank"
            rel="noreferrer"
          >
            <span>View my Activity</span>
            <ArrowUpRight className="h-4 w-4" />
          </a>
        )}
      </div>
      <ul className="divide-y border-t">
        {isPending &&
          Array.from({ length: 3 }).map((_, i) => (
            <li key={i} className="flex flex-row items-center gap-4 py-6">
              <Skeleton className="w-10 h-10 rounded-full shrink-0" />
              <Skeleton className="h-10 w-full" />
            </li>
          ))
        }
        {!isPending &&
          (error ? (
            <li className="text-lg py-6">
              There was an error loading the token list...
            </li>
          ) : data.length > 0 ? (
            data
              .sort((a, b) => {
                // Sort native token first
                if (a.native) return -1;
                // Sort by balance descending
                if (a.balance > b.balance) return -1;
                if (a.balance < b.balance) return 1;
                return 0;
              })
              .map((c) => <AssetListItem asset={c} key={c.address} />)
          ) : (
            <li className="text-lg py-6">No tokens imported</li>
          ))}
      </ul>
    </div>
  );
}
