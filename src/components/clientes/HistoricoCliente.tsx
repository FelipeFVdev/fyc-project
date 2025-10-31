// src/components/clientes/HistoricoCliente.tsx
"use client";

import React, { useState, useMemo } from "react"; // Adicionado useMemo
import type { Cliente, Venda } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Separator } from "@/components/ui/separator";
import { Calendar, CreditCard, Package } from "lucide-react";

import { getClienteById, getVendas } from "@/lib/db";
import { useQuery } from "@tanstack/react-query";
import { queryClient } from "@/store";

import DialogFormCliente from "./DialogFormCliente";

interface HistoricoClienteProps {
  clienteId: string;
  /**
   * Se true, oculta o cabeçalho e ajusta o layout para funcionar dentro de um dialog.
   */
  compactMode?: boolean;
}

export default function HistoricoCliente({ clienteId }: HistoricoClienteProps) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false); // Movido para o topo

  const {
    data: cliente,
    isLoading: isLoadingCliente,
    isError: isErrorCliente,
  } = useQuery<Cliente | undefined, Error>(
    {
      queryKey: ["cliente", clienteId],
      queryFn: () => getClienteById(clienteId),
      enabled: !!clienteId,
    },
    queryClient,
  );

  const {
    data: todasVendas,
    isLoading: isLoadingVendas,
    isError: isErrorVendas,
  } = useQuery<Venda[], Error>(
    {
      queryKey: ["vendas"],
      queryFn: getVendas,
    },
    queryClient,
  );

  // Garantir que 'todasVendas' não é undefined para useMemo
  const actualTodasVendas = todasVendas || [];

  const historicoComprasDoCliente = useMemo(() => {
    // Mover a lógica para useMemo
    return actualTodasVendas
      .filter(
        (venda) => venda.clienteId === cliente?.id, // Use cliente?.id
      )
      .sort((a, b) => b.dataVenda.getTime() - a.dataVenda.getTime());
  }, [actualTodasVendas, cliente]); // Depende de actualTodasVendas e cliente

  const totalGasto = useMemo(() => {
    return historicoComprasDoCliente.reduce((sum, v) => sum + v.valorTotal, 0);
  }, [historicoComprasDoCliente]);

  const currency = (n: number) =>
    new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(n);

  // --- FIM DOS HOOKS ---

  // --- AGORA, AS CONDIÇÕES DE RETORNO PRECOCE (APÓS TODOS OS HOOKS) ---
  if (isLoadingCliente || isLoadingVendas) {
    return (
      <div className="flex h-48 items-center justify-center">
        <p className="text-xl">Carregando perfil do cliente...</p>
      </div>
    );
  }

  if (isErrorCliente || isErrorVendas || !cliente) {
    // 'cliente' pode ser undefined se houver erro ou não encontrado
    console.error("Erro na busca de dados para HistoricoCliente:", {
      isErrorCliente,
      isErrorVendas,
      clienteExists: !!cliente,
    });
    return (
      <div className="py-10 text-center">
        <h1 className="mb-4 text-3xl font-bold">
          Cliente não encontrado ou erro.
        </h1>
        <p className="text-lg">
          Não foi possível carregar o perfil do cliente. Verifique o ID ou tente
          novamente.
        </p>
        <Button
          onClick={() => (window.location.href = "/clientes")}
          className="mt-6"
        >
          Voltar para a lista
        </Button>
      </div>
    );
  }
  // --- FIM DAS CONDIÇÕES DE RETORNO PRECOCE ---

  return (
    <>
      <div className="bg-muted/20">
        <div className="space-y-4 p-2">
          <div className="flex items-center justify-between text-sm">
            <div className="text-muted-foreground">
              Total comprado: {historicoComprasDoCliente.length}
            </div>
            <div className="font-semibold">
              Total gasto: {currency(totalGasto)}
            </div>
          </div>

          <Separator />
          {historicoComprasDoCliente.length === 0 ? (
            <div className="text-muted-foreground py-8 text-center text-sm">
              Nenhuma compra registrada para este cliente.
            </div>
          ) : (
            // Agrupar vendas por dia e consolidar itens/valores
            Array.from(
              historicoComprasDoCliente.reduce((map, venda) => {
                const key = format(venda.dataVenda, "yyyy-MM-dd");
                const group = map.get(key) || {
                  date: venda.dataVenda,
                  total: 0,
                  itens: [] as {
                    tipo: Venda["itens"][number]["tipo"];
                    precoVenda: number;
                  }[],
                  formas: new Set<string>(),
                };
                group.total += venda.valorTotal;
                venda.itens.forEach((i) =>
                  group.itens.push({ tipo: i.tipo, precoVenda: i.precoVenda }),
                );
                group.formas.add(venda.formaPagamento);
                map.set(key, group);
                return map;
              }, new Map<string, { date: Date; total: number; itens: { tipo: Venda["itens"][number]["tipo"]; precoVenda: number }[]; formas: Set<string> }>()),
            )
              .sort((a, b) => b[0].localeCompare(a[0]))
              .map(([key, group]) => (
                <div key={key} className="bg-background rounded-md border">
                  <div className="bg-muted/40 flex items-center justify-between gap-2 border-b px-4 py-3">
                    <div className="text-muted-foreground flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>
                          {format(group.date, "dd/MM/yyyy", { locale: ptBR })}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CreditCard className="h-4 w-4" />
                        <span className="uppercase">
                          {Array.from(group.formas).join(", ")}
                        </span>
                      </div>
                    </div>
                    <div className="text-right text-base font-semibold">
                      {currency(group.total)}
                    </div>
                  </div>

                  <div className="space-y-3 p-4">
                    <div className="text-sm font-semibold">
                      Itens comprados:
                    </div>
                    {group.itens.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between rounded-md border px-4 py-3"
                      >
                        <div className="flex items-center gap-3">
                          <Package className="text-muted-foreground h-4 w-4" />
                          <div>
                            <div className="text-sm font-semibold">1</div>
                            <div className="text-muted-foreground text-xs">
                              {item.tipo === "garimpo"
                                ? "Item Garimpado"
                                : "Item Consignado"}
                            </div>
                          </div>
                        </div>
                        <div className="text-sm font-medium">
                          {currency(item.precoVenda)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))
          )}
        </div>
      </div>

      <DialogFormCliente
        cliente={cliente}
        isOpen={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
      />
    </>
  );
}
