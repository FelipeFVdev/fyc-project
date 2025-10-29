// src/pages/api/clientes.json.ts
import type { APIRoute } from 'astro';
import { getClientes } from '../../lib/db';

export const GET: APIRoute = async () => {
  try {
    const clientes = await getClientes();
    return new Response(JSON.stringify(clientes), {
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to fetch clientes' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
};

