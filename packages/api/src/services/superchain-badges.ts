export interface ISuperchainBadgesService {
  addClaimable(addresses: string[], amounts: bigint[]): Promise<void>;
}


export class SuperchainBadgesService implements ISuperchainBadgesService {
    addClaimable(addresses: string[], amounts: bigint[]): Promise<void> {
        throw new Error("Method not implemented.");
    }
}