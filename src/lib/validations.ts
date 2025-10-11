// src/lib/validations.ts
import { z } from "zod";

export const itemGarimpoSchema = z.object({
  localCompra: z.string().min(1, "Local de compra obrigatório"),
  dataCompra: z.date(),
  custoCompra: z.number().min(0, "Custo deve ser positivo"),
  custosAdicionais: z.number(),
  margemLucro: z.number(),
  marca: z.string().optional(),
  tamanho: z.string().optional(),
  categoria: z.string().optional(),
  descricao: z.string().optional(),
});

export const fornecedorSchema = z.object({
  nome: z.string().min(3, "Nome deve ter no mínimo 3 caracteres"),
  cpf: z
    .string()
    .regex(/^\d{11}$/, "CPF deve ter 11 dígitos")
    .transform((val) => val.replace(/\D/g, "")),
  telefone: z.string().min(10, "Telefone inválido"),
  email: z.string().email("Email inválido").optional(),
  endereco: z.object({
    rua: z.string().min(1, "Rua obrigatória"),
    numero: z.string().min(1, "Número obrigatório"),
    complemento: z.string().optional(),
    bairro: z.string().min(1, "Bairro obrigatório"),
    cidade: z.string().min(1, "Cidade obrigatória"),
    estado: z.string().length(2, "Estado deve ter 2 letras"),
    cep: z
      .string()
      .regex(/^\d{8}$/, "CEP deve ter 8 dígitos")
      .transform((val) => val.replace(/\D/g, "")),
  }),
  tamanhoPreferencia: z.array(z.string()).optional(),
  senha: z.string().min(6, "Senha deve ter no mínimo 6 caracteres").optional(),
});

export const itemConsignacaoSchema = z.object({
  fornecedorId: z.string().min(1, "Fornecedor obrigatório"),
  precoVenda: z.number().min(0, "Preço deve ser positivo"),
  marca: z.string().optional(),
  tamanho: z.string().optional(),
  categoria: z.string().optional(),
  descricao: z.string().optional(),
});

export const vendaSchema = z.object({
  clienteNome: z.string().min(1, "Nome do cliente obrigatório"),
  clienteId: z.string().optional(),
  itens: z
    .array(
      z.object({
        itemId: z.string(),
        tipo: z.enum(["garimpo", "consignacao"]),
      })
    )
    .min(1, "Adicione pelo menos um item"),
  formaPagamento: z.enum(["dinheiro", "pix", "cartao", "credito_loja"]),
});

export const clienteSchema = z.object({
  nome: z.string().min(3, "Nome deve ter no mínimo 3 caracteres"),
  cpf: z
    .string()
    .regex(/^\d{11}$/, "CPF deve ter 11 dígitos")
    .optional()
    .transform((val) => val?.replace(/\D/g, "")),
  telefone: z.string().min(10, "Telefone inválido"),
  email: z.string().email("Email inválido").optional(),
});
