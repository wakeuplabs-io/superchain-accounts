import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useFormContext } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { SendAssetType } from "./send-asset-dialog";
import { useState } from "react";
import QRScanner from "@/components/qr-scanner";
import { useToast } from "@/hooks/use-toast";
import { getAddress } from "viem";
import { ScanQrCode } from "lucide-react";

const DestinationAddressField = () => {
  const {control, setValue} = useFormContext<SendAssetType>();
  const [controlledValue, setControlledValue] = useState("");
  const [isQRScannerEnabled, setIsQRScannerEnabled] = useState(false);
  const { toast } = useToast();

  const handleQRCodeScan = (scannedText: string) => {
    try {
      let scannedAddress = scannedText;

      if(scannedText.startsWith("ethereum:")){
        scannedAddress = /(0x[\w]+)/.exec(scannedText)?.[1] || "";
      }

      setControlledValue(scannedAddress);
      setValue("to", getAddress(scannedAddress),{ shouldValidate:true });
    } catch (error) {
      toast({
        title: "Invalid Address",
        description: "The address you scanned is invalid",
        variant: "destructive",
      });
    } finally {
      setIsQRScannerEnabled(false);
    }
  };

  return  (
    <FormField
      control={control}
      name="to"
      render={({ field }) => {
        return (
          <div className="flex flex-col items-center gap-4">
            <FormItem className="w-full">
              <FormLabel>To</FormLabel>
              <FormControl>
                <div className="flex items-center border gap-1 border-input pr-3 rounded-md group focus-within:ring-offset-2 focus-within:ring-2 focus-within:ring-black">
                  <Input placeholder="0x3bG05...2742222567" {...field} 
                    value={controlledValue}
                    onChange={
                      (e) => {
                        field.onChange(e.target.value);
                        setControlledValue(e.target.value);
                      }}
                    className="border-0 ring-0 focus-visible:ring-offset-0 focus-visible:ring-0"
                  />
                  <ScanQrCode 
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setIsQRScannerEnabled(true);
                    }}
                    className="w-6 h-6 text-primary cursor-pointer"
                  />
                </div>
                
              </FormControl>
              <FormMessage />
            </FormItem>
            {isQRScannerEnabled && 
              <QRScanner
                onScanSuccess={handleQRCodeScan}
                onScanError={() => {
                  toast({
                    title: "QR Code Scan Error",
                    description: "An error occurred while accessing your camera. Please try again or enter the address manually.",
                    variant: "destructive",
                  });
                  setIsQRScannerEnabled(false);
                }}
                onClose={() => {
                  setIsQRScannerEnabled(false);
                }}
                className="max-w-md"
              />
            }
          </div>
        );}}
    />
  );
};

export default DestinationAddressField;
