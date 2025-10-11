"use client"; // Necessário por usar hooks (useState, useForm) e componentes interativos

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { itemConsignacaoSchema } from "@/lib/validations";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import type { ItemConsignacao, Fornecedor } from "@/types"; // Importação type-only
import { z } from "zod";
import { addMonths, format } from "date-fns";
import { ptBR } from "date-fns/locale";

type ItemConsignacaoFormData = z.infer<typeof itemConsignacaoSchema>;

interface FormItemConsignacaoProps {
  fornecedores: Fornecedor[]; // Lista de fornecedores para vincular
  fornecedorIdInicial?: string; // Para pré-selecionar um fornecedor
  onSubmitSuccess?: (newItem: ItemConsignacao) => void; // Callback opcional
}

export default function FormItemConsignacao({
  fornecedores,
  fornecedorIdInicial,
  onSubmitSuccess,
}: FormItemConsignacaoProps) {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<ItemConsignacaoFormData>({
    resolver: zodResolver(itemConsignacaoSchema),
    defaultValues: {
      fornecedorId: fornecedorIdInicial || "",
      precoVenda: 0,
      marca: "",
      tamanho: "",
      categoria: "",
      descricao: "",
    },
  });

  // Atualiza o campo fornecedorId se fornecedorIdInicial mudar
  useEffect(() => {
    if (fornecedorIdInicial) {
      form.setValue("fornecedorId", fornecedorIdInicial);
    }
  }, [fornecedorIdInicial, form]);

  async function onSubmit(data: ItemConsignacaoFormData) {
    setIsLoading(true);
    try {
      const dataInicioConsignacao = new Date();
      const dataExpiracao = addMonths(dataInicioConsignacao, 3); // 3 meses de expiração

      const newItemConsignacao: ItemConsignacao = {
        id: crypto.randomUUID(),
        ...data,
        codigoFornecedor: `${data.fornecedorId
          .substring(0, 3)
          .toUpperCase()}-${crypto.randomUUID().substring(0, 4)}`, // Ex: FOR-abcd
        dataInicioConsignacao,
        dataExpiracao,
        status: "disponivel",
      };

      // Simulação de chamada de API/banco de dados
      console.log("Item consignado a ser cadastrado:", newItemConsignacao);
      await new Promise((resolve) => setTimeout(resolve, 1500));

      toast.success("Item Consignado Cadastrado!", {
        description: `O item '${
          newItemConsignacao.categoria
        }' foi adicionado para ${
          fornecedores.find((f) => f.id === newItemConsignacao.fornecedorId)
            ?.nome || "um fornecedor desconhecido"
        }.`,
      });
      form.reset({ fornecedorId: data.fornecedorId }); // Reseta, mantendo o fornecedor selecionado
      onSubmitSuccess?.(newItemConsignacao); // Chama o callback se houver
    } catch (error) {
      console.error("Erro ao cadastrar item consignado:", error);
      toast.error("Erro no Cadastro", {
        description: "Não foi possível registrar o item. Tente novamente.",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Fornecedor */}
        <FormField
          control={form.control}
          name="fornecedorId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Fornecedor *</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um fornecedor" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {fornecedores.length === 0 ? (
                    <SelectItem value="" disabled>
                      Nenhum fornecedor disponível
                    </SelectItem>
                  ) : (
                    fornecedores.map((fornecedor) => (
                      <SelectItem key={fornecedor.id} value={fornecedor.id}>
                        {fornecedor.nome} (CPF: {fornecedor.cpf.substring(0, 3)}
                        ...)
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Preço de Venda */}
          <FormField
            control={form.control}
            name="precoVenda"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Preço de Venda (R$) *</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    {...field}
                    onChange={(e) => field.onChange(parseFloat(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Marca */}
          <FormField
            control={form.control}
            name="marca"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Marca</FormLabel>
                <FormControl>
                  <Input placeholder="Ex: Farm, Zara" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Categoria */}
          <FormField
            control={form.control}
            name="categoria"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Categoria</FormLabel>
                <FormControl>
                  <Input placeholder="Ex: Vestido, Calça" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Tamanho */}
          <FormField
            control={form.control}
            name="tamanho"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tamanho</FormLabel>
                <FormControl>
                  <Input placeholder="Ex: P, M, 38" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Descrição */}
        <FormField
          control={form.control}
          name="descricao"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descrição</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Detalhes do item consignado..."
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex gap-4 pt-6">
          <Button type="submit" className="flex-1" disabled={isLoading}>
            {isLoading ? "Cadastrando..." : "Cadastrar Item Consignado"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() =>
              form.reset({ fornecedorId: form.watch("fornecedorId") })
            }
            disabled={isLoading}
          >
            Limpar
          </Button>
        </div>
      </form>
    </Form>
  );
}
