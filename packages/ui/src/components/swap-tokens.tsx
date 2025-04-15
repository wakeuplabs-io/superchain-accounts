import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import React, { useEffect, useMemo, useState } from "react";
import { AssetSelector } from "./asset-selector";
import { Asset, useAssets } from "@/hooks/use-assets";
import { useSwap } from "@/hooks/use-swap";
import { formatUnits, parseUnits } from "viem";
import { toast } from "@/hooks/use-toast";

export const SwapTokenDialog: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { data: assets } = useAssets();
  const { quote, isPending } = useSwap();
  const [open, setOpen] = useState(false);

  const [from, setFrom] = React.useState<Asset | null>(null);
  const [to, setTo] = React.useState<Asset | null>(null);

  const [fromAmount, setFromAmount] = React.useState<string>("0");
  const [toAmount, setToAmount] = React.useState<string>("-");

  useEffect(() => {
    if (!from || !to) return;

    quote(from.address, to.address, parseUnits(fromAmount, from.decimals))
      .then((amount) => {
        setToAmount(formatUnits(amount, to.decimals));
      })
      .catch((e) => {
        toast({
          title: "Error",
          description: "No available route",
        });
        setToAmount("-");
      });
  }, [from, to, fromAmount]);

  const fromAssets = useMemo(() => {
    return assets.filter((asset) => asset.address !== to?.address);
  }, [assets, to]);

  const toAssets = useMemo(() => {
    return assets.filter((asset) => asset.address !== from?.address);
  }, [assets, from]);

  return (
    <Dialog
      open={open}
      onOpenChange={() => {
        setOpen(!open);
        setFrom(null);
        setTo(null);
        setFromAmount("0");
        setToAmount("-");
      }}
    >
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Swap</DialogTitle>
          <DialogDescription>
            Swap tokens within imported tokens in the same chain
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4 my-8">
          <Label>Sell</Label>
          <div className="grid grid-cols-2 gap-2">
            <AssetSelector
              assets={fromAssets}
              onValueChange={(value) => {
                setFrom(assets.find((asset) => asset.address === value)!);
              }}
            />

            <Input
              value={fromAmount}
              onChange={(e) => setFromAmount(e.target.value)}
            />
          </div>

          <Label>Buy</Label>
          <div className="grid grid-cols-2 gap-2">
            <AssetSelector
              assets={toAssets}
              onValueChange={(value) => {
                setTo(assets.find((asset) => asset.address === value)!);
              }}
            />

            <Input value={toAmount} readOnly />
          </div>
        </div>
        <DialogFooter>
          <Button
            loading={isPending}
            type="button"
            className="w-full"
            disabled={toAmount === "-"}
          >
            Swap
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
