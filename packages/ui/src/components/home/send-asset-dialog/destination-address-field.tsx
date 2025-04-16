import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useFormContext } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { SendAssetType } from "./send-asset-dialog";

const DestinationAddressField = () => {
  // const [showScanner, setShowScanner] = useState(false);
  // const qrContainerRef = useRef<HTMLDivElement>(null);
  // useEffect(() => {
  //   if (showScanner && qrContainerRef.current) {
  //     const startScanner = async () => {
  //       try {
  //         // Obtener lista de cámaras disponibles
  //         const devices = await navigator.mediaDevices.enumerateDevices();
  //         const cameras = devices.filter(
  //           (device) => device.kind === "videoinput"
  //         );

  //         // Intentar encontrar la cámara trasera principal
  //         const rearCamera = cameras.find(
  //           (camera) =>
  //             camera.label.toLowerCase().includes("back") ||
  //             camera.label.toLowerCase().includes("rear") ||
  //             camera.label.toLowerCase().includes("environment")
  //         );

  //         const scanner = new Html5QrcodeScanner(
  //           "qr-scanner",
  //           {
  //             qrbox: {
  //               width: 250,
  //               height: 250,
  //             },
  //             fps: 5,
  //             videoConstraints: {
  //               deviceId: rearCamera?.deviceId,
  //               facingMode: rearCamera ? undefined : "environment",
  //               aspectRatio: 1,
  //             },
  //             showTorchButtonIfSupported: false, // Ocultar botón de flash
  //             showZoomSliderIfSupported: false, // Ocultar slider de zoom
  //             defaultZoomValueIfSupported: 1, // Zoom 1x por defecto
  //           },
  //           false // verbose
  //         );

  //         scanner.render(
  //           (decodedText) => {
  //             setToAddress(decodedText);
  //             scanner.clear();
  //             setShowScanner(false);
  //           },
  //           (error) => {
  //             console.warn(error);
  //           }
  //         );

  //         return () => {
  //           scanner.clear();
  //         };
  //       } catch (error) {
  //         console.error("Error accessing camera:", error);
  //       }
  //     };

  //     startScanner();
  //   }
  // }, [showScanner]);


  // const handleQrScan = () => {
  //   setShowScanner(true);
  //   const scanner = new Html5QrcodeScanner(
  //     "qr-reader",
  //     {
  //       qrbox: {
  //         width: 250,
  //         height: 250,
  //       },
  //       fps: 5,
  //     },
  //     false
  //   );

  //   scanner.render(
  //     (decodedText) => {
  //       setToAddress(decodedText);
  //       scanner.clear();
  //       setShowScanner(false);
  //     },
  //     (error) => {
  //       console.warn(error);
  //     }
  //   );
  // };

  const { control } = useFormContext<SendAssetType>();
 
  return  (
    <FormField
      control={control}
      name="to"
      render={({field}) => {
        return (
          <FormItem>
            <FormLabel>To</FormLabel>
            <FormControl>
              <Input placeholder="0x3bG05...2742222567" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        );}}
    />
  );
};

export default DestinationAddressField;
