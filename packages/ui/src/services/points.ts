import { Axios } from "axios";
import { ClaimPointsBody } from "schemas";

export type SuperchainPointEvent = {
  id: number;
  user: string;
  chainId: string;
  type: string;
  data: string;
  minted: boolean;
  value: number;
  transactionHash: string;
};

export class PointsService {
  constructor(private readonly axios: Axios) {}

  async getUserPoints(
    wallet: `0x${string}`,
    chainId: string
  ): Promise<SuperchainPointEvent[]> {
    const { data } = await this.axios.get<{
      data: { points: SuperchainPointEvent[] };
    }>(`/points/${wallet}?chainId=${chainId}`);

    return data.data.points;
  }

  async claim(points: ClaimPointsBody): Promise<SuperchainPointEvent[]>  {
    const { data } = await this.axios.post<{
      data: { points: SuperchainPointEvent[] };
    }>("/points/claim", points);
    
    return data.data.points;
  }
}
