// src/components/clientes/DialogFormCliente.tsx
"use client";

import React from "react";
import type { Cliente } from "@/types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import FormCliente from "./FormCliente";

interface DialogFormClienteProps {
  /**
   * Cliente existente para edição. Se não fornecido, o formulário será para criar um novo cliente.
   */
  cliente?: Cliente;
  /**
   * Controla se o dialog está aberto (para controle externo).
   */
  isOpen?: boolean;
  /**
   * Callback chamado quando o estado de abertura mudar (para controle externo).
   */
  onOpenChange?: (open: boolean) => void;
  /**
   * Título personalizado do dialog.
   */
  title?: string;
  /**
   * Descrição personalizada do dialog.
   */
  description?: string;
  /**
   * Callback chamado quando o cliente é criado ou atualizado com sucesso.
   */
  onSuccess?: (cliente: Cliente) => void;
  /**
   * Callback chamado quando ocorre um erro.
   */
  onError?: (error: Error) => void;
  /**
   * Conteúdo do trigger (botão que abre o dialog). Se fornecido, o dialog será controlado internamente.
   */
  trigger?: React.ReactNode;
}

export default function DialogFormCliente({
  cliente,
  isOpen,
  onOpenChange,
  title,
  description,
  onSuccess,
  onError,
  trigger,
}: DialogFormClienteProps) {
  const isEditMode = !!cliente;
  const [internalOpen, setInternalOpen] = React.useState(false);

  // Se não houver controle externo, usa controle interno
  const isControlled = isOpen !== undefined && onOpenChange !== undefined;
  const open = isControlled ? isOpen : internalOpen;
  const setOpen = isControlled
    ? onOpenChange!
    : (value: boolean) => setInternalOpen(value);

  const defaultTitle = isEditMode
    ? `Editar Cliente: ${cliente?.nome}`
    : "Novo Cliente";
  const defaultDescription = isEditMode
    ? "Faça as alterações necessárias e clique em salvar."
    : "Preencha os dados abaixo para cadastrar um novo cliente.";

  const handleSuccess = (cliente: Cliente) => {
    setOpen(false);
    onSuccess?.(cliente);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title || defaultTitle}</DialogTitle>
          <DialogDescription>
            {description || defaultDescription}
          </DialogDescription>
        </DialogHeader>

        <FormCliente
          cliente={cliente}
          onSuccess={handleSuccess}
          onError={onError}
          resetOnSuccess={false}
          showResetButton={false}
        />
      </DialogContent>
    </Dialog>
  );
}
