import { useWeb3 } from "@/context/Web3Context";
import { ActionButton } from "./action-button";
import { Download } from "lucide-react";

export function SmartAccountCard(){
  const { chain } = useWeb3();
  return (
    <div className="flex flex-col rounded-lg shadow-sm bg-white p-8 max-w-screen-xl gap-8">
      <div className="flex flex-row gap-4 items-center">
        <img className="w-16 h-16" src={chain.logo} />
        <div className="flex flex-col gap-1">
          <h2 className="text-3xl text-black font-semibold">{chain.data.name}</h2>
          <span className="text-base text-black font-normal">Smart Account</span>
        </div>
      </div>
      <div className="flex items-start w-full">
        <ActionButton text='Receive' icon={Download} onClick={()=>console.log("asdd")} />
      </div>
    </div>
  );
}
