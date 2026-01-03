/* eslint-disable @typescript-eslint/no-unused-vars */
import { useEffect } from 'react';
import { useSignTypedData } from 'wagmi';

export const CreateOrder = () => {
  const { signTypedDataAsync } = useSignTypedData();

  const handlePlaceOrder = async () => {
    const order = {
      price: 2500,
      amount: 1,
      side: 'buy'
    };

    const signature = await signTypedDataAsync({
      domain: { name: 'Diploma Exchange', version: '1', chainId: 11155111 },
      types: {
        Order: [
          { name: 'price', type: 'uint256' },
          { name: 'amount', type: 'uint256' }
        ],
      },
      primaryType: 'Order',
      message: { price: BigInt(order.price), amount: BigInt(order.amount) },
    });

  };
  return (
    <div className="bg-black/40 p-6 rounded-xl border border-crimson-neon shadow-neon-red">
      <h3 className="text-crimson-electric mb-4 uppercase tracking-widest">Limit Order</h3>
      <button
        onClick={handlePlaceOrder}
        className="w-full py-3 bg-purple-red rounded font-bold hover:scale-105 transition-transform shadow-double-glow"
      >
        Place Buy Order
      </button>
    </div>
  );
};