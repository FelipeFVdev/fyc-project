// src/components/garimpo/ItemGarimpoDetalhes.tsx
"use client";

import React from "react";
import type { ItemGarimpo } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
// Importar ícones se necessário (DollarSign, ShoppingCart, etc.)
import { DollarSign, Tag, Calendar, ShoppingCart } from "lucide-react";

// --- IMPORTAR FUNÇÃO DE FETCH E HOOKS DO TANSTACK QUERY ---
import { getItemGarimpoById, updateItemGarimpo } from "@/lib/db";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/store";
import { toast } from "sonner";

interface ItemGarimpoDetalhesProps {
  itemId: string; // Recebe apenas o ID do item
}

export default function ItemGarimpoDetalhes({
  itemId,
}: ItemGarimpoDetalhesProps) {
  // --- BUSCAR O ITEM DE GARIMPO ESPECÍFICO ---
  const {
    data: item,
    isLoading: isLoadingItem,
    isError: isErrorItem,
  } = useQuery<ItemGarimpo | undefined, Error>(
    {
      queryKey: ["itemGarimpo", itemId], // Key única para este item
      queryFn: () => getItemGarimpoById(itemId),
      enabled: !!itemId, // Só busca se itemId for válido
    },
    queryClient
  );

  // --- MUTATION PARA ATUALIZAR STATUS DO ITEM (ex: vender) ---
  const updateItemMutation = useMutation(
    {
      mutationFn: updateItemGarimpo,
      onSuccess: (updatedItem) => {
        queryClient.invalidateQueries({ queryKey: ["itensGarimpo"] }); // Invalida a lista
        queryClient.invalidateQueries({
          queryKey: ["itemGarimpo", updatedItem.id],
        }); // Invalida este item específico
        queryClient.invalidateQueries({ queryKey: ["vendas"] }); // Se o status mudar para vendido, impacta a lista de vendas
        toast.success("Item de Garimpo Atualizado!", {
          description: `O item '${updatedItem.marca}' foi marcado como '${updatedItem.status}'.`,
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

  // --- LÓGICA DE CARREGAMENTO GLOBAL ---
  if (isLoadingItem) {
    return (
      <div className="flex justify-center items-center h-48">
        <p className="text-xl text-gray-700">
          Carregando detalhes do item de garimpo...
        </p>
      </div>
    );
  }

  // --- LÓGICA DE ERRO OU DADOS NÃO ENCONTRADOS ---
  if (isErrorItem || !item) {
    // 'item' pode ser undefined se não for encontrado
    console.error("Erro na busca de dados para ItemGarimpoDetalhes:", {
      isErrorItem,
      itemExists: !!item,
    });
    return (
      <div className="text-center py-10">
        <h1 className="text-3xl font-bold mb-4">
          Item de garimpo não encontrado ou erro.
        </h1>
        <p className="text-lg text-gray-600">
          Não foi possível carregar os detalhes do item. Verifique o ID ou tente
          novamente.
        </p>
        <Button
          onClick={() => (window.location.href = "/garimpo")}
          className="mt-6"
        >
          Voltar à Lista
        </Button>
      </div>
    );
  }

  // Funções auxiliares para status (adaptadas do Consignacao)
  const getStatusBadgeVariant = (status: "disponivel" | "vendido") => {
    if (status === "vendido") return "success";
    return "default"; // default para 'disponivel'
  };
  const getStatusText = (status: "disponivel" | "vendido") => {
    if (status === "vendido") return "Vendido";
    return "Disponível";
  };

  const handleMarcarVendido = () => {
    if (
      window.confirm(
        `Tem certeza que deseja marcar o item '${item.marca} - ${item.categoria}' como vendido?`
      )
    ) {
      updateItemMutation.mutate({ ...item, status: "vendido" });
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xl font-semibold">
            Detalhes do Item de Garimpo
          </CardTitle>
          <div className="flex gap-2">
            {item.status === "disponivel" && (
              <Button
                variant="default"
                onClick={handleMarcarVendido}
                disabled={updateItemMutation.isPending}
              >
                Marcar como Vendido
              </Button>
            )}
            <Button
              variant="outline"
              onClick={() => (window.location.href = `/garimpo`)}
              disabled={updateItemMutation.isPending}
            >
              Voltar à Lista
            </Button>
          </div>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4 text-gray-700">
          <div>
            <p className="font-semibold">ID:</p>
            <p>{item.id}</p>
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
            <p className="font-semibold">Local de Compra:</p>
            <p>{item.localCompra}</p>
          </div>
          <div>
            <p className="font-semibold">Data de Compra:</p>
            <p>{format(item.dataCompra, "dd/MM/yyyy", { locale: ptBR })}</p>
          </div>
          <div>
            <p className="font-semibold">Custo de Compra:</p>
            <p>R$ {item.custoCompra.toFixed(2)}</p>
          </div>
          <div>
            <p className="font-semibold">Custos Adicionais:</p>
            <p>R$ {item.custosAdicionais.toFixed(2)}</p>
          </div>
          <div>
            <p className="font-semibold">Margem de Lucro (%):</p>
            <p>{item.margemLucro}%</p>
          </div>
          <div>
            <p className="font-semibold">Preço de Venda:</p>
            <p className="font-bold text-lg">R$ {item.precoVenda.toFixed(2)}</p>
          </div>
          <div>
            <p className="font-semibold">Data de Entrada no Estoque:</p>
            <p>
              {format(item.dataEntradaEstoque, "dd/MM/yyyy", { locale: ptBR })}
            </p>
          </div>
          <div>
            <p className="font-semibold">Status:</p>
            <Badge variant={getStatusBadgeVariant(item.status)}>
              {getStatusText(item.status)}
            </Badge>
          </div>
          <div className="col-span-1 md:col-span-2">
            <p className="font-semibold">Descrição:</p>
            <p>{item.descricao || "N/A"}</p>
          </div>
        </CardContent>
      </Card>
      {/* Você pode adicionar mais seções aqui, como histórico de vendas do item específico, etc. */}
    </div>
  );
}
