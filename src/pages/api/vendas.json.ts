// src/pages/api/vendas.json.ts
import type { APIRoute } from "astro";
import { getVendas } from "../../lib/db";

export const GET: APIRoute = async () => {
  try {
    const vendas = await getVendas();
    return new Response(JSON.stringify(vendas), {
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: "Failed to fetch vendas" }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }
};
