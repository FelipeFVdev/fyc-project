// src/components/vendas/FormVenda.tsx
"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { vendaSchema } from "@/lib/validations";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import type { Venda, ItemGarimpo, ItemConsignacao } from "@/types";
import { z } from "zod";
import { X, PlusCircle } from "lucide-react";

import {
  getItensGarimpo,
  getItensConsignados,
  getClientes,
  addVenda,
} from "@/lib/db";
import { formatCpf, formatTelefone } from "@/lib/utils";

import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/store";

type VendaFormData = z.infer<typeof vendaSchema>;

export default function FormVenda() {
  const { data: itensGarimpo, isLoading: isLoadingGarimpo } = useQuery(
    {
      queryKey: ["itensGarimpo"],
      queryFn: getItensGarimpo,
    },
    queryClient
  );

  const { data: itensConsignados, isLoading: isLoadingConsignados } = useQuery(
    {
      queryKey: ["itensConsignados"],
      queryFn: getItensConsignados,
    },
    queryClient
  );

  const isLoadingItems = isLoadingGarimpo || isLoadingConsignados;

  const allAvailableItems = useMemo(() => {
    const garimpo =
      itensGarimpo?.filter((item) => item.status === "disponivel") || [];
    const consignados =
      itensConsignados?.filter((item) => item.status === "disponivel") || [];
    return [...garimpo, ...consignados];
  }, [itensGarimpo, itensConsignados]);

  const { data: clientes, isLoading: isLoadingClientes } = useQuery(
    {
      queryKey: ["clientes"],
      queryFn: getClientes,
    },
    queryClient
  );

  const form = useForm<VendaFormData>({
    resolver: zodResolver(vendaSchema),
    defaultValues: {
      clienteNome: "",
      clienteId: undefined,
      itens: [],
      formaPagamento: "dinheiro",
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "itens",
  });

  // --- ALTERAÇÃO AQUI: Observar os IDs de cada item E o comprimento do array 'fields' ---
  // Isso força o useMemo a re-executar quando:
  // 1. Um item é adicionado/removido (fields.length)
  // 2. O itemId de qualquer item é alterado (form.watch em cada itemId)
  const watchedItemIds = form.watch(
    fields.map((_, index) => `itens.${index}.itemId` as const)
  );
  const numberOfItems = fields.length; // Também observar o número de itens
  // --- FIM ALTERAÇÃO ---

  useEffect(() => {
    const selectedClienteId = form.watch("clienteId");
    if (selectedClienteId && selectedClienteId !== "unselected") {
      const cliente = clientes?.find((c) => c.id === selectedClienteId);
      if (cliente) {
        form.setValue("clienteNome", cliente.nome, { shouldValidate: true });
      }
    } else {
      form.setValue("clienteNome", "", { shouldValidate: true });
    }
  }, [form.watch("clienteId"), form, clientes]);

  // --- ALTERAÇÃO AQUI: As dependências do useMemo ---
  const { valorTotal, custoTotal, margemLucro } = useMemo(() => {
    console.log("--> Recalculando resumo financeiro. Itens: ", numberOfItems); // Debugging
    let currentValorTotal = 0;
    let currentCustoTotal = 0;

    // Acessar os valores dos itens diretamente pelo form.getValues() ou usar watchedItems
    // Para maior confiabilidade, podemos obter os itens ATUAIS do formulário
    const currentFormItems = form.getValues("itens");

    currentFormItems.forEach((field) => {
      // Iterar sobre os itens ATUAIS
      const itemData = allAvailableItems.find(
        (item) => item.id === field.itemId && field.itemId !== "unselected_item"
      );
      if (itemData) {
        currentValorTotal += itemData.precoVenda;
        currentCustoTotal += itemData.id.startsWith("g")
          ? (itemData as ItemGarimpo).custoCompra +
            (itemData as ItemGarimpo).custosAdicionais
          : (itemData as ItemConsignacao).precoVenda * 0.5;
      }
    });

    const currentMargemLucro = currentValorTotal - currentCustoTotal;
    console.log("--> Resumo calculado:", {
      valorTotal: currentValorTotal,
      custoTotal: currentCustoTotal,
      margemLucro: currentMargemLucro,
    }); // Debugging
    return {
      valorTotal: currentValorTotal,
      custoTotal: currentCustoTotal,
      margemLucro: currentMargemLucro,
    };
  }, [watchedItemIds, numberOfItems, allAvailableItems, form]); // <--- Dependências ajustadas
  // Use watchedItemIds e numberOfItems como dependências
  // 'form' também é adicionado porque 'form.getValues()' é usado
  // --- FIM ALTERAÇÃO ---

  const addVendaMutation = useMutation(
    {
      mutationFn: addVenda,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["vendas"] });
        queryClient.invalidateQueries({ queryKey: ["itensGarimpo"] });
        queryClient.invalidateQueries({ queryKey: ["itensConsignados"] });

        toast.success("Venda Registrada!", {
          description: `Venda no valor de R$ ${valorTotal.toFixed(
            2
          )} foi concluída.`,
        });
        form.reset({
          clienteNome: "",
          clienteId: undefined,
          itens: [],
          formaPagamento: "dinheiro",
        });
      },
      onError: (error) => {
        console.error("Erro ao registrar venda:", error);
        toast.error("Erro na Venda", {
          description:
            error.message ||
            "Não foi possível registrar a venda. Tente novamente.",
        });
      },
    },
    queryClient
  );

  const isLoadingForm =
    addVendaMutation.isPending || isLoadingItems || isLoadingClientes;

  async function onSubmit(data: VendaFormData) {
    try {
      if (data.itens.length === 0) {
        toast.error("Venda Vazia", {
          description: "Adicione pelo menos um item à venda.",
        });
        return;
      }

      const finalClienteId =
        data.clienteId === "unselected" ? undefined : data.clienteId;
      if (!finalClienteId && !data.clienteNome?.trim()) {
        form.setError("clienteNome", {
          type: "manual",
          message:
            "Nome do cliente é obrigatório se nenhum cliente existente for selecionado.",
        });
        toast.error("Cliente Ausente", {
          description:
            "Selecione um cliente existente ou preencha o nome do cliente.",
        });
        return;
      }

      const itensValidosParaVenda = data.itens.filter(
        (itemField) => itemField.itemId !== "unselected_item"
      );
      if (itensValidosParaVenda.length === 0) {
        toast.error("Itens Inválidos", {
          description: "Pelo menos um item deve ser selecionado para a venda.",
        });
        return;
      }

      const vendaToSubmit: Venda = {
        id: crypto.randomUUID(),
        dataVenda: new Date(),
        clienteId: finalClienteId,
        clienteNome: data.clienteNome,
        itens: itensValidosParaVenda.map((itemField) => {
          const itemFullData = allAvailableItems.find(
            (item) => item.id === itemField.itemId
          );
          if (!itemFullData) {
            throw new Error(`Item com ID ${itemField.itemId} não encontrado.`);
          }
          return {
            itemId: itemFullData.id,
            tipo: itemFullData.id.startsWith("g") ? "garimpo" : "consignacao",
            precoVenda: itemFullData.precoVenda,
            custoBase: itemFullData.id.startsWith("g")
              ? (itemFullData as ItemGarimpo).custoCompra +
                (itemFullData as ItemGarimpo).custosAdicionais
              : (itemFullData as ItemConsignacao).precoVenda * 0.5,
          };
        }),
        valorTotal: itensValidosParaVenda.reduce(
          (acc, field) =>
            acc +
            (allAvailableItems.find((i) => i.id === field.itemId)?.precoVenda ||
              0),
          0
        ),
        custoTotal: itensValidosParaVenda.reduce((acc, field) => {
          const item = allAvailableItems.find((i) => i.id === field.itemId);
          if (!item) return acc;
          return (
            acc +
            (item.id.startsWith("g")
              ? (item as ItemGarimpo).custoCompra +
                (item as ItemGarimpo).custosAdicionais
              : (item as ItemConsignacao).precoVenda * 0.5)
          );
        }, 0),
        margemLucro: 0,
        formaPagamento: data.formaPagamento,
      };
      vendaToSubmit.margemLucro =
        vendaToSubmit.valorTotal - vendaToSubmit.custoTotal;

      addVendaMutation.mutate(vendaToSubmit);
    } catch (error: any) {
      console.error("Erro na preparação da venda:", error);
      toast.error("Erro na Preparação", {
        description: error.message || "Ocorreu um erro ao preparar a venda.",
      });
    }
  }

  // ... (JSX de renderização é o mesmo) ...

  return (
    <>
      <h1 className="text-3xl font-bold mb-8">Registrar Nova Venda</h1>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="clienteId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cliente Existente</FormLabel>
                  <Select
                    onValueChange={(value) =>
                      field.onChange(value === "unselected" ? undefined : value)
                    }
                    value={field.value || "unselected"}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um cliente" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="unselected">
                        -- Selecione --
                      </SelectItem>
                      {clientes?.map((cliente) => (
                        <SelectItem key={cliente.id} value={cliente.id}>
                          {cliente.nome}{" "}
                          {cliente.cpf
                            ? `(CPF: ${formatCpf(cliente.cpf)})`
                            : ""}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Opcional: vincule a venda a um cliente cadastrado.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="clienteNome"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome do Cliente</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Nome para registro rápido"
                      {...field}
                      disabled={
                        !!form.watch("clienteId") &&
                        form.watch("clienteId") !== "unselected"
                      }
                    />
                  </FormControl>
                  <FormDescription>
                    Obrigatório se nenhum cliente existente for selecionado.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-semibold border-b pb-2">
              Itens da Venda
            </h2>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Preço</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {fields.map((field, index) => {
                  const currentItemId = form.watch(`itens.${index}.itemId`);
                  const selectedItem = allAvailableItems.find(
                    (item) => item.id === currentItemId
                  );

                  return (
                    <TableRow key={field.id}>
                      <TableCell>
                        <FormField
                          control={form.control}
                          name={`itens.${index}.itemId`}
                          render={({ field: itemField }) => (
                            <FormItem className="my-0">
                              <Select
                                onValueChange={(value) => {
                                  itemField.onChange(value);
                                  const itemFound = allAvailableItems.find(
                                    (i) => i.id === value
                                  );
                                  form.setValue(
                                    `itens.${index}.tipo`,
                                    itemFound?.id?.startsWith("g")
                                      ? "garimpo"
                                      : "consignacao"
                                  );
                                }}
                                value={itemField.value || "unselected_item"}
                              >
                                <FormControl>
                                  <SelectTrigger className="w-[200px]">
                                    <SelectValue placeholder="Selecione um item" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="unselected_item" disabled>
                                    Selecione um item
                                  </SelectItem>
                                  {allAvailableItems.length === 0 ? (
                                    <SelectItem
                                      value="no_items_available"
                                      disabled
                                    >
                                      Nenhum item disponível
                                    </SelectItem>
                                  ) : (
                                    allAvailableItems.map((item) => (
                                      <SelectItem key={item.id} value={item.id}>
                                        {item.marca} - {item.categoria} (R$
                                        {item.precoVenda.toFixed(2)})
                                      </SelectItem>
                                    ))
                                  )}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </TableCell>
                      <TableCell>
                        {selectedItem?.id?.startsWith("g")
                          ? "Garimpo"
                          : "Consignação"}
                        <FormField
                          control={form.control}
                          name={`itens.${index}.tipo`}
                          render={({ field: typeField }) => (
                            <input type="hidden" {...typeField} />
                          )}
                        />
                      </TableCell>
                      <TableCell>
                        R${" "}
                        {selectedItem
                          ? selectedItem.precoVenda.toFixed(2)
                          : "0.00"}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => remove(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-4"
              onClick={() =>
                append({
                  itemId: "unselected_item",
                  tipo: "garimpo",
                  precoVenda: 0,
                  custoBase: 0,
                })
              }
            >
              <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Item
            </Button>
          </div>

          <div className="bg-gray-50 p-6 rounded-lg space-y-2">
            <h3 className="font-semibold text-xl mb-4">Resumo Financeiro</h3>
            <div className="flex justify-between">
              <span className="text-gray-600">Valor Total dos Itens:</span>
              <span className="font-bold">R$ {valorTotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Custo Total (para loja):</span>
              <span className="font-bold">R$ {custoTotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-lg font-bold border-t pt-2 mt-2">
              <span>Lucro Estimado:</span>
              <span className="text-green-600">
                R$ {margemLucro.toFixed(2)}
              </span>
            </div>
          </div>

          <FormField
            control={form.control}
            name="formaPagamento"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Forma de Pagamento *</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a forma de pagamento" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="dinheiro">Dinheiro</SelectItem>
                    <SelectItem value="pix">PIX</SelectItem>
                    <SelectItem value="cartao">Cartão</SelectItem>
                    <SelectItem value="credito_loja">
                      Crédito de Loja
                    </SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex gap-4 pt-6">
            <Button type="submit" className="flex-1" disabled={isLoadingForm}>
              {isLoadingForm ? "Finalizando Venda..." : "Registrar Venda"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() =>
                form.reset({
                  clienteId: undefined,
                  itens: [],
                  formaPagamento: "dinheiro",
                })
              }
              disabled={isLoadingForm}
            >
              Limpar Formulário
            </Button>
          </div>
        </form>
      </Form>
    </>
  );
}
