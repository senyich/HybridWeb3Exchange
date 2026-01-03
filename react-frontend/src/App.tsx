import { WagmiProvider } from "wagmi";
import { QueryClientProvider } from "@tanstack/react-query";
import { ConnectKitProvider } from "connectkit";
import { queryClient, wagmiConfiguration } from "./config/wagmiConfig";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Header from "./components/layout/Header";
import { Dashboard } from "./components/DashBoard";
import { CreateOrder } from "./components/CreateOrder";

function App() {
  return (
    <WagmiProvider config={wagmiConfiguration}>
      <QueryClientProvider client={queryClient}>
        <ConnectKitProvider>
          <BrowserRouter>
            <Header />
            <Routes>
              <Route path="/wallet" element = {<Dashboard/>}/>
              <Route path="/pasteOrder" element = {<CreateOrder/>}/>
            </Routes>
          </BrowserRouter>
        </ConnectKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

export default App;
