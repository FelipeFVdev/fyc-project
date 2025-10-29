// src/content/config.ts
import { defineCollection, z } from "astro:content";

export const collections = {
  fornecedores: defineCollection({
    schema: z.object({
      nome: z.string(),
      cpf: z.string(),
      // ...
    }),
  }),
};
