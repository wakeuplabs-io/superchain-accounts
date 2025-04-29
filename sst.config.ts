/// <reference path="./.sst/platform/config.d.ts" />

const PROJECT_NAME = "superchain";
const DOMAIN_URL =
  process.env.NODE_ENV === "production"
    ? `${PROJECT_NAME}.wakeuplabs.link`
    : `${PROJECT_NAME}-staging.wakeuplabs.link`;
const CUSTOMER = "optimism";

export default $config({
  app(input) {
    return {
      name: PROJECT_NAME,
      removal: input?.stage === "production" ? "retain" : "remove",
      home: "aws",
      providers: {
        aws: {
          defaultTags: {
            tags: {
              customer: CUSTOMER,
              application: PROJECT_NAME,
              project: PROJECT_NAME,
              environment: input?.stage,
            },
          },
        },
      },
    };
  },
  async run() {
    // load environment variables
    const dotenv = await import("dotenv");
    dotenv.config();

    // deploy api
    const api = new sst.aws.Function(`${PROJECT_NAME}-api`, {
      handler: "packages/api/src/app.handler",
      url: {
        cors: false,
      },
      environment: {
        NODE_ENV: "production",
        DATABASE_URL: process.env.DATABASE_URL!,
        BUNDLER_UNICHAIN:
          process.env.BUNDLER_UNICHAIN || process.env.BUNDLER_UNICHAIN_SEPOLIA!,
        BUNDLER_OPTIMISM:
          process.env.BUNDLER_OPTIMISM || process.env.BUNDLER_OPTIMISM_SEPOLIA!,
        BUNDLER_BASE:
          process.env.BUNDLER_BASE || process.env.BUNDLER_BASE_SEPOLIA!,
        RPC_BASE: process.env.RPC_BASE || process.env.RPC_BASE_SEPOLIA!,
        RPC_OPTIMISM:
          process.env.RPC_OPTIMISM || process.env.RPC_OPTIMISM_SEPOLIA!,
        RPC_UNICHAIN:
          process.env.RPC_UNICHAIN || process.env.RPC_UNICHAIN_SEPOLIA!,
        ENTRYPOINT_UNICHAIN:
          process.env.ENTRYPOINT_UNICHAIN ||
          process.env.ENTRYPOINT_UNICHAIN_SEPOLIA!,
        ENTRYPOINT_OPTIMISM:
          process.env.ENTRYPOINT_OPTIMISM ||
          process.env.ENTRYPOINT_OPTIMISM_SEPOLIA!,
        ENTRYPOINT_BASE:
          process.env.ENTRYPOINT_BASE || process.env.ENTRYPOINT_BASE_SEPOLIA!,
        OWNER_PRIVATE_KEY: process.env.OWNER_PRIVATE_KEY!,
        SUPERCHAIN_BADGES_ADDRESS: process.env.SUPERCHAIN_BADGES_ADDRESS!,
        SUPERCHAIN_POINTS_ADDRESS: process.env.SUPERCHAIN_POINTS_ADDRESS!,
        SUPERCHAIN_POINTS_RAFFLE_FACTORY_ADDRESS: process.env.SUPERCHAIN_POINTS_RAFFLE_FACTORY_ADDRESS!,
        CRONJOB_KEY: process.env.CRONJOB_KEY!,
        MULTICALL_CONTRACT_ADDRESS: process.env.MULTICALL_CONTRACT_ADDRESS!,
        PRISMA_QUERY_ENGINE_LIBRARY:
          "/var/task/.prisma/client/libquery_engine-rhel-openssl-3.0.x.so.node",
        AAVE_CONTRACT_ADDRESS_UNICHAIN:
          process.env.AAVE_CONTRACT_ADDRESS_UNICHAIN!,
        AAVE_CONTRACT_ADDRESS_OPTIMISM:
          process.env.AAVE_CONTRACT_ADDRESS_OPTIMISM!,
        AAVE_CONTRACT_ADDRESS_BASE: process.env.AAVE_CONTRACT_ADDRESS_BASE!,
        UNICHAIN_CHAIN_ID: process.env.UNICHAIN_CHAIN_ID!,
        BASE_CHAIN_ID: process.env.BASE_CHAIN_ID!,
        OPTIMISM_CHAIN_ID: process.env.OPTIMISM_CHAIN_ID!,
      },
      copyFiles: [
        {
          from: "node_modules/.prisma/client/",
          to: ".prisma/client/",
        },
        {
          from: "node_modules/@prisma/client/",
          to: "@prisma/client/",
        },
      ],
    });

    // deploy cron job
    const cron = new sst.aws.Cron(`${PROJECT_NAME}-cron`, {
      function: {
        handler: "packages/api/src/cron.handler",
        environment: {
          API_URL: api.url,
          CRONJOB_KEY: process.env.CRONJOB_KEY!,
        },
      },
      schedule: "cron(0 12 * * ? *)",
    });

    // deploy ui
    const ui = new sst.aws.StaticSite(`${PROJECT_NAME}-ui`, {
      build: {
        command: "npm run build --workspace=ui",
        output: "packages/ui/dist",
      },
      domain: DOMAIN_URL,
      environment: {
        NODE_ENV: process.env.NODE_ENV || "development",
        VITE_API_URL: api.url,
        VITE_BUNDLER_UNICHAIN:
          process.env.BUNDLER_UNICHAIN || process.env.BUNDLER_UNICHAIN_SEPOLIA!,
        VITE_BUNDLER_OPTIMISM:
          process.env.BUNDLER_OPTIMISM || process.env.BUNDLER_OPTIMISM_SEPOLIA!,
        VITE_BUNDLER_BASE:
          process.env.BUNDLER_BASE || process.env.BUNDLER_BASE_SEPOLIA!,
        VITE_RPC_BASE: process.env.RPC_BASE || process.env.RPC_BASE_SEPOLIA!,
        VITE_RPC_OPTIMISM:
          process.env.RPC_OPTIMISM || process.env.RPC_OPTIMISM_SEPOLIA!,
        VITE_RPC_UNICHAIN:
          process.env.RPC_UNICHAIN || process.env.RPC_UNICHAIN_SEPOLIA!,
        VITE_ENTRYPOINT_UNICHAIN:
          process.env.ENTRYPOINT_UNICHAIN ||
          process.env.ENTRYPOINT_UNICHAIN_SEPOLIA!,
        VITE_ENTRYPOINT_OPTIMISM:
          process.env.ENTRYPOINT_OPTIMISM ||
          process.env.ENTRYPOINT_OPTIMISM_SEPOLIA!,
        VITE_ENTRYPOINT_BASE:
          process.env.ENTRYPOINT_BASE || process.env.ENTRYPOINT_BASE_SEPOLIA!,
        VITE_EXPLORER_BASE:
          process.env.EXPLORER_BASE || process.env.EXPLORER_BASE_SEPOLIA!,
        VITE_EXPLORER_OPTIMISM:
          process.env.EXPLORER_OPTIMISM ||
          process.env.EXPLORER_OPTIMISM_SEPOLIA!,
        VITE_EXPLORER_UNICHAIN:
          process.env.EXPLORER_UNICHAIN ||
          process.env.EXPLORER_UNICHAIN_SEPOLIA!,
        VITE_SUPERCHAIN_BADGES_ADDRESS: process.env.SUPERCHAIN_BADGES_ADDRESS!,
        VITE_SUPERCHAIN_POINTS_ADDRESS: process.env.SUPERCHAIN_POINTS_ADDRESS!,
        VITE_SUPERCHAIN_POINTS_RAFFLE_FACTORY_ADDRESS:
          process.env.SUPERCHAIN_POINTS_RAFFLE_FACTORY_ADDRESS!,
        VITE_WALLET_CONNECT_PROJECT_ID: process.env.WALLET_CONNECT_PROJECT_ID!,
      },
    });

    return {
      ui: ui.url,
      api: api.url,
    };
  },
});
