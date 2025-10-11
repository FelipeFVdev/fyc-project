// src/components/fornecedores/PerfilFornecedor.tsx
import { Fornecedor, Venda, ItemConsignacao } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ExternalLink } from "lucide-react";
import { useState } from "react";

interface PerfilFornecedorProps {
  fornecedorId: string;
}

// Mock de dados para um fornecedor específico
const mockFornecedor: Fornecedor = {
  id: "f1",
  nome: "Maria da Silva",
  cpf: "11122233344",
  telefone: "11987654321",
  email: "maria@example.com",
  endereco: {
    rua: "Rua Principal",
    numero: "100",
    complemento: "Apto 10",
    bairro: "Centro",
    cidade: "São Paulo",
    estado: "SP",
    cep: "01000000",
  },
  tamanhoPreferencia: ["M", "G", "40"],
  numeroVendas: 15,
  status: "ativo",
  dataCadastro: new Date("2024-01-15"),
  senha: "hashed_password_example",
};

// Mock de itens consignados da Maria
const mockItensConsignados: ItemConsignacao[] = [
  {
    id: "ic1",
    fornecedorId: "f1",
    codigoFornecedor: "MDS001",
    dataInicioConsignacao: new Date("2024-05-01"),
    dataExpiracao: new Date("2024-08-01"),
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
    dataInicioConsignacao: new Date("2024-06-10"),
    dataExpiracao: new Date("2024-09-10"),
    status: "disponivel",
    precoVenda: 50.0,
    marca: "Levi's",
    tamanho: "40",
    categoria: "Calça Jeans",
    descricao: "Calça jeans reta",
  },
  {
    id: "ic3",
    fornecedorId: "f1",
    codigoFornecedor: "MDS003",
    dataInicioConsignacao: new Date("2024-04-01"),
    dataExpiracao: new Date("2024-07-01"),
    status: "expirado",
    precoVenda: 30.0,
    marca: "C&A",
    tamanho: "G",
    categoria: "Blusa",
    descricao: "Blusa de seda preta",
  },
];

// Mock de vendas para simular o histórico
const mockHistoricoVendas: Venda[] = [
  {
    id: "v1",
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
    id: "v2",
    dataVenda: new Date("2024-06-20"),
    clienteNome: "Cliente Teste 2",
    itens: [
      {
        itemId: "garimpo-1",
        tipo: "garimpo",
        precoVenda: 30.0,
        custoBase: 15.0,
      },
      {
        itemId: "consignado-x",
        tipo: "consignacao",
        precoVenda: 100.0,
        custoBase: 50.0,
      },
    ],
    valorTotal: 130.0,
    custoTotal: 65.0,
    margemLucro: 65.0,
    formaPagamento: "cartao",
  },
];

export default function PerfilFornecedor({
  fornecedorId,
}: PerfilFornecedorProps) {
  // Em um app real, você buscaria o fornecedor e seus dados reais com base no fornecedorId
  const [fornecedor] = useState<Fornecedor | null>(
    fornecedorId === "f1" ? mockFornecedor : null
  );
  const [itensConsignados] = useState<ItemConsignacao[]>(mockItensConsignados);
  const [historicoVendas] = useState<Venda[]>(mockHistoricoVendas);

  if (!fornecedor) {
    return (
      <div className="text-center py-10">
        <h1 className="text-3xl font-bold mb-4">Fornecedor não encontrado.</h1>
        <p className="text-lg text-gray-600">
          Verifique o ID ou tente novamente.
        </p>
        <Button
          onClick={() => (window.location.href = "/fornecedores")}
          className="mt-6"
        >
          Voltar para a lista
        </Button>
      </div>
    );
  }

  // Função para formatar CPF para exibição
  const formatCpfDisplay = (cpf: string) => {
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
  };

  // Função para formatar Telefone para exibição
  const formatTelefoneDisplay = (telefone: string) => {
    const cleaned = telefone.replace(/\D/g, "");
    if (cleaned.length === 11) {
      return `(${cleaned.substring(0, 2)}) ${cleaned.substring(
        2,
        7
      )}-${cleaned.substring(7, 11)}`;
    } else if (cleaned.length === 10) {
      return `(${cleaned.substring(0, 2)}) ${cleaned.substring(
        2,
        6
      )}-${cleaned.substring(6, 10)}`;
    }
    return telefone;
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-extrabold text-gray-900">
          Perfil do Fornecedor: {fornecedor.nome}
        </h1>
        <div className="flex gap-4">
          <Button variant="outline">Editar Fornecedor</Button>
          <Button variant="destructive">Excluir Fornecedor</Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informações Gerais</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4 text-gray-700">
          <div>
            <p className="font-semibold">ID:</p>
            <p>{fornecedor.id}</p>
          </div>
          <div>
            <p className="font-semibold">CPF:</p>
            <p>{formatCpfDisplay(fornecedor.cpf)}</p>
          </div>
          <div>
            <p className="font-semibold">Telefone:</p>
            <p>{formatTelefoneDisplay(fornecedor.telefone)}</p>
          </div>
          <div>
            <p className="font-semibold">Email:</p>
            <p>{fornecedor.email || "Não informado"}</p>
          </div>
          <div>
            <p className="font-semibold">Status:</p>
            <Badge
              variant={fornecedor.status === "ativo" ? "default" : "secondary"}
            >
              {fornecedor.status === "ativo" ? "Ativo" : "Inativo"}
            </Badge>
          </div>
          <div>
            <p className="font-semibold">Data de Cadastro:</p>
            <p>
              {format(fornecedor.dataCadastro, "dd/MM/yyyy", { locale: ptBR })}
            </p>
          </div>
          <div>
            <p className="font-semibold">Vendas Totais:</p>
            <p>{fornecedor.numeroVendas}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Endereço</CardTitle>
        </CardHeader>
        <CardContent className="text-gray-700">
          <p>
            {fornecedor.endereco.rua}, {fornecedor.endereco.numero}{" "}
            {fornecedor.endereco.complemento
              ? `- ${fornecedor.endereco.complemento}`
              : ""}
          </p>
          <p>
            {fornecedor.endereco.bairro}, {fornecedor.endereco.cidade} -{" "}
            {fornecedor.endereco.estado}
          </p>
          <p>
            CEP: {fornecedor.endereco.cep.replace(/^(\d{5})(\d{3})$/, "$1-$2")}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Preferências e Notas</CardTitle>
        </CardHeader>
        <CardContent className="text-gray-700">
          <div>
            <p className="font-semibold">Tamanhos de Preferência:</p>
            <p>
              {fornecedor.tamanhoPreferencia &&
              fornecedor.tamanhoPreferencia.length > 0
                ? fornecedor.tamanhoPreferencia.join(", ")
                : "Nenhum informado"}
            </p>
          </div>
          {/* Adicionar campo de notas se houver no futuro */}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Itens Consignados (Atuais e Expirados)</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Código Fornecedor</TableHead>
                <TableHead>Item</TableHead>
                <TableHead>Marca/Tamanho</TableHead>
                <TableHead>Preço Venda</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Início Consign.</TableHead>
                <TableHead>Expira em</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {itensConsignados.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="text-center py-4 text-gray-500"
                  >
                    Nenhum item consignado para este fornecedor.
                  </TableCell>
                </TableRow>
              ) : (
                itensConsignados.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.codigoFornecedor}</TableCell>
                    <TableCell>
                      {item.categoria} ({item.descricao?.substring(0, 20)}...)
                    </TableCell>
                    <TableCell>
                      {item.marca} / {item.tamanho}
                    </TableCell>
                    <TableCell className="font-semibold">
                      R$ {item.precoVenda.toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          item.status === "disponivel"
                            ? "default"
                            : item.status === "vendido"
                            ? "secondary"
                            : "destructive"
                        }
                      >
                        {item.status === "disponivel"
                          ? "Disponível"
                          : item.status === "vendido"
                          ? "Vendido"
                          : "Expirado"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {format(item.dataInicioConsignacao, "dd/MM/yyyy", {
                        locale: ptBR,
                      })}
                    </TableCell>
                    <TableCell>
                      {format(item.dataExpiracao, "dd/MM/yyyy", {
                        locale: ptBR,
                      })}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Histórico de Vendas (Itens Consignados)</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data da Venda</TableHead>
                <TableHead>Item(s)</TableHead>
                <TableHead>Valor Total</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Ação</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {historicoVendas.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center py-4 text-gray-500"
                  >
                    Nenhuma venda registrada para este fornecedor.
                  </TableCell>
                </TableRow>
              ) : (
                historicoVendas.map((venda) => (
                  <TableRow key={venda.id}>
                    <TableCell>
                      {format(venda.dataVenda, "dd/MM/yyyy", { locale: ptBR })}
                    </TableCell>
                    <TableCell>
                      {venda.itens
                        .filter((item) => item.tipo === "consignacao")
                        .map((item, index) => (
                          <div key={index}>
                            <Badge variant="outline">{item.itemId}</Badge> (R${" "}
                            {item.precoVenda.toFixed(2)})
                          </div>
                        ))}
                    </TableCell>
                    <TableCell className="font-semibold">
                      R$ {venda.valorTotal.toFixed(2)}
                    </TableCell>
                    <TableCell>{venda.clienteNome}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm" asChild>
                        <a href={`/vendas/${venda.id}`}>
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Adicionar seção para extrato financeiro/pagamentos pendentes aqui no futuro */}
    </div>
  );
}
