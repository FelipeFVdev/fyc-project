// src/components/clientes/DialogHistoricoCliente.tsx
"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import HistoricoCliente from "./HistoricoCliente";

interface DialogHistoricoClienteProps {
  /**
   * ID do cliente a ser visualizado.
   */
  clienteId: string;
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
   * Conteúdo do trigger (botão que abre o dialog). Se fornecido, o dialog será controlado internamente.
   */
  trigger?: React.ReactNode;
}

export default function DialogHistoricoCliente({
  clienteId,
  isOpen,
  onOpenChange,
  title,
  description,
  trigger,
}: DialogHistoricoClienteProps) {
  const [internalOpen, setInternalOpen] = React.useState(false);

  // Se não houver controle externo, usa controle interno
  const isControlled = isOpen !== undefined && onOpenChange !== undefined;
  const open = isControlled ? isOpen : internalOpen;
  const setOpen = isControlled
    ? onOpenChange!
    : (value: boolean) => setInternalOpen(value);

  const defaultTitle = "Perfil do Cliente";
  const defaultDescription =
    "Visualize os detalhes e histórico de compras do cliente.";

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title || defaultTitle}</DialogTitle>
          <DialogDescription>
            {description || defaultDescription}
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[calc(90vh-120px)] overflow-y-auto">
          <HistoricoCliente clienteId={clienteId} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
