"use client";

import React, { useState, useEffect, useMemo } from "react";
import type {
  ExtratoFornecedor,
  Fornecedor,
  ItemConsignacao,
  PagamentoFornecedor,
  Venda,
} from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Currency, Package } from "lucide-react";
import { toast } from "sonner";

// --- IMPORTAR FUNÇÕES DE FETCH E HOOKS DO TANSTACK QUERY ---
import {
  getFornecedorById, // Para buscar o fornecedor específico
  getItensConsignados, // Para buscar todos os itens consignados
  getVendas, // Para buscar todas as vendas (para linkar com histórico)
  // getPagamentosFornecedor, // Se tivéssemos uma função para pagamentos reais
} from "@/lib/db";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/store";

interface ExtratoFornecedorProps {
  fornecedorId: string;
}

// Lógica de cálculo do extrato, agora para ser usada com os dados reativos do useQuery
const calculateExtrato = (
  fornecedor: Fornecedor,
  allItensConsignados: ItemConsignacao[],
  allVendas: Venda[]
  // Poderia receber 'allPagamentosReais' aqui se tivéssemos uma função de fetch para eles
): ExtratoFornecedor => {
  const itensVendidosDoFornecedor = allItensConsignados.filter(
    (item) => item.fornecedorId === fornecedor.id && item.status === "vendido"
  );

  // --- Mock de pagamentos (só para este cálculo, não persiste) ---
  const pagamentosGerados: PagamentoFornecedor[] = [];

  let saldoDisponivelCredito = 0;
  let saldoDisponivelDinheiro = 0;

  itensVendidosDoFornecedor.forEach((item) => {
    const valorCreditoPotencial = item.precoVenda * 0.5; // Exemplo: 50%
    const valorDinheiroPotencial = item.precoVenda * 0.4; // Exemplo: 40%

    // Adiciona pagamentos pendentes (potenciais) para cada item vendido
    pagamentosGerados.push(
      {
        id: `pg-credito-${item.id}`,
        fornecedorId: item.fornecedorId,
        vendaId: item.id,
        valor: valorCreditoPotencial,
        tipo: "credito_loja",
        porcentagem: 50,
        status: "pendente",
        dataPagamento: new Date(),
      },
      {
        id: `pg-dinheiro-${item.id}`,
        fornecedorId: item.fornecedorId,
        vendaId: item.id,
        valor: valorDinheiroPotencial,
        tipo: "dinheiro",
        porcentagem: 40,
        status: "pendente",
        dataPagamento: new Date(),
      }
    );
    saldoDisponivelCredito += valorCreditoPotencial;
    saldoDisponivelDinheiro += valorDinheiroPotencial;
  });

  // --- SIMULAR DEDUÇÕES (pagamentos já feitos ou saques) ---
  // Exemplo: um pagamento já feito para 'f1' do item 'ic1'
  if (fornecedor.id === "f1") {
    const itemIC1 = allItensConsignados.find((i) => i.id === "ic1");
    if (itemIC1) {
      const valorPago = itemIC1.precoVenda * 0.5;
      const pagIC1Credito: PagamentoFornecedor = {
        id: "p1",
        fornecedorId: "f1",
        vendaId: "ic1",
        valor: valorPago,
        tipo: "credito_loja",
        porcentagem: 50,
        status: "pago",
        dataPagamento: new Date("2024-06-10"),
      };
      // Adicionar se ainda não estiver na lista gerada
      if (!pagamentosGerados.some((p) => p.id === pagIC1Credito.id)) {
        pagamentosGerados.push(pagIC1Credito);
        saldoDisponivelCredito -= valorPago; // Deduzir o valor pago
      }
    }
  }
  // --- FIM SIMULAÇÃO DE DEDUÇÕES ---

  return {
    fornecedor,
    itensVendidos: itensVendidosDoFornecedor,
    totalDevido: Math.max(0, saldoDisponivelCredito + saldoDisponivelDinheiro),
    saldoDisponivelCredito: Math.max(0, saldoDisponivelCredito),
    saldoDisponivelDinheiro: Math.max(0, saldoDisponivelDinheiro),
    pagamentos: pagamentosGerados.sort(
      (a, b) =>
        (b.dataPagamento || new Date(0)).getTime() -
        (a.dataPagamento || new Date(0)).getTime()
    ),
  };
};

export default function ExtratoFornecedor({
  fornecedorId,
}: ExtratoFornecedorProps) {
  // --- BUSCAR O FORNECEDOR ESPECÍFICO ---
  const {
    data: fornecedor,
    isLoading: isLoadingFornecedor,
    isError: isErrorFornecedor,
  } = useQuery<Fornecedor | undefined, Error>(
    {
      queryKey: ["fornecedor", fornecedorId],
      queryFn: () => getFornecedorById(fornecedorId),
      enabled: !!fornecedorId,
    },
    queryClient
  );

  // --- BUSCAR TODOS OS ITENS CONSIGNADOS ---
  const {
    data: allItensConsignados,
    isLoading: isLoadingItensConsignados,
    isError: isErrorItensConsignados,
  } = useQuery<ItemConsignacao[], Error>(
    {
      queryKey: ["itensConsignados"],
      queryFn: getItensConsignados,
    },
    queryClient
  );

  // --- BUSCAR TODAS AS VENDAS (para linkar com histórico de itens) ---
  const {
    data: allVendas,
    isLoading: isLoadingVendas,
    isError: isErrorVendas,
  } = useQuery<Venda[], Error>(
    {
      queryKey: ["vendas"],
      queryFn: getVendas,
    },
    queryClient
  );

  // --- Calcular o extrato usando useMemo para reatividade ---
  const extrato = useMemo(() => {
    if (fornecedor && allItensConsignados && allVendas) {
      // Passar os dados carregados pelos useQuery para calculateExtrato
      return calculateExtrato(fornecedor, allItensConsignados, allVendas);
    }
    return null;
  }, [fornecedor, allItensConsignados, allVendas]); // Dependências

  // --- MUTATION PARA SOLICITAR SAQUE ---
  const solicitarSaqueMutation = useMutation(
    {
      mutationFn: async (vars: {
        tipo: "dinheiro" | "credito_loja";
        valor: number;
      }) => {
        // Simular a adição de um pagamento de saque no DB (se houvesse um backend)
        console.log(
          `Simulando registro de saque no DB: ${vars.tipo}, ${vars.valor}`
        );
        await new Promise((resolve) => setTimeout(resolve, 500));
        // Em um app real, aqui você faria a chamada de API que adiciona o pagamento/saque
        return {
          success: true,
          ...vars,
          id: crypto.randomUUID(),
          status: "pendente",
          dataPagamento: new Date(),
        }; // Retorna o objeto de saque
      },
      onSuccess: (newPayment: any) => {
        // 'any' temporário para o mock de newPayment
        // Invalidate queries relevantes para re-calcular o extrato
        queryClient.invalidateQueries({
          queryKey: ["fornecedor", fornecedorId],
        }); // Invalida o fornecedor e seu extrato
        queryClient.invalidateQueries({
          queryKey: ["fornecedorExtrato", fornecedorId],
        }); // Se tivéssemos uma key específica para extrato

        toast.success("Solicitação de Saque Enviada!", {
          description: `Um saque de R$ ${newPayment.valor.toFixed(2)} (${
            newPayment.tipo
          }) foi registrado.`,
        });
        // Você pode também fazer um update otimista aqui se quiser, mas invalidar é mais simples para mocks
      },
      onError: (error) => {
        toast.error("Erro no Saque", {
          description: error.message || "Não foi possível processar o saque.",
        });
      },
    },
    queryClient
  );

  const handleSolicitarSaque = (
    tipo: "dinheiro" | "credito_loja",
    valor: number
  ) => {
    if (!extrato) return; // Não deveria acontecer se o extrato já foi exibido

    if (valor <= 0) {
      toast.error("Valor inválido", {
        description: "Informe um valor positivo para o saque.",
      });
      return;
    }
    if (tipo === "dinheiro" && valor > extrato.saldoDisponivelDinheiro) {
      toast.error("Saldo Insuficiente", {
        description: "Valor de saque excede o saldo disponível em dinheiro.",
      });
      return;
    }
    if (tipo === "credito_loja" && valor > extrato.saldoDisponivelCredito) {
      toast.error("Saldo Insuficiente", {
        description:
          "Valor de saque excede o saldo disponível em crédito de loja.",
      });
      return;
    }

    solicitarSaqueMutation.mutate({ tipo, valor });
  };

  // --- LÓGICA DE CARREGAMENTO GLOBAL ---
  if (
    isLoadingFornecedor ||
    isLoadingItensConsignados ||
    isLoadingVendas ||
    solicitarSaqueMutation.isPending
  ) {
    return (
      <div className="flex justify-center items-center h-48">
        <p className="text-xl ">Carregando extrato do fornecedor...</p>
      </div>
    );
  }

  // --- LÓGICA DE ERRO OU DADOS NÃO ENCONTRADOS ---
  if (
    isErrorFornecedor ||
    isErrorItensConsignados ||
    isErrorVendas ||
    !fornecedor ||
    !extrato
  ) {
    console.error("Erro na busca de dados para ExtratoFornecedor:", {
      isErrorFornecedor,
      isErrorItensConsignados,
      isErrorVendas,
      fornecedorExists: !!fornecedor,
      extratoExists: !!extrato,
    });
    return (
      <div className="text-center py-10">
        <h1 className="text-3xl font-bold mb-4">
          Extrato não encontrado ou erro.
        </h1>
        <p className="text-lg ">
          Não foi possível carregar o extrato do fornecedor. Verifique o ID ou
          tente novamente.
        </p>
        <Button
          onClick={() => (window.location.href = "/fornecedores")}
          className="mt-6"
        >
          Voltar para a lista de fornecedores
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <h1 className="text-4xl font-extrabold  mb-8">
        Extrato de {extrato.fornecedor.nome}
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Saldo em Crédito de Loja
            </CardTitle>
            <Currency className="h-4 w-4 " />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              R$ {extrato.saldoDisponivelCredito.toFixed(2)}
            </div>
            <p className="text-xs ">Valor disponível para compras na loja</p>
            {extrato.saldoDisponivelCredito > 0 && (
              <Button
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={() =>
                  handleSolicitarSaque(
                    "credito_loja",
                    extrato.saldoDisponivelCredito
                  )
                }
                disabled={solicitarSaqueMutation.isPending}
              >
                Usar Crédito
              </Button>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Saldo em Dinheiro
            </CardTitle>
            <Currency className="h-4 w-4 " />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              R$ {extrato.saldoDisponivelDinheiro.toFixed(2)}
            </div>
            <p className="text-xs ">Valor disponível para retirada</p>
            {extrato.saldoDisponivelDinheiro > 0 && (
              <Button
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={() =>
                  handleSolicitarSaque(
                    "dinheiro",
                    extrato.saldoDisponivelDinheiro
                  )
                }
                disabled={solicitarSaqueMutation.isPending}
              >
                Solicitar Saque
              </Button>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Itens Vendidos (para este fornecedor)
            </CardTitle>
            <Package className="h-4 w-4 " />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {extrato.itensVendidos.length}
            </div>
            <p className="text-xs ">
              {extrato.itensVendidos.length === 1
                ? "item vendido"
                : "itens vendidos"}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Itens Consignados Vendidos</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Código Item</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead>Preço Venda</TableHead>
                <TableHead>Valor Crédito (R$)</TableHead>
                <TableHead>Valor Dinheiro (R$)</TableHead>
                <TableHead>Data Venda</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {extrato.itensVendidos.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-4 ">
                    Nenhum item consignado deste fornecedor foi vendido ainda.
                  </TableCell>
                </TableRow>
              ) : (
                extrato.itensVendidos.map((item) => {
                  const valorCredito = (item.precoVenda * 0.5).toFixed(2);
                  const valorDinheiro = (item.precoVenda * 0.4).toFixed(2);
                  const vendaAssociada = (allVendas || []).find((v) =>
                    v.itens.some(
                      (i) => i.itemId === item.id && i.tipo === "consignacao"
                    )
                  );
                  return (
                    <TableRow key={item.id}>
                      <TableCell>{item.codigoFornecedor}</TableCell>
                      <TableCell>
                        {item.marca} - {item.categoria} ({item.tamanho})
                      </TableCell>
                      <TableCell className="font-semibold">
                        R$ {item.precoVenda.toFixed(2)}
                      </TableCell>
                      <TableCell>R$ {valorCredito}</TableCell>
                      <TableCell>R$ {valorDinheiro}</TableCell>
                      <TableCell>
                        {vendaAssociada
                          ? format(vendaAssociada.dataVenda, "dd/MM/yyyy", {
                              locale: ptBR,
                            })
                          : "N/A"}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Histórico de Pagamentos e Saques</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID Transação</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Data</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {extrato.pagamentos.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-4 ">
                    Nenhum pagamento ou saque registrado.
                  </TableCell>
                </TableRow>
              ) : (
                extrato.pagamentos.map((pagamento) => (
                  <TableRow key={pagamento.id}>
                    <TableCell className="font-mono text-xs">
                      {pagamento.id.slice(0, 8)}
                    </TableCell>
                    <TableCell className="font-semibold">
                      R$ {pagamento.valor.toFixed(2)}
                    </TableCell>
                    <TableCell>
                      {pagamento.tipo === "credito_loja"
                        ? "Crédito Loja"
                        : "Dinheiro"}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          pagamento.status === "pago" ? "success" : "secondary"
                        }
                      >
                        {pagamento.status === "pago" ? "Pago" : "Pendente"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {pagamento.dataPagamento
                        ? format(pagamento.dataPagamento, "dd/MM/yyyy", {
                            locale: ptBR,
                          })
                        : "Pendente"}
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
