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

export interface EventDef {
  event_type: string;
  event_trigger_type: "blockchain" | "timeframe";
  expires_on_ttl?: number;
  event_name: string;
  points_awarded: number;
  description: string;
  active: boolean;
  [key: string]: any;
}