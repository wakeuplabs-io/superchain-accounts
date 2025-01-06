export interface NormalizedCryptoEvent {
  transactionHash: string;
  eventName: string;
  blockNumber: string;
  eventKey: string;
  eventDate: number;
  args?: {
    from: string;
    to: string;
    value: string;
  };
  [key: string]: any;
}
