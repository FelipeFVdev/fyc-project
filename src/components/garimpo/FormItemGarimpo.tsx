// src/components/garimpo/FormItemGarimpo.tsx
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

type FormData = z.infer<typeof itemGarimpoSchema>;

export default function FormItemGarimpo() {
  const form = useForm<FormData>({
    resolver: zodResolver(itemGarimpoSchema),
    defaultValues: {
      dataCompra: new Date(),
      custoCompra: 0,
      custosAdicionais: 0,
      margemLucro: 50,
    },
  });

  const custoCompra = form.watch("custoCompra") || 0;
  const custosAdicionais = form.watch("custosAdicionais") || 0;
  const margemLucro = form.watch("margemLucro") || 0;

  const custoTotal = custoCompra + custosAdicionais;
  const precoVenda = custoTotal * (1 + margemLucro / 100);

  async function onSubmit(data: FormData) {
    try {
      const itemCompleto = {
        ...data,
        id: crypto.randomUUID(),
        precoVenda,
        status: "disponivel" as const,
        dataEntradaEstoque: new Date(),
      };

      // Aqui você faria a chamada para salvar no backend/database
      console.log("Item cadastrado:", itemCompleto);

      // Simulando sucesso
      alert("Item cadastrado com sucesso!");
      form.reset();
    } catch (error) {
      console.error("Erro ao cadastrar:", error);
      alert("Erro ao cadastrar item");
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Local de Compra */}
          <FormField
            control={form.control}
            name="localCompra"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Local de Compra *</FormLabel>
                <FormControl>
                  <Input placeholder="Ex: Bazar São Vicente" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Data de Compra */}
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
                        date > new Date() || date < new Date("1900-01-01")
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Custo de Compra */}
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
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Custos Adicionais */}
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
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Margem de Lucro */}
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
                  <Input placeholder="Ex: Zara, H&M" {...field} />
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
                  <Input placeholder="Ex: P, M, G, 38" {...field} />
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
                  placeholder="Descreva o item..."
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Resumo de Preços */}
        <div className="bg-gray-50 p-6 rounded-lg space-y-2">
          <h3 className="font-semibold text-lg mb-4">Resumo de Preços</h3>
          <div className="flex justify-between">
            <span className="text-gray-600">Custo Total:</span>
            <span className="font-medium">R$ {custoTotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Margem de Lucro:</span>
            <span className="font-medium">{margemLucro}%</span>
          </div>
          <div className="flex justify-between text-lg font-bold border-t pt-2 mt-2">
            <span>Preço de Venda:</span>
            <span className="text-green-600">R$ {precoVenda.toFixed(2)}</span>
          </div>
        </div>

        <div className="flex gap-4">
          <Button type="submit" className="flex-1">
            Cadastrar Item
          </Button>
          <Button type="button" variant="outline" onClick={() => form.reset()}>
            Limpar
          </Button>
        </div>
      </form>
    </Form>
  );
}
