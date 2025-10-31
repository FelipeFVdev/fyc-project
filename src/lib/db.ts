import { addMonths, addDays } from "date-fns";
import type {
  Fornecedor,
  ItemConsignacao,
  Venda,
  Cliente,
  ItemGarimpo,
  PagamentoFornecedor,
} from "@/types";

// --- MOCK DE DADOS GLOBALAIS (Arrays mutáveis para simular DB) ---
// Note o uso de '_' prefixo para indicar que são internos e não devem ser acessados diretamente

// Data atual para garantir consistência de datas nos mocks gerados
const now = new Date();

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
    dataCadastro: addDays(now, -300),
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
    dataCadastro: addDays(now, -180),
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
    dataCadastro: addDays(now, -90),
  },
];

export const _mockItensGarimpo: ItemGarimpo[] = [
  {
    id: "g1",
    localCompra: "Bazar da Esquina",
    dataCompra: addDays(now, -60),
    custoCompra: 25.0,
    custosAdicionais: 5.0,
    margemLucro: 60,
    precoVenda: 48.0,
    status: "vendido",
    dataEntradaEstoque: addDays(now, -55),
    marca: "Vintage",
    tamanho: "M",
    categoria: "Saia",
    descricao: "Saia midi florida",
  },
  {
    id: "g2",
    localCompra: "Feira de Trocas",
    dataCompra: addDays(now, -90),
    custoCompra: 10.0,
    custosAdicionais: 2.0,
    margemLucro: 80,
    precoVenda: 21.6,
    status: "disponivel",
    dataEntradaEstoque: addDays(now, -85),
    marca: "Sem Marca",
    tamanho: "P",
    categoria: "Blusa",
    descricao: "Blusa de verão",
  },
  {
    id: "g3",
    localCompra: "Brechó Online",
    dataCompra: addDays(now, -120),
    custoCompra: 35.0,
    custosAdicionais: 0.0,
    margemLucro: 70,
    precoVenda: 59.5,
    status: "disponivel",
    dataEntradaEstoque: addDays(now, -115),
    marca: "Nike",
    tamanho: "L",
    categoria: "Jaqueta",
    descricao: "Jaqueta esportiva preta",
  },
];

export const _mockItensConsignados: ItemConsignacao[] = [
  {
    id: "ic1",
    fornecedorId: "f1",
    codigoFornecedor: "MDS001",
    dataInicioConsignacao: addDays(now, -150),
    dataExpiracao: addDays(now, -5), // Expirado
    status: "vendido",
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
    dataInicioConsignacao: addDays(now, -100),
    dataExpiracao: addDays(now, 10), // Próximo a expirar
    status: "disponivel",
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
    dataInicioConsignacao: addDays(now, -180),
    dataExpiracao: addDays(now, 40), // Disponível
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
    dataInicioConsignacao: addDays(now, -60),
    dataExpiracao: addDays(now, 200), // Vendido
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
    dataInicioConsignacao: addDays(now, -30),
    dataExpiracao: addDays(now, 60), // Vendido
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
    dataInicioConsignacao: addDays(now, -45),
    dataExpiracao: addDays(now, 45), // Devolvido
    status: "devolvido",
    precoVenda: 70.0,
    marca: "Reserva",
    tamanho: "M",
    categoria: "Camiseta",
    descricao: "Camiseta de algodão",
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
    dataCadastro: addDays(now, -365),
    historicoCompras: [], // Será preenchido nas vendas
  },
  {
    id: "c2",
    nome: "Cliente Novo",
    telefone: "21999996666",
    dataCadastro: addDays(now, -30),
    historicoCompras: [],
  },
];

export const _mockHistoricoVendas: Venda[] = [
  {
    id: "v1",
    dataVenda: addDays(now, -50),
    clienteId: "c1",
    clienteNome: "Cliente Fidelidade 1",
    itens: [
      { itemId: "ic1", tipo: "consignacao", precoVenda: 80.0, custoBase: 40.0 },
    ],
    valorTotal: 80.0,
    custoTotal: 40.0,
    margemLucro: 40.0,
    formaPagamento: "pix",
  },
  {
    id: "v2",
    dataVenda: addDays(now, -20),
    clienteId: "c2",
    clienteNome: "Cliente Novo",
    itens: [
      { itemId: "g1", tipo: "garimpo", precoVenda: 48.0, custoBase: 30.0 },
    ],
    valorTotal: 48.0,
    custoTotal: 30.0,
    margemLucro: 18.0,
    formaPagamento: "dinheiro",
  },
  {
    id: "v3",
    dataVenda: addDays(now, -10),
    clienteId: "c1",
    clienteNome: "Cliente Fidelidade 1",
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
    id: "v3",
    dataVenda: addDays(now, -10),
    clienteId: "c1",
    clienteNome: "Cliente Fidelidade 1",
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
    id: "v3",
    dataVenda: addDays(now, -10),
    clienteId: "c1",
    clienteNome: "Cliente Fidelidade 1",
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
    id: "v3",
    dataVenda: addDays(now, -10),
    clienteId: "c1",
    clienteNome: "Cliente Fidelidade 1",
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
    id: "v3",
    dataVenda: addDays(now, -10),
    clienteId: "c1",
    clienteNome: "Cliente Fidelidade 1",
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
    id: "v3",
    dataVenda: addDays(now, -10),
    clienteId: "c1",
    clienteNome: "Cliente Fidelidade 1",
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
    id: "v3",
    dataVenda: addDays(now, -10),
    clienteId: "c1",
    clienteNome: "Cliente Fidelidade 1",
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
    id: "v3",
    dataVenda: addDays(now, -10),
    clienteId: "c1",
    clienteNome: "Cliente Fidelidade 1",
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
    id: "v3",
    dataVenda: addDays(now, -10),
    clienteId: "c1",
    clienteNome: "Cliente Fidelidade 1",
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
    id: "v3",
    dataVenda: addDays(now, -10),
    clienteId: "c1",
    clienteNome: "Cliente Fidelidade 1",
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
    id: "v3",
    dataVenda: addDays(now, -10),
    clienteId: "c1",
    clienteNome: "Cliente Fidelidade 1",
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
    id: "v3",
    dataVenda: addDays(now, -10),
    clienteId: "c1",
    clienteNome: "Cliente Fidelidade 1",
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
    id: "v3",
    dataVenda: addDays(now, -10),
    clienteId: "c1",
    clienteNome: "Cliente Fidelidade 1",
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
];

export const _mockPagamentos: PagamentoFornecedor[] = [
  {
    id: "mp1",
    fornecedorId: "f1",
    vendaId: "ic1",
    valor: 40.0,
    tipo: "credito_loja",
    porcentagem: 50,
    status: "pago",
    dataPagamento: addDays(now, -40),
  },
  {
    id: "mp2",
    fornecedorId: "f2",
    vendaId: "ic4",
    valor: 48.0,
    tipo: "dinheiro",
    porcentagem: 40,
    status: "pendente",
  },
];

// --- FUNÇÕES DE FETCH QUE RETORNAM PROMISES ---
const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

// --- Fornecedores ---
export async function getFornecedores(): Promise<Fornecedor[]> {
  await delay(200);
  return structuredClone(_mockFornecedores); // Retorna uma cópia para evitar mutações diretas
}
export async function getFornecedorById(
  id: string,
): Promise<Fornecedor | undefined> {
  await delay(100);
  return structuredClone(_mockFornecedores.find((f) => f.id === id));
}
export async function updateFornecedor(
  updatedFornecedor: Fornecedor,
): Promise<Fornecedor> {
  await delay(300);
  const index = _mockFornecedores.findIndex(
    (f) => f.id === updatedFornecedor.id,
  );
  if (index !== -1) {
    _mockFornecedores[index] = updatedFornecedor;
  }
  return structuredClone(updatedFornecedor);
}
export async function addFornecedor(
  newFornecedor: Fornecedor,
): Promise<Fornecedor> {
  await delay(300);
  _mockFornecedores.push(newFornecedor);
  return structuredClone(newFornecedor);
}
export async function deleteFornecedor(id: string): Promise<void> {
  await delay(200);
  const index = _mockFornecedores.findIndex((f) => f.id === id);
  if (index !== -1) {
    _mockFornecedores.splice(index, 1);
  }
}
export async function getFornecedorPagamentos(
  id: string,
): Promise<PagamentoFornecedor[]> {
  await delay(200);
  // No mock, vamos gerar pagamentos baseados nos itens vendidos para o fornecedor
  const itensVendidosDoFornecedor = _mockItensConsignados.filter(
    (item) => item.fornecedorId === id && item.status === "vendido",
  );

  const generatedPayments: PagamentoFornecedor[] = [];
  itensVendidosDoFornecedor.forEach((item) => {
    // Adicionar pagamentos pendentes padrão para itens vendidos
    generatedPayments.push({
      id: `pg-credito-${item.id}`,
      fornecedorId: id,
      vendaId: item.id,
      valor: item.precoVenda * 0.5,
      tipo: "credito_loja",
      porcentagem: 50,
      status: "pendente",
      dataPagamento: addDays(item.dataInicioConsignacao, 10),
    });
    generatedPayments.push({
      id: `pg-dinheiro-${item.id}`,
      fornecedorId: id,
      vendaId: item.id,
      valor: item.precoVenda * 0.4,
      tipo: "dinheiro",
      porcentagem: 40,
      status: "pendente",
      dataPagamento: addDays(item.dataInicioConsignacao, 10),
    });
  });

  // Incluir pagamentos hardcoded (se não forem duplicados)
  _mockPagamentos.forEach((mp) => {
    if (
      mp.fornecedorId === id &&
      !generatedPayments.some((gp) => gp.id === mp.id)
    ) {
      generatedPayments.push(mp);
    }
  });

  return structuredClone(
    generatedPayments.sort(
      (a, b) =>
        (b.dataPagamento || new Date(0)).getTime() -
        (a.dataPagamento || new Date(0)).getTime(),
    ),
  );
}
export async function addPagamento(
  newPayment: PagamentoFornecedor,
): Promise<PagamentoFornecedor> {
  await delay(300);
  _mockPagamentos.push(newPayment);
  return structuredClone(newPayment);
}
export async function updatePagamento(
  updatedPayment: PagamentoFornecedor,
): Promise<PagamentoFornecedor> {
  await delay(300);
  const index = _mockPagamentos.findIndex((p) => p.id === updatedPayment.id);
  if (index !== -1) {
    _mockPagamentos[index] = updatedPayment;
  }
  return structuredClone(updatedPayment);
}

// --- Itens de Garimpo ---
export async function getItensGarimpo(): Promise<ItemGarimpo[]> {
  await delay(200);
  return structuredClone(_mockItensGarimpo);
}
export async function getItemGarimpoById(
  id: string,
): Promise<ItemGarimpo | undefined> {
  await delay(100);
  return structuredClone(_mockItensGarimpo.find((i) => i.id === id));
}
export async function addItemGarimpo(
  newItem: ItemGarimpo,
): Promise<ItemGarimpo> {
  await delay(300);
  _mockItensGarimpo.push(newItem);
  return structuredClone(newItem);
}
export async function updateItemGarimpo(
  updatedItem: ItemGarimpo,
): Promise<ItemGarimpo> {
  await delay(300);
  const index = _mockItensGarimpo.findIndex((i) => i.id === updatedItem.id);
  if (index !== -1) {
    _mockItensGarimpo[index] = updatedItem;
  }
  return structuredClone(updatedItem);
}
export async function deleteItemGarimpo(id: string): Promise<void> {
  await delay(200);
  const index = _mockItensGarimpo.findIndex((i) => i.id === id);
  if (index !== -1) {
    _mockItensGarimpo.splice(index, 1);
  }
}

// --- Itens de Consignação ---
export async function getItensConsignados(): Promise<ItemConsignacao[]> {
  await delay(200);
  return structuredClone(_mockItensConsignados);
}
export async function getItemConsignadoById(
  id: string,
): Promise<ItemConsignacao | undefined> {
  await delay(100);
  return structuredClone(_mockItensConsignados.find((i) => i.id === id));
}
export async function addItemConsignado(
  newItem: ItemConsignacao,
): Promise<ItemConsignacao> {
  await delay(300);
  _mockItensConsignados.push(newItem);
  return structuredClone(newItem);
}
export async function updateItemConsignado(
  updatedItem: ItemConsignacao,
): Promise<ItemConsignacao> {
  await delay(300);
  const index = _mockItensConsignados.findIndex((i) => i.id === updatedItem.id);
  if (index !== -1) {
    _mockItensConsignados[index] = updatedItem;
  }
  return structuredClone(updatedItem);
}
export async function deleteItemConsignado(id: string): Promise<void> {
  await delay(200);
  const index = _mockItensConsignados.findIndex((i) => i.id === id);
  if (index !== -1) {
    _mockItensConsignados.splice(index, 1);
  }
}

// --- Vendas ---
export async function getVendas(): Promise<Venda[]> {
  await delay(300);
  return structuredClone(_mockHistoricoVendas);
}
export async function getVendaById(id: string): Promise<Venda | undefined> {
  await delay(150);
  return structuredClone(_mockHistoricoVendas.find((v) => v.id === id));
}
export async function addVenda(newVenda: Venda): Promise<Venda> {
  await delay(500);
  _mockHistoricoVendas.push(newVenda);

  // Simular atualização de status dos itens vendidos
  newVenda.itens.forEach((vendaItem) => {
    const garimpoItem = _mockItensGarimpo.find(
      (i) => i.id === vendaItem.itemId,
    );
    if (garimpoItem) {
      garimpoItem.status = "vendido";
    }
    const consignadoItem = _mockItensConsignados.find(
      (i) => i.id === vendaItem.itemId,
    );
    if (consignadoItem) {
      consignadoItem.status = "vendido";
      // No caso de consignado, também gerar pagamentos para o fornecedor
      _mockPagamentos.push(
        {
          id: crypto.randomUUID(),
          fornecedorId: consignadoItem.fornecedorId,
          vendaId: newVenda.id,
          valor: vendaItem.precoVenda * 0.5,
          tipo: "credito_loja",
          porcentagem: 50,
          status: "pendente",
          dataPagamento: new Date(),
        },
        {
          id: crypto.randomUUID(),
          fornecedorId: consignadoItem.fornecedorId,
          vendaId: newVenda.id,
          valor: vendaItem.precoVenda * 0.4,
          tipo: "dinheiro",
          porcentagem: 40,
          status: "pendente",
          dataPagamento: new Date(),
        },
      );
    }
    // Adicionar a venda ao histórico de compras do cliente
    const cliente = _mockClientes.find((c) => c.id === newVenda.clienteId);
    if (cliente && !cliente.historicoCompras.includes(newVenda.id)) {
      cliente.historicoCompras.push(newVenda.id);
    }
  });
  return structuredClone(newVenda);
}
export async function estornarVenda(id: string): Promise<void> {
  await delay(400);
  const index = _mockHistoricoVendas.findIndex((v) => v.id === id);
  if (index !== -1) {
    const estornada = _mockHistoricoVendas.splice(index, 1)[0];
    // Lógica de reversão de status de itens... (complexa para mock simples)
    console.log(`Venda ${id} estornada (removida do mock).`);

    // Remover pagamentos gerados por esta venda no mock
    _mockPagamentos.filter((p) => p.vendaId !== estornada.id);

    // Remover do histórico de compras do cliente
    const cliente = _mockClientes.find((c) => c.id === estornada.clienteId);
    if (cliente) {
      cliente.historicoCompras = cliente.historicoCompras.filter(
        (vId) => vId !== estornada.id,
      );
    }
  }
}

// --- Clientes ---
export async function getClientes(): Promise<Cliente[]> {
  await delay(200);
  return structuredClone(_mockClientes);
}
export async function getClienteById(id: string): Promise<Cliente | undefined> {
  await delay(100);
  return structuredClone(_mockClientes.find((c) => c.id === id));
}
export async function addCliente(newCliente: Cliente): Promise<Cliente> {
  await delay(300);
  _mockClientes.push(newCliente);
  return structuredClone(newCliente);
}
export async function updateCliente(updatedCliente: Cliente): Promise<Cliente> {
  await delay(300);
  const index = _mockClientes.findIndex((c) => c.id === updatedCliente.id);
  if (index !== -1) {
    _mockClientes[index] = updatedCliente;
  }
  return structuredClone(updatedCliente);
}
export async function deleteCliente(id: string): Promise<void> {
  await delay(200);
  const index = _mockClientes.findIndex((c) => c.id === id);
  if (index !== -1) {
    _mockClientes.splice(index, 1);
    // Em um app real, também lidaria com a remoção do cliente das vendas, etc.
  }
}
