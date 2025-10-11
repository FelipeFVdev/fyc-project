// src/lib/db.ts

import { addMonths, addDays } from "date-fns";
import type {
  Fornecedor,
  ItemConsignacao,
  Venda,
  Cliente,
  PagamentoFornecedor,
} from "@/types";

// --- MOCK DE FORNECEDORES ---
export const mockFornecedorExtrato: Fornecedor = {
  id: "f1",
  nome: "Maria da Silva",
  cpf: "11122233344",
  telefone: "11987654321",
  email: "maria@example.com",
  endereco: {
    rua: "Rua Principal",
    numero: "100",
    bairro: "Centro",
    cidade: "São Paulo",
    cep: "01000000",
  },
  tamanhoPreferencia: ["M", "G", "40"],
  numeroVendas: 15,
  status: "ativo",
  dataCadastro: new Date("2024-01-15"),
};

export const mockFornecedores: Fornecedor[] = [
  {
    id: "f1",
    nome: "Maria da Silva",
    cpf: "11122233344",
    telefone: "11987654321",
    email: "maria@example.com",
    endereco: {
      rua: "Rua Principal",
      numero: "100",
      bairro: "Centro",
      cidade: "São Paulo",
      cep: "01000000",
      complemento: "Apto 10",
    },
    tamanhoPreferencia: ["M", "G", "40"],
    numeroVendas: 15,
    status: "ativo",
    dataCadastro: new Date("2024-01-15"),
    senha: "hashed_password_example",
  },
  {
    id: "f2",
    nome: "João Oliveira",
    cpf: "55566677788",
    telefone: "21998765432",
    email: "joao@example.com",
    endereco: {
      rua: "Avenida Brasil",
      numero: "200",
      bairro: "Jardins",
      cidade: "Rio de Janeiro",
      cep: "20000000",
    },
    tamanhoPreferencia: ["P", "36"],
    numeroVendas: 5,
    status: "ativo",
    dataCadastro: new Date("2024-03-20"),
  },
  {
    id: "f3",
    nome: "Ana Souza",
    cpf: "99988877766",
    telefone: "31912345678",
    email: "ana@example.com",
    endereco: {
      rua: "Rua das Flores",
      numero: "50",
      bairro: "Floresta",
      cidade: "Belo Horizonte",
      cep: "30000000",
    },
    tamanhoPreferencia: ["GG", "44"],
    numeroVendas: 0,
    status: "inativo",
    dataCadastro: new Date("2024-02-10"),
  },
];

// --- MOCK DE ITENS CONSIGNADOS ---
export const mockItensConsignados: ItemConsignacao[] = [
  {
    id: "ic1",
    fornecedorId: "f1",
    codigoFornecedor: "MDS001",
    dataInicioConsignacao: new Date("2024-05-01"),
    dataExpiracao: addDays(new Date(), 10),
    status: "disponivel",
    precoVenda: 80.0,
    marca: "Farm",
    tamanho: "M",
    categoria: "Vestido",
    descricao: "Vestido floral longo",
  },
  {
    id: "ic2",
    fornecedorId: "f1",
    codigoFornecedor: "MDS002",
    dataInicioConsignacao: new Date("2024-06-10"),
    dataExpiracao: new Date("2024-09-10"),
    status: "expirado",
    precoVenda: 50.0,
    marca: "Levi's",
    tamanho: "40",
    categoria: "Calça Jeans",
    descricao: "Calça jeans reta",
  },
  {
    id: "ic3",
    fornecedorId: "f2",
    codigoFornecedor: "JO003",
    dataInicioConsignacao: new Date("2024-04-01"),
    dataExpiracao: addDays(new Date(), 40),
    status: "disponivel",
    precoVenda: 30.0,
    marca: "C&A",
    tamanho: "G",
    categoria: "Blusa",
    descricao: "Blusa de seda preta",
  },
  {
    id: "ic4",
    fornecedorId: "f2",
    codigoFornecedor: "JO004",
    dataInicioConsignacao: new Date("2024-07-20"),
    dataExpiracao: new Date("2025-01-20"),
    status: "vendido",
    precoVenda: 120.0,
    marca: "Adidas",
    tamanho: "P",
    categoria: "Tênis",
    descricao: "Tênis esportivo branco",
  },
  {
    id: "ic5",
    fornecedorId: "f1",
    codigoFornecedor: "MDS005",
    dataInicioConsignacao: new Date("2024-07-15"),
    dataExpiracao: addMonths(new Date("2024-07-15"), 3),
    status: "vendido",
    precoVenda: 100.0,
    marca: "Amorim",
    tamanho: "P",
    categoria: "Bolsa",
    descricao: "Bolsa de couro",
  },
  {
    id: "ic6",
    fornecedorId: "f1",
    codigoFornecedor: "MDS006",
    dataInicioConsignacao: new Date("2024-08-01"),
    dataExpiracao: addMonths(new Date("2024-08-01"), 3),
    status: "devolvido",
    precoVenda: 70.0,
    marca: "Reserva",
    tamanho: "M",
    categoria: "Camiseta",
    descricao: "Camiseta de algodão",
  },
];

// --- MOCK DE VENDAS ---
export const mockHistoricoVendas: Venda[] = [
  {
    id: "v-abc",
    dataVenda: new Date("2024-06-05"),
    clienteNome: "Cliente Teste 1",
    itens: [
      { itemId: "ic1", tipo: "consignacao", precoVenda: 80.0, custoBase: 40.0 },
    ],
    valorTotal: 80.0,
    custoTotal: 40.0,
    margemLucro: 40.0,
    formaPagamento: "pix",
  },
  {
    id: "v-def",
    dataVenda: new Date("2024-08-20"),
    clienteNome: "Cliente Teste 2",
    itens: [
      {
        itemId: "ic5",
        tipo: "consignacao",
        precoVenda: 100.0,
        custoBase: 50.0,
      },
    ],
    valorTotal: 100.0,
    custoTotal: 50.0,
    margemLucro: 50.0,
    formaPagamento: "cartao",
  },
  {
    id: "v-xyz",
    dataVenda: new Date("2024-07-01"),
    clienteNome: "Cliente Teste 3",
    itens: [
      {
        itemId: "garimpo-2",
        tipo: "garimpo",
        precoVenda: 50.0,
        custoBase: 20.0,
      },
    ],
    valorTotal: 50.0,
    custoTotal: 20.0,
    margemLucro: 30.0,
    formaPagamento: "dinheiro",
  },
];

// --- MOCK DE CLIENTES ---
export const mockClientes: Cliente[] = [
  {
    id: "c1",
    nome: "Cliente Fidelidade 1",
    cpf: "00011122233",
    telefone: "11988887777",
    email: "cliente1@example.com",
    endereco: {
      rua: "Rua do Cliente",
      numero: "5",
      bairro: "Fidelidade",
      cidade: "São Paulo",
      cep: "01000000",
    },
    dataCadastro: new Date("2023-11-01"),
    historicoCompras: ["v-abc"],
  },
  {
    id: "c2",
    nome: "Cliente Novo",
    telefone: "21999996666",
    dataCadastro: new Date("2024-09-01"),
    historicoCompras: [],
  },
];

// --- MOCK DE ITENS GARIMPO (para referência) ---
// Pode ser necessário para outras partes do sistema
export const mockItensGarimpo = [
  {
    id: "g1",
    localCompra: "Bazar da Esquina",
    dataCompra: new Date("2024-03-10"),
    custoCompra: 25.0,
    custosAdicionais: 5.0,
    margemLucro: 60,
    precoVenda: 48.0,
    status: "disponivel",
    dataEntradaEstoque: new Date("2024-03-15"),
    marca: "Vintage",
    tamanho: "M",
    categoria: "Saia",
    descricao: "Saia midi florida",
  },
  // ... outros itens de garimpo
];

export const mockPagamentos: PagamentoFornecedor[] = [
  {
    id: "p1",
    fornecedorId: "f1",
    vendaId: "v-abc",
    valor: 40.0,
    tipo: "credito_loja",
    porcentagem: 50,
    status: "pago",
    dataPagamento: new Date("2024-06-10"),
  },
  {
    id: "p2",
    fornecedorId: "f1",
    vendaId: "v-def",
    valor: 40.0,
    tipo: "dinheiro",
    porcentagem: 40,
    status: "pendente",
  },
];
