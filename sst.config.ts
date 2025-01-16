/// <reference path="./.sst/platform/config.d.ts" />

export default $config({
  app(input) {
    return {
      name: "superchain-app",
      removal: input?.stage === "production" ? "retain" : "remove",
      home: "aws",
      providers: {
        aws: {
          region: process.env.AWS_REGION,
          defaultTags: {
            tags: {
              customer: "optimism-gov",
              application: "superchain-app",
              environment: input?.stage,
            }
          },
        },
      }
    };
  },
  async run() {
    // Create site
    new sst.aws.StaticSite("frontend", {
      build: {
        command: "pnpm --filter ./packages/ui run build",
        output: "packages/ui/dist",
      },
      environment: {
        //VITE_BUNDLER_URL: "",
        VITE_ENTRYPOINT_ADDRESS: "0xab875A75b56732c7695eBFCeaC4c4062Afe4F57D",
        VITE_SMART_ACCOUNT_FACTORY_ADDRESS:
          "0x83605CCFFEeffEe29014F0f3D81F1640d3cFaCBE",
        VITE_PAYMASTER_CLIENT_URL: "https://ggy80bz9vh.execute-api/v1/rpc",
        VITE_API_BASE_URL: "https://ggy80bz9vh.execute-api",
      },
    });
  }
});
