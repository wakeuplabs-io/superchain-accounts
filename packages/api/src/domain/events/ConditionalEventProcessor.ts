import { EventDef } from "@/types/index.js";
import { BaseEventProcessor } from "./EventProcessor.js";
import { EventConditionsMap } from "./types.js";
import { EventConditionKey } from "./constants.js";

export class ConditionalEventProcessor extends BaseEventProcessor {
  private conditionsMap: EventConditionsMap = {
    [EventConditionKey.ON_CHAIN_ACTIVITY]: async (event, address) => {
      // @todo
      return true;
    },
  };
  async process(event: EventDef, address: string): Promise<void> {
    if (await this.shouldGrantPointsToUser(event, address)) {
      await this.grantPointsToUser(event, address);
    }
  }

  private getEventKey(event: EventDef): string {
    return `${event.event_name}:${event.event_type}`;
  }

  private async shouldGrantPointsToUser(
    event: EventDef,
    address: string
  ): Promise<boolean> {
    const eventKey = this.getEventKey(event);
    const condition = this.conditionsMap[eventKey];

    if (!condition) {
      console.warn(`No condition found for event: ${eventKey}`);
      return false;
    }

    return condition(event, address);
  }
}
