import { supportedChains } from "@/config/chains";
import { useWeb3 } from "@/hooks/use-web3";
import clsx from "clsx";

export function ChainSelector() {
  const { chain, setCurrentChainId } = useWeb3();

  return (
    <div className="flex gap-4 items-center flex-col lg:flex-row md:justify-start overflow-x-auto">
      {Object.values(supportedChains)
        .sort((a, b) => a.order - b.order)
        .map((c) => {
          const selected = c.id === chain.id;
          return (
            <button
              key={c.id}
              onClick={() => setCurrentChainId(c.id)}
              className={clsx(
                "flex items-center w-full justify-start lg:w-auto lg:flex-none lg:min-w-[270px] gap-2 whitespace-nowrap rounded-full px-6 h-12 border-gray-200 border-2 text-gray-600 hover:bg-white",
                { "bg-white": selected }
              )}
            >
              <img className="w-5 h-5" src={c.logo} />
              <div
                className={clsx("flex flex-row items-baseline gap-2", {
                  "text-black": selected,
                  "text-slate-400": !selected,
                })}
              >
                <span className="text-base font-semibold">{c.name}</span>
              </div>
            </button>
          );
        })}
    </div>
  );
}
