// src/components/ui/smart-account/ImportTokensDialog.tsx
import * as Dialog from "@radix-ui/react-dialog";
import "./loading.css";

import { useState } from "react";
import {
  importTokenSchema,
  type ImportTokenFormData,
  type ImportState,
} from "../schemas";
import { ZodError } from "zod";

interface ImportTokensDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ImportTokensDialog = ({
  isOpen,
  onClose,
}: ImportTokensDialogProps) => {
  const [state, setState] = useState<ImportState>("form");
  const [formData, setFormData] = useState({
    address: "",
    symbol: "",
    decimal: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateAndSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    try {
      const validatedData = await importTokenSchema.parseAsync(formData);
      setState("loading");

      // Simular verificación del token
      setTimeout(() => {
        console.log("Validated token data:", validatedData);
        setState("confirm");
      }, 1500);
    } catch (error) {
      if (error instanceof ZodError) {
        const formattedErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path) {
            formattedErrors[err.path[0]] = err.message;
          }
        });
        setErrors(formattedErrors);
      }
    }
  };

  const handleInputChange = (
    field: keyof ImportTokenFormData,
    value: string
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50" />
        <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[440px] bg-white rounded-[20px] p-6">
          {/* ... header content ... */}

          {state === "form" && (
            <form onSubmit={validateAndSubmit}>
              <div className="space-y-6">
                <div>
                  <label className="text-sm text-gray-900">
                    Token contract address
                  </label>
                  <input
                    type="text"
                    className={`w-full mt-2 px-3 py-2.5 border ${
                      errors.address ? "border-red-500" : "border-gray-200"
                    } rounded-lg text-sm placeholder:text-gray-400`}
                    value={formData.address}
                    onChange={(e) =>
                      handleInputChange("address", e.target.value)
                    }
                    placeholder="0x3bG05...2742222567"
                  />
                  {errors.address && (
                    <p className="mt-1 text-xs text-red-500">
                      {errors.address}
                    </p>
                  )}
                </div>

                <div>
                  <label className="text-sm text-gray-900">Token symbol</label>
                  <input
                    type="text"
                    className={`w-full mt-2 px-3 py-2.5 border ${
                      errors.symbol ? "border-red-500" : "border-gray-200"
                    } rounded-lg text-sm placeholder:text-gray-400`}
                    value={formData.symbol}
                    onChange={(e) =>
                      handleInputChange("symbol", e.target.value)
                    }
                    placeholder="TUX"
                  />
                  {errors.symbol && (
                    <p className="mt-1 text-xs text-red-500">{errors.symbol}</p>
                  )}
                </div>

                <div>
                  <label className="text-sm text-gray-900">Token decimal</label>
                  <input
                    type="text"
                    className={`w-full mt-2 px-3 py-2.5 border ${
                      errors.decimal ? "border-red-500" : "border-gray-200"
                    } rounded-lg text-sm placeholder:text-gray-400`}
                    value={formData.decimal}
                    onChange={(e) =>
                      handleInputChange("decimal", e.target.value)
                    }
                    placeholder="18"
                  />
                  {errors.decimal && (
                    <p className="mt-1 text-xs text-red-500">
                      {errors.decimal}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-[#FF0420] text-white rounded-full mt-2 text-sm font-medium"
                >
                  Continue
                </button>
              </div>
            </form>
          )}
          {state === "loading" && (
            <div className="py-8">
              <div className="h-12 bg-gray-50 rounded-full overflow-hidden">
                <div className="loading-bar h-full bg-gray-200 rounded-full" />
              </div>
              <p className="text-sm text-gray-500 text-center mt-3">
                Loading...
              </p>
            </div>
          )}
          {state === "confirm" && (
            <div>
              <div className="flex items-center gap-3 p-3 bg-[#F8F9FA] rounded-xl">
                <div className="w-10 h-10 bg-[#627EEA] rounded-full flex items-center justify-center">
                  <span className="text-white font-medium">ETH</span>
                </div>
                <div className="flex items-center">
                  <span className="text-gray-900">ETH</span>
                  <span className="text-gray-500 ml-2">4005.93</span>
                </div>
              </div>

              <button
                onClick={() => {
                  onClose();
                  setState("form");
                }}
                className="w-full py-3 bg-[#FF0420] text-white rounded-full mt-6 text-sm font-medium"
              >
                Import
              </button>
            </div>
          )}

          {/* ... rest of the states remain the same ... */}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
