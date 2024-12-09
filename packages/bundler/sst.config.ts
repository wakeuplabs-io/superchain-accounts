/// <reference path="./.sst/platform/config.d.ts" />

const BUNDLER_PORT = Number(process.env.PORT ?? 4337);
const BUNDLER_PORT_FORWARDING = `${BUNDLER_PORT}/http` as `${number}/http`;

export default $config({
  app(input) {
    return {
      name: "superchain",
      removal: input?.stage === "production" ? "retain" : "remove",
      home: "aws",
      providers: {
        aws: {
          region: (process.env.AWS_REGION ?? "us-east-2") as $util.Input<aws.Region>,
          profile: process.env.AWS_PROFILE ?? "default",
          defaultTags: {
            tags: {
              customer: "optimism-gov",
              application: "superchain",
              environment: input?.stage,
            }
          },
        },
      }
    };
  },
  async run() {
    const vpc = new sst.aws.Vpc("bundler-vpc");
    const cluster = new sst.aws.Cluster("bundler-cluster", { vpc });

    cluster.addService("bundler-service", {
      loadBalancer: {
        ports: [
          { listen: "80/http", forward: BUNDLER_PORT_FORWARDING},
        ],
        health: {
          [BUNDLER_PORT_FORWARDING]: {
            path: "/health",
            interval: "10 seconds",
          }
        }
      },
      image: {
        dockerfile: "Dockerfile",
        args: {
          BUNDLER_VERSION: process.env.BUNDLER_VERSION ?? "v1.2.2"
        }
      },
      health: {
        command: ["CMD-SHELL", `curl -f http://localhost:${BUNDLER_PORT}/health || exit 1`],
        startPeriod: "60 seconds",
        timeout: "5 seconds",
        interval: "30 seconds",
        retries: 3,
      },
      command: [
        "--entrypoints", process.env.ENTRYPOINTS,
        "--executor-private-keys",process.env.EXECUTOR_PRIVATE_KEYS,
        "--utility-private-key", process.env.UTILITY_PRIVATE_KEY, 
        "--rpc-url", process.env.RPC_URL,
        "--port", BUNDLER_PORT.toString(),
        "--deploy-simulations-contract", "true",
        "--chain-type","op-stack",
        "--safe-mode", "false"
      ],
    });
  }
});
