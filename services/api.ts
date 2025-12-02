"use client";

import axios from "axios";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";

export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: false,
});

export { API_BASE_URL };


