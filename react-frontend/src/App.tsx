import { WagmiProvider } from "wagmi";
import { QueryClientProvider } from "@tanstack/react-query";
import { ConnectKitProvider } from "connectkit";
import { queryClient, wagmiConfiguration } from "./config/wagmiConfig";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Header from "./components/layout/Header";
import { DashboardPage } from "./pages/DashBoardPage";
import { Footer } from "./components/layout/Footer";
import SwapPage from "./pages/SwapPage";

function App() {
  return (
    <div className="relative min-h-screen flex flex-col bg-background bg-grid-pattern bg-[length:40px_40px]">
      <div className="absolute inset-0 bg-gradient-radial from-purple-dark/20 via-background to-background pointer-events-none fixed" />  
      <WagmiProvider config={wagmiConfiguration}>
        <QueryClientProvider client={queryClient}>
          <ConnectKitProvider mode="dark" customTheme={{
            "--ck-font-family": '"Inter", sans-serif',
            "--ck-body-background": "#0F0518",
            "--ck-border-radius": "12px",
          }}>
            <BrowserRouter>
              <Header />
              <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
                <Routes>
                  <Route path="/" element={<DashboardPage />} />
                  <Route path="/trade" element={<SwapPage />} />
                </Routes>
              </main>
              <Footer />
            </BrowserRouter>
          </ConnectKitProvider>
        </QueryClientProvider>
      </WagmiProvider>
    </div>
  );
}

export default App;