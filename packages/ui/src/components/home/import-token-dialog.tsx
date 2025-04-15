import * as Dialog from "@radix-ui/react-dialog";

import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { importUserTokenRequestSchema, ImportUserTokenRequest } from "schemas";
import { useWeb3 } from "@/hooks/use-web3";
import { useSuperChainAccount } from "@/hooks/use-smart-account";
import { userService } from "@/services";
import { useToast } from "@/hooks/use-toast";
import { useUserTokens } from "@/hooks/use-user-tokens";

interface ImportTokensDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ImportTokensDialog = ({
  isOpen,
  onClose,
}: ImportTokensDialogProps) => {
  const { chain } = useWeb3();
  const { account } = useSuperChainAccount();
  const { toast } = useToast();
  const { invalidateUserTokens } = useUserTokens();

  const form = useForm({
    resolver: zodResolver(importUserTokenRequestSchema),
    defaultValues: {
      chainId: chain.id,
      userWallet: account.instance?.address,
    }
  });

  const onSubmit = async (values: ImportUserTokenRequest) => {
    try {
      const userToken = await userService.importToken(values);
      toast({
        title: "Token imported",
        description: `Token ${userToken.symbol} imported successfully`,
      });
      invalidateUserTokens();
      onClose();
    } catch (error) {
      let description = "";

      if(error instanceof Error) {
        description = error.message;
      }

      toast({
        title: "Import Token failed",
        variant: "destructive",
        description,
      });
    }
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-10" />
        <Dialog.Content className="fixed w-full h-full left-0 top-0 md:max-w-lg md:h-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 rounded-lg bg-white shadow-lg z-20">
          <div className='flex flex-col w-full h-full pt-12 pb-16 px-12'>
            <Dialog.Title className="flex justify-between items-center mb-8">
              <span className="text-base font-medium">Import Tokens</span>
              <Dialog.Close className="hover:bg-gray-100 text-lg">✕</Dialog.Close>
            </Dialog.Title>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className='flex flex-col justify-between w-full h-full md:min-h-56'>
                <FormField
                  control={form.control}
                  name="address"
                  render={({field}) => (
                    <FormItem>
                      <FormLabel>Token contract address</FormLabel>
                      <FormControl>
                        <Input placeholder="0x3bG05...2742222567" {...field} />
                      </FormControl>
                      <FormMessage/>
                    </FormItem>
                  )}
                />
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

