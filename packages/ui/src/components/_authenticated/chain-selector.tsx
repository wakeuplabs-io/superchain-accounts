import { supportedChains } from "@/hoc/web3-provider";
import { useWeb3 } from "@/hooks/use-web3";
import clsx from "clsx";

export function ChainSelector() {
  const { chain, updateChain } = useWeb3();

  return (
    <div className="flex gap-4 items-center justify-evenly md:justify-start overflow-x-auto">
      {Object.values(supportedChains)
        .sort((a, b) => a.order - b.order)
        .map(({ data, logo }) => {
          const selected = data.id === chain.data.id;
          return (
            <button
              key={data.id}
              onClick={() => updateChain(data.id)}
              className={clsx(
                "flex justify-center items-center w-full lg:justify-start lg:w-auto lg:flex-none lg:min-w-[270px] gap-2 whitespace-nowrap rounded-full px-6 py-4 border-custom-gray-200 border text-gray-600 hover:bg-white",
                {
                  "bg-white": selected,
                }
              )}
            >
              <img className="w-5 h-5" src={logo} />
              <div
                className={clsx(
                  "hidden lg:flex lg:flex-row lg:items-baseline gap-2",
                  {
                    "text-black": selected,
                    "text-custom-slate-400": !selected,
                  }
                )}
              >
                <span className="text-base font-semibold">{data.name}</span>
                {selected && <span className="text-sm">Connected</span>}
              </div>
            </button>
          );
        })}
    </div>
  );
}
