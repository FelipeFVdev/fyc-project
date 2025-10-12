"use client"; // Este componente é um formulário interativo de React

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { fornecedorSchema } from "@/lib/validations";
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
import type { Fornecedor } from "@/types"; // Importação type-only
import { z } from "zod"; // Importação de z
import { formatCpf, formatTelefone, formatCep } from "@/lib/utils"; // Funções utilitárias

type FornecedorFormData = z.infer<typeof fornecedorSchema>;

interface FormEditarFornecedorProps {
  fornecedor: Fornecedor; // Dados iniciais do fornecedor
  onSubmit: (data: FornecedorFormData) => void; // Callback para o envio
  onCancel: () => void; // Callback para o cancelamento
  isLoading: boolean; // Estado de carregamento
}

export default function FormEditarFornecedor({
  fornecedor,
  onSubmit,
  onCancel,
  isLoading,
}: FormEditarFornecedorProps) {
  // Remapeia o fornecedor existente para os defaultValues do formulário
  const defaultValues: FornecedorFormData = {
    nome: fornecedor.nome,
    cpf: fornecedor.cpf,
    telefone: fornecedor.telefone,
    email: fornecedor.email || "",
    endereco: {
      rua: fornecedor.endereco.rua,
      numero: fornecedor.endereco.numero,
      complemento: fornecedor.endereco.complemento || "",
      bairro: fornecedor.endereco.bairro,
      cidade: fornecedor.endereco.cidade,
      cep: fornecedor.endereco.cep,
    },
    tamanhoPreferencia: fornecedor.tamanhoPreferencia || [],
    senha: "", // Senha nunca é pré-preenchida por segurança
  };

  const form = useForm<FornecedorFormData>({
    resolver: zodResolver(fornecedorSchema),
    defaultValues: defaultValues,
  });

  return (
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
                  <Input {...field} />
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
                  <Input type="email" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <h3 className="text-xl font-semibold border-b pb-2 mb-4 mt-6">
          Endereço
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="endereco.cep"
            render={({ field }) => (
              <FormItem>
                <FormLabel>CEP</FormLabel>
                <FormControl>
                  <Input
                    placeholder="00000-000"
                    {...field}
                    onChange={(e) => field.onChange(formatCep(e.target.value))}
                    maxLength={9}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="endereco.rua"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Rua</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="endereco.numero"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Número</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="endereco.complemento"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Complemento</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="endereco.bairro"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Bairro</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="endereco.cidade"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cidade</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <h3 className="text-xl font-semibold border-b pb-2 mb-4 mt-6">
          Preferências
        </h3>
        <FormField
          control={form.control}
          name="tamanhoPreferencia"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tamanhos de Preferência</FormLabel>
              <FormControl>
                <Input
                  placeholder="Ex: P, M, 38, 40 (separados por vírgula)"
                  value={field.value?.join(", ") || ""}
                  onChange={(e) =>
                    field.onChange(
                      e.target.value
                        .split(",")
                        .map((s) => s.trim())
                        .filter(Boolean)
                    )
                  }
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="senha"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nova Senha (opcional)</FormLabel>
              <FormControl>
                <Input type="password" placeholder="********" {...field} />
              </FormControl>
              <FormMessage />
              <p className="text-sm text-muted-foreground">
                Preencha apenas se quiser alterar a senha do fornecedor.
              </p>
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2 mt-8">
          {/* Removido DialogFooter, agora é um div normal */}
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isLoading}
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Salvando..." : "Salvar Alterações"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
