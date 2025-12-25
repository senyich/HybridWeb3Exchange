import { QueryClient } from "@tanstack/react-query";
import {
  getDefaultConfig,
} from "connectkit";
import { http } from "viem";
import { sepolia } from "viem/chains";
import { createConfig } from "wagmi";

const wagmiConfiguration = createConfig(
  getDefaultConfig({
    chains: [sepolia],
    transports: {
      [sepolia.id]: http(),
    },
    walletConnectProjectId: "b1859eb4d0c0d7433f3343f083cb56c9",
    appName: "Diploma Exchange",
    appDescription: "Hybrid Exchange Project",
  })
);

const queryClient = new QueryClient();

export {
    wagmiConfiguration,
    queryClient
};