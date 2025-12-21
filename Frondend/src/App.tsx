import { WagmiProvider } from "wagmi";
import { QueryClientProvider } from "@tanstack/react-query";
import { ConnectKitProvider } from "connectkit";
import { queryClient, wagmiConfiguration } from "./config/wagmiConfig";
import { BrowserRouter, Routes } from "react-router-dom";
import Header from "./components/layout/Header";

function App() {
  return (
    <WagmiProvider config={wagmiConfiguration}>
      <QueryClientProvider client={queryClient}>
        <ConnectKitProvider>
          <BrowserRouter>
            <Header />
            <Routes></Routes>
          </BrowserRouter>
        </ConnectKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

export default App;
