// src/components/fornecedores/FormFornecedor.tsx
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
import { Textarea } from "@/components/ui/textarea"; // Embora não usado no schema, pode ser útil
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner"; // Shadcn toast for feedback
import { z } from "zod";
import { Fornecedor } from "@/types";
import { useState } from "react"; // Para simular estados

type FornecedorFormData = z.infer<typeof fornecedorSchema>;

// Mock de estados brasileiros (poderia vir de uma API real)
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

export default function FormFornecedor() {
  const form = useForm<FornecedorFormData>({
    resolver: zodResolver(fornecedorSchema),
    defaultValues: {
      nome: "",
      cpf: "",
      telefone: "",
      email: "",
      endereco: {
        rua: "",
        numero: "",
        complemento: "",
        bairro: "",
        cidade: "",
        estado: "",
        cep: "",
      },
      tamanhoPreferencia: [],
      senha: "", // Para ser usado em um cenário de dashboard de fornecedor
    },
  });

  const [isLoading, setIsLoading] = useState(false);

  async function onSubmit(data: FornecedorFormData) {
    setIsLoading(true);
    try {
      const novoFornecedor: Fornecedor = {
        id: crypto.randomUUID(), // Gerar um ID único
        ...data,
        numeroVendas: 0,
        status: "ativo",
        dataCadastro: new Date(),
        cpf: data.cpf.replace(/\D/g, ""), // Garante CPF sem formatação
        endereco: {
          ...data.endereco,
          cep: data.endereco.cep.replace(/\D/g, ""), // Garante CEP sem formatação
        },
      };

      // Simulação de chamada de API/banco de dados
      console.log("Fornecedor a ser cadastrado:", novoFornecedor);
      await new Promise((resolve) => setTimeout(resolve, 1500)); // Simula delay de rede

      toast({
        title: "Fornecedor Cadastrado!",
        description: `O fornecedor ${novoFornecedor.nome} foi registrado com sucesso.`,
      });
      form.reset(); // Limpa o formulário após o sucesso
    } catch (error) {
      console.error("Erro ao cadastrar fornecedor:", error);
      toast({
        title: "Erro no Cadastro",
        description:
          "Não foi possível registrar o fornecedor. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  // Máscaras (opcional, pode ser adicionado com bibliotecas como react-input-mask)
  const formatCpf = (value: string) => {
    return value
      .replace(/\D/g, "")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d{1,2})/, "$1-$2")
      .replace(/(-\d{2})\d+?$/, "$1");
  };

  const formatTelefone = (value: string) => {
    value = value.replace(/\D/g, "");
    if (value.length > 10) {
      return value.replace(/^(\d\d)(\d{5})(\d{4}).*/, "($1) $2-$3");
    } else if (value.length > 5) {
      return value.replace(/^(\d\d)(\d{4})(\d{0,4}).*/, "($1) $2-$3");
    } else if (value.length > 2) {
      return value.replace(/^(\d\d)(\d{0,5}).*/, "($1) $2");
    } else {
      return value;
    }
  };

  const formatCep = (value: string) => {
    return value
      .replace(/\D/g, "")
      .replace(/^(\d{5})(\d)/, "$1-$2")
      .replace(/(-\d{3})\d+?$/, "$1");
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <h2 className="text-2xl font-semibold border-b pb-2 mb-4">
          Informações Pessoais
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="nome"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome *</FormLabel>
                <FormControl>
                  <Input placeholder="Nome completo do fornecedor" {...field} />
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
                <FormLabel>CPF *</FormLabel>
                <FormControl>
                  <Input
                    placeholder="000.000.000-00"
                    {...field}
                    onChange={(e) => {
                      field.onChange(formatCpf(e.target.value));
                    }}
                    maxLength={14} // Inclui pontos e traço
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
                    onChange={(e) => {
                      field.onChange(formatTelefone(e.target.value));
                    }}
                    maxLength={15} // Inclui parênteses, espaço e traço
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
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <h2 className="text-2xl font-semibold border-b pb-2 mb-4 mt-8">
          Endereço
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="endereco.cep"
            render={({ field }) => (
              <FormItem>
                <FormLabel>CEP *</FormLabel>
                <FormControl>
                  <Input
                    placeholder="00000-000"
                    {...field}
                    onChange={(e) => {
                      field.onChange(formatCep(e.target.value));
                    }}
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
                <FormLabel>Rua *</FormLabel>
                <FormControl>
                  <Input placeholder="Nome da rua" {...field} />
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
                <FormLabel>Número *</FormLabel>
                <FormControl>
                  <Input placeholder="123" {...field} />
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
                  <Input placeholder="Apto 101" {...field} />
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
                <FormLabel>Bairro *</FormLabel>
                <FormControl>
                  <Input placeholder="Nome do bairro" {...field} />
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
                <FormLabel>Cidade *</FormLabel>
                <FormControl>
                  <Input placeholder="Nome da cidade" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="endereco.estado"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Estado *</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um estado" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {estadosBrasileiros.map((estado) => (
                      <SelectItem key={estado.value} value={estado.value}>
                        {estado.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <h2 className="text-2xl font-semibold border-b pb-2 mb-4 mt-8">
          Outras Informações
        </h2>
        {/* Tamanho Preferência - Poderia ser um componente Multi-Select */}
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
              <p className="text-sm text-muted-foreground">
                Informe tamanhos que o fornecedor geralmente traz.
              </p>
            </FormItem>
          )}
        />

        {/* Senha - Apenas se o fornecedor for ter acesso ao dashboard individual */}
        <FormField
          control={form.control}
          name="senha"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Senha (para login no Dashboard do Fornecedor)
              </FormLabel>
              <FormControl>
                <Input type="password" placeholder="********" {...field} />
              </FormControl>
              <FormMessage />
              <p className="text-sm text-muted-foreground">
                Deixe em branco se o fornecedor não tiver acesso direto ao
                dashboard.
              </p>
            </FormItem>
          )}
        />

        <div className="flex gap-4 pt-6">
          <Button type="submit" className="flex-1" disabled={isLoading}>
            {isLoading ? "Cadastrando..." : "Cadastrar Fornecedor"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => form.reset()}
            disabled={isLoading}
          >
            Limpar
          </Button>
        </div>
      </form>
    </Form>
  );
}
