import jsonrpc, { ErrorObject, IParsedObject, RequestObject, SuccessObject } from "jsonrpc-lite";
import { Address, encodePacked } from "viem";

export class PaymasterService {
  constructor(private readonly paymasterAddress: Address) {
    console.log("PaymasterService initialized with address", paymasterAddress);
  }

  public handleRequest(request: IParsedObject): SuccessObject | ErrorObject {
    const { type, payload } = request;

    console.log("Handling request", JSON.stringify(request));

    if (type !== "request") {
      console.log("Ignoring non-request type");
      return jsonrpc.error(null, { code: -32600, message: "Invalid request" });
    }

    switch (payload.method) {
    case "pm_getPaymasterStubData":
      return this.handleGetPaymasterStubData(payload);
    case "pm_getPaymasterData":
      return this.handleGetPaymasterData(payload);
    default:
      return jsonrpc.error(payload.id, { code: -32601, message: "Method not found" });
    }
  }

  private handleGetPaymasterStubData(payload: RequestObject): SuccessObject {
    return jsonrpc.success(payload.id, {
      paymaster: this.paymasterAddress,
      data: encodePacked(["uint256"], [BigInt(0)]),
    });
  }

  private handleGetPaymasterData(payload: RequestObject): SuccessObject {
    return jsonrpc.success(payload.id, {
      paymaster: this.paymasterAddress,
      data: encodePacked(["uint256"], [BigInt(0)]),
    });
  }
}
