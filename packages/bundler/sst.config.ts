/// <reference path="./.sst/platform/config.d.ts" />

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
          { listen: "80/http", forward: "4000/http" },
        ]
      },
      environment: {
        PORT: "4000",
      },
      dev: {
        command: "node --watch index.mjs",
      },
    });
  }
});
