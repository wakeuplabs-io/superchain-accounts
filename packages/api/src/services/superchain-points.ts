export interface ISuperchainPointsService {
  addClaimable(addresses: string[], amounts: bigint[]): Promise<void>;
}


export class SuperchainPointsService implements ISuperchainPointsService {
    addClaimable(addresses: string[], amounts: bigint[]): Promise<void> {
        throw new Error("Method not implemented.");
    }
}