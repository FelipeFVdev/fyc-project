// src/types/index.ts

export interface ItemGarimpo {
  id: string;
  localCompra: string;
  dataCompra: Date;
  custoCompra: number;
  custosAdicionais: number;
  margemLucro: number;
  precoVenda: number;
  status: "disponivel" | "vendido";
  dataEntradaEstoque: Date;
  marca?: string;
  tamanho?: string;
  categoria?: string;
  descricao?: string;
  fotos?: string[];
}

export interface Fornecedor {
  id: string;
  nome: string;
  cpf: string;
  telefone: string;
  email?: string;
  endereco: {
    rua: string;
    numero: string;
    complemento?: string;
    bairro: string;
    cidade: string;
    estado: string;
    cep: string;
  };
  tamanhoPreferencia?: string[];
  numeroVendas: number;
  status: "ativo" | "inativo";
  dataCadastro: Date;
  senha?: string; // Hash for login
}

export interface ItemConsignacao {
  id: string;
  fornecedorId: string;
  codigoFornecedor: string;
  dataInicioConsignacao: Date;
  dataExpiracao: Date;
  status: "disponivel" | "vendido" | "expirado";
  precoVenda: number;
  marca?: string;
  tamanho?: string;
  categoria?: string;
  descricao?: string;
  fotos?: string[];
}

export interface Venda {
  id: string;
  dataVenda: Date;
  clienteId?: string;
  clienteNome: string;
  itens: {
    itemId: string;
    tipo: "garimpo" | "consignacao";
    precoVenda: number;
    custoBase: number;
  }[];
  valorTotal: number;
  custoTotal: number;
  margemLucro: number;
  formaPagamento: "dinheiro" | "pix" | "cartao" | "credito_loja";
}

export interface Cliente {
  id: string;
  nome: string;
  cpf?: string;
  telefone: string;
  email?: string;
  endereco?: {
    rua: string;
    numero: string;
    complemento?: string;
    bairro: string;
    cidade: string;
    estado: string;
    cep: string;
  };
  dataCadastro: Date;
  historicoCompras: string[]; // IDs de vendas
}

export interface PagamentoFornecedor {
  id: string;
  fornecedorId: string;
  vendaId: string;
  valor: number;
  tipo: "credito_loja" | "dinheiro";
  porcentagem: number; // 50% ou 40%
  status: "pendente" | "pago";
  dataPagamento?: Date;
}

export interface ExtratoFornecedor {
  fornecedor: Fornecedor;
  itensVendidos: ItemConsignacao[];
  totalDevido: number;
  saldoDisponivelCredito: number;
  saldoDisponivelDinheiro: number;
  pagamentos: PagamentoFornecedor[];
}
