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
    });
  }
});
