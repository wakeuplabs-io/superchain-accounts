import { isAddress, isHex, numberToHex, stringToHex } from "viem";
import { z } from "zod";

isHex

const addressProp = z.string().refine((value) => isAddress(value), {
  message: "Not an address",
});

const hexProp = z.string().refine((value) => isHex(value), {
  message: "Not a hex string",
});

const SendUserOperationSchema = z.object({
  operation: z.object({
    sender: addressProp,
    nonce: hexProp,
    factory: addressProp.optional(),
    factoryData: hexProp.optional(),
    initCode: z.string(),
    callData: hexProp,
    callGasLimit: hexProp,
    verificationGasLimit: hexProp,
    preVerificationGas: hexProp,
    maxPriorityFeePerGas: hexProp,
    maxFeePerGas: hexProp,
    paymasterAndData: hexProp.optional(),
    signature: hexProp,
    paymaster: hexProp.optional(),
    paymasterVerificationGasLimit: hexProp.optional(),
    paymasterData: hexProp.optional(),
    paymasterPostOpGasLimit: hexProp.optional(),
  }),
  chainId: z.string(),
});

export const normalizeSendUserOperation = (event: any) =>
  SendUserOperationSchema.safeParse(event);
