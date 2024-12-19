export interface NormalizedCryptoEvent {
  transactionHash: string;
  eventName: string;
  blockNumber: string;
  eventKey: string;
  eventDate: number;
  args?: Record<string, any>;
  [key: string]: any;
}
