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
import { Dialog, DialogContent, DialogTitle } from "../ui/dialog";

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
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogTitle>Import Tokens</DialogTitle>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='flex flex-col justify-between w-full h-full min-h-56'>
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
      </DialogContent>
    </Dialog>
  );
};

