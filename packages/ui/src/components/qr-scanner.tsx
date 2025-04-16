import { useEffect, useRef } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";

interface QRScannerProps {
  onScanSuccess: (data: string) => void;
  onScanError: (error: string) => void;
  onClose: () => void;
  className?: string;
}

const QRScanner = ({ onScanSuccess, onScanError, onClose, className }: QRScannerProps) => {
  const scannerRef = useRef<HTMLDivElement>(null);
  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);
  const isInitializedRef = useRef(false);

  useEffect(() => {
    if (isInitializedRef.current) return;
    isInitializedRef.current = true;

    if (!scannerRef.current) return;

    const onQrScanSuccess = (decodedText: string) => {
      onScanSuccess(decodedText);
      stopScanner();
    };

    const html5QrCode = new Html5Qrcode(scannerRef.current.id);
    html5QrCodeRef.current = html5QrCode;

    html5QrCode
      .start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        onQrScanSuccess,
        undefined,
      )
      .catch((err) => {
        onScanError(err);
      });

    return () => {
      stopScanner();
    };
  }, []);

  const stopScanner = async () => {
    if (html5QrCodeRef.current?.isScanning) {
      await html5QrCodeRef.current.stop();
      await html5QrCodeRef.current.clear();
    }
  };

  return (
    <div className={cn("w-full", className)}>
      <div className="relative">
        <div id="qr-reader" ref={scannerRef} className="w-full h-full"/>
        <X className="w-8 h-8 text-white absolute top-0 right-0 cursor-pointer" onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          stopScanner();
          onClose();
        }}/>
      </div>
    </div>
    
  );
};

export default QRScanner;