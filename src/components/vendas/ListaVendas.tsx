// src/components/vendas/ListaVendas.tsx
"use client";

import React, { useState, useMemo } from "react";
import type { Venda, Cliente } from "@/types";
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

import { getVendas, getClientes } from "@/lib/db";
import { useQuery } from "@tanstack/react-query";
import { queryClient } from "@/store";

import { formatCpf } from "@/lib/utils";

export default function ListaVendas() {
  // --- CHAME TODOS OS HOOKS PRIMEIRO ---
  const [busca, setBusca] = useState("");
  const [filtroPagamento, setFiltroPagamento] = useState<
    "todos" | "dinheiro" | "pix" | "cartao" | "credito_loja"
  >("todos");

  const {
    data: vendas,
    isLoading: isLoadingVendas,
    isError: isErrorVendas,
  } = useQuery(
    {
      queryKey: ["vendas"],
      queryFn: getVendas,
    },
    queryClient
  );

  const {
    data: clientes,
    isLoading: isLoadingClientes,
    isError: isErrorClientes,
  } = useQuery(
    {
      queryKey: ["clientes"],
      queryFn: getClientes,
    },
    queryClient
  );

  // Garantir que 'vendas' e 'clientes' não são undefined para useMemo/map
  const actualVendas = vendas || [];
  const actualClientes = clientes || [];

  const clienteMap = useMemo(() => {
    return new Map(
      actualClientes.map((c) => [c.id, { nome: c.nome, cpf: c.cpf }])
    );
  }, [actualClientes]);

  const vendasFiltradas = useMemo(() => {
    // Mover o filtro para useMemo
    return actualVendas.filter((venda) => {
      const clienteInfo = venda.clienteId
        ? clienteMap.get(venda.clienteId)
        : null;
      const clienteCpf = clienteInfo?.cpf ? formatCpf(clienteInfo.cpf) : "";

      const matchBusca =
        venda.clienteNome.toLowerCase().includes(busca.toLowerCase()) ||
        venda.id.toLowerCase().includes(busca.toLowerCase()) ||
        clienteCpf.toLowerCase().includes(busca.toLowerCase()) ||
        venda.itens.some((item) =>
          item.itemId.toLowerCase().includes(busca.toLowerCase())
        );

      const matchPagamento =
        filtroPagamento === "todos" || venda.formaPagamento === filtroPagamento;

      return matchBusca && matchPagamento;
    });
  }, [actualVendas, busca, filtroPagamento, clienteMap]); // Dependências

  // --- FIM DOS HOOKS ---

  // --- AGORA, AS CONDIÇÕES DE RETORNO PRECOCE ---
  if (isLoadingVendas || isLoadingClientes) {
    return (
      <div className="flex justify-center items-center h-48">
        <p className="text-xl text-neutral-700">
          Carregando vendas e clientes...
        </p>
      </div>
    );
  }

  if (isErrorVendas || isErrorClientes) {
    return (
      <div className="text-center py-8 text-red-600">
        Erro ao carregar vendas ou clientes.
      </div>
    );
  }
  // --- FIM DAS CONDIÇÕES ---

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Gestão de Vendas</h1>
        <a href="/vendas/novo">
          <Button>Registrar Nova Venda</Button>
        </a>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
          <Input
            placeholder="Buscar por cliente, ID da venda ou item..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="pl-9"
          />
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              <Filter className="mr-2 h-4 w-4" />
              Pagamento:{" "}
              {filtroPagamento === "todos"
                ? "Todos"
                : filtroPagamento === "credito_loja"
                ? "Crédito Loja"
                : filtroPagamento.charAt(0).toUpperCase() +
                  filtroPagamento.slice(1)}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => setFiltroPagamento("todos")}>
              Todos
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setFiltroPagamento("dinheiro")}>
              Dinheiro
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setFiltroPagamento("pix")}>
              PIX
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setFiltroPagamento("cartao")}>
              Cartão
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => setFiltroPagamento("credito_loja")}
            >
              Crédito de Loja
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID da Venda</TableHead>
              <TableHead>Data</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Itens</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Lucro</TableHead>
              <TableHead>Pagamento</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {vendasFiltradas.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={8}
                  className="text-center py-8 text-neutral-500"
                >
                  Nenhuma venda encontrada.
                </TableCell>
              </TableRow>
            ) : (
              vendasFiltradas.map((venda) => (
                <TableRow key={venda.id}>
                  <TableCell className="font-mono text-xs">
                    {venda.id.slice(0, 8)}
                  </TableCell>
                  <TableCell>
                    {format(venda.dataVenda, "dd/MM/yyyy", { locale: ptBR })}
                  </TableCell>
                  <TableCell>
                    {venda.clienteNome}
                    {venda.clienteId &&
                      clienteMap.get(venda.clienteId)?.cpf && (
                        <p className="text-xs text-neutral-500">
                          (CPF:{" "}
                          {formatCpf(clienteMap.get(venda.clienteId)!.cpf!)})
                        </p>
                      )}
                  </TableCell>
                  <TableCell>
                    {venda.itens.map((item, idx) => (
                      <Badge
                        key={idx}
                        variant={
                          item.tipo === "garimpo" ? "default" : "secondary"
                        }
                        className="mr-1 mb-1"
                      >
                        {item.itemId.slice(0, 5)}...
                      </Badge>
                    ))}
                  </TableCell>
                  <TableCell className="font-semibold">
                    R$ {venda.valorTotal.toFixed(2)}
                  </TableCell>
                  <TableCell className="text-green-600 font-semibold">
                    R$ {venda.margemLucro.toFixed(2)}
                  </TableCell>
                  <TableCell>{venda.formaPagamento}</TableCell>
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
                            (window.location.href = `/vendas/${venda.id}`)
                          }
                        >
                          Ver detalhes
                        </DropdownMenuItem>
                        <DropdownMenuItem>Editar</DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600">
                          Estornar
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
