// src/components/garimpo/FormItemGarimpo.tsx
"use client"; // ESSENCIAL para hooks (useForm, useMutation)

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { itemGarimpoSchema } from "@/lib/validations";
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
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { z } from "zod";
import { toast } from "sonner"; // Import toast for notifications
import type { ItemGarimpo } from "@/types"; // Importando o tipo

// --- IMPORTAR FUNÇÃO DE MUTAÇÃO E HOOKS DO TANSTACK QUERY ---
import { addItemGarimpo } from "@/lib/db"; // Função para adicionar item
import { useMutation } from "@tanstack/react-query";
import { queryClient } from "@/store";

type FormData = z.infer<typeof itemGarimpoSchema>;

export default function FormItemGarimpo() {
  const form = useForm<FormData>({
    resolver: zodResolver(itemGarimpoSchema),
    defaultValues: {
      localCompra: "", // Adicionado default vazio
      dataCompra: new Date(),
      custoCompra: 0,
      custosAdicionais: 0,
      margemLucro: 50,
      marca: "",
      tamanho: "",
      categoria: "",
      descricao: "",
    },
  });

  const custoCompra = form.watch("custoCompra") || 0;
  const custosAdicionais = form.watch("custosAdicionais") || 0;
  const margemLucro = form.watch("margemLucro") || 0;

  const custoTotal = custoCompra + custosAdicionais;
  const precoVenda = custoTotal * (1 + margemLucro / 100);

  // --- USEMUTATION PARA ADICIONAR ITEM DE GARIMPO ---
  const addItemMutation = useMutation(
    {
      mutationFn: addItemGarimpo, // A função de fetch que adiciona o item
      onSuccess: (newItem) => {
        queryClient.invalidateQueries({ queryKey: ["itensGarimpo"] }); // Invalida a lista de itens de garimpo

        toast.success("Item de Garimpo Cadastrado!", {
          description: `O item '${newItem.categoria}' de ${newItem.marca} foi adicionado.`,
        });
        form.reset({
          localCompra: "",
          dataCompra: new Date(),
          custoCompra: 0,
          custosAdicionais: 0,
          margemLucro: 50,
          marca: "",
          tamanho: "",
          categoria: "",
          descricao: "",
        }); // Reseta o formulário
      },
      onError: (error) => {
        console.error("Erro ao cadastrar item de garimpo:", error);
        toast.error("Erro no Cadastro", {
          description:
            error.message ||
            "Não foi possível registrar o item. Tente novamente.",
        });
      },
    },
    queryClient
  );

  const isLoadingForm = addItemMutation.isPending; // Estado de carregamento do formulário

  async function onSubmit(data: FormData) {
    try {
      const itemCompleto: ItemGarimpo = {
        ...data,
        id: crypto.randomUUID(),
        precoVenda,
        status: "disponivel", // Type 'as const' não é necessário aqui
        dataEntradaEstoque: new Date(),
      };

      // Chama a mutação para adicionar o item
      addItemMutation.mutate(itemCompleto);
    } catch (error: any) {
      console.error("Erro na preparação do item de garimpo:", error);
      toast.error("Erro na Preparação", {
        description:
          error.message || "Ocorreu um erro ao preparar o item de garimpo.",
      });
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="localCompra"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Local de Compra *</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Ex: Bazar São Vicente"
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
            name="dataCompra"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Data de Compra *</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                        disabled={isLoadingForm}
                      >
                        {field.value ? (
                          format(field.value, "PPP", { locale: ptBR })
                        ) : (
                          <span>Selecione uma data</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) =>
                        date > new Date() ||
                        date < new Date("1900-01-01") ||
                        isLoadingForm
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="custoCompra"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Custo de Compra (R$) *</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    {...field}
                    onChange={(e) => field.onChange(parseFloat(e.target.value))}
                    disabled={isLoadingForm}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="custosAdicionais"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Custos Adicionais (R$)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    {...field}
                    onChange={(e) => field.onChange(parseFloat(e.target.value))}
                    disabled={isLoadingForm}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="margemLucro"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Margem de Lucro (%) *</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="1"
                    placeholder="50"
                    {...field}
                    onChange={(e) => field.onChange(parseFloat(e.target.value))}
                    disabled={isLoadingForm}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="marca"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Marca</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Ex: Zara, H&M"
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
            name="tamanho"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tamanho</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Ex: P, M, G, 38"
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
            name="categoria"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Categoria</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Ex: Vestido, Calça"
                    {...field}
                    disabled={isLoadingForm}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="descricao"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descrição</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Descreva o item..."
                  className="resize-none"
                  {...field}
                  disabled={isLoadingForm}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="-50 p-6 rounded-lg space-y-2">
          <h3 className="font-semibold text-lg mb-4">Resumo de Preços</h3>
          <div className="flex justify-between">
            <span className="">Custo Total:</span>
            <span className="font-medium">R$ {custoTotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="">Margem de Lucro:</span>
            <span className="font-medium">{margemLucro}%</span>
          </div>
          <div className="flex justify-between text-lg font-bold border-t pt-2 mt-2">
            <span>Preço de Venda:</span>
            <span className="text-green-600">R$ {precoVenda.toFixed(2)}</span>
          </div>
        </div>

        <div className="flex gap-4">
          <Button type="submit" className="flex-1" disabled={isLoadingForm}>
            {isLoadingForm ? "Cadastrando..." : "Cadastrar Item"}
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
