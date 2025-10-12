"use client";

import React, { useState, useMemo } from "react";
import type { ItemConsignacao, Fornecedor } from "@/types";
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
import { format, isPast, isBefore, addDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";

import {
  getItensConsignados,
  getFornecedores,
  updateItemConsignado,
  deleteItemConsignado, // Assumindo que esta função está no db.ts
} from "@/lib/db";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/store";

export default function GestaoConsignacao() {
  // --- CHAME TODOS OS HOOKS PRIMEIRO (antes de qualquer 'return' condicional) ---

  const [busca, setBusca] = useState("");
  const [filtroStatus, setFiltroStatus] = useState<
    | "todos"
    | "disponivel"
    | "vendido"
    | "expirado"
    | "proximo_expiracao"
    | "devolvido"
  >("todos");

  const {
    data: itens,
    isLoading: isLoadingItens,
    isError: isErrorItens,
  } = useQuery<ItemConsignacao[], Error>(
    {
      queryKey: ["itensConsignados"],
      queryFn: getItensConsignados,
    },
    queryClient
  );

  const {
    data: fornecedores,
    isLoading: isLoadingFornecedores,
    isError: isErrorFornecedores,
  } = useQuery<Fornecedor[], Error>(
    {
      queryKey: ["fornecedores"],
      queryFn: getFornecedores,
    },
    queryClient
  );

  // Garantir que 'itens' e 'fornecedores' não são undefined para useMemo e map
  const actualItens = itens || [];
  const actualFornecedores = fornecedores || [];

  const fornecedorMap = useMemo(() => {
    return new Map(actualFornecedores.map((f) => [f.id, f.nome]));
  }, [actualFornecedores]); // Depende de actualFornecedores

  const itensFiltrados = useMemo(() => {
    // Mover a lógica de filtro para useMemo
    return actualItens.filter((item) => {
      const matchBusca =
        item.marca?.toLowerCase().includes(busca.toLowerCase()) ||
        item.categoria?.toLowerCase().includes(busca.toLowerCase()) ||
        item.codigoFornecedor.toLowerCase().includes(busca.toLowerCase()) ||
        fornecedorMap
          .get(item.fornecedorId)
          ?.toLowerCase()
          .includes(busca.toLowerCase());

      const isExpiringSoon =
        isBefore(item.dataExpiracao, addDays(new Date(), 30)) &&
        !isPast(item.dataExpiracao);

      let matchStatus = true;
      if (filtroStatus === "disponivel") {
        matchStatus =
          item.status === "disponivel" && !isPast(item.dataExpiracao);
      } else if (filtroStatus === "vendido") {
        matchStatus = item.status === "vendido";
      } else if (filtroStatus === "expirado") {
        matchStatus =
          isPast(item.dataExpiracao) &&
          item.status !== "vendido" &&
          item.status !== "devolvido";
      } else if (filtroStatus === "proximo_expiracao") {
        matchStatus = isExpiringSoon && item.status === "disponivel";
      } else if (filtroStatus === "devolvido") {
        matchStatus = item.status === "devolvido";
      } else if (filtroStatus !== "todos") {
        matchStatus = item.status === filtroStatus;
      }

      return matchBusca && matchStatus;
    });
  }, [actualItens, busca, filtroStatus, fornecedorMap]); // Dependências

  const getStatusBadgeVariant = (item: ItemConsignacao) => {
    const today = new Date();
    const isPastDate =
      format(item.dataExpiracao, "yyyy-MM-dd") < format(today, "yyyy-MM-dd");
    const isSoon =
      format(item.dataExpiracao, "yyyy-MM-dd") <
        format(addDays(today, 30), "yyyy-MM-dd") && !isPastDate;

    if (item.status === "vendido") return "success";
    if (item.status === "devolvido") return "info";
    if (isPastDate) return "destructive";
    if (isSoon) return "yellow";
    return "default";
  };

  const getStatusText = (item: ItemConsignacao) => {
    const today = new Date();
    const isPastDate =
      format(item.dataExpiracao, "yyyy-MM-dd") < format(today, "yyyy-MM-dd");
    const isSoon =
      format(item.dataExpiracao, "yyyy-MM-dd") <
        format(addDays(today, 30), "yyyy-MM-dd") && !isPastDate;

    if (item.status === "vendido") return "Vendido";
    if (item.status === "devolvido") return "Devolvido";
    if (isPastDate) return "Expirado";
    if (isSoon) return "Próximo a Expirar";
    return "Disponível";
  };

  const updateItemMutation = useMutation(
    {
      mutationFn: updateItemConsignado,
      onSuccess: (updatedItem) => {
        queryClient.invalidateQueries({ queryKey: ["itensConsignados"] });
        queryClient.invalidateQueries({
          queryKey: ["itemConsignado", updatedItem.id],
        });
        queryClient.invalidateQueries({
          queryKey: ["fornecedor", updatedItem.fornecedorId],
        });
        queryClient.invalidateQueries({ queryKey: ["vendas"] }); // Pode invalidar vendas se mudar o status de um item de venda
        toast.success("Item Atualizado!", {
          description: `Item ${updatedItem.codigoFornecedor} marcado como '${updatedItem.status}'.`,
        });
      },
      onError: (error) => {
        toast.error("Erro na Atualização", {
          description: error.message || "Não foi possível atualizar o item.",
        });
      },
    },
    queryClient
  );

  const deleteItemMutation = useMutation(
    {
      mutationFn: deleteItemConsignado,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["itensConsignados"] });
        toast.success("Item Excluído!", {
          description: "O item consignado foi removido.",
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
    action: "marcar_vendido" | "marcar_devolvido" | "excluir"
  ) => {
    const itemToUpdate = actualItens.find((item) => item.id === itemId); // Usar actualItens
    if (!itemToUpdate) return;

    if (action === "excluir") {
      if (
        window.confirm(
          `Tem certeza que deseja excluir o item ${itemToUpdate.codigoFornecedor}?`
        )
      ) {
        deleteItemMutation.mutate(itemId);
      }
    } else {
      updateItemMutation.mutate({
        ...itemToUpdate,
        status: action === "marcar_vendido" ? "vendido" : "devolvido",
      });
    }
  };

  // --- FIM DOS HOOKS ---

  // --- AGORA, AS CONDIÇÕES DE RETORNO PRECOCE (APÓS TODOS OS HOOKS) ---
  if (isLoadingItens || isLoadingFornecedores) {
    return (
      <div className="flex justify-center items-center h-48">
        <p className="text-xl ">Carregando itens e fornecedores...</p>
      </div>
    );
  }

  if (isErrorItens || isErrorFornecedores) {
    console.error("Erro na busca de dados para GestaoConsignacao:", {
      isErrorItens,
      isErrorFornecedores,
    });
    return (
      <div className="text-center py-8 text-red-600">
        Erro ao carregar dados de consignação.
      </div>
    );
  }
  // --- FIM DAS CONDIÇÕES DE RETORNO PRECOCE ---

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Gestão de Consignação</h1>
        <a href="/consignacao/novo">
          <Button>Novo Item Consignado</Button>
        </a>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 " />
          <Input
            placeholder="Buscar por marca, categoria, código ou fornecedor..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="pl-9"
          />
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              disabled={
                updateItemMutation.isPending || deleteItemMutation.isPending
              }
            >
              <Filter className="mr-2 h-4 w-4" />
              Status:
              {filtroStatus === "todos"
                ? "Todos"
                : filtroStatus === "disponivel"
                ? "Disponível"
                : filtroStatus === "vendido"
                ? "Vendido"
                : filtroStatus === "expirado"
                ? "Expirado"
                : filtroStatus === "devolvido"
                ? "Devolvido"
                : "Próximo a Expirar"}
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
            <DropdownMenuItem onClick={() => setFiltroStatus("expirado")}>
              Expirado
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setFiltroStatus("devolvido")}>
              Devolvido
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => setFiltroStatus("proximo_expiracao")}
            >
              Próximo a Expirar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Código</TableHead>
              <TableHead>Fornecedor</TableHead>
              <TableHead>Item</TableHead>
              <TableHead>Marca</TableHead>
              <TableHead>Tamanho</TableHead>
              <TableHead>Preço Venda</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Início Consign.</TableHead>
              <TableHead>Expira em</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {itensFiltrados.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} className="text-center py-8 ">
                  Nenhum item consignado encontrado.
                </TableCell>
              </TableRow>
            ) : (
              itensFiltrados.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-mono text-xs">
                    {item.codigoFornecedor}
                  </TableCell>
                  <TableCell>
                    {fornecedorMap.get(item.fornecedorId) || "Desconhecido"}
                  </TableCell>
                  <TableCell>{item.categoria || "-"}</TableCell>
                  <TableCell>{item.marca || "-"}</TableCell>
                  <TableCell>{item.tamanho || "-"}</TableCell>
                  <TableCell className="font-semibold">
                    R$ {item.precoVenda.toFixed(2)}
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusBadgeVariant(item)}>
                      {getStatusText(item)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {format(item.dataInicioConsignacao, "dd/MM/yyyy", {
                      locale: ptBR,
                    })}
                  </TableCell>
                  <TableCell>
                    {format(item.dataExpiracao, "dd/MM/yyyy", { locale: ptBR })}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          disabled={
                            updateItemMutation.isPending ||
                            deleteItemMutation.isPending
                          }
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() =>
                            (window.location.href = `/consignacao/${item.id}`)
                          }
                        >
                          Ver detalhes
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />

                        {item.status === "disponivel" &&
                          !isPast(item.dataExpiracao) && (
                            <>
                              <DropdownMenuItem
                                onClick={() =>
                                  handleAction(item.id, "marcar_vendido")
                                }
                              >
                                Marcar como Vendido
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() =>
                                  handleAction(item.id, "marcar_devolvido")
                                }
                              >
                                Marcar como Devolvido
                              </DropdownMenuItem>
                            </>
                          )}
                        {item.status !== "vendido" &&
                          item.status !== "expirado" && (
                            <DropdownMenuItem
                              onClick={() => handleAction(item.id, "excluir")}
                              className="text-red-600"
                            >
                              Excluir
                            </DropdownMenuItem>
                          )}
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
