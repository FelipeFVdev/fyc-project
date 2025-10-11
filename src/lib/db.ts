import { addMonths, addDays } from "date-fns";
import type {
  Fornecedor,
  ItemConsignacao,
  Venda,
  Cliente,
  ItemGarimpo,
  PagamentoFornecedor,
} from "@/types";

// --- MOCK DE DADOS GLOBALAIS (ainda são arrays, mas agora acessados por funções) ---
// Estes arrays serão mutados temporariamente para simular atualizações
export const _mockFornecedores: Fornecedor[] = [
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

export const _mockItensConsignados: ItemConsignacao[] = [
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

export const _mockHistoricoVendas: Venda[] = [
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
      { itemId: "g1", tipo: "garimpo", precoVenda: 50.0, custoBase: 20.0 },
    ],
    valorTotal: 50.0,
    custoTotal: 20.0,
    margemLucro: 30.0,
    formaPagamento: "dinheiro",
  },
];

export const _mockClientes: Cliente[] = [
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

export const _mockItensGarimpo: ItemGarimpo[] = [
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
  {
    id: "g2",
    localCompra: "Feira de Trocas",
    dataCompra: new Date("2024-02-01"),
    custoCompra: 10.0,
    custosAdicionais: 2.0,
    margemLucro: 80,
    precoVenda: 21.6,
    status: "disponivel",
    dataEntradaEstoque: new Date("2024-02-05"),
    marca: "Sem Marca",
    tamanho: "P",
    categoria: "Blusa",
    descricao: "Blusa de verão",
  },
];

export const _mockPagamentos: PagamentoFornecedor[] = [
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

// --- FUNÇÕES DE FETCH QUE RETORNAM PROMISES ---
const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

// Fornecedores
export async function getFornecedores(): Promise<Fornecedor[]> {
  await delay(500); // Simula delay de rede
  return _mockFornecedores;
}
export async function getFornecedorById(
  id: string
): Promise<Fornecedor | undefined> {
  await delay(300);
  return _mockFornecedores.find((f) => f.id === id);
}
export async function updateFornecedor(
  updatedFornecedor: Fornecedor
): Promise<Fornecedor> {
  await delay(700);
  const index = _mockFornecedores.findIndex(
    (f) => f.id === updatedFornecedor.id
  );
  if (index !== -1) {
    _mockFornecedores[index] = updatedFornecedor;
  }
  return updatedFornecedor;
}
export async function addFornecedor(
  newFornecedor: Fornecedor
): Promise<Fornecedor> {
  await delay(700);
  _mockFornecedores.push(newFornecedor);
  return newFornecedor;
}
export async function deleteFornecedor(id: string): Promise<void> {
  await delay(500);
  const index = _mockFornecedores.findIndex((f) => f.id === id);
  if (index !== -1) {
    _mockFornecedores.splice(index, 1);
  }
}
export async function getFornecedorPagamentos(
  id: string
): Promise<PagamentoFornecedor[]> {
  await delay(400);
  return _mockPagamentos.filter((p) => p.fornecedorId === id);
}

// Itens de Garimpo
export async function getItensGarimpo(): Promise<ItemGarimpo[]> {
  await delay(400);
  return _mockItensGarimpo;
}
export async function getItemGarimpoById(
  id: string
): Promise<ItemGarimpo | undefined> {
  await delay(300);
  return _mockItensGarimpo.find((i) => i.id === id);
}
export async function addItemGarimpo(
  newItem: ItemGarimpo
): Promise<ItemGarimpo> {
  await delay(700);
  _mockItensGarimpo.push(newItem);
  return newItem;
}
export async function updateItemGarimpo(
  updatedItem: ItemGarimpo
): Promise<ItemGarimpo> {
  await delay(700);
  const index = _mockItensGarimpo.findIndex((i) => i.id === updatedItem.id);
  if (index !== -1) {
    _mockItensGarimpo[index] = updatedItem;
  }
  return updatedItem;
}
export async function deleteItemGarimpo(id: string): Promise<void> {
  await delay(500);
  const index = _mockItensGarimpo.findIndex((i) => i.id === id);
  if (index !== -1) {
    _mockItensGarimpo.splice(index, 1);
  }
}

// Itens de Consignação
export async function getItensConsignados(): Promise<ItemConsignacao[]> {
  await delay(400);
  return _mockItensConsignados;
}
export async function getItemConsignadoById(
  id: string
): Promise<ItemConsignacao | undefined> {
  await delay(300);
  return _mockItensConsignados.find((i) => i.id === id);
}
export async function addItemConsignado(
  newItem: ItemConsignacao
): Promise<ItemConsignacao> {
  await delay(700);
  _mockItensConsignados.push(newItem);
  return newItem;
}
export async function updateItemConsignado(
  updatedItem: ItemConsignacao
): Promise<ItemConsignacao> {
  await delay(700);
  const index = _mockItensConsignados.findIndex((i) => i.id === updatedItem.id);
  if (index !== -1) {
    _mockItensConsignados[index] = updatedItem;
  }
  return updatedItem;
}
export async function deleteItemConsignado(id: string): Promise<void> {
  await delay(500);
  const index = _mockItensConsignados.findIndex((f) => f.id === id);
  if (index !== -1) {
    _mockItensConsignados.splice(index, 1);
  }
}

// Vendas
export async function getVendas(): Promise<Venda[]> {
  await delay(600);
  return _mockHistoricoVendas;
}
export async function getVendaById(id: string): Promise<Venda | undefined> {
  await delay(300);
  return _mockHistoricoVendas.find((v) => v.id === id);
}
export async function addVenda(newVenda: Venda): Promise<Venda> {
  await delay(900);
  _mockHistoricoVendas.push(newVenda);
  // Simular atualização de status dos itens vendidos
  newVenda.itens.forEach((vendaItem) => {
    const garimpoIndex = _mockItensGarimpo.findIndex(
      (i) => i.id === vendaItem.itemId
    );
    if (garimpoIndex !== -1) {
      _mockItensGarimpo[garimpoIndex].status = "vendido";
    }
    const consignadoIndex = _mockItensConsignados.findIndex(
      (i) => i.id === vendaItem.itemId
    );
    if (consignadoIndex !== -1) {
      _mockItensConsignados[consignadoIndex].status = "vendido";
    }
  });
  return newVenda;
}
export async function estornarVenda(id: string): Promise<void> {
  await delay(700);
  const index = _mockHistoricoVendas.findIndex((v) => v.id === id);
  if (index !== -1) {
    const estornada = _mockHistoricoVendas.splice(index, 1)[0]; // Remove e obtém a venda
    // Lógica para reverter status dos itens... (mais complexo para mock simples)
    console.log(`Venda ${id} estornada (removida do mock).`);
  }
}

// Clientes
export async function getClientes(): Promise<Cliente[]> {
  await delay(400);
  return _mockClientes;
}
export async function getClienteById(id: string): Promise<Cliente | undefined> {
  await delay(300);
  return _mockClientes.find((c) => c.id === id);
}
export async function addCliente(newCliente: Cliente): Promise<Cliente> {
  await delay(700);
  _mockClientes.push(newCliente);
  return newCliente;
}
export async function updateCliente(updatedCliente: Cliente): Promise<Cliente> {
  await delay(700);
  const index = _mockClientes.findIndex((c) => c.id === updatedCliente.id);
  if (index !== -1) {
    _mockClientes[index] = updatedCliente;
  }
  return updatedCliente;
}
