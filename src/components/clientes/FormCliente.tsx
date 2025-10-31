// src/components/clientes/FormCliente.tsx
"use client";

import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { clienteSchema } from "@/lib/validations";
import { Button } from "@/components/ui/button";
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
import { addCliente, updateCliente } from "@/lib/db";

type ClienteFormData = z.infer<typeof clienteSchema>;

interface FormClienteProps {
  /**
   * Cliente existente para edição. Se não fornecido, o formulário será para criar um novo cliente.
   */
  cliente?: Cliente;
  /**
   * Callback chamado quando o cliente é criado ou atualizado com sucesso.
   */
  onSuccess?: (cliente: Cliente) => void;
  /**
   * Callback chamado quando ocorre um erro.
   */
  onError?: (error: Error) => void;
  /**
   * Se deve resetar o formulário após sucesso. Padrão: true para criação, false para edição.
   */
  resetOnSuccess?: boolean;
  /**
   * Label do botão de submit. Padrão: baseado no modo (criar/editar).
   */
  submitLabel?: string;
  /**
   * Label do botão de limpar/resetar. Padrão: "Limpar".
   */
  resetLabel?: string;
  /**
   * Se deve exibir o botão de limpar. Padrão: true para criação, false para edição.
   */
  showResetButton?: boolean;
}

export default function FormCliente({
  cliente,
  onSuccess,
  onError,
  resetOnSuccess,
  submitLabel,
  resetLabel = "Limpar",
  showResetButton,
}: FormClienteProps) {
  const isEditMode = !!cliente;

  const form = useForm<ClienteFormData>({
    resolver: zodResolver(clienteSchema),
    defaultValues: {
      nome: cliente?.nome || "",
      cpf: cliente?.cpf || "",
      telefone: cliente?.telefone || "",
      email: cliente?.email || "",
    },
  });

  // Atualiza o formulário quando o cliente mudar (útil para edição dinâmica)
  useEffect(() => {
    if (cliente) {
      form.reset({
        nome: cliente.nome,
        cpf: cliente.cpf || "",
        telefone: cliente.telefone,
        email: cliente.email || "",
      });
    }
  }, [cliente, form]);

  // Mutação para criar cliente
  const addClienteMutation = useMutation(
    {
      mutationFn: addCliente,
      onSuccess: (newCliente) => {
        queryClient.invalidateQueries({ queryKey: ["clientes"] });
        toast.success("Cliente Cadastrado!", {
          description: `O cliente ${newCliente.nome} foi registrado com sucesso.`,
        });
        if (resetOnSuccess !== false) {
          form.reset();
        }
        onSuccess?.(newCliente);
      },
      onError: (error) => {
        toast.error("Erro no Cadastro", {
          description:
            error.message ||
            "Não foi possível registrar o cliente. Tente novamente.",
        });
        onError?.(error as Error);
      },
    },
    queryClient,
  );

  // Mutação para atualizar cliente
  const updateClienteMutation = useMutation(
    {
      mutationFn: updateCliente,
      onSuccess: (updatedCliente) => {
        queryClient.invalidateQueries({ queryKey: ["clientes"] });
        queryClient.invalidateQueries({
          queryKey: ["cliente", updatedCliente.id],
        });
        toast.success("Cliente Atualizado!", {
          description: `As informações de ${updatedCliente.nome} foram salvas.`,
        });
        if (resetOnSuccess === true) {
          form.reset();
        }
        onSuccess?.(updatedCliente);
      },
      onError: (error) => {
        toast.error("Erro na Atualização", {
          description:
            error.message ||
            "Não foi possível salvar as informações. Tente novamente.",
        });
        onError?.(error as Error);
      },
    },
    queryClient,
  );

  const isLoadingForm =
    addClienteMutation.isPending || updateClienteMutation.isPending;

  async function onSubmit(data: ClienteFormData) {
    try {
      if (isEditMode && cliente) {
        // Modo edição
        const updatedCliente: Cliente = {
          ...cliente,
          ...data,
          cpf: data.cpf ? data.cpf.replace(/\D/g, "") : undefined,
        };
        updateClienteMutation.mutate(updatedCliente);
      } else {
        // Modo criação
        const novoCliente: Cliente = {
          id: crypto.randomUUID(),
          ...data,
          cpf: data.cpf ? data.cpf.replace(/\D/g, "") : undefined,
          dataCadastro: new Date(),
          historicoCompras: [],
        };
        addClienteMutation.mutate(novoCliente);
      }
    } catch (error: any) {
      toast.error("Erro na Preparação", {
        description:
          error.message ||
          `Ocorreu um erro ao preparar ${
            isEditMode ? "a atualização" : "o cadastro"
          } do cliente.`,
      });
      onError?.(error as Error);
    }
  }

  const defaultSubmitLabel = isLoadingForm
    ? isEditMode
      ? "Salvando..."
      : "Cadastrando..."
    : isEditMode
      ? "Salvar Alterações"
      : "Cadastrar Cliente";
  const shouldShowReset =
    showResetButton !== undefined ? showResetButton : !isEditMode;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <FormField
            control={form.control}
            name="nome"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome *</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Nome completo do cliente"
                    {...field}
                    disabled={isLoadingForm}
                  />
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
                    onChange={(e) => field.onChange(formatCpf(e.target.value))}
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
                <FormLabel>Telefone *</FormLabel>
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
                  <Input
                    type="email"
                    placeholder="email@example.com"
                    {...field}
                    disabled={isLoadingForm}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex gap-4 pt-6">
          <Button type="submit" className="flex-1" disabled={isLoadingForm}>
            {submitLabel || defaultSubmitLabel}
          </Button>
          {shouldShowReset && (
            <Button
              type="button"
              variant="outline"
              onClick={() => form.reset()}
              disabled={isLoadingForm}
            >
              {resetLabel}
            </Button>
          )}
        </div>
      </form>
    </Form>
  );
}
