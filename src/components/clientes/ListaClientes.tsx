// src/components/clientes/ListaClientes.tsx
"use client";

import React, { useState, useMemo } from "react";
import type { Cliente } from "@/types";
import { Badge } from "@/components/ui/badge"; // Não usado, pode remover ou ajustar
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { MoreHorizontal, Search, Phone, MapPin } from "lucide-react"; // Removido Filter
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

import { getClientes, deleteCliente } from "@/lib/db";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/store";
import { toast } from "sonner";
import { formatCpf, formatTelefone } from "@/lib/utils";
import DialogFormCliente from "./DialogFormCliente";
import DialogHistoricoCliente from "./DialogHistoricoCliente";
import EntityCard from "@/components/common/EntityCard";

export default function ListaClientes() {
  const [busca, setBusca] = useState("");
  const [clienteEditando, setClienteEditando] = useState<Cliente | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [clienteVisualizando, setClienteVisualizando] =
    useState<Cliente | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);

  const {
    data: clientes,
    isLoading,
    isError,
  } = useQuery<Cliente[], Error>(
    {
      queryKey: ["clientes"],
      queryFn: getClientes,
    },
    queryClient,
  );

  const actualClientes = clientes || [];

  const clientesFiltrados = useMemo(() => {
    return actualClientes.filter((cliente) => {
      const matchBusca =
        cliente.nome.toLowerCase().includes(busca.toLowerCase()) ||
        cliente.cpf?.includes(busca.replace(/\D/g, "")) ||
        cliente.telefone.includes(busca.replace(/\D/g, "")) ||
        cliente.email?.toLowerCase().includes(busca.toLowerCase());

      // Como não há filtro de status, a condição é simplesmente o match da busca.
      // Se você adicionar status ao Cliente, reative o filtro aqui.
      return matchBusca;
    });
  }, [actualClientes, busca]); // Removido filtroStatus das dependências

  const deleteMutation = useMutation(
    {
      mutationFn: deleteCliente,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["clientes"] });
        queryClient.invalidateQueries({ queryKey: ["vendas"] });
        toast.success("Cliente Excluído!", {
          description: "O cliente foi removido.",
        });
      },
      onError: (error) => {
        toast.error("Erro na Exclusão", {
          description: error.message || "Não foi possível excluir o cliente.",
        });
      },
    },
    queryClient,
  );

  const handleDelete = (clienteId: string, clienteNome: string) => {
    if (
      window.confirm(`Tem certeza que deseja excluir o cliente ${clienteNome}?`)
    ) {
      deleteMutation.mutate(clienteId);
    }
  };
  // --- FIM DOS HOOKS ---

  // --- AGORA, AS CONDIÇÕES DE RETORNO PRECOCE (APÓS TODOS OS HOOKS) ---
  if (isLoading) {
    return (
      <div className="flex h-48 items-center justify-center">
        <p className="text-xl">Carregando clientes...</p>
      </div>
    );
  }

  if (isError) {
    console.error("Erro na busca de dados para ListaClientes:", {
      isError,
      clientesExists: !!clientes,
    });
    return (
      <div className="py-8 text-center text-red-600">
        Erro ao carregar clientes.
      </div>
    );
  }
  // --- FIM DAS CONDIÇÕES DE RETORNO PRECOCE ---

  return (
    <div className="space-y-4">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Gestão de Clientes</h1>
        <DialogFormCliente trigger={<Button>Novo Cliente</Button>} />
      </div>

      <div className="mb-6 flex gap-4">
        <div className="relative flex-1">
          <Search className="text-muted-foreground absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2" />
          <Input
            placeholder="Buscar por nome, CPF, telefone ou email..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="bg-white py-6 pl-10"
            disabled={deleteMutation.isPending}
          />
        </div>
      </div>

      {clientesFiltrados.length === 0 ? (
        <div className="rounded-lg border py-8 text-center">
          Nenhum cliente encontrado.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {clientesFiltrados.map((c) => (
            <EntityCard
              key={c.id}
              title={<span className="uppercase">{c.nome}</span>}
              subtitle={`CPF: ${c.cpf ? formatCpf(c.cpf) : "-"}`}
              avatarText={(c.nome?.[0] || "?").toUpperCase()}
              infoRows={[
                {
                  icon: <Phone className="h-4 w-4" />,
                  content: c.telefone ? formatTelefone(c.telefone) : "-",
                },
                {
                  icon: <MapPin className="h-4 w-4" />,
                  content: c.email || "-",
                },
              ]}
              footerLeft={`Registrado: ${format(c.dataCadastro, "dd/MM/yyyy", { locale: ptBR })}`}
              footerRight={
                <button
                  className="text-primary cursor-pointer rounded-lg p-2 font-medium hover:bg-neutral-100"
                  onClick={() => {
                    setClienteVisualizando(c);
                    setIsViewDialogOpen(true);
                  }}
                >
                  Ver Historico
                </button>
              }
              onEdit={() => {
                setClienteEditando(c);
                setIsEditDialogOpen(true);
              }}
              onDelete={() => handleDelete(c.id, c.nome)}
              disabled={deleteMutation.isPending}
            />
          ))}
        </div>
      )}

      {/* Dialog para edição */}
      {clienteEditando && (
        <DialogFormCliente
          cliente={clienteEditando}
          isOpen={isEditDialogOpen}
          onOpenChange={(open) => {
            setIsEditDialogOpen(open);
            if (!open) {
              setClienteEditando(null);
            }
          }}
        />
      )}

      {/* Dialog para visualização */}
      {clienteVisualizando && (
        <DialogHistoricoCliente
          clienteId={clienteVisualizando.id}
          isOpen={isViewDialogOpen}
          onOpenChange={(open) => {
            setIsViewDialogOpen(open);
            if (!open) {
              setClienteVisualizando(null);
            }
          }}
        />
      )}
    </div>
  );
}
