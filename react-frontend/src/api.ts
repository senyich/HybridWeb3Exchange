/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from "axios";
import type { OrderPayload } from "./interfaces/orderPayload";

const BASE_URL = import.meta.env.VITE_API_URL;

const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export const createOrder = async (orderData: OrderPayload) => {
  const formattedPayload = {
    ...orderData,
    amount: orderData.amount.toString(),
    price: orderData.price.toString(),
    nonce: orderData.nonce.toString(),
  };

  const response = await apiClient.post("/api/orders/create", formattedPayload);
  return response.data;
};
