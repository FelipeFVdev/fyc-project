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

interface FornecedorAcoesProps {
  fornecedor: Fornecedor;
  onFornecedorUpdated: (updatedFornecedor: Fornecedor) => void;
  onFornecedorDeleted: (fornecedorId: string) => void; // Callback para exclusão
}

export default function FornecedorAcoes({
  fornecedor,
  onFornecedorUpdated,
  onFornecedorDeleted,
}: FornecedorAcoesProps) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const handleDelete = () => {
    if (
      window.confirm(
        `Tem certeza que deseja excluir o fornecedor ${fornecedor.nome}?`
      )
    ) {
      // Simular exclusão
      console.log(`Excluindo fornecedor ${fornecedor.id}`);
      onFornecedorDeleted(fornecedor.id);
      // Em um app real, faria a chamada de API aqui e, se sucesso, chamaria onFornecedorDeleted
    }
  };

  // Callback que será passado para o DialogEditarFornecedor
  const handleUpdate = (updatedFornecedor: Fornecedor) => {
    onFornecedorUpdated(updatedFornecedor);
    setIsEditDialogOpen(false); // Fechar o dialog após a atualização
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
              (window.location.href = `/consignacao/extrato/${fornecedor.id}`)
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
