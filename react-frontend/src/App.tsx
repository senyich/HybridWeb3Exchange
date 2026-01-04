import { WagmiProvider } from "wagmi";
import { QueryClientProvider } from "@tanstack/react-query";
import { ConnectKitProvider } from "connectkit";
import { queryClient, wagmiConfiguration } from "./config/wagmiConfig";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Header from "./components/layout/Header";
import { Dashboard } from "./pages/DashBoard";
import { CreateOrder } from "./components/CreateOrder";
import { Footer } from "./components/layout/Footer";

function App() {
  return (
    <div className="min-h-screen bg-blood-moon bg-[length:200%_200%] animate-gradient-shift text-white">
      <WagmiProvider config={wagmiConfiguration}>
        <QueryClientProvider client={queryClient}>
          <ConnectKitProvider>
            <BrowserRouter>
              <Header />
              <Routes>
                <Route path="/wallet" element={<Dashboard />} />
                <Route path="/pasteOrder" element={<CreateOrder />} />
              </Routes>
              <Footer />
            </BrowserRouter>
          </ConnectKitProvider>
        </QueryClientProvider>
      </WagmiProvider>
    </div>
  );
}


export default App;
