import { isAddress, Address, getAddress } from "viem";
import { z } from "zod";
import { Tokens } from "./service.js";
import { normalize } from "viem/ens";

const addressSchema = z.custom<Address>((val) => {
  return typeof val === "string" && /^0x[a-fA-F0-9]{40}$/.test(val);
}, "Invalid Ethereum address");

const networksSchema = z.array(
  z.object({ chain: z.string(), address: addressSchema })
);

const CreateAccountEventSchema = z.object({
  email: z.string(),
  smartAccount: addressSchema,
  networks: networksSchema,
  name: z.string(),
});

const ImportTokensSchema = z.object({
  tokens: z.array(
    z.object({
      address: addressSchema,
      symbol: z.string(),
      decimals: z.number(),
    })
  ),
}) satisfies z.ZodType<{ tokens: Array<Tokens> }>;

const AddNetworkSchema = z.object({
  networks: networksSchema,
});

export const normalizeCreateAccount = (event: any) =>
  CreateAccountEventSchema.parse(event);

export const normalizeImportTokens = (event: any) =>
  ImportTokensSchema.parse(event);

export const normalizeAddNetwork = (event: any) =>
  AddNetworkSchema.parse(event);
