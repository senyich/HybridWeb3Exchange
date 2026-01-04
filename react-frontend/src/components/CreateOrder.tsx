/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState } from 'react';
import { useSignTypedData, useAccount, useChainId } from 'wagmi';

const replacer = (key: string, value: any) =>
  typeof value === 'bigint' ? value.toString() : value;

const CONTRACT_ADDRESS = import.meta.env.VITE_EXCHANGE_CONTRACT_ADDRESS as `0x${string}`;

export const CreateOrder = () => {
  const { address } = useAccount();
  const chainId = useChainId();
  const { signTypedDataAsync } = useSignTypedData();
  
  const [price, setPrice] = useState<string>('2500');
  const [amount, setAmount] = useState<string>('1');

  const domain = {
    name: 'Diploma Exchange',
    version: '1',
    chainId: chainId, 
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

    try {
      const nonce = BigInt(Date.now());
      const orderMessage = {
        maker: address,
        side: side,
        amount: BigInt(amount),
        price: BigInt(price),  
        nonce: nonce
      };

      const signature = await signTypedDataAsync({
        domain,
        types,
        primaryType: 'Order',
        message: orderMessage,
      });

      const payload = JSON.stringify({
        ...orderMessage,
        signature
      }, replacer);

      const response = await fetch('http://localhost:5000/api/Orders/create-eip712', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: payload
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.message);
      
      alert(`Order Placed! ID: ${result.orderId}`);

    } catch (e: any) {
      console.error(e);
      alert(e.message);
    }
  };

  return (
    <div className="bg-slate-900 p-6 rounded-xl text-white max-w-sm">
      <h3 className="text-xl font-bold mb-4">Trade ETH/USDT</h3>
      <div className="flex flex-col gap-3">
        <input 
            placeholder="Price" 
            value={price} 
            onChange={e => setPrice(e.target.value)}
            className="bg-slate-800 p-2 rounded"
        />
        <input 
            placeholder="Amount" 
            value={amount} 
            onChange={e => setAmount(e.target.value)}
            className="bg-slate-800 p-2 rounded"
        />
        <div className="flex gap-2 mt-2">
            <button onClick={() => handlePlaceOrder('Buy')} className="bg-green-600 flex-1 py-2 rounded">Buy</button>
            <button onClick={() => handlePlaceOrder('Sell')} className="bg-red-600 flex-1 py-2 rounded">Sell</button>
        </div>
      </div>
    </div>
  );
};