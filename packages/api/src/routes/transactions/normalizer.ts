import { z } from "zod";

const SendUserOperationSchema = z.object({
  operation: z.object({
    sender: z.string(),
    nonce: z.string(),
    factory: z.string().optional(),
    factoryData: z.string().optional(),
    initCode: z.string(),
    callData: z.string(),
    callGasLimit: z.string(),
    verificationGasLimit: z.string(),
    preVerificationGas: z.string(),
    maxPriorityFeePerGas: z.string(),
    maxFeePerGas: z.string(),
    paymasterAndData: z.string(),
    signature: z.string(),
    paymaster: z.string().optional(),
    paymasterVerificationGasLimit: z.string().optional(),
    paymasterData: z.string().optional(),
    paymasterPostOpGasLimit: z.string().optional(),
  }),
  chainId: z.number(),
});

export const normalizeSendUserOperation = (event: any) =>
  SendUserOperationSchema.parse(event);
