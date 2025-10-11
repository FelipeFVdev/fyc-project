// src/components/fornecedores/ListaFornecedores.tsx
"use client"; // Precisa de "use client" porque usa hooks de React

import React, { useState } from "react"; // Explicitamente React
import type { Fornecedor } from "@/types";
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
  DropdownMenu, // Manter se precisar do DropdownMenu em outro lugar aqui
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Search, Filter } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

import { formatCpf, formatTelefone } from "@/lib/utils"; // Funções utilitárias

// --- NOVO COMPONENTE DE AÇÕES ---
import FornecedorAcoes from "./AcoesFornecedor";

// --- IMPORTAR FUNÇÃO DE FETCH E HOOKS DO TANSTACK QUERY ---
import { getFornecedores } from "@/lib/db";
import { useQuery } from "@tanstack/react-query";
import { queryClient } from "@/store";

export default function ListaFornecedores() {
  const [busca, setBusca] = useState("");
  const [filtroStatus, setFiltroStatus] = useState<
    "todos" | "ativo" | "inativo"
  >("todos");

  // --- BUSCAR FORNECEDORES COM USEQUERY ---
  const {
    data: fornecedores,
    isLoading,
    isError,
  } = useQuery(
    {
      queryKey: ["fornecedores"],
      queryFn: getFornecedores,
    },
    queryClient
  );

  // --- LÓGICA DE CARREGAMENTO E ERRO ---
  if (isLoading)
    return <div className="text-center py-8">Carregando fornecedores...</div>;
  if (isError)
    return (
      <div className="text-center py-8 text-red-600">
        Erro ao carregar fornecedores.
      </div>
    );
  if (!fornecedores)
    return (
      <div className="text-center py-8">Nenhum fornecedor encontrado.</div>
    );
  // --- FIM LÓGICA DE CARREGAMENTO ---

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

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Gestão de Fornecedores</h1>
        <a href="/fornecedores/novo">
          <Button>Novo Fornecedor</Button>
        </a>
      </div>

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
                    {fornecedor.nome}
                  </TableCell>
                  <TableCell>{formatCpf(fornecedor.cpf)}</TableCell>
                  <TableCell>{formatTelefone(fornecedor.telefone)}</TableCell>
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
                    {/* Usando o novo componente de ações */}
                    <FornecedorAcoes fornecedor={fornecedor} />
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
