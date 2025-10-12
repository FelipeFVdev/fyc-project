// src/components/consignacao/ItemConsignacaoDetalhes.tsx
"use client"; // Necessário para useState (se for interativo) ou Link e useQuery

import React, { useState } from "react";
import type { ItemConsignacao, Fornecedor } from "@/types"; // Adicionado Fornecedor para tipagem
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format, isPast, isBefore, addDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner"; // Para feedback de ações

// --- IMPORTAR FUNÇÕES DE FETCH E HOOKS DO TANSTACK QUERY ---
import {
  getItemConsignadoById, // Função para buscar o item consignado
  getFornecedorById, // Função para buscar o fornecedor
  updateItemConsignado, // Função para atualizar o status (vendido/devolvido)
} from "@/lib/db";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/store";

interface ItemConsignacaoDetalhesProps {
  itemId: string; // Agora recebe apenas o ID do item
  // fornecedorNome: string; // Não é mais necessário como prop, será buscado
}

export default function ItemConsignacaoDetalhes({
  itemId,
}: ItemConsignacaoDetalhesProps) {
  // --- BUSCAR O ITEM CONSIGNADO ESPECÍFICO ---
  const {
    data: item,
    isLoading: isLoadingItem,
    isError: isErrorItem,
    // refetch: refetchItem,
  } = useQuery<ItemConsignacao | undefined, Error>(
    {
      queryKey: ["itemConsignado", itemId], // Key única para este item
      queryFn: () => getItemConsignadoById(itemId),
      enabled: !!itemId, // Só busca se itemId for válido
    },
    queryClient
  );

  // --- BUSCAR O FORNECEDOR DO ITEM ---
  const {
    data: fornecedor,
    isLoading: isLoadingFornecedor,
    isError: isErrorFornecedor,
  } = useQuery<Fornecedor | undefined, Error>(
    {
      queryKey: ["fornecedor", item?.fornecedorId], // Depende do item carregado
      queryFn: () => getFornecedorById(item!.fornecedorId), // item!.fornecedorId é seguro por 'enabled'
      enabled: !!item?.fornecedorId, // Só busca se o item e o fornecedorId existirem
    },
    queryClient
  );

  // --- MUTATION PARA ATUALIZAR STATUS DO ITEM ---
  const updateItemMutation = useMutation(
    {
      mutationFn: updateItemConsignado,
      onSuccess: (updatedItem) => {
        queryClient.invalidateQueries({ queryKey: ["itensConsignados"] }); // Invalida a lista
        queryClient.invalidateQueries({
          queryKey: ["itemConsignado", updatedItem.id],
        }); // Invalida este item
        queryClient.invalidateQueries({
          queryKey: ["fornecedor", updatedItem.fornecedorId],
        }); // Invalida o extrato do fornecedor
        queryClient.invalidateQueries({ queryKey: ["vendas"] }); // Pode invalidar vendas se mudar o status de um item de venda

        toast.success("Item Consignado Atualizado!", {
          description: `O item ${updatedItem.codigoFornecedor} foi marcado como '${updatedItem.status}'.`,
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

  const isLoadingGlobal =
    isLoadingItem || isLoadingFornecedor || updateItemMutation.isPending;

  // --- LÓGICA DE CARREGAMENTO GLOBAL ---
  if (isLoadingGlobal) {
    return (
      <div className="flex justify-center items-center h-48">
        <p className="text-xl ">Carregando detalhes do item...</p>
      </div>
    );
  }

  // --- LÓGICA DE ERRO OU DADOS NÃO ENCONTRADOS ---
  if (isErrorItem || isErrorFornecedor || !item || !fornecedor) {
    console.error("Erro na busca de dados para ItemConsignacaoDetalhes:", {
      isErrorItem,
      isErrorFornecedor,
      itemExists: !!item,
      fornecedorExists: !!fornecedor,
    });
    return (
      <div className="text-center py-10">
        <h1 className="text-3xl font-bold mb-4">
          Item consignado não encontrado ou erro.
        </h1>
        <p className="text-lg ">
          Não foi possível carregar os detalhes do item. Verifique o ID ou tente
          novamente.
        </p>
        <Button
          onClick={() => (window.location.href = `/consignacao`)}
          className="mt-6"
        >
          Voltar à Lista
        </Button>
      </div>
    );
  }

  // Agora, item e fornecedor estão garantidos como definidos
  const fornecedorNome = fornecedor.nome; // Obter o nome do fornecedor

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

  const handleMarcarVendido = () => {
    // Chama a mutação para atualizar o status do item
    updateItemMutation.mutate({ ...item, status: "vendido" });
  };

  const handleMarcarDevolvido = () => {
    // Chama a mutação para atualizar o status do item
    updateItemMutation.mutate({ ...item, status: "devolvido" });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xl font-semibold">
            Detalhes do Item
          </CardTitle>
          <div className="flex gap-2">
            {/* Ações disponíveis apenas se o item está disponível e não expirado */}
            {item.status === "disponivel" && !isPast(item.dataExpiracao) && (
              <>
                <Button
                  variant="default"
                  onClick={handleMarcarVendido}
                  disabled={updateItemMutation.isPending}
                >
                  Marcar como Vendido
                </Button>
                <Button
                  variant="secondary"
                  onClick={handleMarcarDevolvido}
                  disabled={updateItemMutation.isPending}
                >
                  Marcar como Devolvido
                </Button>
              </>
            )}
            <Button
              variant="outline"
              onClick={() => (window.location.href = `/consignacao`)}
            >
              Voltar à Lista
            </Button>
          </div>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4 ">
          <div>
            <p className="font-semibold">Código do Fornecedor:</p>
            <p>{item.codigoFornecedor}</p>
          </div>
          <div>
            <p className="font-semibold">Fornecedor:</p>
            <p>
              <a
                href={`/fornecedores/${item.fornecedorId}`}
                className="text-blue-600 hover:underline"
              >
                {fornecedorNome}
              </a>
            </p>
          </div>
          <div>
            <p className="font-semibold">Marca:</p>
            <p>{item.marca || "N/A"}</p>
          </div>
          <div>
            <p className="font-semibold">Categoria:</p>
            <p>{item.categoria || "N/A"}</p>
          </div>
          <div>
            <p className="font-semibold">Tamanho:</p>
            <p>{item.tamanho || "N/A"}</p>
          </div>
          <div>
            <p className="font-semibold">Preço de Venda:</p>
            <p className="font-bold text-lg">R$ {item.precoVenda.toFixed(2)}</p>
          </div>
          <div>
            <p className="font-semibold">Status:</p>
            <Badge variant={getStatusBadgeVariant(item)}>
              {getStatusText(item)}
            </Badge>
          </div>
          <div>
            <p className="font-semibold">Início da Consignação:</p>
            <p>
              {format(item.dataInicioConsignacao, "dd/MM/yyyy", {
                locale: ptBR,
              })}
            </p>
          </div>
          <div>
            <p className="font-semibold">Data de Expiração:</p>
            <p>{format(item.dataExpiracao, "dd/MM/yyyy", { locale: ptBR })}</p>
          </div>
          <div className="col-span-1 md:col-span-2">
            <p className="font-semibold">Descrição:</p>
            <p>{item.descricao || "N/A"}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
