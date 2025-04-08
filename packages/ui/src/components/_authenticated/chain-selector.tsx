import { supportedChains } from "@/context/Web3Context";
import { Button } from "../ui";

interface ChainSelectorProps {
  selectedChain: number;
  onChainSelect: (chain: number) => void;
}

export function ChainSelector({
  selectedChain,
  onChainSelect,
}: ChainSelectorProps) {
  return (
    <div className='flex flex-row gap-4'>
      {Object.values(supportedChains).sort((a,b) => a.order - b.order).map((chain) => (
        <Button
          variant={
            selectedChain === chain.data.id ? "default" : "secondary"
          }
          key={chain.data.id}
          onClick={() => onChainSelect(chain.data.id)}
        >
          {chain.data.name}
        </Button>
      ))}
    </div>
  );
}
