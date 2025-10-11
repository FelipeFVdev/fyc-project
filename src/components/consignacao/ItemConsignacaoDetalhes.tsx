// src/components/consignacao/ItemConsignacaoDetalhes.tsx
"use client"; // Necessário para useState (se for interativo) ou Link

import React, { useState } from "react";
import type { ItemConsignacao } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format, isPast, isBefore, addDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner"; // Para feedback de ações

interface ItemConsignacaoDetalhesProps {
  item: ItemConsignacao;
  fornecedorNome: string;
}

export default function ItemConsignacaoDetalhes({
  item,
  fornecedorNome,
}: ItemConsignacaoDetalhesProps) {
  // Poderia ter lógica para editar este item em um modal, etc.
  const [currentItem, setCurrentItem] = useState(item); // Se for editável na página

  const getStatusBadgeVariant = (item: ItemConsignacao) => {
    const today = new Date();
    const isPastDate = isPast(item.dataExpiracao);
    const isSoon =
      isBefore(item.dataExpiracao, addDays(today, 30)) && !isPastDate;

    if (item.status === "vendido") return "success";
    if (item.status === "devolvido") return "info";
    if (isPastDate) return "destructive";
    if (isSoon) return "yellow";
    return "default";
  };

  const getStatusText = (item: ItemConsignacao) => {
    const today = new Date();
    const isPastDate = isPast(item.dataExpiracao);
    const isSoon =
      isBefore(item.dataExpiracao, addDays(today, 30)) && !isPastDate;

    if (item.status === "vendido") return "Vendido";
    if (item.status === "devolvido") return "Devolvido"; // <--- NOVO TEXTO AQUI!
    if (isPastDate) return "Expirado";
    if (isSoon) return "Próximo a Expirar";
    return "Disponível";
  };

  const handleMarcarVendido = () => {
    // Lógica para marcar como vendido
    console.log(`Marcando item ${currentItem.id} como vendido`);
    setCurrentItem((prev) => ({ ...prev, status: "vendido" }));
    toast.success("Item Marcado!", {
      description: "O item foi marcado como 'Vendido'.",
    });
    // Aqui faria a chamada de API e a atualização real
  };

  const handleMarcarDevolvido = () => {
    // Lógica para marcar como devolvido
    console.log(`Marcando item ${currentItem.id} como devolvido`);
    setCurrentItem((prev) => ({ ...prev, status: "devolvido" })); // Ou outro status para devolvido
    toast.info("Item Marcado!", {
      description: "O item foi marcado como 'Devolvido'.",
    });
    // Aqui faria a chamada de API e a atualização real
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xl font-semibold">
            Detalhes do Item
          </CardTitle>
          <div className="flex gap-2">
            {currentItem.status === "disponivel" &&
              !isPast(currentItem.dataExpiracao) && (
                <>
                  <Button variant="default" onClick={handleMarcarVendido}>
                    Marcar como Vendido
                  </Button>
                  <Button variant="secondary" onClick={handleMarcarDevolvido}>
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
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4 text-gray-700">
          <div>
            <p className="font-semibold">Código do Fornecedor:</p>
            <p>{currentItem.codigoFornecedor}</p>
          </div>
          <div>
            <p className="font-semibold">Fornecedor:</p>
            <p>
              <a
                href={`/fornecedores/${currentItem.fornecedorId}`}
                className="text-blue-600 hover:underline"
              >
                {fornecedorNome}
              </a>
            </p>
          </div>
          <div>
            <p className="font-semibold">Marca:</p>
            <p>{currentItem.marca || "N/A"}</p>
          </div>
          <div>
            <p className="font-semibold">Categoria:</p>
            <p>{currentItem.categoria || "N/A"}</p>
          </div>
          <div>
            <p className="font-semibold">Tamanho:</p>
            <p>{currentItem.tamanho || "N/A"}</p>
          </div>
          <div>
            <p className="font-semibold">Preço de Venda:</p>
            <p className="font-bold text-lg">
              R$ {currentItem.precoVenda.toFixed(2)}
            </p>
          </div>
          <div>
            <p className="font-semibold">Status:</p>
            <Badge variant={getStatusBadgeVariant(currentItem)}>
              {getStatusText(currentItem)}
            </Badge>
          </div>
          <div>
            <p className="font-semibold">Início da Consignação:</p>
            <p>
              {format(currentItem.dataInicioConsignacao, "dd/MM/yyyy", {
                locale: ptBR,
              })}
            </p>
          </div>
          <div>
            <p className="font-semibold">Data de Expiração:</p>
            <p>
              {format(currentItem.dataExpiracao, "dd/MM/yyyy", {
                locale: ptBR,
              })}
            </p>
          </div>
          <div className="col-span-1 md:col-span-2">
            <p className="font-semibold">Descrição:</p>
            <p>{currentItem.descricao || "N/A"}</p>
          </div>
        </CardContent>
      </Card>
      {/* Você pode adicionar mais seções aqui, como histórico de vendas do item específico, etc. */}
    </div>
  );
}
