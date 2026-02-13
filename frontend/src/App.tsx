import { WagmiProvider } from "wagmi";
import { QueryClientProvider } from "@tanstack/react-query";
import { ConnectKitProvider } from "connectkit";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { queryClient, wagmiConfig } from "./config/wagmiConfig";
import Header from "./components/layout/Header";
import { DashboardPage } from "./pages/DashBoardPage";
import { Footer } from "./components/layout/Footer";
import SwapPage from "./pages/SwapPage";
import { HomePage } from "./pages/HomePage";

function App() {
  return (
    <div className="relative min-h-screen flex flex-col bg-background bg-grid-pattern bg-[length:40px_40px]">
      <div className="absolute inset-0 bg-gradient-radial from-purple-dark/20 via-background to-background pointer-events-none fixed" />
      <WagmiProvider config={wagmiConfig}>
        <QueryClientProvider client={queryClient}>
          <ConnectKitProvider
            mode="dark"
            customTheme={{
              "--ck-font-family": '"Inter", sans-serif',
              "--ck-border-radius": "16px",
              "--ck-body-background": "#0F0518",
              "--ck-body-color": "#ffffff",
              "--ck-body-border": "1px solid rgba(176, 38, 255, 0.2)",
              "--ck-body-box-shadow":
                "0 0 20px rgba(176, 38, 255, 0.2), 0 10px 40px rgba(3, 0, 20, 0.8)",
              "--ck-overlay-background": "rgba(3, 0, 20, 0.6)",
              "--ck-overlay-backdrop-filter": "blur(6px)",
              "--ck-primary-button-background": "#B026FF",
              "--ck-primary-button-hover-background": "#D946EF",
              "--ck-primary-button-color": "#ffffff",
              "--ck-primary-button-box-shadow":
                "0 0 12px rgba(176, 38, 255, 0.5)",
              "--ck-primary-button-border-radius": "12px",
              "--ck-secondary-button-background": "rgba(255, 255, 255, 0.03)",
              "--ck-secondary-button-hover-background":
                "rgba(176, 38, 255, 0.1)",
              "--ck-secondary-button-color": "#ffffff",
              "--ck-secondary-button-box-shadow": "none",
              "--ck-secondary-button-border":
                "1px solid rgba(255, 255, 255, 0.05)",
              "--ck-focus-color": "#B026FF",
              "--ck-spinner-color": "#B026FF",
              "--ck-qr-dot-color": "#ffffff",
              "--ck-qr-background": "#0F0518",
              "--ck-qr-border-radius": "12px",
              "--ck-recent-badge-background": "#B026FF",
            }}
            options={{
              embedGoogleFonts: true,
              walletConnectName: "WalletConnect",
              hideNoWalletCTA: false,
            }}
          >
            <BrowserRouter>
              <Header />
              <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/swap" element={<SwapPage />} />
                  <Route path="/dashboard" element={<DashboardPage />} />
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
