// src/components/fornecedores/ListaFornecedores.tsx
import { useState } from "react";
import { Fornecedor } from "@/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Search, Filter } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

// Mock data - substituir por dados reais
const mockFornecedores: Fornecedor[] = [
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
      estado: "SP",
      cep: "01000000",
    },
    tamanhoPreferencia: ["M", "G", "40"],
    numeroVendas: 15,
    status: "ativo",
    dataCadastro: new Date("2024-01-15"),
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
      estado: "RJ",
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
      estado: "MG",
      cep: "30000000",
    },
    tamanhoPreferencia: ["GG", "44"],
    numeroVendas: 0,
    status: "inativo",
    dataCadastro: new Date("2024-02-10"),
  },
];

export default function ListaFornecedores() {
  const [fornecedores] = useState<Fornecedor[]>(mockFornecedores); // Em um app real, viria de um hook/API
  const [busca, setBusca] = useState("");
  const [filtroStatus, setFiltroStatus] = useState<
    "todos" | "ativo" | "inativo"
  >("todos");

  const fornecedoresFiltrados = fornecedores.filter((fornecedor) => {
    const matchBusca =
      fornecedor.nome.toLowerCase().includes(busca.toLowerCase()) ||
      fornecedor.cpf.includes(busca.replace(/\D/g, "")) ||
      fornecedor.telefone.includes(busca.replace(/\D/g, "")) ||
      fornecedor.email?.toLowerCase().includes(busca.toLowerCase());

    const matchStatus =
      filtroStatus === "todos" || fornecedor.status === filtroStatus;

    return matchBusca && matchStatus;
  });

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
    return telefone; // Retorna como está se não conseguir formatar
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Gestão de Fornecedores</h1>
        <a href="/fornecedores/novo">
          <Button>Novo Fornecedor</Button>
        </a>
      </div>

      {/* Filtros */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Buscar por nome, CPF, telefone ou email..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="pl-9"
          />
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              <Filter className="mr-2 h-4 w-4" />
              Status:{" "}
              {filtroStatus === "todos"
                ? "Todos"
                : filtroStatus === "ativo"
                ? "Ativo"
                : "Inativo"}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => setFiltroStatus("todos")}>
              Todos
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setFiltroStatus("ativo")}>
              Ativo
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setFiltroStatus("inativo")}>
              Inativo
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Tabela */}
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>CPF</TableHead>
              <TableHead>Telefone</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Vendas</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Cadastro</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {fornecedoresFiltrados.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={8}
                  className="text-center py-8 text-gray-500"
                >
                  Nenhum fornecedor encontrado.
                </TableCell>
              </TableRow>
            ) : (
              fornecedoresFiltrados.map((fornecedor) => (
                <TableRow key={fornecedor.id}>
                  <TableCell className="font-medium">
                    <a
                      href={`/fornecedores/${fornecedor.id}`}
                      className="text-blue-600 hover:underline"
                    >
                      {fornecedor.nome}
                    </a>
                  </TableCell>
                  <TableCell>{formatCpfDisplay(fornecedor.cpf)}</TableCell>
                  <TableCell>
                    {formatTelefoneDisplay(fornecedor.telefone)}
                  </TableCell>
                  <TableCell>{fornecedor.email || "-"}</TableCell>
                  <TableCell>{fornecedor.numeroVendas}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        fornecedor.status === "ativo" ? "default" : "secondary"
                      }
                    >
                      {fornecedor.status === "ativo" ? "Ativo" : "Inativo"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {format(fornecedor.dataCadastro, "dd/MM/yyyy", {
                      locale: ptBR,
                    })}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() =>
                            (window.location.href = `/fornecedores/${fornecedor.id}`)
                          }
                        >
                          Ver perfil
                        </DropdownMenuItem>
                        <DropdownMenuItem>Editar</DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600">
                          Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
