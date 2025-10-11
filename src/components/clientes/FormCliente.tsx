// src/components/clientes/FormCliente.tsx
"use client";

import React, { useState } from "react";
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
import { formatCpf, formatTelefone, formatCep } from "@/lib/utils";

// TanStack Query hooks para adicionar cliente
import { useMutation } from "@tanstack/react-query";
import { queryClient } from "@/store";
import { addCliente } from "@/lib/db";

type ClienteFormData = z.infer<typeof clienteSchema>;

const estadosBrasileiros = [
  { value: "AC", label: "Acre" },
  { value: "AL", label: "Alagoas" },
  { value: "AP", label: "Amapá" },
  { value: "AM", label: "Amazonas" },
  { value: "BA", label: "Bahia" },
  { value: "CE", label: "Ceará" },
  { value: "DF", label: "Distrito Federal" },
  { value: "ES", label: "Espírito Santo" },
  { value: "GO", label: "Goiás" },
  { value: "MA", label: "Maranhão" },
  { value: "MT", label: "Mato Grosso" },
  { value: "MS", label: "Mato Grosso do Sul" },
  { value: "MG", label: "Minas Gerais" },
  { value: "PA", label: "Pará" },
  { value: "PB", label: "Paraíba" },
  { value: "PR", label: "Paraná" },
  { value: "PE", label: "Pernambuco" },
  { value: "PI", label: "Piauí" },
  { value: "RJ", label: "Rio de Janeiro" },
  { value: "RN", label: "Rio Grande do Norte" },
  { value: "RS", label: "Rio Grande do Sul" },
  { value: "RO", label: "Rondônia" },
  { value: "RR", label: "Roraima" },
  { value: "SC", label: "Santa Catarina" },
  { value: "SP", label: "São Paulo" },
  { value: "SE", label: "Sergipe" },
  { value: "TO", label: "Tocantins" },
];

export default function FormCliente() {
  const form = useForm<ClienteFormData>({
    resolver: zodResolver(clienteSchema),
    defaultValues: {
      nome: "",
      cpf: "",
      telefone: "",
      email: "",
      // O esquema de cliente não tem endereço, então estas são apenas para campos auxiliares se precisar
      // endereco: { rua: "", numero: "", complemento: "", bairro: "", cidade: "", estado: "", cep: "" },
    },
  });

  const addClienteMutation = useMutation(
    {
      mutationFn: addCliente,
      onSuccess: (newCliente) => {
        queryClient.invalidateQueries({ queryKey: ["clientes"] }); // Invalida a lista de clientes
        toast.success("Cliente Cadastrado!", {
          description: `O cliente ${newCliente.nome} foi registrado com sucesso.`,
        });
        form.reset();
      },
      onError: (error) => {
        toast.error("Erro no Cadastro", {
          description:
            error.message ||
            "Não foi possível registrar o cliente. Tente novamente.",
        });
      },
    },
    queryClient
  );

  const isLoadingForm = addClienteMutation.isPending;

  async function onSubmit(data: ClienteFormData) {
    try {
      const novoCliente: Cliente = {
        id: crypto.randomUUID(),
        ...data,
        cpf: data.cpf ? data.cpf.replace(/\D/g, "") : undefined,
        dataCadastro: new Date(),
        historicoCompras: [],
        // Endereço não é parte do esquema base de cliente, mas poderia ser adicionado se necessário
      };
      addClienteMutation.mutate(novoCliente);
    } catch (error: any) {
      toast.error("Erro na Preparação", {
        description: error.message || "Ocorreu um erro ao preparar o cliente.",
      });
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <h2 className="text-2xl font-semibold border-b pb-2 mb-4">
          Informações do Cliente
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

        {/* NOTA: O schema do cliente não inclui endereço. Se precisar, adicione-o ao clienteSchema */}
        {/* <h2 className="text-2xl font-semibold border-b pb-2 mb-4 mt-8">Endereço</h2> */}
        {/* ... campos de endereço ... */}

        <div className="flex gap-4 pt-6">
          <Button type="submit" className="flex-1" disabled={isLoadingForm}>
            {isLoadingForm ? "Cadastrando..." : "Cadastrar Cliente"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => form.reset()}
            disabled={isLoadingForm}
          >
            Limpar
          </Button>
        </div>
      </form>
    </Form>
  );
}
