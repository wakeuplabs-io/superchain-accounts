// src/components/ui/smart-account/schemas.ts
import { z } from "zod";
import { getAddress } from "viem";

export const importTokenSchema = z.object({
  address: z
    .string()
    .min(1, "Contract address is required")
    .transform((address) => {
      try {
        return getAddress(address);
      } catch {
        throw new Error("Invalid contract address");
      }
    }),
  symbol: z
    .string()
    .min(1, "Symbol is required")
    .max(10, "Symbol must be 10 characters or less")
    .regex(/^[A-Za-z0-9]+$/, "Symbol must contain only letters and numbers"),
  decimal: z
    .string()
    .transform((val) => Number(val))
    .pipe(
      z
        .number()
        .int("Decimal must be an integer")
        .min(0, "Decimal must be positive")
        .max(18, "Decimal must be 18 or less")
    ),
});

export type ImportState = "form" | "loading" | "confirm";

export type ImportTokenFormData = z.infer<typeof importTokenSchema>;

// src/types/html5-qrcode.d.ts
declare module 'html5-qrcode' {
    export class Html5QrcodeScanner {
      constructor(
        elementId: string,
        config: {
          qrbox?: {
            width: number;
            height: number;
          };
          fps?: number;
        },
        verbose?: boolean
      );
  
      render(
        successCallback: (decodedText: string, decodedResult: any) => void,
        errorCallback?: (errorMessage: string, error: any) => void
      ): void;
  
      clear(): Promise<void>;
    }
  }
