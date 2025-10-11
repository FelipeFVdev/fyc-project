// src/components/fornecedores/VisualizarFornecedor.tsx
"use client";

import React, { useState } from "react";
import type { Fornecedor, Venda, ItemConsignacao } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { addDays, format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ExternalLink } from "lucide-react";

// --- IMPORTAR FUNÇÕES DE FETCH E HOOKS DO TANSTACK QUERY ---
import {
  getFornecedorById, // Para buscar o fornecedor específico
  getItensConsignados, // Para buscar todos os itens consignados
  getVendas, // Para buscar todas as vendas
} from "@/lib/db";
import { useQuery } from "@tanstack/react-query"; // Hook principal
import { queryClient } from "@/store";

interface VisualizarFornecedorProps {
  fornecedorId: string;
}

export default function VisualizarFornecedor({
  fornecedorId,
}: VisualizarFornecedorProps) {
  // --- BUSCAR O FORNECEDOR ESPECÍFICO ---
  const {
    data: fornecedor,
    isLoading: isLoadingFornecedor,
    isError: isErrorFornecedor,
    // refetch: refetchFornecedor // Poderíamos usar para re-buscar manualmente
  } = useQuery<Fornecedor | undefined, Error>(
    {
      queryKey: ["fornecedor", fornecedorId], // Key única para este fornecedor
      queryFn: () => getFornecedorById(fornecedorId), // Função de fetch que retorna a Promise
      enabled: !!fornecedorId, // Só busca se fornecedorId for válido
    },
    queryClient
  );

  // --- BUSCAR TODOS OS ITENS CONSIGNADOS ---
  const {
    data: todosItensConsignados,
    isLoading: isLoadingItensConsignados,
    isError: isErrorItensConsignados,
  } = useQuery<ItemConsignacao[], Error>(
    {
      queryKey: ["itensConsignados"],
      queryFn: getItensConsignados,
    },
    queryClient
  );

  // --- BUSCAR TODAS AS VENDAS ---
  const {
    data: todasVendas,
    isLoading: isLoadingVendas,
    isError: isErrorVendas,
  } = useQuery<Venda[], Error>(
    {
      queryKey: ["vendas"],
      queryFn: getVendas,
    },
    queryClient
  );

  // --- LÓGICA DE CARREGAMENTO GLOBAL ---
  if (isLoadingFornecedor || isLoadingItensConsignados || isLoadingVendas) {
    return (
      <div className="flex justify-center items-center h-48">
        <p className="text-xl text-neutral-700">
          Carregando perfil do fornecedor...
        </p>
      </div>
    );
  }

  // --- LÓGICA DE ERRO OU FORNECEDOR NÃO ENCONTRADO ---
  if (
    isErrorFornecedor ||
    isErrorItensConsignados ||
    isErrorVendas ||
    !fornecedor
  ) {
    console.error("Erro na busca de dados para VisualizarFornecedor:", {
      isErrorFornecedor,
      isErrorItensConsignados,
      isErrorVendas,
      fornecedorExists: !!fornecedor,
    });
    return (
      <div className="text-center py-10">
        <h1 className="text-3xl font-bold mb-4">
          Fornecedor não encontrado ou erro.
        </h1>
        <p className="text-lg text-neutral-600">
          Não foi possível carregar o perfil do fornecedor. Verifique o ID ou
          tente novamente.
        </p>
        <Button
          onClick={() => (window.location.href = "/fornecedores")}
          className="mt-6"
        >
          Voltar para a lista
        </Button>
      </div>
    );
  }

  // --- Processar dados (agora que sabemos que tudo está carregado e definido) ---
  const itensConsignadosDoFornecedor = (todosItensConsignados || []).filter(
    (item) => item.fornecedorId === fornecedorId
  );

  const historicoVendasDoFornecedor = (todasVendas || []).filter((venda) =>
    venda.itens.some((vendaItem) =>
      itensConsignadosDoFornecedor.some(
        (consignadoItem) => consignadoItem.id === vendaItem.itemId
      )
    )
  );

  // A função handleFornecedorUpdate não é mais usada diretamente aqui,
  // mas o DialogEditarFornecedor ainda a passará para a mutação,
  // que então invalidará a query 'fornecedor', fazendo com que ele seja re-buscado.
  const handleFornecedorUpdate = (updatedFornecedor: Fornecedor) => {
    // A mutação no DialogEditarFornecedor já cuidará de invalidar a query 'fornecedor',
    // o que fará com que este componente seja re-renderizado com os dados atualizados.
    // console.log("Fornecedor atualizado via callback, TanStack Query vai re-buscar.");
  };

  const getStatusBadgeVariant = (item: ItemConsignacao) => {
    const today = new Date();
    const isPastDate =
      format(item.dataExpiracao, "yyyy-MM-dd") < format(today, "yyyy-MM-dd"); // Comparação de datas como string para evitar problemas de hora
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

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center mb-8">
        <div className="space-y-4">
          <h1 className="text-4xl font-extrabold text-neutral-900">
            Informações do Fornecedor:
          </h1>
          <p className="text-2xl font-extrabold text-neutral-900">
            {fornecedor.nome}
          </p>
        </div>
        <div className="flex gap-4">
          <a href={`/fornecedores/extrato/${fornecedor.id}`}>
            <Button variant="secondary">Ver Extrato</Button>
          </a>
          <Button variant="destructive">Excluir Fornecedor</Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Itens Consignados (Atuais e Expirados)</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Código Fornecedor</TableHead>
                <TableHead>Item</TableHead>
                <TableHead>Marca/Tamanho</TableHead>
                <TableHead>Preço Venda</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Início Consign.</TableHead>
                <TableHead>Expira em</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {itensConsignadosDoFornecedor.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="text-center py-4 text-neutral-500"
                  >
                    Nenhum item consignado para este fornecedor.
                  </TableCell>
                </TableRow>
              ) : (
                itensConsignadosDoFornecedor.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.codigoFornecedor}</TableCell>
                    <TableCell>
                      {item.categoria} ({item.descricao?.substring(0, 20)}...)
                    </TableCell>
                    <TableCell>
                      {item.marca} / {item.tamanho}
                    </TableCell>
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
                      {format(item.dataExpiracao, "dd/MM/yyyy", {
                        locale: ptBR,
                      })}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Histórico de Vendas (Itens Consignados)</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data da Venda</TableHead>
                <TableHead>Item(s)</TableHead>
                <TableHead>Valor Total</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Ação</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {historicoVendasDoFornecedor.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center py-4 text-neutral-500"
                  >
                    Nenhuma venda registrada para este fornecedor.
                  </TableCell>
                </TableRow>
              ) : (
                historicoVendasDoFornecedor.map((venda) => (
                  <TableRow key={venda.id}>
                    <TableCell>
                      {format(venda.dataVenda, "dd/MM/yyyy", { locale: ptBR })}
                    </TableCell>
                    <TableCell>
                      {venda.itens
                        .filter((item) => item.tipo === "consignacao")
                        .map((item, index) => (
                          <div key={index}>
                            <Badge variant="outline">{item.itemId}</Badge> (R${" "}
                            {item.precoVenda.toFixed(2)})
                          </div>
                        ))}
                    </TableCell>
                    <TableCell className="font-semibold">
                      R$ {venda.valorTotal.toFixed(2)}
                    </TableCell>
                    <TableCell>{venda.clienteNome}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm" asChild>
                        <a href={`/vendas/${venda.id}`}>
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
