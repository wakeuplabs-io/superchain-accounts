import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { Address } from "viem";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

type User = {
  created_at: string;
  nft_level: number;
  superchain_points: number;
  address: Address;
  email: string;
  name: string;
};

export class ApiClient {
  constructor() {}
  public async createUser(
    email: string,
    name: string,
    address: Address
  ): Promise<any> {
    const response = await fetch("/users/account", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        address,
        name,
      }),
    });

    if (!response.ok) {
      throw new Error(`API call failed: ${response.statusText}`);
    }

    return response.json();
  }

  public async getUserByAddress(address: Address): Promise<User> {
    const response = await fetch(`/users/${address}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`API call failed: ${response.statusText}`);
    }

    return response.json();
  }
}
