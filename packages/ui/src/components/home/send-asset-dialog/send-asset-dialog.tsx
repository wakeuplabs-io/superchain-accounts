// src/components/ui/smart-account/SendTokensDialog.tsx
import * as Dialog from "@radix-ui/react-dialog";

import { Button } from "@/components/ui";
import { Form, } from "@/components/ui/form";
import AssetSelector from "./asset-selector";
import AmountField from "./amount-field";
import DestinationAddressField from "./destination-address-field";
import { useSendAsset } from "@/hooks/use-send-asset";


interface SendAssetDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SendAssetDialog = ({
  isOpen,
  onClose,
}: SendAssetDialogProps) => {
  const { form, onSubmit } = useSendAsset();

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-10" />
        <Dialog.Content className="fixed w-full h-full left-0 top-0 md:max-w-lg md:h-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 rounded-lg bg-white shadow-lg z-20">
          <div className='flex flex-col w-full h-full pt-12 pb-16 px-12'>
            <Dialog.Title className="flex justify-between items-center mb-8">
              <span className="text-base font-medium">Send tokens</span>
              <Dialog.Close className="hover:bg-gray-100 text-lg">✕</Dialog.Close>
            </Dialog.Title>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(async (data) => {
                await onSubmit(data);
                onClose();
              })} 
              className='flex flex-col justify-between w-full h-full md:gap-14'>
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
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
