// src/components/vendas/RelatorioVendas.tsx
"use client";

import React, { useState, useMemo } from "react";
import type { Venda } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DollarSign, LineChart, TrendingUp } from "lucide-react";
import { format, getMonth, getYear } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getVendas } from "@/lib/db";
import { useQuery } from "@tanstack/react-query";
import { queryClient } from "@/store";

const meses = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

export default function RelatorioVendas() {
  // --- CHAME TODOS OS HOOKS PRIMEIRO (antes de qualquer 'return' condicional) ---
  const currentMonth = getMonth(new Date());
  const currentYear = getYear(new Date());

  const [selectedMonth, setSelectedMonth] = useState<string>("todos");
  const [selectedYear, setSelectedYear] = useState<string>("todos");

  const {
    data: historicoVendas,
    isLoading,
    isError,
  } = useQuery<Venda[], Error>(
    {
      queryKey: ["vendas"],
      queryFn: getVendas,
    },
    queryClient
  );

  // Garantir que historicoVendas não é undefined para o useMemo
  const actualHistoricoVendas = historicoVendas || [];

  const vendasDoPeriodo = useMemo(() => {
    return actualHistoricoVendas.filter((venda) => {
      const vendaMonth = getMonth(venda.dataVenda);
      const vendaYear = getYear(venda.dataVenda);

      const monthMatch =
        selectedMonth === "todos" || vendaMonth === parseInt(selectedMonth);
      const yearMatch =
        selectedYear === "todos" || vendaYear === parseInt(selectedYear);

      return monthMatch && yearMatch;
    });
  }, [actualHistoricoVendas, selectedMonth, selectedYear]);

  const { totalVendas, totalLucro, quantidadeItensVendidos } = useMemo(() => {
    let tv = 0;
    let tl = 0;
    let qiv = 0;
    vendasDoPeriodo.forEach((venda) => {
      tv += venda.valorTotal;
      tl += venda.margemLucro;
      qiv += venda.itens.length;
    });
    return {
      totalVendas: tv,
      totalLucro: tl,
      quantidadeItensVendidos: qiv,
    };
  }, [vendasDoPeriodo]);

  const anosDisponiveis = useMemo(() => {
    const anos = [];
    for (let i = currentYear - 2; i <= currentYear + 1; i++) {
      anos.push(String(i));
    }
    return anos;
  }, [currentYear]);

  // --- FIM DOS HOOKS ---

  // --- AGORA, AS CONDIÇÕES DE RETORNO PRECOCE (APÓS TODOS OS HOOKS) ---
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-48">
        <p className="text-xl text-gray-700">
          Carregando relatório de vendas...
        </p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center py-8 text-red-600">
        Erro ao carregar o relatório de vendas.
      </div>
    );
  }
  // --- FIM DAS CONDIÇÕES DE RETORNO PRECOCE ---

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold mb-8">Relatório de Vendas</h1>

      <div className="flex gap-4 mb-8">
        <Select value={selectedMonth} onValueChange={setSelectedMonth}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Todos os meses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos os meses</SelectItem>
            {meses.map((mes, index) => (
              <SelectItem key={index} value={String(index)}>
                {mes}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={selectedYear} onValueChange={setSelectedYear}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Todos os anos" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos os anos</SelectItem>
            {anosDisponiveis.map((ano) => (
              <SelectItem key={ano} value={ano}>
                {ano}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Faturamento Total
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              R$ {totalVendas.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              Total bruto das vendas
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Lucro Líquido</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ {totalLucro.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              Seu lucro após custos
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Itens Vendidos
            </CardTitle>
            <LineChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{quantidadeItensVendidos}</div>
            <p className="text-xs text-muted-foreground">
              Quantidade de itens transacionados
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Vendas Detalhadas</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Itens</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Lucro</TableHead>
                <TableHead>Pagamento</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {vendasDoPeriodo.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="text-center py-8 text-gray-500"
                  >
                    Nenhuma venda encontrada para o período selecionado.
                  </TableCell>
                </TableRow>
              ) : (
                vendasDoPeriodo.map((venda) => (
                  <TableRow key={venda.id}>
                    <TableCell>
                      {format(venda.dataVenda, "dd/MM/yyyy", {
                        locale: ptBR,
                      })}
                    </TableCell>
                    <TableCell>{venda.clienteNome}</TableCell>
                    <TableCell>
                      {venda.itens.map((item, idx) => (
                        <Badge
                          key={idx}
                          variant="outline"
                          className="mr-1 mb-1"
                        >
                          {item.itemId.slice(0, 5)}... ({item.tipo})
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
                    <TableCell className="text-right">
                      <a href={`/vendas/${venda.id}`}>
                        <Button variant="ghost" size="sm">
                          Ver
                        </Button>
                      </a>
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
