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
      {Object.values(supportedChains).map((chain) => (
        <Button
          variant={
            selectedChain === chain.id ? "default" : "secondary"
          }
          key={chain.id}
          onClick={() => onChainSelect(chain.id)}
        >
          {chain.name}
        </Button>
      ))}
    </div>
  );
}
