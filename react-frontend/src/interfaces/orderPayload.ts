export interface OrderPayload {
  maker: string;
  side: 'Buy' | 'Sell';
  amount: bigint;
  price: bigint;
  nonce: bigint;
  signature: string;
}