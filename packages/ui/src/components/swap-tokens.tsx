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
import React, { useCallback, useMemo, useState } from "react";
import { AssetSelector } from "./asset-selector";
import { Asset, useAssets } from "@/hooks/use-assets";
import { useSwap } from "@/hooks/use-swap";
import { formatUnits, parseUnits } from "viem";
import { toast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";

export const SwapTokenDialog: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { data: assets } = useAssets();
  const { quote, swap } = useSwap();

  const [open, setOpen] = useState(false);
  const [from, setFrom] = React.useState<Asset | null>(null);
  const [to, setTo] = React.useState<Asset | null>(null);
  const [fromAmount, setFromAmount] = React.useState<string>("0");
  const [isSwapPending, setIsSwapPending] = useState(false);

  const fromAssets = useMemo(() => {
    return assets.filter((asset) => asset.address !== to?.address);
  }, [assets, to]);

  const toAssets = useMemo(() => {
    return assets.filter((asset) => asset.address !== from?.address);
  }, [assets, from]);

  const { data: toAmount, isPending: isQuotePending } = useQuery({
    queryKey: ["quote", from?.address, to?.address, fromAmount],
    queryFn: () =>
      quote(
        from?.address!,
        to?.address!,
        parseUnits(fromAmount, from?.decimals!)
      )
        .then((amount) => formatUnits(amount, to?.decimals!))
        .catch(() => "-"),
    enabled: !!from && !!to && !!fromAmount && !isSwapPending,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    refetchInterval: 1000 * 5,
    staleTime: 0,
  });

  const onSwap = useCallback(async () => {
    if (!from || !to || !fromAmount || !toAmount) return;

    setIsSwapPending(true);

    swap(
      from.address,
      to.address,
      parseUnits(fromAmount, from.decimals),
      (parseUnits(toAmount, to.decimals) * 97n) / 100n // 3% slippage
    )
      .then(() => {
        onClose();
        toast({ title: "Success", description: "Swap successful" });
      })
      .catch(() => toast({ title: "Error", description: "Swap failed" }))
      .finally(() => setIsSwapPending(false));
  }, [from, to, fromAmount, toAmount]);

  const onClose = useCallback(() => {
    if (isSwapPending) return;

    setOpen(false);
    setFrom(null);
    setTo(null);
    setFromAmount("0");
  }, [isSwapPending]);

  return (
    <Dialog
      open={open}
      onOpenChange={() => {
        if (open) onClose();
        else setOpen(true);
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
              onValueChange={(value) =>
                setFrom(assets.find((asset) => asset.address === value)!)
              }
            />

            <Input
              value={fromAmount}
              onChange={(e) => setFromAmount(e.target.value)}
              type="number"
            />
          </div>

          <Label>Buy</Label>
          <div className="grid grid-cols-2 gap-2">
            <AssetSelector
              assets={toAssets}
              onValueChange={(value) =>
                setTo(assets.find((asset) => asset.address === value)!)
              }
            />

            <Input value={toAmount} readOnly />
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            onClick={onSwap}
            className="w-full"
            disabled={toAmount === "-"}
            loading={isSwapPending || isQuotePending}
          >
            Swap
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
