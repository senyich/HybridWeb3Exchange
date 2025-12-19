import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ConnectKitButton, ConnectKitProvider, getDefaultConfig } from "connectkit";
import { http } from "viem";
import { sepolia } from "viem/chains";
import { createConfig, WagmiProvider, useAccount } from "wagmi";

const config = createConfig(
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

function AccountInfo() {
  const { address, isConnected, status } = useAccount();

  if (status === 'reconnecting' || status === 'connecting') {
    return <div>Загрузка...</div>;
  }

  return (
    <div style={{ marginTop: '20px', padding: '15px', border: '1px solid #ccc', borderRadius: '8px' }}>
      {isConnected ? (
        <div>
          <p><strong>Статус:</strong> Подключено</p>
          <p><strong>Адрес:</strong> {address}</p>
        </div>
      ) : (
        <p>Кошелек не подключен </p>
      )}
    </div>
  );
}

function App() {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <ConnectKitProvider>
          <div style={{ padding: '20px' }}>
            <header style={{ display: 'flex', gap: '20px', alignItems: 'center', marginBottom: '20px' }}>
              <h1>Биржа</h1>
              <ConnectKitButton />
            </header>

            <main>
              <AccountInfo />
            </main>
          </div>
        </ConnectKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

export default App;