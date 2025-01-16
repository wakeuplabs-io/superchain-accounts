import { EventDef } from "@/types/index.js";
import { BaseEventProcessor } from "./EventProcessor.js";

export class BasicEventProcessor extends BaseEventProcessor {
  async process(event: EventDef, address: string): Promise<void> {
    await this.grantPointsToUser(event, address);
  }
}
