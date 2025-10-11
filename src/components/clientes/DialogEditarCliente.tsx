// src/components/clientes/DialogEditarCliente.tsx
"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { clienteSchema } from "@/lib/validations";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import type { Cliente } from "@/types";
import { z } from "zod";
import { formatCpf, formatTelefone } from "@/lib/utils";

// TanStack Query hooks
import { useMutation } from "@tanstack/react-query";
import { queryClient } from "@/store";
import { updateCliente } from "@/lib/db"; // Função de atualização

type ClienteFormData = z.infer<typeof clienteSchema>;

interface DialogEditarClienteProps {
  cliente: Cliente; // O cliente a ser editado
  isOpen: boolean; // Controla a abertura do dialog
  onOpenChange: (open: boolean) => void; // Callback para mudar o estado de abertura
}

export default function DialogEditarCliente({
  cliente,
  isOpen,
  onOpenChange,
}: DialogEditarClienteProps) {
  const form = useForm<ClienteFormData>({
    resolver: zodResolver(clienteSchema),
    defaultValues: {
      nome: cliente.nome,
      cpf: cliente.cpf || "", // Cuidado com undefined para defaultValues
      telefone: cliente.telefone,
      email: cliente.email || "",
    },
  });

  // Mutação para atualizar cliente
  const updateMutation = useMutation(
    {
      mutationFn: updateCliente,
      onSuccess: (updatedCliente) => {
        queryClient.invalidateQueries({ queryKey: ["clientes"] }); // Invalida a lista
        queryClient.invalidateQueries({
          queryKey: ["cliente", updatedCliente.id],
        }); // Invalida o perfil individual
        toast.success("Cliente Atualizado!", {
          description: `As informações de ${updatedCliente.nome} foram salvas.`,
        });
        onOpenChange(false); // Fecha o dialog
      },
      onError: (error) => {
        toast.error("Erro na Atualização", {
          description:
            error.message ||
            "Não foi possível salvar as informações. Tente novamente.",
        });
      },
    },
    queryClient
  );

  const isLoadingForm = updateMutation.isPending;

  async function onSubmit(data: ClienteFormData) {
    try {
      const updatedCliente: Cliente = {
        ...cliente, // Mantém o ID e outras propriedades não editáveis
        ...data,
        cpf: data.cpf ? data.cpf.replace(/\D/g, "") : undefined,
      };
      updateMutation.mutate(updatedCliente);
    } catch (error: any) {
      toast.error("Erro na Preparação", {
        description:
          error.message ||
          "Ocorreu um erro ao preparar a atualização do cliente.",
      });
    }
  }

  const handleCancel = () => {
    form.reset(form.formState.defaultValues); // Reseta para os valores iniciais do cliente
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl overflow-y-auto max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Editar Cliente: {cliente.nome}</DialogTitle>
          <DialogDescription>
            Faça as alterações necessárias e clique em salvar.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <h3 className="text-xl font-semibold border-b pb-2 mb-4">
              Informações Pessoais
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="nome"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome</FormLabel>
                    <FormControl>
                      <Input {...field} disabled={isLoadingForm} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="cpf"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>CPF</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="000.000.000-00"
                        {...field}
                        onChange={(e) =>
                          field.onChange(formatCpf(e.target.value))
                        }
                        maxLength={14}
                        disabled={isLoadingForm}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="telefone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telefone</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="(00) 00000-0000"
                        {...field}
                        onChange={(e) =>
                          field.onChange(formatTelefone(e.target.value))
                        }
                        maxLength={15}
                        disabled={isLoadingForm}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" {...field} disabled={isLoadingForm} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            {/* Campos de endereço se adicionados ao schema do cliente */}

            <div className="flex justify-end gap-2 mt-8">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={isLoadingForm}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoadingForm}>
                {isLoadingForm ? "Salvando..." : "Salvar Alterações"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
