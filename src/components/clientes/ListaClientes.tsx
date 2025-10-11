// src/components/clientes/ListaClientes.tsx
"use client";

import React, { useState, useMemo } from "react";
import type { Cliente } from "@/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge"; // Não usado, pode remover ou ajustar
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Search } from "lucide-react"; // Removido Filter
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

import { getClientes, deleteCliente } from "@/lib/db";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/store";
import { toast } from "sonner";
import { formatCpf, formatTelefone } from "@/lib/utils";

export default function ListaClientes() {
  const [busca, setBusca] = useState("");
  // const [filtroStatus, setFiltroStatus] = useState<'todos' | 'ativo' | 'inativo'>('todos'); // Removido o estado, pois não há filtro de status

  const {
    data: clientes,
    isLoading,
    isError,
  } = useQuery<Cliente[], Error>(
    {
      queryKey: ["clientes"],
      queryFn: getClientes,
    },
    queryClient
  );

  const actualClientes = clientes || [];

  const clientesFiltrados = useMemo(() => {
    return actualClientes.filter((cliente) => {
      const matchBusca =
        cliente.nome.toLowerCase().includes(busca.toLowerCase()) ||
        cliente.cpf?.includes(busca.replace(/\D/g, "")) ||
        cliente.telefone.includes(busca.replace(/\D/g, "")) ||
        cliente.email?.toLowerCase().includes(busca.toLowerCase());

      // Como não há filtro de status, a condição é simplesmente o match da busca.
      // Se você adicionar status ao Cliente, reative o filtro aqui.
      return matchBusca;
    });
  }, [actualClientes, busca]); // Removido filtroStatus das dependências

  const deleteMutation = useMutation(
    {
      mutationFn: deleteCliente,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["clientes"] });
        queryClient.invalidateQueries({ queryKey: ["vendas"] });
        toast.success("Cliente Excluído!", {
          description: "O cliente foi removido.",
        });
      },
      onError: (error) => {
        toast.error("Erro na Exclusão", {
          description: error.message || "Não foi possível excluir o cliente.",
        });
      },
    },
    queryClient
  );

  const handleDelete = (clienteId: string, clienteNome: string) => {
    if (
      window.confirm(`Tem certeza que deseja excluir o cliente ${clienteNome}?`)
    ) {
      deleteMutation.mutate(clienteId);
    }
  };
  // --- FIM DOS HOOKS ---

  // --- AGORA, AS CONDIÇÕES DE RETORNO PRECOCE (APÓS TODOS OS HOOKS) ---
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-48">
        <p className="text-xl text-gray-700">Carregando clientes...</p>
      </div>
    );
  }

  if (isError) {
    console.error("Erro na busca de dados para ListaClientes:", {
      isError,
      clientesExists: !!clientes,
    });
    return (
      <div className="text-center py-8 text-red-600">
        Erro ao carregar clientes.
      </div>
    );
  }
  // --- FIM DAS CONDIÇÕES DE RETORNO PRECOCE ---

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Gestão de Clientes</h1>
        <a href="/clientes/novo">
          <Button>Novo Cliente</Button>
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
            disabled={deleteMutation.isPending}
          />
        </div>

        {/* O FILTRO DE STATUS FOI REMOVIDO PORQUE O ESQUEMA DE CLIENTE NÃO TEM STATUS. */}
        {/* Se você adicionar status ao Cliente no src/types/index.ts e src/lib/validations.ts,
            você pode reativar este DropdownMenu. */}
        {/* <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              <Filter className="mr-2 h-4 w-4" />
              Status: {filtroStatus === 'todos' ? 'Todos' : filtroStatus === 'ativo' ? 'Ativo' : 'Inativo'}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => setFiltroStatus('todos')}>Todos</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setFiltroStatus('ativo')}>Ativo</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setFiltroStatus('inativo')}>Inativo</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu> */}
      </div>

      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>CPF</TableHead>
              <TableHead>Telefone</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Compras</TableHead>
              <TableHead>Cadastro</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {clientesFiltrados.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="text-center py-8 text-gray-500"
                >
                  Nenhum cliente encontrado.
                </TableCell>
              </TableRow>
            ) : (
              clientesFiltrados.map((cliente) => (
                <TableRow key={cliente.id}>
                  <TableCell className="font-medium">{cliente.nome}</TableCell>
                  <TableCell>
                    {cliente.cpf ? formatCpf(cliente.cpf) : "-"}
                  </TableCell>
                  <TableCell>{formatTelefone(cliente.telefone)}</TableCell>
                  <TableCell>{cliente.email || "-"}</TableCell>
                  <TableCell>{cliente.historicoCompras.length}</TableCell>
                  <TableCell>
                    {format(cliente.dataCadastro, "dd/MM/yyyy", {
                      locale: ptBR,
                    })}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          disabled={deleteMutation.isPending}
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() =>
                            (window.location.href = `/clientes/${cliente.id}`)
                          }
                        >
                          Ver perfil
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() =>
                            toast.info("Funcionalidade em desenvolvimento", {
                              description:
                                "Em breve, você poderá editar clientes.",
                            })
                          }
                        >
                          Editar
                        </DropdownMenuItem>{" "}
                        {/* Toast provisório */}
                        <DropdownMenuItem
                          onClick={() => handleDelete(cliente.id, cliente.nome)}
                          className="text-red-600"
                        >
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
