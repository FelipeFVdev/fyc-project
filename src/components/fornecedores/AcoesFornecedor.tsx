// src/components/fornecedores/FornecedorAcoes.tsx
"use client"; // Este componente usa hooks e componentes interativos (Dialog, Dropdown)

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel, // Adicionado para um título no menu
  DropdownMenuSeparator, // Adicionado para separador
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";
import type { Fornecedor } from "@/types"; // Importação type-only

// Importar o DialogEditarFornecedor
import DialogEditarFornecedor from "./DialogEditarFornecedor";

// --- IMPORTAR HOOKS DO TANSTACK QUERY E FUNÇÕES DE MUTAÇÃO ---
import { useMutation } from "@tanstack/react-query";
import { queryClient } from "@/store";
import { deleteFornecedor, updateFornecedor } from "@/lib/db"; // Funções de atualização e exclusão
import { toast } from "sonner";

interface FornecedorAcoesProps {
  fornecedor: Fornecedor;
}

export default function FornecedorAcoes({ fornecedor }: FornecedorAcoesProps) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  // --- USEMUTATION PARA DELETAR FORNECEDOR ---
  const deleteMutation = useMutation(
    {
      mutationFn: deleteFornecedor,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["fornecedores"] }); // Invalida a lista de fornecedores
        toast.success("Fornecedor Excluído!", {
          description: `O fornecedor ${fornecedor.nome} foi removido.`,
        });
      },
      onError: (error) => {
        toast.error("Erro na Exclusão", {
          description:
            error.message || "Não foi possível excluir o fornecedor.",
        });
      },
    },
    queryClient
  );

  const handleDelete = () => {
    if (
      window.confirm(
        `Tem certeza que deseja excluir o fornecedor ${fornecedor.nome}?`
      )
    ) {
      deleteMutation.mutate(fornecedor.id); // Chama a mutação de exclusão
    }
  };

  // --- USEMUTATION PARA ATUALIZAR FORNECEDOR ---
  const updateMutation = useMutation(
    {
      mutationFn: updateFornecedor,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["fornecedores"] }); // Invalida a lista de fornecedores
        queryClient.invalidateQueries({
          queryKey: ["fornecedor", fornecedor.id],
        }); // Invalida o perfil individual
        toast.success("Fornecedor Atualizado!", {
          description: `As informações de ${fornecedor.nome} foram salvas.`,
        });
      },
      onError: (error) => {
        toast.error("Erro na Atualização", {
          description:
            error.message || "Não foi possível atualizar o fornecedor.",
        });
      },
    },
    queryClient
  );

  const handleUpdate = (updatedFornecedor: Fornecedor) => {
    updateMutation.mutate(updatedFornecedor); // Chama a mutação de atualização
    setIsEditDialogOpen(false);
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Ações</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() =>
              (window.location.href = `/fornecedores/${fornecedor.id}`)
            }
          >
            Ver Informações
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() =>
              (window.location.href = `/fornecedores/extrato/${fornecedor.id}`)
            }
          >
            Ver Extrato
          </DropdownMenuItem>
          {/* O botão "Editar" abre o Dialog */}
          <DropdownMenuItem
            onSelect={(e) => {
              e.preventDefault(); // Impede que o menu feche imediatamente
              setIsEditDialogOpen(true); // Abre o dialog
            }}
          >
            Editar
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleDelete} className="text-red-600">
            Excluir
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* O DialogEditarFornecedor é renderizado condicionalmente ou sempre no DOM
          mas seu estado de abertura é controlado pelo 'isOpen' */}
      {isEditDialogOpen && ( // Renderiza o dialog apenas quando necessário
        <DialogEditarFornecedor
          fornecedor={fornecedor}
          onUpdate={handleUpdate}
          // Prop para controlar a abertura do dialog
          isOpen={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
        />
      )}
    </>
  );
}
