// src/components/clientes/VisualizarCliente.tsx
"use client";

import React, { useState, useMemo } from "react"; // Adicionado useMemo
import type { Cliente, Venda } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge"; // Pode remover se não for usado
import { Button } from "@/components/ui/button";
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
import { ExternalLink } from "lucide-react";

import { getClienteById, getVendas, deleteCliente } from "@/lib/db";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/store";
import { toast } from "sonner";

import DialogEditarCliente from "./DialogEditarCliente";

interface VisualizarClienteProps {
  clienteId: string;
}

export default function VisualizarCliente({
  clienteId,
}: VisualizarClienteProps) {
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
    queryClient
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
    queryClient
  );

  const deleteMutation = useMutation(
    {
      mutationFn: deleteCliente,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["clientes"] });
        queryClient.invalidateQueries({ queryKey: ["vendas"] });
        toast.success("Cliente Excluído!", {
          description: `O cliente ${cliente?.nome || ""} foi removido.`,
        });
        window.location.href = "/clientes";
      },
      onError: (error) => {
        toast.error("Erro na Exclusão", {
          description: error.message || "Não foi possível excluir o cliente.",
        });
      },
    },
    queryClient
  );

  // Garantir que 'todasVendas' não é undefined para useMemo
  const actualTodasVendas = todasVendas || [];

  const historicoComprasDoCliente = useMemo(() => {
    // Mover a lógica para useMemo
    return actualTodasVendas
      .filter(
        (venda) => venda.clienteId === cliente?.id // Use cliente?.id
      )
      .sort((a, b) => b.dataVenda.getTime() - a.dataVenda.getTime());
  }, [actualTodasVendas, cliente]); // Depende de actualTodasVendas e cliente

  const handleDelete = () => {
    if (
      window.confirm(
        `Tem certeza que deseja excluir o cliente ${
          cliente?.nome || "este cliente"
        }? Esta ação não pode ser desfeita.`
      )
    ) {
      if (cliente) {
        // Só chama a mutação se o cliente estiver definido
        deleteMutation.mutate(cliente.id);
      }
    }
  };
  // --- FIM DOS HOOKS ---

  // --- AGORA, AS CONDIÇÕES DE RETORNO PRECOCE (APÓS TODOS OS HOOKS) ---
  if (isLoadingCliente || isLoadingVendas) {
    return (
      <div className="flex justify-center items-center h-48">
        <p className="text-xl ">Carregando perfil do cliente...</p>
      </div>
    );
  }

  if (isErrorCliente || isErrorVendas || !cliente) {
    // 'cliente' pode ser undefined se houver erro ou não encontrado
    console.error("Erro na busca de dados para VisualizarCliente:", {
      isErrorCliente,
      isErrorVendas,
      clienteExists: !!cliente,
    });
    return (
      <div className="text-center py-10">
        <h1 className="text-3xl font-bold mb-4">
          Cliente não encontrado ou erro.
        </h1>
        <p className="text-lg ">
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
    <div className="space-y-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-extrabold ">
          Perfil do Cliente: {cliente.nome}
        </h1>
        <div className="flex gap-4">
          <Button variant="outline" onClick={() => setIsEditDialogOpen(true)}>
            Editar Cliente
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
          >
            Excluir Cliente
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Histórico de Compras</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID da Venda</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Valor Total</TableHead>
                <TableHead>Itens</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {historicoComprasDoCliente.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-4 ">
                    Nenhuma compra registrada para este cliente.
                  </TableCell>
                </TableRow>
              ) : (
                historicoComprasDoCliente.map((venda) => (
                  <TableRow key={venda.id}>
                    <TableCell className="font-mono text-xs">
                      {venda.id.slice(0, 8)}
                    </TableCell>
                    <TableCell>
                      {format(venda.dataVenda, "dd/MM/yyyy", { locale: ptBR })}
                    </TableCell>
                    <TableCell className="font-semibold">
                      R$ {venda.valorTotal.toFixed(2)}
                    </TableCell>
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
                    <TableCell className="text-right">
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

      {isEditDialogOpen && (
        <DialogEditarCliente
          cliente={cliente}
          isOpen={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
        />
      )}
    </div>
  );
}
