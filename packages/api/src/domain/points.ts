import { EventDef, NormalizedCryptoEvent } from "@/types/index.js";
import e from "cors";

export class PointsService {
  constructor() {}
  calculatePoints = (event: EventDef): number => {
    return event.points_awarded;
  };
}
