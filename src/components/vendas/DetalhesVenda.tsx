// src/components/vendas/DetalhesVenda.tsx
"use client";

import React from "react";
import type { Venda, ItemGarimpo, ItemConsignacao, Cliente } from "@/types";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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

import {
  getVendaById,
  getClientes,
  getItensGarimpo,
  getItensConsignados,
} from "@/lib/db";
import { useQuery } from "@tanstack/react-query";
import { queryClient } from "@/store";

import { formatCpf } from "@/lib/utils";

interface DetalhesVendaProps {
  vendaId: string;
}

export default function DetalhesVenda({ vendaId }: DetalhesVendaProps) {
  // --- BUSCAS DE DADOS ---
  const {
    data: venda,
    isLoading: isLoadingVenda,
    isError: isErrorVenda,
  } = useQuery<Venda | undefined, Error>(
    {
      // Adicionar tipo de erro
      queryKey: ["vendas", vendaId],
      queryFn: () => getVendaById(vendaId),
      enabled: !!vendaId,
    },
    queryClient
  );

  const {
    data: clientes,
    isLoading: isLoadingClientes,
    isError: isErrorClientes,
  } = useQuery<Cliente[], Error>(
    {
      queryKey: ["clientes"],
      queryFn: getClientes,
    },
    queryClient
  );

  const {
    data: itensGarimpo,
    isLoading: isLoadingGarimpo,
    isError: isErrorGarimpo,
  } = useQuery<ItemGarimpo[], Error>(
    {
      queryKey: ["itensGarimpo"],
      queryFn: getItensGarimpo,
    },
    queryClient
  );

  const {
    data: itensConsignados,
    isLoading: isLoadingConsignados,
    isError: isErrorConsignados,
  } = useQuery<ItemConsignacao[], Error>(
    {
      queryKey: ["itensConsignados"],
      queryFn: getItensConsignados,
    },
    queryClient
  );

  // --- LÓGICA DE CARREGAMENTO ---
  if (
    isLoadingVenda ||
    isLoadingClientes ||
    isLoadingGarimpo ||
    isLoadingConsignados
  ) {
    return (
      <div className="flex justify-center items-center h-48">
        <p className="text-xl text-gray-700">Carregando detalhes da venda...</p>
      </div>
    );
  }

  // --- LÓGICA DE ERRO OU DADOS NÃO ENCONTRADOS ---
  // Se qualquer busca de dados falhar ou a venda não for encontrada
  if (
    isErrorVenda ||
    isErrorClientes ||
    isErrorGarimpo ||
    isErrorConsignados ||
    !venda // Agora, venda é explicitamente undefined se não encontrado após loading
  ) {
    // Console log para ajudar a identificar qual erro específico
    console.error("Erro na busca de dados para DetalhesVenda:", {
      isErrorVenda,
      isErrorClientes,
      isErrorGarimpo,
      isErrorConsignados,
      vendaExists: !!venda,
    });

    return (
      <div className="text-center py-10">
        <h1 className="text-3xl font-bold mb-4">
          Venda não encontrada ou erro.
        </h1>
        <p className="text-lg text-gray-600">
          Não foi possível carregar os detalhes da venda. Verifique o ID ou
          tente novamente.
        </p>
        <Button
          onClick={() => (window.location.href = "/vendas")}
          className="mt-6"
        >
          Voltar para a lista de vendas
        </Button>
      </div>
    );
  }

  // --- Processar dados (agora que sabemos que 'venda', 'clientes', etc. estão definidos) ---
  const cliente = clientes?.find((c) => c.id === venda.clienteId); // 'clientes' não é mais undefined aqui
  const allItems = [...(itensGarimpo || []), ...(itensConsignados || [])]; // fallback para [] para itens

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-extrabold text-gray-900">
          Detalhes da Venda {venda.id.substring(0, 8)}
        </h1>
        <div className="flex gap-4">
          <Button variant="outline">Imprimir Recibo</Button>
          <Button variant="destructive">Estornar Venda</Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Resumo da Venda</CardTitle>
          <CardDescription>ID da Venda: {venda.id}</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4 text-gray-700">
          <div>
            <p className="font-semibold">Data da Venda:</p>
            <p>
              {format(venda.dataVenda, "dd/MM/yyyy HH:mm", { locale: ptBR })}
            </p>
          </div>
          <div>
            <p className="font-semibold">Cliente:</p>
            <p>
              {venda.clienteNome}{" "}
              {cliente?.cpf ? `(CPF: ${formatCpf(cliente.cpf)})` : ""}
            </p>
          </div>
          <div>
            <p className="font-semibold">Forma de Pagamento:</p>
            <p>{venda.formaPagamento}</p>
          </div>
          <div>
            <p className="font-semibold">Valor Total:</p>
            <p className="text-2xl font-bold">
              R$ {venda.valorTotal.toFixed(2)}
            </p>
          </div>
          <div>
            <p className="font-semibold">Custo Total:</p>
            <p className="text-lg">R$ {venda.custoTotal.toFixed(2)}</p>
          </div>
          <div>
            <p className="font-semibold">Lucro Líquido:</p>
            <p className="text-lg text-green-600">
              R$ {venda.margemLucro.toFixed(2)}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Itens Vendidos</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Código Item</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Preço Venda</TableHead>
                <TableHead>Custo Base</TableHead>
                <TableHead>Margem do Item</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {/* Agora, venda.itens é garantido que não é undefined */}
              {(venda.itens || []).map((itemVenda, index) => {
                // fallback com [] para super-robustez
                const fullItem = allItems.find(
                  (i) => i.id === itemVenda.itemId
                );
                const itemDescription = fullItem
                  ? `${fullItem.marca || ""} - ${fullItem.categoria || ""} (${
                      fullItem.tamanho || ""
                    })`
                  : `Item ID: ${itemVenda.itemId}`;
                const itemMargin = itemVenda.precoVenda - itemVenda.custoBase;

                return (
                  <TableRow key={index}>
                    <TableCell>{itemVenda.itemId.substring(0, 8)}</TableCell>
                    <TableCell>{itemDescription}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          itemVenda.tipo === "garimpo" ? "default" : "secondary"
                        }
                      >
                        {itemVenda.tipo === "garimpo"
                          ? "Garimpo"
                          : "Consignação"}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-semibold">
                      R$ {itemVenda.precoVenda.toFixed(2)}
                    </TableCell>
                    <TableCell>R$ {itemVenda.custoBase.toFixed(2)}</TableCell>
                    <TableCell className="text-green-600">
                      R$ {itemMargin.toFixed(2)}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="flex justify-end mt-8">
        <Button
          onClick={() => (window.location.href = "/vendas")}
          variant="outline"
        >
          Voltar para Vendas
        </Button>
      </div>
    </div>
  );
}
