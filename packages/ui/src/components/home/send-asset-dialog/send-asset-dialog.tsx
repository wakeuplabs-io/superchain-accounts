import { Button } from "@/components/ui";
import { Form, } from "@/components/ui/form";
import AssetSelector from "./asset-selector";
import AmountField from "./amount-field";
import DestinationAddressField from "./destination-address-field";
import { z } from "zod";
import { getAddress, isAddress } from "viem";
import { useAssets } from "@/hooks/use-assets";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useSuperChainAccount } from "@/hooks/use-smart-account";
import { useToast } from "@/hooks/use-toast";
import { useSendAsset } from "@/hooks/use-send-asset";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

const sendAssetSchema = z.object({
  asset: z.string({required_error: "Asset is required"}).transform(val => getAddress(val)),
  amount: z.bigint().refine((val) => val > 0n, {
    message: "Amount must be greater than 0",
  }),
  to: z.string({
    required_error: "Destination address is required",
  }).refine(
    (val) => {
      try {
        return isAddress(val);
      } catch (error) {
        return false;
      }
    },
    {
      message: "Invalid address",
    }
  ).transform(val => getAddress(val)),
});

export type SendAssetType = z.infer<typeof sendAssetSchema>;

interface SendAssetDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SendAssetDialog = ({
  isOpen,
  onClose,
}: SendAssetDialogProps) => {
  const { account } = useSuperChainAccount();
  const { isPending, error, data: assetsData, invalidateAssetData } = useAssets();
  const { sendAsset } = useSendAsset();
  const { toast } = useToast();

  const form = useForm({
    resolver: zodResolver(sendAssetSchema),
  });

  const onSubmit = async (data: SendAssetType) => {
    if(isPending || error) return {validationError: false};

    const validationErrors: {key: keyof typeof form.formState.errors; message: string}[] = [];
    
    if(account.address === data.to) {
      form.setError("to", {
        message: "Destination address cannot be the same as the sender address",
      });
    }

    const asset = assetsData.find((asset) => asset.address === data.asset);

    if(asset && asset.balance < data.amount) {
      validationErrors.push({
        key: "amount",
        message: "Insufficient balance",
      });
    }

    if(validationErrors.length > 0) {
      validationErrors.forEach((error) => {
        form.setError(error.key, {
          message: error.message,
        });
      });
      return;
    }

    try {
      if(!asset) {
        throw new Error("Asset not found");
      }

      await sendAsset(asset, data.amount, data.to);
      invalidateAssetData(asset);

      toast({
        title: "Transaction successfully sent",
      });
    } catch (error) {
      let description = "Something went wrong";
      if(error instanceof Error) {
        description = error.message;
      }

      toast({
        title: "Error sending asset",
        variant: "destructive",
        description,
      });
    } finally {
      form.reset();
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <ScrollArea className="max-h-screen">
          <DialogHeader>
            <DialogTitle>Send tokens</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} 
              className='flex flex-col justify-between w-full h-full gap-14'>
              <div className="flex flex-col gap-4" >
                <AssetSelector  />
                <AmountField  />
                <DestinationAddressField  />
              </div>
              <Button
                type="submit"
                className="w-full"
                loading={form.formState.isSubmitting}
              >
                Continue
              </Button>
            </form>
          </Form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
