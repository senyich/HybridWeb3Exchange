import { createConfig, http } from "wagmi";
import { sepolia } from "wagmi/chains";
import { getDefaultConfig } from "connectkit";
import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient();

export const wagmiConfig = createConfig(
  getDefaultConfig({
    chains: [sepolia],
    transports: {
      [sepolia.id]: http(),
    },
    walletConnectProjectId: "e18407bedde6e981cf3cd219230e13ea",
    appName: "My DApp",
    appDescription: "My DApp Description",
    appIcon: "",
  }),
);
declare module 'wagmi' {
  interface Register {
    config: typeof wagmiConfig;
  }
}
