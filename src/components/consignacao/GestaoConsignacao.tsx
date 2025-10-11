// src/components/consignacao/GestaoConsignacao.tsx
"use client";

import React, { useState, useEffect } from "react";
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

import { mockFornecedores, mockItensConsignados } from "@/lib/db"; // Importação atualizada

export default function GestaoConsignacao() {
  const [itens, setItens] = useState<ItemConsignacao[]>(mockItensConsignados);
  const [busca, setBusca] = useState("");
  const [filtroStatus, setFiltroStatus] = useState<
    | "todos"
    | "disponivel"
    | "vendido"
    | "expirado"
    | "proximo_expiracao"
    | "devolvido"
  >("todos");

  const fornecedorMap = React.useMemo(() => {
    return new Map(mockFornecedores.map((f) => [f.id, f.nome]));
  }, []);

  const itensFiltrados = itens.filter((item) => {
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
      matchStatus = item.status === "disponivel" && !isPast(item.dataExpiracao);
    } else if (filtroStatus === "vendido") {
      matchStatus = item.status === "vendido";
    } else if (filtroStatus === "expirado") {
      matchStatus =
        isPast(item.dataExpiracao) &&
        item.status !== "vendido" &&
        item.status !== "devolvido"; // <--- Ajustado
    } else if (filtroStatus === "proximo_expiracao") {
      matchStatus = isExpiringSoon && item.status === "disponivel";
    } else if (filtroStatus === "devolvido") {
      // <--- NOVO FILTRO
      matchStatus = item.status === "devolvido";
    } else if (filtroStatus !== "todos") {
      // Catch-all para outros status
      matchStatus = item.status === filtroStatus;
    }

    return matchBusca && matchStatus;
  });

  const getStatusBadgeVariant = (item: ItemConsignacao) => {
    const today = new Date();
    const isPastDate = isPast(item.dataExpiracao);
    const isSoon =
      isBefore(item.dataExpiracao, addDays(today, 30)) && !isPastDate;

    if (item.status === "vendido") return "success";
    if (item.status === "devolvido") return "info"; // <--- NOVO VARIANT AQUI!
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

  const handleAction = (
    itemId: string,
    action: "marcar_vendido" | "marcar_devolvido"
  ) => {
    setItens((prevItens) =>
      prevItens.map((item) => {
        if (item.id === itemId) {
          if (action === "marcar_vendido") {
            return { ...item, status: "vendido" };
          }
          if (action === "marcar_devolvido") {
            return { ...item, status: "devolvido" }; // <--- NOVO STATUS
          }
        }
        return item;
      })
    );
    toast.success("Item Atualizado!", {
      description: `Ação realizada para o item ${itemId}.`,
    });
  };

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
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Buscar por marca, categoria, código ou fornecedor..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="pl-9"
          />
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              <Filter className="mr-2 h-4 w-4" />
              Status:{" "}
              {filtroStatus === "todos"
                ? "Todos"
                : filtroStatus === "disponivel"
                ? "Disponível"
                : filtroStatus === "vendido"
                ? "Vendido"
                : filtroStatus === "expirado"
                ? "Expirado"
                : filtroStatus === "devolvido"
                ? "Devolvido" // <--- NOVO TEXTO
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
              {" "}
              {/* <--- NOVO ITEM DE FILTRO */}
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
                <TableCell
                  colSpan={10}
                  className="text-center py-8 text-gray-500"
                >
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
                        <Button variant="ghost" size="sm">
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

                        {/* Ações só disponíveis para itens que NÃO ESTÃO vendidos/devolvidos/expirados */}
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
                        {item.status !== "devolvido" && ( // Pode ter uma opção de reativar item devolvido ou excluir.
                          <DropdownMenuItem className="text-red-600">
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
