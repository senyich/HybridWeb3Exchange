
export const EXCHANGE_CONTRACT_ADDRESS = import.meta.env.VITE_EXCHANGE_CONTRACT_ADDRESS as `0x${string}` || "0x9ACb4938420AA5F259aF9EcEDB021fB5145DD7Ef";

export const SUPPORTED_TOKENS = [
  {
    name: "TopCOIN",
    symbol: "TC",
    address: "0x8EdDd55579F72E99fCbe2fc9747edd46B1f032AC" as `0x${string}`,
  },
  {
    name: "TopGEM",
    symbol: "TG",
    address: "0x9c5956607797FdC78216FfDc4d608953eED655ad" as `0x${string}`,
  },
  {
    name: "MonkeyCoin",
    symbol: "MC",
    address: "0x3b2a9049685AACb584789C630d8c3d1d15D77AbD" as `0x${string}`,
  },
];