/// <reference path="./.sst/platform/config.d.ts" />

const PROJECT_NAME = "superchain";

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
              customer: "optimism",
              application: "superchain",
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
      handler: "packages/api/src/app.ts",
      url: true,
      environment: {
        NODE_ENV: "production",
        DATABASE_URL: process.env.DATABASE_URL!,
        BUNDLER_UNICHAIN_SEPOLIA: process.env.BUNDLER_UNICHAIN_SEPOLIA!,
        BUNDLER_OPTIMISM_SEPOLIA: process.env.BUNDLER_OPTIMISM_SEPOLIA!,
        BUNDLER_BASE_SEPOLIA: process.env.BUNDLER_BASE_SEPOLIA!,
        RPC_BASE_SEPOLIA: process.env.RPC_BASE_SEPOLIA!,
        RPC_OPTIMISM_SEPOLIA: process.env.RPC_OPTIMISM_SEPOLIA!,
        RPC_UNICHAIN_SEPOLIA: process.env.RPC_UNICHAIN_SEPOLIA!,
        ENTRYPOINT_UNICHAIN_SEPOLIA: process.env.ENTRYPOINT_UNICHAIN_SEPOLIA!,
        ENTRYPOINT_OPTIMISM_SEPOLIA: process.env.ENTRYPOINT_OPTIMISM_SEPOLIA!,
        ENTRYPOINT_BASE_SEPOLIA: process.env.ENTRYPOINT_BASE_SEPOLIA!
      },
    });

    // deploy ui
    const ui = new sst.aws.StaticSite(`${PROJECT_NAME}-ui`, {
      build: {
        command: "npm run build --workspace=ui",
        output: "packages/ui/dist",
      },
      domain: `${PROJECT_NAME}.wakeuplabs.link`,
      environment: {
        VITE_API_URL: api.url,
        VITE_BUNDLER_UNICHAIN_SEPOLIA: process.env.BUNDLER_UNICHAIN_SEPOLIA!,
        VITE_BUNDLER_OPTIMISM_SEPOLIA: process.env.BUNDLER_OPTIMISM_SEPOLIA!,
        VITE_BUNDLER_BASE_SEPOLIA: process.env.BUNDLER_BASE_SEPOLIA!,
        VITE_RPC_BASE_SEPOLIA: process.env.RPC_BASE_SEPOLIA!,
        VITE_RPC_OPTIMISM_SEPOLIA: process.env.RPC_OPTIMISM_SEPOLIA!,
        VITE_RPC_UNICHAIN_SEPOLIA: process.env.RPC_UNICHAIN_SEPOLIA!,
        VITE_ENTRYPOINT_UNICHAIN_SEPOLIA: process.env.ENTRYPOINT_UNICHAIN_SEPOLIA!,
        VITE_ENTRYPOINT_OPTIMISM_SEPOLIA: process.env.ENTRYPOINT_OPTIMISM_SEPOLIA!,
        VITE_ENTRYPOINT_BASE_SEPOLIA: process.env.ENTRYPOINT_BASE_SEPOLIA!
      },
    });

    return {
      ui: ui.url,
      api: api.url,
    };
  },
});
