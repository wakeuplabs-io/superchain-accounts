/// <reference path="./.sst/platform/config.d.ts" />

import "dotenv/config";

const PROJECT_NAME = "superchain-app";

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
              customer: "optimism-gov",
              application: "superchain-app",
              environment: input?.stage,
            },
          },
        },
      },
    };
  },
  async run() {
    const ui = new sst.aws.StaticSite(`${PROJECT_NAME}-ui`, {
      build: {
        command: "npm run build --workspace=ui",
        output: "packages/ui/dist",
      },
      domain: `${PROJECT_NAME}.wakeuplabs.link`,
      environment: {
        VITE_OPTIMISM_RPC_URL:process.env.OPTIMISM_RPC_URL as string,
        VITE_OPTIMISM_PIMLICO_URL:process.env.OPTIMISM_PIMLICO_URL as string,
        VITE_OPTIMISM_ENTRYPOINT_ADDRESS:process.env.OPTIMISM_ENTRYPOINT_ADDRESS as string,
        VITE_UNICHAIN_RPC_URL:process.env.UNICHAIN_RPC_URL as string,
        VITE_UNICHAIN_PIMLICO_URL:process.env.UNICHAIN_PIMLICO_URL as string,
        VITE_UNICHAIN_ENTRYPOINT_ADDRESS:process.env.UNICHAIN_ENTRYPOINT_ADDRESS as string,
        VITE_BASE_RPC_URL:process.env.BASE_RPC_URL as string,
        VITE_BASE_PIMLICO_URL:process.env.BASE_PIMLICO_URL as string,
        VITE_BASE_ENTRYPOINT_ADDRESS:process.env.BASE_ENTRYPOINT_ADDRESS as string,
      },
    });

    return {
      ui: ui.url,
    };
  },
});
