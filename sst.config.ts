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
        VITE_BUNDLER_URL: process.env.VITE_BUNDLER_URL as string,
        VITE_PAYMASTER_CLIENT_URL: process.env.VITE_PAYMASTER_CLIENT_URL as string,
        VITE_ENTRYPOINT_ADDRESS: process.env.VITE_ENTRYPOINT_ADDRESS as string,
        VITE_SMART_ACCOUNT_FACTORY_ADDRESS: process.env.VITE_SMART_ACCOUNT_FACTORY_ADDRESS as string,
      },
    });

    return {
      ui: ui.url,
    };
  },
});
