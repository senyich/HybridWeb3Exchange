/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState } from 'react';
import { useSignTypedData, useAccount, useChainId } from 'wagmi';
import { parseEther } from 'viem'; 
import { createOrder } from '../api'; 

const CONTRACT_ADDRESS = import.meta.env.VITE_EXCHANGE_CONTRACT_ADDRESS as `0x${string}`;

export const CreateOrder = () => {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { signTypedDataAsync } = useSignTypedData();
  
  const [price, setPrice] = useState<string>('2500');
  const [amount, setAmount] = useState<string>('0.005');
  const [isLoading, setIsLoading] = useState(false);

  const domain = {
    name: 'Diploma Exchange',
    version: '1',
    chainId: 11155111, 
    verifyingContract: CONTRACT_ADDRESS
  } as const;

  const types = {
    Order: [
      { name: 'maker', type: 'address' },
      { name: 'side', type: 'string' }, 
      { name: 'amount', type: 'uint256' },
      { name: 'price', type: 'uint256' },
      { name: 'nonce', type: 'uint256' }
    ],
  } as const;

  const handlePlaceOrder = async (side: 'Buy' | 'Sell') => {
    if (!address) return alert("Connect wallet");
    setIsLoading(true);

    try {
      const nonce = BigInt(Date.now());
      const amountBigInt = parseEther(amount); 
      const priceBigInt = parseEther(price); 

      const orderMessage = {
        maker: address,
        side: side,
        amount: amountBigInt,
        price: priceBigInt,
        nonce: nonce
      };

      const signature = await signTypedDataAsync({
        domain,
        types,
        primaryType: 'Order',
        message: orderMessage,
      });

      const result = await createOrder({
        ...orderMessage,
        signature
      });  
      alert(`Order Placed! ID: ${result.orderId}`);

    } catch (e: any) {
      console.error(e);
      const errorMessage = e.response?.data?.message || e.message || "Unknown error";
      alert(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark-radial text-white p-6 md:p-12 font-sans selection:bg-purple-deep">
      <nav className="max-w-7xl mx-auto flex justify-between items-center mb-16">
        <div className="relative group">
          <h1 className="text-4xl font-black tracking-tighter italic text-transparent bg-clip-text bg-neon-glow animate-pulse-glow">
            Ru.HEX
          </h1>
          <div className="absolute -bottom-2 left-0 w-0 h-1 bg-purple-neon transition-all duration-500 group-hover:w-full shadow-neon-purple"></div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto space-y-10">
        <header className="space-y-2">
          <h2 className="text-5xl font-extrabold tracking-tight">
            Create <span className="text-purple-electric italic">Order</span>
          </h2>
          <p className="text-purple-light/60 font-medium">
            {isConnected 
              ? `Connected as ${address?.slice(0, 6)}...${address?.slice(-4)}`
              : "Connect wallet to trade"
            }
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Order Form */}
          <div className="bg-black/20 backdrop-blur-xl rounded-3xl border border-purple-dark/50 p-8 hover:border-purple-dark transition-all duration-300">
            <div className="space-y-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold italic tracking-wider">Order Details</h3>
                <div className="flex gap-2">
                  <div className="h-2 w-2 rounded-full bg-purple-neon animate-pulse"></div>
                  <div className="h-2 w-2 rounded-full bg-crimson-neon animate-pulse delay-75"></div>
                </div>
              </div>

              {/* Price Input */}
              <div className="space-y-2">
                <label className="text-purple-electric text-sm font-semibold uppercase tracking-[0.2em] opacity-80">
                  Price (ETH)
                </label>
                <div className="relative group">
                  <input 
                    type="number" 
                    placeholder="2500" 
                    value={price} 
                    onChange={e => setPrice(e.target.value)}
                    className="w-full bg-purple-dark/10 border-2 border-purple-dark/30 rounded-xl p-4 font-mono text-white focus:outline-none focus:border-purple-neon transition-all duration-300 hover:bg-purple-dark/20"
                  />
                  <div className="absolute inset-0 rounded-xl border-2 border-transparent group-hover:border-purple-neon/20 transition-all duration-300 pointer-events-none"></div>
                </div>
              </div>

              {/* Amount Input */}
              <div className="space-y-2">
                <label className="text-purple-electric text-sm font-semibold uppercase tracking-[0.2em] opacity-80">
                  Amount (ETH)
                </label>
                <div className="relative group">
                  <input 
                    type="number"
                    placeholder="0.005" 
                    value={amount} 
                    onChange={e => setAmount(e.target.value)}
                    className="w-full bg-purple-dark/10 border-2 border-purple-dark/30 rounded-xl p-4 font-mono text-white focus:outline-none focus:border-purple-neon transition-all duration-300 hover:bg-purple-dark/20"
                  />
                  <div className="absolute inset-0 rounded-xl border-2 border-transparent group-hover:border-purple-neon/20 transition-all duration-300 pointer-events-none"></div>
                </div>
              </div>

              {/* Order Buttons */}
              <div className="flex gap-4 pt-4">
                <button 
                  disabled={isLoading || !isConnected}
                  onClick={() => handlePlaceOrder('Buy')} 
                  className="flex-1 bg-gradient-to-r from-green-600/20 to-emerald-500/20 border-2 border-green-600/50 rounded-xl p-4 font-bold text-lg hover:border-green-400 hover:from-green-600/30 hover:to-emerald-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 group relative overflow-hidden"
                >
                  <span className="relative z-10 group-hover:scale-105 transition-transform duration-300">
                    {isLoading ? 'Signing...' : 'BUY'}
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-green-600/0 via-green-400/10 to-green-600/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                </button>
                
                <button 
                  disabled={isLoading || !isConnected}
                  onClick={() => handlePlaceOrder('Sell')} 
                  className="flex-1 bg-gradient-to-r from-crimson-dark/20 to-red-500/20 border-2 border-crimson-neon/50 rounded-xl p-4 font-bold text-lg hover:border-red-400 hover:from-crimson-dark/30 hover:to-red-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 group relative overflow-hidden"
                >
                  <span className="relative z-10 group-hover:scale-105 transition-transform duration-300">
                    {isLoading ? 'Signing...' : 'SELL'}
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-crimson-neon/0 via-red-400/10 to-crimson-neon/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                </button>
              </div>

              {!isConnected && (
                <div className="mt-6 p-4 border-2 border-dashed border-purple-dark/30 rounded-xl text-center">
                  <p className="text-purple-light/40 italic mb-3">Connect wallet to start trading</p>
                </div>
              )}
            </div>
          </div>

          {/* Order Summary */}
          <div className="bg-black/20 backdrop-blur-xl rounded-3xl border border-purple-dark/50 p-8">
            <div className="space-y-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold italic tracking-wider">Order Summary</h3>
                <div className="text-purple-electric animate-pulse">
                  ⚡
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 rounded-xl bg-purple-dark/10 border border-purple-dark/20">
                  <span className="text-purple-light/80">Total Value</span>
                  <span className="font-mono font-bold text-lg">
                    {parseFloat(price) * parseFloat(amount) || '0.00'}
                  </span>
                </div>
                
                <div className="flex justify-between items-center p-4 rounded-xl bg-purple-dark/10 border border-purple-dark/20">
                  <span className="text-purple-light/80">Price per ETH</span>
                  <span className="font-mono font-bold text-purple-electric">
                    {price}
                  </span>
                </div>
                
                <div className="flex justify-between items-center p-4 rounded-xl bg-purple-dark/10 border border-purple-dark/20">
                  <span className="text-purple-light/80">Amount</span>
                  <span className="font-mono font-bold text-white">
                    {amount} ETH
                  </span>
                </div>

                <div className="mt-8 p-6 rounded-xl bg-gradient-to-br from-purple-dark/20 to-crimson-dark/10 border border-purple-dark/30">
                  <h4 className="text-purple-electric font-bold mb-3">Signing Process</h4>
                  <ul className="space-y-2 text-sm text-purple-light/70">
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-purple-neon"></div>
                      Sign typed data with your wallet
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-purple-neon"></div>
                      Order is cryptographically signed
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-purple-neon"></div>
                      Sent to exchange contract
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};