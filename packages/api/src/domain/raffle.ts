import { CreateRaffleBody } from "schemas";
import { Hex } from "viem";

interface CreateRaffleResponse {
  address: string;
  seed: Hex;
}

export interface ISuperchainRaffleService {
  createRaffle(body: CreateRaffleBody): Promise<CreateRaffleResponse>;
} 