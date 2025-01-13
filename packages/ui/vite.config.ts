import { TanStackRouterVite } from "@tanstack/router-vite-plugin";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { defineConfig, loadEnv, ProxyOptions } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import { fromIni } from "@aws-sdk/credential-providers";
import {
  SecretsManagerClient,
  GetSecretValueCommand,
} from "@aws-sdk/client-secrets-manager";
import { Address } from "viem";

interface SecretResult {
  apiKey: string;
}

export async function getSecret(secretName: string): Promise<SecretResult> {
  const credentials = await fromIni()();

  const client = new SecretsManagerClient({
    region: process.env.AWS_REGION || "us-east-1",
    credentials,
  });

  try {
    const response = await client.send(
      new GetSecretValueCommand({
        SecretId: secretName,
      })
    );

    if (!response.SecretString) {
      throw new Error("Secret value is empty");
    }

    return {
      apiKey: response.SecretString,
    };
  } catch (error) {
    console.error("Error fetching secret:", error);
    throw error;
  }
}

// https://vitejs.dev/config/
export default defineConfig(async ({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  //@todo - interpolate env name
  const secret_name = `superchain-accounts-api/dev/api-key`;
  const secrets = await getSecret(secret_name);

  return {
    base: "./",
    plugins: [react(), tsconfigPaths(), TanStackRouterVite()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    server: {
      port: 3000,
      proxy: {
        "/users": {
          target: "https://ggy80bz9vh.execute-api.us-east-1.amazonaws.com/dev",
          changeOrigin: true,
          configure: (proxy: any, _options: ProxyOptions) => {
            proxy.on("proxyReq", async (proxyReq: any) => {
              proxyReq.setHeader("x-api-key", secrets.apiKey);
            });
          },
        },
      },
    },
    define: {
      process: { env },
      global: {},
    },
  };
});
