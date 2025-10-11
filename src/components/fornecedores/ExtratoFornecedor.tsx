// src/components/consignacao/ExtratoFornecedor.tsx
"use client";

import React, { useState, useEffect } from "react";
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
import { toast } from "sonner"; // Import toast for notifications

// --- Importe TODOS os mocks necessários do db.ts ---
import {
  mockFornecedores,
  mockItensConsignados,
  mockHistoricoVendas,
} from "@/lib/db";

interface ExtratoFornecedorProps {
  fornecedorId: string;
}

// Lógica de cálculo do extrato, agora mais robusta
const calculateExtrato = (fornecedorId: string): ExtratoFornecedor | null => {
  const fornecedor = mockFornecedores.find((f) => f.id === fornecedorId);
  if (!fornecedor) return null;

  const itensVendidosDoFornecedor = mockItensConsignados.filter(
    (item) => item.fornecedorId === fornecedorId && item.status === "vendido"
  );

  // Simular pagamentos existentes e saldos
  // Em um app real, `pagamentos` viria de um DB e incluiria histórico de saques/créditos
  const pagamentosDoFornecedor: PagamentoFornecedor[] = [];

  let saldoDisponivelCredito = 0;
  let saldoDisponivelDinheiro = 0;
  let totalDevidoInicial = 0; // O que o fornecedor deveria receber pelos itens vendidos

  itensVendidosDoFornecedor.forEach((item) => {
    const valorCredito = item.precoVenda * 0.5; // 50% para crédito
    const valorDinheiro = item.precoVenda * 0.4; // 40% para dinheiro

    // Adiciona o potencial a ser pago
    totalDevidoInicial += valorCredito; // Assumimos que o máximo é o de crédito para 'total devido'

    // Aqui, em um app real, você checaria se já houve um pagamento para este item.
    // Para simplificar o mock, vamos considerar que cada venda gera um crédito potencial,
    // e os saques/créditos são feitos sobre esse total.

    saldoDisponivelCredito += valorCredito;
    saldoDisponivelDinheiro += valorDinheiro;

    // Adiciona pagamentos "pendentes" simbólicos para itens vendidos para exemplificar
    pagamentosDoFornecedor.push(
      {
        id: `pg-credito-${item.id}`,
        fornecedorId: item.fornecedorId,
        vendaId: item.id,
        valor: valorCredito,
        tipo: "credito_loja",
        porcentagem: 50,
        status: "pendente",
      },
      {
        id: `pg-dinheiro-${item.id}`,
        fornecedorId: item.fornecedorId,
        vendaId: item.id,
        valor: valorDinheiro,
        tipo: "dinheiro",
        porcentagem: 40,
        status: "pendente",
      }
    );
  });

  // Simular um pagamento já feito (para Maria da Silva, id 'f1', do item 'ic1')
  if (fornecedorId === "f1") {
    const pagIC1Credito: PagamentoFornecedor = {
      id: "p1",
      fornecedorId: "f1",
      vendaId: "ic1",
      valor: mockItensConsignados.find((i) => i.id === "ic1")!.precoVenda * 0.5,
      tipo: "credito_loja",
      porcentagem: 50,
      status: "pago",
      dataPagamento: new Date("2024-06-10"),
    };
    pagamentosDoFornecedor.push(pagIC1Credito);
    saldoDisponivelCredito -= pagIC1Credito.valor; // Deduz o que já foi pago
  }

  // Filtrar vendas relevantes para o fornecedor
  const vendasDoFornecedor = mockHistoricoVendas.filter((venda) =>
    venda.itens.some((vendaItem) =>
      itensVendidosDoFornecedor.some(
        (consignadoItem) => consignadoItem.id === vendaItem.itemId
      )
    )
  );

  return {
    fornecedor,
    itensVendidos: itensVendidosDoFornecedor,
    totalDevido: Math.max(0, saldoDisponivelCredito + saldoDisponivelDinheiro), // Total ainda a ser pago
    saldoDisponivelCredito: Math.max(0, saldoDisponivelCredito),
    saldoDisponivelDinheiro: Math.max(0, saldoDisponivelDinheiro),
    pagamentos: pagamentosDoFornecedor, // Aqui é a lista de pagamentos/créditos gerados
  };
};

export default function ExtratoFornecedor({
  fornecedorId,
}: ExtratoFornecedorProps) {
  const [extrato, setExtrato] = useState<ExtratoFornecedor | null>(null);

  useEffect(() => {
    setExtrato(calculateExtrato(fornecedorId));
  }, [fornecedorId]);

  const handleSolicitarSaque = (
    tipo: "dinheiro" | "credito_loja",
    valor: number
  ) => {
    if (!extrato) return;

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

    console.log(
      `Solicitação de saque: Fornecedor ${fornecedorId}, Tipo: ${tipo}, Valor: ${valor}`
    );
    toast.success("Solicitação de Saque Enviada!", {
      description: `Um saque de R$ ${valor.toFixed(
        2
      )} (${tipo}) foi solicitado para ${extrato.fornecedor.nome}.`,
    });

    setExtrato((prevExtrato) => {
      if (!prevExtrato) return null;
      return {
        ...prevExtrato,
        saldoDisponivelDinheiro:
          tipo === "dinheiro"
            ? prevExtrato.saldoDisponivelDinheiro - valor
            : prevExtrato.saldoDisponivelDinheiro,
        saldoDisponivelCredito:
          tipo === "credito_loja"
            ? prevExtrato.saldoDisponivelCredito - valor
            : prevExtrato.saldoDisponivelCredito,
        pagamentos: [
          ...prevExtrato.pagamentos,
          {
            id: crypto.randomUUID(),
            fornecedorId: fornecedorId,
            vendaId: `saque-${crypto.randomUUID()}`,
            valor: valor,
            tipo: tipo,
            porcentagem: 0,
            status: "pendente",
            dataPagamento: new Date(),
          },
        ],
      };
    });
  };

  if (!extrato) {
    return (
      <div className="text-center py-10">
        <h1 className="text-3xl font-bold mb-4">Extrato não encontrado.</h1>
        <p className="text-lg text-gray-600">
          Verifique o ID do fornecedor ou tente novamente.
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
      <h1 className="text-4xl font-extrabold text-gray-900 mb-8">
        Extrato de {extrato.fornecedor.nome}
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Saldo em Crédito de Loja
            </CardTitle>
            <Currency className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              R$ {extrato.saldoDisponivelCredito.toFixed(2)}
            </div>
            <p className="text-xs text-gray-500">
              Valor disponível para compras na loja
            </p>
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
            <Currency className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              R$ {extrato.saldoDisponivelDinheiro.toFixed(2)}
            </div>
            <p className="text-xs text-gray-500">
              Valor disponível para retirada
            </p>
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
            {/* O ícone TableHead aqui não faz sentido, mudei para Package */}
            <Package className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {extrato.itensVendidos.length}
            </div>
            <p className="text-xs text-gray-500">
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
                  <TableCell
                    colSpan={6}
                    className="text-center py-4 text-gray-500"
                  >
                    Nenhum item consignado deste fornecedor foi vendido ainda.
                  </TableCell>
                </TableRow>
              ) : (
                extrato.itensVendidos.map((item) => {
                  const valorCredito = (item.precoVenda * 0.5).toFixed(2);
                  const valorDinheiro = (item.precoVenda * 0.4).toFixed(2);
                  const vendaAssociada = mockHistoricoVendas.find((v) =>
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
                  <TableCell
                    colSpan={5}
                    className="text-center py-4 text-gray-500"
                  >
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
                        {" "}
                        {/* Mudei para success */}
                        {pagamento.status === "pago" ? "Pago" : "Pendente"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {pagamento.dataPagamento
                        ? format(pagamento.dataPagamento, "dd/MM/yyyy", {
                            locale: ptBR,
                          })
                        : "Pendente"}{" "}
                      {/* Mudei para Pendente */}
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
