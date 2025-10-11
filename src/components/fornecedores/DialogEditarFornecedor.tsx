// src/components/fornecedores/DialogEditarFornecedor.tsx
// NENHUM "use client" AQUI (como discutimos, Astro cuidará disso via client:load)

import React, { useState, useEffect } from "react"; // Adicione useEffect
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger, // Manter o DialogTrigger para o default, mas não será usado diretamente
} from "@/components/ui/dialog";
import { toast } from "sonner";
import type { Fornecedor } from "@/types";
import { z } from "zod";
import type { fornecedorSchema } from "@/lib/validations";

import FormEditarFornecedor from "./FormEditarFornecedor";

type FornecedorFormData = z.infer<typeof fornecedorSchema>;

interface DialogEditarFornecedorProps {
  fornecedor: Fornecedor;
  onUpdate: (updatedFornecedor: Fornecedor) => void;
  // NOVAS PROPS para controlar o dialog externamente
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function DialogEditarFornecedor({
  fornecedor,
  onUpdate,
  isOpen, // Recebe o estado de abertura
  onOpenChange, // Recebe a função para mudar o estado de abertura
}: DialogEditarFornecedorProps) {
  const [isLoading, setIsLoading] = useState(false);

  // A função de envio é aqui
  async function handleFormSubmit(data: FornecedorFormData) {
    setIsLoading(true);
    try {
      const updatedFornecedor: Fornecedor = {
        ...fornecedor,
        ...data,
        cpf: data.cpf.replace(/\D/g, ""),
        endereco: {
          ...data.endereco,
          cep: data.endereco.cep.replace(/\D/g, ""),
        },
        senha: data.senha ? data.senha : fornecedor.senha,
      };

      console.log("Fornecedor a ser atualizado:", updatedFornecedor);
      await new Promise((resolve) => setTimeout(resolve, 1500));

      onUpdate(updatedFornecedor);
      toast.success("Fornecedor Atualizado!", {
        description: `As informações de ${updatedFornecedor.nome} foram salvas.`,
      });
      onOpenChange(false); // Fecha o dialog via prop
    } catch (error) {
      console.error("Erro ao atualizar fornecedor:", error);
      toast.error("Erro na Atualização", {
        description: "Não foi possível salvar as informações. Tente novamente.",
      });
    } finally {
      setIsLoading(false);
    }
  }

  const handleCancel = () => {
    onOpenChange(false); // Fecha o dialog via prop
  };

  // Quando o dialog abre, reseta o formulário para os valores atuais do fornecedor
  const formRef = React.useRef(null); // Ref para o FormEditarFornecedor
  useEffect(() => {
    if (isOpen) {
      // Aqui você precisaria de uma forma de resetar o formulário filho com os dados mais recentes.
      // A forma mais fácil é passar `fornecedor` para o `FormEditarFornecedor` e o defaultValues ser reavaliado.
      // Se o FormEditarFornecedor tiver um método `reset`, você chamaria ele.
      // Ou, podemos re-renderizar o FormEditarFornecedor quando o dialog abre,
      // mas o ideal é que ele se mantenha com os valores mais recentes.
    }
  }, [isOpen, fornecedor]);

  return (
    // Agora o `open` e `onOpenChange` são controlados pelas props
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      {/* Removemos o DialogTrigger daqui, pois ele será passado por props */}
      {/* Para depuração, você pode manter um DialogTrigger aqui se quiser testar isoladamente */}
      {/* <DialogTrigger asChild>
        <Button variant="outline">TESTAR DIALOG</Button>
      </DialogTrigger> */}
      <DialogContent className="max-w-2xl overflow-y-auto max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Editar Fornecedor: {fornecedor.nome}</DialogTitle>
          <DialogDescription>
            Faça as alterações necessárias e clique em salvar.
          </DialogDescription>
        </DialogHeader>

        <FormEditarFornecedor
          fornecedor={fornecedor}
          onSubmit={handleFormSubmit}
          onCancel={handleCancel}
          isLoading={isLoading}
          // key={isOpen ? 'opened' : 'closed'} // Forçar re-montagem/reset do form quando abre/fecha
        />
      </DialogContent>
    </Dialog>
  );
}
