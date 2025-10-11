"use client";

import React, { useState, useMemo } from "react";
import type { ItemGarimpo } from "@/types";
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
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Search, Filter } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";

import { getItensGarimpo, deleteItemGarimpo } from "@/lib/db";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/store";

export default function ListaItensGarimpo() {
  const [busca, setBusca] = useState("");
  const [filtroStatus, setFiltroStatus] = useState<
    "todos" | "disponivel" | "vendido"
  >("todos");

  const {
    data: itens,
    isLoading,
    isError,
  } = useQuery<ItemGarimpo[], Error>(
    {
      queryKey: ["itensGarimpo"],
      queryFn: getItensGarimpo,
    },
    queryClient
  );

  // Garantir que 'itens' não é undefined para useMemo
  const actualItens = itens || [];

  const itensFiltrados = useMemo(() => {
    // Mover a lógica de filtro para useMemo
    return actualItens.filter((item) => {
      const matchBusca =
        item.marca?.toLowerCase().includes(busca.toLowerCase()) ||
        item.categoria?.toLowerCase().includes(busca.toLowerCase());

      const matchStatus =
        filtroStatus === "todos" || item.status === filtroStatus;

      return matchBusca && matchStatus;
    });
  }, [actualItens, busca, filtroStatus]); // Depende de actualItens do useQuery

  const deleteItemMutation = useMutation(
    {
      mutationFn: deleteItemGarimpo,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["itensGarimpo"] });
        toast.success("Item Excluído!", {
          description: "O item de garimpo foi removido.",
        });
      },
      onError: (error) => {
        toast.error("Erro na Exclusão", {
          description: error.message || "Não foi possível excluir o item.",
        });
      },
    },
    queryClient
  );

  const handleAction = (
    itemId: string,
    action: "excluir" | "editar" | "ver_detalhes"
  ) => {
    if (action === "excluir") {
      if (
        window.confirm(
          `Tem certeza que deseja excluir o item ${itemId.substring(0, 8)}?`
        )
      ) {
        deleteItemMutation.mutate(itemId);
      }
    } else if (action === "ver_detalhes") {
      window.location.href = `/garimpo/${itemId}`;
    } else if (action === "editar") {
      toast.info("Funcionalidade em desenvolvimento", {
        description: "Em breve, você poderá editar itens de garimpo.",
      });
    }
  };
  // --- FIM DOS HOOKS ---

  // --- AGORA, AS CONDIÇÕES DE RETORNO PRECOCE (APÓS TODOS OS HOOKS) ---
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-48">
        <p className="text-xl text-neutral-700">
          Carregando itens de garimpo...
        </p>
      </div>
    );
  }

  if (isError) {
    // 'itens' pode ser undefined se houver erro
    console.error("Erro na busca de dados para ListaItensGarimpo:", {
      isError,
      itensExists: !!itens,
    });
    return (
      <div className="text-center py-8 text-red-600">
        Erro ao carregar itens de garimpo.
      </div>
    );
  }
  // --- FIM DAS CONDIÇÕES DE RETORNO PRECOCE ---

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Gestão de Itens de Garimpo</h1>
        <a href="/garimpo/novo">
          <Button>Novo Item de Garimpo</Button>
        </a>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
          <Input
            placeholder="Buscar por marca ou categoria..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="pl-9"
            disabled={isLoading || deleteItemMutation.isPending}
          />
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              disabled={isLoading || deleteItemMutation.isPending}
            >
              <Filter className="mr-2 h-4 w-4" />
              Status:{" "}
              {filtroStatus === "todos"
                ? "Todos"
                : filtroStatus === "disponivel"
                ? "Disponível"
                : "Vendido"}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => setFiltroStatus("todos")}>
              Todos
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setFiltroStatus("disponivel")}>
              Disponível
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setFiltroStatus("vendido")}>
              Vendido
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Marca</TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead>Tamanho</TableHead>
              <TableHead>Custo Total</TableHead>
              <TableHead>Preço Venda</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Data Entrada</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {itensFiltrados.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={9}
                  className="text-center py-8 text-neutral-500"
                >
                  Nenhum item de garimpo encontrado.
                </TableCell>
              </TableRow>
            ) : (
              itensFiltrados.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-mono text-xs">
                    {item.id.slice(0, 8)}
                  </TableCell>
                  <TableCell>{item.marca || "-"}</TableCell>
                  <TableCell>{item.categoria || "-"}</TableCell>
                  <TableCell>{item.tamanho || "-"}</TableCell>
                  <TableCell>
                    R$ {(item.custoCompra + item.custosAdicionais).toFixed(2)}
                  </TableCell>
                  <TableCell className="font-semibold">
                    R$ {item.precoVenda.toFixed(2)}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        item.status === "disponivel" ? "default" : "secondary"
                      }
                    >
                      {item.status === "disponivel" ? "Disponível" : "Vendido"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {format(item.dataEntradaEstoque, "dd/MM/yyyy", {
                      locale: ptBR,
                    })}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          disabled={deleteItemMutation.isPending}
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => handleAction(item.id, "ver_detalhes")}
                        >
                          Ver detalhes
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleAction(item.id, "editar")}
                        >
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => handleAction(item.id, "excluir")}
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
