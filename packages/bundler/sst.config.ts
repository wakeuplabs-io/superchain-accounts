/// <reference path="./.sst/platform/config.d.ts" />

const BUNDLER_PORT = Number(process.env.PORT ?? 4337);
const BUNDLER_PORT_FORWARDING = `${BUNDLER_PORT}/http` as `${number}/http`;

export default $config({
  app(input) {
    return {
      name: "superchain-bundler",
      removal: input?.stage === "production" ? "retain" : "remove",
      home: "aws",
      providers: {
        aws: {
          region: (process.env.AWS_REGION ?? "us-east-2") as $util.Input<aws.Region>,
          profile: process.env.AWS_PROFILE ?? "default",
          defaultTags: {
            tags: {
              customer: "optimism-gov",
              application: "superchain-bundler",
              environment: input?.stage,
            }
          },
        },
      }
    };
  },
  async run() {
    const vpcId = process.env.BUNDLER_VPC_ID!
    const subnets = process.env.BUNDLER_SUBNETS!.split(',')
    const securityGroups = [process.env.BUNDLER_SECURITY_GROUPS!]
    const cloudmapNamespaceId = process.env.BUNDLER_CLOUDMAP_NAMESPACE_ID!
    const cloudmapNamespaceName = process.env.BUNDLER_CLOUDMAP_NAMESPACE_NAME!

    const bundlerDomain = process.env.BUNDLER_SERVICE_DOMAIN!
    const bundlerCertificate = process.env.BUNDLER_SERVICE_CERTIFICATE!

    const vpc = {
      id: vpcId,
      // security group should allow http/https traffic inbound/outbound
      // TODO: use a different security group for load balancer for better isolation
      securityGroups,
      // container and load balancer should point to the same subnets for routting traffic
      containerSubnets: subnets,
      loadBalancerSubnets: subnets,
      cloudmapNamespaceId,
      cloudmapNamespaceName,
    }

    const cluster = new sst.aws.Cluster("bundler-cluster", { vpc });

    cluster.addService("bundler-service", {
      transform: {
        taskDefinition: (taskDefinition, opts) => {
            // see: http://docs.aws.amazon.com/AmazonECS/latest/APIReference/API_ContainerDefinition.html
            const definitions = JSON.parse(taskDefinition.containerDefinitions.toString())

            delete definitions[0].portMappings[0].containerPortRange;
            definitions[0].portMappings[0].containerPort = BUNDLER_PORT;
            definitions[0].portMappings[0].hostPort = BUNDLER_PORT;
            
            taskDefinition.containerDefinitions = JSON.stringify(definitions);
        }
      },
      loadBalancer: {
        domain: {
          name: bundlerDomain,
          dns: false,
          cert: bundlerCertificate
        },
        rules: [
          { listen: "443/https", forward: BUNDLER_PORT_FORWARDING},
          { listen: "80/http", redirect: "443/https"},
        ],
        health: {
          [BUNDLER_PORT_FORWARDING]: {
            path: "/health",
            interval: "10 seconds",
          }
        },
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
