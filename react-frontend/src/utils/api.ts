/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from "axios";
import type { Token } from "../config/types";

// const BASE_URI = import.meta.env.VITE_API_BASE_URI || "http://localhost:5000";
const BASE_URI = ""

export async function getSymbolsAsync() {
  try {
    const resp = await axios.get(`${BASE_URI}/api/tokens/get`);
    return resp.data.map((token: Token) => ({
      name: token.name,
      symbol: token.symbol,
      address: token.address,
    }));
  } catch (err) {
    console.error("getEthPrice error:", err);
    return null;
  }
}

export async function getEthPrice(): Promise<number | null> {
  try {
    const resp = await axios.get(
      `${BASE_URI}/api/market/eth/getLatestUsdPrice`
    );
    const price = resp.data.price;
    if (typeof price === "number") return price;
    return null;
  } catch (err) {
    console.error("getEthPrice error:", err);
    return null;
  }
}
