/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from "axios";



//TODO сделать получения курса с другого api
export async function getEthPrice(vsCurrency = "usd"): Promise<number | null> {
  try {
    const resp = await axios.get(
      "https://api.coingecko.com/api/v3/simple/price",
      {
        params: {
          ids: "ethereum",
          vs_currencies: vsCurrency,
        },
        timeout: 10_000,
      }
    );

    const price = resp?.data?.ethereum?.[vsCurrency];
    if (typeof price === "number") return price;
    return null;
  } catch (err) {
    console.error("getEthPrice error:", err);
    return null;
  }
}
